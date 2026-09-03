/**
 * Scroll-reveal system: adds .is-visible to [data-reveal] elements the
 * first time they are clearly inside the viewport, staggers
 * [data-reveal-group] children, animates the hero on load, and drives
 * [data-count] number counters. Pure IntersectionObserver — no animation
 * library dependency. Fully inert when the user prefers reduced motion.
 */
(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const site = document.body && document.body.dataset ? document.body.dataset.site : '';
  const isK12 = site === 'nurseryandprimaryschool' || site === 'highschool';

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

    // K-12 pages reveal content as it becomes comfortably readable rather
    // than waiting until nearly half of a block has already crossed the
    // viewport. Other RFA properties retain the original editorial trigger.
    const io = new IntersectionObserver(reveal, isK12 ? {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px'
    } : {
      threshold: 0.42,
      rootMargin: '0px 0px -14% 0px'
    });

    // Leadership cards can be taller than a mobile viewport. Reveal them as
    // soon as they clearly enter the visible area; page-specific leadership
    // motion can then control the slower portrait/card movement itself.
    const leadershipIo = new IntersectionObserver(reveal, {
      threshold: isK12 ? 0.08 : 0.12,
      rootMargin: isK12 ? '0px 0px -6% 0px' : '0px 0px -8% 0px'
    });

    revealTargets.forEach((el) => {
      if (el.classList.contains('leadership-card')) leadershipIo.observe(el);
      else io.observe(el);
    });
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  // K-12 editorial highlights animate independently from their parent block,
  // so the gold brush line appears only once the actual phrase is comfortably
  // in view. This also covers highlights inside content without data-reveal.
  if (isK12) {
    const highlights = Array.from(document.querySelectorAll('.highlight'));
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      highlights.forEach((el) => el.classList.add('is-highlighted'));
    } else if (highlights.length) {
      const highlightIo = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-highlighted');
          observer.unobserve(entry.target);
        });
      }, {
        threshold: 0.5,
        rootMargin: '0px 0px -12% 0px'
      });
      highlights.forEach((el) => highlightIo.observe(el));
    }
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
      const duration = isK12 ? 1500 : 1800;
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
        { threshold: isK12 ? 0.45 : 0.7, rootMargin: '0px 0px -10% 0px' }
      );
      counters.forEach((el) => countIo.observe(el));
    } else {
      counters.forEach(animateCount);
    }
  }
})();
