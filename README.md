# CanineIQ 🐕

**Are you actually ready for the dog you want?**

CanineIQ is an AI-powered dog ownership readiness assessment and breed welfare transparency tool. Built for [DEV Weekend Challenge: Dog Days Edition](https://dev.to/challenges/weekend-2026-08-13).

**Live demo:** https://canineiq.vercel.app/

---

## The Problem

Every year, thousands of dogs — especially powerful "status breeds" like pitbulls — are surrendered to shelters, neglected, or involved in bite incidents because their owners weren't prepared. Meanwhile, brachycephalic breeds like French Bulldogs and Pugs are purchased by people who think the flat face is "cute," unaware the dog will struggle to breathe its entire life.

CanineIQ confronts both problems directly.

---

## What It Does

### 1. Ownership Readiness Assessment
An 8-question assessment covering living situation, experience, time, budget, training commitment, and motivation. **Google AI (Gemini)** evaluates your responses against the real demands of your chosen breed and delivers:
- A 0–100 readiness score
- A verdict: `READY / CAUTION / NOT_READY`
- Top warnings and genuine strengths
- A breed alternative if you're not ready

### 2. The Dog Speaks
The signature feature: your result includes a message written from the dog's perspective. If you chose the breed for status, it calls that out. If you're not ready, it tells you what it actually needs — shown alongside a quick facts strip (breed, score, verdict) so the verdict is unmissable. A **"Read it to me"** button reads the letter aloud with **ElevenLabs** emotional text-to-speech (a soft, sympathetic voice with `[sighs]` delivery), falling back to the browser's built-in speech synthesis if the API is unavailable.

### 3. Breed Health Transparency
An honest breakdown of genetic health problems in 8 popular breeds — French Bulldogs, Pugs, English Bulldogs, Cavalier King Charles Spaniels, and more:
- What was done to this breed genetically
- What the dog experiences day-to-day
- Surgery rates and life expectancy
- What breeders won't tell buyers
- An honest answer to "is it ethical to buy one?"
- A healthier breed alternative

### 4. Find Any Breed by Name or Photo
Beyond the 10 core breeds, search **31 more** (41 total) through a dropdown that lazily loads each breed's image from the [Dog CEO API](https://dog.ceo/). Or **snap a photo** of a dog and **Gemini** (multimodal) identifies the breed, auto-selecting it for the assessment.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Assessment & photo ID | Google AI (Gemini) via Vercel serverless functions — model fallback chain: `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite` → `gemini-3.6-flash` (rate-limit resilient) |
| Read-aloud voice | ElevenLabs (`eleven_v3`) with browser SpeechSynthesis fallback |
| Breed images | Local assets (10 core breeds) + Dog CEO API (31 searchable breeds) |
| Frontend | React 18, CSS custom properties |
| Typography | Fraunces (display) + Inter (body) |
| Hosting | Vercel (static + serverless functions) |

---

## Setup

```bash
git clone https://github.com/AnubhavDash/CanineIQ.git
cd canineiq
npm install

cp .env.example .env
# Fill in your API keys in .env

npm run dev
```

### Environment Variables

The assessment runs server-side in the Vercel functions under `api/`, which call Google Gemini and ElevenLabs directly. Keys live on the server only — never shipped to the browser.

```
GEMINI_API_KEY=            # Google AI (Gemini) API key — read server-side only
ELEVENLABS_API_KEY=        # ElevenLabs API key for the "Read it to me" feature
# Optional:
# ELEVENLABS_VOICE_ID=     # Overrides the default voice (designed voices only on free tier)
```

Set these in Vercel → Settings → Environment Variables, then redeploy. Keys are gitignored and never committed.

> Local `npm run dev` serves the UI only — the `api/` functions run on Vercel (or `vercel dev`), so test the assessment, photo identification, and read-aloud on your deployed URL.

---

## How It Works

1. **Assessment flow:** pick a breed → answer 8 questions → `api/evaluate.js` builds a detailed prompt (breed context + research notes + your answers) and calls Gemini, which returns strict JSON (score, verdict, 3 warnings, 3 strengths, a dog's letter, alternative breed, per-answer findings). Responses are validated and normalized server-side.
2. **Rate-limit resilience:** the serverless functions try a chain of Gemini models, falling back if one is rate-limited — so a popular demo can't kill the app.
3. **Photo identification:** `api/identify.js` sends the uploaded photo to Gemini's multimodal model and returns the breed slug, which is matched (with aliases) to the assessment's breed list.
4. **Read it to me:** `api/speech.js` sends the dog's letter to ElevenLabs with an emotional voice profile and returns an MP3; the browser falls back to native speech synthesis on any failure.

## Prize Categories

- ✅ **Best Use of Google AI** — Core AI assessment engine, breed health analysis, and photo-based breed identification
- ✅ **Best Use of ElevenLabs** — Emotional "Read it to me" voice for the dog's letter (with graceful browser fallback)

> Note: per challenge rules, a participant can only win **one** category even if they qualify for multiple.

---

## Sources

Breed health information draws on public veterinary and welfare sources, including the [Orthopedic Foundation for Animals (OFA)](https://www.ofa.org/), [AKC Canine Health Foundation](https://www.akcchf.org/), [The Kennel Club (UK) health schemes](https://www.thekennelclub.org.uk/health/), [RSPCA brachycephalic guidance](https://www.rspca.org.uk/adviceandwelfare/pets/dogs/health/brachycephalic), [University of Cambridge brachycephalic research](https://www.vet.cam.ac.uk/), and [Cornell University's BOAS overview](https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-topics/brachycephalic-obstructive-airway-syndrome-boas). Figures shown are qualitative ranges ("varies by severity") rather than precise statistics, because inherited-disease risk is line-specific — always confirm with a veterinarian and the breeder's health-testing documentation. Dog photos: [Dog CEO API](https://dog.ceo/).

---

## The Idea

This came from a [Times of India](https://timesofindia.indiatimes.com/city/chandigarh/gate-opens-pitbull-attacks-how-patiala-couples-search-for-a-rental-home-turned-horrific/articleshow/133198154.cms) report about a Patiala couple who went to view a rental home and were mauled by a pitbull the moment they opened the gate — a dog that kept attacking even after its owner ordered it to stop, a dog left to roam free. The dog wasn't evil. The ownership was irresponsible.

The same energy drives the [brachycephalic problem](https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-topics/brachycephalic-obstructive-airway-syndrome-boas): French Bulldogs are the world's most popular breed, and a huge proportion of them will need palate surgery by age 3 because humans bred them to have faces that can't function.

CanineIQ is blunt about both of these things because the dogs deserve honesty even when the humans buying them don't want to hear it.

---

*Built for DEV Weekend Challenge: Dog Days Edition — August 2026*