import fs from 'node:fs';

const AI_PATH = 'shared/js/rfa-ai.js';
const MARKER = 'RFA Guide mobile draggable launcher v1';

let source = fs.readFileSync(AI_PATH, 'utf8');
let changed = false;

if (!source.includes(MARKER)) {
  const runtimeNeedle = "  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n";
  if (!source.includes(runtimeNeedle)) throw new Error('Could not find RFA Guide runtime insertion point.');

  const dragLayer = `
  // ${MARKER}: on phones the closed avatar starts bottom-right but can be dragged
  // out of the way. It snaps to the nearest side and remembers that position
  // for the current browsing session. Desktop remains unchanged.
  const mobileDragQuery = window.matchMedia ? window.matchMedia('(max-width: 480px)') : { matches: false };
  const LAUNCHER_POSITION_KEY = 'rfa-guide-mobile-launcher-position-v1';
  const LAUNCHER_MARGIN = 12;
  const DRAG_THRESHOLD = 7;
  let launcherDrag = null;
  let suppressLauncherClick = false;

  function mobileLauncherViewport() {
    return {
      width: Math.max(1, Math.round(window.innerWidth || document.documentElement.clientWidth || 1)),
      height: Math.max(1, Math.round(window.innerHeight || document.documentElement.clientHeight || 1))
    };
  }

  function clearMobileLauncherPosition() {
    ['left', 'right', 'top', 'bottom'].forEach((prop) => root.style.removeProperty(prop));
    launcher.style.removeProperty('touch-action');
  }

  function setDefaultMobileLauncherPosition() {
    if (!mobileDragQuery.matches || root.classList.contains('is-open')) return;
    launcher.style.setProperty('touch-action', 'none');
    root.style.setProperty('left', 'auto', 'important');
    root.style.setProperty('top', 'auto', 'important');
    root.style.setProperty('right', LAUNCHER_MARGIN + 'px', 'important');
    root.style.setProperty('bottom', LAUNCHER_MARGIN + 'px', 'important');
  }

  function readMobileLauncherPosition() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(LAUNCHER_POSITION_KEY) || 'null');
      if (!saved || !['left', 'right'].includes(saved.side) || !Number.isFinite(saved.yRatio)) return null;
      return { side: saved.side, yRatio: Math.max(0, Math.min(1, saved.yRatio)) };
    } catch (_) {
      return null;
    }
  }

  function saveMobileLauncherPosition(side, top) {
    const viewport = mobileLauncherViewport();
    const launcherHeight = Math.max(1, launcher.getBoundingClientRect().height || launcher.offsetHeight || 1);
    const travel = Math.max(1, viewport.height - launcherHeight - (LAUNCHER_MARGIN * 2));
    const yRatio = Math.max(0, Math.min(1, (top - LAUNCHER_MARGIN) / travel));
    try { sessionStorage.setItem(LAUNCHER_POSITION_KEY, JSON.stringify({ side, yRatio })); } catch (_) {}
  }

  function restoreMobileLauncherPosition() {
    if (!mobileDragQuery.matches) {
      clearMobileLauncherPosition();
      return;
    }
    if (root.classList.contains('is-open')) return;

    launcher.style.setProperty('touch-action', 'none');
    const saved = readMobileLauncherPosition();
    if (!saved) {
      setDefaultMobileLauncherPosition();
      return;
    }

    const viewport = mobileLauncherViewport();
    const rect = launcher.getBoundingClientRect();
    const width = Math.max(1, rect.width || launcher.offsetWidth || 1);
    const height = Math.max(1, rect.height || launcher.offsetHeight || 1);
    const maxTop = Math.max(LAUNCHER_MARGIN, viewport.height - height - LAUNCHER_MARGIN);
    const travel = Math.max(0, maxTop - LAUNCHER_MARGIN);
    const top = LAUNCHER_MARGIN + (travel * saved.yRatio);
    const left = saved.side === 'left'
      ? LAUNCHER_MARGIN
      : Math.max(LAUNCHER_MARGIN, viewport.width - width - LAUNCHER_MARGIN);

    root.style.setProperty('right', 'auto', 'important');
    root.style.setProperty('bottom', 'auto', 'important');
    root.style.setProperty('left', Math.round(left) + 'px', 'important');
    root.style.setProperty('top', Math.round(top) + 'px', 'important');
  }

  function moveMobileLauncher(left, top) {
    const viewport = mobileLauncherViewport();
    const rect = launcher.getBoundingClientRect();
    const width = Math.max(1, rect.width || launcher.offsetWidth || 1);
    const height = Math.max(1, rect.height || launcher.offsetHeight || 1);
    const maxLeft = Math.max(LAUNCHER_MARGIN, viewport.width - width - LAUNCHER_MARGIN);
    const maxTop = Math.max(LAUNCHER_MARGIN, viewport.height - height - LAUNCHER_MARGIN);
    const x = Math.max(LAUNCHER_MARGIN, Math.min(maxLeft, left));
    const y = Math.max(LAUNCHER_MARGIN, Math.min(maxTop, top));

    root.style.setProperty('right', 'auto', 'important');
    root.style.setProperty('bottom', 'auto', 'important');
    root.style.setProperty('left', Math.round(x) + 'px', 'important');
    root.style.setProperty('top', Math.round(y) + 'px', 'important');
    return { left: x, top: y };
  }

  function finishMobileLauncherDrag(event) {
    if (!launcherDrag || event.pointerId !== launcherDrag.pointerId) return;
    try { launcher.releasePointerCapture(event.pointerId); } catch (_) {}

    const wasDragging = launcherDrag.dragging;
    launcherDrag = null;
    if (!wasDragging) return;

    const rect = root.getBoundingClientRect();
    const viewport = mobileLauncherViewport();
    const side = (rect.left + rect.width / 2) < (viewport.width / 2) ? 'left' : 'right';
    const snappedLeft = side === 'left'
      ? LAUNCHER_MARGIN
      : Math.max(LAUNCHER_MARGIN, viewport.width - rect.width - LAUNCHER_MARGIN);
    const finalPos = moveMobileLauncher(snappedLeft, rect.top);
    saveMobileLauncherPosition(side, finalPos.top);

    suppressLauncherClick = true;
    window.setTimeout(() => { suppressLauncherClick = false; }, 450);
  }

  launcher.addEventListener('pointerdown', (event) => {
    if (!mobileDragQuery.matches || root.classList.contains('is-open')) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const rect = root.getBoundingClientRect();
    launcherDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      dragging: false
    };
    try { launcher.setPointerCapture(event.pointerId); } catch (_) {}
  });

  launcher.addEventListener('pointermove', (event) => {
    if (!launcherDrag || event.pointerId !== launcherDrag.pointerId) return;
    const dx = event.clientX - launcherDrag.startX;
    const dy = event.clientY - launcherDrag.startY;
    if (!launcherDrag.dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    launcherDrag.dragging = true;
    event.preventDefault();
    moveMobileLauncher(launcherDrag.startLeft + dx, launcherDrag.startTop + dy);
  }, { passive: false });

  launcher.addEventListener('pointerup', finishMobileLauncherDrag);
  launcher.addEventListener('pointercancel', finishMobileLauncherDrag);
  launcher.addEventListener('click', (event) => {
    if (!suppressLauncherClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressLauncherClick = false;
  }, true);

  const refreshMobileLauncherPosition = () => {
    if (root.classList.contains('is-open')) return;
    window.requestAnimationFrame(restoreMobileLauncherPosition);
  };
  window.addEventListener('orientationchange', () => window.setTimeout(refreshMobileLauncherPosition, 140), { passive: true });
  window.addEventListener('resize', refreshMobileLauncherPosition, { passive: true });
  if (mobileDragQuery.addEventListener) mobileDragQuery.addEventListener('change', refreshMobileLauncherPosition);

  window.requestAnimationFrame(restoreMobileLauncherPosition);
`;

  source = source.replace(runtimeNeedle, runtimeNeedle + dragLayer);

  // The current keyboard-resize layer no longer needs to clear the launcher's
  // four positioning properties. Preserve them so closing the chat returns the
  // avatar to the place the visitor chose.
  const oldRootReset = "    ['top', 'bottom', 'left', 'right', 'width', 'height', 'min-height', 'max-height', 'background', 'overflow'].forEach((prop) => root.style.removeProperty(prop));";
  const newRootReset = "    ['width', 'height', 'min-height', 'max-height', 'background', 'overflow'].forEach((prop) => root.style.removeProperty(prop));";
  if (source.includes(oldRootReset)) source = source.replace(oldRootReset, newRootReset);

  const closeNeedle = "    resetMobileViewport();\n    launcher.setAttribute('aria-expanded', 'false');";
  if (!source.includes(closeNeedle)) throw new Error('Could not find RFA Guide close() restoration point.');
  source = source.replace(
    closeNeedle,
    "    resetMobileViewport();\n    restoreMobileLauncherPosition();\n    launcher.setAttribute('aria-expanded', 'false');"
  );

  fs.writeFileSync(AI_PATH, source, 'utf8');
  changed = true;
}

if (!source.includes(MARKER)) throw new Error('Mobile draggable launcher marker was not applied.');
if (!source.includes('restoreMobileLauncherPosition()')) throw new Error('Mobile launcher position restoration was not applied.');
if (!source.includes('sessionStorage.setItem(LAUNCHER_POSITION_KEY')) throw new Error('Mobile launcher session persistence was not applied.');
if (!source.includes('event.stopImmediatePropagation()')) throw new Error('Drag click suppression was not applied.');

console.log(changed
  ? 'Upgraded RFA Guide with a draggable, edge-snapping mobile launcher.'
  : 'RFA Guide mobile draggable launcher is already current.');
