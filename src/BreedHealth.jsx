import React, { useState } from 'react';
import './BreedHealth.css';
import { LIVE_MODE, GEMINI_API_KEY } from './config.js';
import { callGemini } from './gemini.js';

const HEALTH_BREEDS = [
  {
    id: 'french_bulldog',
    name: 'French Bulldog',
    emoji: '🐾',
    condition: 'BOAS',
    conditionFull: 'Brachycephalic Obstructive Airway Syndrome',
    severity: 'critical',
    popularityRank: 1,
    tag: 'Bred for flat face — causes lifetime breathing issues',
  },
  {
    id: 'pug',
    name: 'Pug',
    emoji: '🐽',
    condition: 'BOAS + Eye Prolapse',
    conditionFull: 'Brachycephalic Obstructive Airway Syndrome + Corneal Ulceration',
    severity: 'critical',
    popularityRank: 3,
    tag: 'Cannot breathe normally at rest',
  },
  {
    id: 'english_bulldog',
    name: 'English Bulldog',
    emoji: '🐕',
    condition: 'BOAS + Hip Dysplasia',
    conditionFull: 'Brachycephalic Airway Syndrome + Orthopedic Disease',
    severity: 'critical',
    popularityRank: 5,
    tag: 'Cannot reproduce naturally — requires C-section',
  },
  {
    id: 'dachshund',
    name: 'Dachshund',
    emoji: '🌭',
    condition: 'IVDD',
    conditionFull: 'Intervertebral Disc Disease',
    severity: 'high',
    popularityRank: 8,
    tag: 'Spine too long for body — paralysis risk',
  },
  {
    id: 'german_shepherd',
    name: 'German Shepherd',
    emoji: '🦮',
    condition: 'Hip & Elbow Dysplasia',
    conditionFull: 'Degenerative Hip/Elbow Joint Disease',
    severity: 'high',
    popularityRank: 2,
    tag: 'Sloped back breeding increases joint degeneration',
  },
  {
    id: 'cavalier',
    name: 'Cavalier King Charles Spaniel',
    emoji: '🐶',
    condition: 'CKCS-MVD + SM',
    conditionFull: 'Mitral Valve Disease + Syringomyelia (skull too small for brain)',
    severity: 'critical',
    popularityRank: 12,
    tag: 'Skull bred too small — brain physically too large for it',
  },
  {
    id: 'great_dane',
    name: 'Great Dane',
    emoji: '🐕‍🦺',
    condition: 'Bloat + DCM',
    conditionFull: 'Gastric Dilatation-Volvulus + Dilated Cardiomyopathy',
    severity: 'high',
    popularityRank: 15,
    tag: 'Bred to maximum size — lifespan 6–8 years average',
  },
  {
    id: 'boxer',
    name: 'Boxer',
    emoji: '🥊',
    condition: 'BOAS + Heart Disease',
    conditionFull: 'Brachycephalic Airway + Aortic Stenosis',
    severity: 'high',
    popularityRank: 11,
    tag: 'High cancer rates — one of the most cancer-prone breeds',
  },
];

const SEV_CONFIG = {
  critical: { color: '#C0392B', label: 'Critical', bg: 'rgba(192,57,43,0.1)' },
  high: { color: '#E67E22', label: 'High Risk', bg: 'rgba(230,126,34,0.1)' },
  medium: { color: '#E8A847', label: 'Moderate', bg: 'rgba(232,168,71,0.1)' },
};

const DEMO_DETAIL = (breed) => ({
  breed,
  overview: `Human breeders spent generations selecting for a look that comes with ${breed.conditionFull.toLowerCase()} built in. The trait is prized by buyers and paid for by ${breed.name}s every single day of their lives.`,
  whatItFeelsLike: `Every breath is work. Every morning starts exhausted. It is a constant, quiet discomfort the dog cannot explain and cannot escape.`,
  surgeryRate: '~40%',
  lifeExpectancy: '8–10 yrs',
  whatBreedersWontTellYou: `They will show you the puppy's parents and hide the operating table those parents will need.`,
  isItEthicalToBuy: 'No — adopting or choosing a healthier breed is the honest option.',
  healthierAlternative: 'A mixed-breed rescue with a compatible temperament.',
});

export default function BreedHealth({ onBack }) {
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectBreed = async (breed) => {
    setSelected(breed.id);
    setDetail(null);
    setError(null);
    setLoading(true);

    const prompt = `You are a veterinary geneticist and animal welfare expert. Give an honest, no-holds-barred explanation of the health problems in ${breed.name}s caused by selective breeding.

Primary condition: ${breed.conditionFull}

Respond in this exact JSON format:
{
  "overview": "<2-3 sentence plain-language overview of what was done to this breed genetically and why it's cruel>",
  "whatItFeelsLike": "<1-2 sentences describing what the dog actually experiences day to day — make it visceral and real>",
  "surgeryRate": "<realistic percentage or stat about how many need surgery or vet intervention>",
  "lifeExpectancy": "<honest lifespan compared to healthier breeds>",
  "whatBreedersWontTellYou": "<the uncomfortable truth breeders hide from buyers — 1-2 sentences>",
  "isItEthicalToBuy": "<honest 1-sentence answer: yes, no, or conditional — no diplomatic hedging>",
  "healthierAlternative": "<a breed with similar temperament but far fewer genetic health problems>"
}

Only respond with valid JSON.`;

    try {
      let parsed;
      if (LIVE_MODE && GEMINI_API_KEY) {
        const text = await callGemini(prompt);
        parsed = JSON.parse(text);
      } else {
        await new Promise(r => setTimeout(r, 1100));
        parsed = DEMO_DETAIL(breed);
      }
      setDetail({ breed, ...parsed });
    } catch (e) {
      setError('Failed to load breed health data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bh-wrap">
      <div className="bh-header">
        <button className="btn-ghost back-btn-sm" onClick={onBack}>← Back</button>
        <span className="logo-sm">Canine<span style={{ color: 'var(--amber)' }}>IQ</span></span>
        <div style={{ width: 80 }} />
      </div>

      <div className="bh-hero">
        <div className="section-label">Breed Health Transparency</div>
        <h1 className="bh-title">What breeders don't tell you</h1>
        <p className="bh-sub">
          Many of the most popular dogs alive today carry genetic conditions deliberately bred into them
          for human aesthetics — flat faces, elongated spines, oversized heads. This is what that looks like.
        </p>
      </div>

      <div className="bh-content">
        <div className="bh-list">
          {HEALTH_BREEDS.map(b => {
            const sev = SEV_CONFIG[b.severity];
            return (
              <button
                key={b.id}
                className={`bh-breed-btn ${selected === b.id ? 'active' : ''}`}
                onClick={() => handleSelectBreed(b)}
                style={selected === b.id ? { borderColor: sev.color, background: sev.bg } : {}}
              >
                <span className="bh-emoji">{b.emoji}</span>
                <div className="bh-info">
                  <span className="bh-name">{b.name}</span>
                  <span className="bh-condition">{b.condition}</span>
                  <span className="bh-tag">{b.tag}</span>
                </div>
                <span className="bh-sev" style={{ color: sev.color }}>{sev.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bh-detail">
          {!selected && (
            <div className="bh-placeholder">
              <div className="ph-icon">🔬</div>
              <p>Select a breed to see the full health breakdown</p>
            </div>
          )}

          {loading && (
            <div className="bh-loading">
              <div className="spinner" />
              <p>Loading health data…</p>
            </div>
          )}

          {error && (
            <div className="bh-error">{error}</div>
          )}

          {detail && !loading && (
            <div className="bh-detail-card fade-up">
              <div className="detail-header">
                <span className="detail-emoji">{detail.breed.emoji}</span>
                <div>
                  <h2 className="detail-name">{detail.breed.name}</h2>
                  <div className="detail-condition">{detail.breed.conditionFull}</div>
                </div>
              </div>

              <div className="detail-block">
                <div className="detail-block-label">What was done to this breed</div>
                <p>{detail.overview}</p>
              </div>

              <div className="detail-block pain">
                <div className="detail-block-label" style={{ color: 'var(--danger)' }}>
                  What they experience daily
                </div>
                <p>{detail.whatItFeelsLike}</p>
              </div>

              <div className="detail-stats-row">
                <div className="detail-stat">
                  <span className="detail-stat-num">{detail.surgeryRate}</span>
                  <span className="detail-stat-label">Need surgical intervention</span>
                </div>
                <div className="detail-stat">
                  <span className="detail-stat-num">{detail.lifeExpectancy}</span>
                  <span className="detail-stat-label">Life expectancy</span>
                </div>
              </div>

              <div className="detail-block secret">
                <div className="detail-block-label" style={{ color: 'var(--warning)' }}>
                  ⚠ What breeders won't tell you
                </div>
                <p>{detail.whatBreedersWontTellYou}</p>
              </div>

              <div className="detail-ethical">
                <div className="detail-block-label">Is it ethical to buy one?</div>
                <p className="ethical-answer">{detail.isItEthicalToBuy}</p>
              </div>

              {detail.healthierAlternative && (
                <div className="detail-alt">
                  <span className="section-label">Healthier alternative</span>
                  <span className="alt-name">→ {detail.healthierAlternative}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
