/**
 * Media-slot loader: progressive enhancement for real photography.
 *
 * Every `.media-slot` renders an elegant on-brand placeholder by default
 * (see components.css) and carries `data-src` pointing at the path
 * documented in images/README.md relative to the Cloudflare R2 bucket root
 * (e.g. "students/science-lab-experiment.jpg") — resolved to a full URL via
 * `RFA_MEDIA_URL()` from media-config.js, which must load before this file.
 *
 * The moment RFA supplies a real photograph at that path in the bucket,
 * this script picks it up automatically on the next page load — fades it
 * in, sets width/height from the natural image size to avoid layout shift,
 * and hides the placeholder label. No HTML/CSS changes are required to "go
 * live" with real photography; administrators only need to upload the file.
 *
 * Above-the-fold slots (hero, first viewport) load eagerly; everything else
 * lazy-loads via IntersectionObserver.
 */
(function () {
  // Defensive fallback if media-config.js didn't load for some reason
  // (network hiccup, blocked request, load-order mistake) — degrade to
  // passing paths through unchanged rather than throwing and aborting the
  // rest of this script's setup (which would also break lazy-loaded slots
  // further down the page that haven't been wired up yet).
  const resolveUrl = typeof window.RFA_MEDIA_URL === 'function' ? window.RFA_MEDIA_URL : (path) => path;

  function resolveSrcset(value) {
    return value
      .split(',')
      .map((part) => {
        const trimmed = part.trim();
        const spaceIdx = trimmed.indexOf(' ');
        const url = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
        const descriptor = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx);
        return resolveUrl(url) + descriptor;
      })
      .join(', ');
  }

  function mount(slot) {
    const src = slot.getAttribute('data-src');
    if (!src) return;

    const img = new Image();
    img.decoding = 'async';
    img.alt = slot.getAttribute('data-alt') || '';
    if (slot.hasAttribute('data-srcset')) img.srcset = resolveSrcset(slot.getAttribute('data-srcset'));
    if (slot.hasAttribute('data-sizes')) img.sizes = slot.getAttribute('data-sizes');

    img.onload = () => {
      img.classList.add('is-loaded');
      slot.appendChild(img);
    };
    img.onerror = () => {
      // Real photograph not supplied yet — keep the elegant placeholder.
    };
    img.loading = slot.hasAttribute('data-eager') ? 'eager' : 'lazy';
    img.src = resolveUrl(src);
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
