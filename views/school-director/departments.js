App.register('sd-departments', c => {
  const depts = State.sdDepartments;
  const totalStudents = depts.reduce((s, d) => s + d.students, 0);
  const totalStaff = depts.reduce((s, d) => s + d.staff, 0);
  const best = depts.reduce((a, b) => a.passRate > b.passRate ? a : b);
  const worst = depts.reduce((a, b) => a.passRate < b.passRate ? a : b);

  const statusPill = s => s === 'Active' ? 'pill-green' : s === 'Watch' ? 'pill-yellow' : 'pill-red';

  c.innerHTML = `
  <div class="stats-grid">
    ${Utils.statCard('🏛️','rgba(56,189,248,.15)','12','Total Departments','')}
    ${Utils.statCard('👥','rgba(56,189,248,.12)',totalStudents.toLocaleString(),'Enrolled Students','')}
    ${Utils.statCard('👨‍🏫','rgba(0,212,170,.15)',totalStaff,'Total Faculty','')}
    ${Utils.statCard('🏆','rgba(0,212,170,.15)',best.passRate+'%','Best Pass Rate · '+best.name.split(' ')[0],'')}
  </div>

  <div class="card">
    <div class="card-title" style="margin-bottom:16px">🏛️ All Departments — Performance Overview</div>
    <table>
      <thead>
        <tr>
          <th>Department</th>
          <th>Students</th>
          <th>Faculty</th>
          <th>Pass Rate</th>
          <th>Trend</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${depts.map(d => {
          const col = d.passRate >= 80 ? 'var(--green)' : d.passRate >= 70 ? 'var(--yellow)' : 'var(--red)';
          const trendCol = d.trend.startsWith('+') ? 'var(--green)' : 'var(--red)';
          return `
          <tr>
            <td><strong>${d.name}</strong></td>
            <td>${d.students.toLocaleString()}</td>
            <td>${d.staff}</td>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:60px">${Utils.progressBar(d.passRate, col)}</div>
                <span style="color:${col};font-weight:700;font-size:.85rem">${d.passRate}%</span>
              </div>
            </td>
            <td style="color:${trendCol};font-weight:600">${d.trend}</td>
            <td>${Utils.pill(d.status, statusPill(d.status))}</td>
            <td><button class="btn-sm" onclick="_sdDeptDetail('${d.name}')">Details</button></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">📊 Pass Rate Comparison</div>
      ${Utils.barChart(depts.map(d => ({
        label: d.name.split(' ')[0],
        value: d.passRate,
        color: d.passRate >= 80 ? 'var(--green)' : d.passRate >= 70 ? 'var(--yellow)' : 'var(--red)',
      })))}
    </div>
    <div class="card">
      <div class="card-title">⚠️ Departments Needing Attention</div>
      ${depts.filter(d => d.status !== 'Active').length === 0
        ? Utils.empty('All departments performing well')
        : depts.filter(d => d.status !== 'Active').map(d => `
        <div style="padding:12px;margin-bottom:10px;background:rgba(255,107,107,.07);border:1px solid rgba(255,107,107,.2);border-radius:8px">
          <div style="font-weight:700;margin-bottom:4px">${d.name} ${Utils.pill(d.status, statusPill(d.status))}</div>
          <div style="font-size:.82rem;color:var(--text2)">Pass rate: ${d.passRate}% · ${d.students} students · ${d.staff} faculty</div>
          <div style="font-size:.8rem;color:var(--red);margin-top:4px">Trend: ${d.trend} — intervention recommended</div>
        </div>`).join('')}
    </div>
  </div>`;
});

function _sdDeptDetail(name) {
  const d = State.sdDepartments.find(x => x.name === name);
  if (!d) return;
  const col = d.passRate >= 80 ? 'var(--green)' : d.passRate >= 70 ? 'var(--yellow)' : 'var(--red)';
  Utils.openModal(`🏛️ ${d.name}`, `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      ${[['Students',d.students.toLocaleString()],['Faculty',d.staff],['Pass Rate',d.passRate+'%'],['Trend',d.trend]].map(([l,v])=>`
      <div style="background:var(--bg2);border-radius:8px;padding:12px">
        <div style="font-size:.75rem;color:var(--text2);margin-bottom:4px">${l}</div>
        <div style="font-size:1.2rem;font-weight:700">${v}</div>
      </div>`).join('')}
    </div>
    <div style="margin-bottom:8px;font-size:.85rem;color:var(--text2)">Pass Rate</div>
    ${Utils.progressBar(d.passRate, col)}
    <div style="margin-top:16px;font-size:.85rem;color:var(--text2)">Status: <strong style="color:${d.status === 'Active' ? 'var(--green)' : d.status === 'Watch' ? 'var(--yellow)' : 'var(--red)'}">${d.status}</strong></div>
  `);
}
