const CLUBS = [
  { id: 'boys-scout', name: 'Boys Scout', capacity: 40, group: 'general' },
  { id: 'drama', name: 'Drama Club', capacity: 30, group: 'general' },
  { id: 'foreign-languages', name: 'Foreign Languages Club', capacity: 25, group: 'general' },
  { id: 'girl-guide-brownie', name: 'Girl Guide / Brownie Club', capacity: 40, group: 'general' },
  { id: 'jec', name: 'JEC Club', capacity: 25, group: 'general' },
  { id: 'jet', name: 'JET Club', capacity: 35, group: 'general' },
  { id: 'knowledge-empowerment', name: 'Knowledge Empowerment Club', capacity: 25, group: 'general' },
  { id: 'literary-debating', name: 'Literary & Debating Club', capacity: 30, group: 'general' },
  { id: 'maths', name: 'Maths Club', capacity: 35, group: 'general' },
  { id: 'nigerian-languages', name: 'Nigerian Languages Club', capacity: 25, group: 'general' },
  { id: 'red-cross', name: 'Red Cross Club', capacity: 35, group: 'general' },
  { id: 'young-farmers', name: 'Young Farmers Club', capacity: 25, group: 'general' },

  { id: 'fine-arts-upper', name: 'Fine Arts Club', capacity: 40, group: 'upper' },
  { id: 'home-makers-upper', name: 'Home Makers Club', capacity: 35, group: 'upper' },
  { id: 'ict-upper', name: 'ICT Club', capacity: 25, group: 'upper' },
  { id: 'music-upper', name: 'Music Club', capacity: 40, group: 'upper' },

  { id: 'fine-arts-lower', name: 'Fine Arts Club', capacity: 35, group: 'lower' },
  { id: 'home-makers-lower', name: 'Home Makers Club', capacity: 35, group: 'lower' },
  { id: 'ict-lower', name: 'ICT Club', capacity: 35, group: 'lower' },
  { id: 'music-lower', name: 'Music Club', capacity: 35, group: 'lower' },

  { id: 'fine-arts-nursery', name: 'Fine Arts Club', capacity: 20, group: 'nursery' },
  { id: 'ict-nursery', name: 'ICT Clubs', capacity: 20, group: 'nursery' },
  { id: 'jec-nursery', name: 'JEC Club', capacity: 15, group: 'nursery' },
  { id: 'knowledge-empowerment-nursery', name: 'Knowledge Empowerment Club', capacity: 15, group: 'nursery' },
  { id: 'languages-nursery', name: 'Languages Club', capacity: 15, group: 'nursery' }
];

/*
 * Portal integration
 * ------------------
 * Set API_BASE to the portal/API origin when the club endpoints are ready.
 * Expected endpoints:
 * GET  {API_BASE}/public/clubs/availability?admissionNumber=...&classCode=...
 *   -> { student?: { name, classCode }, registration?: { clubId }, clubs?: [{ id, registeredCount, isOpen }] }
 * POST {API_BASE}/public/clubs/register
 *   body: { admissionNumber, classCode, clubId }
 *   -> { ok: true, confirmationCode?: string }
 *
 * Keep final eligibility, duplicate checks and capacity enforcement on the server.
 */
const API_BASE = '';

const state = {
  student: null,
  selectedClubId: null,
  availability: new Map(),
  existingRegistration: null
};

const classNames = {
  KG: 'Kindergarten', G1: 'Grade 1', G2: 'Grade 2', G3: 'Grade 3', G4: 'Grade 4', G5: 'Grade 5', G6: 'Grade 6',
  JH1: 'Junior High 1', JH2: 'Junior High 2', JH3: 'Junior High 3', SH1: 'Senior High 1', SH2: 'Senior High 2', SH3: 'Senior High 3'
};

const studentForm = document.getElementById('student-form');
const clubsGrid = document.getElementById('clubs-grid');
const stickySelection = document.getElementById('sticky-selection');
const selectedClubName = document.getElementById('selected-club-name');
const continueButton = document.getElementById('continue-button');
const confirmCheckbox = document.getElementById('confirm-checkbox');
const submitButton = document.getElementById('submit-registration');
const connectionNotice = document.getElementById('connection-notice');
const submitMessage = document.getElementById('submit-message');

studentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!studentForm.reportValidity()) return;

  const admissionNumber = document.getElementById('admission-number').value.trim();
  const classCode = document.getElementById('class-code').value;
  const studentName = document.getElementById('student-name').value.trim();

  state.student = { admissionNumber, classCode, name: studentName || 'Learner' };
  state.selectedClubId = null;
  state.availability.clear();
  state.existingRegistration = null;

  if (API_BASE) {
    await loadPortalAvailability();
  } else {
    connectionNotice.hidden = false;
    connectionNotice.textContent = 'Preview mode: club eligibility and capacity limits are active, but live portal availability and final submission are not connected yet.';
  }

  renderClubs();
  goToStep(2);
});

async function loadPortalAvailability() {
  connectionNotice.hidden = false;
  connectionNotice.textContent = 'Checking live club availability…';
  try {
    const url = new URL(`${API_BASE}/public/clubs/availability`);
    url.searchParams.set('admissionNumber', state.student.admissionNumber);
    url.searchParams.set('classCode', state.student.classCode);
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Availability request failed');
    const data = await response.json();

    if (data.student) {
      state.student.name = data.student.name || state.student.name;
      state.student.classCode = data.student.classCode || state.student.classCode;
    }
    (data.clubs || []).forEach(item => state.availability.set(item.id, item));
    state.existingRegistration = data.registration || null;

    if (state.existingRegistration) {
      connectionNotice.textContent = 'This learner already has an active club registration. The portal should require an authorised change rather than a second registration.';
    } else {
      connectionNotice.hidden = true;
    }
  } catch (error) {
    connectionNotice.hidden = false;
    connectionNotice.textContent = 'Live portal availability could not be loaded. Please try again or contact the school administrator.';
  }
}

function eligibleGroups(classCode) {
  if (classCode === 'KG') return ['nursery'];
  if (['G1', 'G2', 'G3'].includes(classCode)) return ['general', 'lower'];
  if (['G4', 'G5'].includes(classCode)) return ['general', 'upper'];
  return ['general'];
}

function renderClubs() {
  const groups = eligibleGroups(state.student.classCode);
  const clubs = CLUBS.filter(club => groups.includes(club.group));
  const note = document.getElementById('eligibility-note');

  if (state.student.classCode === 'KG') note.textContent = 'Showing Nursery clubs for Kindergarten pupils.';
  else if (['G1', 'G2', 'G3'].includes(state.student.classCode)) note.textContent = `Showing general clubs plus Lower Primary clubs for ${classNames[state.student.classCode]}.`;
  else if (['G4', 'G5'].includes(state.student.classCode)) note.textContent = `Showing general clubs plus Upper Primary clubs for ${classNames[state.student.classCode]}.`;
  else note.textContent = `Showing the general club list for ${classNames[state.student.classCode] || 'the selected class'}.`;

  clubsGrid.innerHTML = clubs.map(club => clubCard(club)).join('');
  clubsGrid.querySelectorAll('.club-card:not(.is-full)').forEach(card => {
    card.addEventListener('click', () => selectClub(card.dataset.clubId));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectClub(card.dataset.clubId);
      }
    });
  });
}

function clubCard(club) {
  const live = state.availability.get(club.id);
  const registered = Number.isFinite(live?.registeredCount) ? live.registeredCount : null;
  const remaining = registered === null ? null : Math.max(0, club.capacity - registered);
  const full = live?.isOpen === false || remaining === 0;
  const low = remaining !== null && remaining > 0 && remaining <= Math.max(3, Math.ceil(club.capacity * 0.15));
  const selected = state.selectedClubId === club.id;

  let capacityText = `Maximum ${club.capacity} members`;
  if (remaining !== null) capacityText = full ? 'Club is full' : `${remaining} place${remaining === 1 ? '' : 's'} remaining`;

  const groupLabel = {
    general: 'General club',
    lower: 'Lower Primary · Grades 1–3',
    upper: 'Upper Primary · Grades 4–5',
    nursery: 'Nursery · Kindergarten'
  }[club.group];

  return `
    <label class="club-card ${selected ? 'is-selected' : ''} ${full ? 'is-full' : ''}" data-club-id="${club.id}" tabindex="${full ? '-1' : '0'}" aria-disabled="${full}">
      <input type="radio" name="club" value="${club.id}" ${selected ? 'checked' : ''} ${full ? 'disabled' : ''}>
      <div class="club-card__top">
        <h3>${escapeHtml(club.name)}</h3>
      </div>
      <span class="club-card__tag">${groupLabel}</span>
      <div class="club-card__capacity"><span class="capacity-dot ${full ? 'is-full' : low ? 'is-low' : remaining !== null ? 'is-open' : ''}"></span>${capacityText}</div>
    </label>`;
}

function selectClub(clubId) {
  const club = CLUBS.find(item => item.id === clubId);
  if (!club) return;
  const live = state.availability.get(club.id);
  if (live?.isOpen === false || (Number.isFinite(live?.registeredCount) && live.registeredCount >= club.capacity)) return;

  state.selectedClubId = clubId;
  renderClubs();
  selectedClubName.textContent = club.name;
  stickySelection.hidden = false;
  continueButton.disabled = false;
}

continueButton.addEventListener('click', () => {
  if (!state.selectedClubId) return;
  const club = CLUBS.find(item => item.id === state.selectedClubId);
  document.getElementById('review-student').textContent = state.student.name;
  document.getElementById('review-admission').textContent = state.student.admissionNumber;
  document.getElementById('review-class').textContent = classNames[state.student.classCode] || state.student.classCode;
  document.getElementById('review-club').textContent = club.name;
  document.getElementById('review-capacity').textContent = `${club.capacity} members maximum`;
  confirmCheckbox.checked = false;
  submitButton.disabled = true;
  submitMessage.hidden = true;
  goToStep(3);
});

confirmCheckbox.addEventListener('change', () => {
  submitButton.disabled = !confirmCheckbox.checked;
});

submitButton.addEventListener('click', async () => {
  if (!confirmCheckbox.checked || !state.selectedClubId) return;

  if (!API_BASE) {
    submitMessage.hidden = false;
    submitMessage.className = 'notice notice--info';
    submitMessage.textContent = 'The page is ready, but final registration is disabled until the existing portal club API is connected. No registration has been saved yet.';
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Submitting…';
  submitMessage.hidden = true;

  try {
    const response = await fetch(`${API_BASE}/public/clubs/register`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admissionNumber: state.student.admissionNumber,
        classCode: state.student.classCode,
        clubId: state.selectedClubId
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.message || 'Registration could not be completed');

    const club = CLUBS.find(item => item.id === state.selectedClubId);
    document.getElementById('success-copy').textContent = data.confirmationCode
      ? `${state.student.name} has been registered for ${club.name}. Confirmation: ${data.confirmationCode}.`
      : `${state.student.name} has been registered for ${club.name}.`;
    goToStep('success');
  } catch (error) {
    submitMessage.hidden = false;
    submitMessage.className = 'notice notice--error';
    submitMessage.textContent = error.message || 'Registration failed. Please try again.';
    submitButton.disabled = false;
    submitButton.textContent = 'Submit registration';
  }
});

document.querySelectorAll('[data-back]').forEach(button => {
  button.addEventListener('click', () => goToStep(Number(button.dataset.back)));
});

document.getElementById('start-over').addEventListener('click', () => {
  studentForm.reset();
  state.student = null;
  state.selectedClubId = null;
  state.availability.clear();
  stickySelection.hidden = true;
  goToStep(1);
});

function goToStep(step) {
  document.querySelectorAll('.step').forEach(panel => {
    const active = String(panel.dataset.step) === String(step);
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });

  const numericStep = typeof step === 'number' ? step : 3;
  document.querySelectorAll('.progress__item').forEach(item => {
    const n = Number(item.dataset.progress);
    item.classList.toggle('is-active', n === numericStep && step !== 'success');
    item.classList.toggle('is-complete', n < numericStep || step === 'success');
  });
  document.querySelector('.registration-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}
