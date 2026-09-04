import fs from 'node:fs';

const AI_PATH = 'shared/js/rfa-ai.js';
const MARKER = 'RFA Guide subject-first routing and safe mobile scroll v1';

let source = fs.readFileSync(AI_PATH, 'utf8');
let changed = false;

const oldAdmission = "    if (includesAny(q, ['admission', 'apply', 'application', 'enrol', 'enroll', 'registration', 'register', 'assessment', 'offer', 'onboarding'])) return admissionsAnswer(q, requestedSchool);";
const newAdmission = "    if (includesAny(q, ['admission', 'apply', 'application', 'enrol', 'enroll', 'registration', 'register', 'assessment', 'onboarding'])) return admissionsAnswer(q, requestedSchool);";

if (source.includes(oldAdmission)) {
  source = source.replace(oldAdmission, newAdmission);
  changed = true;
}

if (!source.includes(MARKER)) {
  if (!source.includes(newAdmission)) {
    throw new Error('Could not find the admissions routing line in rfa-ai.js.');
  }

  const subjectRouting = [
    `    // ${MARKER}: subject/curriculum questions must be answered before admissions.`,
    "    // This prevents words such as 'offered' from being mistaken for an admission 'offer'.",
    "    const highSchoolSubjectIntent = requestedSchool === 'highschool' && /\\b(subject|subjects|curriculum|course|courses|teach|teaching)\\b/.test(q);",
    "    if (highSchoolSubjectIntent && KB.highSchoolAcademics) {",
    "      const juniorIntent = /\\b(jh\\s*[123]|jhs\\s*[123]|js\\s*[123]|jss\\s*[123]|junior high|junior secondary)\\b/.test(q);",
    "      const seniorIntent = /\\b(sh\\s*[123]|shs\\s*[123]|ss\\s*[123]|sss\\s*[123]|senior high|senior secondary)\\b/.test(q);",
    "      const juniorSubjects = KB.highSchoolAcademics.juniorSubjects || [];",
    "      const seniorSubjects = KB.highSchoolAcademics.seniorSubjects || [];",
    "      const namedSubject = findListedItem(q, juniorSubjects.concat(seniorSubjects));",
    "",
    "      if (namedSubject && juniorIntent) {",
    "        const listed = juniorSubjects.includes(namedSubject);",
    "        return listed",
    "          ? `<strong>${escapeHtml(namedSubject)}</strong> is on RFA's current published Junior High subject list. ${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`",
    "          : `<strong>${escapeHtml(namedSubject)}</strong> appears on RFA's published Senior High subject list, but not on the current Junior High list. ${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`;",
    "      }",
    "",
    "      if (namedSubject && seniorIntent) {",
    "        const listed = seniorSubjects.includes(namedSubject);",
    "        return listed",
    "          ? `<strong>${escapeHtml(namedSubject)}</strong> is on RFA's current published Senior High subject list. ${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`",
    "          : `<strong>${escapeHtml(namedSubject)}</strong> appears on RFA's published Junior High subject list, but not on the current Senior High list. ${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`;",
    "      }",
    "",
    "      if (juniorIntent) {",
    "        return `RFA currently publishes one <strong>Junior High</strong> subject list rather than separate lists for JH 1, JH 2 and JH 3. The published Junior High subjects are:${fmtList(juniorSubjects)}${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`;",
    "      }",
    "",
    "      if (seniorIntent) {",
    "        return `RFA currently publishes one <strong>Senior High</strong> subject list rather than separate lists for SH 1, SH 2 and SH 3. The published Senior High subjects are:${fmtList(seniorSubjects)}${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`;",
    "      }",
    "",
    "      return `<strong>Junior High subjects</strong>${fmtList(juniorSubjects)}<strong>Senior High subjects</strong>${fmtList(seniorSubjects)}${pageLink(KB.pages.highschool.academics, 'View High School Academics')}`;",
    "    }",
    ""
  ].join('\n');

  source = source.replace(newAdmission, subjectRouting + newAdmission);
  changed = true;
}

const oldMobileStack = [
  '      .rfa-ai.is-open .rfa-ai__messages-list {',
  '        min-height:100%;',
  '        min-width:0;',
  '        width:100%;',
  '        display:flex;',
  '        flex-direction:column;',
  '        justify-content:flex-end;',
  '        gap:.45rem;',
  '      }'
].join('\n');

const newMobileStack = [
  '      .rfa-ai.is-open .rfa-ai__messages {',
  '        gap:0!important;',
  '        overflow-y:auto!important;',
  '        overscroll-behavior:contain;',
  '        -webkit-overflow-scrolling:touch;',
  '        touch-action:pan-y;',
  '      }',
  '      .rfa-ai.is-open .rfa-ai__messages-list {',
  '        min-height:100%;',
  '        min-width:0;',
  '        width:100%;',
  '        display:flex;',
  '        flex-direction:column;',
  '        justify-content:flex-start;',
  '        gap:.45rem;',
  '      }',
  '      /* Auto margin bottom-aligns a short conversation but collapses to zero',
  '         once messages overflow, so older messages remain fully scrollable. */',
  '      .rfa-ai.is-open .rfa-ai__messages-list > .rfa-ai__msg:first-child {',
  '        margin-top:auto;',
  '      }'
].join('\n');

if (source.includes(oldMobileStack)) {
  source = source.replace(oldMobileStack, newMobileStack);
  changed = true;
} else if (!source.includes('touch-action:pan-y;')) {
  throw new Error('Could not find the mobile bottom-aligned message stack to make scroll-safe.');
}

if (!source.includes(MARKER)) throw new Error('Subject-first routing marker was not applied.');
if (source.includes("'assessment', 'offer', 'onboarding'")) throw new Error('Ambiguous admission offer token is still present.');
if (!source.includes('touch-action:pan-y;')) throw new Error('Mobile touch scrolling was not applied.');
if (!source.includes('margin-top:auto;')) throw new Error('Safe short-chat bottom alignment was not applied.');

if (changed) fs.writeFileSync(AI_PATH, source, 'utf8');
console.log(changed
  ? 'Fixed RFA Guide subject routing and mobile conversation scrolling.'
  : 'RFA Guide subject routing and mobile scrolling are already current.');
