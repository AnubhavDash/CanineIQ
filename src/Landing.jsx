import React from 'react';
import './Landing.css';

export default function Landing({ onStartAssessment, onBreedHealth }) {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <span className="logo">Canine<span className="logo-accent">IQ</span></span>
        <div className="nav-links">
          <button className="nav-link" onClick={onBreedHealth}>Breed Health</button>
          <button className="btn-primary" onClick={onStartAssessment}>Take the Test</button>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-eyebrow section-label">Dog Welfare Initiative</div>
        <h1 className="hero-title">
          Before you get a dog,<br />
          <em>ask if you're ready for one.</em>
        </h1>
        <p className="hero-sub">
          Every year, thousands of dogs — especially "status breeds" like pitbulls —
          are abandoned, abused, or euthanised because their owners weren't prepared.
          This isn't the dog's fault. CanineIQ helps you find out the truth before it's too late.
        </p>
        <div className="hero-actions">
          <button className="btn-primary btn-large" onClick={onStartAssessment}>
            Am I Ready? →
          </button>
          <button className="btn-ghost" onClick={onBreedHealth}>
            Breed Health Risks
          </button>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-num">3.9M</span>
          <span className="stat-label">Dogs entering US shelters each year</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-num">~70%</span>
          <span className="stat-label">Of bites involve unneutered, chained, or untrained dogs</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-num">1 in 3</span>
          <span className="stat-label">Brachycephalic dogs need surgery by age 3</span>
        </div>
      </div>

      <div className="cards-section">
        <div className="section-label">What CanineIQ Does</div>
        <div className="cards-grid">
          <div className="card">
            <div className="card-icon">🧠</div>
            <h3>Ownership Readiness</h3>
            <p>AI-powered assessment of your lifestyle, experience, and environment against the real demands of your chosen breed.</p>
          </div>
          <div className="card">
            <div className="card-icon">🫁</div>
            <h3>Breed Health Truth</h3>
            <p>The genetic health problems deliberately bred into popular dogs — BOAS, IVDD, hip dysplasia — explained honestly.</p>
          </div>
          <div className="card">
            <div className="card-icon">🎙️</div>
            <h3>The Dog Speaks</h3>
            <p>Your result is delivered in the voice of the breed you chose — what they'd actually tell you if they could.</p>
          </div>
          <div className="card">
            <div className="card-icon">📊</div>
            <h3>Welfare Data</h3>
            <p>Real bite incident data, shelter statistics, and breeding welfare trends — not sanitised, not spun.</p>
          </div>
        </div>
      </div>

      <div className="callout">
        <blockquote className="callout-quote">
          "A pitbull raised in a loving, trained environment is one of the most loyal dogs alive.
          A pitbull raised as a status symbol by someone who can't meet its needs is a tragedy
          waiting to happen — for the dog, not just the people around it."
        </blockquote>
      </div>

      <footer className="landing-footer">
        <span>CanineIQ — Built for <a href="https://dev.to/challenges/weekend-2026-08-13" target="_blank" rel="noreferrer">DEV Weekend Challenge: Dog Days Edition</a></span>
        <span className="footer-tech">Powered by Google AI · Snowflake</span>
      </footer>
    </div>
  );
}
