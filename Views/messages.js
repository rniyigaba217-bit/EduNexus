/* ── Seed direct messages ─────────────────────────────────── */
(() => {
  if (localStorage.getItem('edunexus_dm_seeded')) return;

  const ck1 = ['Alex Johnson', 'Dr. Sarah Williams'].sort().join('||');
  const ck2 = ['Alex Johnson', 'Prof. Ahmed Hassan'].sort().join('||');

  const msgs1 = [
    { id:1, from:'Dr. Sarah Williams', text:"Hi Alex, just a reminder that your BST implementation is due July 5th. Let me know if you need any help!", ts: Date.now() - 86400000*3 },
    { id:2, from:'Alex Johnson',       text:"Thanks! I'm stuck on the delete operation for nodes with two children — how should I approach that?", ts: Date.now() - 86400000*3 + 3600000 },
    { id:3, from:'Dr. Sarah Williams', text:"Great question. Find the in-order successor — the smallest node in the right subtree — copy its value to the target node, then delete the successor.", ts: Date.now() - 86400000*2 + 1800000 },
    { id:4, from:'Alex Johnson',       text:"So I replace the value with the successor's, then recursively delete the successor from the right subtree?", ts: Date.now() - 86400000*2 + 5400000 },
    { id:5, from:'Dr. Sarah Williams', text:"Exactly right! The successor has at most one right child, making that deletion simple. You've got this — good luck!", ts: Date.now() - 86400000 },
  ];
  const msgs2 = [
    { id:10, from:'Prof. Ahmed Hassan', text:"Hello Alex, I reviewed your outline for the Graph Traversal report. It's a solid start — make sure to include coded examples for both DFS and BFS.", ts: Date.now() - 86400000*5 },
    { id:11, from:'Alex Johnson',       text:"Understood! Should the complexity analysis cover worst-case only, or both average and worst?", ts: Date.now() - 86400000*5 + 2700000 },
    { id:12, from:'Prof. Ahmed Hassan', text:"Both, please — especially the space complexity difference between the two algorithms.", ts: Date.now() - 86400000*4 },
  ];

  localStorage.setItem(`edunexus_dm_msgs_${ck1}`, JSON.stringify(msgs1));
  localStorage.setItem(`edunexus_dm_msgs_${ck2}`, JSON.stringify(msgs2));

  // Alex Johnson's conversation list
  localStorage.setItem('edunexus_dm_convs_Alex Johnson', JSON.stringify([
    { convKey:ck1, withName:'Dr. Sarah Williams', withRole:'facilitator',
      lastMsg:"Exactly right! The successor has at most one right child...",
      lastAt: Date.now() - 86400000, unread: 1 },
    { convKey:ck2, withName:'Prof. Ahmed Hassan', withRole:'facilitator',
      lastMsg:"Both, please — especially the space complexity...",
      lastAt: Date.now() - 86400000*4, unread: 1 },
  ]));

  // Dr. Sarah Williams' conversation list
  localStorage.setItem('edunexus_dm_convs_Dr. Sarah Williams', JSON.stringify([
    { convKey:ck1, withName:'Alex Johnson', withRole:'student',
      lastMsg:"So I replace the value with the successor's...", lastAt: Date.now() - 86400000*2 + 5400000, unread: 0 },
  ]));

  // Prof. Ahmed Hassan's conversation list
  localStorage.setItem('edunexus_dm_convs_Prof. Ahmed Hassan', JSON.stringify([
    { convKey:ck2, withName:'Alex Johnson', withRole:'student',
      lastMsg:"Understood! Should the complexity analysis cover worst-case...", lastAt: Date.now() - 86400000*5 + 2700000, unread: 0 },
  ]));

  localStorage.setItem('edunexus_dm_seeded', '1');
})();

/* ── Page registration ───────────────────────────────────── */
App.register('messages', c => {
  DM.render(c);
});

/* ── DM module ───────────────────────────────────────────── */
const DM = (() => {

  let _activeKey = null;
  let _searchQ   = '';

  /* ---- Storage helpers ---- */
  function _ck(a, b)     { return [a, b].sort().join('||'); }
  function _clKey(name)  { return `edunexus_dm_convs_${name}`; }
  function _msgsKey(ck)  { return `edunexus_dm_msgs_${ck}`; }
  function _myName()     { return State.currentUser()?.name || ''; }
  function _myRole()     { return State.currentRole; }

  function _loadConvs()       { return JSON.parse(localStorage.getItem(_clKey(_myName())) || '[]').sort((a,b) => b.lastAt - a.lastAt); }
  function _saveConvs(d)      { localStorage.setItem(_clKey(_myName()), JSON.stringify(d)); }
  function _loadMsgs(ck)      { return JSON.parse(localStorage.getItem(_msgsKey(ck)) || '[]'); }
  function _saveMsgs(ck, d)   { localStorage.setItem(_msgsKey(ck), JSON.stringify(d)); }

  function _relTime(ts) {
    const d = Date.now() - ts;
    if (d < 60000)    return 'Just now';
    if (d < 3600000)  return `${Math.floor(d/60000)}m ago`;
    if (d < 86400000) return `${Math.floor(d/3600000)}h ago`;
    return `${Math.floor(d/86400000)}d ago`;
  }

  function _esc(t) {
    return String(t)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\n/g,'<br>');
  }

  function _recipRole() {
    return { student:'facilitator', facilitator:'student', 'uni-admin':'facilitator' }[_myRole()] || 'user';
  }

  function _recipients() {
    const role = _myRole();
    if (role === 'student') return [
      { name:'Dr. Sarah Williams', sub:'CS · Facilitator' },
      { name:'Prof. Ahmed Hassan', sub:'CS · Facilitator' },
      { name:'Dr. Anjali Patel',   sub:'Engineering · Facilitator' },
      { name:'Dr. Linh Nguyen',    sub:'Mathematics · Facilitator' },
      { name:'Prof. James Chen',   sub:'Engineering · Facilitator' },
      { name:'Prof. Kwame Asante', sub:'Business Studies · Facilitator' },
      { name:'Dr. Yemi Adeyemo',   sub:'Medicine · Facilitator' },
    ];
    if (role === 'facilitator') {
      return State.students.map(s => ({ name: s.name, sub: `${s.dept} · Year ${s.year}` }));
    }
    if (role === 'uni-admin') {
      return State.sdStaff.slice(0, 8).map(s => ({ name: s.name, sub: `${s.dept} · Facilitator` }));
    }
    return [];
  }

  /* ---- Render helpers ---- */
  function _convCard(cv, active) {
    const badge = cv.unread > 0
      ? `<div style="background:var(--accent);color:#fff;border-radius:10px;min-width:18px;height:18px;
           font-size:.68rem;font-weight:700;display:flex;align-items:center;justify-content:center;
           padding:0 5px;flex-shrink:0">${cv.unread}</div>` : '';
    const ckEsc = cv.convKey.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return `
    <div onclick="DM.selectConv('${ckEsc}')"
      style="display:flex;gap:10px;align-items:center;padding:12px 14px;cursor:pointer;
        border-left:3px solid ${active ? 'var(--accent)' : 'transparent'};
        background:${active ? 'rgba(108,99,255,.09)' : 'transparent'};
        border-bottom:1px solid var(--border)">
      <div class="avatar" style="width:36px;height:36px;font-size:.78rem;flex-shrink:0;
        background:linear-gradient(135deg,var(--accent),var(--accent2))">
        ${Utils.initials(cv.withName)}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:${cv.unread > 0 ? '700' : '500'};font-size:.87rem;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${cv.withName}</div>
        <div style="font-size:.74rem;color:var(--text2);white-space:nowrap;overflow:hidden;
          text-overflow:ellipsis;margin-top:1px">${cv.lastMsg || 'No messages yet'}</div>
        <div style="font-size:.7rem;color:var(--text2);margin-top:2px">${_relTime(cv.lastAt)}</div>
      </div>
      ${badge}
    </div>`;
  }

  function _bubble(msg, myName) {
    const mine = msg.from === myName;
    return mine
      ? `<div style="display:flex;justify-content:flex-end;margin-bottom:10px">
          <div style="max-width:74%;background:var(--accent);color:#fff;
            border-radius:14px 14px 2px 14px;padding:10px 14px;font-size:.87rem;line-height:1.6;
            box-shadow:0 2px 10px rgba(108,99,255,.22)">
            ${_esc(msg.text)}
            <div style="font-size:.7rem;opacity:.65;text-align:right;margin-top:4px">${_relTime(msg.ts)}</div>
          </div>
        </div>`
      : `<div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:10px">
          <div class="avatar" style="width:28px;height:28px;font-size:.62rem;flex-shrink:0;
            background:linear-gradient(135deg,var(--bg3),var(--border));border:1px solid var(--border)">
            ${Utils.initials(msg.from)}</div>
          <div style="max-width:74%;background:var(--bg3);border:1px solid var(--border);
            border-radius:2px 14px 14px 14px;padding:10px 14px;font-size:.87rem;line-height:1.6">
            ${_esc(msg.text)}
            <div style="font-size:.7rem;color:var(--text2);margin-top:4px">${_relTime(msg.ts)}</div>
          </div>
        </div>`;
  }

  function _convListHTML(list) {
    if (list.length === 0) return `
      <div style="padding:28px 14px;text-align:center;color:var(--text2);font-size:.83rem;line-height:1.8">
        ${_searchQ ? 'No results.' : 'No conversations yet.<br>Tap <strong>+ New</strong> to start one.'}
      </div>`;
    return list.map(cv => _convCard(cv, cv.convKey === _activeKey)).join('');
  }

  function _emptyThread() {
    const role = _myRole();
    const who  = role === 'student' ? 'facilitators' : role === 'facilitator' ? 'students' : 'staff';
    return `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;
      justify-content:center;color:var(--text2);gap:14px;padding:30px">
      <div style="font-size:3rem">💬</div>
      <div style="font-weight:700;font-size:1rem;color:var(--text)">Your Messages</div>
      <div style="font-size:.85rem;text-align:center;max-width:240px;line-height:1.7">
        Send private messages directly to your ${who}. Everything stays private.
      </div>
      <button class="btn-sm btn-primary" onclick="DM.openNew()">Start a Conversation</button>
    </div>`;
  }

  function _threadHTML() {
    const convs = _loadConvs();
    const conv  = convs.find(c => c.convKey === _activeKey);
    if (!conv) return _emptyThread();
    const msgs   = _loadMsgs(_activeKey);
    const myName = _myName();
    return `
    <div style="padding:12px 16px;border-bottom:1px solid var(--border);
      display:flex;align-items:center;gap:12px;flex-shrink:0;background:var(--bg2)">
      <div class="avatar" style="width:38px;height:38px;font-size:.85rem;
        background:linear-gradient(135deg,var(--accent),var(--accent2))">
        ${Utils.initials(conv.withName)}</div>
      <div>
        <div style="font-weight:700;font-size:.95rem">${conv.withName}</div>
        <div style="font-size:.77rem;color:var(--text2);text-transform:capitalize">${conv.withRole}</div>
      </div>
    </div>
    <div id="dm-msgs" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column">
      ${msgs.length === 0
        ? `<div style="margin:auto;text-align:center;color:var(--text2)">No messages yet — say hello!</div>`
        : msgs.map(m => _bubble(m, myName)).join('')}
    </div>
    <div style="padding:10px 12px;border-top:1px solid var(--border);
      display:flex;gap:8px;align-items:flex-end;flex-shrink:0;background:var(--bg2)">
      <textarea id="dm-input" rows="2"
        placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();DM.send()}"
        style="flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:10px;
          padding:9px 12px;color:var(--text);outline:none;resize:none;font-family:inherit;
          font-size:.87rem;line-height:1.5;box-sizing:border-box;max-height:120px"></textarea>
      <button class="btn-sm btn-primary" onclick="DM.send()"
        style="padding:9px 18px;border-radius:10px;flex-shrink:0">Send ↗</button>
    </div>`;
  }

  /* ---- Public API ---- */
  function render(c) {
    const convs    = _loadConvs();
    const filtered = _searchQ
      ? convs.filter(cv => cv.withName.toLowerCase().includes(_searchQ.toLowerCase()))
      : convs;
    const totalUnread = convs.reduce((s, cv) => s + (cv.unread || 0), 0);

    c.innerHTML = `
    <div style="height:calc(100vh - 168px);min-height:500px;display:flex;
      border:1px solid var(--border);border-radius:12px;overflow:hidden">

      <!-- Left: conversation list -->
      <div style="width:270px;flex-shrink:0;border-right:1px solid var(--border);
        display:flex;flex-direction:column;background:var(--bg3)">
        <div style="padding:13px 14px;border-bottom:1px solid var(--border);
          display:flex;align-items:center;gap:8px">
          <div style="font-weight:700;flex:1;font-size:.95rem">
            Messages
            ${totalUnread > 0 ? `<span style="background:var(--accent);color:#fff;border-radius:10px;
              padding:1px 8px;font-size:.7rem;font-weight:700;margin-left:4px">${totalUnread}</span>` : ''}
          </div>
          <button class="btn-sm btn-primary" style="padding:4px 10px;font-size:.78rem"
            onclick="DM.openNew()">+ New</button>
        </div>
        <div style="padding:8px 10px;border-bottom:1px solid var(--border)">
          <input type="text" placeholder="🔍 Search conversations…" value="${_searchQ}"
            oninput="DM.filterConvs(this.value)"
            style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;
              padding:6px 10px;color:var(--text);outline:none;box-sizing:border-box;font-size:.81rem">
        </div>
        <div id="dm-conv-list" style="flex:1;overflow-y:auto">
          ${_convListHTML(filtered)}
        </div>
      </div>

      <!-- Right: message thread -->
      <div id="dm-thread" style="flex:1;display:flex;flex-direction:column;min-width:0;
        background:var(--bg2)">
        ${_activeKey ? _threadHTML() : _emptyThread()}
      </div>
    </div>`;

    _scrollBottom();
  }

  function _scrollBottom() {
    setTimeout(() => {
      const el = document.getElementById('dm-msgs');
      if (el) el.scrollTop = el.scrollHeight;
    }, 40);
  }

  function selectConv(convKey) {
    _activeKey = convKey;

    // Mark as read
    const convs = _loadConvs();
    const conv  = convs.find(c => c.convKey === convKey);
    if (conv) { conv.unread = 0; _saveConvs(convs); }

    // Update conv list panel (left side only)
    const listEl = document.getElementById('dm-conv-list');
    if (listEl) {
      const filtered = _searchQ
        ? convs.filter(cv => cv.withName.toLowerCase().includes(_searchQ.toLowerCase()))
        : convs;
      listEl.innerHTML = _convListHTML(filtered);
    }

    // Update thread panel (right side only)
    const threadEl = document.getElementById('dm-thread');
    if (threadEl) threadEl.innerHTML = _threadHTML();
    _scrollBottom();
  }

  function send() {
    if (!_activeKey) return;
    const input  = document.getElementById('dm-input');
    const text   = input?.value.trim();
    if (!text) return;

    const myName = _myName();
    const myRole = _myRole();
    const convs  = _loadConvs();
    const conv   = convs.find(c => c.convKey === _activeKey);
    if (!conv) return;

    // Append message
    const msgs = _loadMsgs(_activeKey);
    msgs.push({ id: Date.now(), from: myName, text, ts: Date.now() });
    _saveMsgs(_activeKey, msgs);

    // Update my conversation entry
    conv.lastMsg = text;
    conv.lastAt  = Date.now();
    conv.unread  = 0;
    _saveConvs(convs);

    // Update recipient's conversation entry
    const recipKey   = _clKey(conv.withName);
    const recipConvs = JSON.parse(localStorage.getItem(recipKey) || '[]');
    const recipConv  = recipConvs.find(c => c.convKey === _activeKey);
    if (recipConv) {
      recipConv.lastMsg = text;
      recipConv.lastAt  = Date.now();
      recipConv.unread  = (recipConv.unread || 0) + 1;
    } else {
      recipConvs.unshift({ convKey: _activeKey, withName: myName, withRole: myRole,
        lastMsg: text, lastAt: Date.now(), unread: 1 });
    }
    localStorage.setItem(recipKey, JSON.stringify(recipConvs));

    // Notify recipient (by name — loadForUser picks it up)
    Notifier.send(`💬 ${myName}`, text.slice(0, 80),
      { to: [conv.withName], type: 'message', icon: '💬' });

    // Update UI
    if (input) input.value = '';
    const threadEl = document.getElementById('dm-thread');
    if (threadEl) threadEl.innerHTML = _threadHTML();
    _scrollBottom();
  }

  function filterConvs(q) {
    _searchQ = q;
    const convs    = _loadConvs();
    const filtered = q
      ? convs.filter(cv => cv.withName.toLowerCase().includes(q.toLowerCase()))
      : convs;
    const listEl = document.getElementById('dm-conv-list');
    if (listEl) listEl.innerHTML = _convListHTML(filtered);
  }

  function openNew() {
    const people = _recipients();
    if (!people.length) { Utils.toast('No recipients available.', 'error'); return; }
    Utils.openModal('New Message', `
      <div style="margin-bottom:10px">
        <input type="text" id="nm-search" placeholder="🔍 Search by name…"
          oninput="DM._nmFilter(this.value)"
          style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;
            padding:8px 12px;color:var(--text);outline:none;box-sizing:border-box;font-size:.85rem">
      </div>
      <div id="nm-list" style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:3px">
        ${_recipientListHTML(people)}
      </div>`);
  }

  function _recipientListHTML(people) {
    return people.map(p => {
      const nameEsc = p.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      return `
      <div onclick="DM.startConv('${nameEsc}')"
        style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;
          cursor:pointer;border:1px solid transparent;transition:all .15s"
        onmouseenter="this.style.background='rgba(108,99,255,.08)';this.style.borderColor='rgba(108,99,255,.2)'"
        onmouseleave="this.style.background='transparent';this.style.borderColor='transparent'">
        <div class="avatar" style="width:34px;height:34px;font-size:.78rem;
          background:linear-gradient(135deg,var(--accent),var(--accent2))">
          ${Utils.initials(p.name)}</div>
        <div>
          <div style="font-weight:600;font-size:.9rem">${p.name}</div>
          <div style="font-size:.77rem;color:var(--text2)">${p.sub}</div>
        </div>
      </div>`;
    }).join('');
  }

  function _nmFilter(q) {
    const list = document.getElementById('nm-list');
    if (!list) return;
    const filtered = _recipients().filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
    list.innerHTML = filtered.length
      ? _recipientListHTML(filtered)
      : `<div style="text-align:center;padding:16px;color:var(--text2)">No results.</div>`;
  }

  function startConv(withName) {
    const myName  = _myName();
    const ck      = _ck(myName, withName);
    const convs   = _loadConvs();

    if (!convs.find(c => c.convKey === ck)) {
      convs.unshift({ convKey: ck, withName, withRole: _recipRole(),
        lastMsg: '', lastAt: Date.now(), unread: 0 });
      _saveConvs(convs);
    }

    Utils.closeModal();
    _activeKey = ck;
    render(document.getElementById('main-content'));
  }

  return { render, selectConv, send, filterConvs, openNew, startConv, _nmFilter };
})();
