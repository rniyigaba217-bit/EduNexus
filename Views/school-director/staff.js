App.register('sd-staff', c => {
  const staff = State.sdStaff;
  const avgSat = Math.round(staff.reduce((s, f) => s + f.satisfaction, 0) / staff.length);
  const top = staff.reduce((a, b) => a.satisfaction > b.satisfaction ? a : b);
  const atRisk = staff.filter(f => f.status === 'At Risk').length;

  const statusPill = s => s === 'Active' ? 'pill-green' : s === 'Review' ? 'pill-yellow' : 'pill-red';
  const satColor = n => n >= 85 ? 'var(--green)' : n >= 75 ? 'var(--yellow)' : 'var(--red)';

  c.innerHTML = `
  <div class="stats-grid">
    ${Utils.statCard('👨‍🏫','rgba(56,189,248,.15)',staff.length,'Total Facilitators','')}
    ${Utils.statCard('⭐','rgba(255,209,102,.15)',avgSat+'%','Avg Satisfaction Score','')}
    ${Utils.statCard('🏆','rgba(0,212,170,.15)',top.name.split(' ').slice(-1)[0],'Top Rated Facilitator','')}
    ${Utils.statCard('⚠️','rgba(255,107,107,.15)',atRisk || staff.filter(f=>f.status!=='Active').length,'Need Attention','')}
  </div>

  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div class="card-title" style="margin:0">👨‍🏫 Facilitator Overview</div>
      <button class="btn-sm" onclick="Utils.toast('Report exported','success')">📥 Export</button>
    </div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Department</th>
          <th>Students</th>
          <th>Courses</th>
          <th>Satisfaction</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${staff.map(f => `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:30px;height:30px;border-radius:50%;background:rgba(56,189,248,.2);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#38bdf8">${f.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
              <strong>${f.name}</strong>
            </div>
          </td>
          <td style="color:var(--text2);font-size:.85rem">${f.dept}</td>
          <td>${f.students}</td>
          <td>${f.courses}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:50px">${Utils.progressBar(f.satisfaction, satColor(f.satisfaction))}</div>
              <span style="color:${satColor(f.satisfaction)};font-weight:700;font-size:.85rem">${f.satisfaction}%</span>
            </div>
          </td>
          <td>${Utils.pill(f.status, statusPill(f.status))}</td>
          <td><button class="btn-sm" onclick="_sdStaffDetail('${f.name}')">View</button></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="card">
    <div class="card-title">📊 Satisfaction Distribution</div>
    ${Utils.barChart(staff.map(f => ({
      label: f.name.split(' ').slice(-1)[0],
      value: f.satisfaction,
      color: satColor(f.satisfaction),
    })))}
  </div>`;
});

function _sdStaffDetail(name) {
  const f = State.sdStaff.find(x => x.name === name);
  if (!f) return;
  const satCol = f.satisfaction >= 85 ? 'var(--green)' : f.satisfaction >= 75 ? 'var(--yellow)' : 'var(--red)';
  Utils.openModal(`👨‍🏫 ${f.name}`, `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      ${[['Department',f.dept],['Students',f.students],['Courses',f.courses],['Satisfaction',f.satisfaction+'%']].map(([l,v])=>`
      <div style="background:var(--bg2);border-radius:8px;padding:12px">
        <div style="font-size:.75rem;color:var(--text2);margin-bottom:4px">${l}</div>
        <div style="font-size:1.2rem;font-weight:700">${v}</div>
      </div>`).join('')}
    </div>
    <div style="margin-bottom:8px;font-size:.85rem;color:var(--text2)">Student Satisfaction</div>
    ${Utils.progressBar(f.satisfaction, satCol)}
    <div style="margin-top:16px;display:flex;gap:10px">
      <button class="btn-sm" style="flex:1" onclick="Utils.toast('Message sent to ${f.name}','success');Utils.closeModal()">📧 Send Message</button>
      <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Close</button>
    </div>
  `);
}
