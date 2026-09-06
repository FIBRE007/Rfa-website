import fs from 'node:fs';
import path from 'node:path';

const roots = ['highschool', 'nurseryandprimaryschool', 'sixthform'];
const htmlFiles = roots.flatMap((root) => walk(root).filter((file) => file.endsWith('.html')));
const sourceFiles = [
  'shared/js/archive-content.js',
  'scripts/staticize-rfa-archive.mjs',
  'scripts/clean-public-copy.mjs'
].filter(fs.existsSync);
const files = [...htmlFiles, ...sourceFiles];

const exact = [
  ['The simple admission journey remains at the top of the page. These expandable notes preserve the fuller information from the former website.', 'The simple admission journey remains at the top of the page. These expandable notes provide additional information for families who need more detail.'],
  ['The former admission guidance states that requests for a particular teacher or class are not normally accommodated.', 'Requests for a particular teacher or class are not normally accommodated.'],
  ['Restores useful institutional content from the former RFA website without', 'Provides useful institutional content without'],
  ["RFA's former site records a long tradition of practical outreach to families and communities, alongside an organised alumni network.", 'RFA has a long tradition of practical outreach to families and communities, alongside an organised alumni network.'],
  ["RFA's former site records a long tradition of practical outreach to families and communities.", 'RFA has a long tradition of practical outreach to families and communities.'],
  ['Practical information from the former site is preserved here in a compact form.', 'Practical information for learners and families is presented here in a compact form.'],
  ['The former site carried practical information on uniform, visitors, the school day and policies. It is preserved here in a compact form.', 'Practical information on uniform, visitors, the school day and policies is presented here in a compact form.']
];

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  for (const [from, to] of exact) text = text.split(from).join(to);
  text = text
    .replace(/The former school FAQ/g, 'RFA')
    .replace(/the former school FAQ/g, 'RFA')
    .replace(/RFA's former FAQ/g, 'RFA')
    .replace(/The former RFA framework/g, "RFA's framework")
    .replace(/the former RFA framework/g, "RFA's framework")
    .replace(/The former site/g, 'RFA')
    .replace(/the former site/g, 'RFA');
  if (file.endsWith('.html')) {
    text = text
      .replace(/from the former website/gi, 'for families who need more detail')
      .replace(/former admission guidance/gi, 'admissions guidance');
  }
  if (text !== before) fs.writeFileSync(file, text);
}

const cleanPath = 'scripts/clean-public-copy.mjs';
let cleaner = fs.readFileSync(cleanPath, 'utf8');
if (!cleaner.includes('/former website/i,')) {
  cleaner = cleaner.replace('const forbidden = [\n', 'const forbidden = [\n  /former website/i,\n  /former admission guidance/i,\n  /former RFA website/i,\n');
}
if (!cleaner.includes('These expandable notes provide additional information for families who need more detail.')) {
  cleaner = cleaner.replace('const replacements = [\n', 'const replacements = [\n  ["The simple admission journey remains at the top of the page. These expandable notes preserve the fuller information from the former website.", "The simple admission journey remains at the top of the page. These expandable notes provide additional information for families who need more detail."],\n');
}
fs.writeFileSync(cleanPath, cleaner);

const forbidden = [
  /former website/i,
  /former admission guidance/i,
  /former school FAQ/i,
  /former FAQ/i,
  /former RFA framework/i,
  /former site/i,
  /recovered content/i,
  /archived content/i
];
const failures = [];
for (const file of htmlFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of forbidden) if (pattern.test(text)) failures.push(`${file}: ${pattern}`);
}
if (failures.length) {
  console.error('Public provenance copy remains:\n' + failures.join('\n'));
  process.exit(1);
}
console.log(`Checked ${htmlFiles.length} visitor-facing pages for obsolete provenance wording.`);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}
