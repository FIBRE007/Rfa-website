/**
 * Media-slot loader: progressive enhancement for real RFA photography.
 * `data-src` values are R2 object keys relative to the canonical media host.
 */
(function () {
  'use strict';

  var MEDIA_BASE = 'https://media.royalfamilyacademy.org/';
  var ABSOLUTE_URL = /^([a-z][a-z0-9+.-]*:)?\/\//i;

  function fallbackResolveUrl(path) {
    if (!path) return path;
    if (ABSOLUTE_URL.test(path)) return path;
    return MEDIA_BASE.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  }

  function resolveUrl(path) {
    if (typeof window.RFA_MEDIA_URL === 'function') {
      return window.RFA_MEDIA_URL(path);
    }
    return fallbackResolveUrl(path);
  }

  function resolveSrcset(value) {
    return value.split(',').map(function (part) {
      var trimmed = part.trim();
      var spaceIdx = trimmed.indexOf(' ');
      var url = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
      var descriptor = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx);
      return resolveUrl(url) + descriptor;
    }).join(', ');
  }

  function reveal(slot, img) {
    if (img.parentNode !== slot) slot.appendChild(img);
    img.classList.add('is-loaded');
    slot.classList.add('is-loaded');
    img.style.opacity = '1';
    img.style.transform = 'scale(1)';

    var labels = slot.querySelectorAll('.media-slot__label');
    Array.prototype.forEach.call(labels, function (label) {
      label.hidden = true;
      label.style.display = 'none';
    });
  }

  function shouldLoadEagerly(slot) {
    if (slot.hasAttribute('data-eager')) return true;

    // Landing-page teaser cards are intentionally high-priority photography.
    // Treat them as eager even when older page markup omitted data-eager.
    // This also avoids browser-specific native lazy-loading stalls inside
    // positioned/aspect-ratio teaser cards.
    if (slot.closest && slot.closest('.page-teaser')) return true;

    return false;
  }

  function mount(slot) {
    if (!slot || slot.getAttribute('data-media-mounted') === 'true') return;

    var src = slot.getAttribute('data-src');
    if (!src) return;
    slot.setAttribute('data-media-mounted', 'true');

    var img = new Image();
    img.decoding = 'async';
    img.alt = slot.getAttribute('data-alt') || '';
    img.loading = shouldLoadEagerly(slot) ? 'eager' : 'lazy';

    img.onload = function () {
      reveal(slot, img);
    };

    img.onerror = function () {
      if (img.parentNode === slot) slot.removeChild(img);
      slot.removeAttribute('data-media-mounted');
      if (window.console && typeof window.console.warn === 'function') {
        window.console.warn('[RFA media] Image failed to load:', resolveUrl(src));
      }
    };

    slot.appendChild(img);

    if (slot.hasAttribute('data-srcset')) {
      img.srcset = resolveSrcset(slot.getAttribute('data-srcset'));
    }
    if (slot.hasAttribute('data-sizes')) {
      img.sizes = slot.getAttribute('data-sizes');
    }

    img.src = resolveUrl(src);

    if (img.complete && img.naturalWidth > 0) {
      reveal(slot, img);
    }
  }

  function start() {
    var slots = document.querySelectorAll('.media-slot[data-src]');

    // Mount every slot immediately. Genuine below-the-fold images use the
    // browser's native loading="lazy" behaviour; high-priority teaser cards
    // and explicit data-eager slots load immediately.
    Array.prototype.forEach.call(slots, mount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
