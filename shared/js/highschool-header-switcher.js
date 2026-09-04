/* Royal Family Academy High School — desktop Junior/Senior High switcher */
(function () {
  'use strict';

  if (!document.body || document.body.getAttribute('data-site') !== 'highschool') return;

  function findDivisionSection(label) {
    const target = label.toLowerCase();
    const eyebrow = Array.from(document.querySelectorAll('.eyebrow')).find((node) =>
      (node.textContent || '').trim().toLowerCase().includes(target)
    );
    return eyebrow ? eyebrow.closest('section') : null;
  }

  function prepareAcademicsAnchors() {
    if (!/\/academics\.html$/.test(window.location.pathname)) return;

    const junior = findDivisionSection('junior high subjects');
    const senior = findDivisionSection('senior high subjects');
    if (junior && !junior.id) junior.id = 'junior-high';
    if (senior && !senior.id) senior.id = 'senior-high';

    const hash = window.location.hash;
    if (hash === '#junior-high' || hash === '#senior-high') {
      window.setTimeout(function () {
        const target = document.querySelector(hash);
        if (target) target.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }, 80);
    }
  }

  function setActiveDivision(switcher) {
    const hash = window.location.hash;
    switcher.querySelectorAll('a').forEach(function (link) {
      const active = link.getAttribute('href').endsWith(hash) &&
        (hash === '#junior-high' || hash === '#senior-high') &&
        /\/academics\.html$/.test(window.location.pathname);
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function buildSwitcher() {
    const header = document.querySelector('[data-site-header]');
    if (!header || header.querySelector('.rfa-division-switcher')) return;

    const standardNav = header.querySelector('.site-nav');
    const alternateNav = header.querySelector('.site-header__inner');
    const host = standardNav || alternateNav;
    if (!host) return;

    const switcher = document.createElement('nav');
    switcher.className = 'rfa-division-switcher';
    switcher.setAttribute('aria-label', 'Switch High School division');
    switcher.innerHTML = [
      '<span class="rfa-division-switcher__label">School</span>',
      '<a href="academics.html#junior-high" data-division="junior">Junior High</a>',
      '<a href="academics.html#senior-high" data-division="senior">Senior High</a>'
    ].join('');

    if (standardNav) {
      const actions = standardNav.querySelector('.site-nav__actions');
      if (actions) standardNav.insertBefore(switcher, actions);
      else standardNav.appendChild(switcher);
    } else {
      const desktopNav = alternateNav.querySelector('.desktop-nav');
      if (desktopNav) alternateNav.insertBefore(switcher, desktopNav);
      else alternateNav.appendChild(switcher);

      if (!alternateNav.querySelector('.rfa-highschool-visit')) {
        const visit = document.createElement('a');
        visit.className = 'btn btn--ghost-dark rfa-highschool-visit';
        visit.href = 'contact.html';
        visit.textContent = 'Book a Visit';
        alternateNav.appendChild(visit);
      }
    }

    switcher.addEventListener('click', function (event) {
      const link = event.target.closest('a[data-division]');
      if (!link) return;
      if (!/\/academics\.html$/.test(window.location.pathname)) return;

      const targetHash = new URL(link.href, window.location.href).hash;
      const target = document.querySelector(targetHash);
      if (!target) return;

      event.preventDefault();
      history.replaceState(null, '', targetHash);
      target.scrollIntoView({ block: 'start', behavior: 'smooth' });
      setActiveDivision(switcher);
    });

    window.addEventListener('hashchange', function () { setActiveDivision(switcher); });
    setActiveDivision(switcher);
  }

  function init() {
    prepareAcademicsAnchors();
    buildSwitcher();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
