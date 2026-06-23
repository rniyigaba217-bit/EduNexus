function _ministryDash(c) {
  c.innerHTML = `
  <div style="background:linear-gradient(135deg,rgba(108,99,255,.1),rgba(0,212,170,.05));border:1px solid rgba(108,99,255,.2);border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:14px">
    <div style="font-size:1.8rem">🏛️</div>
    <div><div style="font-weight:700;font-size:1rem">Ministry of Education — National Analytics Dashboard</div>
    <div style="font-size:.83rem;color:var(--text2);margin-top:2px">Read-only consolidated view · Last updated: Today 06:00am</div></div>
  </div>
  <div class="stats-grid">
    ${Utils.statCard('🏫','rgba(108,99,255,.15)','24','Registered Universities','')}
    ${Utils.statCard('👥','rgba(0,212,170,.15)','84,219','National Enrollment','↑ 6.1% YoY','up')}
    ${Utils.statCard('🎓','rgba(100,181,246,.15)','79.3%','National Pass Rate','↑ 1.8%','up')}
    ${Utils.statCard('📋','rgba(255,107,107,.15)','1,204','Complaints This Month','↑ 4%','down')}
  </div>
  <div class="grid-2">
    <div class="card">
      <div class="card-title">🏫 Performance by University</div>
      ${[['Univ. of Technology',88,'var(--green)'],['State Medical',85,'var(--green)'],['Natl. Engineering',82,'var(--blue)'],['Arts & Sciences',79,'var(--yellow)'],['Business School',77,'var(--yellow)'],['Southern Polytech.',71,'var(--red)']].map(([n,v,col])=>`
      <div style="margin-top:10px"><div style="display:flex;justify-content:space-between;font-size:.83rem;margin-bottom:4px"><span style="color:var(--text2)">${n}</span><span style="color:${col};font-weight:700">${v}%</span></div>${Utils.progressBar(v,col)}</div>`).join('')}
    </div>
    <div class="card">
      <div class="card-title">📋 Quick Insights</div>
      ${[['📈 Avg GPA Trend','↑ Improving','CS leads at 82% nationally','var(--green)'],['⚠️ At-Risk Students','8,421 flagged','Mainly Year 1 & Year 3','var(--yellow)'],['🎓 Graduation Rate','91.2%','↑ 0.8% vs last year','var(--green)']].map(([t,v,d,col])=>`
      <div style="padding:12px 0;border-bottom:1px solid var(--border)"><div style="font-size:.87rem;font-weight:700;margin-bottom:2px">${t}: <span style="color:${col}">${v}</span></div><div style="font-size:.8rem;color:var(--text2)">${d}</div></div>`).join('')}
    </div>
  </div>`;
}

App.register('dashboard', c => {
  const role = State.currentRole;
  if      (role === 'student')          _studentDash(c);
  else if (role === 'facilitator')      _facilDash(c);
  else if (role === 'uni-admin')        _uniAdminDash(c);
  else if (role === 'super-admin')      _superDash(c);
  else if (role === 'ministry')         _ministryDash(c);
  else if (role === 'school-director')  _schoolDirectorDash(c);
});
