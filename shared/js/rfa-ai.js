/**
 * RFA Guide — verified website guide for Royal Family Academy.
 *
 * Retrieval-only answers come from window.RFA_KNOWLEDGE. The eight RFA Guide
 * avatar frames mirror the conversation state: idle/blink, greeting,
 * listening, thinking, speaking and WhatsApp handoff.
 */
(function () {
  const KB = window.RFA_KNOWLEDGE;
  if (!KB) return;

  const site = document.body.getAttribute('data-site') || 'main';
  const schoolSites = ['nurseryandprimaryschool', 'highschool', 'sixthform'];
  const currentSchool = schoolSites.includes(site) ? site : null;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[–—]/g, '-')
      .replace(/[^a-z0-9+\s'-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function fmtList(items) {
    return '<ul>' + items.map((item) => `<li>${escapeHtml(item)}</li>`).join('') + '</ul>';
  }

  function pageLink(url, label) {
    return `<a class="link-underline" href="${url}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
  }

  function whatsappLink(label) {
    const message = encodeURIComponent('Hello Royal Family Academy, I have a question from the RFA Guide.');
    const text = label || 'Chat with RFA on WhatsApp';
    return `<a class="link-underline" href="https://wa.me/${KB.contact.whatsappDigits}?text=${message}" target="_blank" rel="noopener">${escapeHtml(text)}</a>`;
  }

  function fallback(extra) {
    const prefix = extra ? `${extra} ` : '';
    return `${prefix}I don't have enough verified RFA information to answer that confidently. ${whatsappLink()} at <strong>${escapeHtml(KB.contact.whatsappNumber)}</strong>, and the RFA team will help.`;
  }

  function schoolName(key) {
    const school = KB.schools.find((item) => item.key === key);
    return school ? school.name : 'Royal Family Academy';
  }

  function detectSchool(q) {
    if (/\b(sixth form|sixthform|college|17\+)\b/.test(q)) return 'sixthform';
    if (/\b(high school|junior high|senior high|jh[123]|jhs[123]|sh[123]|shs[123])\b/.test(q)) return 'highschool';
    if (/\b(nursery|primary|creche|playgroup|pre-school|preschool|pre kindergarten|pre-kindergarten|kindergarten|grade [1-6]|grade (one|two|three|four|five|six))\b/.test(q)) return 'nurseryandprimaryschool';
    return currentSchool;
  }

  function includesAny(q, terms) {
    return terms.some((term) => q.includes(normalize(term)));
  }

  function findAgeEntry(q) {
    const groups = [
      ['nurseryandprimaryschool', KB.ages.earlyYears],
      ['nurseryandprimaryschool', KB.ages.primary],
      ['highschool', KB.ages.highSchool],
      ['sixthform', KB.ages.sixthForm]
    ];
    for (const [school, entries] of groups) {
      for (const entry of entries) {
        const names = [entry.stage].concat(entry.aliases || []);
        if (names.some((name) => q.includes(normalize(name)))) return { school, entry };
      }
    }
    return null;
  }

  function findListedItem(q, items) {
    if (!Array.isArray(items)) return null;
    return items.find((item) => {
      const normalized = normalize(item).replace(/\([^)]*\)/g, '').trim();
      return normalized.length > 2 && q.includes(normalized);
    }) || null;
  }

  function leadershipAnswer(q, requestedSchool) {
    const schoolKeys = requestedSchool ? [requestedSchool] : schoolSites;
    const roleTerms = [
      ['director', 'Director'], ['consultant', 'Consultant'], ['principal', 'Principal'],
      ['vice principal', 'Vice Principal'], ['head teacher', 'Head Teacher'],
      ['deputy head teacher', 'Deputy Head Teacher'], ['executive admin', 'Executive Admin Officer'],
      ['chaplain', 'School Chaplain'], ['head of sixth form', 'Head of Sixth Form']
    ];

    for (const key of schoolKeys) {
      const people = KB.leadership[key] || [];
      const named = people.find((person) => {
        const full = normalize(person.name);
        const pieces = full.split(' ').filter((part) => part.length > 3);
        return q.includes(full) || pieces.some((part) => q.includes(part));
      });
      if (named) return `<strong>${escapeHtml(named.name)}</strong> — ${escapeHtml(named.role)} at ${escapeHtml(schoolName(key))}.`;

      for (const [needle, role] of roleTerms) {
        if (!q.includes(needle)) continue;
        const person = people.find((item) => normalize(item.role).includes(normalize(role)));
        if (person) return `<strong>${escapeHtml(person.name)}</strong> is the ${escapeHtml(person.role)} at ${escapeHtml(schoolName(key))}.`;
      }
    }

    if (requestedSchool && KB.leadership[requestedSchool]) {
      return `${escapeHtml(schoolName(requestedSchool))} leadership includes:${fmtList(KB.leadership[requestedSchool].map((person) => `${person.name} — ${person.role}`))}`;
    }

    return `RFA leadership by school:${schoolSites.map((key) => `<p><strong>${escapeHtml(schoolName(key))}</strong></p>${fmtList((KB.leadership[key] || []).map((person) => `${person.name} — ${person.role}`))}`).join('')}`;
  }

  function admissionsAnswer(q, requestedSchool) {
    if (requestedSchool === 'sixthform') {
      return `Sixth Form College is currently verified for students aged <strong>${escapeHtml(KB.sixthForm.entryAge)}</strong>. ${escapeHtml(KB.sixthForm.positioning)} Detailed current entry, assessment, application and fee requirements are not yet published as verified website information. ${whatsappLink('Ask RFA about Sixth Form admissions')}.`;
    }
    if (requestedSchool === 'highschool') {
      return `High School admissions follow this pathway:${fmtList(KB.admissionsSteps.highSchool)}High School admissions line: <strong>${escapeHtml(KB.contact.highSchoolAdmissionsPhone)}</strong>. ${pageLink(KB.pages.highschool.admissions, 'View High School Admissions')}`;
    }
    if (requestedSchool === 'nurseryandprimaryschool') {
      let extra = '';
      if (q.includes('grade 6') || q.includes('grade six')) extra = `<p>${escapeHtml(KB.admissionsNotes.grade6)}</p>`;
      return `Nursery &amp; Primary admissions follow this pathway:${fmtList(KB.admissionsSteps.nurseryAndPrimary)}${extra}${pageLink(KB.pages.nurseryandprimaryschool.admissions, 'View Nursery & Primary Admissions')}`;
    }
    return `RFA has separate admissions information for each school:${fmtList([
      `Nursery & Primary — ${KB.schools[0].range}`,
      `High School — ${KB.schools[1].range}`,
      `Sixth Form College — ${KB.schools[2].range}`
    ])}Tell me which school you are asking about, or ${whatsappLink('ask RFA on WhatsApp')}.`;
  }

  function answer(query) {
    const q = normalize(query);
    const requestedSchool = detectSchool(q);
    const ageHit = findAgeEntry(q);

    if (!q) return fallback();

    if (includesAny(q, ['motto', 'raising distinguished'])) return `RFA's motto is <strong>“${escapeHtml(KB.identity.motto)}.”</strong>`;
    if (q.includes('vision')) return escapeHtml(KB.identity.vision);
    if (q.includes('mission')) return escapeHtml(KB.identity.mission);
    if (includesAny(q, ['core value', 'values', 'value'])) return `RFA's core value is <strong>Leadership</strong>, anchored on ${escapeHtml(KB.identity.values.join(', '))}.`;
    if (includesAny(q, ['acsi', 'accredit', 'accredited', 'approval'])) return `Royal Family Academy is an <strong>${escapeHtml(KB.acsi.status)}</strong>. ${escapeHtml(KB.acsi.note)}`;

    if (q.includes('whatsapp')) return `You can contact RFA on WhatsApp at <strong>${escapeHtml(KB.contact.whatsappNumber)}</strong>. ${whatsappLink('Open RFA WhatsApp')}`;
    if (includesAny(q, ['contact', 'phone', 'telephone', 'email', 'address', 'location', 'where are you', 'where is rfa', 'reach you', 'call'])) {
      return `Royal Family Academy is at <strong>${escapeHtml(KB.contact.address)}</strong>. Phone: <strong>${escapeHtml(KB.contact.generalPhone)}</strong>. Email: <strong>${escapeHtml(KB.contact.generalEmail)}</strong>. ${whatsappLink('Chat with RFA on WhatsApp')}`;
    }

    if (includesAny(q, ['which schools', 'school sections', 'school levels', 'schools do you have', 'what schools', 'from nursery to sixth form'])) {
      return `Royal Family Academy has three school sections:${fmtList(KB.schools.map((school) => `${school.name} — ${school.range}`))}`;
    }

    if (ageHit && includesAny(q, ['age', 'old', 'eligible', 'eligibility', 'entry', 'minimum', 'admission', 'admit', 'apply', 'year'])) {
      return `The minimum entry age currently listed for <strong>${escapeHtml(ageHit.entry.stage)}</strong> is <strong>${escapeHtml(ageHit.entry.minAge)}</strong>. ${pageLink(KB.pages[ageHit.school].admissions || KB.pages[ageHit.school].home, 'See admissions information')}`;
    }
    if (includesAny(q, ['age table', 'age requirement', 'minimum age', 'entry age', 'eligibility'])) {
      if (requestedSchool === 'highschool') return `High School minimum ages are:${fmtList(KB.ages.highSchool.map((item) => `${item.stage} — ${item.minAge}`))}`;
      if (requestedSchool === 'sixthform') return `Sixth Form College is currently listed for students aged <strong>${escapeHtml(KB.sixthForm.entryAge)}</strong>.`;
      return `Nursery & Primary minimum entry ages are:${fmtList(KB.ages.earlyYears.concat(KB.ages.primary).map((item) => `${item.stage} — ${item.minAge}`))}`;
    }

    if (includesAny(q, ['admission', 'apply', 'application', 'enrol', 'enroll', 'registration', 'register', 'assessment', 'offer', 'onboarding'])) return admissionsAnswer(q, requestedSchool);
    if (includesAny(q, ['fee', 'fees', 'tuition', 'school fees', 'price', 'cost'])) return fallback(requestedSchool === 'sixthform' ? 'Current verified Sixth Form fees are not published on the website.' : 'Current verified fee information is not available in RFA Guide.');

    if (includesAny(q, ['leadership', 'director', 'consultant', 'principal', 'vice principal', 'head teacher', 'deputy head', 'chaplain', 'head of sixth form', 'who runs', 'who is miss', 'who is mrs', 'who is mr', 'who is dr', 'bunmi', 'rifkatu', 'betha', 'lofty', 'ismaila', 'queen', 'grace enesi', 'oluboyo'])) return leadershipAnswer(q, requestedSchool);

    if (includesAny(q, ['school day', 'opening time', 'closing time', 'close', 'start time', 'arrival time', 'what time', 'hours'])) {
      if (requestedSchool === 'sixthform' || requestedSchool === 'highschool') return fallback(`The current verified website information does not publish a complete ${schoolName(requestedSchool)} daily timetable.`);
      return `Nursery runs <strong>${escapeHtml(KB.schoolDay.nursery)}</strong>; Primary runs <strong>${escapeHtml(KB.schoolDay.primary)}</strong>. ${escapeHtml(KB.schoolDay.arrival)} Friday close is ${escapeHtml(KB.schoolDay.fridayClose)}, and staff-training Fridays close at ${escapeHtml(KB.schoolDay.staffTrainingFridayClose)}.`;
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const day = days.find((name) => q.includes(name));
    if (day && includesAny(q, ['schedule', 'timetable', 'rhythm', 'happen', 'what do', 'school day'])) {
      const titleDay = day.charAt(0).toUpperCase() + day.slice(1);
      if (q.includes('nursery') || q.includes('kindergarten') || q.includes('early years')) return `<strong>${titleDay} — Nursery:</strong> ${escapeHtml(KB.weeklyRhythm.nursery[titleDay])}`;
      if (q.includes('primary') || requestedSchool === 'nurseryandprimaryschool') return `<strong>${titleDay} — Primary:</strong> ${escapeHtml(KB.weeklyRhythm.primary[titleDay])}`;
    }

    const primarySubject = findListedItem(q, KB.primaryCurriculum);
    if (primarySubject) return `Yes. <strong>${escapeHtml(primarySubject)}</strong> appears on the current Primary curriculum list. ${pageLink(KB.pages.nurseryandprimaryschool.primary, 'See Primary')}`;
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['curriculum', 'subjects', 'what do you teach', 'primary subjects'])) return `The current Primary curriculum includes:${fmtList(KB.primaryCurriculum)}`;

    if (includesAny(q, ['discovery centre', 'discovery center', 'special needs', 'learning support', 'nild', 'autism', 'speech', 'occupational therapy', 'iep'])) {
      return `${escapeHtml(KB.learningSupport.discoveryNote)} Services listed include:${fmtList(KB.learningSupport.discoveryCentre)}${pageLink(KB.pages.nurseryandprimaryschool.learning, 'Explore Learning & Support')}`;
    }
    if (includesAny(q, ['academic assistance', 'aas', 'learning gap', 'one-to-one', 'one to one'])) return `${escapeHtml(KB.learningSupport.aas)} ${pageLink(KB.pages.nurseryandprimaryschool.learning, 'Explore Learning & Support')}`;

    const primaryClub = findListedItem(q, KB.nurseryPrimaryStudentLife.clubs);
    if (primaryClub) return `Yes. <strong>${escapeHtml(primaryClub)}</strong> is listed among Nursery & Primary clubs.`;
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['clubs', 'club'])) return `Nursery & Primary clubs currently listed are:${fmtList(KB.nurseryPrimaryStudentLife.clubs)}`;
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['sports', 'sport', 'football', 'basketball', 'taekwondo', 'swimming', 'badminton', 'table tennis'])) return `Nursery & Primary sporting facilities/activities include:${fmtList(KB.nurseryPrimaryStudentLife.sports)}Saturday Sports Academy offers:${fmtList(KB.nurseryPrimaryStudentLife.saturdaySportsAcademy)}`;
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['house', 'houses', 'red house', 'green house', 'yellow house', 'blue house'])) return `The Nursery & Primary houses are <strong>${escapeHtml(KB.nurseryPrimaryStudentLife.houses.join(', '))}</strong>.`;
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['event', 'events', 'independence', 'leadership week', 'science week', 'literacy week', 'graduation', 'christmas carol'])) return `Nursery & Primary events currently listed include:${fmtList(KB.nurseryPrimaryStudentLife.events)}`;
    if (includesAny(q, ['excursion', 'excursions', 'trip', 'trips']) && requestedSchool !== 'highschool') return escapeHtml(KB.nurseryPrimaryStudentLife.excursions);
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['chapel', 'christian formation', 'spiritual formation', 'fasting', 'bible studies'])) return `Nursery & Primary Christian formation includes:${fmtList(KB.nurseryPrimaryStudentLife.christianFormation)}`;

    const route = findListedItem(q, KB.parentInformation.busRoutes);
    if (route && includesAny(q, ['bus', 'route', 'transport', 'pick up', 'pickup'])) return `Yes. <strong>${escapeHtml(route)}</strong> is currently listed among RFA Nursery & Primary school bus routes.`;
    if (includesAny(q, ['bus route', 'bus routes', 'school bus', 'transport route', 'transportation'])) return `The currently listed Nursery & Primary bus routes include:${fmtList(KB.parentInformation.busRoutes)}`;
    if (includesAny(q, ['parenting institute', 'parent partnership', 'parents involved'])) return escapeHtml(KB.parentInformation.partnership);
    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['policy', 'policies', 'complaint', 'non discrimination'])) return `Nursery & Primary policy areas currently listed include:${fmtList(KB.parentInformation.policies)}`;

    if (requestedSchool === 'nurseryandprimaryschool' && includesAny(q, ['facility', 'facilities', 'campus', 'laboratory', 'lab', 'clinic', 'auditorium', 'stadium', 'cafeteria', 'montessori room'])) return `Nursery & Primary facilities currently listed include:${fmtList(KB.nurseryPrimaryFacilities)}${pageLink(KB.pages.nurseryandprimaryschool.campus, 'Explore the Nursery & Primary campus')}`;
    if (requestedSchool === 'highschool' && includesAny(q, ['facility', 'facilities', 'campus', 'laboratory', 'lab', 'clinic', 'auditorium', 'stadium', 'cafeteria', 'arts studio'])) return `High School facilities currently listed include:${fmtList(KB.highSchoolFacilities)}${pageLink(KB.pages.highschool.campus, 'Explore the High School campus')}`;

    const juniorSubject = findListedItem(q, KB.highSchoolAcademics.juniorSubjects);
    const seniorSubject = findListedItem(q, KB.highSchoolAcademics.seniorSubjects);
    if (requestedSchool === 'highschool' && (juniorSubject || seniorSubject)) {
      const item = juniorSubject || seniorSubject;
      const level = juniorSubject ? 'Junior High' : 'Senior High';
      return `Yes. <strong>${escapeHtml(item)}</strong> appears on the current ${level} subject list.`;
    }
    if (requestedSchool === 'highschool' && includesAny(q, ['subjects', 'curriculum', 'junior subjects', 'senior subjects', 'what do you teach'])) {
      if (q.includes('junior')) return `Junior High subjects currently listed are:${fmtList(KB.highSchoolAcademics.juniorSubjects)}`;
      if (q.includes('senior')) return `Senior High subjects currently listed are:${fmtList(KB.highSchoolAcademics.seniorSubjects)}`;
      return `<strong>Junior High</strong>${fmtList(KB.highSchoolAcademics.juniorSubjects)}<strong>Senior High</strong>${fmtList(KB.highSchoolAcademics.seniorSubjects)}`;
    }
    if (requestedSchool === 'highschool' && includesAny(q, ['assessment', 'exam', 'exams', 'homework', 'progress report', 'mock'])) return `High School academic assessment currently includes:${fmtList(KB.highSchoolAcademics.assessment)}`;

    if (requestedSchool === 'highschool' && includesAny(q, ['model united nations', 'mun'])) return escapeHtml(KB.highSchoolStudentLife.modelUN);
    if (requestedSchool === 'highschool' && includesAny(q, ['duke of edinburgh', 'duke award', 'bronze cadre', 'silver cadre'])) return escapeHtml(KB.highSchoolStudentLife.dukeOfEdinburgh);
    if (requestedSchool === 'highschool' && includesAny(q, ['club', 'clubs', 'societies'])) return `High School clubs/societies currently verified on the website are:${fmtList(KB.highSchoolStudentLife.clubs)}`;
    if (requestedSchool === 'highschool' && includesAny(q, ['event', 'events', 'school life', 'inter-house', 'festival of art', 'leadership week'])) return `High School events currently listed include:${fmtList(KB.highSchoolStudentLife.events)}`;
    if (requestedSchool === 'highschool' && includesAny(q, ['chapel', 'spiritual formation', 'mentoring', 'fasting', 'discipleship', 'retreat'])) return `High School spiritual formation currently includes:${fmtList(KB.highSchoolStudentLife.spiritualFormation)}`;

    if (requestedSchool === 'highschool' && includesAny(q, ['bullying', 'safety', 'wellbeing', 'harassment', 'security', 'visitor', 'fire drill'])) return `High School safety and wellbeing information includes:${fmtList(KB.highSchoolSafety.wellbeing)}`;
    if (requestedSchool === 'highschool' && includesAny(q, ['conduct', 'discipline rules', 'punctuality', 'attendance', 'responsibility'])) return `High School student conduct expectations include:${fmtList(KB.highSchoolSafety.conduct)}`;
    if (requestedSchool === 'highschool' && includesAny(q, ['parent teacher', 'parent partnership', 'progressive forum'])) return escapeHtml(KB.highSchoolSafety.parentPartnership);
    if (requestedSchool === 'highschool' && includesAny(q, ['policy', 'policies', 'complaint', 'internet rule', 'electronic device'])) return `High School policy areas currently listed include:${fmtList(KB.highSchoolSafety.policies)}`;

    if (requestedSchool === 'highschool' && q.includes('innovation')) return escapeHtml(KB.highSchoolCharacter.innovation);
    if (requestedSchool === 'highschool' && includesAny(q, ['discipline philosophy', 'godly conduct', 'character formation'])) return escapeHtml(KB.highSchoolCharacter.discipline);
    if (requestedSchool === 'highschool' && includesAny(q, ['leadership philosophy', 'leadership development', 'why leadership'])) return escapeHtml(KB.highSchoolCharacter.leadership);

    if (requestedSchool === 'sixthform') {
      if (includesAny(q, ['about', 'overview', 'what is sixth form', 'sixth form college', 'university', 'leadership', 'prepare'])) return `${escapeHtml(KB.sixthForm.positioning)} Entry age currently listed is <strong>${escapeHtml(KB.sixthForm.entryAge)}</strong>. ${pageLink(KB.pages.sixthform.home, 'Explore Sixth Form College')}`;
      if (includesAny(q, ['programme', 'programmes', 'curriculum', 'subject', 'subjects', 'career', 'careers', 'university destination', 'student life', 'fees', 'fee', 'requirements'])) return fallback(`The current RFA website verifies that Sixth Form provides advanced academic programmes and tailored support for university and leadership, but ${escapeHtml(KB.sixthForm.verifiedLimits)}`);
    }

    if (requestedSchool && includesAny(q, ['tell me about', 'about the school', 'school information', 'what is', 'what do you offer'])) {
      const school = KB.schools.find((item) => item.key === requestedSchool);
      if (requestedSchool === 'sixthform') return `${escapeHtml(KB.sixthForm.positioning)} Entry age: <strong>${escapeHtml(KB.sixthForm.entryAge)}</strong>. ${pageLink(school.url, 'Visit Sixth Form College')}`;
      return `<strong>${escapeHtml(school.name)}</strong> serves ${escapeHtml(school.range)}. ${pageLink(school.url, `Visit ${school.name}`)}`;
    }

    return fallback();
  }

  const schoolLinksHtml = KB.schools
    .map((school) => `<a class="rfa-ai__chip" href="${school.url}" target="_blank" rel="noopener">${escapeHtml(school.name)}</a>`)
    .join('');

  const chipsHtml = currentSchool
    ? `
      <a class="rfa-ai__chip" href="${KB.pages[currentSchool].admissions}" target="_blank" rel="noopener">Admissions</a>
      <a class="rfa-ai__chip" href="${KB.pages[currentSchool].contact}" target="_blank" rel="noopener">Contact</a>
      <a class="rfa-ai__chip" href="https://wa.me/${KB.contact.whatsappDigits}" target="_blank" rel="noopener">WhatsApp RFA</a>
    `
    : `${schoolLinksHtml}<a class="rfa-ai__chip" href="https://wa.me/${KB.contact.whatsappDigits}" target="_blank" rel="noopener">WhatsApp RFA</a>`;

  const AVATAR_BASE = 'https://media.royalfamilyacademy.org/rfa-guide/';
  const AVATARS = {
    idle: `${AVATAR_BASE}rfa-guide-idle.webp?v=20260903-frames1`,
    blink: `${AVATAR_BASE}rfa-guide-blink.webp?v=20260903-frames1`,
    listening: `${AVATAR_BASE}rfa-guide-listening.webp?v=20260903-frames1`,
    thinking: `${AVATAR_BASE}rfa-guide-thinking.webp?v=20260903-frames1`,
    'speaking-a': `${AVATAR_BASE}rfa-guide-speaking-a.webp?v=20260903-frames1`,
    'speaking-b': `${AVATAR_BASE}rfa-guide-speaking-b.webp?v=20260903-frames1`,
    greeting: `${AVATAR_BASE}rfa-guide-greeting.webp?v=20260903-frames1`,
    handoff: `${AVATAR_BASE}rfa-guide-handoff.webp?v=20260903-frames1`
  };

  Object.values(AVATARS).forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  const frameStyles = document.createElement('style');
  frameStyles.textContent = `
    .rfa-ai.has-frame-avatar .rfa-ai__launcher::before,
    .rfa-ai.has-frame-avatar .rfa-ai__header::before { display:none!important; }
    .rfa-ai.has-frame-avatar .rfa-ai__launcher {
      width:96px!important;height:144px!important;border-radius:0!important;
      overflow:visible!important;background:transparent!important;
      filter:drop-shadow(0 10px 12px rgba(14,12,18,.25));
    }
    .rfa-ai__avatar-frame { display:block;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none; }
    .rfa-ai__avatar-frame--launcher { width:100%;height:100%;transform-origin:50% 82%;animation:rfaGuideFloat 5.6s ease-in-out infinite; }
    .rfa-ai__avatar-frame--header { width:54px;height:70px;justify-self:center;object-position:50% 8%;filter:drop-shadow(0 4px 5px rgba(14,12,18,.22)); }
    .rfa-ai.has-frame-avatar .rfa-ai__header { grid-template-columns:54px 1fr auto!important;min-height:74px; }
    .rfa-ai[data-avatar-state="greeting"] .rfa-ai__avatar-frame { animation:rfaGuideGreet .72s cubic-bezier(.2,.8,.25,1) both; }
    .rfa-ai[data-avatar-state="listening"] .rfa-ai__avatar-frame--header { animation:rfaGuideListen 2.2s ease-in-out infinite; }
    .rfa-ai[data-avatar-state="thinking"] .rfa-ai__avatar-frame--header { animation:rfaGuideThink 1.05s ease-in-out infinite; }
    .rfa-ai[data-avatar-state^="speaking"] .rfa-ai__avatar-frame--header { animation:rfaGuideSpeak .42s ease-in-out infinite; }
    .rfa-ai[data-avatar-state="handoff"] .rfa-ai__avatar-frame--header { animation:rfaGuidePresent .85s ease-out both; }
    @keyframes rfaGuideFloat { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-5px) rotate(1.2deg)} }
    @keyframes rfaGuideGreet { 0%{transform:translateY(0) rotate(0) scale(1)} 45%{transform:translateY(-6px) rotate(-3deg) scale(1.04)} 100%{transform:translateY(0) rotate(0) scale(1)} }
    @keyframes rfaGuideListen { 0%,100%{transform:rotate(0) translateY(0)} 50%{transform:rotate(-1.5deg) translateY(-2px)} }
    @keyframes rfaGuideThink { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-2px) scale(1.035)} }
    @keyframes rfaGuideSpeak { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
    @keyframes rfaGuidePresent { 0%{transform:translateX(-3px) scale(.98)} 65%{transform:translateX(2px) scale(1.035)} 100%{transform:translateX(0) scale(1)} }
    @media(max-width:480px){
      .rfa-ai.has-frame-avatar .rfa-ai__launcher{width:84px!important;height:126px!important;}
      .rfa-ai__avatar-frame--header{width:50px;height:65px;}
      .rfa-ai.has-frame-avatar .rfa-ai__header{grid-template-columns:50px 1fr auto!important;}
    }
    @media(prefers-reduced-motion:reduce){
      .rfa-ai__avatar-frame{animation:none!important;transition:none!important;}
    }
  `;
  document.head.appendChild(frameStyles);

  const root = document.createElement('div');
  root.className = 'rfa-ai has-frame-avatar';
  root.dataset.avatarState = 'idle';
  root.innerHTML = `
    <button class="rfa-ai__launcher" type="button" aria-expanded="false" aria-controls="rfa-ai-panel" aria-label="Open RFA Guide">
      <img class="rfa-ai__avatar-frame rfa-ai__avatar-frame--launcher" src="${AVATARS.idle}" alt="" aria-hidden="true">
      <span class="rfa-ai__launcher-dot" aria-hidden="true"></span>
      <span class="rfa-ai__launcher-label">RFA Guide</span>
    </button>
    <div class="rfa-ai__panel" id="rfa-ai-panel" role="dialog" aria-label="RFA Guide" aria-hidden="true">
      <div class="rfa-ai__header">
        <img class="rfa-ai__avatar-frame rfa-ai__avatar-frame--header" src="${AVATARS.idle}" alt="" aria-hidden="true">
        <p class="rfa-ai__title">RFA Guide</p>
        <button class="rfa-ai__close" type="button" aria-label="Close RFA Guide">&times;</button>
      </div>
      <div class="rfa-ai__messages" id="rfa-ai-messages">
        <div class="rfa-ai__msg rfa-ai__msg--bot">Hello — I'm <strong>RFA Guide</strong>. Ask me about Nursery &amp; Primary, High School or Sixth Form. I answer from verified RFA website information. If I can't verify something, I'll connect you to RFA on WhatsApp.</div>
      </div>
      <div class="rfa-ai__actions">${chipsHtml}</div>
      <form class="rfa-ai__form" id="rfa-ai-form">
        <input class="rfa-ai__input" type="text" placeholder="Ask RFA Guide…" aria-label="Ask RFA Guide a question" autocomplete="off">
        <button class="rfa-ai__send" type="submit" aria-label="Send question">→</button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  const launcher = root.querySelector('.rfa-ai__launcher');
  const panel = root.querySelector('.rfa-ai__panel');
  const closeBtn = root.querySelector('.rfa-ai__close');
  const form = root.querySelector('#rfa-ai-form');
  const input = root.querySelector('.rfa-ai__input');
  const sendButton = root.querySelector('.rfa-ai__send');
  const messages = root.querySelector('#rfa-ai-messages');
  const avatarImages = root.querySelectorAll('.rfa-ai__avatar-frame');
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let idleTimer = null;
  let stateTimer = null;
  let speakingTimer = null;

  function clearStateTimers() {
    clearTimeout(stateTimer);
    clearInterval(speakingTimer);
    stateTimer = null;
    speakingTimer = null;
  }

  function setAvatarState(state) {
    if (!AVATARS[state]) state = 'idle';
    root.dataset.avatarState = state;
    avatarImages.forEach((img) => {
      if (img.src !== AVATARS[state]) img.src = AVATARS[state];
    });
  }

  function scheduleIdleMoment() {
    clearTimeout(idleTimer);
    if (reducedMotion || root.classList.contains('is-open')) return;
    const wait = 4200 + Math.round(Math.random() * 3400);
    idleTimer = setTimeout(() => {
      if (root.classList.contains('is-open')) return;
      const greet = Math.random() < 0.22;
      setAvatarState(greet ? 'greeting' : 'blink');
      stateTimer = setTimeout(() => {
        if (!root.classList.contains('is-open')) setAvatarState('idle');
        scheduleIdleMoment();
      }, greet ? 720 : 190);
    }, wait);
  }

  function speakFor(html) {
    clearStateTimers();
    if (reducedMotion) {
      setAvatarState(root.classList.contains('is-open') ? 'listening' : 'idle');
      return;
    }
    let phase = false;
    setAvatarState('speaking-a');
    speakingTimer = setInterval(() => {
      phase = !phase;
      setAvatarState(phase ? 'speaking-b' : 'speaking-a');
    }, 220);
    const plainLength = html.replace(/<[^>]+>/g, '').length;
    const duration = Math.max(1100, Math.min(3200, plainLength * 18));
    stateTimer = setTimeout(() => {
      clearInterval(speakingTimer);
      speakingTimer = null;
      setAvatarState(root.classList.contains('is-open') ? 'listening' : 'idle');
    }, duration);
  }

  function open() {
    clearTimeout(idleTimer);
    clearStateTimers();
    root.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    setAvatarState('greeting');
    stateTimer = setTimeout(() => setAvatarState('listening'), reducedMotion ? 0 : 700);
    input.focus();
  }

  function close() {
    clearStateTimers();
    root.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
    setAvatarState('idle');
    launcher.focus();
    scheduleIdleMoment();
  }

  launcher.addEventListener('pointerenter', () => {
    if (!root.classList.contains('is-open')) setAvatarState('greeting');
  });
  launcher.addEventListener('pointerleave', () => {
    if (!root.classList.contains('is-open')) setAvatarState('idle');
  });
  launcher.addEventListener('focus', () => {
    if (!root.classList.contains('is-open')) setAvatarState('greeting');
  });
  launcher.addEventListener('blur', () => {
    if (!root.classList.contains('is-open')) setAvatarState('idle');
  });
  launcher.addEventListener('click', () => (root.classList.contains('is-open') ? close() : open()));
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-open')) close();
  });

  input.addEventListener('focus', () => {
    if (root.classList.contains('is-open') && !speakingTimer) setAvatarState('listening');
  });
  input.addEventListener('input', () => {
    if (root.classList.contains('is-open') && !speakingTimer) setAvatarState('listening');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    clearStateTimers();
    const userMsg = document.createElement('div');
    userMsg.className = 'rfa-ai__msg rfa-ai__msg--user';
    userMsg.textContent = query;
    messages.appendChild(userMsg);
    messages.scrollTop = messages.scrollHeight;

    input.value = '';
    input.disabled = true;
    sendButton.disabled = true;
    setAvatarState('thinking');

    const html = answer(query);
    const isHandoff = html.includes("I don't have enough verified RFA information to answer that confidently");
    const thinkingDelay = reducedMotion ? 0 : 560;

    stateTimer = setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = 'rfa-ai__msg rfa-ai__msg--bot';
      botMsg.innerHTML = html;
      messages.appendChild(botMsg);
      messages.scrollTop = messages.scrollHeight;
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();

      if (isHandoff) {
        setAvatarState('handoff');
        stateTimer = setTimeout(() => setAvatarState('listening'), reducedMotion ? 0 : 1750);
      } else {
        speakFor(html);
      }
    }, thinkingDelay);
  });

  scheduleIdleMoment();
})();
