import BREED_TRAITS from './breedTraits.js';

const DEFAULT_TRAITS = { energy: 2, apartmentFriendly: 1, fragility: 0, grooming: 2, healthCost: 2, kidTolerance: 1, trainability: 2, hardMode: 0 };

function traitOf(breedId, key) {
  return (BREED_TRAITS[breedId] || DEFAULT_TRAITS)[key];
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function idxOf(question, answer) {
  const index = (question.options || []).indexOf(answer);
  return index < 0 ? 2 : index;
}

function pointsFor(question, answer, breedId) {
  const idx = idxOf(question, answer);
  const energy = traitOf(breedId, 'energy');
  const apartmentFriendly = traitOf(breedId, 'apartmentFriendly');
  const fragile = traitOf(breedId, 'fragility');
  const grooming = traitOf(breedId, 'grooming');
  const healthCost = traitOf(breedId, 'healthCost');
  const kidTolerance = traitOf(breedId, 'kidTolerance');
  const trainability = traitOf(breedId, 'trainability');
  const hardMode = traitOf(breedId, 'hardMode');
  const highMaintenance = grooming >= 3 || healthCost >= 3;

  switch (question.id) {
    case 'living': {
      if (apartmentFriendly) return [50, 70, 85, 100][idx];
      return [0, 20, 85, 100][idx];
    }
    case 'experience': {
      const base = [0, 33, 67, 100];
      if (hardMode && idx === 1) return 20;
      return base[idx];
    }
    case 'time': {
      if (energy === 3) return [0, 20, 60, 100][idx];
      if (energy === 1) return [0, 40, 80, 100][idx];
      return [0, 33, 67, 100][idx];
    }
    case 'training': {
      if (trainability === 3) return [0, 15, 60, 100][idx];
      if (trainability === 2) return [0, 25, 67, 100][idx];
      return [0, 33, 67, 100][idx];
    }
    case 'children': {
      if (idx === 3) return 100;
      if (idx === 2) return kidTolerance >= 2 ? 60 : 50;
      if (idx === 1) return hardMode || energy >= 3 ? 10 : 25;
      if (fragile) return 0;
      if (kidTolerance >= 2) return 25;
      if (kidTolerance >= 1) return 15;
      if (kidTolerance === 0) return 5;
      return 0;
    }
    case 'budget': {
      if (healthCost === 3) return [0, 15, 60, 100][idx];
      if (healthCost === 1) return [0, 40, 80, 100][idx];
      return [0, 33, 67, 100][idx];
    }
    case 'reason': {
      if (idx === 3) return 100;
      if (idx === 2) return 67;
      if (idx === 1) return hardMode ? 33 : 15;
      return highMaintenance ? 0 : 10;
    }
    case 'stress': {
      if (energy === 3) return [0, 20, 60, 100][idx];
      if (energy === 1) return [0, 40, 80, 100][idx];
      return [0, 33, 67, 100][idx];
    }
    default:
      return [0, 33, 67, 100][idx];
  }
}

function levelFor(points) {
  if (points >= 67) return 'LOW';
  if (points >= 33) return 'WATCH';
  return 'ACTION';
}

export function computeScore(breed, questions) {
  const findings = questions.map((question) => {
    const points = pointsFor(question, question.answer, breed.id);
    return {
      question: question.question,
      points,
      concernLevel: levelFor(points),
    };
  });

  const total = findings.reduce((sum, f) => sum + f.points, 0);
  const score = clamp(total / findings.length);
  const recommendation = score >= 70 ? 'READY' : score >= 40 ? 'CAUTION' : 'NOT_READY';

  return { score, recommendation, findings };
}