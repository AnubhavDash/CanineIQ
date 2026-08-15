import { GOOGLE_TTS_API_KEY } from './config.js';

// en-US-Neural2-F — warm, soft female voice (good fit for the "dog speaks" moment)
const VOICE = 'en-US-Neural2-F';

export async function synthesizeSpeech(text) {
  if (!GOOGLE_TTS_API_KEY) throw new Error('no_key');
  const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_TTS_API_KEY,
    },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'en-US', name: VOICE },
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });
  if (!response.ok) throw new Error(`tts_${response.status}`);
  const data = await response.json();
  return `data:audio/mpeg;base64,${data.audioContent}`;
}