import React, { useState } from 'react';
import './Assessment.css';

const BREEDS = [
  { id: 'pitbull', label: 'Pit bull', risk: 'high' },
  { id: 'rottweiler', label: 'Rottweiler', risk: 'high' },
  { id: 'german_shepherd', label: 'German Shepherd', risk: 'medium' },
  { id: 'husky', label: 'Husky / Malamute', risk: 'medium' },
  { id: 'labrador', label: 'Labrador Retriever', risk: 'low' },
  { id: 'french_bulldog', label: 'French Bulldog', risk: 'health' },
  { id: 'pug', label: 'Pug', risk: 'health' },
  { id: 'english_bulldog', label: 'English Bulldog', risk: 'health' },
  { id: 'doberman', label: 'Doberman Pinscher', risk: 'high' },
  { id: 'border_collie', label: 'Border Collie', risk: 'medium' },
];

const QUESTIONS = [
  { id: 'living', question: 'Where will this dog live?', options: ['Small apartment with no yard', 'Large apartment or ground floor', 'House with a yard', 'House with a fully enclosed yard'] },
  { id: 'experience', question: 'What have you actually handled before?', options: ['I have never owned a dog', 'I grew up around dogs but was not responsible for them', 'I have owned one or two easier dogs as an adult', 'I have trained and managed multiple dogs'] },
  { id: 'time', question: 'How much time can you give this dog every day?', options: ['Less than one hour', 'One to two hours', 'Two to four hours', 'More than four hours'] },
  { id: 'training', question: 'What is your plan for training?', options: ['I will figure it out myself', 'I will get help only if there is a problem', 'I will take basic obedience classes', 'I will work with a qualified trainer from day one'] },
  { id: 'children', question: 'Who else must be safe in this home?', options: ['Young children under 10', 'Elderly or physically vulnerable adults', 'Older children aged 10 or above', 'Adults only'] },
  { id: 'budget', question: 'What can you reliably spend each month?', options: ['Under ₹3,000', '₹3,000–8,000', '₹8,000–15,000', 'More than ₹15,000'] },
  { id: 'reason', question: 'Why this breed, specifically?', options: ['It looks impressive and people notice it', 'I want protection', 'I researched it and it fits my life', 'I am adopting or rescuing this breed'] },
  { id: 'stress', question: 'How stable is your life right now?', options: ['Busy, unstable, or chaotic', 'Manageable most days', 'Stable and predictable', 'Very flexible with plenty of capacity'] },
];

const RISK_LABELS = { high: 'High responsibility', health: 'Serious health burden', medium: 'High activity needs', low: 'Lower barrier to entry' };

export default function Assessment({ onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [breed, setBreed] = useState(null);
  const [answers, setAnswers] = useState({});
  const [custom, setCustom] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const total = QUESTIONS.length + 1;
  const current = QUESTIONS[step - 1];
  const answer = current ? answers[current.id] : null;

  const setAnswer = (value) => setAnswers((prev) => ({ ...prev, [current.id]: value }));
  const submit = async () => {
    setLoading(true); setError(null);
    const payload = { breed, questions: QUESTIONS.map((q) => ({ ...q, answer: answers[q.id] || null, custom: custom[q.id] || '' })) };
    try {
      const response = await fetch('/api/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('Evaluation unavailable');
      onComplete({ breed, answers, custom }, await response.json());
    } catch (err) {
      console.error('[v0] Evaluation failed:', err.message);
      setError('Gemini evaluation is not available in this local Vite preview yet. Deploy the project with the server function enabled, then try again. Your answers are still here.');
      setLoading(false);
    }
  };
  const next = () => step < total - 1 ? setStep((value) => value + 1) : submit();

  if (loading) return <div className="assessment-loading"><div className="loading-orbit"><span /></div><p className="loading-text">Reading the life behind your answers.</p><p className="loading-sub">Gemini is weighing the details, not giving you a personality score.</p></div>;

  return <main className="assessment-wrap">
    <header className="assessment-header">
      <button className="text-action" onClick={onBack}>Home</button>
      <div className="progress-meta"><span>CanineIQ</span><span>{step === 0 ? 'Choose the dog' : `Question ${step} of ${QUESTIONS.length}`}</span></div>
      <span className="progress-percent">{Math.round((step / (total - 1)) * 100)}%</span>
    </header>
    <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.max(5, (step / (total - 1)) * 100)}%` }} /></div>
    {step === 0 ? <section className="assessment-content breed-step fade-up">
      <div className="pitbull-intro"><img src="/images/pitbull.jpg" alt="Pit bull looking at the camera" /><div><span className="kicker">Start with the truth</span><p>Do not choose the breed that makes your answer look responsible. Choose the dog you are actually considering.</p></div></div>
      <p className="kicker">The first decision</p><h1 className="q-title">Which dog are you asking us to judge your life against?</h1><p className="q-sub">There is no safe-sounding answer here. Every breed has needs. Your result depends on whether you can meet them when the excitement is gone.</p>
      <div className="breed-grid">{BREEDS.map((item) => <button key={item.id} className={`breed-card ${breed?.id === item.id ? 'selected' : ''}`} onClick={() => setBreed(item)}><img src={`/images/${item.id}.jpg`} alt="" /><span className="breed-name">{item.label}</span><span className="breed-risk">{RISK_LABELS[item.risk]}</span></button>)}</div>
    </section> : <section className="assessment-content fade-up" key={current.id}>
      <p className="kicker">Question {step} / {QUESTIONS.length}</p><h1 className="q-title">{current.question}</h1><p className="q-sub">Pick the closest answer. Then add context if the choices do not tell the whole truth.</p>
      <div className="options-list">{current.options.map((option) => <button key={option} className={`option-btn ${answer === option ? 'selected' : ''}`} onClick={() => setAnswer(option)}>{option}</button>)}</div>
      <label className="custom-label" htmlFor={`custom-${current.id}`}>Your answer, in your own words <span>optional but useful</span></label><textarea id={`custom-${current.id}`} className="custom-answer" value={custom[current.id] || ''} onChange={(event) => setCustom((prev) => ({ ...prev, [current.id]: event.target.value }))} placeholder="Add the detail the choices missed…" rows="3" />
      {error && <p className="error-msg">{error}</p>}
    </section>}
    <footer className="assessment-footer"><button className="secondary-action" onClick={onBack}>Home</button>{step > 0 && <button className="secondary-action" onClick={() => setStep((value) => value - 1)}>Back</button>}<button className="primary-action" disabled={step === 0 ? !breed : !answer && !(custom[current?.id] || '').trim()} onClick={step === 0 ? () => setStep(1) : next}>{step === 0 ? 'Begin the questions' : step === QUESTIONS.length ? 'Show me the truth' : 'Continue'}</button></footer>
  </main>;
}
