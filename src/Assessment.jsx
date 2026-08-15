import React, { useState, useRef, useEffect, useMemo } from 'react';
import './Assessment.css';

const BREEDS = [
  { id: 'pitbull', label: 'Pit bull', risk: 'high', slug: 'pitbull' },
  { id: 'rottweiler', label: 'Rottweiler', risk: 'high', slug: 'rottweiler' },
  { id: 'german_shepherd', label: 'German Shepherd', risk: 'medium', slug: 'germanshepherd' },
  { id: 'husky', label: 'Husky / Malamute', risk: 'medium', slug: 'husky' },
  { id: 'labrador', label: 'Labrador Retriever', risk: 'low', slug: 'labrador' },
  { id: 'french_bulldog', label: 'French Bulldog', risk: 'health', slug: 'bulldog/french' },
  { id: 'pug', label: 'Pug', risk: 'health', slug: 'pug' },
  { id: 'english_bulldog', label: 'English Bulldog', risk: 'health', slug: 'bulldog/english' },
  { id: 'doberman', label: 'Doberman Pinscher', risk: 'high', slug: 'doberman' },
  { id: 'border_collie', label: 'Border Collie', risk: 'medium', slug: 'collie/border' },
];

const BREED_ALIASES = {
  american_pit_bull_terrier: 'pitbull',
  american_staffordshire_terrier: 'pitbull',
  pit_bull: 'pitbull',
  staffordshire_bull_terrier: 'pitbull',
  miniature_pinscher: 'doberman',
  german_shepherd_dog: 'german_shepherd',
  siberian_husky: 'husky',
  alaskan_malamute: 'husky',
  golden_retriever: 'golden_retriever',
};

const MORE_BREEDS = [
  { id: 'beagle', label: 'Beagle', risk: 'low', slug: 'beagle' },
  { id: 'boxer', label: 'Boxer', risk: 'high', slug: 'boxer' },
  { id: 'chihuahua', label: 'Chihuahua', risk: 'low', slug: 'chihuahua' },
  { id: 'dalmatian', label: 'Dalmatian', risk: 'medium', slug: 'dalmatian' },
  { id: 'dachshund', label: 'Dachshund', risk: 'health', slug: 'dachshund' },
  { id: 'samoyed', label: 'Samoyed', risk: 'medium', slug: 'samoyed' },
  { id: 'akita', label: 'Akita', risk: 'high', slug: 'akita' },
  { id: 'chow_chow', label: 'Chow Chow', risk: 'high', slug: 'chow' },
  { id: 'corgi', label: 'Corgi', risk: 'medium', slug: 'corgi/cardigan' },
  { id: 'eskimo_dog', label: 'American Eskimo Dog', risk: 'medium', slug: 'eskimo' },
  { id: 'havanese', label: 'Havanese', risk: 'low', slug: 'havanese' },
  { id: 'malamute', label: 'Alaskan Malamute', risk: 'high', slug: 'malamute' },
  { id: 'newfoundland', label: 'Newfoundland', risk: 'medium', slug: 'newfoundland' },
  { id: 'papillon', label: 'Papillon', risk: 'low', slug: 'papillon' },
  { id: 'pekinese', label: 'Pekingese', risk: 'health', slug: 'pekinese' },
  { id: 'pomeranian', label: 'Pomeranian', risk: 'low', slug: 'pomeranian' },
  { id: 'poodle', label: 'Poodle', risk: 'low', slug: 'poodle/standard' },
  { id: 'whippet', label: 'Whippet', risk: 'low', slug: 'whippet' },
  { id: 'weimaraner', label: 'Weimaraner', risk: 'high', slug: 'weimaraner' },
  { id: 'maltese', label: 'Maltese', risk: 'low', slug: 'maltese' },
  { id: 'shiba_inu', label: 'Shiba Inu', risk: 'medium', slug: 'shiba' },
  { id: 'bull_terrier', label: 'Bull Terrier', risk: 'high', slug: 'bullterrier/staffordshire' },
  { id: 'miniature_pinscher', label: 'Miniature Pinscher', risk: 'low', slug: 'pinscher' },
  { id: 'puggle', label: 'Puggle', risk: 'medium', slug: 'puggle' },
  { id: 'golden_retriever', label: 'Golden Retriever', risk: 'low', slug: 'retriever/golden' },
  { id: 'great_dane', label: 'Great Dane', risk: 'high', slug: 'dane' },
  { id: 'shih_tzu', label: 'Shih Tzu', risk: 'health', slug: 'shihtzu' },
  { id: 'cocker_spaniel', label: 'Cocker Spaniel', risk: 'low', slug: 'spaniel/cocker' },
  { id: 'yorkshire_terrier', label: 'Yorkshire Terrier', risk: 'low', slug: 'terrier/yorkshire' },
  { id: 'west_highland', label: 'West Highland Terrier', risk: 'low', slug: 'terrier/westhighland' },
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

const DRAFT_KEY = 'canineiq_assessment';

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (typeof saved?.step !== 'number') return null;
    return {
      step: Math.min(Math.max(0, Math.round(saved.step)), QUESTIONS.length),
      breed: saved.breed || null,
      answers: saved.answers || {},
      custom: saved.custom || {},
    };
  } catch { return null; }
}

export default function Assessment({ onComplete, onBack }) {
  const [draft] = useState(loadDraft);
  const [step, setStep] = useState(draft?.step ?? 0);
  const [breed, setBreed] = useState(draft && draft.step !== 0 ? draft.breed : null);
  const [answers, setAnswers] = useState(() => {
    const a = { ...(draft?.answers || {}) };
    const current = draft && draft.step !== 0 ? QUESTIONS[draft.step - 1] : null;
    if (current) delete a[current.id];
    return a;
  });
  const [custom, setCustom] = useState(() => {
    const c = { ...(draft?.custom || {}) };
    const current = draft && draft.step !== 0 ? QUESTIONS[draft.step - 1] : null;
    if (current) delete c[current.id];
    return c;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [identifyError, setIdentifyError] = useState(null);
  const [photoThumbs, setPhotoThumbs] = useState({});
  const fileRef = useRef(null);
  const [showCamOptions, setShowCamOptions] = useState(false);
  const [camOpen, setCamOpen] = useState(false);
  const [camError, setCamError] = useState(null);
  const [camReady, setCamReady] = useState(false);
  const camVideoRef = useRef(null);
  const camStreamRef = useRef(null);
  const total = QUESTIONS.length + 1;
  const current = QUESTIONS[step - 1];
  const answer = current ? answers[current.id] : null;

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, breed, answers, custom }));
    } catch { /* storage unavailable */ }
  }, [step, breed, answers, custom]);

  const startOver = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
    setStep(0);
    setBreed(null);
    setAnswers({});
    setCustom({});
    setQuery('');
    setSearchOpen(false);
    setIdentifyError(null);
  };

  const ALL_BREEDS = useMemo(() => {
    const seen = new Set(BREEDS.map((b) => b.id));
    return [...BREEDS, ...MORE_BREEDS.filter((b) => !seen.has(b.id))];
  }, []);

  const CORE_IDS = useMemo(() => new Set(BREEDS.map((b) => b.id)), []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_BREEDS.filter((b) => b.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query, ALL_BREEDS]);

  useEffect(() => {
    if (!searchOpen || !query.trim()) return;
    const timer = setTimeout(async () => {
      const missing = matches.filter((b) => !CORE_IDS.has(b.id) && !photoThumbs[b.id]);
      for (const b of missing) {
        const url = await dogceoImage(b.slug);
        if (url) setPhotoThumbs((prev) => (prev[b.id] ? prev : { ...prev, [b.id]: url }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchOpen, query, matches, photoThumbs, CORE_IDS]);

  const dogceoImage = async (slug) => {
    try {
      const res = await fetch(`https://dog.ceo/api/breed/${slug}/images/random`);
      const data = await res.json();
      return data.status === 'success' ? data.message : null;
    } catch { return null; }
  };

  const selectBreed = (item) => { setSearchOpen(false); setBreed({ ...item, source: 'card', image: `/images/${item.id}.jpg` }); };

  const selectFromSearch = async (item) => {
    setSearchOpen(false);
    let url = null;
    if (!photoThumbs[item.id]) {
      url = await dogceoImage(item.slug);
      if (url) setPhotoThumbs((prev) => ({ ...prev, [item.id]: url }));
    }
    setBreed({ ...item, source: 'search', image: url || (CORE_IDS.has(item.id) ? `/images/${item.id}.jpg` : 'https://images.dog.ceo/breeds/retriever-golden/n02099601_6105.jpg') });
  };

  const identifyDog = async (file) => {
    if (!file) return;
    setIdentifying(true);
    setIdentifyError(null);
    try {
      const mimeType = file.type || 'image/jpeg';
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(new Error('Could not read the photo'));
        reader.readAsDataURL(file);
      });
      const response = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType }),
      });
      const local = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      let result;
      try { result = await response.json(); } catch { throw new Error(local ? 'Photo identification is not available in this local Vite preview yet. Deploy the project, then snap a photo on the live site.' : 'Could not identify the dog. Please try again.'); }
      if (!response.ok) {
        throw new Error(result?.error || 'Could not identify the dog. Please try again.');
      }
      if (result.id === 'none') {
        throw new Error(local ? 'Photo identification is not available in this local Vite preview yet. Deploy the project, then snap a photo on the live site.' : 'No dog detected in that photo. Try a clearer shot of the face.');
      }
      const aliasId = BREED_ALIASES[result.id];
      const match = ALL_BREEDS.find((b) => b.id === (aliasId || result.id)) || ALL_BREEDS.find((b) => b.label.toLowerCase() === (result.label || '').toLowerCase());
      let image = null;
      if (match) {
        if (match.slug) image = await dogceoImage(match.slug);
        if (image) setPhotoThumbs((prev) => ({ ...prev, [match.id]: image }));
      }
      const picked = { ...(match || { id: result.id, label: result.label || 'Mixed breed', risk: 'medium', slug: null }), source: 'photo', image: image || URL.createObjectURL(file), photo: file };
      setSearchOpen(false);
      setBreed(picked);
    } catch (err) {
      setIdentifyError(err.message || 'Could not identify the dog. Please try again.');
    } finally {
      setIdentifying(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const setAnswer = (value) => setAnswers((prev) => ({ ...prev, [current.id]: value }));

  const openCamera = async () => {
    setCamError(null);
    setCamReady(false);
    setCamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      camStreamRef.current = stream;
      if (camVideoRef.current) {
        camVideoRef.current.srcObject = stream;
        await camVideoRef.current.play();
      }
      setCamReady(true);
    } catch (err) {
      console.error('[camera]', err?.message);
      setCamError('Camera access denied. Use "Choose from gallery" instead, or allow camera permission and try again.');
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
    }
    setCamOpen(false);
    setCamReady(false);
  };

  const capturePhoto = () => {
    const video = camVideoRef.current;
    if (!video || !camReady) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'camera.jpg', { type: 'image/jpeg' });
      stopCamera();
      identifyDog(file);
    }, 'image/jpeg', 0.92);
  };

  const submit = async () => {
    setLoading(true); setError(null);
    const payload = { breed, questions: QUESTIONS.map((q) => ({ ...q, answer: answers[q.id] || null, custom: custom[q.id] || '' })) };
    try {
      const response = await fetch('/api/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) {
        let detail = 'Gemini evaluation is unavailable. Please try again. Your answers are still here.';
        try { const j = await response.json(); if (j?.error) detail = j.error; } catch { /* non-JSON error */ }
        throw new Error(detail);
      }
      onComplete({ breed, answers, custom }, await response.json());
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
    } catch (err) {
      console.error('[v0] Evaluation failed:', err.message);
      const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      setError(isLocal
        ? 'Gemini evaluation is not available in this local Vite preview yet. Deploy the project with the server function enabled, then try again. Your answers are still here.'
        : err.message || 'Gemini evaluation is unavailable. Please try again. Your answers are still here.');
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
      <div className="breed-grid">{BREEDS.map((item) => <button key={item.id} className={`breed-card ${breed?.id === item.id ? 'selected' : ''}`} onClick={() => selectBreed(item)}><img src={`/images/${item.id}.jpg`} alt="" /><span className="breed-name">{item.label}</span><span className="breed-risk">{RISK_LABELS[item.risk]}</span></button>)}</div>
      <div className="breed-more">
        <div className="kicker breed-more-kicker">Don't see the dog?</div>
        <div className="breed-more-row">
          <div className="breed-search" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setSearchOpen(false); }}>
            <input className="breed-search-input" value={query} onFocus={() => setSearchOpen(true)} onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }} placeholder="Search any breed…" />
            {searchOpen && matches.length > 0 && (
              <ul className="breed-search-list">
                {matches.map((item) => (
                  <li key={item.id}>
                    <button className="breed-search-item" onClick={() => selectFromSearch(item)}>
                      <span className="breed-search-thumb">{CORE_IDS.has(item.id) ? <img src={`/images/${item.id}.jpg`} alt="" /> : photoThumbs[item.id] ? <img src={photoThumbs[item.id]} alt="" /> : <span className="thumb-ph">🐾</span>}</span>
                      <span className="breed-search-name">{item.label}</span>
                      <span className="breed-risk">{RISK_LABELS[item.risk]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <span className="breed-more-or">or</span>
          <div className="identify-wrap" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setShowCamOptions(false); }}>
            <button className="identify-btn" disabled={identifying} onClick={() => setShowCamOptions((v) => !v)}>
              {identifying ? 'Identifying…' : '📷 Snap a photo'}
            </button>
            {showCamOptions && (
              <div className="identify-options">
                <button className="identify-option" onClick={() => { openCamera(); setShowCamOptions(false); }}>📷 Take a photo</button>
                <button className="identify-option" onClick={() => { fileRef.current?.click(); setShowCamOptions(false); }}>🖼️ Choose from gallery</button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => identifyDog(e.target.files?.[0])} />
            {identifyError && <p className="identify-error">{identifyError}</p>}
          </div>
        </div>
        {breed?.source === 'photo' && <div className="identified-note">Identified from your photo: <strong>{breed.label}</strong> ✓</div>}
        {breed?.source === 'search' && <div className="identified-note">Selected from search: <strong>{breed.label}</strong> ✓</div>}
      </div>
    </section> : <section className="assessment-content fade-up" key={current.id}>
      <p className="kicker">Question {step} / {QUESTIONS.length}</p><h1 className="q-title">{current.question}</h1><p className="q-sub">Pick the closest answer. Then add context if the choices do not tell the whole truth.</p>
      <div className="options-list">{current.options.map((option) => <button key={option} className={`option-btn ${answer === option ? 'selected' : ''}`} onClick={() => setAnswer(option)}>{option}</button>)}</div>
      <label className="custom-label" htmlFor={`custom-${current.id}`}>Your answer, in your own words <span>optional but useful</span></label><textarea id={`custom-${current.id}`} className="custom-answer" value={custom[current.id] || ''} onChange={(event) => setCustom((prev) => ({ ...prev, [current.id]: event.target.value }))} placeholder="Add the detail the choices missed…" rows="3" />
      {error && <p className="error-msg">{error}</p>}
    </section>}
    <footer className={`assessment-footer${searchOpen && matches.length > 0 || showCamOptions || camOpen ? ' hidden' : ''}`}>{step > 0 && <button className="secondary-action" onClick={() => setStep((value) => value - 1)}>Back</button>}<button className="secondary-action" onClick={startOver}>Start over</button><button className="primary-action" disabled={step === 0 ? !breed : !answer && !(custom[current?.id] || '').trim()} onClick={step === 0 ? () => setStep(1) : next}>{step === 0 ? 'Begin the questions' : step === QUESTIONS.length ? 'Show me the truth' : 'Continue'}</button></footer>
    {camOpen && (
      <div className="camera-overlay" onClick={stopCamera}>
        <div className="camera-card" onClick={(e) => e.stopPropagation()}>
          <p className="camera-kicker">TAKE A PHOTO</p>
          <p className="camera-title">Line up the dog, then capture</p>
          <div className="camera-frame">
            {!camReady && !camError && <div className="camera-loading"><div className="loading-orbit"><span /></div></div>}
            <video ref={camVideoRef} className={camReady ? 'camera-video' : 'camera-video camera-video-hidden'} autoPlay playsInline muted />
          </div>
          {camError ? (
            <p className="camera-error">{camError}</p>
          ) : (
            <div className="camera-actions">
              <button className="secondary-action" onClick={stopCamera}>Cancel</button>
              <button className="primary-action" disabled={!camReady} onClick={capturePhoto}>Capture photo</button>
            </div>
          )}
        </div>
      </div>
    )}
  </main>;
}
