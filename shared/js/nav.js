/**
 * Royal Family Academy shared navigation controller.
 */
(function () {
  const header = document.querySelector('[data-site-header]');
  if (!header) return;

  const toggle = header.querySelector('[data-nav-toggle]');
  const mobileNav = header.querySelector('.mobile-nav');
  const SCROLL_THRESHOLD = 40;
  const DESKTOP_BREAKPOINT = 980;
  let closeButton = null;

  function ensureCloseButtonStyles() {
    if (document.getElementById('rfa-mobile-close-styles')) return;
    const style = document.createElement('style');
    style.id = 'rfa-mobile-close-styles';
    style.textContent = `
      .mobile-nav__close{position:fixed;top:max(1rem,env(safe-area-inset-top));right:var(--gutter,1.25rem);width:50px;height:50px;border-radius:999px;background:#fffdf8;border:1px solid rgba(14,12,18,.16);box-shadow:0 10px 30px rgba(14,12,18,.18);z-index:2147483647;display:none;align-items:center;justify-content:center;padding:0}
      .site-header.menu-open .mobile-nav__close{display:flex}
      .mobile-nav__close span{position:absolute;width:25px;height:2px;background:#17131b;display:block}
      .mobile-nav__close span:first-child{transform:rotate(45deg)}
      .mobile-nav__close span:last-child{transform:rotate(-45deg)}
      @media(min-width:980px){.mobile-nav__close{display:none!important}}
    `;
    document.head.appendChild(style);
  }

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
    ensureCloseButtonStyles();
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
      if (window.innerWidth >= DESKTOP_BREAKPOINT && header.classList.contains('menu-open')) closeMenu();
    }, { passive: true });
  }
})();
