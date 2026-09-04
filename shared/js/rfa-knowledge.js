/**
 * RFA Knowledge Base — single source of truth for RFA Guide.
 *
 * Current 2026 website information takes precedence. Historical WordPress
 * content is used only where it adds confirmed school information without
 * contradicting newer RFA content.
 */
window.RFA_KNOWLEDGE = {
  identity: {
    name: 'Royal Family Academy',
    motto: 'Raising Distinguished Leaders',
    vision: 'To raise dynamic, distinguished and innovative Christian leaders to impact society thereby fulfilling 2 Timothy 3:17.',
    mission: 'To take each child through an educational programme using a systematic application of the word of God and an integrated educational curriculum to impact society.',
    coreValue: 'Leadership, anchored on Discipline, Excellence, Hard Work, Integrity and Innovation.',
    values: ['Discipline', 'Excellence', 'Hard Work', 'Integrity', 'Innovation']
  },

  history: {
    organisation: 'Royal Family Academy Abuja is a subsidiary of Family Ministries International (FMI) and was born from the vision of the late Pastor Ina Omakwu.',
    nurseryCommissioned: 'The Nursery section was commissioned on Friday, 27 September 2002 by Pastors Ina and Sarah Omakwu.',
    academicStart: 'Academic activities commenced on Monday, 30 September 2002 with 29 pupils and 17 staff members.',
    primaryStart: 'The Primary section commenced in 2003 as the school expanded.',
    highSchoolStart: 'The High School was inaugurated on 24 September 2007 at Wuye, Abuja.',
    sixthFormStart: 'RFA Sixth Form College was inaugurated on Wednesday, 20 March 2024.'
  },

  acsi: {
    status: 'ACSI Accredited School',
    note: "Royal Family Academy's current ACSI approval is authoritative and current."
  },

  schools: [
    { key: 'nurseryandprimaryschool', name: 'Nursery & Primary School', range: 'Crèche through Grade 6', url: 'https://nurseryandprimaryschool.royalfamilyacademy.org/' },
    { key: 'highschool', name: 'High School', range: 'Junior High 1 through Senior High 3', url: 'https://highschool.royalfamilyacademy.org/' },
    { key: 'sixthform', name: 'Sixth Form College', range: 'Age 17+', url: 'https://sixthform.royalfamilyacademy.org/' }
  ],

  contact: {
    generalPhone: '+234 818 253 5981 / +234 818 711 1069',
    generalEmail: 'info@royalfamilyacademy.org',
    address: 'Plot 648 Idris Gidado St, Wuye, Abuja',
    highSchoolAdmissionsPhone: '+234 811 605 5399',
    sixthFormPhones: ['+234 816 338 3329', '+234 803 632 2129', '+234 809 575 2626'],
    sixthFormEmail: 'rfa6thform@royalfamilyacademy.org',
    sixthFormAddress: 'RFA Sixth Form College, Plot 648, Idris Gidado Street, Wuye, Abuja, Nigeria',
    whatsappNumber: '+234 818 253 5981',
    whatsappDigits: '2348182535981'
  },

  pages: {
    nurseryandprimaryschool: {
      home: 'https://nurseryandprimaryschool.royalfamilyacademy.org/',
      about: 'https://nurseryandprimaryschool.royalfamilyacademy.org/about.html',
      earlyYears: 'https://nurseryandprimaryschool.royalfamilyacademy.org/early-years.html',
      primary: 'https://nurseryandprimaryschool.royalfamilyacademy.org/primary.html',
      learning: 'https://nurseryandprimaryschool.royalfamilyacademy.org/learning.html',
      studentLife: 'https://nurseryandprimaryschool.royalfamilyacademy.org/student-life.html',
      campus: 'https://nurseryandprimaryschool.royalfamilyacademy.org/campus.html',
      parents: 'https://nurseryandprimaryschool.royalfamilyacademy.org/parents.html',
      admissions: 'https://nurseryandprimaryschool.royalfamilyacademy.org/admissions.html',
      contact: 'https://nurseryandprimaryschool.royalfamilyacademy.org/contact.html'
    },
    highschool: {
      home: 'https://highschool.royalfamilyacademy.org/',
      about: 'https://highschool.royalfamilyacademy.org/about.html',
      academics: 'https://highschool.royalfamilyacademy.org/academics.html',
      leadership: 'https://highschool.royalfamilyacademy.org/leadership.html',
      studentLife: 'https://highschool.royalfamilyacademy.org/student-life.html',
      campus: 'https://highschool.royalfamilyacademy.org/campus.html',
      safety: 'https://highschool.royalfamilyacademy.org/safety.html',
      admissions: 'https://highschool.royalfamilyacademy.org/admissions.html',
      contact: 'https://highschool.royalfamilyacademy.org/contact.html'
    },
    sixthform: {
      home: 'https://sixthform.royalfamilyacademy.org/',
      about: 'https://sixthform.royalfamilyacademy.org/about.html',
      programmes: 'https://sixthform.royalfamilyacademy.org/programmes.html',
      university: 'https://sixthform.royalfamilyacademy.org/university.html',
      leadership: 'https://sixthform.royalfamilyacademy.org/leadership.html',
      studentLife: 'https://sixthform.royalfamilyacademy.org/student-life.html',
      admissions: 'https://sixthform.royalfamilyacademy.org/admissions.html',
      contact: 'https://sixthform.royalfamilyacademy.org/contact.html'
    }
  },

  admissionsSteps: {
    nurseryAndPrimary: ['Age check against the current age table', 'Age-appropriateness and academic assessment', 'Offer', 'Registration with the Nursery or Primary office', 'Onboarding into the RFA community'],
    highSchool: ['Verify age against the Junior/Senior High age table', 'Age-appropriateness and academic assessment', 'Offer', 'Registration with the High School office', 'Onboarding into the RFA community'],
    sixthForm: ['Choose the appropriate Sixth Form pathway', 'Speak with Sixth Form Admissions to confirm current entry requirements and programme availability', 'Follow the current application and onboarding guidance provided by the college']
  },

  admissionsNotes: {
    grade6: 'Admission into Grade 6 is generally not available to new entrants. Exceptions may be considered for pupils transferring from schools where Grade 5 is the terminal class, former RFA pupils in good standing, international students, and pupils whose health circumstances require special consideration.',
    nonDiscrimination: 'RFA admits students from diverse races, colours, nationalities and ethnic origins in accordance with its Non-Discrimination Policy.',
    sixthForm: 'Sixth Form serves students aged 17+. Admission is ongoing. Current programme-specific entry requirements should be confirmed directly with the Sixth Form admissions team.'
  },

  ages: {
    earlyYears: [
      { stage: 'Crèche', aliases: ['creche'], minAge: '3 months' },
      { stage: 'Playgroup', aliases: ['play group'], minAge: '1.4 years' },
      { stage: 'Pre-School', aliases: ['preschool', 'pre school'], minAge: '2.4 years' },
      { stage: 'Pre-Kindergarten', aliases: ['pre kindergarten', 'pre-k'], minAge: '3.4 years' },
      { stage: 'Kindergarten', aliases: ['kg'], minAge: '4.4 years' }
    ],
    primary: [
      { stage: 'Grade 1', aliases: ['grade one'], minAge: '5.4 years' },
      { stage: 'Grade 2', aliases: ['grade two'], minAge: '6.4 years' },
      { stage: 'Grade 3', aliases: ['grade three'], minAge: '7.4 years' },
      { stage: 'Grade 4', aliases: ['grade four'], minAge: '8.4 years' },
      { stage: 'Grade 5', aliases: ['grade five'], minAge: '9.4 years' },
      { stage: 'Grade 6', aliases: ['grade six'], minAge: '10.4 years' }
    ],
    highSchool: [
      { stage: 'Junior High 1', aliases: ['jh1', 'jh 1', 'jhs1', 'jhs 1', 'js1', 'js 1', 'jss1', 'jss 1', 'junior high one', 'junior secondary 1', 'junior secondary one'], minAge: '11 years' },
      { stage: 'Junior High 2', aliases: ['jh2', 'jh 2', 'jhs2', 'jhs 2', 'js2', 'js 2', 'jss2', 'jss 2', 'junior high two', 'junior secondary 2', 'junior secondary two'], minAge: '12 years' },
      { stage: 'Junior High 3', aliases: ['jh3', 'jh 3', 'jhs3', 'jhs 3', 'js3', 'js 3', 'jss3', 'jss 3', 'junior high three', 'junior secondary 3', 'junior secondary three'], minAge: '13 years' },
      { stage: 'Senior High 1', aliases: ['sh1', 'sh 1', 'shs1', 'shs 1', 'ss1', 'ss 1', 'sss1', 'sss 1', 'senior high one', 'senior secondary 1', 'senior secondary one'], minAge: '14 years' },
      { stage: 'Senior High 2', aliases: ['sh2', 'sh 2', 'shs2', 'shs 2', 'ss2', 'ss 2', 'sss2', 'sss 2', 'senior high two', 'senior secondary 2', 'senior secondary two'], minAge: '15 years' },
      { stage: 'Senior High 3', aliases: ['sh3', 'sh 3', 'shs3', 'shs 3', 'ss3', 'ss 3', 'sss3', 'sss 3', 'senior high three', 'senior secondary 3', 'senior secondary three'], minAge: '16 years' }
    ],
    sixthForm: [{ stage: 'Sixth Form College', aliases: ['sixth form'], minAge: '17+' }]
  },

  schoolDay: {
    nursery: '8:00am–1:00pm',
    primary: '8:00am–2:00pm',
    kindergartenClubs: 'Tuesdays; closing 2:30pm',
    primaryClubs: 'Wednesdays; closing 4:00pm',
    fridayClose: '2:00pm school-wide',
    staffTrainingFridayClose: '12:00pm',
    arrival: 'Arrival is expected by 7:30am; school begins at 8:00am.'
  },

  weeklyRhythm: {
    nursery: {
      Monday: 'Class Devotion; lessons; break; lessons; closing; enhancement.',
      Tuesday: 'Class Devotion; lessons; break; lessons; closing; Kindergarten clubs; enhancement.',
      Wednesday: 'Class Devotion; sports (8:30–9:00); lessons; break; lessons; closing; after-school care.',
      Thursday: 'Class Devotion; lessons; break; lessons; closing; enhancement.',
      Friday: 'Chapel (8:15–8:30); lessons; break; lessons; closing.'
    },
    primary: {
      Monday: 'Assembly (8:00–8:30); lessons; long break; lessons; short break; lessons; closing; club.',
      Tuesday: 'Mental Drill; Bible Studies; lessons/sports; long break; lessons; short break; lessons; closing; club.',
      Wednesday: 'Spelling Drill; Bible Studies; lessons/sports; long break; lessons; short break; lessons; closing; club.',
      Thursday: 'Current Affairs; Bible Studies; lessons/sports; long break; lessons; short break; lessons; closing; club.',
      Friday: 'Chapel; lessons/sports; long break; lessons; short break; lessons; closing.'
    }
  },

  primaryCurriculum: ['Literacy', 'Numeracy', 'Science', 'Bible Studies', 'Social Studies', 'Fine Arts', 'Music', 'Literature', 'ICT', 'History', 'Leadership', 'Yoruba', 'Hausa', 'Igbo', 'Mandarin', 'French', 'Spanish (Grade 1 & 2)', 'Home Economics', 'Entrepreneurial Studies'],

  learningSupport: {
    discoveryCentre: ['Speech & language development', 'Autism management & strategies', 'Individualized Education Program', 'Assessment & evaluation', 'Parental support & counselling', 'Occupational therapy', 'Daily living skills', 'Individualized learning', 'Resource room', 'One-on-one support', 'Learning aids'],
    discoveryNote: 'The Discovery Centre tailors programmes to each child’s unique combination of needs and is licensed under NILD Educational Therapy.',
    aas: 'Academic Assistance Sessions provide one-to-one instructional intervention to close learning gaps. Sessions run before or after school at no extra cost and encourage parent partnership.',
    eLibrary: 'The RFA e-Library provides digital books, magazines and video resources for access beyond the classroom. Scholastic Literacy Pro is one of the literacy resources used, with secure student logins for tailored materials.'
  },

  nurseryPrimaryStudentLife: {
    clubs: ['JETS (Science Club)', 'Girl Guides / Brownies', 'Jesus Explorers', 'Boy Scout Association of Nigeria', 'Computer', 'Young Farmers', 'Foreign / Nigerian Languages', 'Mathematics', 'Literary & Debating', 'Art', 'Drama', 'Music', 'Home Makers', 'Kidprenureship (Discovery)', 'Knowledge Empowerment', 'Red Cross'],
    christianFormation: ['Chapel every Friday across the school — compulsory', 'Primary chapel runs 8:00am–8:30am', 'Nursery pupils meet in year groups; Primary converges in the main auditorium', 'First Friday of resumption: whole-school prayer and fasting', 'Bible Studies appear in the Primary weekly timetable'],
    sports: ['Stadium with track and field facilities', 'Swimming pool', 'Table tennis', 'Badminton', 'Basketball'],
    saturdaySportsAcademy: ['Football', 'Basketball', 'Taekwondo'],
    houses: ['Red', 'Green', 'Yellow', 'Blue'],
    events: ['Nigeria Independence Day', 'Inter-House Sports Days', 'Festival of Art', 'Christian Variety Day (Easter)', 'Leadership Week', 'Subject Exhibitions & Fairs', 'Community Service & Mission Outreach', 'Christmas Carol', 'Board Room Conferences', 'Upper Primary Parliament', 'Lower Primary Day', 'Nursery Cultural Day', 'Pyjamas Day', 'Soirée Français', 'Science Week', 'Literacy Week', 'School Clubs', 'Graduation & Prize Giving (Kindergarten & Grade 6)'],
    excursions: 'Local and international trips support the academic and non-academic curriculum. Details are announced in advance and signed parental consent is required.'
  },

  nurseryPrimaryFacilities: ['Magnificent school auditorium', 'Air-conditioned classrooms with student cubicles', 'ICT laboratories', 'Science laboratories', 'Home Economics / Home Management laboratories', 'Arts studios', 'Discovery Centre', 'Montessori room', 'Cafeteria', 'Clinic', 'Swimming pool', 'Stadium with track and field facilities'],

  parentInformation: {
    partnership: 'Parents are involved through the Parenting Institute, Parent–Teacher Conferences, Breakfast Meetings and other school-home partnership avenues.',
    parentTeacherConferences: 'Formal Parent–Teacher Conferences are held shortly after term examinations and after midterm assessments to discuss academic, behavioural, spiritual, emotional and developmental progress.',
    breakfastMeetings: 'Breakfast Meetings bring parents and school leadership together for programme updates, feedback, relationship-building and collaboration.',
    policies: ['Admission Policy', 'Homework / Assignment Policy', 'Non-Discrimination Policy', 'Student conduct & discipline', 'Health & safety', 'Visitors-on-campus procedures', 'Complaint procedures'],
    busRoutes: ['Wuye', 'Utako', 'Jabi', 'Zone II', 'Savannah Estate', 'Garki II', 'Wuse II', 'Mabushi/Jabi Lake', 'Prince and Princess', 'Games Village', 'Kado Estate', 'Gwarinpa', 'Lokogoma', 'Sunny Vale', 'Apo', 'Sun-city', 'Life Camp', 'CITEC', 'Kuchingoro']
  },

  highSchoolAcademics: {
    juniorSubjects: ['Mathematics', 'English Studies', 'Basic Science', 'Basic Technology', 'Christian Religious Studies', 'Social Studies', 'Business Studies', 'Computer/ICT', 'Agricultural Science', 'Physical & Health Education', 'Cultural & Creative Arts', 'Music', 'French', 'Hausa', 'Yoruba', 'Igbo', 'Civic Education', 'Literature', 'Home Economics', 'History'],
    seniorSubjects: ['General Mathematics', 'English Language', 'Civic Education', 'Fishery', 'Dyeing & Bleaching', 'Brick Laying', 'Biology', 'Chemistry', 'Physics', 'Further Mathematics', 'Agriculture', 'Physical Education', 'Health Science', 'ICT', 'Technical Drawing', 'Yoruba', 'Hausa', 'Igbo', 'Literature-in-English', 'Geography', 'Government', 'Christian Religious Studies', 'Visual Arts', 'Music', 'French', 'Mandarin', 'Economics', 'Accounting', 'Commerce'],
    assessment: ['Homework', 'Standards for written work', 'Continuous assessment / mid-term examination', 'End-of-term examination', 'Pre-mock and mock examination', 'Progress reports', 'International examinations']
  },

  highSchoolStudentLife: {
    modelUN: 'Model United Nations gives students opportunities to debate current international issues and represent RFA at junior UN-member level.',
    dukeOfEdinburgh: 'The Duke of Edinburgh Award offers challenges, team play, intellectual curiosity, service and academic development. Students begin the Bronze cadre at age 14 before progressing to Silver.',
    spiritualFormation: ['Chapel every Friday across the school — compulsory', 'Students Mentoring Sessions every Wednesday — compulsory for all High School students', 'Whole-school fasting on the first Friday of resumption', 'Senior High 3 Retreat', 'Valedictory Service / Graduation Ceremonies', 'Discipleship Training Sessions'],
    clubs: ['International Relations Club', 'Model United Nations', 'Duke of Edinburgh Award', 'Literacy & Debating', 'Scouts', 'JETS', 'Music', 'Drama', 'Photography', 'Young Farmers', 'Homemakers', 'Languages', 'ICT'],
    sports: ['Stadium with track and field facilities', 'Swimming pool', 'Table tennis', 'Badminton', 'Basketball'],
    saturdaySportsAcademy: ['Football', 'Basketball', 'Taekwondo'],
    houses: ['Red', 'Green', 'Yellow', 'Blue'],
    events: ['Nigeria Independence Day', 'Inter-House Sports Days', 'Festival of Art', 'Christian Variety Day', 'Leadership Week', 'Subject exhibitions & fairs', 'Community service', 'Mission outreach', 'Christmas Carol', 'Board Room Conferences', 'Science Fair', 'Bible Week', 'Literacy Week', 'School clubs', 'Graduation / Prize Giving']
  },

  highSchoolSafety: {
    conduct: ['Caring and respectful conduct is expected of every student', 'Diligence in classwork, homework, projects and revision', 'Attendance at academic and co-curricular programmes', 'Assembly, Chapel and Class Devotion are compulsory'],
    attendance: ['Students are expected to be in school by 7:45am', 'Arrival after 7:55am activates the school’s late-coming procedures before returning to class'],
    wellbeing: ['Zero tolerance for bullying, rude/unruly behaviour or abuse of any form', 'Food and drinks are taken only in designated areas', 'Mobile phones and electronic gadgets are not permitted except with a teacher’s permission', 'Students participate in emergency and safety drills', 'Visitors must follow campus sign-in procedures'],
    parentPartnership: 'Parent–Teacher Conferences and Parent/Teacher Progressive Forum are documented parent-engagement mechanisms.',
    policies: ['Admission Policy', 'Homework / Assignment Policy', 'Non-Discrimination Policy', 'Student conduct & discipline', 'Health & safety', 'Internet / electronic-device rules', 'Visitors-on-campus procedures', 'Complaint procedures']
  },

  highSchoolFacilities: ['Air-conditioned classrooms with student cubicles', 'Science laboratories', 'ICT laboratories', 'Home Economics / Home Management laboratories', 'Arts studios', 'School auditorium', 'Cafeteria', 'School clinic', 'Swimming pool', 'Stadium with track and field facilities'],

  leadership: {
    nurseryandprimaryschool: [
      { name: 'Miss Bunmi Ayeni', role: 'Director' },
      { name: 'Dr. Mrs Rifkatu Ogunbiyi', role: 'Consultant' },
      { name: 'Mrs Grace Enesi', role: 'Head Teacher' },
      { name: 'Miss Queen Ojeifo', role: 'Deputy Head Teacher' },
      { name: 'Miss Betha Nwaiwu', role: 'Executive Admin Officer' },
      { name: 'Mr Ismaila James', role: 'School Chaplain' }
    ],
    highschool: [
      { name: 'Miss Bunmi Ayeni', role: 'Director' },
      { name: 'Dr Mrs Rifkatu Ogunbiyi', role: 'Consultant' },
      { name: 'Mr Lofty Ohio', role: 'Principal' },
      { name: 'Mrs Austin Ibrmezom', role: 'Vice Principal' },
      { name: 'Miss Betha Nwaiwu', role: 'Executive Admin Officer' },
      { name: 'Mr Ismaila James', role: 'School Chaplain' }
    ],
    sixthform: [{ name: 'Mrs Adebola Oluboyo', role: 'Head of Sixth Form' }]
  },

  highSchoolCharacter: {
    leadership: 'Leadership is RFA’s core value — a means through which God solves problems in society through godly principles. Students are developed to identify needs, rally resources, collaborate and communicate effectively.',
    innovation: 'Project-based learning stimulates imaginative, efficient, timely and sustainable problem-solving and develops alternative solutions to challenges.',
    discipline: 'RFA develops strength of character and godly conduct through biblical principles and spiritual-formation exercises.'
  },

  sixthForm: {
    entryAge: '17+',
    inaugurated: '20 March 2024',
    positioning: 'A focused pre-university environment combining advanced academic pathways, tailored support, character development and preparation for university and leadership.',
    programmes: ['International University Foundation', 'Cambridge A Level', 'Ontario Secondary School Diploma (OSSD)', 'SAT', 'IELTS', 'UTME (JAMB Tutorial)'],
    destinations: 'RFA Sixth Form prepares students for opportunities in Nigeria and internationally, including pathways toward universities in the UK, USA, Canada and beyond.',
    advantages: ['Qualified and experienced teachers', 'Preparation for local and international examinations', 'Academic excellence alongside character development', 'A secure learning environment within the RFA campus in Abuja'],
    admissions: 'Admission is ongoing. Programme-specific requirements and availability should be confirmed directly with Sixth Form Admissions.',
    phones: ['+234 816 338 3329', '+234 803 632 2129', '+234 809 575 2626'],
    email: 'rfa6thform@royalfamilyacademy.org',
    address: 'Plot 648, Idris Gidado Street, Wuye, Abuja, Nigeria'
  }
};