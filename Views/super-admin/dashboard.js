function _superDash(c) {
  const log     = SysLog.get(50);
  const today   = new Date().toISOString().slice(0, 10);

  const failedToday  = log.filter(e => e.type === 'login_fail'  && e.date === today).length;
  const uploadsToday = log.filter(e => e.type === 'file_upload' && e.date === today).length;
  const warningsToday = log.filter(e => (e.level === 'warning' || e.level === 'error') && e.date === today).length;

  // Real localStorage storage meter
  let storageBytes = 0;
  for (const k in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, k)) {
      storageBytes += (localStorage.getItem(k) || '').length * 2;
    }
  }
  const storageKB  = (storageBytes / 1024).toFixed(1);
  const storagePct = Math.min(100, storageBytes / (5 * 1024 * 1024) * 100);
  const storageCol = storagePct > 75 ? 'var(--red)' : storagePct > 50 ? 'var(--yellow)' : 'var(--accent)';

  const failFeed   = log.filter(e => e.type === 'login_fail').slice(0, 6);
  const recentFeed = log.slice(0, 10);

  const lvlColor = l => l === 'error' ? 'var(--red)' : l === 'warning' ? 'var(--yellow)' : 'var(--text2)';
  const typeIcon = t => ({
    login_success: '🔓', login_fail: '🚫', file_upload: '📤',
    assignment_sub: '📋', assignment_create: '📌', attendance: '✅',
    announcement: '📢',  data_sync: '🔄',   system_error: '⚠️',
    account_create: '👤',
  }[t] || '•');

  const dataKeys = [
    ['Assignments & Submissions', ['edunexus_assignments','edunexus_submissions']],
    ['Attendance Records',        ['edunexus_attendance']],
    ['Announcements',             ['edunexus_announcements']],
    ['System Log',                ['edunexus_syslog']],
  ];

  c.innerHTML = `
  <div style="background:linear-gradient(135deg,rgba(108,99,255,.1),rgba(0,212,170,.05));border:1px solid rgba(108,99,255,.2);border-radius:12px;padding:14px 20px;margin-bottom:24px;display:flex;align-items:center;gap:14px">
    <div style="font-size:1.8rem">⚙️</div>
    <div>
      <div style="font-weight:700;font-size:1rem">EduNexus Platform — System Monitor</div>
      <div style="font-size:.83rem;color:var(--text2);margin-top:2px">
        System Administrator · ${new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
      </div>
    </div>
    <div style="margin-left:auto;display:flex;align-items:center;gap:8px">
      <div style="width:8px;height:8px;border-radius:50%;background:var(--green)"></div>
      <span style="font-size:.82rem;color:var(--green);font-weight:600">All Systems Operational</span>
    </div>
  </div>

  <div class="stats-grid" style="margin-bottom:20px">
    ${Utils.statCard('🏫','rgba(108,99,255,.15)', State.universities.length,   'Universities',        'Active on platform', 'up')}
    ${Utils.statCard('🚫','rgba(255,107,107,.15)', failedToday,                'Failed Logins Today', failedToday > 3 ? '⚠️ Review security log' : 'Normal range', failedToday > 3 ? 'down' : 'up')}
    ${Utils.statCard('📤','rgba(0,212,170,.15)',   uploadsToday,               'Uploads Today',       'Across all institutions', '')}
    ${Utils.statCard('⚠️','rgba(255,209,102,.15)', warningsToday,              'Warnings Today',      warningsToday > 0 ? 'Check system log' : 'No issues', warningsToday > 0 ? 'down' : 'up')}
  </div>

  <div class="grid-2" style="margin-bottom:20px">
    <div class="card">
      <div class="card-title">🚫 Security — Failed Login Attempts</div>
      ${failFeed.length === 0
        ? `<div style="text-align:center;padding:20px 0;color:var(--text2);font-size:.87rem">No failed login attempts recorded.</div>`
        : failFeed.map(e => `
          <div style="display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--border)">
            <div style="font-size:1rem;flex-shrink:0">${e.level === 'error' ? '🔴' : '🟡'}</div>
            <div style="flex:1">
              <div style="font-size:.85rem;font-weight:600;color:${lvlColor(e.level)}">${e.detail}</div>
              <div style="font-size:.73rem;color:var(--text2)">${e.date} · ${e.time}</div>
            </div>
          </div>`).join('')
      }
      <button class="btn-sm btn-secondary" style="width:100%;margin-top:10px"
        onclick="App.navigate('sys-log')">View Full Security Log →</button>
    </div>

    <div class="card">
      <div class="card-title">📋 Recent Platform Activity</div>
      ${recentFeed.map(e => `
      <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--border)">
        <div style="font-size:1rem;flex-shrink:0">${typeIcon(e.type)}</div>
        <div style="flex:1">
          <div style="font-size:.83rem;color:${lvlColor(e.level)}">${e.detail}</div>
          <div style="font-size:.73rem;color:var(--text2)">${e.time}</div>
        </div>
      </div>`).join('')}
      <button class="btn-sm btn-secondary" style="width:100%;margin-top:10px"
        onclick="App.navigate('sys-log')">View Full Activity Log →</button>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">💾 Platform Storage (localStorage)</div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">
        <span style="font-size:.85rem;color:var(--text2)">Used</span>
        <span style="font-weight:700">${storageKB} KB <span style="font-size:.78rem;color:var(--text2)">/ 5,120 KB</span></span>
      </div>
      ${Utils.progressBar(storagePct, storageCol)}
      <div style="font-size:.78rem;color:var(--text2);margin-top:4px;margin-bottom:16px">
        ${storagePct.toFixed(1)}% used · ${(5120 - parseFloat(storageKB)).toFixed(0)} KB free
      </div>
      <div style="display:flex;flex-direction:column;gap:7px">
        ${dataKeys.map(([label, keys]) => {
          const sz = keys.reduce((s, k) => s + ((localStorage.getItem(k) || '').length * 2), 0);
          const kb = (sz / 1024).toFixed(1);
          const pct = Math.min(100, sz / storageBytes * 100);
          return `
          <div>
            <div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:3px">
              <span style="color:var(--text2)">${label}</span>
              <span>${kb} KB</span>
            </div>
            ${Utils.progressBar(pct, 'var(--accent)')}
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-title">🌐 Platform Snapshot</div>
      ${[
        ['🏫 Active Universities',   State.universities.length,                       'var(--accent)'],
        ['🔑 Admin Accounts',        DB.getAllByRole('uni-admin').length,              'var(--green)'],
        ['👤 Events Logged (total)', SysLog.get(300).length,                         'var(--text2)'],
        ['🔴 Errors (all time)',      SysLog.get(300).filter(e=>e.level==='error').length, 'var(--red)'],
        ['🟡 Warnings (all time)',    SysLog.get(300).filter(e=>e.level==='warning').length,'var(--yellow)'],
      ].map(([l, v, col]) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:.85rem;color:var(--text2)">${l}</span>
        <span style="font-weight:700;color:${col}">${v}</span>
      </div>`).join('')}
      <button class="btn-sm btn-primary" style="width:100%;margin-top:14px" onclick="App.navigate('sys-log')">
        Open Full System Log →
      </button>
    </div>
  </div>`;
}
