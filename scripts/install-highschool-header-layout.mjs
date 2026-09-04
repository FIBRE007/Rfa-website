import fs from 'node:fs';
import path from 'node:path';

const HIGH_SCHOOL_DIR = 'highschool';
const STYLESHEET = '<link rel="stylesheet" href="https://assets.royalfamilyacademy.org/shared/css/highschool-header.css?v=20260904-two-row-1">';

const files = fs.readdirSync(HIGH_SCHOOL_DIR)
  .filter((name) => name.endsWith('.html'))
  .map((name) => path.join(HIGH_SCHOOL_DIR, name));

let changed = 0;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-site="highschool"')) continue;
  if (html.includes('highschool-header.css')) continue;

  const componentLink = /(<link rel="stylesheet" href="https:\/\/assets\.royalfamilyacademy\.org\/shared\/css\/components\.css[^>]*>)/;
  if (!componentLink.test(html)) {
    throw new Error(`Could not find components.css link in ${file}`);
  }

  html = html.replace(componentLink, `$1\n${STYLESHEET}`);
  fs.writeFileSync(file, html, 'utf8');
  changed += 1;
}

if (!changed) {
  console.log('High School header stylesheet already installed on all pages.');
} else {
  console.log(`Installed High School header stylesheet on ${changed} page(s).`);
}
