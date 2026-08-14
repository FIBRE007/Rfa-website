/**
 * Sticky navigation: transparent-over-hero -> solid-on-scroll, plus the
 * full-screen mobile menu toggle.
 */
(function () {
  const header = document.querySelector('[data-site-header]');
  if (!header) return;

  const toggle = header.querySelector('[data-nav-toggle]');
  const SCROLL_THRESHOLD = 40;

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle) {
    toggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    header.querySelectorAll('.mobile-nav a').forEach((link) => {
      link.addEventListener('click', () => {
        header.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
})();
