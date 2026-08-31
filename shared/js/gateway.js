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
 * "…Read more" toggle for the gateway statement: swaps the element's text
 * content between a fixed short snippet (already in the markup) and the
 * full statement (in data-full-text). Plain text substitution — no CSS
 * line-height/overflow measuring involved — so there's no browser-specific
 * clipping behavior to get wrong.
 */
(function () {
  var statement = document.getElementById('gateway-statement');
  var toggle = document.querySelector('[data-statement-toggle]');
  if (!statement || !toggle) return;

  var shortText = statement.textContent;
  var fullText = statement.getAttribute('data-full-text');
  if (!fullText) return;

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    statement.textContent = expanded ? shortText : fullText;
    toggle.textContent = expanded ? '… Read more' : 'Show less';
    toggle.setAttribute('aria-expanded', String(!expanded));
  });
})();
