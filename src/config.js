export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export const GEMINI_MODEL = 'gemini-2.5-flash';

// LIVE_MODE=false (default) shows demo data so you can review UX/UI without
// burning API calls. Set VITE_LIVE_MODE=true in .env once you're happy with it.
export const LIVE_MODE = import.meta.env.VITE_LIVE_MODE === 'true';