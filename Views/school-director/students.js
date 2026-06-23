App.register('sd-students', c => {
  const students = State.students;
  const active  = students.filter(s => s.status === 'Active').length;
  const atRisk  = students.filter(s => s.status === 'At Risk').length;
  const avgGpa  = (students.reduce((s, x) => s + x.gpa, 0) / students.length).toFixed(1);

  const bands = [
    { label:'90–100', count: students.filter(s=>s.gpa>=90).length,  color:'var(--green)'  },
    { label:'75–89',  count: students.filter(s=>s.gpa>=75&&s.gpa<90).length, color:'var(--blue)' },
    { label:'60–74',  count: students.filter(s=>s.gpa>=60&&s.gpa<75).length, color:'var(--yellow)'},
    { label:'<60',    count: students.filter(s=>s.gpa<60).length,   color:'var(--red)'   },
  ];

  c.innerHTML = `
  <div class="stats-grid">
    ${Utils.statCard('👥','rgba(56,189,248,.15)',students.length,'Total Students','')}
    ${Utils.statCard('✅','rgba(0,212,170,.15)',active,'Active Students','')}
    ${Utils.statCard('⚠️','rgba(255,107,107,.15)',atRisk,'At-Risk Students','')}
    ${Utils.statCard('📊','rgba(255,209,102,.15)',avgGpa+'%','Average GPA','')}
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">📊 Performance Bands</div>
      ${bands.map(b => `
      <div style="display:flex;align-items:center;gap:10px;margin-top:12px">
        <div style="font-size:.82rem;color:var(--text2);width:50px">${b.label}</div>
        <div style="flex:1">${Utils.progressBar(b.count / students.length * 100, b.color)}</div>
        <div style="font-size:.85rem;font-weight:700;color:${b.color};width:20px">${b.count}</div>
      </div>`).join('')}
      <div style="margin-top:16px;padding:10px;background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.2);border-radius:8px;font-size:.82rem;color:var(--red)">
        ⚠️ ${atRisk} student${atRisk !== 1 ? 's' : ''} flagged as at-risk — early intervention advised
      </div>
    </div>

    <div class="card">
      <div class="card-title">📋 GPA Distribution by Year</div>
      ${Utils.barChart([
        { label:'Year 1', value:79, color:'var(--blue)'   },
        { label:'Year 2', value:81, color:'var(--blue)'   },
        { label:'Year 3', value:76, color:'var(--yellow)' },
        { label:'Year 4', value:84, color:'var(--green)'  },
      ])}
    </div>
  </div>

  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <div class="card-title" style="margin:0">👥 Student Directory</div>
      <div style="display:flex;gap:8px">
        ${Utils.pill('All','pill-accent')} ${Utils.pill('At Risk','pill-red')}
      </div>
    </div>
    <table>
      <thead>
        <tr><th>Name</th><th>ID</th><th>Department</th><th>Year</th><th>GPA</th><th>Status</th></tr>
      </thead>
      <tbody>
        ${students.map(s => `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td style="color:var(--text2);font-size:.83rem">${s.id}</td>
          <td style="color:var(--text2);font-size:.85rem">${s.dept}</td>
          <td>Year ${s.year}</td>
          <td><span style="color:${Utils.gradeColor(s.gpa)};font-weight:700">${s.gpa}%</span></td>
          <td>${Utils.pill(s.status, s.status === 'Active' ? 'pill-green' : 'pill-red')}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
});
