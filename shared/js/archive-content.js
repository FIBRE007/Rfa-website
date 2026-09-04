/**
 * Restores useful institutional content from the former RFA website without
 * turning the current site into a wall of text. Long-form material is kept
 * behind accessible native <details> controls and school leadership stays
 * near the top of each About page.
 */
(function () {
  'use strict';

  const site = document.body && document.body.dataset ? document.body.dataset.site : '';
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const main = document.querySelector('main');
  if (!main) return;

  function installStyles() {
    if (document.getElementById('rfa-archive-content-styles')) return;
    const style = document.createElement('style');
    style.id = 'rfa-archive-content-styles';
    style.textContent = `
      .archive-section{padding:clamp(3.5rem,7vw,7rem) 0;background:var(--rfa-warm-white,#fffdf8)}
      .archive-section--soft{background:#f6f1e8}
      .archive-section--dark{background:#20172a;color:#fff}
      .archive-section .archive-head{max-width:760px;margin-bottom:clamp(1.5rem,4vw,3rem)}
      .archive-section .archive-kicker{margin:0 0 .65rem;font:700 .76rem/1.2 Inter,sans-serif;letter-spacing:.17em;text-transform:uppercase;color:#9a7629}
      .archive-section--dark .archive-kicker{color:#d7b65d}
      .archive-section .archive-title{margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(2rem,5vw,4rem);line-height:.98;font-weight:600;color:#2d1742}
      .archive-section--dark .archive-title{color:#fff}
      .archive-section .archive-lede{margin:.9rem 0 0;max-width:68ch;font-size:clamp(1.05rem,1.45vw,1.22rem);line-height:1.75;color:#514959}
      .archive-section--dark .archive-lede{color:rgba(255,255,255,.82)}
      .archive-grid{display:grid;grid-template-columns:1fr;gap:1rem}
      .archive-grid--2{grid-template-columns:1fr}
      .archive-card{border:1px solid rgba(67,22,119,.12);border-radius:1rem;background:#fff;padding:clamp(1.25rem,3vw,2rem);box-shadow:0 12px 34px rgba(34,22,40,.05)}
      .archive-card h3{margin:.15rem 0 .65rem;font-family:'Cormorant Garamond',Georgia,serif;font-size:clamp(1.45rem,2.5vw,2rem);line-height:1.05;color:#2d1742}
      .archive-card p,.archive-card li{font-family:Inter,sans-serif;font-size:.98rem;line-height:1.75;color:#514959}
      .archive-card ul{margin:.8rem 0 0;padding-left:1.2rem}
      .archive-card--accent{background:linear-gradient(135deg,rgba(67,22,119,.055),rgba(198,162,78,.09));border-color:rgba(198,162,78,.32)}
      .archive-details{border-top:1px solid rgba(67,22,119,.14);padding:.85rem 0}
      .archive-details:last-child{border-bottom:1px solid rgba(67,22,119,.14)}
      .archive-details summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:1rem;font-family:Inter,sans-serif;font-weight:700;color:#2d1742;padding:.5rem 0}
      .archive-details summary::-webkit-details-marker{display:none}
      .archive-details summary::after{content:'+';font-size:1.4rem;font-weight:400;color:#9a7629;transition:transform .25s ease}
      .archive-details[open] summary::after{transform:rotate(45deg)}
      .archive-details__body{padding:.4rem 0 .65rem;max-width:76ch}
      .archive-details__body p,.archive-details__body li{font-family:Inter,sans-serif;color:#514959;line-height:1.75}
      .archive-details__body ul{padding-left:1.2rem}
      .archive-outcomes{display:grid;grid-template-columns:1fr;gap:1rem}
      .archive-outcome{border-radius:1rem;border:1px solid rgba(67,22,119,.14);background:#fff;overflow:hidden}
      .archive-outcome summary{cursor:pointer;list-style:none;padding:1.25rem 1.35rem;font-family:'Cormorant Garamond',Georgia,serif;font-size:1.55rem;font-weight:600;color:#2d1742;display:flex;justify-content:space-between;align-items:center;gap:1rem}
      .archive-outcome summary::-webkit-details-marker{display:none}
      .archive-outcome summary::after{content:'View +';font:700 .7rem/1 Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#9a7629}
      .archive-outcome[open] summary::after{content:'Close −'}
      .archive-outcome div{padding:0 1.35rem 1.35rem}
      .archive-outcome li{font-family:Inter,sans-serif;line-height:1.7;color:#514959;margin:.35rem 0}
      .archive-timeline{display:grid;grid-template-columns:1fr;gap:.65rem;margin-top:1.5rem}
      .archive-timeline__item{display:grid;grid-template-columns:92px 1fr;gap:1rem;padding:.9rem 0;border-top:1px solid rgba(255,255,255,.15)}
      .archive-timeline__year{font:700 .8rem/1.4 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#d7b65d}
      .archive-timeline__text{font:400 1rem/1.7 Inter,sans-serif;color:rgba(255,255,255,.84)}
      .archive-note{margin-top:1rem;padding:1rem 1.1rem;border-left:3px solid #c6a24e;background:rgba(198,162,78,.08);font:500 .9rem/1.65 Inter,sans-serif;color:#514959}
      .archive-section--dark .archive-note{color:rgba(255,255,255,.82);background:rgba(255,255,255,.06)}
      .archive-policy-grid{display:grid;grid-template-columns:1fr;gap:1rem}
      .archive-chip-row{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1rem}
      .archive-chip{display:inline-flex;padding:.55rem .8rem;border-radius:999px;background:rgba(67,22,119,.06);border:1px solid rgba(67,22,119,.1);font:600 .8rem/1 Inter,sans-serif;color:#432077}
      .ethos-card--wide .archive-inline-details{margin-top:.7rem}
      .ethos-card--wide .archive-inline-details summary{cursor:pointer;display:inline-flex;align-items:center;gap:.45rem;font:700 .78rem/1.2 Inter,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#8b6b24;list-style:none}
      .ethos-card--wide .archive-inline-details summary::-webkit-details-marker{display:none}
      .ethos-card--wide .archive-inline-details summary::after{content:'+';font-size:1rem}
      .ethos-card--wide .archive-inline-details[open] summary::after{content:'−'}
      .ethos-card--wide .archive-inline-details__body{margin-top:1rem}
      @media(min-width:760px){
        .archive-grid--2{grid-template-columns:repeat(2,minmax(0,1fr))}
        .archive-outcomes{grid-template-columns:repeat(2,minmax(0,1fr))}
        .archive-policy-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      }
    `;
    document.head.appendChild(style);
  }

  function htmlSection(id, className, body) {
    const section = document.createElement('section');
    section.id = id;
    section.className = 'archive-section ' + (className || '');
    section.dataset.archiveImported = 'true';
    section.innerHTML = '<div class="container">' + body + '</div>';
    return section;
  }

  function insertBeforeCta(section) {
    const cta = main.querySelector('.cta-banner:last-of-type') || main.querySelector('.cta-banner');
    if (cta) cta.before(section); else main.appendChild(section);
  }

  function enhanceExistingEthos() {
    document.querySelectorAll('.ethos-card--wide').forEach(function (card) {
      if (card.dataset.archiveCollapsed === 'true') return;
      const eyebrow = card.querySelector('.eyebrow');
      const label = eyebrow ? eyebrow.textContent.trim() : '';
      if (!/Statement of Faith|School Anthem|School Confession/i.test(label)) return;
      const heading = card.querySelector('h3');
      if (!heading) return;
      const nodes = [];
      let node = heading.nextSibling;
      while (node) {
        const next = node.nextSibling;
        nodes.push(node);
        node = next;
      }
      const details = document.createElement('details');
      details.className = 'archive-inline-details';
      const summary = document.createElement('summary');
      summary.textContent = label === 'Statement of Faith' ? 'View full statement' : label === 'School Anthem' ? 'View school anthem' : 'View school confession';
      const body = document.createElement('div');
      body.className = 'archive-inline-details__body';
      nodes.forEach(function (n) { body.appendChild(n); });
      details.appendChild(summary);
      details.appendChild(body);
      card.appendChild(details);
      card.dataset.archiveCollapsed = 'true';
    });
  }

  function buildDirectorWelcome() {
    return htmlSection('director-welcome', '', `
      <div class="archive-head" data-reveal="up">
        <p class="archive-kicker">Welcome from the Director</p>
        <h2 class="archive-title">A Christ-centred education that reaches beyond academics.</h2>
        <p class="archive-lede">Royal Family Academy is committed to a nurturing, individualised and holistic learning experience in which academic growth, spiritual formation, character, creativity, leadership and service belong together.</p>
      </div>
      <div class="archive-card archive-card--accent" data-reveal="up">
        <p>At RFA, learners are given opportunities to grow through rigorous academics, worship and discipleship, sports, the arts, STEM, mentoring and community service. The goal is not simply examination success, but the formation of young people who lead with compassion, integrity and resilience.</p>
        <details class="archive-details">
          <summary>Continue reading the Director's message</summary>
          <div class="archive-details__body">
            <p>Our educational programme brings together national and international standards, sound pedagogy and a biblical worldview. We are intentional about helping every learner discover gifts, develop confidence, think critically and use knowledge responsibly.</p>
            <p>Leadership remains central to the RFA experience and is anchored on Excellence, Hard Work, Integrity, Innovation and Discipline. Through classroom learning and the wider life of the school, students are prepared to serve, solve problems and make a meaningful contribution wherever God places them.</p>
            <p>We value partnership with families and invite prospective parents, current families, alumni and friends of the Academy to engage with the school community and visit the campus.</p>
            <p><strong>Miss Bunmi Ayeni</strong><br>Director, Royal Family Academy</p>
          </div>
        </details>
      </div>`);
  }

  function buildPhilosophy() {
    return htmlSection('philosophy-of-education', 'archive-section--soft', `
      <div class="archive-head" data-reveal="up">
        <p class="archive-kicker">Philosophy of Education</p>
        <h2 class="archive-title">Education of spirit, mind and body.</h2>
        <p class="archive-lede">RFA understands every learner as a gift entrusted by God. Education therefore develops the whole person through strong academics, biblical truth, character formation and responsible participation in society.</p>
      </div>
      <div class="archive-grid archive-grid--2" data-reveal-group>
        <article class="archive-card"><h3>Christian foundation</h3><p>The school approaches teaching and learning from a Christian worldview, affirming the Bible as inspired, authoritative and foundational to faith and life, and affirming the Christian confession of God as Father, Son and Holy Spirit and the Lordship of Jesus Christ.</p></article>
        <article class="archive-card"><h3>Whole-person formation</h3><p>Academic knowledge is not treated in isolation. RFA seeks the growth of the learner's spirit, intellect, physical wellbeing, relationships, character and capacity to serve.</p></article>
        <article class="archive-card"><h3>Stewardship of every learner</h3><p>Pupils and students are regarded as God's special gifts to humanity. The school accepts a responsibility to know, nurture, challenge and support them as they grow into responsible adults and instruments of reconciliation, healing and positive influence.</p></article>
        <article class="archive-card"><h3>Learning for life</h3><p>The curriculum combines knowledge, skills, creativity, communication, critical thinking and collaboration with biblical values so that learners are prepared for further education, meaningful work, leadership and service in a changing world.</p></article>
      </div>`);
  }

  function buildOutcomes() {
    return htmlSection('student-outcomes', '', `
      <div class="archive-head" data-reveal="up">
        <p class="archive-kicker">Expected Student Outcomes</p>
        <h2 class="archive-title">What an RFA education is working toward.</h2>
        <p class="archive-lede">The former RFA framework describes outcomes across four connected areas. Open any area to see the complete set of expectations.</p>
      </div>
      <div class="archive-outcomes" data-reveal-group>
        <details class="archive-outcome"><summary>Intellectual Development</summary><div><ul>
          <li>Develop strong knowledge across the sciences, arts and humanities.</li><li>Use information technology and languages effectively.</li><li>Communicate clearly in speaking and writing.</li><li>Think critically, collaborate and create.</li><li>Understand and apply biblical knowledge.</li><li>Identify and solve problems responsibly.</li><li>Be prepared for tertiary education and lifelong learning.</li>
        </ul></div></details>
        <details class="archive-outcome"><summary>Spiritual Development</summary><div><ul>
          <li>Grow in a personal relationship with God.</li><li>Understand and explain the Christian faith and respond thoughtfully to questions about it.</li><li>Develop convictions and standards grounded in Scripture.</li><li>Recognise the work and ministry of the Holy Spirit.</li><li>Practise prayer, fasting, personal devotion, evangelism and Christian fellowship.</li>
        </ul></div></details>
        <details class="archive-outcome"><summary>Physical Development</summary><div><ul>
          <li>Practise personal hygiene and good grooming.</li><li>Understand the importance of rest, exercise, nutrition and wholesome leisure.</li><li>Respect and care for the body.</li><li>Develop habits that support healthy, responsible living.</li>
        </ul></div></details>
        <details class="archive-outcome"><summary>Social Development</summary><div><ul>
          <li>Grow in leadership, stewardship, service and responsibility.</li><li>Develop emotional intelligence and healthy relationships.</li><li>Show respect, empathy and cultural sensitivity.</li><li>Participate constructively in family, school, community and society.</li>
        </ul></div></details>
      </div>`);
  }

  function buildChaplaincy() {
    return htmlSection('chaplaincy', 'archive-section--soft', `
      <div class="archive-head" data-reveal="up"><p class="archive-kicker">Chaplaincy & Spiritual Formation</p><h2 class="archive-title">Faith is formed through the life of the school.</h2><p class="archive-lede">The Chaplaincy works with school leadership to support worship, discipleship, prayer, mentoring, outreach and the spiritual wellbeing of the RFA community.</p></div>
      <div class="archive-grid archive-grid--2" data-reveal-group>
        <article class="archive-card"><h3>Worship & Devotion</h3><p>Chapel, personal devotion, Bible study, prayer and whole-school spiritual exercises are part of the rhythm of school life.</p></article>
        <article class="archive-card"><h3>Discipleship & Mentoring</h3><p>The Chaplaincy supports discipleship training, leadership formation and mentoring. In High School, teacher-led mentorship groups form part of this structure.</p></article>
        <article class="archive-card"><h3>Prayer & Family Partnership</h3><p>Prayer meetings and the Parenting Institute provide avenues for families and the school community to grow together in faith and responsibility.</p></article>
        <article class="archive-card"><h3>Mission & Outreach</h3><p>Students and staff are encouraged to express faith through service, missionary activity, compassion initiatives and practical engagement with community needs.</p></article>
      </div>`);
  }

  function buildFaq(currentSite) {
    const isHigh = currentSite === 'highschool';
    const establishment = isHigh ? 'The High School was inaugurated on 24 September 2007. Royal Family Academy itself began with the Nursery section in September 2002.' : 'The Nursery section was commissioned on 27 September 2002, academic activities began on 30 September 2002, and the Primary section followed in 2003.';
    const ratio = isHigh ? 'The published school guide lists a High School planning ratio of approximately 15 learners to 1 teacher.' : 'The published school guide lists planning ratios of approximately 10:1 in Nursery and 12:1 in Primary.';
    return htmlSection('about-faq', '', `
      <div class="archive-head" data-reveal="up"><p class="archive-kicker">Frequently Asked Questions</p><h2 class="archive-title">Useful things families ask about RFA.</h2></div>
      <div class="archive-card" data-reveal="up">
        <details class="archive-details"><summary>When was the school established?</summary><div class="archive-details__body"><p>${establishment}</p></div></details>
        <details class="archive-details"><summary>What kind of school is RFA?</summary><div class="archive-details__body"><p>RFA is a Christian school and a subsidiary of Family Ministries International, with historic association to Family Worship Centre. Its educational programme intentionally integrates biblical worldview, discipleship, worship, service and character formation with academic learning.</p></div></details>
        <details class="archive-details"><summary>Does RFA admit families of other faiths?</summary><div class="archive-details__body"><p>Yes. The former school FAQ states that learners from other faith backgrounds may be admitted while the school's Christian identity and programme remain clearly expressed.</p></div></details>
        <details class="archive-details"><summary>What curriculum does RFA use?</summary><div class="archive-details__body"><p>The school describes an integrated curriculum drawing from Nigerian and international approaches, including British and American elements, with biblical integration and global best-practice pedagogy.</p></div></details>
        <details class="archive-details"><summary>What facilities support learning?</summary><div class="archive-details__body"><p>Published facilities include air-conditioned classrooms, specialist laboratories, creative-arts spaces, the Discovery Centre for additional learning needs, a Montessori room, clinic, swimming pool, auditorium, cafeteria, library/e-Library and a stadium with track and field facilities.</p></div></details>
        <details class="archive-details"><summary>Which languages are taught?</summary><div class="archive-details__body"><p>RFA's published programme includes Nigerian languages such as Yoruba, Hausa and Igbo, together with international-language opportunities including French, Spanish and Mandarin at different school levels.</p></div></details>
        <details class="archive-details"><summary>How are learners supported when they need extra help?</summary><div class="archive-details__body"><p>Support includes the Discovery Centre/SEND provision, NILD Educational Therapy, individualised programmes, Academic Assistance Sessions and targeted enhancement. Families work with the school to identify the support appropriate for each learner.</p></div></details>
        <details class="archive-details"><summary>How are parents involved?</summary><div class="archive-details__body"><p>Parent partnership includes Parent–Teacher Conferences, the Parent/Teacher Progressive Forum, Breakfast Meetings, the Parenting Institute and other school-home engagement opportunities.</p></div></details>
        <details class="archive-details"><summary>What learner-to-teacher ratios has RFA published?</summary><div class="archive-details__body"><p>${ratio} Actual class composition can vary, so families may confirm the current class arrangement with the relevant school office.</p></div></details>
        <details class="archive-details"><summary>Does RFA welcome national and international students?</summary><div class="archive-details__body"><p>Yes. RFA's former FAQ states that the Academy serves both Nigerian and international students.</p></div></details>
      </div>`);
  }

  function addTimelineToStory(story) {
    if (!story || story.querySelector('.archive-timeline')) return;
    const container = story.querySelector('.container');
    if (!container) return;
    const timeline = document.createElement('div');
    timeline.className = 'archive-timeline';
    timeline.dataset.reveal = 'up';
    timeline.innerHTML = `
      <div class="archive-timeline__item"><div class="archive-timeline__year">27 Sep 2002</div><div class="archive-timeline__text">RFA Nursery was commissioned by Pastors Ina and Sarah Omakwu.</div></div>
      <div class="archive-timeline__item"><div class="archive-timeline__year">30 Sep 2002</div><div class="archive-timeline__text">Academic activities began with 29 pupils and 17 members of staff.</div></div>
      <div class="archive-timeline__item"><div class="archive-timeline__year">2003</div><div class="archive-timeline__text">The Primary section commenced as the school expanded.</div></div>
      <div class="archive-timeline__item"><div class="archive-timeline__year">24 Sep 2007</div><div class="archive-timeline__text">Royal Family Academy High School was inaugurated at Wuye, Abuja.</div></div>
      <div class="archive-timeline__item"><div class="archive-timeline__year">20 Mar 2024</div><div class="archive-timeline__text">Royal Family Academy Sixth Form College was inaugurated.</div></div>`;
    container.appendChild(timeline);
  }

  function importAboutPage() {
    if (page !== 'about.html' || (site !== 'highschool' && site !== 'nurseryandprimaryschool')) return;
    if (main.dataset.archiveAboutReady === 'true') return;
    main.dataset.archiveAboutReady = 'true';

    const subhero = main.querySelector(':scope > .subhero');
    const allSections = Array.prototype.slice.call(main.querySelectorAll(':scope > section'));
    const intro = allSections.find(function (s) { return s !== subhero && s.classList.contains('section') && !s.querySelector('#leadership-heading') && !s.querySelector('#ethos-heading'); });
    const leadership = document.getElementById('leadership-heading') ? document.getElementById('leadership-heading').closest('section') : null;
    const ethos = document.getElementById('ethos-heading') ? document.getElementById('ethos-heading').closest('section') : null;
    const story = allSections.find(function (s) { return /Our Story|Our Beginning/i.test(s.textContent || ''); });

    if (intro) {
      const box = intro.querySelector('.container');
      if (box) {
        box.innerHTML = '<p class="lede lede--dropcap" style="max-width:64ch;" data-reveal="up">Royal Family Academy combines academic excellence, intentional Christian education, caring educators and enriching experiences to nurture faith, character, confidence, creativity, wisdom and responsibility.</p>';
      }
    }

    if (intro && leadership) intro.after(leadership);
    else if (subhero && leadership) subhero.after(leadership);

    const director = buildDirectorWelcome();
    if (leadership) leadership.after(director); else if (intro) intro.after(director);

    if (story) director.after(story);
    if (story && ethos) story.after(ethos); else if (ethos) director.after(ethos);
    enhanceExistingEthos();

    const philosophy = buildPhilosophy();
    const outcomes = buildOutcomes();
    const chaplaincy = buildChaplaincy();
    const faq = buildFaq(site);
    if (ethos) {
      ethos.after(philosophy);
      philosophy.after(outcomes);
      outcomes.after(chaplaincy);
      chaplaincy.after(faq);
    } else {
      const anchor = story || director;
      anchor.after(philosophy);
      philosophy.after(outcomes);
      outcomes.after(chaplaincy);
      chaplaincy.after(faq);
    }
    addTimelineToStory(story);
  }

  function dailyLifeSection(kind) {
    const high = kind === 'highschool';
    const schedule = high ? `
      <details class="archive-details"><summary>High School weekly rhythm</summary><div class="archive-details__body"><ul><li>Monday Assembly: 7:45–8:30 a.m.</li><li>Tuesday to Friday Class Devotion: 7:45–8:15 a.m.</li><li>Wednesday Mentorship: 2:30–3:20 p.m., followed by Clubs from 3:20–4:00 p.m.</li><li>Thursday includes organised sport.</li><li>Friday includes Chapel and the closing rhythm of the school week.</li></ul></div></details>` : `
      <details class="archive-details"><summary>Nursery and Primary school-day reference</summary><div class="archive-details__body"><p><strong>Nursery:</strong> Monday–Thursday devotion begins at 8:00 a.m.; Friday Chapel is scheduled in the morning. Core lessons run through the morning with a break, and Nursery closes at 1:00 p.m. Kindergarten clubs, enhancement, sport and after-school care appear on designated days.</p><p><strong>Primary:</strong> Monday begins with Assembly. Tuesday includes Mental Drill and Bible Studies, Wednesday includes Spelling Drill, Thursday includes Current Affairs and Friday includes Chapel. The Primary school day closes at 2:00 p.m., with clubs on designated afternoons.</p></div></details>`;
    return htmlSection('daily-life-details', 'archive-section--soft', `
      <div class="archive-head"><p class="archive-kicker">Everyday School Life</p><h2 class="archive-title">Clear routines for learners and families.</h2><p class="archive-lede">The former site carried practical information on uniform, visitors, the school day and policies. It is preserved here in a compact form.</p></div>
      <div class="archive-policy-grid">
        <article class="archive-card"><h3>Uniform & Appearance</h3><p>Students wear the official RFA uniform supplied through the school. Uniform should be worn neatly and as prescribed, without unauthorised alterations. Grooming, hair and accessories are expected to reflect the school's standards of neatness, modesty and safety.</p></article>
        <article class="archive-card"><h3>Visitors to Campus</h3><p>Visitors are expected to sign in through the appropriate school office or secretary and follow campus procedures. Classroom access during lessons is restricted except for authorised school business such as a scheduled parent–teacher conference.</p></article>
      </div>
      <div class="archive-card" style="margin-top:1rem;">
        ${schedule}
        <details class="archive-details"><summary>School year</summary><div class="archive-details__body"><p>RFA's published policy describes a 40-week academic year running from September to July, organised into three terms of approximately thirteen weeks.</p></div></details>
        <details class="archive-details"><summary>Homework & assignment policy</summary><div class="archive-details__body"><p>Homework is used to reinforce learning, develop independent study habits and give teachers and parents a clearer picture of progress. Learners are expected to complete assigned work carefully and on time; teachers provide appropriate guidance and feedback, while parents support a suitable routine and environment for study. Late or incomplete work is handled according to the school's academic and conduct procedures.</p></div></details>
        <details class="archive-details"><summary>Non-discrimination</summary><div class="archive-details__body"><p>RFA's published admission policy states that students are admitted without discrimination on the basis of race, colour, nationality or ethnic origin. Employment is also described as non-discriminatory within the school's Christian character and faith-based requirements for staff.</p></div></details>
      </div>`);
  }

  function importDailyLife() {
    if (site === 'nurseryandprimaryschool' && page === 'parents.html' && !document.getElementById('daily-life-details')) insertBeforeCta(dailyLifeSection('primary'));
    if (site === 'highschool' && page === 'safety.html' && !document.getElementById('daily-life-details')) insertBeforeCta(dailyLifeSection('highschool'));
  }

  function admissionsSection(kind) {
    const sixth = kind === 'sixthform';
    const schoolCopy = sixth ? `
      <details class="archive-details"><summary>Published Sixth Form entry profile</summary><div class="archive-details__body"><p>The former Sixth Form curriculum information lists WASSCE, NECO, IGCSE or an equivalent qualification as the normal starting point, with at least five relevant credits including English Language and Mathematics. It also describes an entrance assessment and student/parent interview as part of admission.</p><p>Programme requirements can change, so applicants should confirm the current requirement for their chosen pathway with the Sixth Form Admissions team.</p></div></details>` : `
      <details class="archive-details"><summary>Records, assessment and placement</summary><div class="archive-details__body"><p>Admission may involve review of previous school records, age and the last successfully completed class, an academic or placement assessment, an informal interview where appropriate, and confirmation that a place is available in the requested class.</p></div></details>
      <details class="archive-details"><summary>Conditional admission and class placement</summary><div class="archive-details__body"><p>Where appropriate, an offer may be conditional on identified academic or developmental needs being supported. Classes are formed to maintain balanced, heterogeneous learning groups; the former admission guidance states that requests for a particular teacher or class are not normally accommodated.</p></div></details>`;
    return htmlSection('admissions-detail-archive', '', `
      <div class="archive-head"><p class="archive-kicker">Detailed Admissions Information</p><h2 class="archive-title">What happens behind the simple application journey.</h2><p class="archive-lede">The visible admissions steps stay simple, while the fuller placement and eligibility information remains available for families who need it.</p></div>
      <div class="archive-card">
        ${schoolCopy}
        <details class="archive-details"><summary>Application route</summary><div class="archive-details__body"><p>Applications may be initiated through the school's admissions process and followed up with the relevant school office. Assessment or an interview may be requested before a final offer is made.</p></div></details>
      </div>`);
  }

  function importAdmissions() {
    if (page !== 'admissions.html' || document.getElementById('admissions-detail-archive')) return;
    if (site === 'nurseryandprimaryschool') insertBeforeCta(admissionsSection('primary'));
    if (site === 'highschool') insertBeforeCta(admissionsSection('highschool'));
    if (site === 'sixthform') insertBeforeCta(admissionsSection('sixthform'));
  }

  function nurseryEventsSection() {
    return htmlSection('nursery-primary-traditions', '', `
      <div class="archive-head"><p class="archive-kicker">Traditions & Events</p><h2 class="archive-title">A school year with many ways to participate.</h2><p class="archive-lede">Academic, cultural, spiritual, creative and sporting events give pupils opportunities to perform, serve, collaborate and celebrate learning.</p></div>
      <div class="archive-grid archive-grid--2">
        <article class="archive-card"><h3>Nursery & Primary Traditions</h3><div class="archive-chip-row"><span class="archive-chip">Upper Primary Parliament</span><span class="archive-chip">Lower Primary Day</span><span class="archive-chip">Nursery Cultural Day</span><span class="archive-chip">Pyjamas Day</span><span class="archive-chip">Soirée Français</span></div></article>
        <article class="archive-card"><h3>Academic & Creative Events</h3><div class="archive-chip-row"><span class="archive-chip">Science Week</span><span class="archive-chip">Literacy Week</span><span class="archive-chip">Subject Exhibitions</span><span class="archive-chip">Festival of Art</span><span class="archive-chip">Leadership Week</span></div></article>
        <article class="archive-card"><h3>Whole-School Celebrations</h3><div class="archive-chip-row"><span class="archive-chip">Independence Day</span><span class="archive-chip">Inter-House Sports</span><span class="archive-chip">Christian Variety Day</span><span class="archive-chip">Christmas Carol</span><span class="archive-chip">Graduation & Prize Giving</span></div></article>
        <article class="archive-card"><h3>Trips & Excursions</h3><p>Local and international trips may support the academic and non-academic curriculum. Families receive details in advance and signed parental consent is required for participation.</p></article>
      </div>`);
  }

  function communityServiceSection(includeAlumni) {
    const alumni = includeAlumni ? `
      <div class="archive-card" style="margin-top:1rem;"><h3>RFA Alumni Association</h3><p>The RFA Alumni Association was established on 27 July 2019 and the former site recorded more than 250 alumni, known as Royal Ambassadors.</p>
        <details class="archive-details"><summary>Published alumni leadership profiles</summary><div class="archive-details__body"><ul>
          <li><strong>Abimbola Adesola</strong> — Vice President; pioneer RFA 2013 set; Molecular Biology & Genetics graduate with postgraduate study in Medical Biotechnology.</li>
          <li><strong>Daniel Etomi</strong> — Electronic Engineering with Computer Systems graduate; experience across IT, podcasting and tutoring.</li>
          <li><strong>Taylor Onegiyeofori Esther</strong> — Secretary-General.</li>
          <li><strong>Toluwalashe Adetona-Ibrahim</strong> — Financial Secretary; Management Information Systems.</li>
          <li><strong>Emmanuel Okoro-Igwe</strong> — Assistant Secretary-General; Political Science/Psychology studies.</li>
          <li><strong>Amaraebi Rita Okutu</strong> — Treasurer; Accounting.</li>
        </ul></div></details>
      </div>` : '';
    return htmlSection('community-service-archive', 'archive-section--soft', `
      <div class="archive-head"><p class="archive-kicker">Community Service & Alumni</p><h2 class="archive-title">Leadership expressed through service.</h2><p class="archive-lede">RFA's former site records a long tradition of practical outreach to families and communities, alongside an organised alumni network.</p></div>
      <div class="archive-card"><h3>Community impact</h3><p>Service initiatives have included support for indigent pastors and families, orphanages, internally displaced persons, hospitals, autism centres, widows and other vulnerable groups. Projects have also included books and devotional materials, hygiene sensitisation, practical improvements and community-support activities.</p></div>
      ${alumni}`);
  }

  function importStudentLife() {
    if (page !== 'student-life.html') return;
    if (site === 'nurseryandprimaryschool' && !document.getElementById('nursery-primary-traditions')) {
      insertBeforeCta(nurseryEventsSection());
      insertBeforeCta(communityServiceSection(false));
    }
    if (site === 'highschool' && !document.getElementById('community-service-archive')) insertBeforeCta(communityServiceSection(true));
  }

  function sixthFormAboutSection() {
    return htmlSection('sixthform-connections', 'archive-section--soft', `
      <div class="archive-head"><p class="archive-kicker">Examinations & International Connections</p><h2 class="archive-title">Pathways designed for university progression.</h2><p class="archive-lede">RFA Sixth Form's published materials connect its pre-university offer with international examination and university-entry pathways.</p></div>
      <div class="archive-grid archive-grid--2">
        <article class="archive-card"><h3>Programme pathways</h3><p>International University Foundation, Cambridge A Level, Ontario Secondary School Diploma (OSSD), SAT, IELTS and UTME/JAMB preparation support different university-entry routes.</p></article>
        <article class="archive-card"><h3>Published examination relationships</h3><p>The former site identified Cambridge International and the British Council among its academic/examination relationships and described RFA as an attached centre for Cambridge IGCSE/CIE.</p><p class="archive-note">Families should confirm the current examination-centre arrangement and programme availability directly with the Sixth Form College.</p></article>
      </div>`);
  }

  function importSixthForm() {
    if (site === 'sixthform' && page === 'about.html' && !document.getElementById('sixthform-connections')) insertBeforeCta(sixthFormAboutSection());
  }

  installStyles();
  importAboutPage();
  importDailyLife();
  importAdmissions();
  importStudentLife();
  importSixthForm();
})();
