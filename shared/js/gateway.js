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
    // Applying the clamp first lets us compare its clientHeight against the
    // full unclamped scrollHeight — the standard way to detect whether
    // line-clamp actually truncated anything.
    statement.classList.add('is-clamped');
    var overflows = statement.scrollHeight > statement.clientHeight + 1;
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
