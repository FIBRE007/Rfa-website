import fs from 'node:fs';
import path from 'node:path';

const roots = ['index.html', 'main', 'nurseryandprimaryschool', 'highschool', 'sixthform'];
const faviconTag = '<link rel="icon" type="image/png" sizes="48x48" href="https://assets.royalfamilyacademy.org/shared/favicon.png?v=20260904-rfa-crest">';

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

const files = roots.flatMap((target) => collectHtml(target));
let changed = 0;

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  let html = original;
  const iconRegex = /<link\b[^>]*\brel=["'](?:shortcut\s+)?icon["'][^>]*>/gi;

  if (iconRegex.test(html)) {
    iconRegex.lastIndex = 0;
    html = html.replace(iconRegex, faviconTag);
    // If a page had more than one icon declaration, keep only one identical tag.
    const duplicate = new RegExp(`${faviconTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*${faviconTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    while (duplicate.test(html)) {
      duplicate.lastIndex = 0;
      html = html.replace(duplicate, faviconTag);
    }
  } else if (/<\/title>/i.test(html)) {
    html = html.replace(/<\/title>/i, `</title>\n${faviconTag}`);
  }

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    changed += 1;
  }
}

console.log(`Installed RFA crest favicon on ${changed} HTML file(s).`);
