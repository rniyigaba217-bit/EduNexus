function _uniAdminDash(c) {
  c.innerHTML = `
  <div class="stats-grid">
    ${Utils.statCard('👥','rgba(108,99,255,.15)','4,821','Total Students','↑ 3.2%','up')}
    ${Utils.statCard('👨‍🏫','rgba(0,212,170,.15)','183','Facilitators','')}
    ${Utils.statCard('🏛️','rgba(255,209,102,.15)','12','Departments','')}
    ${Utils.statCard('📊','rgba(0,212,170,.15)','76.8%','Avg Pass Rate','↑ 1.4%','up')}
  </div>
  <div class="grid-2">
    <div class="card">
      <div class="card-title">🏛️ Performance by Department</div>
      ${[['Computer Science',82,'var(--green)'],['Engineering',78,'var(--blue)'],['Mathematics',74,'var(--yellow)'],['Business',80,'var(--green)'],['Medicine',88,'var(--accent2)'],['Arts',71,'var(--yellow)']].map(([n,v,col])=>`
      <div style="margin-top:10px"><div style="display:flex;justify-content:space-between;font-size:.83rem;margin-bottom:4px"><span style="color:var(--text2)">${n}</span><span style="color:${col};font-weight:700">${v}%</span></div>${Utils.progressBar(v,col)}</div>`).join('')}
    </div>
    <div class="card">
      <div class="card-title">📋 Feedback Summary</div>
      <div style="display:flex;justify-content:space-around;padding:16px 0">
        <div style="text-align:center"><div style="font-size:2rem;font-weight:800;color:var(--green)">68%</div><div style="font-size:.8rem;color:var(--text2)">Positive</div></div>
        <div style="text-align:center"><div style="font-size:2rem;font-weight:800;color:var(--yellow)">21%</div><div style="font-size:.8rem;color:var(--text2)">Neutral</div></div>
        <div style="text-align:center"><div style="font-size:2rem;font-weight:800;color:var(--red)">11%</div><div style="font-size:.8rem;color:var(--text2)">Negative</div></div>
      </div>
    </div>
  </div>`;
}
