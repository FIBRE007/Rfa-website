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

  function mount(slot) {
    if (!slot || slot.getAttribute('data-media-mounted') === 'true') return;

    var src = slot.getAttribute('data-src');
    if (!src) return;
    slot.setAttribute('data-media-mounted', 'true');

    var img = new Image();
    img.decoding = 'async';
    img.alt = slot.getAttribute('data-alt') || '';
    img.loading = slot.hasAttribute('data-eager') ? 'eager' : 'lazy';

    img.onload = function () {
      reveal(slot, img);
    };

    img.onerror = function () {
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

    // Mount every slot immediately. Non-eager images still use the browser's
    // native loading="lazy" behaviour, but are no longer blocked behind a
    // custom IntersectionObserver that was preventing some repeated/lower-page
    // images from ever being mounted on certain browsers.
    Array.prototype.forEach.call(slots, mount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
