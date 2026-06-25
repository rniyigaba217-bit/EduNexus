App.register('notif-center', c => {
  NotifCenter.render(c);
});

const NotifCenter = (() => {
  let _filter = 'all';

  function _icon(title) {
    if (/assignment|due|📌/i.test(title))  return '📌';
    if (/announcement|📢/i.test(title))    return '📢';
    if (/document|ready|📬/i.test(title))  return '📬';
    if (/grade|score|📊/i.test(title))     return '📊';
    if (/⏰|⚠️|deadline/i.test(title))     return '⏰';
    return '🔔';
  }

  function _pushStatus() {
    if (!('Notification' in window))
      return { level:'unsupported', label:'Not supported', icon:'❌',
               msg:'Your browser does not support push notifications.',
               color:'var(--text2)' };
    if (Notification.permission === 'granted')
      return { level:'granted', label:'Enabled', icon:'✅',
               msg:'You will receive OS-level alerts for key events.',
               color:'var(--green)' };
    if (Notification.permission === 'denied')
      return { level:'denied', label:'Blocked', icon:'⚠️',
               msg:'Notifications are blocked. Click the lock icon in your browser address bar → Notifications → Allow.',
               color:'var(--yellow)' };
    return { level:'default', label:'Not enabled', icon:'🔕',
             msg:'Enable push notifications to receive OS-level alerts.',
             color:'var(--text2)' };
  }

  function render(c) {
    const all    = State.notifications;
    const unread = all.filter(n => !n.read);
    const list   = _filter === 'unread' ? unread : all;
    const push   = _pushStatus();

    c.innerHTML = `
    <div class="grid-2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-title">🔔 Push Notifications</div>
        <div style="display:flex;align-items:center;gap:12px;margin-top:12px">
          <div style="font-size:2rem">${push.icon}</div>
          <div>
            <div style="font-weight:700;color:${push.color}">${push.label}</div>
            <div style="font-size:.8rem;color:var(--text2);margin-top:3px;line-height:1.5">${push.msg}</div>
          </div>
        </div>
        ${push.level === 'default' ? `
        <button class="btn-sm btn-primary" style="width:100%;margin-top:14px"
          onclick="Notifier.requestPush().then(()=>NotifCenter.render(document.getElementById('main-content')))">
          Enable Push Notifications
        </button>` : ''}
        ${push.level === 'denied' ? `
        <div style="background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.2);border-radius:8px;
                    padding:10px 12px;margin-top:12px;font-size:.8rem;color:var(--yellow);line-height:1.6">
          🔓 To re-enable: click the <strong>lock icon</strong> in the address bar → Notifications → Allow
        </div>` : ''}
        ${push.level === 'granted' ? `
        <button class="btn-sm btn-secondary" style="width:100%;margin-top:14px"
          onclick="Notifier.send('🔔 Test Push','This is a test notification from EduNexus.',{})">
          Send Test Notification
        </button>` : ''}
      </div>

      <div class="card">
        <div class="card-title">📊 Overview</div>
        ${[
          ['Total',   all.length],
          ['Unread',  unread.length],
          ['Push',    push.label],
        ].map(([l, v]) => `
        <div style="display:flex;justify-content:space-between;padding:9px 0;
                    border-bottom:1px solid var(--border);font-size:.87rem">
          <span style="color:var(--text2)">${l}</span>
          <span style="font-weight:700">${v}</span>
        </div>`).join('')}
        <div style="display:flex;gap:8px;margin-top:14px">
          <button class="btn-sm btn-secondary" style="flex:1"
            onclick="Notifications.clearAll();NotifCenter.render(document.getElementById('main-content'))">
            Mark All Read
          </button>
          <button class="btn-sm" style="flex:1;background:rgba(255,107,107,.1);
            color:var(--red);border:1px solid rgba(255,107,107,.3)"
            onclick="NotifCenter.clearHistory()">
            Clear History
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div class="card-title" style="margin:0">Notification History</div>
        <div style="display:flex;gap:6px">
          <button class="btn-sm ${_filter === 'all' ? 'btn-primary' : 'btn-secondary'}"
            onclick="NotifCenter.setFilter('all')">All (${all.length})</button>
          <button class="btn-sm ${_filter === 'unread' ? 'btn-primary' : 'btn-secondary'}"
            onclick="NotifCenter.setFilter('unread')">Unread (${unread.length})</button>
        </div>
      </div>
      ${list.length === 0
        ? `<div style="text-align:center;padding:36px 0;color:var(--text2)">
            <div style="font-size:2.4rem;margin-bottom:10px">🔔</div>
            <div>${_filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}</div>
           </div>`
        : list.map(n => `
        <div onclick="NotifCenter.markOne(${n.id})"
             style="display:flex;gap:12px;align-items:flex-start;padding:13px 0;
               border-bottom:1px solid var(--border);cursor:pointer;
               opacity:${n.read ? '.55' : '1'};transition:opacity .15s"
             onmouseenter="this.style.opacity='1'"
             onmouseleave="this.style.opacity='${n.read ? '.55' : '1'}'">
          <div style="font-size:1.3rem;flex:0 0 28px;text-align:center;padding-top:2px">${_icon(n.title)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:${n.read ? '500' : '700'};font-size:.9rem">${n.title}</div>
            ${n.sub ? `<div style="font-size:.8rem;color:var(--text2);margin-top:3px;line-height:1.5">${n.sub}</div>` : ''}
            <div style="font-size:.74rem;color:var(--text2);margin-top:5px">${n.time}</div>
          </div>
          ${!n.read ? `<div class="notif-dot" style="flex-shrink:0;margin-top:8px"></div>` : ''}
        </div>`).join('')}
    </div>`;
  }

  function setFilter(f) {
    _filter = f;
    render(document.getElementById('main-content'));
  }

  function markOne(id) {
    const n = State.notifications.find(x => x.id === id);
    if (n) { n.read = true; Notifications.refresh(); }
    render(document.getElementById('main-content'));
  }

  function clearHistory() {
    Utils.confirm('Clear all notification history? This cannot be undone.', () => {
      const role  = State.currentRole;
      const email = State.currentUser()?.email;
      localStorage.removeItem(`edunexus_notifs_${role}`);
      if (email) localStorage.removeItem(`edunexus_notifs_${email}`);
      State.notifications.length = 0;
      Notifications.refresh();
      render(document.getElementById('main-content'));
      Utils.toast('Notification history cleared.', 'success');
    });
  }

  return { render, setFilter, markOne, clearHistory };
})();
