const MODEL_CHAIN = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.6-flash'];
const API_KEY = process.env.GEMINI_API_KEY;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function extractText(data) {
  return (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
}

function parseJson(text) {
  const cleaned = text.replace(/```json|```/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Model did not return JSON');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callModel(models, prompt, image, mimeType) {
  const errors = [];
  for (const model of models) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data: image } }, { text: prompt }] }],
          generationConfig: { temperature: 0.2, max_output_tokens: 400 },
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
      const { image, mimeType } = await request.json();
      if (!image) {
        return json({ error: 'No image provided' }, 400);
      }
      const prompt = `You are a dog breed identifier. Look at the dog in this photo and identify the breed. Respond with ONLY the JSON object and nothing else: {"id":"<slug>","label":"<Breed Name>","confidence":"<high|medium|low>"}. id is a lowercase underscore slug (e.g. french_bulldog, golden_retriever, pitbull, labrador). Prefer a specific breed over a group. If unsure, pick the closest breed and set confidence 'low' - do NOT fall back to 'mixed' unless the dog is clearly a mix of two or more distinct breeds. If no dog is clearly visible in the image, return {"id":"none","label":"No dog detected","confidence":"low"}.`;
      const response = await callModel(MODEL_CHAIN, prompt, image, mimeType || 'image/jpeg');
      const result = parseJson(extractText(await response.json()));
      return json({ id: result.id || 'mixed', label: result.label || 'Mixed breed', confidence: result.confidence || 'low' });
    } catch (error) {
      console.error('[identify] Error:', error.message);
      return json({ error: 'Could not identify the dog. Please try again.' }, 502);
    }
  },
};