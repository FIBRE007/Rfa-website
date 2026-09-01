/**
 * Royal Family Academy shared navigation controller.
 *
 * This file is the single behaviour layer for every site header: desktop and
 * mobile, landing pages and interior pages. Keep page-specific navigation
 * content in the HTML, but keep interaction and sticky behaviour here.
 */
(function () {
  const header = document.querySelector('[data-site-header]');
  if (!header) return;

  const toggle = header.querySelector('[data-nav-toggle]');
  const mobileNav = header.querySelector('.mobile-nav');
  const SCROLL_THRESHOLD = 40;
  const DESKTOP_BREAKPOINT = 980;

  function setScrolledState() {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  }

  function closeMenu() {
    header.classList.remove('menu-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
    document.body.style.overflow = '';
  }

  function openMenu() {
    header.classList.add('menu-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }
    document.body.style.overflow = 'hidden';
  }

  setScrolledState();
  window.addEventListener('scroll', setScrolledState, { passive: true });

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      header.classList.contains('menu-open') ? closeMenu() : openMenu();
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && header.classList.contains('menu-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= DESKTOP_BREAKPOINT && header.classList.contains('menu-open')) {
        closeMenu();
      }
    }, { passive: true });
  }
})();
