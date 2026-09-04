import fs from 'node:fs';

const AI_PATH = 'shared/js/rfa-ai.js';
const KNOWLEDGE_PATH = 'shared/js/rfa-knowledge.js';
const INTENT_MARKER = 'RFA Guide semantic intent layer v3';

let ai = fs.readFileSync(AI_PATH, 'utf8');
let knowledge = fs.readFileSync(KNOWLEDGE_PATH, 'utf8');
let aiChanged = false;
let knowledgeChanged = false;

const aliasReplacements = [
  [
    "{ stage: 'Junior High 1', aliases: ['jh1', 'jh 1', 'jhs1', 'jhs 1', 'junior high one'], minAge: '11 years' }",
    "{ stage: 'Junior High 1', aliases: ['jh1', 'jh 1', 'jhs1', 'jhs 1', 'js1', 'js 1', 'jss1', 'jss 1', 'junior high one', 'junior secondary 1', 'junior secondary one'], minAge: '11 years' }"
  ],
  [
    "{ stage: 'Junior High 2', aliases: ['jh2', 'jh 2', 'jhs2', 'jhs 2', 'junior high two'], minAge: '12 years' }",
    "{ stage: 'Junior High 2', aliases: ['jh2', 'jh 2', 'jhs2', 'jhs 2', 'js2', 'js 2', 'jss2', 'jss 2', 'junior high two', 'junior secondary 2', 'junior secondary two'], minAge: '12 years' }"
  ],
  [
    "{ stage: 'Junior High 3', aliases: ['jh3', 'jh 3', 'jhs3', 'jhs 3', 'junior high three'], minAge: '13 years' }",
    "{ stage: 'Junior High 3', aliases: ['jh3', 'jh 3', 'jhs3', 'jhs 3', 'js3', 'js 3', 'jss3', 'jss 3', 'junior high three', 'junior secondary 3', 'junior secondary three'], minAge: '13 years' }"
  ],
  [
    "{ stage: 'Senior High 1', aliases: ['sh1', 'sh 1', 'shs1', 'shs 1', 'senior high one'], minAge: '14 years' }",
    "{ stage: 'Senior High 1', aliases: ['sh1', 'sh 1', 'shs1', 'shs 1', 'ss1', 'ss 1', 'sss1', 'sss 1', 'senior high one', 'senior secondary 1', 'senior secondary one'], minAge: '14 years' }"
  ],
  [
    "{ stage: 'Senior High 2', aliases: ['sh2', 'sh 2', 'shs2', 'shs 2', 'senior high two'], minAge: '15 years' }",
    "{ stage: 'Senior High 2', aliases: ['sh2', 'sh 2', 'shs2', 'shs 2', 'ss2', 'ss 2', 'sss2', 'sss 2', 'senior high two', 'senior secondary 2', 'senior secondary two'], minAge: '15 years' }"
  ],
  [
    "{ stage: 'Senior High 3', aliases: ['sh3', 'sh 3', 'shs3', 'shs 3', 'senior high three'], minAge: '16 years' }",
    "{ stage: 'Senior High 3', aliases: ['sh3', 'sh 3', 'shs3', 'shs 3', 'ss3', 'ss 3', 'sss3', 'sss 3', 'senior high three', 'senior secondary 3', 'senior secondary three'], minAge: '16 years' }"
  ]
];

for (const [before, after] of aliasReplacements) {
  if (knowledge.includes(after)) continue;
  if (!knowledge.includes(before)) throw new Error(`Could not find age alias row: ${before}`);
  knowledge = knowledge.replace(before, after);
  knowledgeChanged = true;
}

if (!ai.includes(INTENT_MARKER)) {
  const schoolRegexBefore = "    if (/\\b(high school|junior high|senior high|jh\\s*[123]|jhs\\s*[123]|sh\\s*[123]|shs\\s*[123])\\b/.test(q)) return 'highschool';";
  const schoolRegexAfter = "    if (/\\b(high school|secondary school|junior high|junior secondary|senior high|senior secondary|jh\\s*[123]|jhs\\s*[123]|js\\s*[123]|jss\\s*[123]|sh\\s*[123]|shs\\s*[123]|ss\\s*[123]|sss\\s*[123])\\b/.test(q)) return 'highschool';";
  if (!ai.includes(schoolRegexBefore)) throw new Error('Could not find High School detection regex.');
  ai = ai.replace(schoolRegexBefore, schoolRegexAfter);

  const answerNeedle = '  function answer(query) {';
  if (!ai.includes(answerNeedle)) throw new Error('Could not find answer(query) in rfa-ai.js');

  const helpers = `  // ${INTENT_MARKER}: understand common natural-language ways of asking verified RFA questions.\n  function expandIntentLanguage(value) {\n    let q = normalize(value);\n    const additions = [];\n    const add = (...words) => additions.push(...words);\n\n    if (/\\bhow old\\b|\\bold enough\\b|\\bwhat age\\b|\\bage limit\\b/.test(q)) add('age', 'minimum', 'eligibility');\n    if (/\\bhow (?:do|can) i apply\\b|\\bhow (?:do|can) we apply\\b|\\benrol(?:l)? my child\\b|\\bregister my child\\b/.test(q)) add('admission', 'application', 'registration');\n    if (/\\bwhat do (?:you|they) teach\\b|\\bwhat subjects are (?:there|offered)\\b|\\bsubjects offered\\b/.test(q)) add('curriculum', 'subjects');\n    if (/\\bwho (?:runs|leads|heads)\\b|\\bwho is in charge\\b/.test(q)) add('leadership');\n    if (/\\bwhere (?:are you|is rfa|is the school)\\b/.test(q)) add('location', 'address');\n    if (/\\bwhen does (?:school|rfa) open\\b|\\bwhat time does (?:school|rfa) open\\b/.test(q)) add('opening time', 'school day');\n    if (/\\bwhen does (?:school|rfa) close\\b|\\bwhat time does (?:school|rfa) close\\b/.test(q)) add('closing time', 'school day');\n    if (/\\bspecial education\\b|\\badditional learning needs\\b/.test(q)) add('special needs', 'learning support');\n    if (/\\bcan (?:my|our) (?:child|son|daughter) (?:enter|be admitted|apply)\\b/.test(q)) add('age', 'eligibility', 'admission');\n\n    return additions.length ? normalize(q + ' ' + additions.join(' ')) : q;\n  }\n\n  function extractStatedAge(q) {\n    let match = q.match(/\\b(\\d+(?:\\.\\d+)?)\\s*(months?|mos?|years?|yrs?|years? old|year old)\\b/);\n    if (match) {\n      const unit = /month|mos?/.test(match[2]) ? 'months' : 'years';\n      return { value: Number(match[1]), unit };\n    }\n    match = q.match(/\\b(?:aged?|is)\\s+(\\d+(?:\\.\\d+)?)\\b/);\n    if (match) return { value: Number(match[1]), unit: 'years' };\n    return null;\n  }\n\n  function ageToMonths(value, unit) {\n    if (!Number.isFinite(value)) return null;\n    return unit === 'months' ? value : value * 12;\n  }\n\n  function requirementToMonths(value) {\n    const text = normalize(value);\n    const number = Number((text.match(/\\d+(?:\\.\\d+)?/) || [])[0]);\n    if (!Number.isFinite(number)) return null;\n    return text.includes('month') ? number : number * 12;\n  }\n\n  function isAgeIntent(q) {\n    return includesAny(q, ['age', 'old', 'eligible', 'eligibility', 'entry', 'minimum', 'admission', 'admit', 'apply', 'year']) ||\n      /\\bcan (?:my|our) (?:child|son|daughter)\\b/.test(q);\n  }\n\n  function ageIntentAnswer(ageHit, q) {\n    const requirement = ageHit.entry.minAge;\n    const page = KB.pages[ageHit.school].admissions || KB.pages[ageHit.school].home;\n    const stated = extractStatedAge(q);\n\n    if (!stated) {\n      return \`The minimum entry age currently listed for <strong>\${escapeHtml(ageHit.entry.stage)}</strong> is <strong>\${escapeHtml(requirement)}</strong>. \${pageLink(page, 'See admissions information')}\`;\n    }\n\n    const childMonths = ageToMonths(stated.value, stated.unit);\n    const requiredMonths = requirementToMonths(requirement);\n    if (childMonths === null || requiredMonths === null) {\n      return \`The minimum entry age currently listed for <strong>\${escapeHtml(ageHit.entry.stage)}</strong> is <strong>\${escapeHtml(requirement)}</strong>. \${pageLink(page, 'See admissions information')}\`;\n    }\n\n    const statedLabel = \`\${stated.value} \${stated.unit}\`;
    if (childMonths < requiredMonths) {\n      return \`Based on the published age requirement, a child aged <strong>\${escapeHtml(statedLabel)}</strong> would not yet meet the minimum entry age of <strong>\${escapeHtml(requirement)}</strong> for <strong>\${escapeHtml(ageHit.entry.stage)}</strong>. \${pageLink(page, 'See admissions information')}\`;\n    }\n\n    const assessmentNote = ageHit.school === 'sixthform'\n      ? 'Please confirm the current programme-specific entry requirements with Sixth Form Admissions.'\n      : 'Meeting the minimum age does not by itself guarantee admission; RFA also uses its published admission and assessment process.';\n    return \`A child aged <strong>\${escapeHtml(statedLabel)}</strong> meets the published minimum age of <strong>\${escapeHtml(requirement)}</strong> for <strong>\${escapeHtml(ageHit.entry.stage)}</strong>. \${escapeHtml(assessmentNote)} \${pageLink(page, 'See admissions information')}\`;\n  }\n\n`;

  ai = ai.replace(answerNeedle, helpers + answerNeedle);

  ai = ai.replace(
    "    const q = normalize(query);\n    const requestedSchool = detectSchool(q);\n    const ageHit = findAgeEntry(q);",
    "    const q = expandIntentLanguage(query);\n    const requestedSchool = detectSchool(q);\n    const ageHit = findAgeEntry(q);"
  );

  const oldAgeBlock = "    if (ageHit && includesAny(q, ['age', 'old', 'eligible', 'eligibility', 'entry', 'minimum', 'admission', 'admit', 'apply', 'year'])) {\n      return `The minimum entry age currently listed for <strong>${escapeHtml(ageHit.entry.stage)}</strong> is <strong>${escapeHtml(ageHit.entry.minAge)}</strong>. ${pageLink(KB.pages[ageHit.school].admissions || KB.pages[ageHit.school].home, 'See admissions information')}`;\n    }";
  const newAgeBlock = "    if (ageHit && isAgeIntent(q)) return ageIntentAnswer(ageHit, q);";
  if (!ai.includes(oldAgeBlock)) throw new Error('Could not find existing specific age answer block.');
  ai = ai.replace(oldAgeBlock, newAgeBlock);

  const tokenNeedle = '    const tokens = searchTokens(q);';
  if (!ai.includes(tokenNeedle)) throw new Error('Could not find website search tokenization.');
  ai = ai.replace(tokenNeedle, '    const tokens = searchTokens(expandIntentLanguage(q));');

  aiChanged = true;
}

if (knowledgeChanged) fs.writeFileSync(KNOWLEDGE_PATH, knowledge, 'utf8');
if (aiChanged) fs.writeFileSync(AI_PATH, ai, 'utf8');

if (!ai.includes(INTENT_MARKER)) throw new Error('Semantic intent marker was not applied.');
if (!knowledge.includes("'sss 1'")) throw new Error('Senior-secondary aliases were not applied.');
if (!knowledge.includes("'jss 1'")) throw new Error('Junior-secondary aliases were not applied.');

console.log(aiChanged || knowledgeChanged
  ? 'Upgraded RFA Guide with semantic intent handling and broader class aliases.'
  : 'RFA Guide semantic intent layer is already current.');
