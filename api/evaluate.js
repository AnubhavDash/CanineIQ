const MODEL = 'google/gemini-2.5-flash';

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
  const content = data?.choices?.[0]?.message?.content ?? data?.output?.[0]?.content?.[0]?.text ?? '';
  return Array.isArray(content) ? content.map((item) => item.text || '').join('') : content;
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
    topWarnings: Array.isArray(result.topWarnings) ? result.topWarnings.slice(0, 4) : [],
    topStrengths: Array.isArray(result.topStrengths) ? result.topStrengths.slice(0, 4) : [],
    altReasons: Array.isArray(result.altReasons) ? result.altReasons.slice(0, 4) : [],
    answerFindings: questions.map((question, index) => findings[index] || { question: question.question, finding: 'Gemini could not provide a finding for this answer.', concernLevel: 'WATCH' }),
  };
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  try {
    const { breed, questions } = await request.json();
    if (!breed?.label || !Array.isArray(questions) || questions.length !== 8) {
      return Response.json({ error: 'Incomplete assessment' }, { status: 400 });
    }
    const transcript = questions.map((question, index) => `${index + 1}. ${question.question}\nSelected: ${question.answer || 'No preset selection'}\nAdditional context: ${question.custom?.trim() || 'None provided'}`).join('\n\n');
    const prompt = `You are a dog-welfare evaluator. Judge the human's preparation, not the breed as a moral category. Give a distinct evaluation based on the actual answers below. Do not use a default score. A score must reflect the evidence: time, experience, training, safety, budget, motivation, and stability. Use the breed context as research guidance, not as a stereotype. Recommend an alternative only when it genuinely fits the stated life better, and explain why it fits this person's answers.\n\nBREED: ${breed.label}\nBREED CONTEXT: ${BREED_CONTEXT[breed.id] || 'Research this breed’s documented care and temperament needs carefully.'}\nRESEARCH NOTES: ${BREED_RESEARCH[breed.id] || 'Use documented veterinary and welfare guidance; do not invent disease prevalence.'}\n\nANSWERS:\n${transcript}\n\nReturn only JSON with exactly: score integer 0-100; verdict one plain-language sentence; readyFor; topWarnings array of 3 specific answer-based concerns; topStrengths array of 2 specific answer-based strengths; dogVoice 4-6 sentences; recommendation READY, CAUTION, or NOT_READY; alternateBreed string or empty; altReasons array of 3 reasons tied to this person’s answers; answerFindings array of exactly 8 objects with question, finding, concernLevel LOW/WATCH/ACTION. Never return generic filler, and never claim a statistic unless supported by the supplied context.`;
    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}` }, body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.45, max_tokens: 4200 }) });
    if (!response.ok) throw new Error(`AI gateway ${response.status}`);
    const result = normalize(parseJson(extractText(await response.json())), questions, breed);
    return Response.json(result);
  } catch (error) {
    console.error('[v0] Evaluation endpoint error:', error.message);
    return Response.json({ error: 'Evaluation unavailable. Please try again.' }, { status: 502 });
  }
}