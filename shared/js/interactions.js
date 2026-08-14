/**
 * Small, targeted interaction behaviours shared across pages:
 * - school-selection panel hover/focus expansion (desktop) + tap (mobile)
 * - facility explorer tabs
 * - testimonial carousel
 * Each block no-ops if its markup isn't present on the page.
 */
(function () {
  // ---- School selection panels -------------------------------------------
  const panels = document.querySelectorAll('.school-panel');
  if (panels.length) {
    panels.forEach((panel) => {
      const focus = () => {
        panels.forEach((p) => p.classList.toggle('is-focus', p === panel));
      };
      panel.addEventListener('mouseenter', focus);
      panel.addEventListener('focusin', focus);
    });
    const splitEl = document.querySelector('.schools-split');
    if (splitEl) {
      splitEl.addEventListener('mouseleave', () => {
        panels.forEach((p) => p.classList.remove('is-focus'));
      });
    }
  }

  // ---- Facility explorer tabs ----------------------------------------------
  const explorer = document.querySelector('[data-facility-explorer]');
  if (explorer) {
    const tabs = explorer.querySelectorAll('.facility-tab');
    const panelsEl = explorer.querySelectorAll('[data-facility-panel]');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-facility-tab');
        tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
        panelsEl.forEach((p) => {
          const isMatch = p.getAttribute('data-facility-panel') === key;
          p.classList.toggle('is-active', isMatch);
          p.style.display = isMatch ? '' : 'none';
        });
      });
    });
  }

  // ---- Testimonial carousel --------------------------------------------------
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const slides = carousel.querySelectorAll('.quote-carousel__slide');
    const dots = carousel.querySelectorAll('.quote-carousel__dots button');
    if (slides.length < 2) return;
    let index = 0;
    let timer;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, si) => s.classList.toggle('is-active', si === index));
      dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
    }

    dots.forEach((dot, i) =>
      dot.addEventListener('click', () => {
        show(i);
        restart();
      })
    );

    function restart() {
      clearInterval(timer);
      timer = setInterval(() => show(index + 1), 7000);
    }

    show(0);
    restart();
  });

  // ---- Accordion (curriculum / FAQ) -------------------------------------------
  document.querySelectorAll('[data-accordion-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('[data-accordion-item]');
      const wasOpen = item.classList.contains('is-open');
      item.parentElement
        .querySelectorAll('[data-accordion-item]')
        .forEach((i) => i.classList.remove('is-open'));
      if (!wasOpen) item.classList.add('is-open');
    });
  });
})();
