import React, { useState } from 'react';
import './Assessment.css';
import { LIVE_MODE, GEMINI_API_KEY } from './config.js';
import { callGemini } from './gemini.js';

const BREEDS = [
  { id: 'pitbull', label: 'Pitbull / American Staffordshire', risk: 'high', emoji: '🐕' },
  { id: 'rottweiler', label: 'Rottweiler', risk: 'high', emoji: '🐕‍🦺' },
  { id: 'german_shepherd', label: 'German Shepherd', risk: 'medium', emoji: '🦮' },
  { id: 'husky', label: 'Husky / Malamute', risk: 'medium', emoji: '🐺' },
  { id: 'labrador', label: 'Labrador Retriever', risk: 'low', emoji: '🐶' },
  { id: 'french_bulldog', label: 'French Bulldog', risk: 'health', emoji: '🐾' },
  { id: 'pug', label: 'Pug', risk: 'health', emoji: '🐾' },
  { id: 'english_bulldog', label: 'English Bulldog', risk: 'health', emoji: '🐾' },
  { id: 'doberman', label: 'Doberman Pinscher', risk: 'high', emoji: '🐕‍🦺' },
  { id: 'border_collie', label: 'Border Collie', risk: 'medium', emoji: '🦮' },
];

const QUESTIONS = [
  {
    id: 'living',
    question: 'What is your living situation?',
    options: [
      { value: 'apartment_small', label: 'Small apartment (no yard)' },
      { value: 'apartment_large', label: 'Large apartment / ground floor' },
      { value: 'house_yard', label: 'House with yard' },
      { value: 'house_large', label: 'House with large enclosed yard' },
    ],
  },
  {
    id: 'experience',
    question: 'What is your dog ownership experience?',
    options: [
      { value: 'none', label: 'Never owned a dog' },
      { value: 'some', label: 'Had dogs as a child (family responsibility)' },
      { value: 'casual', label: 'Owned 1–2 easy breeds as an adult' },
      { value: 'experienced', label: 'Owned and trained multiple dogs' },
    ],
  },
  {
    id: 'time',
    question: 'How many hours per day can you dedicate to your dog?',
    options: [
      { value: 'lt1', label: 'Less than 1 hour' },
      { value: '1to2', label: '1–2 hours' },
      { value: '2to4', label: '2–4 hours' },
      { value: 'gt4', label: 'More than 4 hours' },
    ],
  },
  {
    id: 'training',
    question: 'Are you willing and able to invest in professional training?',
    options: [
      { value: 'no', label: "No — I'll train it myself or figure it out" },
      { value: 'maybe', label: "Maybe, if the dog has problems" },
      { value: 'yes_basic', label: "Yes — basic obedience classes" },
      { value: 'yes_full', label: "Yes — professional trainer from day one" },
    ],
  },
  {
    id: 'children',
    question: 'Are there children or elderly people regularly in your home?',
    options: [
      { value: 'yes_children', label: 'Yes — children under 10' },
      { value: 'yes_elderly', label: 'Yes — elderly or frail adults' },
      { value: 'yes_older', label: 'Yes — older children (10+)' },
      { value: 'no', label: 'No — adults only' },
    ],
  },
  {
    id: 'budget',
    question: 'What is your monthly budget for dog care (food, vet, insurance)?',
    options: [
      { value: 'low', label: 'Under ₹3,000 / month' },
      { value: 'medium', label: '₹3,000–8,000 / month' },
      { value: 'high', label: '₹8,000–15,000 / month' },
      { value: 'very_high', label: 'Over ₹15,000 / month' },
    ],
  },
  {
    id: 'reason',
    question: 'Why do you want this breed specifically?',
    options: [
      { value: 'status', label: "It looks impressive / people will notice it" },
      { value: 'protection', label: "I want a guard dog" },
      { value: 'companion', label: "I researched the breed and it suits my lifestyle" },
      { value: 'rescue', label: "I'm adopting / rescuing this breed" },
    ],
  },
  {
    id: 'stress',
    question: 'What is your current life stress level?',
    options: [
      { value: 'high', label: 'Very high — busy, unstable, or chaotic' },
      { value: 'medium', label: 'Moderate — manageable most days' },
      { value: 'low', label: 'Low — stable and predictable' },
      { value: 'very_low', label: 'Very low — flexible lifestyle, lots of time' },
    ],
  },
];

const RISK_COLORS = {
  high: '#C0392B',
  health: '#E67E22',
  medium: '#E8A847',
  low: '#27AE60',
};

const RISK_LABELS = {
  high: 'High Responsibility Breed',
  health: 'Genetic Health Risk Breed',
  medium: 'Moderate Responsibility',
  low: 'Beginner Friendly',
};

const DEMO_RESULT = (breedLabel, risk) => ({
  score: risk === 'low' ? 78 : risk === 'health' ? 52 : 41,
  verdict: "I've seen how you live your life, and I'd still choose you — but only if you're ready to change for me.",
  readyFor: breedLabel,
  topWarnings: [
    'Daily exercise and mental stimulation are non-negotiable, not optional extras',
    'Vet, food, and insurance costs will be higher than you may have budgeted',
    'This breed needs consistent, patient training from day one',
  ],
  topStrengths: [
    'You are honest about your situation — that is already half of being a good owner',
    'You are willing to ask for help instead of guessing',
  ],
  dogVoice: "I look cute, don't I? But look closer — every breath is a small fight for me. I didn't choose this face, and I can't tell you how tired I get just trying to sleep at night. If you take me home, promise me you'll learn what I actually need. That's all I've ever wanted.",
  recommendation: risk === 'low' ? 'READY' : 'CAUTION',
  alternateBreed: risk === 'low' ? '' : 'Labrador Retriever',
});

export default function Assessment({ onComplete, onBack }) {
  const [step, setStep] = useState(0); // 0 = breed select, 1..N = questions, N+1 = loading
  const [breed, setBreed] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentQ = QUESTIONS[step - 1];
  const totalSteps = QUESTIONS.length + 1;
  const progress = step / totalSteps;

  const handleBreedSelect = (b) => setBreed(b);

  const handleAnswer = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(s => s + 1);
    } else {
      submitAssessment();
    }
  };

  const handleBack = () => {
    if (step === 0) onBack();
    else setStep(s => s - 1);
  };

  const submitAssessment = async () => {
    setLoading(true);
    setError(null);

    const breedInfo = BREEDS.find(b => b.id === breed);
    const answerSummary = QUESTIONS.map(q => {
      const opt = q.options.find(o => o.value === answers[q.id]);
      return `${q.question}: ${opt?.label || 'Not answered'}`;
    }).join('\n');

    const prompt = `You are a dog welfare expert and honest animal behaviourist. A person wants to get a ${breedInfo?.label} and has completed a readiness assessment.

THEIR ASSESSMENT:
${answerSummary}

Breed details:
- Breed: ${breedInfo?.label}
- Risk category: ${breedInfo?.risk} (high = powerful/aggressive breed needing experienced owner; health = brachycephalic/genetic health issues; medium = active breed; low = beginner friendly)

Please provide an honest, no-fluff welfare assessment. Respond in this exact JSON format:
{
  "score": <0-100 integer, where 0=completely unprepared, 100=ideal owner>,
  "verdict": "<one powerful sentence verdict, written as if the dog is speaking directly to this person in first person — raw and honest, not diplomatic>",
  "readyFor": "<the actual breed they asked about, or a better-fit alternative if they are not ready>",
  "topWarnings": ["<specific concern 1>", "<specific concern 2>", "<specific concern 3>"],
  "topStrengths": ["<genuine strength 1>", "<genuine strength 2>"],
  "dogVoice": "<CRITICAL: This is the most important field. Write 4-6 sentences spoken in first person as the ${breedInfo?.label}. The person will see a photo of an adorable puppy next to this text, then hear it read aloud in a soft, sad voice. The emotional contrast is the point. Start with something that acknowledges how cute and loveable the dog is — then pivot to the truth with quiet devastation, not anger. If they have a flat face (French Bulldog, Pug, Bulldog): open with 'I look cute, don't I?' then describe the sound of struggling to breathe, that they didn't choose this face, that every night is a fight for air. If they chose the breed for status: gently, heartbreakingly ask if they've ever thought what happens to you when you stop being a status symbol. If they're not ready: describe what abandonment feels like from the dog's perspective — the confusion, waiting at the door. End every voice with one line of what the dog actually needs that has nothing to do with how they look. Write this as something that makes a person stop scrolling. No clichés. No poetry. Just the quiet truth a dog would tell you if it could talk.">",
  "recommendation": "<'READY' | 'CAUTION' | 'NOT_READY'>",
  "alternateBreed": "<only if NOT_READY or CAUTION, suggest a breed that better fits their lifestyle>"
}

Only respond with valid JSON, no extra text.`;

    try {
      let parsed;
      if (LIVE_MODE && GEMINI_API_KEY) {
        const text = await callGemini(prompt);
        parsed = JSON.parse(text);
      } else {
        await new Promise(r => setTimeout(r, 1200));
        parsed = DEMO_RESULT(breedInfo?.label, breedInfo?.risk);
      }

      onComplete({ breed: breedInfo, answers }, parsed);
    } catch (err) {
      console.error(err);
      setError('Something went wrong analysing your results. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="assessment-loading">
        <div className="spinner" />
        <p className="loading-text">Analysing your readiness…</p>
        <p className="loading-sub">The dog is thinking about what to tell you.</p>
      </div>
    );
  }

  // Breed Selection
  if (step === 0) {
    return (
      <div className="assessment-wrap">
        <div className="assessment-header">
          <button className="btn-ghost back-btn" onClick={handleBack}>← Back</button>
          <span className="section-label">Step 1 of {totalSteps}</span>
        </div>
        <div className="assessment-content">
          <h2 className="q-title">Which breed are you considering?</h2>
          <p className="q-sub">Be honest — this assessment only works if you pick the breed you actually want, not one that sounds responsible.</p>
          <div className="breed-grid">
            {BREEDS.map(b => (
              <button
                key={b.id}
                className={`breed-card ${breed === b.id ? 'selected' : ''}`}
                onClick={() => handleBreedSelect(b.id)}
                style={{ '--risk-color': RISK_COLORS[b.risk] }}
              >
                <span className="breed-emoji">{b.emoji}</span>
                <span className="breed-name">{b.label}</span>
                <span className="breed-risk" style={{ color: RISK_COLORS[b.risk] }}>
                  {RISK_LABELS[b.risk]}
                </span>
              </button>
            ))}
          </div>
          <div className="assessment-footer">
            <button
              className="btn-primary"
              disabled={!breed}
              onClick={() => setStep(1)}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Question steps
  const currentAnswer = answers[currentQ.id];

  return (
    <div className="assessment-wrap">
      <div className="assessment-header">
        <button className="btn-ghost back-btn" onClick={handleBack}>← Back</button>
        <span className="section-label">Step {step + 1} of {totalSteps}</span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="assessment-content fade-up" key={step}>
        <h2 className="q-title">{currentQ.question}</h2>
        <div className="options-list">
          {currentQ.options.map(opt => (
            <button
              key={opt.value}
              className={`option-btn ${currentAnswer === opt.value ? 'selected' : ''}`}
              onClick={() => handleAnswer(currentQ.id, opt.value)}
            >
              <span className="option-check">{currentAnswer === opt.value ? '✓' : ''}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="assessment-footer">
          <button
            className="btn-primary"
            disabled={!currentAnswer}
            onClick={handleNext}
          >
            {step === totalSteps - 1 ? 'Get My Result →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
