from pathlib import Path

path = Path('highschool/admissions.html')
text = path.read_text()

old_css = '''<link rel="stylesheet" href="https://assets.royalfamilyacademy.org/shared/css/tokens.css">
  <link rel="stylesheet" href="https://assets.royalfamilyacademy.org/shared/css/base.css">
  <link rel="stylesheet" href="https://assets.royalfamilyacademy.org/shared/css/layout.css">
  <link rel="stylesheet" href="https://assets.royalfamilyacademy.org/shared/css/components.css">
<link rel="stylesheet" href="https://assets.royalfamilyacademy.org/shared/css/highschool-header.css?v=20260904-two-row-1">
  <link rel="stylesheet" href="https://assets.royalfamilyacademy.org/shared/css/rfa-ai.css">'''
new_css = '''<link rel="stylesheet" href="https://assets.royalfamilyacademy.org/shared/css/tokens.css">
  <link rel="stylesheet" href="https://assets.royalfamilyacademy.org/shared/css/base.css">
  <link rel="stylesheet" href="https://assets.royalfamilyacademy.org/shared/css/components.css?v=mobile-nav-top-20260901">
<link rel="stylesheet" href="https://assets.royalfamilyacademy.org/shared/css/highschool-header.css?v=20260904-two-row-1">
  <link rel="stylesheet" href="https://assets.royalfamilyacademy.org/shared/css/animations.css?v=scroll-sync-20260902">
  <link rel="stylesheet" href="https://assets.royalfamilyacademy.org/shared/css/rfa-ai.css">'''

old_header = '''<header class="site-header" data-site-header>
  <div class="site-header__inner">
    <a class="site-brand" href="index.html" aria-label="RFA High School home">
      <span class="site-brand__name">RFA High School</span>
      <span class="site-brand__sub">Junior High · Senior High</span>
    </a>
    <nav class="desktop-nav" aria-label="Primary navigation">
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="academics.html">Academics</a>
      <a href="student-life.html">Student Life</a>
      <a href="admissions.html" aria-current="page">Admissions</a>
      <a href="contact.html">Contact</a>
    </nav>
    <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" data-nav-toggle>
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="mobile-nav" data-mobile-nav aria-hidden="true">
    <nav aria-label="Mobile navigation">
      <a href="index.html">Home</a>
      <a href="about.html">About</a>
      <a href="academics.html">Academics</a>
      <a href="student-life.html">Student Life</a>
      <a href="admissions.html" aria-current="page">Admissions</a>
      <a href="contact.html">Contact</a>
      <a href="https://nurseryandprimaryschool.royalfamilyacademy.org/">RFA Nursery &amp; Primary</a>
      <a href="https://sixthform.royalfamilyacademy.org/">RFA Sixth Form</a>
    </nav>
    <div class="mobile-nav__actions"><a class="btn btn--primary" href="admissions.html">Begin Admissions</a></div>
  </div>
</header>'''
new_header = '''<header class="site-header" data-site-header>
  <div class="container site-nav">
    <a href="index.html" class="site-nav__mark">
      <span class="site-nav__mark-word">RFA High School</span>
      <span class="site-nav__mark-sub">Junior High · Senior High</span>
    </a>
    <nav class="site-nav__links" aria-label="Primary">
      <a class="site-nav__link link-underline" href="about.html">About</a>
      <a class="site-nav__link link-underline" href="academics.html">Academics</a>
      <a class="site-nav__link link-underline" href="leadership.html">Leadership</a>
      <a class="site-nav__link link-underline" href="student-life.html">Student Life</a>
      <a class="site-nav__link link-underline" href="campus.html">Campus</a>
      <a class="site-nav__link link-underline" href="safety.html">Safety</a>
      <a class="site-nav__link link-underline" href="admissions.html" aria-current="page">Admissions</a>
      <a class="site-nav__link link-underline" href="contact.html">Contact</a>
    </nav>
    <div class="site-nav__actions">
      <a class="btn btn--ghost-dark" href="contact.html">Book a Visit</a>
      <button class="nav-toggle" data-nav-toggle aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span><span></span></button>
    </div>
  </div>
  <div class="mobile-nav" id="mobile-nav">
    <nav class="mobile-nav__links" aria-label="Mobile">
      <a href="about.html">About</a>
      <a href="academics.html">Academics</a>
      <a href="leadership.html">Leadership</a>
      <a href="student-life.html">Student Life</a>
      <a href="campus.html">Campus</a>
      <a href="safety.html">Safety</a>
      <a href="admissions.html" aria-current="page">Admissions</a>
      <a href="contact.html">Contact</a>
      <a href="https://royalfamilyacademy.org/">RFA Academy</a>
      <a href="https://nurseryandprimaryschool.royalfamilyacademy.org/">RFA Nursery &amp; Primary</a>
      <a href="https://sixthform.royalfamilyacademy.org/">RFA Sixth Form</a>
    </nav>
    <div class="mobile-nav__actions"><a class="btn btn--primary" href="admissions.html">Begin Admissions</a></div>
  </div>
</header>'''

if text.count(old_css) != 1:
    raise SystemExit(f'CSS block match count: {text.count(old_css)}')
if text.count(old_header) != 1:
    raise SystemExit(f'Header block match count: {text.count(old_header)}')

text = text.replace(old_css, new_css, 1).replace(old_header, new_header, 1)
path.write_text(text)
