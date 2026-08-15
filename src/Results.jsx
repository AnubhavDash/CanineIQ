import React, { useState, useRef } from 'react';
import './Results.css';
import { DOG_VOICES, DOG_VOICE_FALLBACK } from './dogVoices.js';

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
  const [playing, setPlaying] = useState(false);
  const [showAltReasons, setShowAltReasons] = useState(false);
  const audioRef = useRef(null);
  const rec = RECOMMENDATION_CONFIG[results.recommendation] || RECOMMENDATION_CONFIG.CAUTION;
  const breedId = data?.breed?.id;
  const voiceScript = DOG_VOICES[breedId] || results.dogVoice || DOG_VOICE_FALLBACK;
  const audioSrc = breedId ? `/audio/${breedId}.mp3` : null;

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); }
    else { a.pause(); setPlaying(false); }
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
              {rec.icon} {rec.label}
            </div>
            <div className="verdict-breed"><img className="result-breed-thumb" src={`/images/${breedId}.jpg`} alt="" /> {data.breed?.label}</div>
            <p className="verdict-sentence">{results.verdict}</p>
          </div>
        </div>
      </div>

      {/* THE EMOTIONAL CORE — dog speaks */}
      <div className="dog-moment">
        <div className="dog-image-wrap">
          <img
            src={breedId ? `/images/${breedId}.jpg` : 'https://images.dog.ceo/breeds/retriever-golden/n02099601_6105.jpg'}
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
            What this dog needs from you
          </div>
          <blockquote className="dog-voice-text">
            "{voiceScript}"
          </blockquote>

          {audioSrc && (
            <button
              className={`play-btn ${playing ? 'playing' : ''}`}
              onClick={togglePlay}
            >
              {playing ? (
                <><span className="play-icon">⏸</span> Pause</>
              ) : (
                <><span className="play-icon">▶</span> Hear it in their voice</>
              )}
            </button>
          )}

          <audio
            ref={audioRef}
            src={audioSrc}
            preload="none"
            onEnded={() => setPlaying(false)}
          />
        </div>
      </div>

      {/* Warnings & Strengths */}
      <div className="ws-grid">
        <div className="ws-card">
          <div className="ws-title" style={{ color: 'var(--danger)' }}>⚠ Concerns</div>
          <ul className="ws-list">
            {results.topWarnings?.map((w, i) => (
              <li key={i} className="ws-item warning-item">{w}</li>
            ))}
          </ul>
        </div>
        <div className="ws-card">
          <div className="ws-title" style={{ color: 'var(--success)' }}>✓ Strengths</div>
          <ul className="ws-list">
            {results.topStrengths?.map((s, i) => (
              <li key={i} className="ws-item strength-item">{s}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Alt breed */}
      {results.recommendation !== 'READY' && results.alternateBreed && (
        <div className="alt-breed-card">
          <div className="section-label">A better match for your life right now</div>
          <div className="alt-breed-name">{results.alternateBreed}</div>
          <p className="alt-breed-sub">
            Start here. Build experience. Come back when you're ready for your first choice.
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
