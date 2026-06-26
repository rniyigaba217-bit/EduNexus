/* EduNexus Service Worker — v2
   Cache-first for app shell; network-first fallback for everything else.
   Bump CACHE version to force a refresh after major updates. */

const CACHE = 'edunexus-v2';

const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './icons/icon.svg',
  /* Core JS */
  './js/db.js',
  './js/state.js',
  './js/utils.js',
  './js/notifications.js',
  './js/syslog.js',
  './js/auth.js',
  './js/nav.js',
  './js/app.js',
  /* Components */
  './components/file-upload.js',
  './components/chat.js',
  './components/reviews.js',
  /* Student views */
  './views/student/dashboard.js',
  './views/student/courses.js',
  './views/student/materials.js',
  './views/student/exams.js',
  './views/student/grades.js',
  './views/student/ai-advisor.js',
  './views/student/attendance.js',
  './views/student/assignments.js',
  './views/student/doc-requests.js',
  /* Facilitator views */
  './views/facilitator/dashboard.js',
  './views/facilitator/materials.js',
  './views/facilitator/exam-create.js',
  './views/facilitator/grade-papers.js',
  './views/facilitator/gradebook.js',
  './views/facilitator/attendance.js',
  './views/facilitator/assignments.js',
  /* Admin views */
  './views/admin/dashboard.js',
  './views/admin/students.js',
  './views/admin/facilitators.js',
  './views/admin/departments.js',
  './views/admin/analytics.js',
  './views/admin/doc-requests.js',
  /* Super-admin views */
  './views/super-admin/dashboard.js',
  './views/super-admin/universities.js',
  './views/super-admin/admins.js',
  './views/super-admin/syslog.js',
  /* Ministry views */
  './views/ministry/dashboard.js',
  './views/ministry/school-analysis.js',
  './views/ministry/dept-analysis.js',
  './views/ministry/course-analysis.js',
  './views/ministry/complaints.js',
  './views/ministry/trends.js',
  /* School-director views */
  './views/school-director/dashboard.js',
  './views/school-director/departments.js',
  './views/school-director/staff.js',
  './views/school-director/students.js',
  './views/school-director/reviews.js',
  './views/school-director/reports.js',
  /* Shared / new views */
  './views/announcements.js',
  './views/timetable.js',
  './views/notif-center.js',
  './views/messages.js',
  './views/counseling.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .catch(err => console.warn('[SW] Pre-cache partial failure:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  /* Let CDN requests (EmailJS, etc.) pass through without caching */
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request)
        .then(res => {
          if (res && res.ok && res.type === 'basic') {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
