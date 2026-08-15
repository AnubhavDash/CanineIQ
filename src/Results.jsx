import React, { useState, useEffect } from 'react';
import './Results.css';

const RECOMMENDATION_CONFIG = {
  READY: {
    label: "You're Ready",
    color: '#27AE60',
    bg: 'rgba(39,174,96,0.08)',
    border: 'rgba(39,174,96,0.3)',
    icon: '✓',
  },
  CAUTION: {
    label: 'Proceed with Caution',
    color: '#E8A847',
    bg: 'rgba(232,168,71,0.08)',
    border: 'rgba(232,168,71,0.3)',
    icon: '⚠',
  },
  NOT_READY: {
    label: 'Not Ready Yet',
    color: '#C0392B',
    bg: 'rgba(192,57,0.08)',
    border: 'rgba(192,57,43,0.3)',
    icon: '✕',
  },
};

const FALLBACK_VOICE =
  "I look cute, don't I? But look closer — every breath is a small fight for me. I didn't choose this face, and I can't tell you how tired I get just trying to sleep at night. Promise me you'll learn what I actually need.";

function ScoreRing({ score }) {
  const r = 56;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 70 ? '#27AE60' : score >= 40 ? '#E8A847' : '#C0392B';
  return (
    <div className="score-ring-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(74,103,65,0.25)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s ease' }}
        />
        <text x="70" y="68" textAnchor="middle" fill="#F5F0E8"
          fontFamily="Fraunces, serif" fontSize="30" fontWeight="700">{score}</text>
        <text x="70" y="86" textAnchor="middle" fill="#8A9E85"
          fontFamily="Inter, sans-serif" fontSize="11">/100</text>
      </svg>
    </div>
  );
}

export default function Results({ data, results, onRetake, onHome }) {
  const [showAltReasons, setShowAltReasons] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const rec = RECOMMENDATION_CONFIG[results.recommendation] || RECOMMENDATION_CONFIG.CAUTION;
  const breedId = data?.breed?.id;
  const breedImage = data?.breed?.image || (breedId ? `/images/${breedId}.jpg` : 'https://images.dog.ceo/breeds/retriever-golden/n02099601_6105.jpg');
  const voiceScript = results.dogVoice || FALLBACK_VOICE;

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const toggleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      if (synth.paused) { synth.resume(); setSpeaking(true); }
      else { synth.pause(); setSpeaking(false); }
      return;
    }
    const u = new SpeechSynthesisUtterance(voiceScript);
    u.rate = 0.82;
    u.pitch = 0.88;
    u.volume = 1;
    const voices = synth.getVoices();
    const gentle = voices.find(v => /en[-_]US/i.test(v.lang) && /(samantha|aria|jenny|zira|female)/i.test(v.name))
      || voices.find(v => /en[-_]US/i.test(v.lang))
      || voices[0];
    if (gentle) u.voice = gentle;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.speak(u);
    setSpeaking(true);
  };

  return (
    <div className="results-wrap">
      <div className="results-header">
        <button className="btn-ghost back-btn-sm" onClick={onHome}>← Home</button>
        <span className="logo-sm">Canine<span style={{ color: 'var(--amber)' }}>IQ</span></span>
        <button className="btn-ghost back-btn-sm" onClick={onRetake}>Retake</button>
      </div>

      {/* Verdict */}
      <div className="verdict-band" style={{ background: rec.bg, borderColor: rec.border }}>
        <div className="verdict-inner">
          <ScoreRing score={results.score} />
          <div className="verdict-text">
            <div className="verdict-label section-label" style={{ color: rec.color }}>
              {rec.label} · Gemini assessment
            </div>
            <div className="verdict-breed"><img className="result-breed-thumb" src={breedImage} alt="" /> {data.breed?.label}</div>
            <p className="verdict-sentence">{results.verdict}</p>
          </div>
        </div>
      </div>

      {/* THE EMOTIONAL CORE — dog speaks */}
      <div className="dog-moment">
        <div className="dog-image-wrap">
          <img
            src={breedImage}
            alt="An adorable dog"
            className="dog-img"
            onError={e => {
              e.target.src = 'https://images.dog.ceo/breeds/retriever-golden/n02099601_6105.jpg';
            }}
          />
          <div className="dog-img-overlay" />
          <div className="dog-img-caption">
            I look cute, don't I?
          </div>
        </div>

        <div className="dog-voice-panel">
          <div className="dv-eyebrow section-label">
            A letter from your {data?.breed?.label || 'future dog'}
          </div>
          <blockquote className="dog-voice-text">
            "{voiceScript}"
          </blockquote>
          <button className="speak-btn" onClick={toggleSpeak}>
            {speaking ? (
              <><span className="speak-icon">⏸</span> Pause</>
            ) : (
              <><span className="speak-icon">🔊</span> Read it to me</>
            )}
          </button>
          <div className="dv-divider" />
          <div className="dv-foot">
            <div className="dv-foot-item">
              <span className="dv-foot-label">The breed</span>
              <span className="dv-foot-value">{data?.breed?.label || '—'}</span>
            </div>
            <div className="dv-foot-item">
              <span className="dv-foot-label">Score</span>
              <span className="dv-foot-value">{results.score}<span className="dv-foot-max">/100</span></span>
            </div>
            <div className="dv-foot-item">
              <span className="dv-foot-label">Verdict</span>
              <span className="dv-foot-value" style={{ color: rec.color }}>{rec.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings & Strengths */}
      <div className="ws-grid">
        <div className="ws-card">
          <div className="ws-title" style={{ color: 'var(--danger)' }}>Concerns</div>
          <ul className="ws-list">
            {results.topWarnings?.map((w, i) => (
              <li key={i} className="ws-item warning-item">{w}</li>
            ))}
          </ul>
        </div>
        <div className="ws-card">
          <div className="ws-title" style={{ color: 'var(--safe)' }}>Strengths</div>
          <ul className="ws-list">
            {results.topStrengths?.map((s, i) => (
              <li key={i} className="ws-item strength-item">{s}</li>
            ))}
          </ul>
        </div>
      </div>

      {results.answerFindings?.length > 0 && <section className="findings-card"><div className="section-label">What each answer tells us</div><div className="findings-list">{results.answerFindings.map((finding, index) => <article className="finding" key={`${finding.question}-${index}`}><div><span className="finding-number">{String(index + 1).padStart(2, '0')}</span><strong>{finding.question}</strong></div><p>{finding.finding}</p><span className={`finding-level level-${finding.concernLevel?.toLowerCase()}`}>{finding.concernLevel === 'ACTION' ? 'Needs action' : finding.concernLevel === 'WATCH' ? 'Worth watching' : 'Working here'}</span></article>)}</div></section>}

      {/* Alt breed */}
      {results.recommendation !== 'READY' && results.alternateBreed && (
        <div className="alt-breed-card">
          <div className="section-label">A better match for your life right now</div>
          <div className="alt-breed-name">{results.alternateBreed}</div>
          <p className="alt-breed-sub">
            This is not a consolation prize. It is Gemini’s best-fit recommendation for the life you described—not a generic “easy dog.”
          </p>
          <button
            className="btn-ghost alt-why-btn"
            onClick={() => setShowAltReasons(v => !v)}
          >
            {showAltReasons ? 'Hide reasons ↑' : `Why this breed instead of ${data.breed?.label}? ↓`}
          </button>
          {showAltReasons && results.altReasons?.length > 0 && (
            <ul className="alt-reasons fade-up">
              {results.altReasons.map((r, i) => (
                <li key={i} className="alt-reason-item">{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="results-actions">
        <button className="btn-primary" onClick={onRetake}>Try Another Breed</button>
        <button className="btn-ghost" onClick={onHome}>Back to Home</button>
      </div>
    </div>
  );
}
