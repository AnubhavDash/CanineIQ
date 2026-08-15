import React, { useState } from 'react';
import Landing from './Landing.jsx';
import Assessment from './Assessment.jsx';
import Results from './Results.jsx';
import BreedHealth from './BreedHealth.jsx';
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
