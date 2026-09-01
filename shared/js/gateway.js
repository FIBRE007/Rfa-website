/**
 * Staged entrance for the single-viewport main-domain gateway:
 * background → logo → ACSI badge → status → statement → CTA → school links.
 * No IntersectionObserver needed — there is nothing to scroll to.
 */
(function () {
  var gateway = document.querySelector('.gateway');
  if (!gateway) return;
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      gateway.classList.add('is-revealed');
    });
  });
})();

/**
 * "Read More" / "Read Less" toggle for the gateway statement.
 *
 * Clamps the text to 4 lines by trimming it word-by-word (binary search)
 * until it actually fits within 4 line-heights, measured live against the
 * real font/line-height/container width — not a CSS overflow/line-clamp
 * trick. The toggle is a real inline <button> that sits as the last word
 * of the truncated text, so it reads as part of the sentence rather than
 * a separate control, and stays keyboard-operable (native button focus
 * plus aria-expanded/aria-controls).
 *
 * Recomputed on resize so the 4-line cutoff stays correct across desktop,
 * tablet and mobile breakpoints. If the full text already fits within 4
 * lines, the toggle stays hidden — nothing to expand.
 */
(function () {
  var statement = document.getElementById('gateway-statement');
  var textEl = document.getElementById('gateway-statement-text');
  var toggle = document.querySelector('[data-statement-toggle]');
  if (!statement || !textEl || !toggle) return;

  var fullText = statement.getAttribute('data-full-text');
  if (!fullText) return;
  var words = fullText.split(' ');
  var MAX_LINES = 4;
  var expanded = false;
  var collapsedText = null; // null = full text already fits within MAX_LINES

  function fitsWithinMaxLines(candidateText) {
    textEl.textContent = candidateText;
    var cs = getComputedStyle(statement);
    var lineHeight = parseFloat(cs.lineHeight);
    var verticalPadding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    if (isNaN(lineHeight)) {
      // Last-resort fallback if line-height ever computes as "normal" instead
      // of a resolved px value: assume the current single line's height.
      lineHeight = statement.scrollHeight - verticalPadding;
    }
    // scrollHeight includes the element's own padding, so the threshold must too.
    return statement.scrollHeight <= lineHeight * MAX_LINES + verticalPadding + 2;
  }

  function computeCollapsedText() {
    if (fitsWithinMaxLines(fullText)) return null;
    var lo = 0, hi = words.length;
    while (lo < hi) {
      var mid = Math.ceil((lo + hi) / 2);
      if (fitsWithinMaxLines(words.slice(0, mid).join(' '))) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    return words.slice(0, lo).join(' ');
  }

  function render(withTransition) {
    var targetText = expanded ? fullText : (collapsedText !== null ? collapsedText : fullText);
    var startHeight = withTransition ? statement.getBoundingClientRect().height : null;

    textEl.textContent = targetText;
    toggle.hidden = collapsedText === null;
    toggle.textContent = expanded ? 'Read Less' : 'Read More';
    toggle.setAttribute('aria-expanded', String(expanded));

    if (!withTransition) return;
    var endHeight = statement.getBoundingClientRect().height;
    statement.style.height = startHeight + 'px';
    void statement.offsetHeight; // force reflow so the browser locks in the start height
    statement.classList.add('has-height-transition');
    requestAnimationFrame(function () {
      statement.style.height = endHeight + 'px';
    });
    var cleanup = function (e) {
      if (e && e.propertyName !== 'height') return;
      statement.removeEventListener('transitionend', cleanup);
      statement.classList.remove('has-height-transition');
      statement.style.height = '';
    };
    statement.addEventListener('transitionend', cleanup);
    setTimeout(cleanup, 400); // safety net if transitionend doesn't fire
  }

  function refresh() {
    collapsedText = computeCollapsedText();
    render(false);
  }

  toggle.addEventListener('click', function () {
    expanded = !expanded;
    render(true);
  });

  refresh();

  // The initial refresh() above can run before the real web fonts finish
  // downloading (font-display: swap shows a fallback font first) — on a
  // slower mobile connection the fallback-vs-real-font metrics can differ
  // enough to change how many words fit per line, leaving the clamp
  // slightly off once the swap happens. Re-measure once fonts are ready.
  if (window.document && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (!expanded) refresh();
    });
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!expanded) refresh();
    }, 150);
  });
})();
