#!/usr/bin/env node
/**
 * Build the RFA Guide keyword map — shared/js/rfa-keyword-map.js.
 *
 * Generates window.RFA_KEYWORD_SYNONYMS, a large set of single-word
 * synonyms/variants that rfa-ai.js merges into its SEARCH_SYNONYMS table at
 * runtime (see the RFA_KEYWORD_MAP_READY loader there). Every entry is
 * grounded in real RFA content — either the structured knowledge base
 * (shared/js/rfa-knowledge.js) or the actual visible text of the site's own
 * HTML pages — never invented facts, since RFA Guide only ever retrieves
 * verified information and this map only affects which query words are
 * treated as equivalent when searching for it.
 *
 * Three layers, in priority order (earlier layers are never overwritten by
 * later ones):
 *   1. Curated semantic synonyms — real alternate words a visitor would use
 *      instead of RFA's own terminology, grouped by topic.
 *   2. Real single words drawn from the knowledge base and every page's
 *      visible text, each given its natural plural/singular partner.
 *   3. Bounded typo variants (one adjacent-letter swap, one interior-letter
 *      drop) of the words gathered in layer 2 — skipped whenever the typo
 *      string collides with another real word already in the vocabulary,
 *      so a typo of one real word never shadows a different real word.
 *
 * Regenerate after content changes with: node scripts/build-rfa-keyword-map.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET_TOTAL = 5000;

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9+\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Load the knowledge base (window.RFA_KNOWLEDGE) the same way a browser
// would, without a browser — sandbox a `window` stub and run the file.
// ---------------------------------------------------------------------------
function loadKnowledgeBase() {
  const src = readFileSync(path.join(ROOT, 'shared/js/rfa-knowledge.js'), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.RFA_KNOWLEDGE;
}

// ---------------------------------------------------------------------------
// Walk every page across all four sites and pull out visible text.
// ---------------------------------------------------------------------------
function listHtmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...listHtmlFiles(full));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

function visibleTextFromHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    // <small> inside .media-slot__label only ever holds the raw R2 object
    // path as a debug fallback (e.g. "nursery/joyful-early-learning-hero.jpg")
    // — a filename slug, not prose, and not something a visitor would type.
    .replace(/<small>[\s\S]*?<\/small>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#039;/g, "'")
    .replace(/&[a-z]+;/gi, ' ');
}

const SITE_DIRS = ['main', 'nurseryandprimaryschool', 'highschool', 'sixthform'];

// ---------------------------------------------------------------------------
// A broad English/site-chrome stoplist — navigation, boilerplate and
// grammatical words carry no topical signal and would just be noise here
// (rfa-ai.js's own SEARCH_STOP_WORDS covers the query side; this is the
// vocabulary-extraction side, so the list is deliberately broader).
// ---------------------------------------------------------------------------
const VOCAB_STOP_WORDS = new Set(`
a about above after again against all am an and any are aren as at back be
because been before being below between both but by can cannot could did
didn do does doesn doing don down during each few for from further had
hadn has hasn have haven having he her here hers herself him himself his
how i if in into is isn it its itself just ll me more most mustn my myself
no nor not now of off on once only or other our ours ourselves out over
own re s same she should shouldn so some such t than that the their theirs
them themselves then there these they this those through to too under
until up ve very was wasn we were weren what when where which while who
whom why will with won would wouldn you your yours yourself yourselves
also home page click here read more view learn find explore visit discover
welcome book contact us privacy policy terms rights reserved copyright
skip content menu open close toggle site navigation footer header main
section subscribe follow social media address phone email whatsapp
royalfamilyacademy assetsroyalfamilyacademyorg mediaroyalfamilyacademyorg
https http www org jpg jpeg png webp mp4 svg webm
`.trim().split(/\s+/));

function collectPageVocabulary() {
  const freq = new Map();
  for (const dir of SITE_DIRS) {
    const dirPath = path.join(ROOT, dir);
    let files = [];
    try { files = listHtmlFiles(dirPath); } catch { continue; }
    for (const file of files) {
      const text = visibleTextFromHtml(readFileSync(file, 'utf8'));
      const words = normalize(text).split(' ');
      for (const word of words) {
        if (word.length < 4 || word.length > 18) continue;
        if (VOCAB_STOP_WORDS.has(word)) continue;
        if (/\d/.test(word)) continue;
        freq.set(word, (freq.get(word) || 0) + 1);
      }
    }
  }
  return freq;
}

function collectKbVocabulary(kb) {
  const words = new Set();
  const visit = (value) => {
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (value && typeof value === 'object') { Object.values(value).forEach(visit); return; }
    if (typeof value === 'string') {
      normalize(value).split(' ').forEach((w) => {
        if (w.length >= 4 && w.length <= 18 && !VOCAB_STOP_WORDS.has(w) && !/\d/.test(w)) words.add(w);
      });
    }
  };
  visit(kb);
  return words;
}

// ---------------------------------------------------------------------------
// Layer 1 — curated semantic synonyms. Real alternate words visitors use
// instead of RFA's terminology, grouped by topic so the intent is legible.
// (Deliberately separate from the smaller set already hand-written directly
// into shared/js/rfa-ai.js's SEARCH_SYNONYMS — this layer is merged on top
// of, not instead of, that one.)
// ---------------------------------------------------------------------------
const CURATED_SYNONYMS = {
  // Admissions / enrolment
  intake: ['admission', 'admissions'], vacancy: ['admission', 'admissions'],
  vacancies: ['admission', 'admissions'], slot: ['admission', 'admissions'],
  slots: ['admission', 'admissions'], entry: ['admission', 'admissions'],
  qualify: ['eligibility', 'age', 'admission'], qualifies: ['eligibility', 'age'],
  eligible: ['eligibility', 'age', 'admission'], requirement: ['admission', 'eligibility'],
  requirements: ['admission', 'eligibility'],
  // Academics
  academics: ['curriculum', 'subjects'], academic: ['curriculum', 'subjects'],
  syllabus: ['curriculum', 'subjects'], timetable: ['schedule', 'school day'],
  lesson: ['subjects', 'curriculum'], lessons: ['subjects', 'curriculum'],
  homework: ['assignment', 'assessment'], assignment: ['homework', 'assessment'],
  assignments: ['homework', 'assessment'], exam: ['assessment', 'examination'],
  exams: ['assessment', 'examination'], examinations: ['assessment'],
  test: ['assessment', 'examination'], tests: ['assessment'],
  grades: ['grade', 'assessment', 'progress'], grading: ['assessment', 'progress'],
  report: ['progress report', 'assessment'], reports: ['progress report'],
  // Fees / money
  tuition: ['fee', 'fees'], tuitions: ['fee', 'fees'],
  charges: ['fee', 'fees'], charge: ['fee', 'fees'], billing: ['fee', 'fees'],
  invoice: ['fee', 'fees'], scholarship: ['fee', 'fees', 'admission'],
  discount: ['fee', 'fees'], installment: ['fee', 'fees'], instalment: ['fee', 'fees'],
  // Staff / leadership
  staff: ['leadership', 'teacher'], teacher: ['leadership', 'staff'],
  teachers: ['leadership', 'staff'], teaching: ['leadership', 'staff', 'curriculum'],
  headmaster: ['principal', 'head teacher'], headmistress: ['principal', 'head teacher'],
  proprietor: ['director', 'leadership'], founder: ['director', 'history'],
  administrator: ['leadership', 'principal'], administration: ['leadership'],
  management: ['leadership'], counselor: ['leadership', 'learning support'],
  counsellor: ['leadership', 'learning support'],
  // Facilities / campus
  building: ['facilities', 'campus'], buildings: ['facilities', 'campus'],
  premises: ['campus', 'facilities'], grounds: ['campus', 'facilities'],
  compound: ['campus', 'facilities'], laboratory: ['facilities', 'ict'],
  laboratories: ['facilities'], classroom: ['facilities', 'campus'],
  classrooms: ['facilities', 'campus'], hostel: ['facilities', 'campus'],
  boarding: ['facilities'], playground: ['facilities', 'sports'],
  hall: ['auditorium', 'facilities'], hospital: ['clinic', 'health'],
  infirmary: ['clinic', 'health'], washroom: ['facilities'], toilet: ['facilities'],
  // Transport
  transportation: ['transport', 'bus'], commute: ['transport', 'bus'],
  driver: ['bus', 'transport'], route: ['bus', 'transport'],
  // Uniform / appearance
  uniforms: ['uniform'], clothing: ['uniform'], attire: ['uniform'],
  haircut: ['uniform', 'policy'], grooming: ['uniform', 'policy'],
  // Safety / wellbeing
  wellbeing: ['safety', 'welfare'], welfare: ['safety', 'wellbeing'],
  security: ['safety'], protection: ['safety', 'wellbeing'],
  discipline: ['conduct', 'safety'], punishment: ['discipline', 'conduct'],
  counseling: ['learning support', 'wellbeing'], counselling: ['learning support', 'wellbeing'],
  // Activities
  extracurricular: ['clubs', 'sports', 'events'], hobbies: ['clubs', 'sports'],
  society: ['club', 'clubs'], societies: ['clubs'], team: ['sports', 'clubs'],
  teams: ['sports', 'clubs'], competition: ['sports', 'events'],
  competitions: ['sports', 'events'], tournament: ['sports', 'events'],
  festival: ['events'], celebration: ['events'], ceremony: ['events', 'graduation'],
  // Faith
  worship: ['chapel', 'christian formation'], devotion: ['chapel', 'christian formation'],
  scripture: ['bible studies', 'chapel'], sermon: ['chapel', 'christian formation'],
  // Learning support
  disability: ['learning support', 'discovery centre'],
  disabilities: ['learning support', 'discovery centre'],
  autism: ['discovery centre', 'learning support'],
  dyslexia: ['discovery centre', 'learning support'],
  therapy: ['discovery centre', 'learning support'],
  intervention: ['learning support', 'discovery centre'],
  // Communication
  whatsapp: ['contact', 'phone'], hotline: ['contact', 'phone'],
  helpline: ['contact', 'phone'], inquiry: ['contact'], inquiries: ['contact'],
  enquiry: ['contact'], enquiries: ['contact'], feedback: ['contact', 'complaint'],
  complaint: ['policy', 'contact'], complaints: ['policy', 'contact'],
  // Accreditation
  certification: ['acsi', 'accreditation'], certified: ['acsi', 'accredited'],
  recognized: ['acsi', 'accredited'], recognised: ['acsi', 'accredited'],
  approved: ['acsi', 'accredited'], standard: ['acsi', 'accreditation'],
  standards: ['acsi', 'accreditation']
};

// ---------------------------------------------------------------------------
// Morphology helpers — deliberately conservative (skip anything ambiguous)
// so a generated form is never actively wrong.
// ---------------------------------------------------------------------------
function pluralOf(word) {
  if (/[^aeiou]y$/.test(word)) return word.slice(0, -1) + 'ies';
  if (/(?:s|x|z|ch|sh)$/.test(word)) return word + 'es';
  if (/[^s]$/.test(word)) return word + 's';
  return null;
}

function singularOf(word) {
  if (/ies$/.test(word) && word.length > 4) return word.slice(0, -3) + 'y';
  if (/(?:sses|xes|ches|shes)$/.test(word)) return word.slice(0, -2);
  if (/[^s]s$/.test(word) && word.length > 4) return word.slice(0, -1);
  return null;
}

function transpositionVariants(word) {
  const out = [];
  for (let i = 1; i < word.length - 2; i += 1) {
    out.push(word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2));
  }
  return out;
}

function deletionVariants(word) {
  const out = [];
  for (let i = 1; i < word.length - 1; i += 1) {
    out.push(word.slice(0, i) + word.slice(i + 1));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Build the final map.
// ---------------------------------------------------------------------------
function build() {
  const kb = loadKnowledgeBase();
  const pageVocab = collectPageVocabulary();
  const kbVocab = collectKbVocabulary(kb);

  const masterVocab = new Set([...pageVocab.keys(), ...kbVocab]);
  const map = new Map(); // key -> Set(targets)
  const stats = { curated: 0, morphology: 0, typo: 0, skippedCollisions: 0 };

  function addEntry(key, targets, counterName) {
    const k = normalize(key);
    if (!k || k.includes(' ')) return;
    const targetList = (Array.isArray(targets) ? targets : [targets]).map(normalize).filter((t) => t && t !== k);
    if (!targetList.length) return;
    if (map.has(k)) {
      // Never let a later, lower-priority layer overwrite an existing key;
      // just skip it — the earlier layer's mapping stands.
      stats.skippedCollisions += 1;
      return;
    }
    map.set(k, targetList);
    stats[counterName] += 1;
  }

  // Layer 1 — curated semantic synonyms.
  for (const [word, targets] of Object.entries(CURATED_SYNONYMS)) addEntry(word, targets, 'curated');

  // Layer 2 — real single words (KB + every page's visible text) with their
  // natural plural/singular partner, ranked by how often they actually
  // appear on the site (most topically significant words first).
  const rankedVocab = [...masterVocab].sort((a, b) => (pageVocab.get(b) || 0) - (pageVocab.get(a) || 0));
  for (const word of rankedVocab) {
    if (map.size >= TARGET_TOTAL) break;
    const plural = pluralOf(word);
    if (plural && plural !== word) addEntry(plural, [word], 'morphology');
    const singular = singularOf(word);
    if (singular && singular !== word && singular.length >= 3) addEntry(singular, [word], 'morphology');
  }

  // Layer 3 — bounded typo variants (one adjacent-letter swap, one
  // interior-letter drop) of words length >= 6, skipped whenever the
  // generated string collides with a different real vocabulary word.
  for (const word of rankedVocab) {
    if (map.size >= TARGET_TOTAL) break;
    if (word.length < 6) continue;
    const candidates = [...transpositionVariants(word), ...deletionVariants(word)];
    for (const variant of candidates) {
      if (map.size >= TARGET_TOTAL) break;
      if (variant === word) continue;
      if (masterVocab.has(variant)) continue; // real word of its own — don't shadow it
      addEntry(variant, [word], 'typo');
    }
  }

  return { map, stats, pageWordCount: pageVocab.size, kbWordCount: kbVocab.size };
}

const { map, stats, pageWordCount, kbWordCount } = build();

const sortedEntries = [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
const obj = {};
for (const [key, targets] of sortedEntries) obj[key] = targets;

const out = `/**
 * RFA Guide keyword map — GENERATED by scripts/build-rfa-keyword-map.mjs.
 * Do not hand-edit; re-run the script after knowledge-base or page content
 * changes. Merged into rfa-ai.js's SEARCH_SYNONYMS at runtime.
 *
 * ${sortedEntries.length} entries: ${stats.curated} curated semantic synonyms,
 * ${stats.morphology} plural/singular forms, ${stats.typo} bounded typo variants,
 * drawn from ${kbWordCount} knowledge-base words and ${pageWordCount} distinct
 * words across every page of all four Royal Family Academy sites.
 */
window.RFA_KEYWORD_SYNONYMS = ${JSON.stringify(obj, null, 2)};
`;

writeFileSync(path.join(ROOT, 'shared/js/rfa-keyword-map.js'), out);

console.log(`Wrote shared/js/rfa-keyword-map.js — ${sortedEntries.length} entries`);
console.log(`  curated semantic synonyms: ${stats.curated}`);
console.log(`  plural/singular forms:     ${stats.morphology}`);
console.log(`  bounded typo variants:     ${stats.typo}`);
console.log(`  skipped (key collisions):  ${stats.skippedCollisions}`);
console.log(`  source vocabulary: ${kbWordCount} KB words, ${pageWordCount} page words`);
