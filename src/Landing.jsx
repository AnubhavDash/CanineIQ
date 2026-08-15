import React from 'react';
import './Landing.css';

export default function Landing({ onStartAssessment, onBreedHealth }) {
  return (
    <main className="landing">
      <nav className="landing-nav" aria-label="Main navigation">
        <span className="logo">Canine<span className="logo-accent">IQ</span></span>
        <div className="nav-links"><button className="nav-link" onClick={onBreedHealth}>Breed health</button><button className="btn-primary" onClick={onStartAssessment}>Begin the assessment</button></div>
      </nav>
      <section className="hero">
        <div className="hero-copy"><div className="hero-eyebrow section-label">A welfare intervention, not a personality quiz</div><h1 className="hero-title">Want the dog.<br /><em>Ready for the life?</em></h1><p className="hero-sub">The dog you picture is a moment. The responsibility is every morning after. CanineIQ asks the questions most people avoid before a powerful, active, or deliberately bred dog pays the price.</p><div className="hero-actions"><button className="btn-primary btn-large" onClick={onStartAssessment}>Find out before you commit <span aria-hidden="true">↗</span></button><button className="btn-ghost" onClick={onBreedHealth}>See the health costs</button></div></div><div className="hero-dog"><img src="/images/pitbull.jpg" alt="Pit bull looking directly at the camera" /><div className="hero-dog-caption"><span>THE BREED IS NOT THE PROBLEM</span><strong>Your choices are part of the contract.</strong></div></div></section>
      <section className="manifesto"><p className="section-label">The uncomfortable premise</p><blockquote>“A dog is not a costume, a security system, or proof of your personality. If you choose a status breed, you are choosing the work that keeps everyone safe — especially the dog.”</blockquote></section>
      <section className="stats-bar"><div className="stat"><span className="stat-num">8</span><span className="stat-label">questions about the life you can actually provide</span></div><div className="stat-divider" /><div className="stat"><span className="stat-num">1</span><span className="stat-label">honest result, delivered without a sales pitch</span></div><div className="stat-divider" /><div className="stat"><span className="stat-num">0</span><span className="stat-label">excuses accepted on the dog’s behalf</span></div></section>
      <section className="cards-section"><div className="section-label">What this experience exposes</div><div className="cards-grid"><article className="card"><span className="card-index">01</span><h3>The life behind the image</h3><p>Time, containment, training, children, money, and the patience to repeat the basics long after the novelty disappears.</p></article><article className="card"><span className="card-index">02</span><h3>The truth behind the breed</h3><p>Genetic health burdens and behavioural responsibilities explained plainly, without turning suffering into a selling point.</p></article><article className="card"><span className="card-index">03</span><h3>A voice you cannot dismiss</h3><p>Your result is written from the dog’s point of view. Read it. Then hear what your decision sounds like to them.</p></article><article className="card"><span className="card-index">04</span><h3>A better decision</h3><p>Ready, caution, or not yet. The kindest answer is sometimes to wait, learn, or choose a different life together.</p></article></div></section>
      <footer className="landing-footer"><span>CanineIQ — built for <a href="https://dev.to/challenges/weekend-2026-08-13" target="_blank" rel="noreferrer">DEV Weekend Challenge: Dog Days Edition</a></span><span className="footer-tech">Gemini-assisted welfare assessment</span></footer>
    </main>
  );
}
