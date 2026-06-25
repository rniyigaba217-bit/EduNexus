const SysLogView = (() => {
  let _filter = 'all';

  function setFilter(f) {
    _filter = f;
    App.navigate('sys-log');
  }

  function getFilter() { return _filter; }

  return { setFilter, getFilter };
})();

App.register('sys-log', c => {
  const filter   = SysLogView.getFilter();
  const allEvents = SysLog.get(300);

  const FILTERS = [
    { key:'all',             label:'All Events',      icon:'📋' },
    { key:'login_fail',      label:'Failed Logins',   icon:'🚫' },
    { key:'login_success',   label:'Logins',          icon:'🔓' },
    { key:'file_upload',     label:'File Uploads',    icon:'📤' },
    { key:'assignment_sub',  label:'Submissions',     icon:'📋' },
    { key:'system_error',    label:'System Events',   icon:'⚠️' },
  ];

  const systemTypes = new Set(['system_error','data_sync','account_create','announcement','attendance','assignment_create']);

  const shown = filter === 'all'
    ? allEvents
    : filter === 'system_error'
      ? allEvents.filter(e => systemTypes.has(e.type))
      : allEvents.filter(e => e.type === filter);

  const lvlColor = l => l === 'error' ? 'var(--red)' : l === 'warning' ? 'var(--yellow)' : 'var(--text2)';
  const lvlBg    = l => l === 'error' ? 'rgba(255,107,107,.12)' : l === 'warning' ? 'rgba(255,209,102,.08)' : 'transparent';
  const typeIcon = t => ({
    login_success: '🔓', login_fail: '🚫', file_upload: '📤',
    assignment_sub: '📋', assignment_create: '📌', attendance: '✅',
    announcement: '📢', data_sync: '🔄', system_error: '⚠️', account_create: '👤',
  }[t] || '•');

  const failedTotal   = allEvents.filter(e => e.type === 'login_fail').length;
  const errorTotal    = allEvents.filter(e => e.level === 'error').length;
  const warningTotal  = allEvents.filter(e => e.level === 'warning').length;
  const today         = new Date().toISOString().slice(0, 10);
  const todayCount    = allEvents.filter(e => e.date === today).length;

  c.innerHTML = `
  <div class="stats-grid" style="margin-bottom:20px">
    ${Utils.statCard('📋','rgba(108,99,255,.15)', allEvents.length,  'Total Events',       'All time', '')}
    ${Utils.statCard('🔴','rgba(255,107,107,.15)', errorTotal,       'Errors (all time)',  '', errorTotal > 0 ? 'down' : 'up')}
    ${Utils.statCard('🟡','rgba(255,209,102,.15)', warningTotal,     'Warnings (all time)',  '', '')}
    ${Utils.statCard('📅','rgba(0,212,170,.15)',   todayCount,       'Events Today',         '', 'up')}
  </div>

  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
      <div class="card-title" style="margin:0">System Audit Log</div>
      <button class="btn-sm btn-secondary" onclick="App.navigate('sys-log')" style="font-size:.78rem">↻ Refresh</button>
    </div>

    <!-- Filter Tabs -->
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
      ${FILTERS.map(f => `
      <button onclick="SysLogView.setFilter('${f.key}')"
        style="padding:5px 12px;border-radius:20px;font-size:.78rem;cursor:pointer;font-weight:600;
          background:${filter === f.key ? 'var(--accent)' : 'var(--bg3)'};
          color:${filter === f.key ? '#fff' : 'var(--text2)'};
          border:1px solid ${filter === f.key ? 'var(--accent)' : 'var(--border)'}">
        ${f.icon} ${f.label}
        <span style="font-size:.72rem;opacity:.8;margin-left:2px">(${
          f.key === 'all' ? allEvents.length
          : f.key === 'system_error' ? allEvents.filter(e => systemTypes.has(e.type)).length
          : allEvents.filter(e => e.type === f.key).length
        })</span>
      </button>`).join('')}
    </div>

    <!-- Log table -->
    ${shown.length === 0
      ? `<div style="text-align:center;padding:40px 0;color:var(--text2)">No events match this filter.</div>`
      : `<div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="font-size:.78rem;color:var(--text2);border-bottom:2px solid var(--border)">
                <th style="text-align:left;padding:6px 10px;font-weight:600">Time</th>
                <th style="text-align:left;padding:6px 10px;font-weight:600">Type</th>
                <th style="text-align:left;padding:6px 10px;font-weight:600">Detail</th>
                <th style="text-align:left;padding:6px 10px;font-weight:600">Level</th>
              </tr>
            </thead>
            <tbody>
              ${shown.map(e => `
              <tr style="border-bottom:1px solid var(--border);background:${lvlBg(e.level)};font-size:.83rem">
                <td style="padding:8px 10px;white-space:nowrap;color:var(--text2)">${e.date}<br><span style="font-size:.73rem">${e.time}</span></td>
                <td style="padding:8px 10px;white-space:nowrap">${typeIcon(e.type)} <span style="font-size:.78rem;color:var(--text2)">${e.type.replace(/_/g,' ')}</span></td>
                <td style="padding:8px 10px;color:${lvlColor(e.level)};line-height:1.5">${e.detail}</td>
                <td style="padding:8px 10px">
                  <span style="padding:2px 8px;border-radius:10px;font-size:.75rem;font-weight:700;
                    background:${e.level === 'error' ? 'rgba(255,107,107,.2)' : e.level === 'warning' ? 'rgba(255,209,102,.15)' : 'rgba(0,212,170,.1)'};
                    color:${lvlColor(e.level)}">
                    ${e.level}
                  </span>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`
    }
  </div>`;
});
