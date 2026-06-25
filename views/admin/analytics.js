App.register('analytics', c => {
  const docReqs = JSON.parse(localStorage.getItem('edunexus_doc_requests') || '[]');
  const pending    = docReqs.filter(r => r.status === 'pending').length;
  const processing = docReqs.filter(r => r.status === 'processing').length;
  const ready      = docReqs.filter(r => r.status === 'ready').length;
  const delivered  = docReqs.filter(r => r.status === 'delivered').length;
  const total      = docReqs.length;

  const logins = SysLog.getByType('login_success', 30);
  const creates = SysLog.getByType('account_create', 30);
  const uploads = SysLog.getByType('file_upload', 30);

  const recentActivity = SysLog.get(8);

  const activityIcon = { login_success:'🔐', login_fail:'🚫', file_upload:'📁',
    assignment_sub:'📌', assignment_create:'✏️', attendance:'✅',
    announcement:'📢', data_sync:'🔄', system_error:'❌', account_create:'👤' };

  c.innerHTML = `
  <div class="stats-grid" style="margin-bottom:20px">
    ${Utils.statCard('🔐','rgba(108,99,255,.15)', logins.length,  'Logins (Last 30 events)',   '', '')}
    ${Utils.statCard('👤','rgba(0,212,170,.15)',   creates.length, 'New Accounts (Last 30)',    '', '')}
    ${Utils.statCard('📁','rgba(255,209,102,.15)', uploads.length, 'File Uploads (Last 30)',    '', '')}
    ${Utils.statCard('📜','rgba(255,107,107,.15)', pending + processing, 'Doc Requests In Progress', '', pending + processing > 0 ? 'down' : 'up')}
  </div>

  <div class="grid-2" style="margin-bottom:20px">
    <div class="card">
      <div class="card-title">📊 Enrollment by Department</div>
      ${[
        { name:'Computer Science', students:1240, color:'var(--accent)' },
        { name:'Engineering',      students:980,  color:'var(--blue)' },
        { name:'Business Studies', students:740,  color:'var(--accent2)' },
        { name:'Mathematics',      students:620,  color:'var(--yellow)' },
        { name:'Medicine',         students:480,  color:'var(--green)' },
        { name:'Arts & Humanities',students:380,  color:'var(--purple)' },
      ].map(d => `
      <div style="margin-top:10px">
        <div style="display:flex;justify-content:space-between;font-size:.83rem;margin-bottom:4px">
          <span style="color:var(--text2)">${d.name}</span>
          <span style="font-weight:700">${d.students.toLocaleString()} students</span>
        </div>
        ${Utils.progressBar(Math.round(d.students / 1240 * 100), d.color)}
      </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-title">📜 Document Request Pipeline</div>
      ${total === 0
        ? `<div style="text-align:center;padding:20px 0;color:var(--text2)">No document requests yet.</div>`
        : `
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px">
        ${[
          { label:'Pending',    count:pending,    color:'var(--yellow)', pill:'pill-yellow' },
          { label:'Processing', count:processing, color:'var(--blue)',   pill:'pill-blue' },
          { label:'Ready',      count:ready,      color:'var(--green)',  pill:'pill-green' },
          { label:'Delivered',  count:delivered,  color:'var(--text2)',  pill:'' },
        ].map(s => `
        <div style="display:flex;align-items:center;gap:10px">
          <div style="flex:1;font-size:.87rem;color:var(--text2)">${s.label}</div>
          <div style="font-weight:700;min-width:24px;text-align:right">${s.count}</div>
          <div style="flex:2">${Utils.progressBar(total > 0 ? Math.round(s.count/total*100) : 0, s.color)}</div>
        </div>`).join('')}
      </div>
      <button class="btn-sm btn-primary" style="width:100%;margin-top:14px" onclick="App.navigate('doc-requests')">
        Manage Requests →
      </button>`}
    </div>
  </div>

  <div class="card">
    <div class="card-title">🕒 Recent Platform Activity</div>
    ${recentActivity.length === 0
      ? `<div style="text-align:center;padding:16px;color:var(--text2)">No activity logged yet.</div>`
      : recentActivity.map(e => `
      <div style="display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:1.1rem">${activityIcon[e.type] || '🔹'}</span>
        <div style="flex:1">
          <div style="font-size:.85rem;font-weight:600">${e.detail}</div>
          <div style="font-size:.76rem;color:var(--text2)">${Utils.formatDate(e.ts)} · ${Utils.formatTime(e.ts)}</div>
        </div>
        ${Utils.pill(e.level, e.level === 'error' ? 'pill-red' : e.level === 'warning' ? 'pill-yellow' : 'pill-green')}
      </div>`).join('')}
  </div>`;
});
