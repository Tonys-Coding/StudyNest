'use strict';

const STORE = 'studynest-progress-v1';
const iconNames = [
  'home', 'book', 'bookmark', 'search', 'arrow', 'out', 'download', 'right', 'clock', 'progress',
  'server', 'layers', 'terminal', 'check', 'close', 'left', 'info', 'copy', 'start', 'back',
  'plus', 'list', 'spark', 'phone',
];
const icon = (name, className = '') => {
  const index = iconNames.indexOf(name);
  return `<span class="icon ${className}" style="--ix:${(index % 6) * 20}%;--iy:${Math.floor(index / 6) * 100 / 3}%" aria-hidden="true"></span>`;
};

const shell = document.querySelector('#shell');
const searchDialog = document.querySelector('#search-dialog');
const installDialog = document.querySelector('#install-dialog');
const announcement = document.querySelector('#announcement');
const categories = ['All topics', ...new Set(courses.map(course => course.category))];
const nav = [
  ['home', 'home', 'Overview'],
  ['library', 'book', 'Course library'],
  ['bookmarks', 'bookmark', 'Bookmarks'],
];
let state = loadState();
let category = categories[0];
let activeSection = null;
let lastRoute = null;
let readingTimer = 0;
let resumeOnRoute = false;
let installPrompt;

history.scrollRestoration = 'manual';

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE)) ?? {};
    const last = typeof saved.last === 'string' ? saved.last : null;
    const previousCourse = last ? { [last.split('/')[0]]: last } : {};
    return {
      completed: Array.isArray(saved.completed) ? saved.completed : [],
      bookmarks: Array.isArray(saved.bookmarks) ? saved.bookmarks : [],
      last,
      lastByCourse: { ...previousCourse, ...saved.lastByCourse },
      positions: saved.positions ?? {},
    };
  } catch {
    return { completed: [], bookmarks: [], last: null, lastByCourse: {}, positions: {} };
  }
}

function persist() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); }
  catch { /* The current session remains usable when browser storage is unavailable. */ }
}

function announce(message) {
  announcement.textContent = message;
}

const keyFor = (course, section) => `${course.id}/${section.id}`;
const href = (course, section) => `#/course/${course.id}${section ? '/' + section.id : ''}`;
const isComplete = (course, section) => state.completed.includes(keyFor(course, section));
const isBookmarked = (course, section) => state.bookmarks.includes(keyFor(course, section));
const completedIn = course => course.sections.filter(section => isComplete(course, section)).length;

function getRoute() {
  const [page, courseId, sectionId] = location.hash.slice(2).split('/');
  if (page === 'course') {
    const course = courses.find(item => item.id === courseId);
    if (course) {
      const section = course.sections.find(item => item.id === sectionId);
      if (section) return { page: 'section', course, section };
      if (!sectionId) return { page: 'course', course };
    }
    return { page: 'missing' };
  }
  if (page === 'library' || page === 'bookmarks') return { page };
  return { page: 'home' };
}

function findSection(key) {
  if (typeof key !== 'string') return null;
  const [courseId, sectionId] = key.split('/');
  const course = courses.find(item => item.id === courseId);
  const section = course?.sections.find(item => item.id === sectionId);
  return section ? { course, section } : null;
}

function progress(value, max, label) {
  return `<progress value="${value}" max="${max}" aria-label="${label}"></progress>`;
}

function links(current, mobile = false) {
  return nav.map(([page, glyph, label]) => `
    <a class="nav-link" href="#/${page === 'home' ? '' : page}" ${current === page ? 'aria-current="page"' : ''}>
      ${icon(glyph)}<span>${mobile && page === 'library' ? 'Library' : label}</span>
    </a>`).join('');
}

function layout(route, content) {
  const current = ['section', 'course'].includes(route.page) ? 'library' : route.page;
  const currentLabel = nav.find(([item]) => item === current)?.[2] ?? 'Course library';
  return `
    <aside class="sidebar">
      <a href="#/" class="brand"><img width="36" height="36" src="./assets/icon-192.png" alt="">StudyNest</a>
      <p class="side-label">Workspace</p>
      <nav class="side-nav" aria-label="Main navigation">${links(current)}</nav>
      <div class="side-bottom">
        <button class="install" type="button" data-install>${icon('phone')}<span>Install StudyNest</span>${icon('out')}</button>
        <div class="profile"><span class="avatar" aria-hidden="true">AS</span><div><strong>Anthony</strong><small>Personal workspace</small></div></div>
      </div>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <div class="topbar-inner">
          <a href="#/" class="brand mobile-brand"><img width="34" height="34" src="./assets/icon-192.png" alt="">StudyNest</a>
          <div class="breadcrumb"><span>Workspace</span>${icon('right')}<strong>${currentLabel}</strong></div>
          <button class="search-trigger" type="button" aria-label="Search lessons" data-search>${icon('search')}<span>Search lessons</span><kbd>${/Mac/i.test(navigator.platform) ? '⌘' : 'Ctrl'} K</kbd></button>
          <button class="mobile-install square-button" type="button" aria-label="Install StudyNest" data-install>${icon('phone')}</button>
        </div>
      </header>
      <main class="main" id="main" tabindex="-1">${content}</main>
    </div>
    <nav class="bottom-nav" aria-label="Mobile navigation">${links(current, true)}</nav>`;
}

function courseArtwork(course) {
  return `<img class="course-art" width="840" height="840" src="./assets/${course.id}-art.webp" alt="">`;
}

function courseCard(course) {
  const count = completedIn(course);
  return `
    <a href="${href(course)}" class="course-card">
      <div class="cover cover-${course.id}">
        ${courseArtwork(course)}
        <span class="cover-icon">${icon(course.icon)}</span>
      </div>
      <div class="card-body">
        <div class="card-category"><span></span>${course.category}</div>
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <div class="card-meta">
          <span>${icon('list')}${course.sections.length} sections</span>
          <span>${icon('clock')}${courseMinutes(course)} min</span>
          <span class="card-arrow">${icon('out')}</span>
        </div>
        ${count ? `<div class="card-progress">${progress(count, course.sections.length, `Progress in ${course.title}`)}<span>${count}/${course.sections.length}</span></div>` : ''}
      </div>
    </a>`;
}

function filterButtons() {
  return `<div class="filters" role="group" aria-label="Filter courses by topic">
    ${categories.map(value => `<button class="chip" type="button" data-category="${value}" aria-pressed="${category === value}">${value}</button>`).join('')}
  </div>`;
}

function courseGrid() {
  const visible = courses.filter(course => category === categories[0] || course.category === category);
  return visible.map(courseCard).join('');
}

function home() {
  const recent = findSection(state.last);
  const featured = recent?.course ?? courses[0];
  const count = completedIn(featured);
  const finished = count === featured.sections.length;
  const totalDone = courses.reduce((total, course) => total + completedIn(course), 0);
  const active = recent && (!isComplete(featured, recent.section) || finished)
    ? recent.section
    : featured.sections.find(section => !isComplete(featured, section));

  return `
    <section class="welcome">
      <p class="eyebrow"><span></span> YOUR LEARNING SPACE</p>
      <h1>Good to see you, Anthony.</h1>
      <p>Pick up where you left off or find something new to learn.</p>
    </section>
    <div class="dashboard-grid">
      <section class="hero">
        <div class="hero-heading">
          <p class="hero-label">${icon(recent && !finished ? 'start' : 'spark')}${recent && !finished ? 'CONTINUE LEARNING' : finished ? 'COMPLETED COURSE' : 'FEATURED COURSE'}</p>
          <h2>${featured.title}</h2>
        </div>
        <div class="hero-art cover-${featured.id}">${courseArtwork(featured)}</div>
        <div class="hero-copy">
          <p class="hero-description">${recent && !finished ? active.title : featured.description}</p>
          <a class="button hero-button" href="${finished ? href(featured) : href(featured, active)}" ${recent && !finished ? 'data-resume' : ''}>${finished ? 'Review course' : recent ? 'Resume lesson' : 'Start learning'}${icon('arrow')}</a>
        </div>
        <div class="hero-meta"><span>${icon('list')}${featured.sections.length} sections</span><span>${icon('clock')}${courseMinutes(featured)} min</span></div>
      </section>
      <section class="progress-panel" aria-labelledby="progress-title">
        <div class="panel-icon">${icon('progress')}</div>
        <h2 id="progress-title">Study progress</h2>
        <div class="progress-value"><strong>${totalDone}</strong><span> / ${sectionCount} sections</span></div>
        ${progress(totalDone, sectionCount, 'Total sections completed')}
        <div class="progress-caption"><span>Overall completion</span><strong>${Math.round(totalDone / sectionCount * 100)}%</strong></div>
        <a href="#/bookmarks" class="saved-link">${icon('bookmark')} <span>${state.bookmarks.length} ${state.bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}</span>${icon('right')}</a>
      </section>
    </div>
    <section class="catalog" aria-labelledby="catalog-title">
      <div class="section-heading">
        <div><h2 id="catalog-title">Explore courses</h2><p>Choose a topic to start learning.</p></div>
        <a class="text-link" href="#/library">View library ${icon('out')}</a>
      </div>
      ${filterButtons()}
      <div class="course-grid" id="course-grid">${courseGrid()}</div>
    </section>`;
}

function library() {
  return `<section class="page-heading"><p class="eyebrow"><span></span> EXPLORE</p><h1>Course library</h1>
    <p>Browse the courses in your StudyNest library.</p></section>
    <section class="catalog catalog-page" aria-label="Courses">
      ${filterButtons()}<div class="course-grid" id="course-grid">${courseGrid()}</div>
    </section>`;
}

function bookmarks() {
  const saved = [...state.bookmarks].reverse().map(findSection).filter(Boolean);
  return `
    <section class="page-heading"><p class="eyebrow"><span></span> SAVED SECTIONS</p><h1>Bookmarks</h1>
      <p>Jump back to the sections you want to revisit.</p></section>
    ${saved.length ? `<ul class="bookmark-list">${saved.map(({ course, section }) => `
      <li class="bookmark-row">
        <a href="${href(course, section)}">${icon('bookmark')}<span><small>${course.title}</small><strong>${section.title}</strong></span>${icon('right')}</a>
        <button class="square-button saved" type="button" data-remove-bookmark="${keyFor(course, section)}" aria-label="Remove bookmark for ${section.title}">${icon('close')}</button>
      </li>`).join('')}</ul>` : `<div class="empty"><div class="panel-icon">${icon('bookmark')}</div><h2>No bookmarks yet</h2>
      <p>Use the bookmark button in a lesson section to save it here.</p><a class="button primary" href="#/library">Browse courses ${icon('arrow')}</a></div>`}`;
}

function outline(course, currentSection) {
  return `<ol class="outline">${course.sections.map((section, index) => {
    const complete = isComplete(course, section);
    const current = section === currentSection;
    return `<li><a href="${href(course, section)}" ${current ? 'aria-current="page"' : ''}>
      <span class="outline-number ${complete ? 'complete' : ''}">${complete ? icon('check') + '<span class="sr-only">Completed</span>' : String(index + 1)}</span>
      <span class="outline-title">${section.title}${isBookmarked(course, section) ? icon('bookmark', 'outline-bookmark') : ''}</span>
      ${currentSection ? '' : `<small>${section.minutes} min</small>${icon('right', 'outline-arrow')}`}
    </a></li>`;
  }).join('')}</ol>`;
}

function coursePage(course) {
  const count = completedIn(course);
  const recent = findSection(state.lastByCourse[course.id]);
  const hasStarted = count > 0 || recent?.course === course;
  const active = recent?.course === course && !isComplete(course, recent.section)
    ? recent.section
    : course.sections.find(section => !isComplete(course, section)) ?? course.sections[0];

  return `
    <a class="back-link" href="#/library">${icon('back')} Course library</a>
    <section class="course-heading cover-${course.id}">
      <div class="course-heading-title">
        <p class="eyebrow"><span></span> ${course.category} / ${course.level}</p>
        <h1>${course.title}</h1>
      </div>
      ${courseArtwork(course)}
      <p class="course-description">${course.description}</p>
      <div class="course-heading-actions">
        <a class="button primary" href="${href(course, active)}" data-resume>${count === course.sections.length ? 'Review course' : hasStarted ? 'Resume course' : 'Start course'} ${icon('arrow')}</a>
        <span class="course-length">${icon('clock')}${courseMinutes(course)} min</span>
      </div>
    </section>
    <nav class="course-outline" aria-labelledby="sections-title">
      <div class="section-heading"><h2 id="sections-title">Course sections</h2><p>${count ? `${count} of ${course.sections.length} complete` : `${course.sections.length} sections`}</p></div>
      ${outline(course)}
    </nav>`;
}

const escapeHtml = value => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function lessonBlock(block, index) {
  switch (block.type) {
    case 'text':
      return `<section class="lesson-text"><h2>${block.title}</h2><p>${block.body}</p></section>`;
    case 'note':
      return `<aside class="lesson-note">${icon('info')}<div><strong>${block.title}</strong><p>${block.body}</p></div></aside>`;
    case 'code':
      return `<div class="code-block"><div><span>${block.language}</span><button type="button" data-copy>${icon('copy')} Copy</button></div>
        <pre tabindex="0"><code>${escapeHtml(block.content)}</code></pre></div>`;
    case 'steps':
      return `<section class="interactive" data-block="${index}">
        <p class="block-label">${icon('spark')} INTERACTIVE EXAMPLE</p><h2>${block.title}</h2>
        <div class="step-chips" role="group" aria-label="Choose a step">
          ${block.items.map((item, step) => `<button type="button" class="step-chip" data-step="${step}" aria-pressed="${step === 0}"><span>${step + 1}</span>${item.label}</button>`).join('')}
        </div><p class="step-detail" aria-live="polite">${block.items[0].detail}</p></section>`;
    case 'quiz':
      return `<section class="interactive quiz" data-block="${index}">
        <p class="block-label">${icon('check')} QUICK CHECK</p><h2>${block.question}</h2>
        <div class="quiz-options" role="group" aria-label="Answer choices">
          ${block.options.map((option, choice) => `<button class="option" type="button" data-answer="${choice}" aria-pressed="false">${escapeHtml(option)}</button>`).join('')}
        </div><p class="quiz-feedback" role="status"></p></section>`;
    default: return '';
  }
}

function sectionPage(course, section) {
  const index = course.sections.indexOf(section);
  const previous = course.sections[index - 1];
  const next = course.sections[index + 1];
  const saved = isBookmarked(course, section);
  const complete = isComplete(course, section);
  return `
    <a class="back-link" href="${href(course)}">${icon('back')} ${course.title}</a>
    <article class="reader">
      <header class="lesson-header">
        <div class="lesson-top">
          <p class="eyebrow"><span></span> Section ${index + 1} of ${course.sections.length}</p>
          <button class="bookmark-toggle square-button" type="button" data-bookmark aria-label="Bookmark this section" title="Bookmark this section" aria-pressed="${saved}">${icon('bookmark')}</button>
        </div>
        <div class="lesson-heading">
          <h1>${section.title}</h1>
          <div class="lesson-art cover-${course.id}">${courseArtwork(course)}</div>
        </div>
        <div class="lesson-meta"><span>${icon('clock')} ${section.minutes} min</span>${complete ? `<span class="done">${icon('check')} Completed</span>` : ''}</div>
        <p>${section.intro}</p>
      </header>
      <aside class="reader-side">
        <button class="outline-toggle" type="button" data-outline-toggle aria-expanded="false" aria-controls="reader-outline">
          ${icon('list')} Course sections ${icon('right', 'outline-chevron')}
        </button>
        <nav id="reader-outline" aria-label="Course sections">
          <h2>Course sections</h2>
          ${outline(course, section)}
        </nav>
      </aside>
      <div class="lesson-body">
        ${section.blocks.map(lessonBlock).join('')}
        <footer class="lesson-footer">
          ${previous ? `<a class="button secondary" href="${href(course, previous)}">${icon('back')} Previous</a>` : ''}
          <button class="button primary" type="button" data-complete>${complete ? (next ? 'Next section' : 'Back to course') : (next ? 'Complete & next' : 'Complete & return')}${icon(next ? 'arrow' : complete ? 'back' : 'check')}</button>
        </footer>
      </div>
    </article>`;
}

function render({ routeChange = false } = {}) {
  const route = getRoute();
  const key = route.section ? keyFor(route.course, route.section) : null;
  const hash = location.hash;
  let scrollTarget = 0;

  if (routeChange) {
    saveReadingPosition();
    if (key && (resumeOnRoute || lastRoute === null)) scrollTarget = state.positions[key] || 0;
    if (key) {
      state.last = key;
      state.lastByCourse[route.course.id] = key;
      persist();
    }
    activeSection = key;
    lastRoute = hash;
    resumeOnRoute = false;
  }

  let content;
  switch (route.page) {
    case 'library': content = library(); break;
    case 'bookmarks': content = bookmarks(); break;
    case 'course': content = coursePage(route.course); break;
    case 'section': content = sectionPage(route.course, route.section); break;
    case 'missing': content = '<div class="empty"><h1>Section unavailable</h1><a class="button primary" href="#/library">Browse courses</a></div>'; break;
    default: content = home();
  }
  shell.innerHTML = layout(route, content);
  document.title = route.section ? `${route.section.title} · StudyNest`
    : route.course ? `${route.course.title} · StudyNest`
    : route.page === 'home' ? 'StudyNest' : `${route.page === 'library' ? 'Course library' : 'Bookmarks'} · StudyNest`;

  if (routeChange) {
    shell.querySelector('main').focus({ preventScroll: true });
    window.scrollTo(0, scrollTarget);
  }
}

function saveReadingPosition() {
  clearTimeout(readingTimer);
  if (!activeSection) return;
  state.positions[activeSection] = window.scrollY;
  persist();
}

function setCategory(button) {
  category = button.dataset.category;
  shell.querySelectorAll('[data-category]').forEach(item => {
    item.setAttribute('aria-pressed', String(item === button));
  });
  const grid = shell.querySelector('#course-grid');
  grid.innerHTML = courseGrid();
  announce(`${grid.children.length} ${grid.children.length === 1 ? 'course' : 'courses'} shown`);
}

function toggleBookmark(button, course, section) {
  const key = keyFor(course, section);
  const wasSaved = state.bookmarks.includes(key);
  state.bookmarks = wasSaved ? state.bookmarks.filter(item => item !== key) : [...state.bookmarks, key];
  persist();
  button.setAttribute('aria-pressed', String(!wasSaved));
  const outlineTitle = shell.querySelector('.outline a[aria-current] .outline-title');
  if (outlineTitle) {
    if (wasSaved) outlineTitle.querySelector('.outline-bookmark')?.remove();
    else outlineTitle.insertAdjacentHTML('beforeend', icon('bookmark', 'outline-bookmark'));
  }
  announce(wasSaved ? 'Bookmark removed' : 'Section bookmarked');
}

function completeSection(course, section) {
  const key = keyFor(course, section);
  const complete = state.completed.includes(key);
  const next = course.sections[course.sections.indexOf(section) + 1];
  if (!complete) {
    state.completed.push(key);
    persist();
    announce(completedIn(course) === course.sections.length ? 'Course complete' : 'Section marked complete');
  }
  location.hash = href(course, next);
}

function openSearch() {
  if (searchDialog.open) return;
  searchDialog.innerHTML = `
    <div class="dialog-heading"><h2 id="search-title">Search lessons</h2><form method="dialog"><button class="square-button" aria-label="Close search">${icon('close')}</button></form></div>
    <label class="search-field">${icon('search')}<span class="sr-only">Search course and section titles or lesson content</span><input type="search" placeholder="Try middleware or React" autofocus></label>
    <p class="sr-only" id="search-count" role="status"></p><div id="search-results" class="search-results"></div>`;
  searchDialog.showModal();
  searchDialog.querySelector('input').focus();
  showSearchResults('');
}

function matches(text, words) {
  const haystack = text.toLowerCase();
  return words.every(word => haystack.includes(word));
}

function showSearchResults(query) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = [];
  for (const course of courses) {
    const description = `${course.title} ${course.category} ${course.description}`;
    if (matches(description, words)) results.push({ course });
    if (!words.length) continue;
    for (const section of course.sections) {
      if (matches(`${course.title} ${section.title} ${section.intro} ${JSON.stringify(section.blocks)}`, words)) {
        results.push({ course, section });
      }
    }
  }
  searchDialog.querySelector('#search-count').textContent = `${results.length} results`;
  searchDialog.querySelector('#search-results').innerHTML = results.length ? results.map(({ course, section }) =>
    `<a href="${href(course, section)}">${icon(section ? 'list' : course.icon)}<span><strong>${section?.title ?? course.title}</strong><small>${section ? course.title : course.category}</small></span>${icon('right')}</a>`
  ).join('') : '<p class="no-results">No lessons match your search.</p>';
}

async function install() {
  if (installPrompt) {
    const prompt = installPrompt;
    installPrompt = null;
    await prompt.prompt();
    return;
  }
  const installed = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  installDialog.innerHTML = `<div class="dialog-heading"><h2 id="install-title">Install StudyNest</h2>
    <form method="dialog"><button class="square-button" aria-label="Close install help">${icon('close')}</button></form></div>
    <p>${installed ? 'StudyNest is already running as an app.' : 'On iPhone or iPad, open StudyNest in Safari and choose Share, then Add to Home Screen. On desktop or Android, look for Install or Add to Home screen in your browser menu.'}</p>`;
  if (!installDialog.open) installDialog.showModal();
}

shell.addEventListener('click', async event => {
  const target = event.target.closest('button, a');
  if (!target) return;
  if (target.hasAttribute('data-resume')) {
    resumeOnRoute = !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    return;
  }
  if (target.hasAttribute('data-search')) return openSearch();
  if (target.hasAttribute('data-install')) return install();
  if (target.hasAttribute('data-category')) return setCategory(target);
  if (target.hasAttribute('data-outline-toggle')) {
    target.setAttribute('aria-expanded', String(target.getAttribute('aria-expanded') !== 'true'));
    return;
  }
  if (target.hasAttribute('data-remove-bookmark')) {
    const options = [...shell.querySelectorAll('[data-remove-bookmark]')];
    const index = options.indexOf(target);
    state.bookmarks = state.bookmarks.filter(key => key !== target.dataset.removeBookmark);
    persist();
    render();
    const remaining = shell.querySelectorAll('[data-remove-bookmark]');
    (remaining[Math.min(index, remaining.length - 1)] ?? shell.querySelector('.empty a'))?.focus();
    return announce('Bookmark removed');
  }

  const { course, section } = getRoute();
  if (!section) return;
  if (target.hasAttribute('data-bookmark')) return toggleBookmark(target, course, section);
  if (target.hasAttribute('data-complete')) return completeSection(course, section);
  if (target.hasAttribute('data-copy')) {
    const code = target.closest('.code-block').querySelector('code');
    try {
      await navigator.clipboard.writeText(code.textContent);
      target.innerHTML = icon('check') + ' Copied';
      announce('Code copied');
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      announce('Code selected. Use your device’s copy command.');
    }
    return;
  }
  const widget = target.closest('[data-block]');
  if (!widget) return;
  const block = section.blocks[Number(widget.dataset.block)];
  widget.querySelectorAll('button').forEach(button => {
    button.setAttribute('aria-pressed', String(button === target));
  });
  if (target.hasAttribute('data-step')) {
    widget.querySelector('.step-detail').textContent = block.items[Number(target.dataset.step)].detail;
  }
  if (target.hasAttribute('data-answer')) {
    widget.querySelectorAll('.option').forEach(button => button.removeAttribute('data-result'));
    const correct = Number(target.dataset.answer) === block.correct;
    target.dataset.result = correct ? 'correct' : 'retry';
    widget.querySelector('.quiz-feedback').textContent = correct ? block.feedback : 'Try again. You can choose another answer.';
  }
});

document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  shell.querySelector('main').focus();
});
searchDialog.addEventListener('input', event => showSearchResults(event.target.value));
searchDialog.addEventListener('click', event => {
  if (event.target.closest('a') || event.target === searchDialog) searchDialog.close();
});
installDialog.addEventListener('click', event => {
  if (event.target === installDialog) installDialog.close();
});
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (!installDialog.open) openSearch();
  }
});

window.addEventListener('hashchange', () => {
  if (lastRoute !== location.hash) render({ routeChange: true });
});
window.addEventListener('scroll', () => {
  if (!activeSection) return;
  clearTimeout(readingTimer);
  readingTimer = setTimeout(saveReadingPosition, 180);
}, { passive: true });
window.addEventListener('pagehide', saveReadingPosition);
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
});
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
render({ routeChange: true });
