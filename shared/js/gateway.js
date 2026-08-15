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
