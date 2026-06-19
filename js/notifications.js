const Notifications = (() => {

  // emailjs.init('YOUR_PUBLIC_KEY');

  function render() {
    const list  = document.getElementById('notif-list');
    const badge = document.getElementById('notif-badge');
    const unread = State.notifications.filter(n => !n.read).length;

    badge.textContent = unread;
    badge.style.display = unread ? 'flex' : 'none';

    list.innerHTML = State.notifications.map(n => `
      <div class="notif-item" onclick="Notifications.markRead(${n.id})">
        <div class="notif-row">
          <div class="notif-dot" style="${n.read ? 'background:transparent' : ''}"></div>
          <div>
            <div class="notif-title">${n.title}</div>
            <div class="notif-sub">${n.sub} · ${n.time}</div>
          </div>
        </div>
      </div>`).join('') || '<div style="padding:16px;color:var(--text2);font-size:.85rem">No notifications</div>';
  }

  function toggle() {
    const panel = document.getElementById('notif-panel');
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) render();
  }

  function close() {
    document.getElementById('notif-panel').classList.remove('open');
  }

  function markRead(id) {
    const n = State.notifications.find(n => n.id === id);
    if (n) n.read = true;
    render();
  }

  function clearAll() {
    State.notifications.forEach(n => n.read = true);
    render();
  }

  function sendEmail(toName, toEmail, subject, message) {
    // emailjs.send('SERVICE_ID', 'TEMPLATE_NOTIFICATION', {
    //   to_name:  toName,
    //   to_email: toEmail,
    //   subject:  subject,
    //   message:  message,
    // }).then(() => console.log('Email sent'), err => console.error(err));

    State.addNotification(subject, message);
    render();
    Utils.toast(`Notification sent to ${toName}`, 'success');
  }

  function notifyExamScheduled(examName, dateStr) {
    sendEmail(
      'All Students',
      'students@uot.edu',
      `Exam Scheduled: ${examName}`,
      `Your exam "${examName}" is scheduled for ${dateStr}. Please prepare accordingly.`
    );
  }

  function notifyGradePosted(studentName, courseName, grade) {
    sendEmail(
      studentName,
      'student@uot.edu',
      `Grade Posted – ${courseName}`,
      `Your grade for ${courseName} has been posted: ${grade}. Log in to EduNexus to view details.`
    );
  }

  return { render, toggle, close, markRead, clearAll, sendEmail, notifyExamScheduled, notifyGradePosted };
})();
