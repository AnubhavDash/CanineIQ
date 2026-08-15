const MODEL_CHAIN = ['eleven_v3', 'eleven_multilingual_v2', 'eleven_flash_v2_5'];
const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'cgSgspJ2msm6clMCkdW9';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function cleanForSpeech(text) {
  return text
    .replace(/[“”]/g, '"')
    .replace(/[—–]/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

function enhanceEmotion(text) {
  const cleaned = cleanForSpeech(text);
  return `[sympathetic] [sighs] ${cleaned} [sniffs]`;
}

async function synthesize(models, text) {
  const errors = [];
  for (const model of models) {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY,
        },
        body: JSON.stringify({
          text: enhanceEmotion(text),
          model_id: model,
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.75,
            style: 0.55,
            speed: 0.9,
          },
        }),
      });
      if (response.ok) return response;
      const detail = await response.text().catch(() => '');
      errors.push(`${model} ${response.status} ${detail.slice(0, 140)}`);
    } catch (err) {
      errors.push(`${model} ${err.message}`);
    }
  }
  throw new Error(`All ElevenLabs models failed: ${errors.join(' | ')}`);
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }
    if (!API_KEY) {
      return json({ error: 'ELEVENLABS_API_KEY is not set on the server. Add it in Vercel Settings - Environment Variables, then redeploy.' }, 500);
    }
    try {
      const { text } = await request.json();
      if (!text || !text.trim()) {
        return json({ error: 'No text provided' }, 400);
      }
      const response = await synthesize(MODEL_CHAIN, text);
      const audio = await response.arrayBuffer();
      return new Response(audio, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': String(audio.byteLength),
          'Cache-Control': 'private, max-age=3600',
        },
      });
    } catch (error) {
      console.error('[speech] Error:', error.message);
      return json({ error: 'Speech synthesis unavailable. Please try again.' }, 502);
    }
  },
};