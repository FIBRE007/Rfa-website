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
        .site-header.menu-open .site-nav{visibility:hidden!important;opacity:0!important;pointer-events:none!important}
        .site-header.menu-open::before{opacity:0!important}
        .mobile-nav{
          z-index:2147483000!important;
          background:var(--rfa-warm-white,#fffdf8)!important;
        }
        .mobile-nav.is-open{
          transform:translateY(0)!important;
          padding:max(5.5rem,calc(env(safe-area-inset-top) + 4.5rem)) var(--gutter,1.25rem) 2rem!important;
        }
        .mobile-nav__close{
          position:fixed;
          top:max(1rem,env(safe-area-inset-top));
          right:var(--gutter,1.25rem);
          width:52px;height:52px;
          border:0;background:transparent;
          z-index:2147483647;
          display:none;align-items:center;justify-content:center;
          padding:0;cursor:pointer;
        }
        .mobile-nav.is-open .mobile-nav__close{display:flex}
        .mobile-nav__close span{position:absolute;width:34px;height:2px;background:#17131b;display:block;transform-origin:center}
        .mobile-nav__close span:first-child{transform:rotate(45deg)}
        .mobile-nav__close span:last-child{transform:rotate(-45deg)}
        .mobile-nav.is-open .mobile-nav__links{padding-top:0!important;margin-top:0!important}
      }
      @media(min-width:980px){.mobile-nav__close{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureHighSchoolHeroOverlay() {
    if (!document.body || document.body.dataset.site !== 'highschool') return;
    if (document.getElementById('rfa-highschool-hero-overlay')) return;

    const style = document.createElement('style');
    style.id = 'rfa-highschool-hero-overlay';
    style.textContent = `
      body[data-site="highschool"] .hero__scrim{
        background:
          linear-gradient(90deg,rgba(14,12,18,.48) 0%,rgba(14,12,18,.28) 55%,rgba(14,12,18,.16) 100%),
          linear-gradient(180deg,rgba(14,12,18,.68) 0%,rgba(14,12,18,.62) 44%,rgba(14,12,18,.88) 100%)!important;
      }
      body[data-site="highschool"] .subhero__scrim{
        background:
          linear-gradient(90deg,rgba(14,12,18,.42) 0%,rgba(14,12,18,.24) 55%,rgba(14,12,18,.14) 100%),
          linear-gradient(180deg,rgba(14,12,18,.66) 0%,rgba(14,12,18,.62) 45%,rgba(14,12,18,.86) 100%)!important;
      }
      @media(max-width:640px){
        body[data-site="highschool"] .hero__scrim{
          background:
            linear-gradient(90deg,rgba(14,12,18,.36) 0%,rgba(14,12,18,.28) 100%),
            linear-gradient(180deg,rgba(14,12,18,.72) 0%,rgba(14,12,18,.68) 44%,rgba(14,12,18,.90) 100%)!important;
        }
        body[data-site="highschool"] .subhero__scrim{
          background:
            linear-gradient(90deg,rgba(14,12,18,.34) 0%,rgba(14,12,18,.26) 100%),
            linear-gradient(180deg,rgba(14,12,18,.70) 0%,rgba(14,12,18,.66) 45%,rgba(14,12,18,.88) 100%)!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureHighSchoolCampusNav() {
    if (!document.body || document.body.dataset.site !== 'highschool') return;

    const addCampusLink = function (nav, desktop) {
      if (!nav || nav.querySelector('a[href="campus.html"]')) return;
      const link = document.createElement('a');
      link.href = 'campus.html';
      link.textContent = 'Campus';
      if (desktop) link.className = 'site-nav__link link-underline';

      const studentLife = nav.querySelector('a[href="student-life.html"]');
      if (studentLife) studentLife.insertAdjacentElement('afterend', link);
      else nav.appendChild(link);
    };

    addCampusLink(header.querySelector('.site-nav__links'), true);
    if (mobileNav) addCampusLink(mobileNav.querySelector('.mobile-nav__links'), false);
  }

  function loadArchiveContent() {
    if (document.querySelector('script[data-rfa-archive-content]')) return;
    const script = document.createElement('script');
    script.src = 'https://assets.royalfamilyacademy.org/shared/js/archive-content.js?v=20260904-1';
    script.async = false;
    script.dataset.rfaArchiveContent = 'true';
    document.body.appendChild(script);
  }

  function setScrolledState() {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
  }

  function closeMenu() {
    header.classList.remove('menu-open');
    if (mobileNav) mobileNav.classList.remove('is-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
    if (closeButton) closeButton.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openMenu() {
    header.classList.add('menu-open');
    if (mobileNav) mobileNav.classList.add('is-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    }
    if (closeButton) closeButton.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  ensureHighSchoolHeroOverlay();
  ensureHighSchoolCampusNav();
  loadArchiveContent();
  setScrolledState();
  window.addEventListener('scroll', setScrolledState, { passive: true });

  if (toggle && mobileNav) {
    ensureMobileMenuStyles();

    /* Move the overlay outside the header stacking context. */
    document.body.appendChild(mobileNav);

    closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'mobile-nav__close';
    closeButton.setAttribute('aria-label', 'Close menu');
    closeButton.setAttribute('aria-hidden', 'true');
    closeButton.innerHTML = '<span></span><span></span>';
    mobileNav.prepend(closeButton);

    closeButton.addEventListener('click', closeMenu);
    toggle.addEventListener('click', function () {
      mobileNav.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= DESKTOP_BREAKPOINT && mobileNav.classList.contains('is-open')) closeMenu();
    }, { passive: true });
  }
})();
