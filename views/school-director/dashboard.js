function _schoolDirectorDash(c) {
  const depts = State.sdDepartments;
  const themes = State.sdReviewThemes.slice(0, 3);
  const atRisk = depts.filter(d => d.status === 'At Risk').length;
  const avgPass = Math.round(depts.reduce((s, d) => s + d.passRate, 0) / depts.length);

  const themeColor = s => s === 'positive' ? 'var(--green)' : s === 'negative' ? 'var(--red)' : 'var(--yellow)';

  c.innerHTML = `
  <div style="background:linear-gradient(135deg,rgba(56,189,248,.12),rgba(56,189,248,.03));border:1px solid rgba(56,189,248,.25);border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:14px">
    <div style="font-size:1.8rem">🏫</div>
    <div>
      <div style="font-weight:700;font-size:1rem">University of Technology — Director's Dashboard</div>
      <div style="font-size:.83rem;color:var(--text2);margin-top:2px">Dr. Fatima Osei · Academic Year 2024/25 · Term 2</div>
    </div>
    ${atRisk > 0 ? `<div style="margin-left:auto;background:rgba(255,107,107,.15);border:1px solid rgba(255,107,107,.3);border-radius:8px;padding:8px 14px;font-size:.82rem;color:var(--red);font-weight:600">⚠️ ${atRisk} dept${atRisk > 1 ? 's' : ''} need attention</div>` : ''}
  </div>

  <div class="stats-grid">
    ${Utils.statCard('👥','rgba(56,189,248,.15)','4,821','Total Students','↑ 3.2% vs last term','up')}
    ${Utils.statCard('🏛️','rgba(56,189,248,.12)','12','Departments','')}
    ${Utils.statCard('🎓','rgba(0,212,170,.15)',avgPass+'%','School Pass Rate','↑ 1.4%','up')}
    ${Utils.statCard('⭐','rgba(255,209,102,.15)','4.1 / 5','Avg Review Score','↓ 0.1','down')}
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">🏛️ Performance by Department</div>
      ${depts.map(d => {
        const col = d.passRate >= 80 ? 'var(--green)' : d.passRate >= 70 ? 'var(--yellow)' : 'var(--red)';
        return `
        <div style="margin-top:10px">
          <div style="display:flex;justify-content:space-between;font-size:.83rem;margin-bottom:4px">
            <span style="color:var(--text2)">${d.name}</span>
            <span style="color:${col};font-weight:700">${d.passRate}% <span style="font-size:.75rem;color:${d.trend.startsWith('+') ? 'var(--green)' : 'var(--red)'}">${d.trend}</span></span>
          </div>
          ${Utils.progressBar(d.passRate, col)}
        </div>`;
      }).join('')}
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="card">
        <div class="card-title">📋 Top Review Themes</div>
        ${themes.map(t => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
          <div style="flex:1">
            <div style="font-size:.85rem;font-weight:600">${t.theme}</div>
            <div style="font-size:.75rem;color:var(--text2)">${t.count} mentions · ${t.trend} trending</div>
          </div>
          <div style="font-size:.8rem;font-weight:700;color:${themeColor(t.sentiment)}">${t.pct}%</div>
        </div>`).join('')}
        <div style="margin-top:10px"><button class="btn-sm" onclick="App.navigate('sd-reviews')" style="width:100%;background:rgba(56,189,248,.1);color:#38bdf8;border:1px solid rgba(56,189,248,.3)">View full review breakdown →</button></div>
      </div>

      <div class="card">
        <div class="card-title">⚡ Action Items</div>
        ${[
          ['var(--red)',    '🔴', 'Arts & Humanities pass rate below threshold (71%)'],
          ['var(--yellow)', '🟡', 'Admin support complaints up 11% this month'],
          ['var(--yellow)', '🟡', 'Prof. Okafor satisfaction score needs follow-up'],
          ['var(--green)',  '🟢', 'Medicine dept. up 3% — share best practices'],
        ].map(([c2, ic, msg]) => `
        <div style="display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);font-size:.82rem">
          <span>${ic}</span><span style="color:var(--text2)">${msg}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}
