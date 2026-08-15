/**
 * RFA AI — a discreet, premium assistant launcher present across the
 * gateway and all three school subdomains.
 *
 * By design this is a retrieval-only assistant: every answer is composed
 * from window.RFA_KNOWLEDGE (rfa-knowledge.js) using simple keyword
 * matching. It never calls a generative model and therefore cannot
 * invent institutional facts — if nothing in the knowledge base matches,
 * it says so plainly and hands the visitor to a verified contact route
 * instead of guessing. Swap the `answer()` internals for a real backed
 * assistant later without changing the markup/CSS contract.
 */
(function () {
  const KB = window.RFA_KNOWLEDGE;
  if (!KB) return;

  const site = document.body.getAttribute('data-site') || 'main';

  const schoolLinksHtml = KB.schools
    .map((s) => `<li><a class="link-underline" href="${s.url}" target="_blank" rel="noopener">${s.name}</a></li>`)
    .join('');

  function fmtList(items) {
    return '<ul>' + items.map((i) => `<li>${i}</li>`).join('') + '</ul>';
  }

  const intents = [
    {
      keywords: ['motto', 'raising distinguished'],
      answer: () => `RFA's motto is <strong>"${KB.identity.motto}."</strong>`,
    },
    {
      keywords: ['vision'],
      answer: () => KB.identity.vision,
    },
    {
      keywords: ['mission'],
      answer: () => KB.identity.mission,
    },
    {
      keywords: ['value', 'values', 'core value'],
      answer: () =>
        `RFA's core value is <strong>Leadership</strong>, anchored on: ${fmtList(KB.identity.values)}`,
    },
    {
      keywords: ['acsi', 'accredit', 'approv'],
      answer: () =>
        `Royal Family Academy is a <strong>${KB.acsi.status}</strong>. ${KB.acsi.note}`,
    },
    {
      keywords: ['school', 'nursery', 'primary', 'high school', 'sixth form', 'which school', 'age'],
      answer: () =>
        `RFA runs from Nursery to Sixth Form across three schools:${fmtList(
          KB.schools.map((s) => `<a class="link-underline" href="${s.url}" target="_blank" rel="noopener">${s.name}</a> — ${s.range}`)
        )}`,
    },
    {
      keywords: ['contact', 'phone', 'email', 'address', 'call', 'reach'],
      answer: () =>
        `You can reach RFA at ${KB.contact.generalPhone}, ${KB.contact.generalEmail}, or visit ${KB.contact.address}.`,
    },
    {
      keywords: ['admission', 'apply', 'enrol', 'enroll', 'register'],
      answer: () => {
        if (site === 'nurseryandprimaryschool') {
          return `Nursery &amp; Primary admissions: ${fmtList(KB.admissionsSteps.nurseryAndPrimary)}`;
        }
        if (site === 'highschool') {
          return `High School admissions: ${fmtList(KB.admissionsSteps.highSchool)} High School admissions line: ${KB.contact.highSchoolAdmissionsPhone}.`;
        }
        return `Each school has its own admissions pathway — choose a school first:${schoolLinksHtml ? `<ul>${schoolLinksHtml}</ul>` : ''}`;
      },
    },
    {
      keywords: ['hour', 'time', 'school day', 'closing', 'opening', 'resumption'],
      answer: () =>
        `Nursery runs ${KB.schoolDay.nursery}, Primary runs ${KB.schoolDay.primary}. School closes at ${KB.schoolDay.fridayClose} school-wide, and at ${KB.schoolDay.staffTrainingFridayClose} on staff-training Fridays. Pupils are expected to arrive by ${KB.schoolDay.arrival}.`,
    },
    {
      keywords: ['leadership', 'principal', 'director', 'head teacher', 'who runs', 'staff'],
      answer: () =>
        `RFA's leadership includes: ${fmtList(KB.leadership.map((l) => `${l.name} — ${l.role}`))}`,
    },
  ];

  function answer(query) {
    const q = query.toLowerCase();
    const hit = intents.find((intent) => intent.keywords.some((k) => q.includes(k)));
    if (hit) return hit.answer();
    return `I don't have verified RFA information on that yet. Please contact admissions directly at ${KB.contact.generalPhone} or ${KB.contact.generalEmail}, and they'll help.`;
  }

  // ---- Widget markup -----------------------------------------------------
  // Quick-action chips are context-aware: the gateway only ever routes
  // visitors onward to a school (it has no admissions/contact pages of its
  // own per spec §4.1); each subdomain links to its own sibling pages.
  const chipsHtml =
    site === 'main'
      ? KB.schools
          .map((s) => `<a class="rfa-ai__chip" href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`)
          .join('')
      : `
        <a class="rfa-ai__chip" href="contact.html">Book a Visit</a>
        <a class="rfa-ai__chip" href="contact.html">Contact Admissions</a>
        <a class="rfa-ai__chip" href="admissions.html">Apply</a>
      `;

  const root = document.createElement('div');
  root.className = 'rfa-ai';
  root.innerHTML = `
    <button class="rfa-ai__launcher" type="button" aria-expanded="false" aria-controls="rfa-ai-panel" aria-label="Open RFA AI assistant">
      <span class="rfa-ai__launcher-dot" aria-hidden="true"></span>
      <span class="rfa-ai__launcher-label">RFA AI</span>
    </button>
    <div class="rfa-ai__panel" id="rfa-ai-panel" role="dialog" aria-label="RFA AI assistant" aria-hidden="true">
      <div class="rfa-ai__header">
        <p class="rfa-ai__title">RFA AI</p>
        <button class="rfa-ai__close" type="button" aria-label="Close assistant">&times;</button>
      </div>
      <div class="rfa-ai__messages" id="rfa-ai-messages">
        <div class="rfa-ai__msg rfa-ai__msg--bot">Hello — ask me about RFA's motto, values, ACSI status, schools, admissions, hours or contact details. I only answer from verified RFA information.</div>
      </div>
      <div class="rfa-ai__actions">${chipsHtml}</div>
      <form class="rfa-ai__form" id="rfa-ai-form">
        <input class="rfa-ai__input" type="text" placeholder="Ask about RFA…" aria-label="Ask RFA AI a question" autocomplete="off">
        <button class="rfa-ai__send" type="submit" aria-label="Send">→</button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  const launcher = root.querySelector('.rfa-ai__launcher');
  const panel = root.querySelector('.rfa-ai__panel');
  const closeBtn = root.querySelector('.rfa-ai__close');
  const form = root.querySelector('#rfa-ai-form');
  const input = root.querySelector('.rfa-ai__input');
  const messages = root.querySelector('#rfa-ai-messages');

  function open() {
    root.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    input.focus();
  }
  function close() {
    root.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    launcher.focus();
  }

  launcher.addEventListener('click', () => (root.classList.contains('is-open') ? close() : open()));
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('is-open')) close();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    const userMsg = document.createElement('div');
    userMsg.className = 'rfa-ai__msg rfa-ai__msg--user';
    userMsg.textContent = q;
    messages.appendChild(userMsg);

    const botMsg = document.createElement('div');
    botMsg.className = 'rfa-ai__msg rfa-ai__msg--bot';
    botMsg.innerHTML = answer(q);
    messages.appendChild(botMsg);

    input.value = '';
    messages.scrollTop = messages.scrollHeight;
  });
})();
