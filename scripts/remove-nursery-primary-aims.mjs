import fs from 'node:fs';

const file = 'nurseryandprimaryschool/about.html';
let html = fs.readFileSync(file, 'utf8');

const sectionPattern = /\n?<section class="section section--ivory" aria-labelledby="aims-heading">[\s\S]*?<\/section>\n?/;

if (!sectionPattern.test(html)) {
  throw new Error('Could not find the Nursery & Primary Aims section.');
}

html = html.replace(sectionPattern, '\n');
html = html.replace(
  'About Royal Family Academy Nursery &amp; Primary School, Abuja: school ethos, history, faith, leadership and aims.',
  'About Royal Family Academy Nursery &amp; Primary School, Abuja: school ethos, history, faith and leadership.'
);

if (html.includes('id="aims-heading"') || html.includes('>Our Aims<')) {
  throw new Error('Aims section still present after removal.');
}

fs.writeFileSync(file, html, 'utf8');
console.log('Removed the Aims section from Nursery & Primary About page.');
