import fs from 'node:fs';

const AI_PATH = 'shared/js/rfa-ai.js';
const MARKER = 'RFA Guide native keyboard resize layer v10';

let source = fs.readFileSync(AI_PATH, 'utf8');
let changed = false;

if (!source.includes(MARKER)) {
  const layerPattern = /  \/\/ RFA Guide [^\n]*viewport layer v\d+:[\s\S]*?(?=\n  let idleTimer = null;)/;
  const layerMatch = source.match(layerPattern);
  if (!layerMatch) throw new Error('Could not find the existing RFA Guide mobile viewport layer.');

  const viewportLayer = `  // ${MARKER}: let the mobile browser resize the content viewport for the keyboard.\n  // Do not manually resize or translate the chat panel: that caused first-focus\n  // keyboard overlap and large blank gaps on Chromium-based Android browsers.\n  const mobileViewportQuery = window.matchMedia ? window.matchMedia('(max-width: 480px)') : { matches: false };\n  let mobileViewportRaf = null;\n  let pageScrollLocked = false;\n  let previousBodyOverflow = '';\n  let previousHtmlOverflow = '';\n\n  // Chromium supports interactive-widget=resizes-content. Apply it before the\n  // visitor focuses the composer so the layout viewport itself becomes keyboard-safe.\n  const viewportMeta = document.querySelector('meta[name="viewport"]');\n  if (viewportMeta) {\n    const currentViewport = viewportMeta.getAttribute('content') || 'width=device-width, initial-scale=1.0';\n    if (!/interactive-widget\\s*=/.test(currentViewport)) {\n      viewportMeta.setAttribute('content', currentViewport.replace(/\\s*,?\\s*$/, '') + ', interactive-widget=resizes-content');\n    }\n  }\n\n  // Where the Virtual Keyboard API is available, explicitly request resize rather\n  // than overlay behaviour as an additional Chromium safeguard.\n  try {\n    if (navigator.virtualKeyboard) navigator.virtualKeyboard.overlaysContent = false;\n  } catch (_) {}\n\n  function setMobilePageLock(locked) {\n    if (locked === pageScrollLocked) return;\n    if (locked) {\n      previousBodyOverflow = document.body.style.overflow;\n      previousHtmlOverflow = document.documentElement.style.overflow;\n      document.body.style.overflow = 'hidden';\n      document.documentElement.style.overflow = 'hidden';\n      pageScrollLocked = true;\n      return;\n    }\n    document.body.style.overflow = previousBodyOverflow;\n    document.documentElement.style.overflow = previousHtmlOverflow;\n    pageScrollLocked = false;\n  }\n\n  function resetMobileViewport() {\n    // Remove any inline dimensions left by older RFA Guide builds.\n    ['top', 'bottom', 'height', 'min-height', 'max-height'].forEach((prop) => panel.style.removeProperty(prop));\n    ['top', 'bottom', 'left', 'right', 'width', 'height', 'min-height', 'max-height', 'background', 'overflow'].forEach((prop) => root.style.removeProperty(prop));\n    setMobilePageLock(false);\n  }\n\n  function syncMobileViewport(stickToBottom = false) {\n    if (!root.classList.contains('is-open') || !mobileViewportQuery.matches) {\n      resetMobileViewport();\n      return;\n    }\n\n    // CSS 100dvh now follows the keyboard-safe resized layout viewport. Keep the\n    // underlying page still, but do not alter the panel's top/height at runtime.\n    setMobilePageLock(true);\n    if (stickToBottom) anchorLatestMessage();\n  }\n\n  function queueMobileViewport(stickToBottom = false) {\n    if (mobileViewportRaf) cancelAnimationFrame(mobileViewportRaf);\n    mobileViewportRaf = requestAnimationFrame(() => {\n      mobileViewportRaf = null;\n      syncMobileViewport(stickToBottom);\n    });\n  }\n\n  function focusComposer() {\n    try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }\n    queueMobileViewport(true);\n    // Re-anchor while Chromium completes the keyboard animation; no geometry is\n    // changed here, so these passes cannot create extra blank space.\n    [80, 180, 320].forEach((delay) => setTimeout(() => queueMobileViewport(true), delay));\n  }\n\n  if (window.visualViewport) {\n    window.visualViewport.addEventListener('resize', () => queueMobileViewport(true), { passive: true });\n  }\n  window.addEventListener('resize', () => queueMobileViewport(true), { passive: true });\n  window.addEventListener('orientationchange', () => setTimeout(() => queueMobileViewport(true), 120), { passive: true });\n  if (mobileViewportQuery.addEventListener) {\n    mobileViewportQuery.addEventListener('change', () => queueMobileViewport(true));\n  }\n`;

  source = source.replace(layerPattern, viewportLayer);
  fs.writeFileSync(AI_PATH, source, 'utf8');
  changed = true;
}

if (!source.includes(MARKER)) throw new Error('Native keyboard resize layer was not applied.');
if (source.includes("panel.style.setProperty('height'")) throw new Error('Manual mobile panel height sizing is still present.');
if (source.includes("panel.style.setProperty('top'")) throw new Error('Manual mobile panel top positioning is still present.');

console.log(changed
  ? 'Upgraded RFA Guide to native mobile keyboard resizing without manual panel movement.'
  : 'RFA Guide native mobile keyboard resizing is already current.');
