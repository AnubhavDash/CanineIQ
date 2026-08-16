import { computeScore } from './score.js';
import BREED_TRAITS from './breedTraits.js';

const MODEL_CHAIN = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.6-flash'];
const API_KEY = process.env.GEMINI_API_KEY;

const BREED_LABELS = {
  pitbull: 'Pit bull', rottweiler: 'Rottweiler', german_shepherd: 'German Shepherd', husky: 'Husky / Malamute', labrador: 'Labrador Retriever',
  french_bulldog: 'French Bulldog', pug: 'Pug', english_bulldog: 'English Bulldog', doberman: 'Doberman Pinscher', border_collie: 'Border Collie',
  beagle: 'Beagle', boxer: 'Boxer', chihuahua: 'Chihuahua', dalmatian: 'Dalmatian', dachshund: 'Dachshund', samoyed: 'Samoyed', akita: 'Akita',
  chow_chow: 'Chow Chow', corgi: 'Corgi', eskimo_dog: 'American Eskimo Dog', havanese: 'Havanese', malamute: 'Alaskan Malamute',
  newfoundland: 'Newfoundland', papillon: 'Papillon', pekinese: 'Pekingese', pomeranian: 'Pomeranian', poodle: 'Poodle', whippet: 'Whippet',
  weimaraner: 'Weimaraner', maltese: 'Maltese', shiba_inu: 'Shiba Inu', bull_terrier: 'Bull Terrier', miniature_pinscher: 'Miniature Pinscher',
  puggle: 'Puggle', golden_retriever: 'Golden Retriever', great_dane: 'Great Dane', shih_tzu: 'Shih Tzu', cocker_spaniel: 'Cocker Spaniel',
  yorkshire_terrier: 'Yorkshire Terrier', west_highland: 'West Highland Terrier',
};

function bestAlternateBreed(breed, questions) {
  let best = null;
  for (const id of Object.keys(BREED_TRAITS)) {
    if (id === breed.id) continue;
    const { score } = computeScore({ id, label: BREED_LABELS[id] || id }, questions);
    if (!best || score > best.score) best = { id, label: BREED_LABELS[id] || id, score };
  }
  return best;
}

const BREED_RESEARCH = {
  french_bulldog: 'BOAS, heat intolerance, spinal disease, skin and eye concerns; use health-tested, functional lines.',
  pug: 'BOAS, eye injury, skin-fold disease, obesity and spinal concerns; noisy breathing is not automatically normal.',
  english_bulldog: 'Airway, orthopedic, skin, reproductive and heat concerns; extreme conformation can impair ordinary function.',
  dachshund: 'Intervertebral disc disease risk associated with long-backed, short-legged structure; weight and jumping management matter.',
  german_shepherd: 'Hip and elbow disease, degenerative myelopathy and temperament variation; documented testing and sound movement matter.',
  cavalier: 'Early mitral valve disease and neurologic concerns including Chiari-like malformation and syringomyelia.',
  great_dane: 'Gastric dilatation-volvulus, cardiomyopathy, orthopedic stress and short lifespan associated with giant size.',
  boxer: 'Cardiac disease, cancer risk and heat/exercise considerations; family longevity and screening matter.'
};

const BREED_CONTEXT = {
  pitbull: 'Strength, athleticism, training, secure containment, responsible socialisation, and stigma-aware public management matter. Do not infer aggression from breed label.',
  rottweiler: 'Large, powerful working dog; evaluate handling skill, containment, training, household safety, and socialisation.',
  german_shepherd: 'High drive and working intelligence; evaluate daily work, stable temperament, joint care, and training capacity.',
  husky: 'High exercise, enrichment, escape risk, shedding, and independent temperament; evaluate time, containment, and climate.',
  labrador: 'Social, energetic, food-motivated companion; evaluate exercise, training, weight management, and realistic time.',
  french_bulldog: 'Brachycephalic health burden; evaluate heat management, airway care, insurance, and veterinary budget.',
  pug: 'Brachycephalic airway, eye, skin, and weight concerns; evaluate health-first sourcing and lifelong care.',
  english_bulldog: 'Brachycephalic and orthopedic burden; evaluate heat, mobility, reproductive history, and emergency funds.',
  doberman: 'Athletic, sensitive working dog with cardiac and temperament considerations; evaluate training, exercise, and health screening.',
  border_collie: 'Exceptionally high mental and physical needs; evaluate daily work, enrichment, and ability to prevent frustration.'
};

function extractText(data) {
  const steps = Array.isArray(data?.steps) ? data.steps : [];
  return steps
    .filter((step) => step.type === 'model_output')
    .map((step) => (Array.isArray(step.content) ? step.content.map((part) => part.text || '').join('') : ''))
    .join('');
}

function parseJson(text) {
  const cleaned = text.replace(/```json|```/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Model did not return JSON');
  return JSON.parse(cleaned.slice(start, end + 1));
}

function fallbackFinding(question, concernLevel) {
  if (concernLevel === 'LOW') {
    return `This answer aligns with the breed's needs and works in your favour.`;
  }
  if (concernLevel === 'WATCH') {
    return `This answer needs careful planning — it is workable but only if you prepare for it deliberately.`;
  }
  return `This answer conflicts with the breed's real needs and should be resolved before you bring a dog home.`;
}

function normalize(result, questions, breed, scored, alternate) {
  const recommendation = ['READY', 'CAUTION', 'NOT_READY'].includes(result.recommendation) ? result.recommendation : 'CAUTION';
  const findings = Array.isArray(result.answerFindings) ? result.answerFindings : [];
  return {
    ...result,
    score: scored.score,
    recommendation: scored.recommendation,
    readyFor: breed.label,
    alternateBreed: alternate?.label || '',
    topWarnings: Array.isArray(result.topWarnings) ? result.topWarnings.slice(0, 3) : [],
    topStrengths: Array.isArray(result.topStrengths) ? result.topStrengths.slice(0, 3) : [],
    altReasons: Array.isArray(result.altReasons) ? result.altReasons.slice(0, 3) : [],
    answerFindings: questions.map((question, index) => {
      const computed = scored.findings[index] || { concernLevel: 'WATCH' };
      const match = Array.isArray(findings) ? findings.find((f) => f?.question === question.question) : null;
      return {
        question: question.question,
        finding: match?.finding || fallbackFinding(question.question, computed.concernLevel),
        concernLevel: computed.concernLevel,
        points: computed.points,
      };
    }),
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function callModel(models, prompt) {
  const errors = [];
  for (const model of models) {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
        body: JSON.stringify({
          model,
          input: prompt,
          generation_config: { temperature: 0.45, max_output_tokens: 6000, thinking_level: 'minimal' },
        }),
      });
      if (response.ok) return response;
      const detail = await response.text().catch(() => '');
      errors.push(`${model} ${response.status} ${detail.slice(0, 120)}`);
    } catch (err) {
      errors.push(`${model} ${err.message}`);
    }
  }
  throw new Error(`All Gemini models failed: ${errors.join(' | ')}`);
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }
    if (!API_KEY) {
      return json({ error: 'GEMINI_API_KEY is not set on the server. Add it in Vercel Settings - Environment Variables, then redeploy.' }, 500);
    }
    try {
      const { breed, questions } = await request.json();
      if (!breed?.label || !Array.isArray(questions) || questions.length !== 8) {
        return json({ error: 'Incomplete assessment' }, 400);
      }
      const transcript = questions.map((question, index) => `${index + 1}. ${question.question}\nSelected: ${question.answer || 'No preset selection'}\nAdditional context: ${question.custom?.trim() || 'None provided'}`).join('\n\n');
      const scored = computeScore(breed, questions);
      const scoreLine = scored.findings.map((f, index) => `${index + 1}. ${f.points}/100 · ${f.concernLevel}`).join('\n');
      const alternate = scored.recommendation !== 'READY' ? bestAlternateBreed(breed, questions) : null;
      const prompt = `You are a dog-welfare evaluator. Judge the human's preparation against the real demands of the chosen breed, using their specific answers — never a default score, never generic filler.

SCORING: The final score has already been computed deterministically. It is 8 answers, each weighed equally, adjusted for this breed's real demands (living space, experience, daily time, training plan, household safety, budget, motivation, life stability). Accept this score as fixed and never contradict it in your prose. Your job is the narrative, not the number.

COMPUTED SCORE: ${scored.score}/100 (${scored.recommendation})
PER-ANSWER POINTS:\n${scoreLine}

CONCERNS AND STRENGTHS: Write concrete, personalised items tied to the person's actual answers and the breed's documented needs — not a restatement of their answer and not generic advice. Each concern must name the specific answer, why it is a genuine problem for THIS breed, and the concrete risk. Each strength must name the specific answer and why it is a genuine asset for THIS breed. Do not soften, pad, or invent. BALANCE: every concern and every strength must be the SAME length — each item between 25 and 40 words, with the same sentence structure (roughly 2-3 sentences each), so the two columns render at matching heights. Never write a long concern and a short strength (or vice versa).

BREED: ${breed.label}\nBREED CONTEXT: ${BREED_CONTEXT[breed.id] || 'Research this breed’s documented care and temperament needs carefully.'}\nRESEARCH NOTES: ${BREED_RESEARCH[breed.id] || 'Use documented veterinary and welfare guidance; do not invent disease prevalence.'}\n\nANSWERS:\n${transcript}\n\nALTERNATE BREED: ${alternate ? `The best-fit alternative has been computed deterministically from the person's answers and the app's breed-need data. It is: ${alternate.label}. Use exactly this breed — do not substitute a different one. altReasons must explain why ${alternate.label} fits this person's actual answers (their space, time, budget, experience, and household), with each reason naming one of their answers and how it matches ${alternate.label}'s documented needs.` : 'No alternative breed applies — the person is already a strong fit, so return alternateBreed as an empty string and altReasons as an empty array.'}\n\nOUTPUT FORMAT — you MUST return one JSON object containing ALL of these fields, in this order, and you MUST NOT omit any of them:\n1. verdict: one plain-language sentence;\n2. readyFor: string;\n3. topWarnings: array of exactly 3 concrete answer-based concerns;\n4. topStrengths: array of exactly 3 concrete answer-based strengths;\n5. dogVoice: a short letter of 4-6 sentences written from the dog's own perspective — intimate, gentle, quietly sad, never preachy; name the breed's real daily reality and this person's specific situation, and if they chose the breed for status or appear unprepared, let the dog say what it actually needs from them;\n6. alternateBreed: string or empty (${alternate ? `must be exactly "${alternate.label}"` : 'must be empty string'});\n7. altReasons: array of 3 reasons tied to this person's answers (only when alternateBreed is non-empty);\n8. answerFindings: array of exactly 8 objects, one per question in the exact order of the ANSWERS list above, each object with the exact fields {\"question\": the question text verbatim, \"finding\": one concise sentence naming this person's specific answer and the concrete risk or asset it creates for THIS breed}. The concern level for each answer is already computed and will be applied automatically — do not add it to the JSON. answerFindings is REQUIRED and must always contain exactly 8 entries; never return it empty and never omit it.\n\nNever return generic filler, and never claim a statistic unless supported by the supplied context. Do not include score or recommendation in the JSON. Do not wrap the JSON in markdown.`;
      const response = await callModel(MODEL_CHAIN, prompt);
      const result = normalize(parseJson(extractText(await response.json())), questions, breed, scored, alternate);
      return json(result);
    } catch (error) {
      console.error('[v0] Evaluation endpoint error:', error.message);
      return json({ error: 'Evaluation unavailable. Please try again.' }, 502);
    }
  },
};