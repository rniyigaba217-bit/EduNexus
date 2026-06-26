# EduNexus — Claude Context Guide

> Read this at the start of every session. It has everything needed to make changes quickly without re-reading the whole codebase.

---

## What the project is

EduNexus is a **vanilla JS SPA** (no framework, no build step, no npm) for a university management system. It runs directly in the browser. All data lives in `localStorage`. It is deployed on **Vercel** via a GitHub connection.

Live repo: `https://github.com/rniyigaba217-bit/EduNexus`  
Owner git email: `trainee17@the-gym.rw`

---

## Tech constraints

| Constraint | Detail |
|---|---|
| No framework | Plain HTML + CSS + vanilla JS, everything in global scope |
| No build | Files are loaded directly via `<script src="...">` in `index.html` |
| No backend | All data is `localStorage`; nothing persists across browsers |
| Vercel / Linux | File paths are **case-sensitive**. All `views/` scripts use lowercase. Never rename a folder with only a case change — use `git mv old tmp && git mv tmp new` |
| Template literals | Nested template literals are fine. Use single-quoted strings inside `onclick="..."` attributes |

---

## Architecture

### Routing
```js
App.register('page-id', containerEl => { /* render */ });
App.navigate('page-id');   // navigates and re-renders
```
Every page is a `.js` file with one `App.register(...)` call. The container is `document.getElementById('main-content')`.

### State
`js/state.js` — global `State` object with:
- `State.currentRole` — active role string
- `State.currentUser()` — profile object from localStorage
- `State.navConfig[role]` — sidebar items for each role
- `State.universities`, `State.courses`, `State.students`, etc. — static seed data arrays
- `State.chatMessages`, `State.sdDepartments`, `State.sdStaff`, `State.sdReviewThemes`, `State.sdRecentReviews`

### Auth
`js/auth.js` — `Auth.login(email, pw)`, `Auth.logout()`, `Auth.demoLogin(role)`  
`DB.demoProfile(role)` in `js/db.js` returns a profile for demo login by role.

### Nav
`js/nav.js` — `Nav.setActive(id)`, `Nav.toggleSidebar()`, `Nav.closeSidebar()`  
Sidebar auto-closes on mobile when navigating.

### Utils
`js/utils.js` — helpers used everywhere:
```js
Utils.statCard(icon, bgColor, value, label, sub, dir)  // dir: 'up'|'down'|''
Utils.progressBar(pct, color)                          // 0-100
Utils.barChart([{label, value, color}])                // CSS bar chart, height 120px
Utils.pill(text, class)                                // e.g. 'pill-green', 'pill-red', 'pill-yellow', 'pill-blue'
Utils.toast(msg, type)                                 // type: 'success'|'error'|'info'
Utils.openModal(title, bodyHtml)
Utils.closeModal()
Utils.confirm(msg, callback)
Utils.formatDate(timestamp)
Utils.gradeColor(pct)
```

### Notifications
```js
Notifier.send(title, body, { to: ['student'|'facilitator'|email|name], type, icon })
```
Notification buckets: `edunexus_notifs_${target}` in localStorage.  
`NotifCenter` IIFE handles the notification panel.

### Other global IIFEs (module pattern)
| IIFE | File | Purpose |
|---|---|---|
| `Counseling` | `views/counseling.js` | Booking system + wellbeing resources |
| `DM` | `views/messages.js` | Direct messaging between roles |
| `Timetable` | `views/timetable.js` | Weekly schedule grid |
| `AdminDocReqs` | `views/admin/doc-requests.js` | Admin processes doc requests |
| `StuDocs` | `views/student/doc-requests.js` | Students submit/view doc requests |
| `StudentExam` | `views/student/exams.js` | Live exam modal with auto-grading |
| `MinistrySchools` | `views/ministry/school-analysis.js` | School drill-down |
| `MinistryPrograms` | `views/ministry/course-analysis.js` | Programme comparison |
| `SysLog` | `js/syslog.js` | Activity log for super-admin |

---

## Roles and their views

| Role key | Demo login button | Dashboard file | Key pages |
|---|---|---|---|
| `student` | Student | `views/student/dashboard.js` | courses, grades, exams, assignments, timetable, counseling, stu-docs, ai-advisor, attendance, materials |
| `facilitator` | Facilitator | `views/facilitator/dashboard.js` | gradebook, grade-papers, exam-create, assignments, materials, attendance |
| `uni-admin` | Admin | `views/admin/dashboard.js` | students, departments, doc-requests, facilitators, analytics |
| `school-director` | School Director | `views/school-director/dashboard.js` | staff, students, departments, reviews, reports |
| `ministry` | Ministry | `views/ministry/dashboard.js` | school-analysis, course-analysis, dept-analysis, complaints, trends |
| `super-admin` | Super Admin | `views/super-admin/dashboard.js` | universities, admins, syslog |

All dashboard rendering goes through `App.register('dashboard', c => {...})` in `views/ministry/dashboard.js` — it branches on `State.currentRole` and calls `_studentDash`, `_facilDash`, `_ministryDash`, etc.

---

## CSS

Single file: `css/styles.css`

### Custom properties
```
--accent    #6c63ff  (purple)
--accent2   #00d4aa  (teal)
--green     #00d4aa
--red       #ff6b6b
--yellow    #ffd166
--blue      #64b5f6
--purple    #c084fc
--bg        main bg
--bg2       slightly lighter
--bg3       card bg / input bg
--border    subtle border
--text      primary text
--text2     secondary/muted text
```

### Key layout classes
```
.card             — white/dark card with padding + border-radius
.card-title       — bold section heading inside a card
.stats-grid       — responsive 4-column stat card grid
.grid-2           — 2-column responsive grid (collapses to 1 on mobile)
.pill .pill-green .pill-red .pill-yellow .pill-blue   — status badges
.btn-sm .btn-primary .btn-secondary                   — buttons
table             — auto-styled (thead, tbody, tr, th, td)
.bar-chart        — used by Utils.barChart(), height 120px, bars are % of height
```

### Mobile responsive
`@media (max-width:768px)` — sidebar slides off-screen, hamburger shows, grids collapse, modals become bottom sheets.  
`@media (max-width:480px)` — stats-grid goes to 1 column.

---

## localStorage keys

| Key | Owner | Content |
|---|---|---|
| `edunexus_users` | Auth/DB | array of user profiles |
| `edunexus_current_user` | Auth | current session profile |
| `edunexus_doc_requests` | AdminDocReqs / StuDocs | document request objects |
| `edunexus_doc_reqs_seeded` | seed guard | '1' when seeded |
| `edunexus_counselors` | Counseling | counselor profiles |
| `edunexus_appointments` | Counseling | booking records |
| `edunexus_counseling_seeded` | seed guard | '1' when seeded |
| `edunexus_timetable` | Timetable | slot objects `{day, dept, year, start, end, courseCode, courseName, room, facilitator}` |
| `edunexus_assignments` | assignments | assignment objects |
| `edunexus_submissions` | assignments | submission records |
| `edunexus_exam_results` | StudentExam | exam result objects |
| `edunexus_notifs_${target}` | Notifier | per-target notification array |
| `edunexus_messages` | DM | message objects |
| `edunexus_syslog` | SysLog | activity log entries |

---

## Seed guard pattern

All seed IIFEs must check BOTH flag AND data existence (flag-only guards fail if user visited before seed code was added):

```js
(() => {
  const existing = JSON.parse(localStorage.getItem('edunexus_my_data') || '[]');
  if (localStorage.getItem('edunexus_my_seeded') && existing.length > 0) return;
  // ... seed data ...
  localStorage.setItem('edunexus_my_data', JSON.stringify(seed));
  localStorage.setItem('edunexus_my_seeded', '1');
})();
```

---

## Patterns for common tasks

### Add a new page to a role
1. Create `views/{role}/my-page.js` with `App.register('my-page', c => { c.innerHTML = \`...\`; });`
2. Add `<script src="views/{role}/my-page.js"></script>` to `index.html` (in the matching role comment block)
3. Add `{ id:'my-page', label:'My Page', icon:'🔧' }` to `State.navConfig['{role}']` in `js/state.js`

### Add a drill-down inside a page (no new route needed)
Use the IIFE pattern with `render(c)` and `detail(id)` functions:
```js
const MyModule = (() => {
  function render(c) { c.innerHTML = `...clickable list...`; }
  function detail(id) {
    const c = document.getElementById('main-content');
    c.innerHTML = `
      <button onclick="MyModule.render(document.getElementById('main-content'))">← Back</button>
      ...detail content...`;
  }
  return { render, detail };
})();
App.register('my-page', c => MyModule.render(c));
```

### Send a notification
```js
Notifier.send('Title', 'Body text', { to: ['student'], type: 'info', icon: '📢' });
// to: array of role strings, email addresses, or display names
```

---

## What's been built (as of June 2026)

### Student
- Today widget on dashboard (live timetable + due assignments)
- Timetable weekly grid
- Exams with live countdown timer + auto-grading + results screen
- Document requests (submit + track)
- Counseling/wellbeing booking + wellbeing resources section
- AI Advisor chat (static demo)
- Grades, courses, assignments, attendance, materials pages

### Facilitator
- Gradebook, grade papers, exam creation, attendance, assignments, materials

### Uni Admin
- Student management, department management, doc-request processing, analytics

### School Director
- Staff, students, departments, reviews, reports pages

### Ministry (most recently worked on)
- `MinistrySchools` — clickable table → per-school detail (stat cards, trend chart, departments, reviews, at-risk)
- `MinistryPrograms` — programme cards with school comparison bars → programme detail (ranked schools, spread indicator)
- Dept analysis — table with YoY trends and status pills
- Dashboard school bars — clickable, navigate to school detail

### Super Admin
- University management, admin management, system log

### Cross-role
- Real-time notifications (Notifier.send → NotifCenter panel)
- Direct messaging (DM module)
- Announcements page
- PWA (manifest.json + sw.js + icons/icon.svg)
- Mobile responsive layout (hamburger, sidebar overlay)
- 6 demo login buttons on the login screen (Auth.demoLogin(role))

---

## PWA

- `manifest.json` — standalone, theme `#6c63ff`, shortcuts to dashboard/timetable
- `sw.js` — cache-first service worker, skips CDN, SPA fallback to `./index.html`
- `icons/icon.svg` — gradient "E" logo
- Registered in `index.html` at the bottom via `navigator.serviceWorker.register('./sw.js')`

---

## Known gotchas

1. **Apostrophes in single-quoted template strings** — `Utils.toast('You'll...')` breaks. Use double quotes for the outer string: `Utils.toast("You'll...", 'success')`
2. **Vercel case sensitivity** — `Views/` (capital V) is broken on Linux. All paths must be `views/` lowercase. Already fixed via git mv in commit `0765436`.
3. **Seed guard** — always check flag AND `data.length > 0`, never flag alone.
4. **barChart height** — bar height is `value%` of a 120px container, so values should be 0–100 (pass rates work directly).
5. **Modal timer** — `StudentExam` stores `timerInterval` in `State.modalTimer` so it can be cleared when the modal closes externally.
6. **`_myId()` fallback** — `StuDocs` falls back to `'CS-0001'` when the demo profile has no `studentId`, ensuring Alex Johnson always sees seed data.
