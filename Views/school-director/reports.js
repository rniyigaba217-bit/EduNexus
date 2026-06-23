App.register('sd-reports', c => {
  const depts = State.sdDepartments;
  const avgPass = Math.round(depts.reduce((s, d) => s + d.passRate, 0) / depts.length);

  const semesters = [
    { label:'2023 T1', pass:72, enrollment:4490 },
    { label:'2023 T2', pass:74, enrollment:4580 },
    { label:'2023 T3', pass:73, enrollment:4610 },
    { label:'2024 T1', pass:75, enrollment:4700 },
    { label:'2024 T2', pass:77, enrollment:4780 },
    { label:'2025 T1', pass:avgPass, enrollment:4821 },
  ];

  const recommendations = [
    { priority:'High',   icon:'🔴', title:'Arts & Humanities Intervention',      body:'Pass rate dropped 2.8% this term. Recommend curriculum review and additional student support.' },
    { priority:'High',   icon:'🔴', title:'Facilities Upgrade — Engineering',     body:'215 equipment-related complaints logged. Maintenance backlog creating academic disruption.' },
    { priority:'Medium', icon:'🟡', title:'Admin Processes Streamlining',         body:'Response-time complaints up 11%. Consider digital request tracking system.' },
    { priority:'Medium', icon:'🟡', title:'Prof. Okafor Performance Support',     body:'Satisfaction score at 69%. Recommend peer mentorship and teaching development programme.' },
    { priority:'Low',    icon:'🟢', title:'Scale Medicine Department Best Practices', body:'Pass rate at 88% and trending up. Document and share strategies across departments.' },
  ];

  c.innerHTML = `
  <div style="background:linear-gradient(135deg,rgba(56,189,248,.12),rgba(56,189,248,.03));border:1px solid rgba(56,189,248,.25);border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between">
    <div style="display:flex;align-items:center;gap:14px">
      <div style="font-size:1.8rem">📊</div>
      <div>
        <div style="font-weight:700;font-size:1rem">Academic Performance Report</div>
        <div style="font-size:.83rem;color:var(--text2);margin-top:2px">University of Technology · Term 2, 2024/25 · Generated: ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</div>
      </div>
    </div>
    <button class="btn-sm" onclick="Utils.toast('Report downloaded as PDF','success')">📥 Download PDF</button>
  </div>

  <div class="stats-grid">
    ${Utils.statCard('📈','rgba(56,189,248,.15)',avgPass+'%','Current Pass Rate','↑ 4.2% vs 2023 T1','up')}
    ${Utils.statCard('👥','rgba(56,189,248,.12)','4,821','Enrolled Students','↑ 7.4% since 2023','up')}
    ${Utils.statCard('🎓','rgba(0,212,170,.15)','91.2%','Graduation Rate','↑ 0.8% YoY','up')}
    ${Utils.statCard('⭐','rgba(255,209,102,.15)','4.1 / 5','Review Score','↓ 0.1 vs last term','down')}
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">📈 Pass Rate Trend (6 Terms)</div>
      ${Utils.barChart(semesters.map(s => ({
        label: s.label,
        value: s.pass,
        color: s.pass >= 78 ? 'var(--green)' : s.pass >= 74 ? 'var(--blue)' : 'var(--yellow)',
      })))}
    </div>

    <div class="card">
      <div class="card-title">👥 Enrollment Trend</div>
      ${Utils.barChart(semesters.map(s => ({
        label: s.label,
        value: Math.round(s.enrollment / 50),
        color: 'var(--accent)',
      })))}
      <div style="font-size:.75rem;color:var(--text3);margin-top:4px;text-align:center">Values scaled (×50)</div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">🏛️ Department Summary — Term 2</div>
    <table>
      <thead>
        <tr><th>Department</th><th>Students</th><th>Pass Rate</th><th>vs Last Term</th><th>Recommendation</th></tr>
      </thead>
      <tbody>
        ${depts.map(d => {
          const col = d.passRate >= 80 ? 'var(--green)' : d.passRate >= 70 ? 'var(--yellow)' : 'var(--red)';
          const rec = d.passRate >= 80 ? Utils.pill('Maintain','pill-green') : d.passRate >= 70 ? Utils.pill('Monitor','pill-yellow') : Utils.pill('Intervene','pill-red');
          return `
          <tr>
            <td><strong>${d.name}</strong></td>
            <td>${d.students.toLocaleString()}</td>
            <td><span style="color:${col};font-weight:700">${d.passRate}%</span></td>
            <td style="color:${d.trend.startsWith('+') ? 'var(--green)' : 'var(--red)'};font-weight:600">${d.trend}</td>
            <td>${rec}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>

  <div class="card">
    <div class="card-title">💡 Recommendations & Action Plan</div>
    ${recommendations.map(r => `
    <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:1.1rem;margin-top:2px">${r.icon}</div>
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="font-size:.87rem;font-weight:700">${r.title}</span>
          ${Utils.pill(r.priority + ' Priority', r.priority === 'High' ? 'pill-red' : r.priority === 'Medium' ? 'pill-yellow' : 'pill-green')}
        </div>
        <div style="font-size:.82rem;color:var(--text2)">${r.body}</div>
      </div>
      <button class="btn-sm" style="align-self:center" onclick="Utils.toast('Action logged','success')">Log Action</button>
    </div>`).join('')}
  </div>`;
});
