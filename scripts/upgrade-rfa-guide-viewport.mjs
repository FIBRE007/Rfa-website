import fs from 'node:fs';

const AI_PATH = 'shared/js/rfa-ai.js';
const MARKER = 'RFA Guide visual viewport layer v5';

let source = fs.readFileSync(AI_PATH, 'utf8');
let changed = false;

if (!source.includes(MARKER)) {
  const reducedMotionNeedle = "  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n";
  if (!source.includes(reducedMotionNeedle)) throw new Error('Could not find RFA Guide viewport insertion point.');

  const viewportLayer = `\n  // ${MARKER}: follow the actually visible Android/iOS viewport when the keyboard opens.\n  const mobileViewportQuery = window.matchMedia ? window.matchMedia('(max-width: 480px)') : { matches: false };\n  let mobileViewportRaf = null;\n\n  function resetMobileViewport() {\n    ['top', 'bottom', 'height', 'min-height', 'max-height'].forEach((prop) => panel.style.removeProperty(prop));\n  }\n\n  function syncMobileViewport(stickToBottom = false) {\n    if (!root.classList.contains('is-open') || !mobileViewportQuery.matches) {\n      resetMobileViewport();\n      return;\n    }\n\n    const viewport = window.visualViewport;\n    const visibleHeight = Math.max(280, Math.round(viewport ? viewport.height : window.innerHeight));\n    const visibleTop = Math.max(0, Math.round(viewport ? viewport.offsetTop : 0));\n\n    // Inline important values deliberately override mobile browser viewport quirks\n    // and the CSS 100dvh fallback while the software keyboard is visible.\n    panel.style.setProperty('top', visibleTop + 'px', 'important');\n    panel.style.setProperty('bottom', 'auto', 'important');\n    panel.style.setProperty('height', visibleHeight + 'px', 'important');\n    panel.style.setProperty('min-height', visibleHeight + 'px', 'important');\n    panel.style.setProperty('max-height', visibleHeight + 'px', 'important');\n\n    if (stickToBottom) {\n      requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });\n    }\n  }\n\n  function queueMobileViewport(stickToBottom = false) {\n    if (mobileViewportRaf) cancelAnimationFrame(mobileViewportRaf);\n    mobileViewportRaf = requestAnimationFrame(() => {\n      mobileViewportRaf = null;\n      syncMobileViewport(stickToBottom);\n    });\n  }\n\n  function focusComposer() {\n    try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }\n    queueMobileViewport(true);\n    // Android keyboard/browser chrome often settles over several animation frames.\n    setTimeout(() => queueMobileViewport(true), 80);\n    setTimeout(() => queueMobileViewport(true), 280);\n  }\n\n  if (window.visualViewport) {\n    window.visualViewport.addEventListener('resize', () => queueMobileViewport(true), { passive: true });\n    window.visualViewport.addEventListener('scroll', () => queueMobileViewport(false), { passive: true });\n  }\n  window.addEventListener('resize', () => queueMobileViewport(true), { passive: true });\n  window.addEventListener('orientationchange', () => setTimeout(() => queueMobileViewport(true), 120), { passive: true });\n  if (mobileViewportQuery.addEventListener) {\n    mobileViewportQuery.addEventListener('change', () => queueMobileViewport(true));\n  }\n`;

  source = source.replace(reducedMotionNeedle, reducedMotionNeedle + viewportLayer);

  const openStart = source.indexOf('  function open() {');
  const openEnd = source.indexOf('\n  function close() {', openStart);
  if (openStart < 0 || openEnd < 0) throw new Error('Could not find open() in RFA Guide.');
  let openBlock = source.slice(openStart, openEnd);
  if (!openBlock.includes('    input.focus();')) throw new Error('Could not find input focus in open().');
  openBlock = openBlock.replace('    input.focus();', '    queueMobileViewport(true);\n    focusComposer();');
  source = source.slice(0, openStart) + openBlock + source.slice(openEnd);

  const closeStart = source.indexOf('  function close() {');
  const closeEnd = source.indexOf('\n  launcher.addEventListener', closeStart);
  if (closeStart < 0 || closeEnd < 0) throw new Error('Could not find close() in RFA Guide.');
  let closeBlock = source.slice(closeStart, closeEnd);
  if (!closeBlock.includes("    root.classList.remove('is-open');")) throw new Error('Could not find close class removal.');
  closeBlock = closeBlock.replace("    root.classList.remove('is-open');", "    root.classList.remove('is-open');\n    resetMobileViewport();");
  source = source.slice(0, closeStart) + closeBlock + source.slice(closeEnd);

  const focusListenerNeedle = "  input.addEventListener('focus', () => {\n    if (root.classList.contains('is-open') && !speakingTimer) setAvatarState('listening');\n  });";
  if (!source.includes(focusListenerNeedle)) throw new Error('Could not find input focus listener.');
  source = source.replace(
    focusListenerNeedle,
    "  input.addEventListener('focus', () => {\n    if (root.classList.contains('is-open') && !speakingTimer) setAvatarState('listening');\n    queueMobileViewport(true);\n    setTimeout(() => queueMobileViewport(true), 220);\n  });"
  );

  const answerFocusNeedle = "      input.disabled = false;\n      sendButton.disabled = false;\n      input.focus();";
  if (!source.includes(answerFocusNeedle)) throw new Error('Could not find post-answer composer focus.');
  source = source.replace(
    answerFocusNeedle,
    "      input.disabled = false;\n      sendButton.disabled = false;\n      focusComposer();"
  );

  fs.writeFileSync(AI_PATH, source, 'utf8');
  changed = true;
}

if (!source.includes(MARKER)) throw new Error('Visual viewport layer was not applied.');
console.log(changed
  ? 'Upgraded RFA Guide to follow the live mobile visual viewport.'
  : 'RFA Guide visual viewport handling is already current.');
