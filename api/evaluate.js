const MODEL = 'gemini-3.6-flash';
const API_KEY = process.env.GEMINI_API_KEY;

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

function normalize(result, questions, breed) {
  const score = Number(result.score);
  if (!Number.isFinite(score)) throw new Error('Model returned an invalid score');
  const recommendation = ['READY', 'CAUTION', 'NOT_READY'].includes(result.recommendation) ? result.recommendation : 'CAUTION';
  const findings = Array.isArray(result.answerFindings) ? result.answerFindings : [];
  return {
    ...result,
    score: Math.max(0, Math.min(100, Math.round(score))),
    recommendation,
    readyFor: breed.label,
    topWarnings: Array.isArray(result.topWarnings) ? result.topWarnings.slice(0, 3) : [],
    topStrengths: Array.isArray(result.topStrengths) ? result.topStrengths.slice(0, 3) : [],
    altReasons: Array.isArray(result.altReasons) ? result.altReasons.slice(0, 4) : [],
    answerFindings: questions.map((question, index) => findings[index] || { question: question.question, finding: 'Gemini could not provide a finding for this answer.', concernLevel: 'WATCH' }),
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
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
      const prompt = `You are a dog-welfare evaluator. Judge the human's preparation against the real demands of the chosen breed, using their specific answers — never a default score, never generic filler.

SCORING: Evaluate each of the 8 answers individually against what that answer really requires for THIS breed (living space, experience, daily time, training plan, household safety, budget, motivation, life stability). Give every one of the 8 answers equal weight — each contributes the same share toward the final 0-100 score. Aggregate the eight into one honest score. If any single answer is a serious mismatch, it must meaningfully drag the score down.

CONCERNS AND STRENGTHS: Write concrete, personalised items tied to the person's actual answers and the breed's documented needs — not a restatement of their answer and not generic advice. Each concern must name the specific answer, why it is a genuine problem for THIS breed, and the concrete risk. Each strength must name the specific answer and why it is a genuine asset for THIS breed. Do not soften, pad, or invent. BALANCE: every concern and every strength must be the SAME length — each item between 25 and 40 words, with the same sentence structure (roughly 2-3 sentences each), so the two columns render at matching heights. Never write a long concern and a short strength (or vice versa).

BREED: ${breed.label}\nBREED CONTEXT: ${BREED_CONTEXT[breed.id] || 'Research this breed’s documented care and temperament needs carefully.'}\nRESEARCH NOTES: ${BREED_RESEARCH[breed.id] || 'Use documented veterinary and welfare guidance; do not invent disease prevalence.'}\n\nANSWERS:\n${transcript}\n\nReturn only JSON with exactly: score integer 0-100; verdict one plain-language sentence; readyFor; topWarnings array of exactly 3 concrete answer-based concerns; topStrengths array of exactly 3 concrete answer-based strengths; dogVoice a short letter of 4-6 sentences written from the dog's own perspective — intimate, gentle, quietly sad, never preachy; name the breed's real daily reality and this person's specific situation, and if they chose the breed for status or appear unprepared, let the dog say what it actually needs from them; recommendation READY, CAUTION, or NOT_READY; alternateBreed string or empty; altReasons array of 3 reasons tied to this person's answers; answerFindings array of exactly 8 objects with question, finding, concernLevel LOW/WATCH/ACTION. Never return generic filler, and never claim a statistic unless supported by the supplied context.`;
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
        body: JSON.stringify({
          model: MODEL,
          input: prompt,
          generation_config: { temperature: 0.45, max_output_tokens: 4200, thinking_level: 'minimal' },
        }),
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`Gemini ${response.status} ${detail.slice(0, 200)}`);
      }
      const result = normalize(parseJson(extractText(await response.json())), questions, breed);
      return json(result);
    } catch (error) {
      console.error('[v0] Evaluation endpoint error:', error.message);
      return json({ error: 'Evaluation unavailable. Please try again.' }, 502);
    }
  },
};