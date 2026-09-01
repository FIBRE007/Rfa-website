/**
 * Background video: progressive enhancement over a `.media-slot`'s existing
 * photograph, following the same drop-in contract as media.js.
 *
 * A slot opts in with `data-video-mp4` (required) and `data-video-webm`
 * (optional, tried first). The moment RFA supplies a real file at that path,
 * it appears automatically — muted, looping, cropped to the slot exactly
 * like the photo underneath. Until then, or if the browser/user's settings
 * say no, the photo (or placeholder) stays exactly as it is today. No HTML
 * changes are required either way.
 *
 * The video never replaces the photo in the DOM — it fades in on top of it
 * (see components.css), so the photo remains the instant, zero-network
 * poster/fallback: if the video 404s, is still buffering, fails to decode,
 * or is skipped outright below, nothing looks broken.
 *
 * Skipped entirely (photo-only) when:
 *   - prefers-reduced-motion: reduce
 *   - the browser reports Data Saver mode, or a 2G-class connection
 */
(function () {
  // Same defensive fallback as media.js — see its comment for why.
  var resolveUrl = typeof window.RFA_MEDIA_URL === 'function' ? window.RFA_MEDIA_URL : function (path) { return path; };

  function shouldSkip() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    var conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    if (conn) {
      if (conn.saveData) return true;
      if (conn.effectiveType && /2g/.test(conn.effectiveType)) return true;
    }
    return false;
  }

  function mount(slot) {
    var mp4 = slot.getAttribute('data-video-mp4');
    if (!mp4) return;
    var webm = slot.getAttribute('data-video-webm');
    var poster = slot.getAttribute('data-src');

    var video = document.createElement('video');
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.preload = 'auto';
    if (poster) video.poster = resolveUrl(poster);

    if (webm) {
      var srcWebm = document.createElement('source');
      srcWebm.src = resolveUrl(webm);
      srcWebm.type = 'video/webm';
      video.appendChild(srcWebm);
    }
    var srcMp4 = document.createElement('source');
    srcMp4.src = resolveUrl(mp4);
    srcMp4.type = 'video/mp4';
    video.appendChild(srcMp4);

    var revealed = false;
    var gaveUp = false;
    function reveal() {
      if (revealed || gaveUp) return;
      revealed = true;
      video.classList.add('is-loaded');
      slot.classList.add('is-loaded');
    }
    function giveUp() {
      if (revealed || gaveUp) return;
      gaveUp = true;
      // Real footage not supplied yet (404), unsupported, or still not
      // ready after a generous wait — the photo underneath is already
      // showing; just drop this element quietly rather than leave a dead
      // <video> parked over it.
      if (video.parentNode) video.parentNode.removeChild(video);
    }
    // Bound to `playing`, not `loadeddata` — loadeddata only means a frame
    // is buffered, not that playback actually started. Revealing on
    // loadeddata would fade in a paused, frozen first frame (permanently
    // covering the animated photo underneath) whenever autoplay is blocked
    // or dropped, which reads to a visitor as "the video stopped playing".
    // Revealing only once frames are actually advancing avoids that.
    video.addEventListener('playing', reveal);

    // When resource selection uses child <source> elements (our case), a
    // failed candidate fires `error` on that *source*, not on the <video> —
    // and it doesn't bubble. A capturing listener on `video` still sees it,
    // since capture fires on the way down to the target regardless of
    // bubbling. This covers the normal 404 case.
    video.addEventListener('error', giveUp, true);

    // Safety net for anything the above doesn't catch (e.g. a browser that
    // stalls indefinitely instead of erroring): if we're not playing
    // shortly after load() was told to go, stop waiting.
    setTimeout(function () {
      if (!revealed) giveUp();
    }, 8000);

    // If playback pauses unexpectedly while the tab is visible — a network
    // stall, a battery-saver policy, anything other than our own
    // visibilitychange-driven pause below — try once to resume rather than
    // leaving a revealed video frozen on whatever frame it stopped on.
    video.addEventListener('pause', function () {
      if (!revealed || document.hidden) return;
      video.play().catch(function () {});
    });

    document.addEventListener('visibilitychange', function () {
      if (!revealed) return;
      if (document.hidden) video.pause();
      else video.play().catch(function () {});
    });

    slot.appendChild(video);

    // Source elements appended via JS don't reliably kick off the resource
    // selection algorithm on their own (most notably in Safari) — without an
    // explicit load(), a 404/unsupported file can sit forever at
    // networkState NETWORK_EMPTY instead of progressing to an error/loaded
    // state at all.
    video.load();
    video.play().catch(function () {
      // Autoplay blocked (rare, given muted+playsinline) — silently keep
      // the photo; no broken controls or paused-frame flash to clean up.
    });
  }

  if (shouldSkip()) return;
  document.querySelectorAll('.media-slot[data-video-mp4]').forEach(mount);
})();
