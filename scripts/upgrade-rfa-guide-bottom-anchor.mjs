import fs from 'node:fs';

const AI_PATH = 'shared/js/rfa-ai.js';
const MARKER = 'RFA Guide bottom conversation anchor v6';

let ai = fs.readFileSync(AI_PATH, 'utf8');
let changed = false;

if (!ai.includes(MARKER)) {
  const styleNeedle = "  const frameStyles = document.createElement('style');";
  if (!ai.includes(styleNeedle)) throw new Error('Could not find RFA Guide frame styles.');
  ai = ai.replace(styleNeedle, `  // ${MARKER}: keep the newest mobile exchange immediately above the composer.\n${styleNeedle}`);

  const cssNeedle = "    .rfa-ai__avatar-frame { display:block;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none; }";
  if (!ai.includes(cssNeedle)) throw new Error('Could not find avatar frame CSS insertion point.');
  ai = ai.replace(cssNeedle, `${cssNeedle}\n    .rfa-ai__messages-spacer { display:none; }\n    @media(max-width:480px){\n      .rfa-ai.is-open .rfa-ai__messages-spacer { display:block;flex:0 0 auto;margin-top:auto;min-height:0;pointer-events:none; }\n    }`);

  const messagesNeedle = `      <div class="rfa-ai__messages" id="rfa-ai-messages">\n        <div class="rfa-ai__msg rfa-ai__msg--bot">`;
  if (!ai.includes(messagesNeedle)) throw new Error('Could not find RFA Guide messages markup.');
  ai = ai.replace(messagesNeedle, `      <div class="rfa-ai__messages" id="rfa-ai-messages">\n        <div class="rfa-ai__messages-spacer" aria-hidden="true"></div>\n        <div class="rfa-ai__msg rfa-ai__msg--bot">`);

  const reducedNeedle = "  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;";
  if (!ai.includes(reducedNeedle)) throw new Error('Could not find RFA Guide runtime insertion point.');
  ai = ai.replace(reducedNeedle, `${reducedNeedle}\n\n  function anchorLatestMessage() {\n    if (!root.classList.contains('is-open')) return;\n    const settle = () => { messages.scrollTop = messages.scrollHeight; };\n    requestAnimationFrame(() => {\n      settle();\n      requestAnimationFrame(settle);\n    });\n  }`);

  const viewportScroll = `    if (stickToBottom) {\n      requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });\n    }`;
  if (!ai.includes(viewportScroll)) throw new Error('Could not find visual viewport bottom-scroll block.');
  ai = ai.replace(viewportScroll, `    if (stickToBottom) anchorLatestMessage();`);

  const userScroll = `    messages.appendChild(userMsg);\n    messages.scrollTop = messages.scrollHeight;`;
  if (!ai.includes(userScroll)) throw new Error('Could not find user-message scroll block.');
  ai = ai.replace(userScroll, `    messages.appendChild(userMsg);\n    anchorLatestMessage();`);

  const botScroll = `      messages.appendChild(botMsg);\n      messages.scrollTop = messages.scrollHeight;`;
  if (!ai.includes(botScroll)) throw new Error('Could not find bot-message scroll block.');
  ai = ai.replace(botScroll, `      messages.appendChild(botMsg);\n      anchorLatestMessage();`);

  changed = true;
}

if (changed) fs.writeFileSync(AI_PATH, ai, 'utf8');
if (!ai.includes(MARKER)) throw new Error('Bottom conversation anchor marker was not applied.');
if (!ai.includes('rfa-ai__messages-spacer')) throw new Error('Conversation spacer was not applied.');
if (!ai.includes('anchorLatestMessage()')) throw new Error('Latest-message anchoring helper was not applied.');

console.log(changed
  ? 'Upgraded RFA Guide so the latest mobile exchange sits above the composer.'
  : 'RFA Guide latest-message anchoring is already current.');
