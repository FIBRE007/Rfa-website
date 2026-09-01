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
  let closeButton = null;

  function setScrolledState() {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  }

  function closeMenu() {
    header.classList.remove('menu-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
    if (closeButton) closeButton.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openMenu() {
    header.classList.add('menu-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }
    if (closeButton) closeButton.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  setScrolledState();
  window.addEventListener('scroll', setScrolledState, { passive: true });

  if (toggle && mobileNav) {
    // A dedicated close control lives inside the menu itself. This remains
    // reachable even if a device/browser paints the full-screen menu above
    // the normal header toggle.
    closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'mobile-nav__close';
    closeButton.setAttribute('aria-label', 'Close menu');
    closeButton.setAttribute('aria-hidden', 'true');
    closeButton.innerHTML = '<span></span><span></span>';
    mobileNav.prepend(closeButton);

    closeButton.addEventListener('click', closeMenu);

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
