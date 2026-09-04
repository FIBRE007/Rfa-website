import fs from 'node:fs';
import path from 'node:path';

const roots = ['highschool','nurseryandprimaryschool','sixthform'];
const sourceFiles = ['shared/js/archive-content.js','scripts/staticize-rfa-archive.mjs'];

const replacements = [
  ["The former RFA framework describes outcomes across four connected areas. Open any area to see the complete set of expectations.", "RFA's expected student outcomes are organised across four connected areas. Open any area to see the complete set of expectations."],
  ["The former school FAQ published a High School planning ratio of approximately 15 learners to 1 teacher.", "The High School planning ratio is approximately 15 learners to 1 teacher."],
  ["The published school guide lists a High School planning ratio of approximately 15 learners to 1 teacher.", "The High School planning ratio is approximately 15 learners to 1 teacher."],
  ["The former school FAQ published planning ratios of approximately 10:1 in Nursery and 12:1 in Primary.", "Planning ratios are approximately 10:1 in Nursery and 12:1 in Primary."],
  ["The published school guide lists planning ratios of approximately 10:1 in Nursery and 12:1 in Primary.", "Planning ratios are approximately 10:1 in Nursery and 12:1 in Primary."],
  ["The former school FAQ states that learners from other faith backgrounds may be admitted while the school's Christian identity and programme remain clearly expressed.", "Learners from other faith backgrounds may be admitted while the school's Christian identity and programme remain clearly expressed."],
  ["RFA's former FAQ states that the Academy serves both Nigerian and international students.", "RFA serves both Nigerian and international students."],
  ["Published facilities include", "Facilities include"],
  ["Published language provision includes", "Language provision includes"],
  ["Practical information from the former site is preserved here in a compact form.", "Practical information for learners and families is presented here in a compact form."],
  ["The former site carried practical information on uniform, visitors, the school day and policies. It is preserved here in a compact form.", "Practical information on uniform, visitors, the school day and policies is presented here in a compact form."],
  ["The former admission guidance states that requests for a particular teacher or class are not normally accommodated.", "Requests for a particular teacher or class are not normally accommodated."],
  ["The former Sixth Form curriculum information lists WASSCE, NECO, IGCSE or an equivalent qualification as the normal starting point, with at least five relevant credits including English Language and Mathematics. It also describes an entrance assessment and student/parent interview as part of admission.", "Applicants are expected to hold WASSCE, NECO, IGCSE or an equivalent qualification, with at least five relevant credits including English Language and Mathematics. An entrance assessment and student/parent interview form part of the admission process."],
  ["Published Sixth Form entry profile", "Sixth Form entry requirements"],
  ["The current age tables published by each RFA school remain the first reference point.", "The current age tables for each RFA school remain the first reference point."],
  ["RFA's published policy states that admission is open without discrimination on the basis of race, colour, nationality or ethnic origin.", "Admission is open without discrimination on the basis of race, colour, nationality or ethnic origin."],
  ["RFA's published policy describes a 40-week academic year running from September to July, organised into three terms of approximately thirteen weeks.", "RFA operates a 40-week academic year running from September to July, organised into three terms of approximately thirteen weeks."],
  ["RFA's former site records a long tradition of practical outreach to families and communities, alongside an organised alumni network.", "RFA has a long tradition of practical outreach to families and communities, alongside an organised alumni network."],
  ["The former site states that the RFA Alumni Association was formally established on 27 July 2019 and had grown to more than 250 Royal Ambassadors. Because office holders can change, current alumni leadership should be confirmed before relying on historical officer names.", "The RFA Alumni Association was formally established on 27 July 2019 and grew to more than 250 Royal Ambassadors."],
  ["The former site states that the RFA Alumni Association was formally established on 27 July 2019 and had grown to more than 250 Royal Ambassadors.", "The RFA Alumni Association was formally established on 27 July 2019 and grew to more than 250 Royal Ambassadors."],
  ["Because office holders can change, current alumni leadership should be confirmed before relying on historical officer names.", ""],
  ["RFA Sixth Form's published materials connect its pre-university offer with international examination and university-entry pathways.", "RFA Sixth Form connects its pre-university offer with international examination and university-entry pathways."],
  ["Published examination relationships", "Examination relationships"],
  ["The former site identified Cambridge International and the British Council among its academic/examination relationships and described RFA as an attached centre for Cambridge IGCSE/CIE.", "RFA's academic and examination relationships include Cambridge International and the British Council, and RFA serves as an attached centre for Cambridge IGCSE/CIE."],
  ["The former site identified Cambridge International and the British Council among its academic/examination relationships and described RFA as an attached centre for Cambridge IGCSE/CIE", "RFA's academic and examination relationships include Cambridge International and the British Council, and RFA serves as an attached centre for Cambridge IGCSE/CIE"],
  ["The former site", "RFA"],
  ["the former site", "RFA"],
  ["The former school FAQ", "RFA"],
  ["the former school FAQ", "RFA"],
  ["RFA's former FAQ", "RFA"],
  ["the former RFA framework", "RFA's framework"],
  ["The former RFA framework", "RFA's framework"],
  ["RFA's published materials", "RFA's programme"],
  ["RFA's published policy", "RFA policy"],
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(ent => {
    const p = path.join(dir, ent.name);
    return ent.isDirectory() ? walk(p) : [p];
  });
}

const htmlFiles = roots.flatMap(root => walk(root).filter(f => f.endsWith('.html')));
const files = [...htmlFiles, ...sourceFiles.filter(fs.existsSync)];

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  for (const [from, to] of replacements) text = text.split(from).join(to);
  if (text !== before) fs.writeFileSync(file, text);
}

const forbidden = [
  /former site/i,
  /former school FAQ/i,
  /former FAQ/i,
  /former RFA framework/i,
  /published school guide/i,
  /RFA's published policy/i,
  /RFA's published materials/i,
  /historical officer names/i,
  /recovered content/i,
  /archived content/i,
];

const failures = [];
for (const file of htmlFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const re of forbidden) {
    if (re.test(text)) failures.push(`${file}: ${re}`);
  }
}

if (failures.length) {
  console.error('Visitor-facing provenance wording remains:\n' + failures.join('\n'));
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} visitor-facing HTML files. Provenance wording cleaned.`);
