import React, { useState } from 'react';
import './BreedHealth.css';

const HEALTH_BREEDS = [
  {
    id: 'french_bulldog',
    name: 'French Bulldog',
    condition: 'Airway + heat intolerance',
    conditionFull: 'Brachycephalic Obstructive Airway Syndrome (BOAS)',
    severity: 'critical',
    popularityRank: 1,
    tag: 'Shortened skulls can make ordinary breathing and cooling harder',
  },
  {
    id: 'pug',
    name: 'Pug',
    emoji: '🐽',
    condition: 'BOAS + Eye Prolapse',
    conditionFull: 'Brachycephalic Obstructive Airway Syndrome + Corneal Ulceration',
    severity: 'critical',
    popularityRank: 38,
    tag: 'Highest BOAS prevalence of any breed (~65%) — and top eye-injury risk',
  },
  {
    id: 'english_bulldog',
    name: 'English Bulldog',
    emoji: '🐕',
    condition: 'BOAS + Hip Dysplasia',
    conditionFull: 'Brachycephalic Airway Syndrome + Orthopedic Disease',
    severity: 'critical',
    popularityRank: 10,
    tag: '~80–90% of litters require C-section',
  },
  {
    id: 'dachshund',
    name: 'Dachshund',
    emoji: '🌭',
    condition: 'IVDD',
    conditionFull: 'Intervertebral Disc Disease',
    severity: 'high',
    popularityRank: 5,
    tag: 'Highest lifetime disc-disease risk of any breed (~15–25%)',
  },
  {
    id: 'german_shepherd',
    name: 'German Shepherd',
    emoji: '🦮',
    condition: 'Hip & Elbow Dysplasia',
    conditionFull: 'Degenerative Hip/Elbow Joint Disease',
    severity: 'high',
    popularityRank: 4,
    tag: 'Hip dysplasia in ~1 in 5 screened dogs; elbow ~1 in 6',
  },
  {
    id: 'cavalier',
    name: 'Cavalier King Charles Spaniel',
    emoji: '🐶',
    condition: 'CKCS-MVD + SM',
    conditionFull: 'Mitral Valve Disease + Syringomyelia (skull too small for brain)',
    severity: 'critical',
    popularityRank: 12,
    tag: 'Brain crowding (CM) endemic — SM fluid cavities in up to ~40–70%',
  },
  {
    id: 'great_dane',
    name: 'Great Dane',
    emoji: '🐕‍🦺',
    condition: 'Bloat + DCM',
    conditionFull: 'Gastric Dilatation-Volvulus + Dilated Cardiomyopathy',
    severity: 'high',
    popularityRank: 22,
    tag: 'Bred to maximum size — median lifespan ~6–6.5 years (some reach 10+)',
  },
  {
    id: 'boxer',
    name: 'Boxer',
    emoji: '🥊',
    condition: 'BOAS + Heart Disease',
    conditionFull: 'Brachycephalic Airway + Aortic Stenosis',
    severity: 'high',
    popularityRank: 18,
    tag: 'Documented lymphoma & mast-cell tumour risk; aortic stenosis ~13–18%',
  },
];

const SEV_CONFIG = {
  critical: { color: '#C0392B', label: 'Critical', bg: 'rgba(192,57,43,0.1)' },
  high: { color: '#E67E22', label: 'High Risk', bg: 'rgba(230,126,34,0.1)' },
  medium: { color: '#E8A847', label: 'Moderate', bg: 'rgba(232,168,71,0.1)' },
};

const CURATED_DETAILS = {
  french_bulldog: { overview: 'The French Bulldog’s compact skull and narrowed upper airway were selected for a particular appearance. The result is not just snoring: some dogs must work harder to breathe, cool themselves, sleep, and exercise.', whatItFeelsLike: 'A short walk, warm room, or excited greeting can become a breathing problem. Watch for noisy breathing, open-mouth breathing, blue-tinged gums, collapse, or a long recovery after activity.', surgeryRate: 'Varies by airway severity', lifeExpectancy: 'About 10–12 years', whatBreedersWontTellYou: 'A quiet puppy is not proof of a healthy airway. Symptoms can worsen with age, weight gain, heat, and stress.', isItEthicalToBuy: 'Only with health-first breeding, independent veterinary screening, and a realistic budget for airway and spinal care.', healthierAlternative: 'Boston Terrier from health-tested lines, or a mixed-breed companion with an open airway' },
  pug: { overview: 'The Pug’s shortened face, crowded teeth, prominent eyes, and compact spine are linked to a look people find appealing. Those traits can affect breathing, temperature control, eye protection, skin, and movement.', whatItFeelsLike: 'Heat and exertion can quickly become distressing. Eye injuries, skin-fold infections, and airway obstruction are not cosmetic inconveniences; they can require lifelong management.', surgeryRate: 'Varies by airway severity', lifeExpectancy: 'About 11–13 years', whatBreedersWontTellYou: 'A dramatic snort is not a personality trait. But many affected Pugs show no respiratory signs at rest — airway disease is best assessed with an exercise-tolerance test, not by how quiet the dog is.', isItEthicalToBuy: 'Only when the breeder selects for function, documents health testing, and never treats severe breathing as normal.', healthierAlternative: 'A healthier small companion with an open muzzle and moderate build' },
  english_bulldog: { overview: 'The modern English Bulldog combines a compressed airway, heavy body, narrow pelvis, and joint strain. The silhouette is recognisable because generations of selection made extreme proportions the selling point.', whatItFeelsLike: 'Standing, walking, breathing, mating, and giving birth can all require human intervention. Heat, obesity, and stairs can turn everyday life into a medical problem.', surgeryRate: '~80–90% of litters require C-section', lifeExpectancy: 'About 8–10 years', whatBreedersWontTellYou: 'The puppy price is only the entry cost. Insurance exclusions, emergency care, and weight management can define the dog’s life.', isItEthicalToBuy: 'Only if health and natural function come before the show-ring look, with a plan for expensive care.', healthierAlternative: 'A moderate-built bulldog-type rescue or a healthier companion breed' },
  dachshund: { overview: 'The Dachshund’s long back and short legs were selected for underground hunting. That working shape is useful, but it also creates a mechanical vulnerability that owners must manage every day.', whatItFeelsLike: 'A disc injury can mean sudden pain, weakness, loss of bladder control, or paralysis. Jumping off furniture and carrying excess weight can increase the strain on the spine.', surgeryRate: 'IVDD treatment ranges from rest to urgent surgery', lifeExpectancy: 'About 12–16 years', whatBreedersWontTellYou: 'A lively dog can still have a fragile back. Prevention is not optional once you bring the body shape home.', isItEthicalToBuy: 'Yes, when the owner accepts strict weight, stair, jumping, and veterinary-management responsibilities.', healthierAlternative: 'A moderate-bodied small hound or mixed breed with similar curiosity' },
  german_shepherd: { overview: 'German Shepherds are intelligent working dogs, but breeding priorities can exaggerate rear angulation, size, and joint loading. Good lines still need documented hip, elbow, temperament, and working-function screening.', whatItFeelsLike: 'Joint disease can make a young, eager dog reluctant to rise, climb, run, or work. Anxiety and poor nerve stability can be as damaging to a household as orthopedic pain.', surgeryRate: 'Joint care may involve lifelong medication or surgery', lifeExpectancy: 'About 10–13 years', whatBreedersWontTellYou: 'A pedigree is not a health guarantee. Ask for verifiable testing and watch the adults move, recover, and behave. Hip and elbow disease are multifactorial and polygenic — no conformation feature has been proven to cause joint degeneration.', isItEthicalToBuy: 'Yes, when chosen for stable temperament and sound movement rather than exaggerated appearance.', healthierAlternative: 'A working-line dog or mixed breed selected for stable nerves and moderate structure' },
  cavalier: { overview: 'Cavalier King Charles Spaniels can inherit early mitral valve disease and a skull shape associated with Chiari-like malformation and syringomyelia. Their affectionate temperament should not obscure the medical burden some lines carry.', whatItFeelsLike: 'Heart disease can reduce stamina and cause coughing or collapse. Neurological pain may show as scratching, sensitivity around the neck, or reluctance to move.', surgeryRate: 'Cardiac monitoring and medication are common in affected dogs', lifeExpectancy: 'About 10–14 years', whatBreedersWontTellYou: 'A sweet personality does not make inherited disease less painful. Breeding decisions determine how much of that burden is passed on.', isItEthicalToBuy: 'Only from breeders following current heart and neurological screening guidance, with funds for lifelong cardiology care.', healthierAlternative: 'A health-tested small companion with a less extreme skull and heart profile' },
  great_dane: { overview: 'Great Danes pay for extreme size with accelerated growth, joint stress, and a serious risk of gastric dilatation-volvulus. Their scale changes the cost, space, food, and emergency planning required from the owner.', whatItFeelsLike: 'A twisted stomach is a life-threatening emergency measured in hours. Growing bones and a large frame also make flooring, exercise, nutrition, and pain management consequential.', surgeryRate: 'Emergency bloat surgery can be lifesaving', lifeExpectancy: 'About 7–10 years', whatBreedersWontTellYou: 'The giant puppy becomes a giant medical and logistical commitment very quickly. A home that fits a puppy may not fit an adult. Primary-care studies put the median lifespan closer to 6 years.', isItEthicalToBuy: 'Yes, if the household can provide space, preventive care, emergency funds, and a breeder who prioritises longevity.', healthierAlternative: 'A large but more moderate mixed breed with a longer expected lifespan' },
  boxer: { overview: 'Boxers are athletic, expressive dogs, but the breed has elevated concern around heart disease, certain cancers, and heat tolerance. Health screening and family longevity matter more than a fashionable head or pedigree.', whatItFeelsLike: 'Arrhythmias may be silent until a dog faints or collapses. Cancer can arrive early, making routine checks, insurance, and emotionally difficult decisions part of ownership.', surgeryRate: 'Cardiac screening and oncology care may be needed', lifeExpectancy: 'About 10–12 years', whatBreedersWontTellYou: 'A playful puppy can carry risks that only show later. Ask for real family health history, not just a registration certificate. Boxer cardiomyopathy (ARVC) is a documented breed concern alongside aortic stenosis.', isItEthicalToBuy: 'Yes, when selecting for soundness and longevity and preparing for serious veterinary costs.', healthierAlternative: 'A health-tested moderate athletic mixed breed with documented family longevity' },
};

const DEMO_DETAIL = (breed) => ({ breed, ...(breed.profile || CURATED_DETAILS[breed.id] || { overview: `Research the inherited conditions associated with ${breed.name} before choosing one.`, whatItFeelsLike: 'The impact varies by individual dog and should be assessed with a veterinarian.', surgeryRate: 'Depends on individual health', lifeExpectancy: 'Varies by line and care', whatBreedersWontTellYou: 'Ask for documented health testing and adult-dog outcomes.', isItEthicalToBuy: 'Only when health, function, and lifelong care are prioritised.', healthierAlternative: 'A healthier mixed-breed companion selected for compatible temperament' }) });

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

    try {
      await new Promise(r => setTimeout(r, 450));
      const parsed = DEMO_DETAIL(breed);
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
          Breed health is not a morality score. It is a record of what humans selected for, what the dog may live with, and what an owner must be prepared to manage. Select a breed for its own documented profile—not a generic warning.
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
                <span className="bh-index">{String(HEALTH_BREEDS.indexOf(b) + 1).padStart(2, '0')}</span>
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
              <div className="ph-icon" aria-hidden="true">+</div>
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
                <span className="detail-index" aria-hidden="true">{String(HEALTH_BREEDS.findIndex((item) => item.id === detail.breed.id) + 1).padStart(2, '0')}</span>
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
                  What breeders won't tell you
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

      <footer className="bh-sources">
        <div className="section-label">Sources</div>
        <p>Breed health information is drawn from public veterinary and welfare sources, including the Orthopedic Foundation for Animals (OFA), the AKC Canine Health Foundation, The Kennel Club (UK) health schemes, RSPCA brachycephalic guidance, University of Cambridge veterinary research (including the Respiratory Function Grading scheme for BOAS), peer-reviewed studies in PLOS ONE and the journal Canine Medicine and Genetics, and primary-care epidemiology (UK VetCompass). Popularity ranks reflect AKC registration statistics (2025). Figures are shown as qualitative ranges — inherited-disease risk is line-specific — so confirm details with a veterinarian and the breeder's health-testing documentation before choosing.</p>
        <ul>
          <li><a href="https://www.ofa.org/" target="_blank" rel="noreferrer">Orthopedic Foundation for Animals (OFA)</a></li>
          <li><a href="https://www.akcchf.org/" target="_blank" rel="noreferrer">AKC Canine Health Foundation</a></li>
          <li><a href="https://www.thekennelclub.org.uk/health/" target="_blank" rel="noreferrer">The Kennel Club (UK) — Health</a></li>
          <li><a href="https://www.rspca.org.uk/adviceandwelfare/pets/dogs/health/brachycephalic" target="_blank" rel="noreferrer">RSPCA — Brachycephalic dogs</a></li>
          <li><a href="https://www.vet.cam.ac.uk/boas/" target="_blank" rel="noreferrer">University of Cambridge — BOAS / Respiratory Function Grading</a></li>
          <li><a href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0181928" target="_blank" rel="noreferrer">Liu et al., PLOS ONE — BOAS grading in brachycephalic breeds</a></li>
          <li><a href="https://link.springer.com/article/10.1186/s40575-022-00117-6" target="_blank" rel="noreferrer">Canine Medicine and Genetics — Pug disorders (VetCompass)</a></li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/20136998/" target="_blank" rel="noreferrer">Evans & Adams 2010 — C-section rates in bulldogs</a></li>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/22882627/" target="_blank" rel="noreferrer">Stephenson et al. 2012 — Great Dane DCM screening</a></li>
          <li><a href="https://link.springer.com/article/10.1186/s40575-016-0039-8" target="_blank" rel="noreferrer">Canine Medicine and Genetics — Dachshund IVDD prevalence</a></li>
          <li><a href="https://www.akc.org/expert-advice/news/most-popular-dog-breeds-2023/" target="_blank" rel="noreferrer">AKC — Most popular breeds (registration statistics)</a></li>
        </ul>
      </footer>
    </div>
  );
}
