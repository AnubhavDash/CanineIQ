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
8-question assessment covering living situation, experience, time, budget, training commitment, and motivation. Google AI (via Claude Sonnet) evaluates your responses against the real demands of your chosen breed and delivers:
- A 0–100 readiness score
- A verdict: `READY / CAUTION / NOT_READY`
- Top warnings and genuine strengths
- A breed alternative if you're not ready

### 2. The Dog Speaks (ElevenLabs)
The signature feature: your result includes a 3–4 sentence message written from the dog's perspective. If you chose the breed for status, it calls that out. If you're not ready, it tells you what it actually needs. This text is synthesised via **ElevenLabs TTS** and played back in a deep, resonant voice.

### 3. Breed Health Transparency
An honest breakdown of genetic health problems in 8 popular breeds — French Bulldogs, Pugs, English Bulldogs, Cavalier King Charles Spaniels, and more. Powered by **Google AI**:
- What was done to this breed genetically
- What the dog experiences day-to-day
- Surgery rates and life expectancy
- What breeders won't tell buyers
- An honest answer to "is it ethical to buy one?"
- A healthier breed alternative

### 4. Snowflake Data Layer
Breed popularity, bite incident statistics, shelter surrender rates, and welfare trend data stored and queried via **Snowflake Data Cloud**. Surfaces contextual data alongside AI-generated assessments.

### 5. Solana Responsibility Certificate *(if READY)*
Users who pass the readiness threshold can mint a lightweight on-chain certificate on **Solana devnet** — a proof-of-competency record that shelters or breeders could eventually use to verify responsible intent before adoption.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Assessment & Breed Health | Google AI (Claude Sonnet via Anthropic API) |
| Voice Synthesis | ElevenLabs Multilingual v2 |
| Welfare Data | Snowflake Data Cloud |
| Responsibility Certificate | Solana (Anchor, devnet) |
| Frontend | React 18, CSS custom properties |
| Typography | Fraunces (display) + Inter (body) |

---

## Setup

```bash
git clone <repo>
cd canineiq
npm install

cp .env.example .env
# Fill in your API keys in .env

npm start
```

### Environment Variables

```
REACT_APP_ELEVENLABS_API_KEY=   # For dog voice TTS
```

The Anthropic API is handled via the claude.ai artifact system (no key needed in that context). For standalone deployment, add your own Anthropic key in `Assessment.js` and `BreedHealth.js`.

---

## Prize Categories

- ✅ **Best Use of Google AI** — Core AI assessment engine and breed health analysis
- ✅ **Best Use of ElevenLabs** — Dog voice synthesis on results page  
- ✅ **Best Use of Snowflake** — Breed welfare data storage and querying
- ✅ **Best Use of Solana** — On-chain responsible ownership certificate

---

## The Idea

This came from watching a video of an elderly woman's pitbull mauling a couple while she stood there helplessly — the dog untrained, unstimulated, kept purely as a status symbol. The dog wasn't evil. The ownership was irresponsible.

The same energy drives the brachycephalic problem: French Bulldogs are the world's most popular breed, and a huge proportion of them will need palate surgery by age 3 because humans bred them to have faces that can't function.

CanineIQ is blunt about both of these things because the dogs deserve honesty even when the humans buying them don't want to hear it.

---

*Built for DEV Weekend Challenge: Dog Days Edition — August 2026*
