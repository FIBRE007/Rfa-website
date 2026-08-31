/**
 * Staged entrance for the single-viewport main-domain gateway:
 * background → logo → ACSI badge → status → statement → CTA → school links.
 * No IntersectionObserver needed — there is nothing to scroll to.
 */
(function () {
  var gateway = document.querySelector('.gateway');
  if (!gateway) return;
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      gateway.classList.add('is-revealed');
    });
  });
})();

/**
 * "…Read more" toggle for the gateway statement: clamps to 3 lines only
 * when the full text is actually taller than that, so short text (or a
 * future rewrite) never shows a pointless toggle.
 */
(function () {
  var statement = document.getElementById('gateway-statement');
  var toggle = document.querySelector('[data-statement-toggle]');
  if (!statement || !toggle) return;

  function measure() {
    if (statement.classList.contains('is-expanded')) return;
    statement.classList.remove('is-clamped');
    var cs = getComputedStyle(statement);
    var lineHeight = parseFloat(cs.lineHeight);
    if (isNaN(lineHeight)) lineHeight = statement.scrollHeight; // last resort
    var verticalPadding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    var threshold = lineHeight * 3 + verticalPadding;
    var overflows = statement.scrollHeight > threshold + 1;
    statement.style.setProperty('--statement-clamp-height', threshold + 'px');
    statement.classList.toggle('is-clamped', overflows);
    toggle.hidden = !overflows;
  }

  toggle.addEventListener('click', function () {
    var expanded = statement.classList.toggle('is-expanded');
    toggle.textContent = expanded ? 'Show less' : '… Read more';
    toggle.setAttribute('aria-expanded', String(expanded));
  });

  measure();
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  });
})();
