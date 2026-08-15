# CanineIQ 🐕

**Are you actually ready for the dog you want?**

CanineIQ is an AI-powered dog ownership readiness assessment and breed welfare transparency tool. Built for [DEV Weekend Challenge: Dog Days Edition](https://dev.to/challenges/weekend-2026-08-13).

---

## The Problem

Every year, thousands of dogs — especially powerful "status breeds" like pitbulls — are surrendered to shelters, neglected, or involved in bite incidents because their owners weren't prepared. Meanwhile, brachycephalic breeds like French Bulldogs and Pugs are purchased by people who think the flat face is "cute," unaware the dog will struggle to breathe its entire life.

CanineIQ confronts both problems directly.

---

## What It Does

### 1. Ownership Readiness Assessment
8-question assessment covering living situation, experience, time, budget, training commitment, and motivation. **Google AI (Gemini)** evaluates your responses against the real demands of your chosen breed and delivers:
- A 0–100 readiness score
- A verdict: `READY / CAUTION / NOT_READY`
- Top warnings and genuine strengths
- A breed alternative if you're not ready

### 2. The Dog Speaks
The signature feature: your result includes a message written from the dog's perspective. If you chose the breed for status, it calls that out. If you're not ready, it tells you what it actually needs — shown alongside a quick facts strip (breed, score, verdict) so the verdict is unmissable. A "Read it to me" button reads the letter aloud through your browser's built-in speech synthesis (slow, soft, low-pitch) — no AI, no API, no audio files.

### 3. Breed Health Transparency
An honest breakdown of genetic health problems in 8 popular breeds — French Bulldogs, Pugs, English Bulldogs, Cavalier King Charles Spaniels, and more. Powered by **Google AI**:
- What was done to this breed genetically
- What the dog experiences day-to-day
- Surgery rates and life expectancy
- What breeders won't tell buyers
- An honest answer to "is it ethical to buy one?"
- A healthier breed alternative

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Assessment | Google AI (Gemini, gemini-3.6-flash) via Vercel serverless function |
| Frontend | React 18, CSS custom properties |
| Typography | Fraunces (display) + Inter (body) |

---

## Setup

```bash
git clone https://github.com/AnubhavDash/canineiq.git
cd canineiq
npm install

cp .env.example .env
# Fill in your API keys in .env

npm run dev
```

### Environment Variables

The assessment runs server-side in the Vercel function `api/evaluate.js`, which calls the Google Gemini API directly. The only key needed is your Gemini key — set it in your Vercel project:

```
GEMINI_API_KEY=            # Google AI (Gemini) API key — read server-side only, never shipped to the browser
```

No client-side key is needed (nothing is exposed to the browser). Keys are gitignored and never committed.

> Local `npm run dev` serves the UI only — the `/api/evaluate` function runs on Vercel (or `vercel dev`), so test the assessment on your deployed URL.

---

## Prize Categories

- ✅ **Best Use of Google AI** — Core AI assessment engine and breed health analysis

---

## The Idea

This came from watching a video of an elderly woman's pitbull mauling a couple while she stood there helplessly — the dog untrained, unstimulated, kept purely as a status symbol. The dog wasn't evil. The ownership was irresponsible.

The same energy drives the brachycephalic problem: French Bulldogs are the world's most popular breed, and a huge proportion of them will need palate surgery by age 3 because humans bred them to have faces that can't function.

CanineIQ is blunt about both of these things because the dogs deserve honesty even when the humans buying them don't want to hear it.

---

*Built for DEV Weekend Challenge: Dog Days Edition — August 2026*
