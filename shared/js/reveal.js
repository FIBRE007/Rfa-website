/**
 * Scroll-reveal system: adds .is-visible to [data-reveal] elements the
 * first time they are clearly inside the viewport, staggers
 * [data-reveal-group] children, animates the hero on load, and drives
 * [data-count] number counters. Pure IntersectionObserver — no animation
 * library dependency. Fully inert when the user prefers reduced motion.
 */
(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.setProperty('--reveal-index', i);
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', 'up');
    });
  });

  const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));
  if (prefersReducedMotion) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const reveal = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    };

    // Standard content waits until a meaningful portion is visible.
    const io = new IntersectionObserver(reveal, {
      threshold: 0.42,
      rootMargin: '0px 0px -14% 0px'
    });

    // Leadership cards can be taller than a mobile viewport. A 42% threshold
    // can therefore be impossible to reach, leaving the portrait permanently
    // hidden. Reveal these cards as soon as they clearly enter the viewport.
    const leadershipIo = new IntersectionObserver(reveal, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px'
    });

    revealTargets.forEach((el) => {
      if (el.classList.contains('leadership-card')) leadershipIo.observe(el);
      else io.observe(el);
    });
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  // Hero / sub-page hero: reveal immediately on load because it is already above the fold.
  const hero = document.querySelector('.hero, .subhero');
  if (hero) requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-revealed')));

  // Number counters — only fires on elements carrying real, supplied numbers.
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animateCount = (el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-count-suffix') || '';
      if (prefersReducedMotion || Number.isNaN(target)) {
        el.textContent = target + suffix;
        return;
      }
      const duration = 1800;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      const countIo = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.7, rootMargin: '0px 0px -10% 0px' }
      );
      counters.forEach((el) => countIo.observe(el));
    } else {
      counters.forEach(animateCount);
    }
  }
})();
