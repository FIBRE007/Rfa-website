/**
 * Single source of truth for where real photography/video are hosted.
 * Must load before media.js and video-bg.js on every page.
 *
 * All real RFA images/video live in Cloudflare R2 (see images/README.md),
 * not in this repository. `data-src` / `data-srcset` / `data-video-*`
 * attributes in markup are paths relative to that bucket's root, matching
 * the folder taxonomy in images/README.md — e.g.
 * "academy/gateway-cinematic-backdrop.jpg". RFA_MEDIA_URL() resolves one of
 * those against RFA_MEDIA_BASE below. A value that's already an absolute
 * URL (http/https/protocol-relative) passes through unchanged, so a page
 * can still point at some other host for a one-off if ever needed.
 */
(function () {
  var RFA_MEDIA_BASE = 'https://media.royalfamilyacademy.org/';
  var ABSOLUTE_URL = /^([a-z][a-z0-9+.-]*:)?\/\//i;

  window.RFA_MEDIA_BASE = RFA_MEDIA_BASE;
  window.RFA_MEDIA_URL = function (path) {
    if (!path) return path;
    if (ABSOLUTE_URL.test(path)) return path;
    return RFA_MEDIA_BASE.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  };
})();
