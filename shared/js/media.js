/**
 * Media-slot loader: progressive enhancement for real photography.
 *
 * Every `.media-slot` renders an elegant on-brand placeholder by default
 * (see components.css) and carries `data-src` pointing at the exact file
 * path documented in /rfa/images/README.md (e.g.
 * "/rfa/images/students/science-lab-experiment.jpg").
 *
 * The moment RFA supplies a real photograph at that path, this script picks
 * it up automatically on the next page load — fades it in, sets width/
 * height from the natural image size to avoid layout shift, and hides the
 * placeholder label. No HTML/CSS changes are required to "go live" with
 * real photography; administrators only need to drop files into /images.
 *
 * Above-the-fold slots (hero, first viewport) load eagerly; everything else
 * lazy-loads via IntersectionObserver.
 */
(function () {
  function mount(slot) {
    const src = slot.getAttribute('data-src');
    if (!src) return;

    const img = new Image();
    img.decoding = 'async';
    img.alt = slot.getAttribute('data-alt') || '';
    if (slot.hasAttribute('data-srcset')) img.srcset = slot.getAttribute('data-srcset');
    if (slot.hasAttribute('data-sizes')) img.sizes = slot.getAttribute('data-sizes');

    img.onload = () => {
      img.classList.add('is-loaded');
      slot.appendChild(img);
    };
    img.onerror = () => {
      // Real photograph not supplied yet — keep the elegant placeholder.
    };
    img.loading = slot.hasAttribute('data-eager') ? 'eager' : 'lazy';
    img.src = src;
  }

  const slots = document.querySelectorAll('.media-slot[data-src]');
  const eager = [];
  const lazy = [];
  slots.forEach((slot) => (slot.hasAttribute('data-eager') ? eager : lazy).push(slot));

  eager.forEach(mount);

  if (!lazy.length) return;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            mount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '400px 0px' }
    );
    lazy.forEach((slot) => io.observe(slot));
  } else {
    lazy.forEach(mount);
  }
})();
