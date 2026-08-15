import { GEMINI_API_KEY, GEMINI_MODEL } from './config.js';

export async function callGemini(prompt, maxOutputTokens = 3000) {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/interactions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        model: GEMINI_MODEL,
        input: prompt,
        generation_config: {
          temperature: 1,
          max_output_tokens: maxOutputTokens,
          thinking_level: 'minimal',
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = (data.steps || [])
    .filter(s => s.type === 'model_output')
    .map(s => (s.content || []).map(p => p.text || '').join(''))
    .join('');
  if (!text) throw new Error('Empty Gemini response');
  return text.replace(/```json|```/g, '').trim();
}