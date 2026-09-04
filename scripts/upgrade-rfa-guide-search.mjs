import fs from 'node:fs';

const AI_PATH = 'shared/js/rfa-ai.js';
const HEADERS_PATH = '_headers';
const MARKER = 'RFA Guide website search index v1';

let source = fs.readFileSync(AI_PATH, 'utf8');

if (!source.includes(MARKER)) {
  const currentSchoolNeedle = "  const currentSchool = schoolSites.includes(site) ? site : null;\n";
  const loader = `\n  // ${MARKER}: load the generated index of current visitor-facing RFA pages.\n  const RFA_SITE_INDEX_URL = 'https://assets.royalfamilyacademy.org/shared/js/rfa-site-index.js';\n  const RFA_SITE_INDEX_READY = window.RFA_SITE_INDEX\n    ? Promise.resolve(true)\n    : new Promise((resolve) => {\n        let settled = false;\n        const finish = (ok) => {\n          if (settled) return;\n          settled = true;\n          resolve(ok);\n        };\n        const script = document.createElement('script');\n        script.src = RFA_SITE_INDEX_URL;\n        script.async = true;\n        script.onload = () => finish(true);\n        script.onerror = () => finish(false);\n        document.head.appendChild(script);\n        setTimeout(() => finish(Boolean(window.RFA_SITE_INDEX)), 2500);\n      });\n`;

  if (!source.includes(currentSchoolNeedle)) throw new Error('Could not find currentSchool insertion point in rfa-ai.js');
  source = source.replace(currentSchoolNeedle, currentSchoolNeedle + loader);

  const includesAnyNeedle = `  function includesAny(q, terms) {\n    return terms.some((term) => q.includes(normalize(term)));\n  }\n`;
  const searchHelpers = `\n  const SEARCH_STOP_WORDS = new Set([\n    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'can', 'do', 'does', 'for', 'from', 'how',\n    'i', 'in', 'is', 'it', 'me', 'of', 'on', 'our', 'please', 'rfa', 'royal', 'family',\n    'academy', 'school', 'tell', 'that', 'the', 'their', 'this', 'to', 'us', 'what', 'when',\n    'where', 'which', 'who', 'why', 'with', 'you', 'your'\n  ]);\n\n  const SEARCH_SYNONYMS = {\n    anthem: ['song'],\n    confession: ['declaration'],\n    founder: ['founded', 'history', 'began'],\n    founded: ['founder', 'history', 'began'],\n    founders: ['founded', 'history'],\n    origin: ['history', 'began', 'founded'],\n    history: ['founded', 'began', 'origin'],\n    discipline: ['conduct', 'behaviour', 'behavior'],\n    bullying: ['harassment', 'wellbeing', 'safety'],\n    parent: ['parents', 'family'],\n    parents: ['parent', 'family']\n  };\n\n  function searchTokens(q) {\n    return normalize(q)\n      .split(' ')\n      .map((token) => token.trim())\n      .filter((token) => token.length > 1 && !SEARCH_STOP_WORDS.has(token));\n  }\n\n  function tokenVariants(token) {\n    return [token].concat(SEARCH_SYNONYMS[token] || []);\n  }\n\n  function websiteIndexAnswer(q, requestedSchool) {\n    const index = window.RFA_SITE_INDEX && Array.isArray(window.RFA_SITE_INDEX.entries)\n      ? window.RFA_SITE_INDEX.entries\n      : [];\n    if (!index.length) return null;\n\n    const tokens = searchTokens(q);\n    if (!tokens.length) return null;\n    const phrase = tokens.join(' ');\n\n    const scored = index.map((entry) => {\n      const heading = normalize(entry.heading || '');\n      const page = normalize(entry.page || '');\n      const text = normalize(entry.text || '');\n      const path = normalize(entry.path || '');\n      let score = 0;\n      let matched = 0;\n\n      tokens.forEach((token) => {\n        const variants = tokenVariants(token);\n        let tokenMatched = false;\n        variants.forEach((variant) => {\n          if (heading.includes(variant)) { score += 14; tokenMatched = true; }\n          else if (page.includes(variant)) { score += 8; tokenMatched = true; }\n          if (text.includes(variant)) { score += 5; tokenMatched = true; }\n          if (path.includes(variant)) score += 2;\n        });\n        if (tokenMatched) matched += 1;\n      });\n\n      if (phrase.length > 3) {\n        if (heading.includes(phrase)) score += 28;\n        if (page.includes(phrase)) score += 16;\n        if (text.includes(phrase)) score += 12;\n      }\n      if (requestedSchool && entry.site === requestedSchool) score += 9;\n      else if (requestedSchool && entry.site !== requestedSchool && entry.site !== 'main') score -= 4;\n\n      const requiredMatches = tokens.length <= 2 ? 1 : Math.ceil(tokens.length * 0.5);\n      if (matched < requiredMatches) score = 0;\n      return { entry, score, matched };\n    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);\n\n    if (!scored.length || scored[0].score < 9) return null;\n    const best = scored[0];\n    const related = scored\n      .filter((item) => item.entry.url === best.entry.url && item.entry.heading === best.entry.heading)\n      .slice(0, 4);\n\n    const pieces = [];\n    related.forEach((item) => {\n      const value = String(item.entry.text || '').trim();\n      if (value && !pieces.includes(value)) pieces.push(value);\n    });\n    let text = pieces.join(' ').replace(/\\s+/g, ' ').trim();\n    if (!text) return null;\n    if (text.length > 1800) {\n      const cut = text.lastIndexOf('. ', 1800);\n      text = text.slice(0, cut > 900 ? cut + 1 : 1800).trim() + '…';\n    }\n\n    const heading = best.entry.heading || best.entry.page || 'RFA website information';\n    return `<strong>${escapeHtml(heading)}</strong><br>${escapeHtml(text)}<br>${pageLink(best.entry.url, 'View this on the RFA website')}`;\n  }\n`;

  if (!source.includes(includesAnyNeedle)) throw new Error('Could not find includesAny insertion point in rfa-ai.js');
  source = source.replace(includesAnyNeedle, includesAnyNeedle + searchHelpers);

  const genericNeedle = "    if (requestedSchool && includesAny(q, ['tell me about', 'about the school', 'school information', 'what is', 'what do you offer'])) {";
  const genericReplacement = "    const websiteAnswer = websiteIndexAnswer(q, requestedSchool);\n    if (websiteAnswer) return websiteAnswer;\n\n    if (requestedSchool && includesAny(q, ['tell me about', 'about the school', 'school information', 'what do you offer'])) {";
  if (!source.includes(genericNeedle)) throw new Error('Could not find broad school fallback in rfa-ai.js');
  source = source.replace(genericNeedle, genericReplacement);

  const submitNeedle = "  form.addEventListener('submit', (event) => {";
  if (!source.includes(submitNeedle)) throw new Error('Could not find submit handler in rfa-ai.js');
  source = source.replace(submitNeedle, "  form.addEventListener('submit', async (event) => {");

  const answerNeedle = '    const html = answer(query);';
  if (!source.includes(answerNeedle)) throw new Error('Could not find answer(query) call in rfa-ai.js');
  source = source.replace(answerNeedle, '    await RFA_SITE_INDEX_READY;\n    const html = answer(query);');

  fs.writeFileSync(AI_PATH, source, 'utf8');
  console.log('Upgraded shared/js/rfa-ai.js to search the generated website index.');
} else {
  console.log('RFA Guide website-search upgrade already applied.');
}

let headers = fs.existsSync(HEADERS_PATH) ? fs.readFileSync(HEADERS_PATH, 'utf8') : '';
const additions = [
  ['/shared/js/rfa-ai.js', '  Cache-Control: no-cache, must-revalidate, max-age=0'],
  ['/shared/js/rfa-site-index.js', '  Cache-Control: no-cache, must-revalidate, max-age=0']
];
for (const [route, rule] of additions) {
  if (!headers.includes(route)) headers += `${headers.endsWith('\n') || !headers ? '' : '\n'}${route}\n${rule}\n`;
}
fs.writeFileSync(HEADERS_PATH, headers, 'utf8');
