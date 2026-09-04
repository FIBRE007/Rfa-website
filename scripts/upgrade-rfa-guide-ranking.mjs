import fs from 'node:fs';

const AI_PATH = 'shared/js/rfa-ai.js';
const MARKER = 'RFA Guide multi-keyword ranking v1';

let source = fs.readFileSync(AI_PATH, 'utf8');
let changed = false;

if (!source.includes(MARKER)) {
  const searchStart = source.indexOf('  // RFA Guide confidence guard v2:');
  const searchEnd = source.indexOf('\n  function findAgeEntry(q) {', searchStart);
  if (searchStart < 0 || searchEnd < 0) throw new Error('Could not find RFA Guide website search block.');

  const rankingSearch = String.raw`  // RFA Guide confidence guard v2 + ${MARKER}: rank website evidence by the
  // combination of meaningful query terms, phrases, school/class context and coverage.
  const SEARCH_RANKING_SYNONYMS = {
    subject: ['subjects', 'curriculum', 'course', 'courses'],
    subjects: ['subject', 'curriculum', 'course', 'courses'],
    curriculum: ['subjects', 'subject', 'courses'],
    admission: ['admissions', 'application', 'apply', 'enrol', 'enroll', 'registration'],
    admissions: ['admission', 'application', 'apply', 'enrol', 'enroll', 'registration'],
    fees: ['fee', 'tuition', 'cost'],
    fee: ['fees', 'tuition', 'cost'],
    principal: ['head', 'leadership'],
    director: ['leadership', 'head'],
    leadership: ['leader', 'principal', 'director'],
    facility: ['facilities', 'campus'],
    facilities: ['facility', 'campus'],
    transport: ['bus', 'route', 'routes'],
    bus: ['transport', 'route', 'routes'],
    offered: ['available', 'listed'],
    available: ['offered', 'listed']
  };

  const SEARCH_HIGH_VALUE_TERMS = new Set([
    'subjects', 'subject', 'curriculum', 'admission', 'admissions', 'age', 'fees', 'fee',
    'leadership', 'principal', 'director', 'consultant', 'chaplain', 'facilities', 'facility',
    'campus', 'safety', 'transport', 'bus', 'uniform', 'clubs', 'sports', 'history', 'mission',
    'vision', 'contact', 'address', 'assessment', 'programme', 'programmes'
  ]);

  const SEARCH_LOW_VALUE_TERMS = new Set([
    'offered', 'available', 'listed', 'have', 'has', 'give', 'provide', 'provided', 'show', 'shown'
  ]);

  function searchTermWeight(token) {
    if (SEARCH_HIGH_VALUE_TERMS.has(token)) return 2.5;
    if (SEARCH_LOW_VALUE_TERMS.has(token)) return 0.45;
    if (/^(?:jh|jhs|js|jss|sh|shs|ss|sss)[123]$/.test(token)) return 3;
    if (/^(?:junior|senior)$/.test(token)) return 1.7;
    return 1;
  }

  function searchVariants(token) {
    return Array.from(new Set(
      [token]
        .concat(tokenVariants(token) || [])
        .concat(SEARCH_RANKING_SYNONYMS[token] || [])
        .map((item) => normalize(item))
        .filter(Boolean)
    ));
  }

  function searchableText(value) {
    return ' ' + normalize(value).replace(/[-']/g, ' ') + ' ';
  }

  function containsSearchTerm(haystack, needle) {
    const term = normalize(needle).replace(/[-']/g, ' ').trim();
    if (!term) return false;
    return searchableText(haystack).includes(' ' + term + ' ');
  }

  function buildSearchProfile(q) {
    const normalizedQuery = normalize(q);
    const tokens = Array.from(new Set(searchTokens(normalizedQuery)));
    const phrases = [];
    const addPhrase = (value, weight) => {
      const phrase = normalize(value);
      if (!phrase || phrases.some((item) => item.text === phrase)) return;
      phrases.push({ text: phrase, weight });
    };

    let level = null;
    if (/\b(?:jh\s*[123]|jhs\s*[123]|js\s*[123]|jss\s*[123]|junior high|junior secondary)\b/.test(normalizedQuery)) {
      level = 'junior high';
      addPhrase('junior high', 2.4);
    } else if (/\b(?:sh\s*[123]|shs\s*[123]|ss\s*[123]|sss\s*[123]|senior high|senior secondary)\b/.test(normalizedQuery)) {
      level = 'senior high';
      addPhrase('senior high', 2.4);
    }

    if (/\bhigh school\b/.test(normalizedQuery)) addPhrase('high school', 2.2);
    if (/\bnursery(?: and| &) primary\b|\bnursery\b|\bprimary\b/.test(normalizedQuery)) addPhrase('nursery primary', 1.6);
    if (/\bsixth form\b|\bsixthform\b/.test(normalizedQuery)) addPhrase('sixth form', 2.2);

    const subjectIntent = /\b(subject|subjects|curriculum|course|courses|teach|teaching)\b/.test(normalizedQuery);
    const admissionIntent = /\b(admission|admissions|application|apply|enrol|enroll|registration|register|assessment|onboarding)\b/.test(normalizedQuery);
    const leadershipIntent = /\b(leadership|principal|director|consultant|chaplain|head teacher|vice principal)\b/.test(normalizedQuery);

    if (subjectIntent && level) addPhrase(level + ' subjects', 3.6);
    if (subjectIntent) addPhrase('subjects curriculum', 2.2);
    if (admissionIntent) addPhrase('admissions', 2.4);
    if (leadershipIntent) addPhrase('leadership', 2.5);

    // Add two- and three-term combinations. Exact combinations are stronger
    // evidence than isolated words when a visitor asks a longer question.
    if (tokens.length >= 3) {
      for (let size = 2; size <= 3; size += 1) {
        for (let i = 0; i <= tokens.length - size; i += 1) {
          const group = tokens.slice(i, i + size);
          if (group.every((token) => SEARCH_LOW_VALUE_TERMS.has(token))) continue;
          addPhrase(group.join(' '), size === 3 ? 2.1 : 1.25);
        }
      }
    }

    const weightedTokens = tokens.map((token) => ({ token, weight: searchTermWeight(token) }));
    const totalWeight = weightedTokens.reduce((sum, item) => sum + item.weight, 0) || 1;
    return { normalizedQuery, weightedTokens, totalWeight, phrases };
  }

  function websiteIndexAnswer(q, requestedSchool) {
    const index = window.RFA_SITE_INDEX && Array.isArray(window.RFA_SITE_INDEX.entries)
      ? window.RFA_SITE_INDEX.entries
      : [];
    if (!index.length) return null;

    const profile = buildSearchProfile(q);
    const tokens = profile.weightedTokens;
    if (!tokens.length) return null;
    if (tokens.length === 1 && tokens[0].token.length < 4) return null;

    const candidates = index.filter((entry) => {
      if (!requestedSchool) return true;
      return entry.site === requestedSchool || entry.site === 'main';
    });

    const scored = candidates.map((entry) => {
      const heading = entry.heading || '';
      const page = entry.page || '';
      const text = entry.text || '';
      const path = entry.path || '';
      let score = 0;
      let matchedWeight = 0;
      let matchedTerms = 0;
      let phraseMatches = 0;

      tokens.forEach(({ token, weight }) => {
        const variants = searchVariants(token);
        let fieldScore = 0;
        variants.forEach((variant) => {
          if (containsSearchTerm(heading, variant)) fieldScore = Math.max(fieldScore, 20);
          if (containsSearchTerm(page, variant)) fieldScore = Math.max(fieldScore, 12);
          if (containsSearchTerm(text, variant)) fieldScore = Math.max(fieldScore, 5);
          if (containsSearchTerm(path, variant)) fieldScore = Math.max(fieldScore, 3);
        });
        if (fieldScore > 0) {
          matchedTerms += 1;
          matchedWeight += weight;
          score += fieldScore * weight;
        }
      });

      profile.phrases.forEach((phrase) => {
        let phraseScore = 0;
        if (containsSearchTerm(heading, phrase.text)) phraseScore = 34;
        else if (containsSearchTerm(page, phrase.text)) phraseScore = 24;
        else if (containsSearchTerm(text, phrase.text)) phraseScore = 14;
        else if (containsSearchTerm(path, phrase.text)) phraseScore = 8;
        if (phraseScore > 0) {
          phraseMatches += 1;
          score += phraseScore * phrase.weight;
        }
      });

      const coverage = matchedWeight / profile.totalWeight;
      score += coverage * 32;
      if (matchedTerms >= 2) score += 8;
      if (matchedTerms >= 3) score += 10;
      if (phraseMatches >= 1) score += 8;
      if (phraseMatches >= 2) score += 8;
      if (requestedSchool && entry.site === requestedSchool) score += 14;

      const requiredCoverage = tokens.length >= 4 ? 0.48 : tokens.length === 3 ? 0.52 : tokens.length === 2 ? 0.6 : 1;
      if (coverage < requiredCoverage && phraseMatches === 0) score = 0;
      if (tokens.length >= 3 && matchedTerms < 2 && phraseMatches === 0) score = 0;

      if (tokens.length === 1) {
        const variants = searchVariants(tokens[0].token);
        const strongSingleMatch = variants.some((variant) => containsSearchTerm(heading, variant) || containsSearchTerm(page, variant));
        if (!strongSingleMatch) score = 0;
      }

      return { entry, score, matchedTerms, matchedWeight, coverage, phraseMatches };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);

    const minimumScore = tokens.length === 1 ? 28 : tokens.length === 2 ? 38 : 46;
    if (!scored.length || scored[0].score < minimumScore) return null;

    const best = scored[0];
    const secondPage = scored.find((item) => item.entry.url !== best.entry.url);
    if (secondPage) {
      const requiredMargin = Math.max(10, best.score * 0.11);
      if (best.score - secondPage.score < requiredMargin) return null;
    }

    const related = scored
      .filter((item) => item.entry.url === best.entry.url)
      .slice(0, 6);

    const pieces = [];
    related.forEach((item) => {
      const value = String(item.entry.text || '').trim();
      if (!value || pieces.includes(value)) return;
      const normalizedValue = normalize(value);
      let pieceWeight = 0;
      tokens.forEach(({ token, weight }) => {
        if (searchVariants(token).some((variant) => containsSearchTerm(normalizedValue, variant))) pieceWeight += weight;
      });
      const pieceCoverage = pieceWeight / profile.totalWeight;
      const phraseHit = profile.phrases.some((phrase) => containsSearchTerm(normalizedValue, phrase.text));
      if (pieceCoverage >= 0.34 || phraseHit) pieces.push(value);
    });

    if (!pieces.length) return null;
    let text = pieces.slice(0, 3).join(' ').replace(/\s+/g, ' ').trim();
    if (!text) return null;
    if (text.length > 1000) {
      const cut = text.lastIndexOf('. ', 1000);
      text = text.slice(0, cut > 500 ? cut + 1 : 1000).trim() + '…';
    }

    const heading = best.entry.heading || best.entry.page || 'RFA website information';
    return '<strong>' + escapeHtml(heading) + '</strong><br>' + escapeHtml(text) + '<br>' + pageLink(best.entry.url, 'View this on the RFA website');
  }
`;

  source = source.slice(0, searchStart) + rankingSearch + source.slice(searchEnd);
  fs.writeFileSync(AI_PATH, source, 'utf8');
  changed = true;
}

if (!source.includes(MARKER)) throw new Error('Multi-keyword ranking marker was not applied.');
if (!source.includes('buildSearchProfile(q)')) throw new Error('Search profile builder was not applied.');
if (!source.includes('matchedWeight / profile.totalWeight')) throw new Error('Weighted keyword coverage was not applied.');
if (!source.includes('profile.phrases.forEach')) throw new Error('Phrase-combination scoring was not applied.');

console.log(changed
  ? 'Upgraded RFA Guide with weighted multi-keyword and phrase ranking.'
  : 'RFA Guide multi-keyword ranking is already current.');
