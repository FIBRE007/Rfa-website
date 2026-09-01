/**
 * Media-slot loader: progressive enhancement for real photography.
 *
 * Every `.media-slot` renders an elegant on-brand placeholder by default
 * (see components.css) and carries `data-src` pointing at the path
 * documented in images/README.md relative to the Cloudflare R2 bucket root
 * (e.g. "students/science-lab-experiment.jpg") — resolved to a full URL via
 * `RFA_MEDIA_URL()` from media-config.js when available.
 *
 * The loader also contains its own canonical R2 fallback. This is deliberate:
 * pages must still load real photography if media-config.js is stale, blocked,
 * unavailable, or served from an older CDN cache.
 *
 * Above-the-fold slots (hero, first viewport) load eagerly; everything else
 * lazy-loads via IntersectionObserver.
 */
(function () {
  var MEDIA_BASE = 'https://media.royalfamilyacademy.org/';
  var ABSOLUTE_URL = /^([a-z][a-z0-9+.-]*:)?\/\//i;

  function fallbackResolveUrl(path) {
    if (!path) return path;
    if (ABSOLUTE_URL.test(path)) return path;
    return MEDIA_BASE.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  }

  // Prefer the shared configuration when it is present, but never fall back
  // to a page-relative URL. Relative paths such as `nursery/foo.jpg` belong
  // to the R2 media bucket, not to the website origin.
  var resolveUrl = typeof window.RFA_MEDIA_URL === 'function'
    ? window.RFA_MEDIA_URL
    : fallbackResolveUrl;

  function resolveSrcset(value) {
    return value
      .split(',')
      .map(function (part) {
        var trimmed = part.trim();
        var spaceIdx = trimmed.indexOf(' ');
        var url = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
        var descriptor = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx);
        return resolveUrl(url) + descriptor;
      })
      .join(', ');
  }

  function mount(slot) {
    var src = slot.getAttribute('data-src');
    if (!src) return;

    var img = new Image();
    img.decoding = 'async';
    img.alt = slot.getAttribute('data-alt') || '';
    if (slot.hasAttribute('data-srcset')) img.srcset = resolveSrcset(slot.getAttribute('data-srcset'));
    if (slot.hasAttribute('data-sizes')) img.sizes = slot.getAttribute('data-sizes');

    img.onload = function () {
      img.classList.add('is-loaded');
      slot.classList.add('is-loaded');
      slot.appendChild(img);
    };
    img.onerror = function () {
      // Keep the placeholder when the exact object genuinely does not exist.
      // Log the resolved URL so filename/path mismatches can be diagnosed.
      if (window.console && typeof window.console.warn === 'function') {
        window.console.warn('[RFA media] Image failed to load:', resolveUrl(src));
      }
    };
    img.loading = slot.hasAttribute('data-eager') ? 'eager' : 'lazy';
    img.src = resolveUrl(src);
  }

  var slots = document.querySelectorAll('.media-slot[data-src]');
  var eager = [];
  var lazy = [];
  slots.forEach(function (slot) {
    (slot.hasAttribute('data-eager') ? eager : lazy).push(slot);
  });

  eager.forEach(mount);

  if (!lazy.length) return;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            mount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '400px 0px' }
    );
    lazy.forEach(function (slot) { io.observe(slot); });
  } else {
    lazy.forEach(mount);
  }
})();
