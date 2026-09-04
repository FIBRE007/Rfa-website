import fs from 'node:fs';
import path from 'node:path';

const FAVICON = 'https://media.royalfamilyacademy.org/academy/rfa-logo.png?v=20260904-favicon-1';
const ROOTS = ['index.html', 'main', 'nurseryandprimaryschool', 'highschool', 'sixthform'];

function collectHtml(target, out = []) {
  if (!fs.existsSync(target)) return out;
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (target.endsWith('.html')) out.push(target);
    return out;
  }
  for (const name of fs.readdirSync(target)) {
    collectHtml(path.join(target, name), out);
  }
  return out;
}

const files = ROOTS.flatMap((target) => collectHtml(target));
let changed = 0;

const faviconBlock = [
  `<link rel="icon" type="image/png" href="${FAVICON}">`,
  `<link rel="shortcut icon" type="image/png" href="${FAVICON}">`,
  `<link rel="apple-touch-icon" href="${FAVICON}">`,
  `<meta name="theme-color" content="#431677">`
].join('\n');

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  if (!/<head[\s>]/i.test(html)) continue;

  const before = html;
  html = html
    .replace(/\s*<link\b[^>]*\brel=["'](?:shortcut\s+icon|icon|apple-touch-icon)["'][^>]*>\s*/gi, '\n')
    .replace(/\s*<meta\b[^>]*\bname=["']theme-color["'][^>]*>\s*/gi, '\n');

  const viewportMatch = html.match(/<meta\b[^>]*\bname=["']viewport["'][^>]*>/i);
  if (viewportMatch) {
    html = html.replace(viewportMatch[0], `${viewportMatch[0]}\n${faviconBlock}`);
  } else {
    html = html.replace(/<head([^>]*)>/i, `<head$1>\n${faviconBlock}`);
  }

  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    changed += 1;
  }
}

if (!changed) throw new Error('No HTML files were updated with the RFA favicon.');
console.log(`Updated ${changed} HTML files with the RFA crest favicon.`);
