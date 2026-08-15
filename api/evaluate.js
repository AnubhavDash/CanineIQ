const MODEL = 'google/gemini-3.6-flash';

function extractText(data) {
  return data?.choices?.[0]?.message?.content || data?.output?.[0]?.content?.[0]?.text || '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { breed, questions } = req.body || {};
    if (!breed?.label || !Array.isArray(questions) || questions.length !== 8) return res.status(400).json({ error: 'Incomplete assessment' });
    const transcript = questions.map((question, index) => `${index + 1}. ${question.question}\nSelected: ${question.answer || 'No selection'}\nAdditional context: ${question.custom || 'None'}`).join('\n\n');
    const prompt = `You are a direct, humane dog-welfare evaluator. Evaluate whether this person can responsibly provide a ${breed.label} a safe, stable, lifelong home. Do not judge the breed as evil. Judge the human's preparation: time, containment, training, money, household safety, motivation, and resilience. Use plain language. Never bluff or invent statistics.\n\nASSESSMENT:\n${transcript}\n\nReturn only valid JSON with exactly these keys: score (integer 0-100), verdict (one clear sentence, no euphemisms), readyFor (breed label), topWarnings (3 specific plain-language concerns), topStrengths (2 genuine strengths), dogVoice (4-6 direct first-person sentences from the dog, emotionally serious but not melodramatic), recommendation (READY, CAUTION, or NOT_READY), alternateBreed (string or empty), altReasons (3 specific reasons), answerFindings (array of 8 objects with question, finding, concernLevel using LOW, WATCH, or ACTION). Make every finding specific to the answer and additional context. Do not use words like 'risk category' or 'moderate responsibility' as a substitute for explaining the actual problem.`;
    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}` }, body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 2600 }) });
    if (!response.ok) throw new Error(`AI gateway ${response.status}`);
    const text = extractText(await response.json()).replace(/```json|```/g, '').trim();
    const result = JSON.parse(text);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[v0] Evaluation endpoint error:', error.message);
    return res.status(502).json({ error: 'Evaluation unavailable' });
  }
}
