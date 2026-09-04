import fs from 'node:fs';

const AI_PATH = 'shared/js/rfa-ai.js';
const OLD_MARKER = 'RFA Guide bottom-up conversation flow v7';
const MARKER = 'RFA Guide mobile-only bottom-up conversation flow v8';

let ai = fs.readFileSync(AI_PATH, 'utf8');
let changed = false;

if (!ai.includes(MARKER)) {
  if (ai.includes(OLD_MARKER)) {
    ai = ai.replace(OLD_MARKER, MARKER);
    changed = true;
  } else {
    const styleNeedle = "  const frameStyles = document.createElement('style');";
    if (!ai.includes(styleNeedle)) throw new Error('Could not find RFA Guide frame styles.');
    ai = ai.replace(styleNeedle, `  // ${MARKER}: on phones only, keep the conversation growing upward from the composer.\n${styleNeedle}`);
    changed = true;
  }

  const oldCss = `    .rfa-ai__messages-list {\n      min-height:100%;\n      min-width:0;\n      display:flex;\n      flex-direction:column;\n      justify-content:flex-end;\n      gap:var(--space-2xs);\n    }\n    @media(max-width:480px){\n      .rfa-ai.is-open .rfa-ai__messages-list { gap:.45rem; }\n    }`;

  const newCss = `    /* Desktop keeps the original message layout. */\n    .rfa-ai__messages-list { display:contents; }\n    @media(max-width:480px){\n      /* Mobile behaves like a messaging app: the first message sits directly\n         above the composer and each new exchange pushes earlier messages up. */\n      .rfa-ai.is-open .rfa-ai__messages { gap:0!important; }\n      .rfa-ai.is-open .rfa-ai__messages-list {\n        min-height:100%;\n        min-width:0;\n        width:100%;\n        display:flex;\n        flex-direction:column;\n        justify-content:flex-end;\n        gap:.45rem;\n      }\n    }`;

  if (ai.includes(oldCss)) {
    ai = ai.replace(oldCss, newCss);
    changed = true;
  } else if (!ai.includes('/* Desktop keeps the original message layout. */')) {
    const cssNeedle = "    .rfa-ai__avatar-frame { display:block;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none; }";
    if (!ai.includes(cssNeedle)) throw new Error('Could not find avatar frame CSS insertion point.');
    ai = ai.replace(cssNeedle, `${cssNeedle}\n${newCss}`);
    changed = true;
  }

  // If an older generated file still has the spacer model, convert it to the list model.
  const oldMarkupStart = `      <div class="rfa-ai__messages" id="rfa-ai-messages">\n        <div class="rfa-ai__messages-spacer" aria-hidden="true"></div>\n        <div class="rfa-ai__msg rfa-ai__msg--bot">`;
  const newMarkupStart = `      <div class="rfa-ai__messages" id="rfa-ai-messages">\n        <div class="rfa-ai__messages-list" id="rfa-ai-messages-list">\n          <div class="rfa-ai__msg rfa-ai__msg--bot">`;
  if (ai.includes(oldMarkupStart)) {
    ai = ai.replace(oldMarkupStart, newMarkupStart);
    const closeNeedle = `</div>\n      </div>\n      <div class="rfa-ai__actions">${'${chipsHtml}'}</div>`;
    const closeReplacement = `</div>\n        </div>\n      </div>\n      <div class="rfa-ai__actions">${'${chipsHtml}'}</div>`;
    if (!ai.includes(closeNeedle)) throw new Error('Could not close the RFA Guide message list.');
    ai = ai.replace(closeNeedle, closeReplacement);
    changed = true;
  }

  const messagesConst = "  const messages = root.querySelector('#rfa-ai-messages');";
  if (!ai.includes("const messageList = root.querySelector('#rfa-ai-messages-list')")) {
    if (!ai.includes(messagesConst)) throw new Error('Could not find messages runtime reference.');
    ai = ai.replace(messagesConst, `${messagesConst}\n  const messageList = root.querySelector('#rfa-ai-messages-list');`);
    changed = true;
  }

  if (ai.includes('messages.appendChild(userMsg);')) {
    ai = ai.replace('messages.appendChild(userMsg);', 'messageList.appendChild(userMsg);');
    changed = true;
  }
  if (ai.includes('messages.appendChild(botMsg);')) {
    ai = ai.replace('messages.appendChild(botMsg);', 'messageList.appendChild(botMsg);');
    changed = true;
  }
}

if (changed) fs.writeFileSync(AI_PATH, ai, 'utf8');
if (!ai.includes(MARKER)) throw new Error('Mobile-only bottom-up conversation marker was not applied.');
if (!ai.includes('rfa-ai__messages-list')) throw new Error('Bottom-anchored message list was not applied.');
if (!ai.includes('/* Desktop keeps the original message layout. */')) throw new Error('Desktop-preserving mobile-only CSS was not applied.');
if (!ai.includes("const messageList = root.querySelector('#rfa-ai-messages-list')")) throw new Error('Message list runtime reference was not applied.');
if (!ai.includes('messageList.appendChild(userMsg);')) throw new Error('User messages are not appended to the message list.');
if (!ai.includes('messageList.appendChild(botMsg);')) throw new Error('Bot messages are not appended to the message list.');

console.log(changed
  ? 'Upgraded RFA Guide to a mobile-only bottom-up conversation flow.'
  : 'RFA Guide mobile-only bottom-up conversation flow is already current.');