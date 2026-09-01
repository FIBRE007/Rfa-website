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

  function ensureMobileMenuStyles() {
    if (document.getElementById('rfa-mobile-menu-fix-styles')) return;
    const style = document.createElement('style');
    style.id = 'rfa-mobile-menu-fix-styles';
    style.textContent = `
      @media(max-width:979px){
        .site-header.menu-open .site-nav{visibility:hidden;pointer-events:none}
        .site-header.menu-open .mobile-nav{z-index:20;padding-top:max(5.75rem,calc(env(safe-area-inset-top) + 4.75rem))}
        .mobile-nav__close{position:fixed;top:max(1rem,env(safe-area-inset-top));right:var(--gutter,1.25rem);width:52px;height:52px;border:0;background:transparent;z-index:2147483647;display:none;align-items:center;justify-content:center;padding:0;cursor:pointer}
        .site-header.menu-open .mobile-nav__close{display:flex}
        .mobile-nav__close span{position:absolute;width:34px;height:2px;background:#17131b;display:block;transform-origin:center}
        .mobile-nav__close span:first-child{transform:rotate(45deg)}
        .mobile-nav__close span:last-child{transform:rotate(-45deg)}
        .mobile-nav__links{padding-top:0}
      }
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
    ensureMobileMenuStyles();
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
