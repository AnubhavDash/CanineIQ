import React, { useState, useEffect, useRef } from 'react';
import './Results.css';
import { getBreedImage, FALLBACK_IMAGE } from './breedImages';

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
  const [audioState, setAudioState] = useState('idle');
  const audioRef = useRef(null);
  const rec = RECOMMENDATION_CONFIG[results.recommendation] || RECOMMENDATION_CONFIG.CAUTION;
  const breedId = data?.breed?.id;
  const breedImage = getBreedImage(breedId);
  const voiceScript = results.dogVoice || FALLBACK_VOICE;

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const stopAll = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speakWithBrowser = () => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
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

  const playWithEleven = async () => {
    setAudioState('loading');
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: voiceScript }),
      });
      if (!response.ok) throw new Error(`speech ${response.status}`);
      const blob = await response.blob();
      if (!blob.size) throw new Error('empty audio');
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setSpeaking(false); setAudioState('idle'); URL.revokeObjectURL(url); };
      audio.onerror = () => { setSpeaking(false); setAudioState('idle'); URL.revokeObjectURL(url); speakWithBrowser(); };
      await audio.play();
      setSpeaking(true);
      setAudioState('playing');
    } catch {
      setAudioState('idle');
      speakWithBrowser();
    }
  };

  const toggleSpeak = () => {
    if (audioState === 'loading') return;
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
      setSpeaking(false);
      setAudioState('paused');
      return;
    }
    if (audio && audioState === 'paused') {
      audio.play();
      setSpeaking(true);
      setAudioState('playing');
      return;
    }
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      const synth = window.speechSynthesis;
      if (synth.paused) { synth.resume(); setSpeaking(true); }
      else { synth.pause(); setSpeaking(false); }
      return;
    }
    playWithEleven();
  };

  return (
    <div className="results-wrap">
      <div className="results-header">
        <button className="btn-ghost back-btn-sm" onClick={onHome}>← Home</button>
        <span className="logo-sm">Canine<span style={{ color: 'var(--amber)' }}>IQ</span></span>
        <button className="btn-ghost back-btn-sm" onClick={onRetake}>Retake</button>
      </div>

      {/* Framing — we carry the call */}
      <p className="call-frame">We're making this call so you don't have to carry it. This isn't a judgment of you — it's whether this dog can thrive in the life you described.</p>

      {/* Verdict */}
      <div className="verdict-band" style={{ background: rec.bg, borderColor: rec.border }}>
        <div className="verdict-inner">
          <ScoreRing score={results.score} />
          <div className="verdict-text">
            <div className="verdict-label section-label" style={{ color: rec.color }}>
              {rec.label} · Gemini assessment
            </div>
            <div className="verdict-breed"><img className="result-breed-thumb" src={breedImage} alt="" onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }} /> {data.breed?.label}</div>
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
              e.target.src = FALLBACK_IMAGE;
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
          <button className="speak-btn" onClick={toggleSpeak} disabled={audioState === 'loading'}>
            {audioState === 'loading' ? (
              <><span className="speak-icon">⏳</span> Preparing the voice…</>
            ) : speaking ? (
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
          <div className="ws-title" style={{ color: 'var(--danger)' }}>Concerns <span className="ws-sub">— not accusations. The risks we'd be carrying if we said yes.</span></div>
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

      {/* Path forward — the call is not permanent */}
      {results.recommendation !== 'READY' && (
        <div className="path-card">
          <div className="section-label">This call isn't permanent</div>
          <p className="path-copy">It follows the reality you described, not the other way around. Change what you can — wait until the children are older, build a training plan, or start with a sturdier breed — and the score follows.</p>
        </div>
      )}

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
