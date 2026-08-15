import React, { useState, useCallback } from 'react';
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

const HASH_TO_VIEW = {
  '#/': VIEWS.LANDING,
  '#/assessment': VIEWS.ASSESSMENT,
  '#/results': VIEWS.RESULTS,
  '#/health': VIEWS.BREED_HEALTH,
};

const VIEW_TO_HASH = {
  [VIEWS.LANDING]: '#/',
  [VIEWS.ASSESSMENT]: '#/assessment',
  [VIEWS.RESULTS]: '#/results',
  [VIEWS.BREED_HEALTH]: '#/health',
};

const RESULTS_KEY = 'canineiq_results';

function loadResults() {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (!raw) return { results: null, data: null };
    const saved = JSON.parse(raw);
    return { results: saved?.results || null, data: saved?.data || null };
  } catch { return { results: null, data: null }; }
}

export default function App() {
  const [view, setView] = useState(() => HASH_TO_VIEW[window.location.hash] || VIEWS.LANDING);
  const [assessmentData, setAssessmentData] = useState(() => loadResults().data);
  const [results, setResults] = useState(() => loadResults().results);

  const navigate = useCallback((next) => {
    setView(next);
    const hash = VIEW_TO_HASH[next];
    if (window.location.hash !== hash) window.location.hash = hash;
  }, []);

  useEffect(() => {
    const onHash = () => {
      const next = HASH_TO_VIEW[window.location.hash] || VIEWS.LANDING;
      setView((current) => (current === next ? current : next));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const noResultsData = view === VIEWS.RESULTS && (!results || !assessmentData);

  return (
    <div className="app">
      {(view === VIEWS.LANDING || noResultsData) && (
        <Landing
          onStartAssessment={() => navigate(VIEWS.ASSESSMENT)}
          onBreedHealth={() => navigate(VIEWS.BREED_HEALTH)}
        />
      )}
      {view === VIEWS.ASSESSMENT && !noResultsData && (
        <Assessment
          onComplete={(data, res) => {
            setAssessmentData(data);
            setResults(res);
            try { localStorage.setItem(RESULTS_KEY, JSON.stringify({ data, results: res })); } catch { /* noop */ }
            navigate(VIEWS.RESULTS);
          }}
          onBack={() => navigate(VIEWS.LANDING)}
        />
      )}
      {view === VIEWS.RESULTS && !noResultsData && (
        <Results
          data={assessmentData}
          results={results}
          onRetake={() => navigate(VIEWS.ASSESSMENT)}
          onHome={() => {
            try { localStorage.removeItem(RESULTS_KEY); } catch { /* noop */ }
            setResults(null);
            setAssessmentData(null);
            navigate(VIEWS.LANDING);
          }}
        />
      )}
      {view === VIEWS.BREED_HEALTH && (
        <BreedHealth onBack={() => navigate(VIEWS.LANDING)} />
      )}
    </div>
  );
}