// Seed default announcements on first load (runs for all roles at page load)
(function seedAnnouncements() {
  if (localStorage.getItem('edunexus_ann_seeded')) return;
  localStorage.setItem('edunexus_announcements', JSON.stringify([
    {
      id: 1,
      title: 'End-of-Term Examination Schedule',
      body: 'Final examinations for Term 2 will run from July 14–25. All students must collect their exam cards from the admin office by July 10. Students with outstanding fees will not be registered for examinations.',
      author: 'Dr. Fatima Osei', authorRole: 'school-director',
      targetDept: 'all', date: '2026-06-20', pinned: true,
    },
    {
      id: 2,
      title: 'Library Extended Hours — Examination Period',
      body: 'The library will be open until 10:00 PM daily from July 1 to July 25 to support student preparation. The quiet study zone on the second floor is available from 6:00 PM onwards.',
      author: 'Prof. Mark Davis', authorRole: 'uni-admin',
      targetDept: 'all', date: '2026-06-18', pinned: false,
    },
    {
      id: 3,
      title: 'CS Lab Closure — July 2 (Maintenance)',
      body: 'The Computer Science lab will be closed on July 2 for equipment upgrades. All CS301 and CS302 practical sessions scheduled for that date are postponed. Facilitators will share rescheduled dates.',
      author: 'Prof. Mark Davis', authorRole: 'uni-admin',
      targetDept: 'Computer Science', date: '2026-06-17', pinned: false,
    },
  ]));
  localStorage.setItem('edunexus_ann_seeded', '1');
})();

function _annCard(a, canManage) {
  const deptPill = a.targetDept === 'all'
    ? `<div class="pill pill-blue">All Departments</div>`
    : `<div class="pill pill-yellow">${a.targetDept}</div>`;

  return `
  <div style="padding:14px;background:var(--bg3);border-radius:10px;margin-bottom:10px;
    ${a.pinned ? 'border-left:3px solid var(--yellow)' : ''}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
      <div style="flex:1;margin-right:10px">
        <div style="font-weight:700;font-size:.95rem;margin-bottom:3px">${a.pinned ? '📌 ' : ''}${a.title}</div>
        <div style="font-size:.75rem;color:var(--text2)">By ${a.author} · ${a.date}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
        ${deptPill}
        ${canManage ? `
        <button onclick="Announcements.remove(${a.id})"
          style="background:rgba(255,107,107,.1);color:var(--red);border:1px solid rgba(255,107,107,.3);border-radius:6px;padding:3px 8px;font-size:.8rem;cursor:pointer">✕</button>
        ` : ''}
      </div>
    </div>
    <div style="font-size:.85rem;color:var(--text2);line-height:1.7">${a.body}</div>
  </div>`;
}

App.register('announcements', c => {
  const role       = State.currentRole;
  const canManage  = role === 'school-director' || role === 'uni-admin' || role === 'super-admin';
  const list       = JSON.parse(localStorage.getItem('edunexus_announcements') || '[]');
  const sorted     = list.slice().sort((a, b) => b.date.localeCompare(a.date));
  const pinned     = sorted.filter(a => a.pinned);
  const regular    = sorted.filter(a => !a.pinned);

  const IS  = 'width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);outline:none;box-sizing:border-box';
  const SEL = 'width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);outline:none';
  const TA  = IS + ';resize:vertical;font-family:inherit';

  c.innerHTML = `
  ${canManage ? `
  <div class="card" style="margin-bottom:20px">
    <div class="card-title">📢 Post Announcement</div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="font-size:.82rem;color:var(--text2);display:block;margin-bottom:5px">Title</label>
        <input id="ann-title" type="text" placeholder="Announcement title…" style="${IS}">
      </div>
      <div>
        <label style="font-size:.82rem;color:var(--text2);display:block;margin-bottom:5px">Message</label>
        <textarea id="ann-body" rows="4" placeholder="Write your announcement…" style="${TA}"></textarea>
      </div>
      <div class="grid-2" style="gap:12px">
        <div>
          <label style="font-size:.82rem;color:var(--text2);display:block;margin-bottom:5px">Audience</label>
          <select id="ann-dept" style="${SEL}">
            <option value="all">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Business Studies">Business Studies</option>
            <option value="Medicine">Medicine</option>
            <option value="Arts &amp; Humanities">Arts &amp; Humanities</option>
          </select>
        </div>
        <div style="display:flex;flex-direction:column;justify-content:flex-end;gap:10px">
          <div style="display:flex;align-items:center;gap:8px">
            <input id="ann-pin" type="checkbox" style="width:16px;height:16px;accent-color:var(--accent)">
            <label for="ann-pin" style="font-size:.85rem;cursor:pointer">📌 Pin this announcement</label>
          </div>
          <button class="btn btn-primary" onclick="Announcements.post()">Post Announcement →</button>
        </div>
      </div>
    </div>
  </div>` : `
  <div style="background:rgba(108,99,255,.08);border:1px solid rgba(108,99,255,.2);border-radius:12px;padding:14px 18px;margin-bottom:20px;font-size:.85rem;color:var(--text2)">
    📢 Announcements from your school administration. New posts appear here automatically.
  </div>`}

  ${pinned.length > 0 ? `
  <div class="card" style="margin-bottom:16px;border:1px solid rgba(255,209,102,.2)">
    <div class="card-title">📌 Pinned</div>
    ${pinned.map(a => _annCard(a, canManage)).join('')}
  </div>` : ''}

  <div class="card">
    <div class="card-title">📢 All Announcements (${list.length})</div>
    ${list.length === 0
      ? `<div style="text-align:center;padding:30px 0;color:var(--text2)">
          <div style="font-size:2rem;margin-bottom:8px">📢</div>
          <div>No announcements yet.</div>
         </div>`
      : regular.map(a => _annCard(a, canManage)).join('')
    }
  </div>`;
});

const Announcements = (() => {

  function post() {
    const title  = (document.getElementById('ann-title')?.value || '').trim();
    const body   = (document.getElementById('ann-body')?.value  || '').trim();
    const dept   = document.getElementById('ann-dept')?.value || 'all';
    const pinned = document.getElementById('ann-pin')?.checked || false;

    if (!title) { Utils.toast('Enter an announcement title.', 'error'); return; }
    if (!body)  { Utils.toast('Write the announcement message.', 'error'); return; }

    const list = JSON.parse(localStorage.getItem('edunexus_announcements') || '[]');
    list.unshift({
      id:         Date.now(),
      title, body,
      author:     State.currentUser().name,
      authorRole: State.currentRole,
      targetDept: dept,
      date:       new Date().toISOString().slice(0, 10),
      pinned,
    });
    localStorage.setItem('edunexus_announcements', JSON.stringify(list));
    SysLog.write('announcement', `${State.currentUser().name} posted "${title}" (audience: ${dept})`, 'info');
    Notifier.send(`📢 ${title}`, body.slice(0, 100), { to: ['student', 'facilitator'], type: 'announcement', icon: '📢' });
    Utils.toast('Announcement posted!', 'success');
    App.navigate('announcements');
  }

  function remove(id) {
    if (!window.confirm('Delete this announcement?')) return;
    const list = JSON.parse(localStorage.getItem('edunexus_announcements') || '[]');
    localStorage.setItem('edunexus_announcements', JSON.stringify(list.filter(a => a.id !== id)));
    Utils.toast('Announcement deleted.', 'success');
    App.navigate('announcements');
  }

  return { post, remove };
})();
