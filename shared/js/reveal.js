/**
 * Scroll-reveal system: adds .is-visible to [data-reveal] elements the
 * first time they cross the viewport, staggers [data-reveal-group]
 * children, animates the hero on load, and drives [data-count] number
 * counters. Pure IntersectionObserver — no animation library dependency.
 * Fully inert when the user prefers reduced motion.
 */
(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.setProperty('--reveal-index', i);
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', 'up');
    });
  });

  const revealTargets = document.querySelectorAll('[data-reveal]');
  if (prefersReducedMotion) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  // Hero: reveal immediately on load (it's above the fold, no IO needed).
  const hero = document.querySelector('.hero');
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
      const duration = 1400;
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
        { threshold: 0.6 }
      );
      counters.forEach((el) => countIo.observe(el));
    } else {
      counters.forEach(animateCount);
    }
  }
})();
