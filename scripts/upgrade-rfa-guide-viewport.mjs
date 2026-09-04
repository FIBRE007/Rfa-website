import fs from 'node:fs';

const AI_PATH = 'shared/js/rfa-ai.js';
const OLD_MARKER = 'RFA Guide visual viewport layer v5';
const MARKER = 'RFA Guide mobile layout viewport layer v8';

let source = fs.readFileSync(AI_PATH, 'utf8');
let changed = false;

if (!source.includes(MARKER)) {
  const layerStart = source.indexOf(`  // ${OLD_MARKER}`);
  const layerEnd = source.indexOf('\n  let idleTimer = null;', layerStart);
  if (layerStart < 0 || layerEnd < 0) {
    throw new Error('Could not find the existing RFA Guide mobile viewport layer.');
  }

  const viewportLayer = `  // ${MARKER}: keep the chat panel filling the mobile page while the keyboard is open.\n  // Some Android browsers report a visualViewport height that is smaller than the\n  // actual usable webpage area, which leaves the underlying website exposed below\n  // the composer. Use the layout viewport height for the panel, and only use resize\n  // events to re-anchor the newest exchange above the composer.\n  const mobileViewportQuery = window.matchMedia ? window.matchMedia('(max-width: 480px)') : { matches: false };\n  let mobileViewportRaf = null;\n\n  function resetMobileViewport() {\n    ['top', 'bottom', 'height', 'min-height', 'max-height'].forEach((prop) => panel.style.removeProperty(prop));\n  }\n\n  function syncMobileViewport(stickToBottom = false) {\n    if (!root.classList.contains('is-open') || !mobileViewportQuery.matches) {\n      resetMobileViewport();\n      return;\n    }\n\n    const layoutHeight = Math.max(320, Math.round(window.innerHeight || document.documentElement.clientHeight || 0));\n\n    panel.style.setProperty('top', '0px', 'important');\n    panel.style.setProperty('bottom', 'auto', 'important');\n    panel.style.setProperty('height', layoutHeight + 'px', 'important');\n    panel.style.setProperty('min-height', layoutHeight + 'px', 'important');\n    panel.style.setProperty('max-height', layoutHeight + 'px', 'important');\n\n    if (stickToBottom) anchorLatestMessage();\n  }\n\n  function queueMobileViewport(stickToBottom = false) {\n    if (mobileViewportRaf) cancelAnimationFrame(mobileViewportRaf);\n    mobileViewportRaf = requestAnimationFrame(() => {\n      mobileViewportRaf = null;\n      syncMobileViewport(stickToBottom);\n    });\n  }\n\n  function focusComposer() {\n    try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }\n    queueMobileViewport(true);\n    // Let Android finish its keyboard/browser-toolbar animation, then re-anchor.\n    setTimeout(() => queueMobileViewport(true), 100);\n    setTimeout(() => queueMobileViewport(true), 320);\n  }\n\n  if (window.visualViewport) {\n    window.visualViewport.addEventListener('resize', () => queueMobileViewport(true), { passive: true });\n    window.visualViewport.addEventListener('scroll', () => queueMobileViewport(true), { passive: true });\n  }\n  window.addEventListener('resize', () => queueMobileViewport(true), { passive: true });\n  window.addEventListener('orientationchange', () => setTimeout(() => queueMobileViewport(true), 120), { passive: true });\n  if (mobileViewportQuery.addEventListener) {\n    mobileViewportQuery.addEventListener('change', () => queueMobileViewport(true));\n  }\n`;

  source = source.slice(0, layerStart) + viewportLayer + source.slice(layerEnd);
  fs.writeFileSync(AI_PATH, source, 'utf8');
  changed = true;
}

if (!source.includes(MARKER)) throw new Error('Mobile layout viewport layer was not applied.');
if (source.includes(OLD_MARKER)) throw new Error('Old visualViewport sizing layer is still present.');
console.log(changed
  ? 'Upgraded RFA Guide mobile keyboard layout so the panel fills the usable page.'
  : 'RFA Guide mobile keyboard layout is already current.');
