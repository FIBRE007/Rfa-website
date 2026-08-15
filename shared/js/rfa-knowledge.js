/**
 * RFA Knowledge Base — the single source of truth for the RFA AI widget.
 *
 * Every value here is drawn from the current RFA website and currently
 * published RFA materials reviewed for the site specification (see
 * README.md §Source Register). The AI widget (rfa-ai.js) is only ever
 * allowed to surface strings from this object — it does not call any
 * external model and cannot invent facts. When RFA has not published a
 * fact, the field is intentionally omitted rather than guessed.
 */
window.RFA_KNOWLEDGE = {
  identity: {
    name: 'Royal Family Academy',
    motto: 'Raising Distinguished Leaders',
    vision:
      'To raise dynamic, distinguished and innovative Christian leaders to impact society thereby fulfilling 2 Timothy 3:17.',
    mission:
      "To take each child through an educational programme using a systematic application of the word of God and an integrated educational curriculum to impact society.",
    coreValue: 'Leadership, anchored on Discipline, Excellence, Hard work, Integrity and Innovation.',
    values: ['Excellence', 'Hard Work', 'Integrity', 'Innovation', 'Discipline'],
  },

  acsi: {
    status: 'ACSI Accredited School',
    note: "Royal Family Academy's current ACSI approval is authoritative and current.",
  },

  schools: [
    {
      name: 'Nursery & Primary School',
      range: 'Crèche through Grade 6',
      url: 'https://nurseryandprimaryschool.royalfamilyacademy.org/',
    },
    {
      name: 'High School',
      range: 'Junior High 1 through Senior High 3',
      url: 'https://highschool.royalfamilyacademy.org/',
    },
    {
      name: 'Sixth Form College',
      range: 'Age 17+',
      url: 'https://sixthform.royalfamilyacademy.org/',
    },
  ],

  contact: {
    generalPhone: '+234 818 253 5981 / +234 818 711 1069',
    generalEmail: 'info@royalfamilyacademy.org',
    address: 'Plot 648 Idris Gidado St, Wuye, Abuja',
    highSchoolAdmissionsPhone: '+234 811 605 5399',
  },

  admissionsSteps: {
    nurseryAndPrimary: [
      'Age check against the Nursery/Primary age table',
      'Age appropriateness / academic assessment',
      'Offer',
      'Registration and onboarding with the Nursery or Primary office',
    ],
    highSchool: [
      'Verify age against the Junior/Senior High age table',
      'Age appropriateness / academic assessment',
      'Offer',
      'Registration and onboarding with the High School office',
    ],
  },

  ages: {
    earlyYears: [
      { stage: 'Crèche', minAge: '3 months' },
      { stage: 'Playgroup', minAge: '1.4 years' },
      { stage: 'Pre-School', minAge: '2.4 years' },
      { stage: 'Pre-Kindergarten', minAge: '3.4 years' },
      { stage: 'Kindergarten', minAge: '4.4 years' },
    ],
    primary: [
      { stage: 'Grade 1', minAge: '5.4 years' },
      { stage: 'Grade 2', minAge: '6.4 years' },
      { stage: 'Grade 3', minAge: '7.4 years' },
      { stage: 'Grade 4', minAge: '8.4 years' },
      { stage: 'Grade 5', minAge: '9.4 years' },
      { stage: 'Grade 6', minAge: '10.4 years' },
    ],
    highSchool: [
      { stage: 'Junior High 1', minAge: '11 years' },
      { stage: 'Junior High 2', minAge: '12 years' },
      { stage: 'Junior High 3', minAge: '13 years' },
      { stage: 'Senior High 1', minAge: '14 years' },
      { stage: 'Senior High 2', minAge: '15 years' },
      { stage: 'Senior High 3', minAge: '16 years' },
    ],
  },

  schoolDay: {
    nursery: '8:00am–1:00pm',
    primary: '8:00am–2:00pm',
    fridayClose: '2:00pm (school-wide)',
    staffTrainingFridayClose: '12:00pm',
    arrival: '7:30am (school begins 8:00am)',
  },

  leadership: [
    { name: 'Dr Ogunbiyi Rifkatu', role: 'Consultant' },
    { name: 'Ms Ayeni Olubunmi', role: 'Director' },
    { name: 'Ms Nwaiwu Bertha', role: 'Executive Admin. Officer' },
    { name: 'Mr Onuoha Lofty', role: 'Principal' },
    { name: 'Mrs Nkiru Austin Ibemesim', role: 'Vice Principal' },
    { name: 'Mrs Enesi Grace', role: 'Head Teacher' },
    { name: 'Ms Ojeifo Queen', role: 'Deputy Head Teacher' },
    { name: 'Mrs Adebola Oluboyo', role: 'Head of Sixth Form' },
  ],

  sixthForm: {
    entryAge: '17+',
    positioning:
      'Advanced academic programmes and tailored support preparing students for university and leadership.',
  },
};
