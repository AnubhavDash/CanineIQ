import React, { useState } from 'react';
import Landing from './components/Landing';
import Assessment from './components/Assessment';
import Results from './components/Results';
import BreedHealth from './components/BreedHealth';
import './App.css';

export const VIEWS = {
  LANDING: 'landing',
  ASSESSMENT: 'assessment',
  RESULTS: 'results',
  BREED_HEALTH: 'breed_health',
};

export default function App() {
  const [view, setView] = useState(VIEWS.LANDING);
  const [assessmentData, setAssessmentData] = useState(null);
  const [results, setResults] = useState(null);

  return (
    <div className="app">
      {view === VIEWS.LANDING && (
        <Landing
          onStartAssessment={() => setView(VIEWS.ASSESSMENT)}
          onBreedHealth={() => setView(VIEWS.BREED_HEALTH)}
        />
      )}
      {view === VIEWS.ASSESSMENT && (
        <Assessment
          onComplete={(data, res) => {
            setAssessmentData(data);
            setResults(res);
            setView(VIEWS.RESULTS);
          }}
          onBack={() => setView(VIEWS.LANDING)}
        />
      )}
      {view === VIEWS.RESULTS && (
        <Results
          data={assessmentData}
          results={results}
          onRetake={() => setView(VIEWS.ASSESSMENT)}
          onHome={() => setView(VIEWS.LANDING)}
        />
      )}
      {view === VIEWS.BREED_HEALTH && (
        <BreedHealth onBack={() => setView(VIEWS.LANDING)} />
      )}
    </div>
  );
}
