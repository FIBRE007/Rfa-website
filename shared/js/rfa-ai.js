/**
 * RFA Guide — verified website guide for Royal Family Academy.
 *
 * Retrieval-only answers come from window.RFA_KNOWLEDGE. The eight RFA Guide
 * avatar frames mirror the conversation state: idle/blink, greeting,
 * listening, thinking, speaking and WhatsApp handoff.
 */
(function () {
  const KB = window.RFA_KNOWLEDGE;
  if (!KB) return;

  const site = document.body.getAttribute('data-site') || 'main';
  const schoolSites = ['nurseryandprimaryschool', 'highschool', 'sixthform'];
  const currentSchool = schoolSites.includes(site) ? site : null;

  // Shared loader for the generated, async-fetched RFA Guide data files (the
  // website search index and the keyword/synonym map below) — same
  // load-once, don't-block-forever contract for both.
  function loadGeneratedAsset(url, globalKey) {
    return window[globalKey]
      ? Promise.resolve(true)
      : new Promise((resolve) => {
          let settled = false;
          const finish = (ok) => {
            if (settled) return;
            settled = true;
            resolve(ok);
          };
          const script = document.createElement('script');
          script.src = url;
          script.async = true;
          script.onload = () => finish(true);
          script.onerror = () => finish(false);
          document.head.appendChild(script);
          setTimeout(() => finish(Boolean(window[globalKey])), 2500);
        });
  }

  // RFA Guide website search index v1: the generated index of current visitor-facing RFA pages.
  const RFA_SITE_INDEX_READY = loadGeneratedAsset('https://assets.royalfamilyacademy.org/shared/js/rfa-site-index.js', 'RFA_SITE_INDEX');

  // RFA Guide keyword map v1: a large, site-content-grounded set of extra
  // synonyms/casual phrasings (built by scripts/build-rfa-keyword-map.mjs)
  // merged into SEARCH_SYNONYMS below once loaded, so visitors' own wording
  // — not just RFA's published terminology — reaches the right answer.
  const RFA_KEYWORD_MAP_READY = loadGeneratedAsset('https://assets.royalfamilyacademy.org/shared/js/rfa-keyword-map.js', 'RFA_KEYWORD_SYNONYMS').then((ok) => {
    if (ok && window.RFA_KEYWORD_SYNONYMS) Object.assign(SEARCH_SYNONYMS, window.RFA_KEYWORD_SYNONYMS);
    return ok;
  });

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

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

  function fmtList(items) {
    return '<ul>' + items.map((item) => `<li>${escapeHtml(item)}</li>`).join('') + '</ul>';
  }

  function pageLink(url, label) {
    return `<a class="link-underline" href="${url}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
  }

  function whatsappLink(label) {
    const message = encodeURIComponent('Hello Royal Family Academy, I have a question from the RFA Guide.');
    const text = label || 'Chat with RFA on WhatsApp';
    return `<a class="link-underline" href="https://wa.me/${KB.contact.whatsappDigits}?text=${message}" target="_blank" rel="noopener">${escapeHtml(text)}</a>`;
  }

  function fallback(extra) {
    const prefix = extra ? `${extra} ` : '';
    return `${prefix}I don't have enough verified RFA information to answer that confidently from the question as written. Please rephrase it with the school, class or topic — for example, <strong>“What is the minimum age for SH 1?”</strong> If you prefer, ${whatsappLink('chat with RFA on WhatsApp')} at <strong>${escapeHtml(KB.contact.whatsappNumber)}</strong>.`;
  }

  function schoolName(key) {
    const school = KB.schools.find((item) => item.key === key);
    return school ? school.name : 'Royal Family Academy';
  }

  function detectSchool(q) {
    if (/\b(sixth form|sixthform|college|17\+)\b/.test(q)) return 'sixthform';
    if (/\b(high school|secondary school|junior high|junior secondary|senior high|senior secondary|jh\s*[123]|jhs\s*[123]|js\s*[123]|jss\s*[123]|sh\s*[123]|shs\s*[123]|ss\s*[123]|sss\s*[123])\b/.test(q)) return 'highschool';
    if (/\b(nursery|primary|creche|playgroup|pre-school|preschool|pre kindergarten|pre-kindergarten|kindergarten|grade [1-6]|grade (one|two|three|four|five|six))\b/.test(q)) return 'nurseryandprimaryschool';
    return currentSchool;
  }

  function includesAny(q, terms) {
    return terms.some((term) => q.includes(normalize(term)));
  }

  const SEARCH_STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'can', 'could', 'do', 'does', 'for', 'from', 'get',
    'how', 'i', 'if', 'in', 'is', 'it', 'like', 'me', 'my', 'of', 'on', 'our', 'please', 'rfa',
    'royal', 'family', 'academy', 'school', 'tell', 'that', 'the', 'their', 'there', 'this', 'to',
    'us', 'want', 'was', 'we', 'what', 'when', 'where', 'which', 'who', 'why', 'will', 'with',
    'would', 'you', 'your',
    // A parent's child is mentioned in nearly every question and carries no
    // topical signal of its own — treating it as a stop word lets the
    // remaining, genuinely discriminating words drive the match.
    'child', 'children', 'kid', 'kids', 'son', 'daughter', 'wards', 'ward'
  ]);

  const SEARCH_SYNONYMS = {
    anthem: ['song'],
    confession: ['declaration'],
    founder: ['founded', 'history', 'began'],
    founded: ['founder', 'history', 'began'],
    founders: ['founded', 'history'],
    origin: ['history', 'began', 'founded'],
    history: ['founded', 'began', 'origin'],
    discipline: ['conduct', 'behaviour', 'behavior'],
    bullying: ['harassment', 'wellbeing', 'safety'],
    parent: ['parents', 'family'],
    parents: ['parent', 'family'],
    // Everyday words visitors reach for instead of RFA's own published
    // terminology — mapped onto the vocabulary that actually appears in the
    // knowledge base and site index so a casual phrasing still matches it.
    pool: ['swimming'],
    swim: ['swimming'],
    swimming: ['pool'],
    library: ['e-library', 'learning support'],
    canteen: ['cafeteria'],
    lunch: ['cafeteria'],
    gym: ['stadium', 'sports'],
    playground: ['facilities'],
    doctor: ['clinic', 'health'],
    nurse: ['clinic', 'health'],
    sick: ['clinic', 'health'],
    computer: ['ict'],
    computers: ['ict'],
    coding: ['ict'],
    price: ['fee', 'fees', 'tuition', 'cost'],
    cost: ['fee', 'fees', 'tuition', 'price'],
    pay: ['fee', 'fees', 'tuition'],
    payment: ['fee', 'fees', 'tuition'],
    afford: ['fee', 'fees', 'tuition'],
    boss: ['principal', 'director', 'head', 'leadership'],
    charge: ['head', 'leadership', 'principal', 'director'],
    manager: ['principal', 'director', 'head'],
    join: ['admission', 'admissions', 'apply', 'enrol', 'enroll'],
    enter: ['admission', 'admissions', 'apply', 'enrol', 'enroll'],
    sign: ['admission', 'admissions', 'apply', 'enrol', 'enroll', 'registration'],
    start: ['admission', 'admissions', 'enrol', 'enroll', 'age'],
    young: ['age', 'minimum'],
    youngest: ['age', 'minimum'],
    oldest: ['age', 'minimum'],
    old: ['age', 'minimum'],
    located: ['location', 'address'],
    location: ['address', 'located'],
    directions: ['location', 'address'],
    reach: ['contact', 'phone', 'email'],
    ring: ['phone', 'contact', 'call'],
    activities: ['clubs', 'sports', 'events'],
    extracurricular: ['clubs', 'sports', 'events'],
    hobby: ['clubs', 'sports'],
    hobbies: ['clubs', 'sports'],
    dress: ['uniform'],
    wear: ['uniform'],
    transport: ['bus', 'route', 'routes', 'pickup'],
    bus: ['transport', 'route', 'routes', 'pickup'],
    pickup: ['bus', 'transport', 'route'],
    safe: ['safety', 'security'],
    security: ['safety', 'safe'],
    church: ['chapel', 'christian formation'],
    prayer: ['chapel', 'christian formation', 'fasting'],
    faith: ['chapel', 'christian formation'],
    religious: ['chapel', 'christian formation'],
    special: ['learning support', 'discovery centre'],
    disability: ['learning support', 'discovery centre', 'special needs'],
    struggling: ['learning support', 'discovery centre', 'academic assistance']
  };

  function searchTokens(q) {
    return normalize(q)
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token));
  }

  function tokenVariants(token) {
    return [token].concat(SEARCH_SYNONYMS[token] || []);
  }

  // RFA Guide confidence guard v2 + RFA Guide multi-keyword ranking v1: rank website evidence by the
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

  // Bounded edit-distance-<=1 check (one missing, extra or swapped letter),
  // without building a full Levenshtein matrix — cheap enough to run as a
  // per-word fallback. Used only once the exact substring match below fails.
  function isCloseTypo(a, b) {
    if (a === b) return true;
    const lenDiff = a.length - b.length;
    if (lenDiff < -1 || lenDiff > 1) return false;

    if (a.length === b.length) {
      const diffs = [];
      for (let k = 0; k < a.length; k += 1) {
        if (a[k] !== b[k]) {
          diffs.push(k);
          if (diffs.length > 2) return false;
        }
      }
      if (diffs.length <= 1) return true;
      // Two adjacent, swapped letters ("shcool" vs "school") is also a
      // single typo, even though it touches two positions.
      const [p, r] = diffs;
      return r === p + 1 && a[p] === b[r] && a[r] === b[p];
    }

    // Lengths differ by exactly one: a single insertion or deletion.
    let i = 0, j = 0, edits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i += 1; j += 1; continue; }
      edits += 1;
      if (edits > 1) return false;
      if (a.length > b.length) i += 1;
      else j += 1;
    }
    if (i < a.length || j < b.length) edits += 1;
    return edits <= 1;
  }

  function containsSearchTerm(haystack, needle) {
    const term = normalize(needle).replace(/[-']/g, ' ').trim();
    if (!term) return false;
    const text = searchableText(haystack);
    if (text.includes(' ' + term + ' ')) return true;
    // Single-word terms only: a misspelled question ("addmission",
    // "recieve") should still find the right page instead of falling
    // through to "please rephrase". Multi-word phrases skip this — typo
    // tolerance on a whole phrase is too easy to false-positive on.
    if (term.length >= 5 && term.indexOf(' ') === -1) {
      return text.split(' ').some((word) => word.length >= 4 && isCloseTypo(term, word));
    }
    return false;
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

  function findAgeEntry(q) {
    const groups = [
      ['nurseryandprimaryschool', KB.ages.earlyYears],
      ['nurseryandprimaryschool', KB.ages.primary],
      ['highschool', KB.ages.highSchool],
      ['sixthform', KB.ages.sixthForm]
    ];
    for (const [school, entries] of groups) {
      for (const entry of entries) {
        const names = [entry.stage].concat(entry.aliases || []);
        if (names.some((name) => q.includes(normalize(name)))) return { school, entry };
      }
    }
    return null;
  }

  function findListedItem(q, items) {
    if (!Array.isArray(items)) return null;
    return items.find((item) => {
      const normalized = normalize(item).replace(/\([^)]*\)/g, '').trim();
      return normalized.length > 2 && q.includes(normalized);
    }) || null;
  }

  function leadershipAnswer(q, requestedSchool) {
    const schoolKeys = requestedSchool ? [requestedSchool] : schoolSites;
    const roleTerms = [
      ['director', 'Director'], ['consultant', 'Consultant'], ['principal', 'Principal'],
      ['vice principal', 'Vice Principal'], ['head teacher', 'Head Teacher'],
      ['deputy head teacher', 'Deputy Head Teacher'], ['executive admin', 'Executive Admin Officer'],
      ['chaplain', 'School Chaplain'], ['head of sixth form', 'Head of Sixth Form']
    ];

    for (const key of schoolKeys) {
      const people = KB.leadership[key] || [];
      const named = people.find((person) => {
        const full = normalize(person.name);
        const pieces = full.split(' ').filter((part) => part.length > 3);
        return q.includes(full) || pieces.some((part) => q.includes(part));
      });
      if (named) return `<strong>${escapeHtml(named.name)}</strong> — ${escapeHtml(named.role)} at ${escapeHtml(schoolName(key))}.`;

      for (const [needle, role] of roleTerms) {
        if (!q.includes(needle)) continue;
        const person = people.find((item) => normalize(item.role).includes(normalize(role)));
        if (person) return `<strong>${escapeHtml(person.name)}</strong> is the ${escapeHtml(person.role)} at ${escapeHtml(schoolName(key))}.`;
      }
    }

    if (requestedSchool && KB.leadership[requestedSchool]) {
      return `${escapeHtml(schoolName(requestedSchool))} leadership includes:${fmtList(KB.leadership[requestedSchool].map((person) => `${person.name} — ${person.role}`))}`;
    }

    return `RFA leadership by school:${schoolSites.map((key) => `<p><strong>${escapeHtml(schoolName(key))}</strong></p>${fmtList((KB.leadership[key] || []).map((person) => `${person.name} — ${person.role}`))}`).join('')}`;
  }

  function admissionsAnswer(q, requestedSchool) {
    if (requestedSchool === 'sixthform') {
      return `Sixth Form College is currently verified for students aged <strong>${escapeHtml(KB.sixthForm.entryAge)}</strong>. ${escapeHtml(KB.sixthForm.positioning)} Detailed current entry, assessment, application and fee requirements are not yet published as verified website information. ${whatsappLink('Ask RFA about Sixth Form admissions')}.`;
    }
    if (requestedSchool === 'highschool') {
      return `High School admissions follow this pathway:${fmtList(KB.admissionsSteps.highSchool)}High School admissions line: <strong>${escapeHtml(KB.contact.highSchoolAdmissionsPhone)}</strong>. ${pageLink(KB.pages.highschool.admissions, 'View High School Admissions')}`;
    }
    if (requestedSchool === 'nurseryandprimaryschool') {
      let extra = '';
      if (q.includes('grade 6') || q.includes('grade six')) extra = `<p>${escapeHtml(KB.admissionsNotes.grade6)}</p>`;
      return `Nursery &amp; Primary admissions follow this pathway:${fmtList(KB.admissionsSteps.nurseryAndPrimary)}${extra}${pageLink(KB.pages.nurseryandprimaryschool.admissions, 'View Nursery & Primary Admissions')}`;
    }
    return `RFA has separate admissions information for each school:${fmtList([
      `Nursery & Primary — ${KB.schools[0].range}`,
      `High School — ${KB.schools[1].range}`,
      `Sixth Form College — ${KB.schools[2].range}`
    ])}Tell me which school you are asking about, or ${whatsappLink('ask RFA on WhatsApp')}.`;
  }

  // RFA Guide semantic intent layer v3: understand common natural-language ways of asking verified RFA questions.
  function expandIntentLanguage(value) {
    let q = normalize(value);
    const additions = [];
    const add = (...words) => additions.push(...words);

    if (/\bhow old\b|\bold enough\b|\bwhat age\b|\bage limit\b|\bhow young\b|\byoungest age\b|\bearliest age\b|\bwhat's the (?:min|minimum) age\b|\bhow many years old\b|\bis (?:she|he|my \w+) old enough\b/.test(q)) add('age', 'minimum', 'eligibility');
    if (/\bhow (?:do|can) i apply\b|\bhow (?:do|can) we apply\b|\benrol(?:l)? my child\b|\bregister my child\b|\bhow (?:do|can) i (?:register|sign up|get (?:my|our) \w+ in)\b|\bsteps to (?:enrol|enroll|join|apply)\b|\bprocess to (?:join|enrol|enroll|apply)\b|\bwant to join\b|\bhow to join\b/.test(q)) add('admission', 'application', 'registration');
    if (/\bwhat do (?:you|they) teach\b|\bwhat subjects are (?:there|offered)\b|\bsubjects offered\b|\bwhat will (?:my|our) \w+ learn\b|\bwhat classes\b|\bwhat do (?:you|they) study\b|\bdo you teach\b/.test(q)) add('curriculum', 'subjects');
    if (/\bwho (?:runs|leads|heads|owns)\b|\bwho is in charge\b|\bwho'?s in charge\b|\bwho'?s the (?:boss|head|principal)\b|\bpoint of contact\b/.test(q)) add('leadership');
    if (/\bwhere (?:are you|is rfa|is the school)\b|\bhow (?:do i|can i) find you\b|\bhow do i get there\b|\bdirections to\b/.test(q)) add('location', 'address');
    if (/\bwhen does (?:school|rfa) open\b|\bwhat time does (?:school|rfa) open\b|\bwhat time (?:does it|do classes) start\b|\bwhat time do (?:you|they) begin\b/.test(q)) add('opening time', 'school day');
    if (/\bwhen does (?:school|rfa) close\b|\bwhat time does (?:school|rfa) close\b|\bwhat time (?:does it|do classes) end\b|\bwhen do (?:you|they) close\b/.test(q)) add('closing time', 'school day');
    if (/\bspecial education\b|\badditional learning needs\b|\blearning difficult(?:y|ies)\b|\bslow learners?\b|\bhelp for (?:my|our) \w+\b/.test(q)) add('special needs', 'learning support');
    if (/\bcan (?:my|our) (?:child|son|daughter) (?:enter|be admitted|apply)\b/.test(q)) add('age', 'eligibility', 'admission');
    if (/\bhow much (?:do i|does it|will it|would it) (?:pay|cost)\b|\bwhat'?s the (?:tuition|price)\b|\bwhat does it cost\b|\bcan i afford\b/.test(q)) add('fee', 'fees', 'tuition');
    if (/\bhow do (?:i|we) (?:reach|contact|get in touch with) you\b|\bwhat'?s your (?:phone|number|email)\b|\bcan i call\b/.test(q)) add('contact', 'phone', 'address');
    if (/\bdo you (?:provide|have) (?:a )?(?:school )?bus\b|\bhow do (?:they|children|kids) get to school\b|\bis there pickup\b|\bschool transport\b/.test(q)) add('bus', 'transport', 'route');
    if (/\bdo you have a (?:pool|swimming pool|library|clinic|gym|canteen)\b|\bwhat facilities\b|\bis there a (?:pool|library|clinic|gym|canteen)\b/.test(q)) add('facilities', 'campus');
    if (/\bis (?:it|the school|rfa) safe\b|\bhow do you (?:handle|deal with|prevent) bullying\b|\bwhat if (?:my|our) \w+ is bullied\b/.test(q)) add('safety', 'bullying', 'wellbeing');
    if (/\bis there a uniform\b|\bwhat do (?:they|students|pupils) wear\b|\bdress code\b/.test(q)) add('uniform');
    if (/\bwhat activities\b|\bextracurricular\b|\bafter[- ]school activities\b|\bwhat can (?:my|our) \w+ do (?:after|outside) (?:school|class)\b/.test(q)) add('clubs', 'sports', 'events');
    if (/\bis (?:the school|rfa) accredited\b|\bis (?:the school|rfa) recognized\b|\bis (?:the school|rfa) registered\b/.test(q)) add('acsi', 'accredited', 'accreditation');
    if (/\bis (?:this|it|rfa) a christian school\b|\bdo you have chapel\b|\bis there bible (?:class|study)\b|\bdo you pray\b/.test(q)) add('chapel', 'christian formation');
    if (/\bwhat do (?:you|rfa) believe\b|\bwhat'?s your philosophy\b|\bwhat'?s the school motto\b/.test(q)) add('mission', 'vision', 'values', 'motto');

    return additions.length ? normalize(q + ' ' + additions.join(' ')) : q;
  }

  function extractStatedAge(q) {
    let match = q.match(/\b(\d+(?:\.\d+)?)\s*(months?|mos?|years?|yrs?|years? old|year old)\b/);
    if (match) {
      const unit = /month|mos?/.test(match[2]) ? 'months' : 'years';
      return { value: Number(match[1]), unit };
    }
    match = q.match(/\b(?:aged?|is)\s+(\d+(?:\.\d+)?)\b/);
    if (match) return { value: Number(match[1]), unit: 'years' };
    return null;
  }

  function ageToMonths(value, unit) {
    if (!Number.isFinite(value)) return null;
    return unit === 'months' ? value : value * 12;
  }

  function requirementToMonths(value) {
    const text = normalize(value);
    const number = Number((text.match(/\d+(?:\.\d+)?/) || [])[0]);
    if (!Number.isFinite(number)) return null;
    return text.includes('month') ? number : number * 12;
  }

  function isAgeIntent(q) {
    return includesAny(q, ['age', 'old', 'eligible', 'eligibility', 'entry', 'minimum', 'admission', 'admit', 'apply', 'year']) ||
      /\bcan (?:my|our) (?:child|son|daughter)\b/.test(q);
  }

  function ageIntentAnswer(ageHit, q) {
    const requirement = ageHit.entry.minAge;
    const page = KB.pages[ageHit.school].admissions || KB.pages[ageHit.school].home;
    const stated = extractStatedAge(q);

    if (!stated) {
      return `The minimum entry age currently listed for <strong>${escapeHtml(ageHit.entry.stage)}</strong> is <strong>${escapeHtml(requirement)}</strong>. ${pageLink(page, 'See admissions information')}`;
    }

    const childMonths = ageToMonths(stated.value, stated.unit);
    const requiredMonths = requirementToMonths(requirement);
    if (childMonths === null || requiredMonths === null) {
      return `The minimum entry age currently listed for <strong>${escapeHtml(ageHit.entry.stage)}</strong> is <strong>${escapeHtml(requirement)}</strong>. ${pageLink(page, 'See admissions information')}`;
    }

    const statedLabel = `${stated.value} ${stated.unit}`;
    if (childMonths < requiredMonths) {
      return `Based on the published age requirement, a child aged <strong>${escapeHtml(statedLabel)}</strong> would not yet meet the minimum entry age of <strong>${escapeHtml(requirement)}</strong> for <strong>${escapeHtml(ageHit.entry.stage)}</strong>. ${pageLink(page, 'See admissions information')}`;
    }

    const assessmentNote = ageHit.school === 'sixthform'
      ? 'Please confirm the current programme-specific entry requirements with Sixth Form Admissions.'
      : 'Meeting the minimum age does not by itself guarantee admission; RFA also uses its published admission and assessment process.';
    return `A child aged <strong>${escapeHtml(statedLabel)}</strong> meets the published minimum age of <strong>${escapeHtml(requirement)}</strong> for <strong>${escapeHtml(ageHit.entry.stage)}</strong>. ${escapeHtml(assessmentNote)} ${pageLink(page, 'See admissions information')}`;
  }

  // RFA Guide conversational layer v4: handle safe conversational questions without sending visitors into factual website search.
  function conversationalAnswer(q) {
    const words = q.split(' ').filter(Boolean);
    const shortMessage = words.length <= 6;

    if (/\b(?:what is|what's|whats) your name\b|\bwhat should i call you\b|^your name\??$/.test(q)) {
      return '<strong>My name is RFA Guide.</strong> I am Royal Family Academy’s automated website guide. I help visitors find verified information about Nursery &amp; Primary, High School and Sixth Form College.';
    }

    if (/^who are you\??$|\btell me about yourself\b/.test(q)) {
      return '<strong>I am RFA Guide</strong>, Royal Family Academy’s automated website assistant. I answer from verified RFA website information and, when I cannot verify something confidently, I will ask you to rephrase or connect you with RFA on WhatsApp.';
    }

    if (/\bare you (?:an )?(?:ai|bot|robot)\b|\bare you human\b|\bare you a person\b/.test(q)) {
      return 'I am an <strong>automated RFA website guide</strong>, not a member of staff. I use verified RFA website information to answer questions and can direct you to the RFA team when human help is needed.';
    }

    if (/\bwhat can you do\b|\bhow can you help\b|\bwhat do you do\b|\bwhat can i ask you\b/.test(q)) {
      return 'You can ask me about <strong>admissions, age requirements, curriculum and subjects, leadership, facilities, student life, learning support, contact information, school policies</strong> and other information published by RFA. If I cannot verify an answer confidently, I will ask you to rephrase or connect you to RFA on WhatsApp.';
    }

    if (shortMessage && /^(?:hi|hello|hey|good morning|good afternoon|good evening)(?: there)?$/.test(q)) {
      return 'Hello! I’m <strong>RFA Guide</strong>. How can I help you with Royal Family Academy today?';
    }

    if (shortMessage && /^(?:how are you|how are you doing|how do you do)$/.test(q)) {
      return 'I’m ready to help. You can ask me anything about Royal Family Academy that is covered by the verified RFA website information.';
    }

    if (shortMessage && /^(?:thank you|thanks|thank you very much|thanks a lot|okay thanks|ok thanks)$/.test(q)) {
      return 'You’re welcome. If you have another RFA question, I’m here to help.';
    }

    if (shortMessage && /^(?:bye|goodbye|see you|see you later)$/.test(q)) {
      return 'Goodbye. You can come back anytime you need information about Royal Family Academy.';
    }

    return null;
  }

  function answer(query) {
    const q = expandIntentLanguage(query);
    const requestedSchool = detectSchool(q);
    const ageHit = findAgeEntry(q);

    if (!q) return fallback();

    const conversation = conversationalAnswer(q);
    if (conversation) return conversation;

    if (includesAny(q, ['motto', 'raising distinguished'])) return `RFA's motto is <strong>“${escapeHtml(KB.identity.motto)}.”</strong>`;
    if (q.includes('vision')) return escapeHtml(KB.identity.vision);
    if (q.includes('mission')) return escapeHtml(KB.identity.mission);
    if (includesAny(q, ['core value', 'values', 'value'])) return `RFA's core value is <strong>Leadership</strong>, anchored on ${escapeHtml(KB.identity.values.join(', '))}.`;
    if (includesAny(q, ['acsi', 'accredit', 'accredited', 'approval'])) return `Royal Family Academy is an <strong>${escapeHtml(KB.acsi.status)}</strong>. ${escapeHtml(KB.acsi.note)}`;

    if (q.includes('whatsapp')) return `You can contact RFA on WhatsApp at <strong>${escapeHtml(KB.contact.whatsappNumber)}</strong>. ${whatsappLink('Open RFA WhatsApp')}`;
    if (includesAny(q, ['contact', 'phone', 'telephone', 'email', 'address', 'location', 'where are you', 'where is rfa', 'reach you', 'call'])) {
      return `Royal Family Academy is at <strong>${escapeHtml(KB.contact.address)}</strong>. Phone: <strong>${escapeHtml(KB.contact.generalPhone)}</strong>. Email: <strong>${escapeHtml(KB.contact.generalEmail)}</strong>. ${whatsappLink('Chat with RFA on WhatsApp')}`;
    }

    if (includesAny(q, ['which schools', 'school sections', 'school levels', 'schools do you have', 'what schools', 'from nursery to sixth form'])) {
      return `Royal Family Academy has three school sections:${fmtList(KB.schools.map((school) => `${school.name} — ${school.range}`))}`;
    }

    if (ageHit && isAgeIntent(q)) return ageIntentAnswer(ageHit, q);
    if (includesAny(q, ['age table', 'age requirement', 'minimum age', 'entry age', 'eligibility'])) {
      if (requestedSchool === 'highschool') return `High School minimum ages are:${fmtList(KB.ages.highSchool.map((item) => `${item.stage} — ${item.minAge}`))}`;
      if (requestedSchool === 'sixthform') return `Sixth Form College is currently listed for students aged <strong>${escapeHtml(KB.sixthForm.entryAge)}</strong>.`;
      return `Nursery & Primary minimum entry ages are:${fmtList(KB.ages.earlyYears.concat(KB.ages.primary).map((item) => `${item.stage} — ${item.minAge}`))}`;
    }

    // RFA Guide subject-first routing and safe mobile scroll v1: subject/curriculum questions must be answered before admissions.
    // This prevents words such as 'offered' from being mistaken for an admission 'offer'.
    const highSchoolSubjectIntent = requestedSchool === 'highschool' && /\b(subject|subjects|curriculum|course|courses|teach|teaching)\b/.test(q);
    if (highSchoolSubjectIntent && KB.highSchoolAcademics) {
      const juniorIntent = /\b(jh\s*[123]|jhs\s*[123]|js\s*[123]|jss\s*[123]|junior high|junior secondary)\b/.test(q);
      const seniorIntent = /\b(sh\s*[123]|shs\s*[123]|ss\s*[123]|sss\s*[123]|senior high|senior secondary)\b/.test(q);
      const juniorSubjects = KB.highSchoolAcademics.juniorSubjects || [];
      const seniorSubjects = KB.highSchoolAcademics.seniorSubjects || [];
      const namedSubject = findListedItem(q, juniorSubjects.concat(seniorSubjects));

      if (namedSubject && juniorIntent) {
        const listed = juniorSubjects.includes(namedSubject);
        return listed
          ? `<strong>${escapeHtml(namedSubject)}</strong> is on RFA's current published Junior High subject list. ${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`
          : `<strong>${escapeHtml(namedSubject)}</strong> appears on RFA's published Senior High subject list, but not on the current Junior High list. ${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`;
      }

      if (namedSubject && seniorIntent) {
        const listed = seniorSubjects.includes(namedSubject);
        return listed
          ? `<strong>${escapeHtml(namedSubject)}</strong> is on RFA's current published Senior High subject list. ${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`
          : `<strong>${escapeHtml(namedSubject)}</strong> appears on RFA's published Junior High subject list, but not on the current Senior High list. ${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`;
      }

      if (juniorIntent) {
        return `RFA currently publishes one <strong>Junior High</strong> subject list rather than separate lists for JH 1, JH 2 and JH 3. The published Junior High subjects are:${fmtList(juniorSubjects)}${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`;
      }

      if (seniorIntent) {
        return `RFA currently publishes one <strong>Senior High</strong> subject list rather than separate lists for SH 1, SH 2 and SH 3. The published Senior High subjects are:${fmtList(seniorSubjects)}${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`;
      }

      return `<strong>Junior High subjects</strong>${fmtList(juniorSubjects)}<strong>Senior High subjects</strong>${fmtList(seniorSubjects)}${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`;
    }
    if (includesAny(q, ['admission', 'apply', 'application', 'enrol', 'enroll', 'registration', 'register', 'assessment', 'onboarding'])) return admissionsAnswer(q, requestedSchool);
    if (includesAny(q, ['fee', 'fees', 'tuition', 'school fees', 'price', 'cost'])) return fallback(requestedSchool === 'sixthform' ? 'Current verified Sixth Form fees are not published on the website.' : 'Current verified fee information is not available in RFA Guide.');

    if (includesAny(q, ['leadership', 'director', 'consultant', 'principal', 'vice principal', 'head teacher', 'deputy head', 'chaplain', 'head of sixth form', 'who runs', 'who is miss', 'who is mrs', 'who is mr', 'who is dr', 'bunmi', 'rifkatu', 'betha', 'lofty', 'ismaila', 'queen', 'grace enesi', 'oluboyo'])) return leadershipAnswer(q, requestedSchool);

    if (includesAny(q, ['school day', 'opening time', 'closing time', 'close', 'start time', 'arrival time', 'what time', 'hours'])) {
      if (requestedSchool === 'sixthform' || requestedSchool === 'highschool') return fallback(`The current verified website information does not publish a complete ${schoolName(requestedSchool)} daily timetable.`);
      return `Nursery runs <strong>${escapeHtml(KB.schoolDay.nursery)}</strong>; Primary runs <strong>${escapeHtml(KB.schoolDay.primary)}</strong>. ${escapeHtml(KB.schoolDay.arrival)} Friday close is ${escapeHtml(KB.schoolDay.fridayClose)}, and staff-training Fridays close at ${escapeHtml(KB.schoolDay.staffTrainingFridayClose)}.`;
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const day = days.find((name) => q.includes(name));
    if (day && includesAny(q, ['schedule', 'timetable', 'rhythm', 'happen', 'what do', 'school day'])) {
      const titleDay = day.charAt(0).toUpperCase() + day.slice(1);
      if (q.includes('nursery') || q.includes('kindergarten') || q.includes('early years')) return `<strong>${titleDay} — Nursery:</strong> ${escapeHtml(KB.weeklyRhythm.nursery[titleDay])}`;
      if (q.includes('primary') || requestedSchool === 'nurseryandprimaryschool') return `<strong>${titleDay} — Primary:</strong> ${escapeHtml(KB.weeklyRhythm.primary[titleDay])}`;
    }

    const primarySubject = findListedItem(q, KB.primaryCurriculum);
    if (primarySubject) return `Yes. <strong>${escapeHtml(primarySubject)}</strong> appears on the current Primary curriculum list. ${pageLink(KB.pages.nurseryandprimaryschool.primary, 'See Primary')}`;
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['curriculum', 'subjects', 'what do you teach', 'primary subjects'])) return `The current Primary curriculum includes:${fmtList(KB.primaryCurriculum)}`;

    if (includesAny(q, ['discovery centre', 'discovery center', 'special needs', 'learning support', 'nild', 'autism', 'speech', 'occupational therapy', 'iep'])) {
      return `${escapeHtml(KB.learningSupport.discoveryNote)} Services listed include:${fmtList(KB.learningSupport.discoveryCentre)}${pageLink(KB.pages.nurseryandprimaryschool.learning, 'Explore Learning & Support')}`;
    }
    if (includesAny(q, ['academic assistance', 'aas', 'learning gap', 'one-to-one', 'one to one'])) return `${escapeHtml(KB.learningSupport.aas)} ${pageLink(KB.pages.nurseryandprimaryschool.learning, 'Explore Learning & Support')}`;

    const primaryClub = findListedItem(q, KB.nurseryPrimaryStudentLife.clubs);
    if (primaryClub) return `Yes. <strong>${escapeHtml(primaryClub)}</strong> is listed among Nursery & Primary clubs.`;
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['clubs', 'club'])) return `Nursery & Primary clubs currently listed are:${fmtList(KB.nurseryPrimaryStudentLife.clubs)}`;
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['sports', 'sport', 'football', 'basketball', 'taekwondo', 'swimming', 'badminton', 'table tennis'])) return `Nursery & Primary sporting facilities/activities include:${fmtList(KB.nurseryPrimaryStudentLife.sports)}Saturday Sports Academy offers:${fmtList(KB.nurseryPrimaryStudentLife.saturdaySportsAcademy)}`;
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['house', 'houses', 'red house', 'green house', 'yellow house', 'blue house'])) return `The Nursery & Primary houses are <strong>${escapeHtml(KB.nurseryPrimaryStudentLife.houses.join(', '))}</strong>.`;
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['event', 'events', 'independence', 'leadership week', 'science week', 'literacy week', 'graduation', 'christmas carol'])) return `Nursery & Primary events currently listed include:${fmtList(KB.nurseryPrimaryStudentLife.events)}`;
    if (includesAny(q, ['excursion', 'excursions', 'trip', 'trips']) && requestedSchool !== 'highschool') return escapeHtml(KB.nurseryPrimaryStudentLife.excursions);
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['chapel', 'christian formation', 'spiritual formation', 'fasting', 'bible studies'])) return `Nursery & Primary Christian formation includes:${fmtList(KB.nurseryPrimaryStudentLife.christianFormation)}`;

    const route = findListedItem(q, KB.parentInformation.busRoutes);
    if (route && includesAny(q, ['bus', 'route', 'transport', 'pick up', 'pickup'])) return `Yes. <strong>${escapeHtml(route)}</strong> is currently listed among RFA Nursery & Primary school bus routes.`;
    if (includesAny(q, ['bus route', 'bus routes', 'school bus', 'transport route', 'transportation'])) return `The currently listed Nursery & Primary bus routes include:${fmtList(KB.parentInformation.busRoutes)}`;
    if (includesAny(q, ['parenting institute', 'parent partnership', 'parents involved'])) return escapeHtml(KB.parentInformation.partnership);
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['policy', 'policies', 'complaint', 'non discrimination'])) return `Nursery & Primary policy areas currently listed include:${fmtList(KB.parentInformation.policies)}`;

    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['facility', 'facilities', 'campus', 'laboratory', 'lab', 'clinic', 'auditorium', 'stadium', 'cafeteria', 'montessori room'])) return `Nursery & Primary facilities currently listed include:${fmtList(KB.nurseryPrimaryFacilities)}${pageLink(KB.pages.nurseryandprimaryschool.campus, 'Explore the Nursery & Primary campus')}`;
    if (requestedSchool === 'highschool' && includesAny(q, ['facility', 'facilities', 'campus', 'laboratory', 'lab', 'clinic', 'auditorium', 'stadium', 'cafeteria', 'arts studio'])) return `High School facilities currently listed include:${fmtList(KB.highSchoolFacilities)}${pageLink(KB.pages.highschool.campus, 'Explore the High School campus')}`;

    const juniorSubject = findListedItem(q, KB.highSchoolAcademics.juniorSubjects);
    const seniorSubject = findListedItem(q, KB.highSchoolAcademics.seniorSubjects);
    if (requestedSchool === 'highschool' && (juniorSubject || seniorSubject)) {
      const item = juniorSubject || seniorSubject;
      const level = juniorSubject ? 'Junior High' : 'Senior High';
      return `Yes. <strong>${escapeHtml(item)}</strong> appears on the current ${level} subject list.`;
    }
    if (requestedSchool === 'highschool' && includesAny(q, ['subjects', 'curriculum', 'junior subjects', 'senior subjects', 'what do you teach'])) {
      if (q.includes('junior')) return `Junior High subjects currently listed are:${fmtList(KB.highSchoolAcademics.juniorSubjects)}`;
      if (q.includes('senior')) return `Senior High subjects currently listed are:${fmtList(KB.highSchoolAcademics.seniorSubjects)}`;
      return `<strong>Junior High</strong>${fmtList(KB.highSchoolAcademics.juniorSubjects)}<strong>Senior High</strong>${fmtList(KB.highSchoolAcademics.seniorSubjects)}`;
    }
    if (requestedSchool === 'highschool' && includesAny(q, ['assessment', 'exam', 'exams', 'homework', 'progress report', 'mock'])) return `High School academic assessment currently includes:${fmtList(KB.highSchoolAcademics.assessment)}`;

    if (requestedSchool === 'highschool' && includesAny(q, ['model united nations', 'mun'])) return escapeHtml(KB.highSchoolStudentLife.modelUN);
    if (requestedSchool === 'highschool' && includesAny(q, ['duke of edinburgh', 'duke award', 'bronze cadre', 'silver cadre'])) return escapeHtml(KB.highSchoolStudentLife.dukeOfEdinburgh);
    if (requestedSchool === 'highschool' && includesAny(q, ['club', 'clubs', 'societies'])) return `High School clubs/societies currently verified on the website are:${fmtList(KB.highSchoolStudentLife.clubs)}`;
    if (requestedSchool === 'highschool' && includesAny(q, ['event', 'events', 'school life', 'inter-house', 'festival of art', 'leadership week'])) return `High School events currently listed include:${fmtList(KB.highSchoolStudentLife.events)}`;
    if (requestedSchool === 'highschool' && includesAny(q, ['chapel', 'spiritual formation', 'mentoring', 'fasting', 'discipleship', 'retreat'])) return `High School spiritual formation currently includes:${fmtList(KB.highSchoolStudentLife.spiritualFormation)}`;

    if (requestedSchool === 'highschool' && includesAny(q, ['bullying', 'safety', 'wellbeing', 'harassment', 'security', 'visitor', 'fire drill'])) return `High School safety and wellbeing information includes:${fmtList(KB.highSchoolSafety.wellbeing)}`;
    if (requestedSchool === 'highschool' && includesAny(q, ['conduct', 'discipline rules', 'punctuality', 'attendance', 'responsibility'])) return `High School student conduct expectations include:${fmtList(KB.highSchoolSafety.conduct)}`;
    if (requestedSchool === 'highschool' && includesAny(q, ['parent teacher', 'parent partnership', 'progressive forum'])) return escapeHtml(KB.highSchoolSafety.parentPartnership);
    if (requestedSchool === 'highschool' && includesAny(q, ['policy', 'policies', 'complaint', 'internet rule', 'electronic device'])) return `High School policy areas currently listed include:${fmtList(KB.highSchoolSafety.policies)}`;

    if (requestedSchool === 'highschool' && q.includes('innovation')) return escapeHtml(KB.highSchoolCharacter.innovation);
    if (requestedSchool === 'highschool' && includesAny(q, ['discipline philosophy', 'godly conduct', 'character formation'])) return escapeHtml(KB.highSchoolCharacter.discipline);
    if (requestedSchool === 'highschool' && includesAny(q, ['leadership philosophy', 'leadership development', 'why leadership'])) return escapeHtml(KB.highSchoolCharacter.leadership);

    if (requestedSchool === 'sixthform') {
      if (includesAny(q, ['about', 'overview', 'what is sixth form', 'sixth form college', 'university', 'leadership', 'prepare'])) return `${escapeHtml(KB.sixthForm.positioning)} Entry age currently listed is <strong>${escapeHtml(KB.sixthForm.entryAge)}</strong>. ${pageLink(KB.pages.sixthform.home, 'Explore Sixth Form College')}`;
      if (includesAny(q, ['programme', 'programmes', 'curriculum', 'subject', 'subjects', 'career', 'careers', 'university destination', 'student life', 'fees', 'fee', 'requirements'])) return fallback(`The current RFA website verifies that Sixth Form provides advanced academic programmes and tailored support for university and leadership, but ${escapeHtml(KB.sixthForm.verifiedLimits)}`);
    }

    const websiteAnswer = websiteIndexAnswer(q, requestedSchool);
    if (websiteAnswer) return websiteAnswer;

    if (requestedSchool && includesAny(q, ['tell me about', 'about the school', 'school information', 'what do you offer'])) {
      const school = KB.schools.find((item) => item.key === requestedSchool);
      if (requestedSchool === 'sixthform') return `${escapeHtml(KB.sixthForm.positioning)} Entry age: <strong>${escapeHtml(KB.sixthForm.entryAge)}</strong>. ${pageLink(school.url, 'Visit Sixth Form College')}`;
      return `<strong>${escapeHtml(school.name)}</strong> serves ${escapeHtml(school.range)}. ${pageLink(school.url, `Visit ${school.name}`)}`;
    }

    return fallback();
  }

  const schoolLinksHtml = KB.schools
    .map((school) => `<a class="rfa-ai__chip" href="${school.url}" target="_blank" rel="noopener">${escapeHtml(school.name)}</a>`)
    .join('');

  const chipsHtml = currentSchool
    ? `
      <a class="rfa-ai__chip" href="${KB.pages[currentSchool].admissions}" target="_blank" rel="noopener">Admissions</a>
      <a class="rfa-ai__chip" href="${KB.pages[currentSchool].contact}" target="_blank" rel="noopener">Contact</a>
      <a class="rfa-ai__chip" href="https://wa.me/${KB.contact.whatsappDigits}" target="_blank" rel="noopener">WhatsApp RFA</a>
    `
    : `${schoolLinksHtml}<a class="rfa-ai__chip" href="https://wa.me/${KB.contact.whatsappDigits}" target="_blank" rel="noopener">WhatsApp RFA</a>`;

  const AVATAR_BASE = 'https://media.royalfamilyacademy.org/rfa-guide/';
  const AVATARS = {
    idle: `${AVATAR_BASE}rfa-guide-idle.webp?v=20260903-frames1`,
    blink: `${AVATAR_BASE}rfa-guide-blink.webp?v=20260903-frames1`,
    listening: `${AVATAR_BASE}rfa-guide-listening.webp?v=20260903-frames1`,
    thinking: `${AVATAR_BASE}rfa-guide-thinking.webp?v=20260903-frames1`,
    'speaking-a': `${AVATAR_BASE}rfa-guide-speaking-a.webp?v=20260903-frames1`,
    'speaking-b': `${AVATAR_BASE}rfa-guide-speaking-b.webp?v=20260903-frames1`,
    greeting: `${AVATAR_BASE}rfa-guide-greeting.webp?v=20260903-frames1`,
    handoff: `${AVATAR_BASE}rfa-guide-handoff.webp?v=20260903-frames1`
  };

  Object.values(AVATARS).forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  // RFA Guide mobile-only bottom-up conversation flow v8: keep the newest mobile exchange immediately above the composer.
  const frameStyles = document.createElement('style');
  frameStyles.textContent = `
    .rfa-ai.has-frame-avatar .rfa-ai__launcher::before,
    .rfa-ai.has-frame-avatar .rfa-ai__header::before { display:none!important; }
    .rfa-ai.has-frame-avatar .rfa-ai__launcher {
      width:96px!important;height:144px!important;border-radius:0!important;
      overflow:visible!important;background:transparent!important;
      filter:drop-shadow(0 10px 12px rgba(14,12,18,.25));
    }
    .rfa-ai__avatar-frame { display:block;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none; }
    /* Desktop keeps the original message layout. */
    .rfa-ai__messages-list { display:contents; }
    @media(max-width:480px){
      /* Mobile behaves like a messaging app: the first message sits directly
         above the composer and each new exchange pushes earlier messages up. */
      .rfa-ai.is-open .rfa-ai__messages { gap:0!important; }
      .rfa-ai.is-open .rfa-ai__messages {
        gap:0!important;
        overflow-y:auto!important;
        overscroll-behavior:contain;
        -webkit-overflow-scrolling:touch;
        touch-action:pan-y;
      }
      .rfa-ai.is-open .rfa-ai__messages-list {
        min-height:100%;
        min-width:0;
        width:100%;
        display:flex;
        flex-direction:column;
        justify-content:flex-start;
        gap:.45rem;
      }
      /* Auto margin bottom-aligns a short conversation but collapses to zero
         once messages overflow, so older messages remain fully scrollable. */
      .rfa-ai.is-open .rfa-ai__messages-list > .rfa-ai__msg:first-child {
        margin-top:auto;
      }
    }
    .rfa-ai__avatar-frame--launcher { width:100%;height:100%;transform-origin:50% 82%;animation:rfaGuideFloat 5.6s ease-in-out infinite; }
    .rfa-ai__avatar-frame--header { width:54px;height:70px;justify-self:center;object-position:50% 8%;filter:drop-shadow(0 4px 5px rgba(14,12,18,.22)); }
    .rfa-ai.has-frame-avatar .rfa-ai__header { grid-template-columns:54px 1fr auto!important;min-height:74px; }
    .rfa-ai[data-avatar-state="greeting"] .rfa-ai__avatar-frame { animation:rfaGuideGreet .72s cubic-bezier(.2,.8,.25,1) both; }
    .rfa-ai[data-avatar-state="listening"] .rfa-ai__avatar-frame--header { animation:rfaGuideListen 2.2s ease-in-out infinite; }
    .rfa-ai[data-avatar-state="thinking"] .rfa-ai__avatar-frame--header { animation:rfaGuideThink 1.05s ease-in-out infinite; }
    .rfa-ai[data-avatar-state^="speaking"] .rfa-ai__avatar-frame--header { animation:rfaGuideSpeak .42s ease-in-out infinite; }
    .rfa-ai[data-avatar-state="handoff"] .rfa-ai__avatar-frame--header { animation:rfaGuidePresent .85s ease-out both; }
    @keyframes rfaGuideFloat { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-5px) rotate(1.2deg)} }
    @keyframes rfaGuideGreet { 0%{transform:translateY(0) rotate(0) scale(1)} 45%{transform:translateY(-6px) rotate(-3deg) scale(1.04)} 100%{transform:translateY(0) rotate(0) scale(1)} }
    @keyframes rfaGuideListen { 0%,100%{transform:rotate(0) translateY(0)} 50%{transform:rotate(-1.5deg) translateY(-2px)} }
    @keyframes rfaGuideThink { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-2px) scale(1.035)} }
    @keyframes rfaGuideSpeak { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
    @keyframes rfaGuidePresent { 0%{transform:translateX(-3px) scale(.98)} 65%{transform:translateX(2px) scale(1.035)} 100%{transform:translateX(0) scale(1)} }
    @media(max-width:480px){
      .rfa-ai.has-frame-avatar .rfa-ai__launcher{width:84px!important;height:126px!important;}
      .rfa-ai__avatar-frame--header{width:50px;height:65px;}
      .rfa-ai.has-frame-avatar .rfa-ai__header{grid-template-columns:50px 1fr auto!important;}
    }
    @media(prefers-reduced-motion:reduce){
      .rfa-ai__avatar-frame{animation:none!important;transition:none!important;}
    }
  `;
  document.head.appendChild(frameStyles);

  const root = document.createElement('div');
  root.className = 'rfa-ai has-frame-avatar';
  root.dataset.avatarState = 'idle';
  root.innerHTML = `
    <button class="rfa-ai__launcher" type="button" aria-expanded="false" aria-controls="rfa-ai-panel" aria-label="Open RFA Guide">
      <img class="rfa-ai__avatar-frame rfa-ai__avatar-frame--launcher" src="${AVATARS.idle}" alt="" aria-hidden="true">
      <span class="rfa-ai__launcher-dot" aria-hidden="true"></span>
      <span class="rfa-ai__launcher-label">RFA Guide</span>
    </button>
    <div class="rfa-ai__panel" id="rfa-ai-panel" role="dialog" aria-label="RFA Guide" aria-hidden="true">
      <div class="rfa-ai__header">
        <img class="rfa-ai__avatar-frame rfa-ai__avatar-frame--header" src="${AVATARS.idle}" alt="" aria-hidden="true">
        <p class="rfa-ai__title">RFA Guide</p>
        <button class="rfa-ai__close" type="button" aria-label="Close RFA Guide">&times;</button>
      </div>
      <div class="rfa-ai__messages" id="rfa-ai-messages">
        <div class="rfa-ai__messages-list" id="rfa-ai-messages-list">
          <div class="rfa-ai__msg rfa-ai__msg--bot">Hello — I'm <strong>RFA Guide</strong>. Ask me about Nursery &amp; Primary, High School or Sixth Form. I answer from verified RFA website information. If I can't verify something, I'll connect you to RFA on WhatsApp.</div>
        </div>
      </div>
      <div class="rfa-ai__actions">${chipsHtml}</div>
      <form class="rfa-ai__form" id="rfa-ai-form">
        <input class="rfa-ai__input" type="text" placeholder="Ask RFA Guide…" aria-label="Ask RFA Guide a question" autocomplete="off">
        <button class="rfa-ai__send" type="submit" aria-label="Send question">→</button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  const launcher = root.querySelector('.rfa-ai__launcher');
  const panel = root.querySelector('.rfa-ai__panel');
  const closeBtn = root.querySelector('.rfa-ai__close');
  const form = root.querySelector('#rfa-ai-form');
  const input = root.querySelector('.rfa-ai__input');
  const sendButton = root.querySelector('.rfa-ai__send');
  const messages = root.querySelector('#rfa-ai-messages');
  const messageList = root.querySelector('#rfa-ai-messages-list');
  const avatarImages = root.querySelectorAll('.rfa-ai__avatar-frame');
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // RFA Guide mobile draggable launcher v1: on phones the closed avatar starts bottom-right but can be dragged
  // out of the way. It snaps to the nearest side and remembers that position
  // for the current browsing session. Desktop remains unchanged.
  const mobileDragQuery = window.matchMedia ? window.matchMedia('(max-width: 480px)') : { matches: false };
  const LAUNCHER_POSITION_KEY = 'rfa-guide-mobile-launcher-position-v1';
  const LAUNCHER_MARGIN = 12;
  const DRAG_THRESHOLD = 7;
  let launcherDrag = null;
  let suppressLauncherClick = false;

  function mobileLauncherViewport() {
    return {
      width: Math.max(1, Math.round(window.innerWidth || document.documentElement.clientWidth || 1)),
      height: Math.max(1, Math.round(window.innerHeight || document.documentElement.clientHeight || 1))
    };
  }

  function clearMobileLauncherPosition() {
    ['left', 'right', 'top', 'bottom'].forEach((prop) => root.style.removeProperty(prop));
    launcher.style.removeProperty('touch-action');
  }

  function setDefaultMobileLauncherPosition() {
    if (!mobileDragQuery.matches || root.classList.contains('is-open')) return;
    launcher.style.setProperty('touch-action', 'none');
    root.style.setProperty('left', 'auto', 'important');
    root.style.setProperty('top', 'auto', 'important');
    root.style.setProperty('right', LAUNCHER_MARGIN + 'px', 'important');
    root.style.setProperty('bottom', LAUNCHER_MARGIN + 'px', 'important');
  }

  function readMobileLauncherPosition() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(LAUNCHER_POSITION_KEY) || 'null');
      if (!saved || !['left', 'right'].includes(saved.side) || !Number.isFinite(saved.yRatio)) return null;
      return { side: saved.side, yRatio: Math.max(0, Math.min(1, saved.yRatio)) };
    } catch (_) {
      return null;
    }
  }

  function saveMobileLauncherPosition(side, top) {
    const viewport = mobileLauncherViewport();
    const launcherHeight = Math.max(1, launcher.getBoundingClientRect().height || launcher.offsetHeight || 1);
    const travel = Math.max(1, viewport.height - launcherHeight - (LAUNCHER_MARGIN * 2));
    const yRatio = Math.max(0, Math.min(1, (top - LAUNCHER_MARGIN) / travel));
    try { sessionStorage.setItem(LAUNCHER_POSITION_KEY, JSON.stringify({ side, yRatio })); } catch (_) {}
  }

  function restoreMobileLauncherPosition() {
    if (!mobileDragQuery.matches) {
      clearMobileLauncherPosition();
      return;
    }
    if (root.classList.contains('is-open')) return;

    launcher.style.setProperty('touch-action', 'none');
    const saved = readMobileLauncherPosition();
    if (!saved) {
      setDefaultMobileLauncherPosition();
      return;
    }

    const viewport = mobileLauncherViewport();
    const rect = launcher.getBoundingClientRect();
    const width = Math.max(1, rect.width || launcher.offsetWidth || 1);
    const height = Math.max(1, rect.height || launcher.offsetHeight || 1);
    const maxTop = Math.max(LAUNCHER_MARGIN, viewport.height - height - LAUNCHER_MARGIN);
    const travel = Math.max(0, maxTop - LAUNCHER_MARGIN);
    const top = LAUNCHER_MARGIN + (travel * saved.yRatio);
    const left = saved.side === 'left'
      ? LAUNCHER_MARGIN
      : Math.max(LAUNCHER_MARGIN, viewport.width - width - LAUNCHER_MARGIN);

    root.style.setProperty('right', 'auto', 'important');
    root.style.setProperty('bottom', 'auto', 'important');
    root.style.setProperty('left', Math.round(left) + 'px', 'important');
    root.style.setProperty('top', Math.round(top) + 'px', 'important');
  }

  function moveMobileLauncher(left, top) {
    const viewport = mobileLauncherViewport();
    const rect = launcher.getBoundingClientRect();
    const width = Math.max(1, rect.width || launcher.offsetWidth || 1);
    const height = Math.max(1, rect.height || launcher.offsetHeight || 1);
    const maxLeft = Math.max(LAUNCHER_MARGIN, viewport.width - width - LAUNCHER_MARGIN);
    const maxTop = Math.max(LAUNCHER_MARGIN, viewport.height - height - LAUNCHER_MARGIN);
    const x = Math.max(LAUNCHER_MARGIN, Math.min(maxLeft, left));
    const y = Math.max(LAUNCHER_MARGIN, Math.min(maxTop, top));

    root.style.setProperty('right', 'auto', 'important');
    root.style.setProperty('bottom', 'auto', 'important');
    root.style.setProperty('left', Math.round(x) + 'px', 'important');
    root.style.setProperty('top', Math.round(y) + 'px', 'important');
    return { left: x, top: y };
  }

  function finishMobileLauncherDrag(event) {
    if (!launcherDrag || event.pointerId !== launcherDrag.pointerId) return;
    try { launcher.releasePointerCapture(event.pointerId); } catch (_) {}

    const wasDragging = launcherDrag.dragging;
    launcherDrag = null;
    if (!wasDragging) return;

    const rect = root.getBoundingClientRect();
    const viewport = mobileLauncherViewport();
    const side = (rect.left + rect.width / 2) < (viewport.width / 2) ? 'left' : 'right';
    const snappedLeft = side === 'left'
      ? LAUNCHER_MARGIN
      : Math.max(LAUNCHER_MARGIN, viewport.width - rect.width - LAUNCHER_MARGIN);
    const finalPos = moveMobileLauncher(snappedLeft, rect.top);
    saveMobileLauncherPosition(side, finalPos.top);

    suppressLauncherClick = true;
    window.setTimeout(() => { suppressLauncherClick = false; }, 450);
  }

  launcher.addEventListener('pointerdown', (event) => {
    if (!mobileDragQuery.matches || root.classList.contains('is-open')) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const rect = root.getBoundingClientRect();
    launcherDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      dragging: false
    };
    try { launcher.setPointerCapture(event.pointerId); } catch (_) {}
  });

  launcher.addEventListener('pointermove', (event) => {
    if (!launcherDrag || event.pointerId !== launcherDrag.pointerId) return;
    const dx = event.clientX - launcherDrag.startX;
    const dy = event.clientY - launcherDrag.startY;
    if (!launcherDrag.dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    launcherDrag.dragging = true;
    event.preventDefault();
    moveMobileLauncher(launcherDrag.startLeft + dx, launcherDrag.startTop + dy);
  }, { passive: false });

  launcher.addEventListener('pointerup', finishMobileLauncherDrag);
  launcher.addEventListener('pointercancel', finishMobileLauncherDrag);
  launcher.addEventListener('click', (event) => {
    if (!suppressLauncherClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressLauncherClick = false;
  }, true);

  const refreshMobileLauncherPosition = () => {
    if (root.classList.contains('is-open')) return;
    window.requestAnimationFrame(restoreMobileLauncherPosition);
  };
  window.addEventListener('orientationchange', () => window.setTimeout(refreshMobileLauncherPosition, 140), { passive: true });
  window.addEventListener('resize', refreshMobileLauncherPosition, { passive: true });
  if (mobileDragQuery.addEventListener) mobileDragQuery.addEventListener('change', refreshMobileLauncherPosition);

  window.requestAnimationFrame(restoreMobileLauncherPosition);

  function anchorLatestMessage() {
    if (!root.classList.contains('is-open')) return;
    const settle = () => { messages.scrollTop = messages.scrollHeight; };
    requestAnimationFrame(() => {
      settle();
      requestAnimationFrame(settle);
    });
  }

  // RFA Guide native keyboard resize layer v10: let the mobile browser resize the content viewport for the keyboard.
  // Do not manually resize or translate the chat panel: that caused first-focus
  // keyboard overlap and large blank gaps on Chromium-based Android browsers.
  const mobileViewportQuery = window.matchMedia ? window.matchMedia('(max-width: 480px)') : { matches: false };
  let mobileViewportRaf = null;
  let pageScrollLocked = false;
  let previousBodyOverflow = '';
  let previousHtmlOverflow = '';

  // Chromium supports interactive-widget=resizes-content. Apply it before the
  // visitor focuses the composer so the layout viewport itself becomes keyboard-safe.
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    const currentViewport = viewportMeta.getAttribute('content') || 'width=device-width, initial-scale=1.0';
    if (!/interactive-widget\s*=/.test(currentViewport)) {
      viewportMeta.setAttribute('content', currentViewport.replace(/\s*,?\s*$/, '') + ', interactive-widget=resizes-content');
    }
  }

  // Where the Virtual Keyboard API is available, explicitly request resize rather
  // than overlay behaviour as an additional Chromium safeguard.
  try {
    if (navigator.virtualKeyboard) navigator.virtualKeyboard.overlaysContent = false;
  } catch (_) {}

  function setMobilePageLock(locked) {
    if (locked === pageScrollLocked) return;
    if (locked) {
      previousBodyOverflow = document.body.style.overflow;
      previousHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      pageScrollLocked = true;
      return;
    }
    document.body.style.overflow = previousBodyOverflow;
    document.documentElement.style.overflow = previousHtmlOverflow;
    pageScrollLocked = false;
  }

  function resetMobileViewport() {
    // Remove any inline dimensions left by older RFA Guide builds.
    ['top', 'bottom', 'height', 'min-height', 'max-height'].forEach((prop) => panel.style.removeProperty(prop));
    ['width', 'height', 'min-height', 'max-height', 'background', 'overflow'].forEach((prop) => root.style.removeProperty(prop));
    setMobilePageLock(false);
  }

  function syncMobileViewport(stickToBottom = false) {
    if (!root.classList.contains('is-open') || !mobileViewportQuery.matches) {
      resetMobileViewport();
      return;
    }

    // CSS 100dvh now follows the keyboard-safe resized layout viewport. Keep the
    // underlying page still, but do not alter the panel's top/height at runtime.
    setMobilePageLock(true);
    if (stickToBottom) anchorLatestMessage();
  }

  function queueMobileViewport(stickToBottom = false) {
    if (mobileViewportRaf) cancelAnimationFrame(mobileViewportRaf);
    mobileViewportRaf = requestAnimationFrame(() => {
      mobileViewportRaf = null;
      syncMobileViewport(stickToBottom);
    });
  }

  function focusComposer() {
    try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }
    queueMobileViewport(true);
    // Re-anchor while Chromium completes the keyboard animation; no geometry is
    // changed here, so these passes cannot create extra blank space.
    [80, 180, 320].forEach((delay) => setTimeout(() => queueMobileViewport(true), delay));
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => queueMobileViewport(true), { passive: true });
  }
  window.addEventListener('resize', () => queueMobileViewport(true), { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(() => queueMobileViewport(true), 120), { passive: true });
  if (mobileViewportQuery.addEventListener) {
    mobileViewportQuery.addEventListener('change', () => queueMobileViewport(true));
  }

  let idleTimer = null;
  let stateTimer = null;
  let speakingTimer = null;

  function clearStateTimers() {
    clearTimeout(stateTimer);
    clearInterval(speakingTimer);
    stateTimer = null;
    speakingTimer = null;
  }

  function setAvatarState(state) {
    if (!AVATARS[state]) state = 'idle';
    root.dataset.avatarState = state;
    avatarImages.forEach((img) => {
      if (img.src !== AVATARS[state]) img.src = AVATARS[state];
    });
  }

  function scheduleIdleMoment() {
    clearTimeout(idleTimer);
    if (reducedMotion || root.classList.contains('is-open')) return;
    const wait = 4200 + Math.round(Math.random() * 3400);
    idleTimer = setTimeout(() => {
      if (root.classList.contains('is-open')) return;
      const greet = Math.random() < 0.22;
      setAvatarState(greet ? 'greeting' : 'blink');
      stateTimer = setTimeout(() => {
        if (!root.classList.contains('is-open')) setAvatarState('idle');
        scheduleIdleMoment();
      }, greet ? 720 : 190);
    }, wait);
  }

  function speakFor(html) {
    clearStateTimers();
    if (reducedMotion) {
      setAvatarState(root.classList.contains('is-open') ? 'listening' : 'idle');
      return;
    }
    let phase = false;
    setAvatarState('speaking-a');
    speakingTimer = setInterval(() => {
      phase = !phase;
      setAvatarState(phase ? 'speaking-b' : 'speaking-a');
    }, 220);
    const plainLength = html.replace(/<[^>]+>/g, '').length;
    const duration = Math.max(1100, Math.min(3200, plainLength * 18));
    stateTimer = setTimeout(() => {
      clearInterval(speakingTimer);
      speakingTimer = null;
      setAvatarState(root.classList.contains('is-open') ? 'listening' : 'idle');
    }, duration);
  }

  function open() {
    clearTimeout(idleTimer);
    clearStateTimers();
    root.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    setAvatarState('greeting');
    stateTimer = setTimeout(() => setAvatarState('listening'), reducedMotion ? 0 : 700);
    queueMobileViewport(true);
    focusComposer();
  }

  function close() {
    clearStateTimers();
    root.classList.remove('is-open');
    resetMobileViewport();
    restoreMobileLauncherPosition();
    launcher.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    setAvatarState('idle');
    launcher.focus();
    scheduleIdleMoment();
  }

  launcher.addEventListener('pointerenter', () => {
    if (!root.classList.contains('is-open')) setAvatarState('greeting');
  });
  launcher.addEventListener('pointerleave', () => {
    if (!root.classList.contains('is-open')) setAvatarState('idle');
  });
  launcher.addEventListener('focus', () => {
    if (!root.classList.contains('is-open')) setAvatarState('greeting');
  });
  launcher.addEventListener('blur', () => {
    if (!root.classList.contains('is-open')) setAvatarState('idle');
  });
  launcher.addEventListener('click', () => (root.classList.contains('is-open') ? close() : open()));
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-open')) close();
  });

  input.addEventListener('focus', () => {
    if (root.classList.contains('is-open') && !speakingTimer) setAvatarState('listening');
    queueMobileViewport(true);
    setTimeout(() => queueMobileViewport(true), 220);
  });
  input.addEventListener('input', () => {
    if (root.classList.contains('is-open') && !speakingTimer) setAvatarState('listening');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    clearStateTimers();
    const userMsg = document.createElement('div');
    userMsg.className = 'rfa-ai__msg rfa-ai__msg--user';
    userMsg.textContent = query;
    messageList.appendChild(userMsg);
    anchorLatestMessage();

    input.value = '';
    input.disabled = true;
    sendButton.disabled = true;
    setAvatarState('thinking');

    await Promise.all([RFA_SITE_INDEX_READY, RFA_KEYWORD_MAP_READY]);
    const html = answer(query);
    const isHandoff = html.includes("I don't have enough verified RFA information to answer that confidently");
    const thinkingDelay = reducedMotion ? 0 : 560;

    stateTimer = setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = 'rfa-ai__msg rfa-ai__msg--bot';
      botMsg.innerHTML = html;
      messageList.appendChild(botMsg);
      anchorLatestMessage();
      input.disabled = false;
      sendButton.disabled = false;
      focusComposer();

      if (isHandoff) {
        setAvatarState('handoff');
        stateTimer = setTimeout(() => setAvatarState('listening'), reducedMotion ? 0 : 1750);
      } else {
        speakFor(html);
      }
    }, thinkingDelay);
  });

  scheduleIdleMoment();
})();
