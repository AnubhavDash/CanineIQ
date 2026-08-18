# CanineIQ 🐕

**Are you actually ready for the dog you want?**

CanineIQ is an AI-powered dog ownership readiness assessment and breed welfare transparency tool. Built for [DEV Weekend Challenge: Dog Days Edition](https://dev.to/challenges/weekend-2026-08-13).

**Live demo:** https://canineiq.vercel.app/

**Video walkthrough:** https://youtu.be/C8REqujvyx4

---

## The Idea

This came from the [CCTV footage](https://www.indiatoday.in/india/story/pitbull-mauls-patiala-couple-both-hospitalised-woman-undergoes-plastic-surgery-2969903-2026-08-13) in an India Today report of a Patiala couple being mauled by a pitbull as they went to view a rental home — a dog that kept attacking even after its owner ordered it to stop, a dog left to roam free. The dog wasn't evil. The ownership was irresponsible.

The same energy drives the [brachycephalic problem](https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-topics/brachycephalic-obstructive-airway-syndrome-boas): French Bulldogs are the world's most popular breed, and a huge proportion of them will need palate surgery by age 3 because humans bred them to have faces that can't function.

CanineIQ is blunt about both of these things because the dogs deserve honesty even when the humans buying them don't want to hear it.

---

## The Problem

Every year, thousands of dogs — especially powerful "status breeds" like pitbulls — are surrendered to shelters, neglected, or involved in bite incidents because their owners weren't prepared. Meanwhile, brachycephalic breeds like French Bulldogs and Pugs are purchased by people who think the flat face is "cute," unaware the dog will struggle to breathe its entire life.

CanineIQ confronts both problems directly.

---

## What It Does

### 1. Ownership Readiness Assessment
An 8-question assessment covering living situation, experience, time, budget, training commitment, and motivation. A **deterministic scoring engine** (`api/score.js`) weighs each answer against the chosen breed's documented needs (energy, space, fragility, grooming, health cost, household safety, trainability, and difficulty), then **Google AI (Gemini)** writes the personalised narrative around that fixed score. You receive:
- A 0–100 readiness score (computed deterministically, not LLM-judged)
- A verdict: `READY / CAUTION / NOT_READY`
- Top warnings and genuine strengths (written by Gemini, tied to your answers)
- A breed alternative if you're not ready (also computed deterministically from the breed-need table)

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
Beyond the 10 core breeds, search **30 more** (40 total) through a dropdown that lazily loads each breed's image from the [Dog CEO API](https://dog.ceo/). Or **snap a photo** of a dog and **Gemini** (multimodal) identifies the breed, auto-selecting it for the assessment.

### 5. Works on the Phone in Your Pocket
The entire flow — assessment, verdict, the dog's letter, read-aloud voice — is tested and usable on a real Android phone (recorded at 382px wide) as well as desktop. It works out of the box with no API keys to enter, so anyone can try it on whatever device they're holding.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Assessment & photo ID | Google AI (Gemini) via Vercel serverless functions — model fallback chain: `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite` → `gemini-3.6-flash` (rate-limit resilient) |
| Read-aloud voice | ElevenLabs (`eleven_v3`) with browser SpeechSynthesis fallback |
| Breed images | Local assets (10 core breeds) + Dog CEO API (30 searchable breeds) |
| Frontend | React 18, CSS custom properties |
| Typography | Space Grotesk (display) + DM Sans (body) |
| Hosting | Vercel (static + serverless functions) |

---

## Setup

**Option A — Run locally with `vercel dev` (full app, recommended):**

```bash
git clone https://github.com/AnubhavDash/CanineIQ.git
cd canineiq
npm install

cp .env.example .env
# Fill in your API keys in .env

npx vercel dev
# → http://localhost:3000
```

`vercel dev` runs the Vite UI **and** the `api/` serverless functions locally, and loads your `.env` keys — so the assessment, photo identification, and read-aloud all work. Requires a (free) Vercel account to log in once.

**Option B — UI only (`npm run dev`):**

```bash
npm run dev
# → http://localhost:5173
```

This serves the UI **only**. The `api/` functions don't run under plain Vite, so submitting an assessment or snapping a photo will show "not available in this local Vite preview" until you test against a deployed URL (Option A or Vercel).

### Deploying to Vercel

1. Push the repo to GitHub, then import it at [vercel.com/new](https://vercel.com/new).
2. In **Project → Settings → Environment Variables**, add `GEMINI_API_KEY` (and optionally `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID`).
3. Redeploy. Keys are gitignored and never committed.

### Environment Variables

The assessment runs server-side in the Vercel functions under `api/`, which call Google Gemini and ElevenLabs directly. Keys live on the server only — never shipped to the browser.

```
GEMINI_API_KEY=            # Google AI (Gemini) API key — read server-side only
ELEVENLABS_API_KEY=        # ElevenLabs API key for the "Read it to me" feature
# Optional:
# ELEVENLABS_VOICE_ID=     # Overrides the default voice (designed voices only on free tier)
```

---

## How It Works

1. **Assessment flow:** pick a breed → answer 8 questions → `api/score.js` computes a deterministic per-answer score (0–100) against the breed's documented needs and derives the verdict, then `api/evaluate.js` builds a detailed prompt (breed context + research notes + the computed score + your answers) and calls Gemini, which returns strict JSON (verdict sentence, 3 warnings, 3 strengths, a dog's letter, per-answer findings). Responses are validated and normalized server-side; the LLM never determines the score.
2. **Rate-limit resilience:** the serverless functions try a chain of Gemini models, falling back if one is rate-limited — so a popular demo can't kill the app.
3. **Photo identification:** `api/identify.js` sends the uploaded photo to Gemini's multimodal model and returns the breed slug, which is matched (with aliases) to the assessment's breed list.
4. **Read it to me:** `api/speech.js` sends the dog's letter to ElevenLabs with an emotional voice profile and returns an MP3; the browser falls back to native speech synthesis on any failure.

## Prize Categories

| Prize Category | How CanineIQ Meets It |
| --- | --- |
| **Best Use of Google AI** | Core AI assessment engine, breed health analysis, and photo-based breed identification all run on the Gemini API, with strict server-side validation so the model never controls the score |
| **Best Use of ElevenLabs** | Emotional "Read it to me" voice for the dog's letter, with a graceful fallback to browser speech synthesis |

---

## Privacy

Privacy-friendly by design: no accounts, no database, no analytics, no cookies. Assessment answers, uploaded photos, and the read-aloud letter are processed transiently by the API and never stored server-side; your results live only in your browser's local storage.

---

## Sources

Breed health information draws on public veterinary and welfare sources, including the [Orthopedic Foundation for Animals (OFA)](https://www.ofa.org/), [AKC Canine Health Foundation](https://www.akcchf.org/), [The Kennel Club (UK) health schemes](https://www.thekennelclub.org.uk/health/), [RSPCA brachycephalic guidance](https://www.rspca.org.uk/adviceandwelfare/pets/dogs/health/brachycephalic), [University of Cambridge brachycephalic research](https://www.vet.cam.ac.uk/), and [Cornell University's BOAS overview](https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-topics/brachycephalic-obstructive-airway-syndrome-boas). Figures shown are qualitative ranges ("varies by severity") rather than precise statistics, because inherited-disease risk is line-specific — always confirm with a veterinarian and the breeder's health-testing documentation. Dog photos: [Dog CEO API](https://dog.ceo/).

---

*Built for DEV Weekend Challenge: Dog Days Edition — August 2026*

---

## Post-Submission Changes

Per the [Dog Days contest rules](https://dev.to/page/weekend-challenge-v26-08-13-contest-rules), this section records what was completed before the submission deadline and what was completed after.

**Completed before the deadline (Aug 16, 2026, 11:59 PM PDT — submission commit `26b7f10`):**
- Full ownership readiness assessment (8 questions, deterministic scoring + Gemini narrative)
- Breed health transparency pages
- 40-breed search (10 core + 30 more via Dog CEO API)
- Gemini photo-based breed identification
- ElevenLabs "Read it to me" feature
- Mobile-responsive UI and live deployment at https://canineiq.vercel.app/
- Published DEV submission post and demo video

**Completed after the deadline:**
- Bug fix — photo identification: the "No dog detected" error box stayed visible permanently and could overlap the breed search dropdown, blocking selection. It now dismisses automatically when the user focuses or types in the search box or selects a breed from search, and a × button is provided to dismiss it manually. This is a UI/UX fix only; no judging-relevant features were added or changed.

