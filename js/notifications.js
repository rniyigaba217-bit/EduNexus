/* ══════════════════════════════════════════════════════
   Notifications  — UI panel
   ══════════════════════════════════════════════════════ */
const Notifications = (() => {

  function _icon(title) {
    if (/assignment|due|📌/i.test(title))  return '📌';
    if (/announcement|📢/i.test(title))    return '📢';
    if (/document|ready|📬/i.test(title))  return '📬';
    if (/grade|score|📊/i.test(title))     return '📊';
    if (/⏰|⚠️|deadline/i.test(title))     return '⏰';
    return '🔔';
  }

  function render() {
    const list   = document.getElementById('notif-list');
    const badge  = document.getElementById('notif-badge');
    const unread = State.notifications.filter(n => !n.read).length;

    if (badge) {
      badge.textContent   = unread;
      badge.style.display = unread ? 'flex' : 'none';
    }

    if (!list) return;
    list.innerHTML = State.notifications.length === 0
      ? '<div style="padding:18px;color:var(--text2);font-size:.85rem;text-align:center">No notifications</div>'
      : State.notifications.slice(0, 20).map(n => `
      <div class="notif-item" onclick="Notifications.markRead(${n.id})"
           style="opacity:${n.read ? '.55' : '1'}">
        <div class="notif-row" style="align-items:flex-start;gap:10px">
          <span style="font-size:1.05rem;flex:0 0 22px;text-align:center;margin-top:2px">${_icon(n.title)}</span>
          <div style="flex:1;min-width:0">
            <div class="notif-title">${n.title}</div>
            <div class="notif-sub">${n.sub || ''} · ${n.time}</div>
          </div>
          ${!n.read ? '<div class="notif-dot" style="flex-shrink:0;margin-top:6px"></div>' : ''}
        </div>
      </div>`).join('');
  }

  function refresh() {
    const badge  = document.getElementById('notif-badge');
    const unread = State.notifications.filter(n => !n.read).length;
    if (badge) {
      badge.textContent   = unread;
      badge.style.display = unread ? 'flex' : 'none';
    }
    const panel = document.getElementById('notif-panel');
    if (panel && panel.classList.contains('open')) render();
  }

  function toggle() {
    const panel = document.getElementById('notif-panel');
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) render();
  }

  function close() {
    const panel = document.getElementById('notif-panel');
    if (panel) panel.classList.remove('open');
  }

  function markRead(id) {
    const n = State.notifications.find(x => x.id === id);
    if (n) n.read = true;
    render();
  }

  function clearAll() {
    State.notifications.forEach(n => n.read = true);
    render();
  }

  function sendEmail(toName, toEmail, subject, message) {
    State.addNotification(subject, message);
    refresh();
    Utils.toast(`Notification sent to ${toName}`, 'success');
  }

  function notifyExamScheduled(examName, dateStr) {
    sendEmail('All Students', 'students@uot.edu', `Exam Scheduled: ${examName}`,
      `Your exam "${examName}" is scheduled for ${dateStr}.`);
  }

  function notifyGradePosted(studentName, courseName, grade) {
    sendEmail(studentName, 'student@uot.edu', `Grade Posted – ${courseName}`,
      `Your grade for ${courseName}: ${grade}.`);
  }

  return { render, refresh, toggle, close, markRead, clearAll,
           sendEmail, notifyExamScheduled, notifyGradePosted };
})();


/* ══════════════════════════════════════════════════════
   Notifier  — cross-module notification engine
   ══════════════════════════════════════════════════════ */
const Notifier = (() => {

  function _key(target)  { return `edunexus_notifs_${target}`; }

  function _relTime(ts) {
    const d = Date.now() - ts;
    if (d < 60000)    return 'Just now';
    if (d < 3600000)  return `${Math.floor(d / 60000)}m ago`;
    if (d < 86400000) return `${Math.floor(d / 3600000)}h ago`;
    return `${Math.floor(d / 86400000)}d ago`;
  }

  function _push(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try { new Notification(title, { body, tag: title }); } catch (_) {}
  }

  /* Send a notification to one or more targets (role names or emails).
     Also shows it immediately if the current user is in the target list. */
  function send(title, body, opts = {}) {
    const role    = State.currentRole;
    const user    = State.currentUser();
    const targets = opts.to
      ? (Array.isArray(opts.to) ? opts.to : [opts.to])
      : [role];

    const notif = {
      id:   Date.now(),
      title, body,
      ts:   Date.now(),
      type: opts.type || 'info',
      read: false,
    };

    targets.forEach(t => {
      const all = JSON.parse(localStorage.getItem(_key(t)) || '[]');
      all.unshift(notif);
      localStorage.setItem(_key(t), JSON.stringify(all.slice(0, 100)));
    });

    const isForMe = targets.includes(role) || (user?.email && targets.includes(user.email));
    if (isForMe) {
      State.notifications.unshift({ id: notif.id, title, sub: body, read: false, time: 'Just now' });
      Notifications.refresh();
      _push(title, body);
    }
  }

  /* Load persisted notifications for the logged-in user.
     Called from auth._mountApp() after State.setProfile(). */
  function loadForUser(email, role, name) {
    const sources = [_key(role)];
    if (email) sources.push(_key(email));
    if (name)  sources.push(_key(name));

    const existing = new Set(State.notifications.map(n => n.id));
    const fresh    = [];

    sources.forEach(k => {
      const items = JSON.parse(localStorage.getItem(k) || '[]');
      items.forEach(n => {
        if (!existing.has(n.id)) { existing.add(n.id); fresh.push(n); }
      });
    });

    fresh
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 25)
      .forEach(n => {
        State.notifications.push({
          id:    n.id,
          title: n.title,
          sub:   n.body || '',
          read:  n.read,
          time:  _relTime(n.ts),
        });
      });
  }

  /* Ask the browser for push notification permission. */
  async function requestPush() {
    if (!('Notification' in window)) {
      Utils.toast('Your browser does not support push notifications.', 'error');
      return false;
    }
    if (Notification.permission === 'granted') {
      Utils.toast('Push notifications are already enabled.', 'success');
      return true;
    }
    if (Notification.permission === 'denied') {
      Utils.toast('Push notifications are blocked — update your browser settings to allow them.', 'error');
      return false;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      Utils.toast('Push notifications enabled!', 'success');
      new Notification('EduNexus', { body: 'You will now receive push notifications for assignments, announcements, and more.' });
    } else {
      Utils.toast('Push notifications were not enabled.', 'error');
    }
    return perm === 'granted';
  }

  function pushEnabled() {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  /* Check assignment deadlines for students — called after login. */
  function checkDeadlines() {
    if (State.currentRole !== 'student') return;
    const assignments = JSON.parse(localStorage.getItem('edunexus_assignments') || '[]');
    const submissions = JSON.parse(localStorage.getItem('edunexus_submissions') || '[]');
    const now  = Date.now();
    const h24  = 86400000;
    const h48  = h24 * 2;

    assignments.forEach(a => {
      const due  = new Date(a.dueDate).getTime();
      const left = due - now;
      if (left <= 0) return;
      if (submissions.some(s => s.assignmentId === a.id)) return;

      if (left < h24) {
        State.notifications.unshift({
          id: now + 1, title: `⚠️ Due Today: ${a.title}`,
          sub: `${a.courseCode} — submit before midnight!`, read: false, time: 'Today',
        });
        _push(`Due Today: ${a.title}`, `${a.courseCode} assignment is due today.`);
      } else if (left < h48) {
        State.notifications.unshift({
          id: now + 2, title: `📌 Due Soon: ${a.title}`,
          sub: `${a.courseCode} — due in under 48 hours`, read: false, time: 'Upcoming',
        });
      }
    });
  }

  return { send, loadForUser, requestPush, pushEnabled, checkDeadlines };
})();
