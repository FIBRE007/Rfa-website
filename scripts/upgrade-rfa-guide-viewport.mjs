import fs from 'node:fs';

const AI_PATH = 'shared/js/rfa-ai.js';
const OLD_MARKERS = [
  'RFA Guide visual viewport layer v5',
  'RFA Guide mobile layout viewport layer v8'
];
const MARKER = 'RFA Guide keyboard-safe mobile viewport layer v9';

let source = fs.readFileSync(AI_PATH, 'utf8');
let changed = false;

if (!source.includes(MARKER)) {
  let layerStart = -1;
  for (const oldMarker of OLD_MARKERS) {
    const index = source.indexOf(`  // ${oldMarker}`);
    if (index >= 0) {
      layerStart = index;
      break;
    }
  }
  const layerEnd = source.indexOf('\n  let idleTimer = null;', layerStart);
  if (layerStart < 0 || layerEnd < 0) {
    throw new Error('Could not find the existing RFA Guide mobile viewport layer.');
  }

  const viewportLayer = `  // ${MARKER}: use the keyboard-safe visual viewport from the first mobile focus.\n  // The RFA Guide root still covers the whole page so no underlying website strip\n  // shows through, while the panel itself ends immediately above the keyboard.\n  const mobileViewportQuery = window.matchMedia ? window.matchMedia('(max-width: 480px)') : { matches: false };\n  let mobileViewportRaf = null;\n\n  function resetMobileViewport() {\n    ['top', 'bottom', 'left', 'right', 'width', 'height', 'min-height', 'max-height', 'background', 'overflow'].forEach((prop) => root.style.removeProperty(prop));\n    ['top', 'bottom', 'height', 'min-height', 'max-height'].forEach((prop) => panel.style.removeProperty(prop));\n  }\n\n  function syncMobileViewport(stickToBottom = false) {\n    if (!root.classList.contains('is-open') || !mobileViewportQuery.matches) {\n      resetMobileViewport();\n      return;\n    }\n\n    // Keep an opaque full-screen layer behind the keyboard-safe chat panel.\n    root.style.setProperty('top', '0px', 'important');\n    root.style.setProperty('bottom', '0px', 'important');\n    root.style.setProperty('left', '0px', 'important');\n    root.style.setProperty('right', '0px', 'important');\n    root.style.setProperty('width', 'auto', 'important');\n    root.style.setProperty('height', 'auto', 'important');\n    root.style.setProperty('background', 'var(--rfa-warm-white)', 'important');\n    root.style.setProperty('overflow', 'hidden', 'important');\n\n    const viewport = window.visualViewport;\n    const visibleHeight = Math.max(280, Math.round(viewport ? viewport.height : (window.innerHeight || document.documentElement.clientHeight || 0)));\n    const visibleTop = Math.max(0, Math.round(viewport ? viewport.offsetTop : 0));\n\n    panel.style.setProperty('top', visibleTop + 'px', 'important');\n    panel.style.setProperty('bottom', 'auto', 'important');\n    panel.style.setProperty('height', visibleHeight + 'px', 'important');\n    panel.style.setProperty('min-height', visibleHeight + 'px', 'important');\n    panel.style.setProperty('max-height', visibleHeight + 'px', 'important');\n\n    if (stickToBottom) anchorLatestMessage();\n  }\n\n  function queueMobileViewport(stickToBottom = false) {\n    if (mobileViewportRaf) cancelAnimationFrame(mobileViewportRaf);\n    mobileViewportRaf = requestAnimationFrame(() => {\n      mobileViewportRaf = null;\n      syncMobileViewport(stickToBottom);\n    });\n  }\n\n  function focusComposer() {\n    try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }\n    // Re-measure through the entire keyboard animation. The first measurement can\n    // happen before Android reports the reduced visual viewport.\n    queueMobileViewport(true);\n    [40, 100, 180, 320, 520].forEach((delay) => {\n      setTimeout(() => queueMobileViewport(true), delay);\n    });\n  }\n\n  if (window.visualViewport) {\n    window.visualViewport.addEventListener('resize', () => queueMobileViewport(true), { passive: true });\n    window.visualViewport.addEventListener('scroll', () => queueMobileViewport(true), { passive: true });\n  }\n  window.addEventListener('resize', () => queueMobileViewport(true), { passive: true });\n  window.addEventListener('orientationchange', () => setTimeout(() => queueMobileViewport(true), 120), { passive: true });\n  if (mobileViewportQuery.addEventListener) {\n    mobileViewportQuery.addEventListener('change', () => queueMobileViewport(true));\n  }\n`;

  source = source.slice(0, layerStart) + viewportLayer + source.slice(layerEnd);
  fs.writeFileSync(AI_PATH, source, 'utf8');
  changed = true;
}

if (!source.includes(MARKER)) throw new Error('Keyboard-safe mobile viewport layer was not applied.');
for (const oldMarker of OLD_MARKERS) {
  if (source.includes(oldMarker)) throw new Error(`Old mobile viewport marker is still present: ${oldMarker}`);
}
console.log(changed
  ? 'Upgraded RFA Guide so the composer is keyboard-safe from the first mobile focus.'
  : 'RFA Guide keyboard-safe mobile viewport handling is already current.');
