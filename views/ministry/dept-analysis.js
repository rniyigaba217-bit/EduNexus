App.register('dept-analysis', c => {
  const DEPTS = [
    { name:'Computer Science',    students:18420, pass:82, trend:+1.8, schools:4, col:'var(--green)',   status:'Strong'       },
    { name:'Medicine & Health',   students: 8240, pass:88, trend:+2.6, schools:3, col:'var(--accent2)', status:'Strong'       },
    { name:'Engineering',         students:14210, pass:79, trend:-0.3, schools:3, col:'var(--blue)',    status:'Satisfactory' },
    { name:'Business Studies',    students:12840, pass:80, trend:+0.5, schools:4, col:'var(--yellow)',  status:'Satisfactory' },
    { name:'Mathematics',         students: 6410, pass:74, trend:-1.4, schools:5, col:'var(--yellow)',  status:'Watch'        },
    { name:'Arts & Humanities',   students: 5840, pass:71, trend:-1.8, schools:3, col:'var(--red)',     status:'Needs Support'},
    { name:'Law',                 students: 4210, pass:77, trend:+0.2, schools:2, col:'var(--blue)',    status:'Satisfactory' },
    { name:'Education',           students: 3840, pass:84, trend:+1.1, schools:3, col:'var(--green)',   status:'Strong'       },
  ];

  const statPill = { 'Strong':'pill-green', 'Satisfactory':'pill-blue', 'Watch':'pill-yellow', 'Needs Support':'pill-red' };

  c.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px">
    <div>
      <div style="font-weight:700;font-size:.97rem">🏛️ Performance by Department — National</div>
      <div style="font-size:.82rem;color:var(--text2);margin-top:2px">
        Aggregated across all institutions · Click a department to explore schools offering it
      </div>
    </div>
    <div style="display:flex;gap:6px">
      ${Utils.pill('National Avg: 79%','pill-blue')}
    </div>
  </div>

  <div class="card">
    <table>
      <thead><tr>
        <th>Department</th><th>National Students</th><th>Pass Rate</th>
        <th>Year-on-Year</th><th>Institutions</th><th>Status</th>
      </tr></thead>
      <tbody>
        ${DEPTS.map(d => {
          const tc = d.trend >= 0 ? 'var(--green)' : 'var(--red)';
          return `
          <tr style="cursor:pointer;transition:.15s"
            onclick="App.navigate('course-analysis')"
            onmouseenter="this.style.background='rgba(108,99,255,.06)'"
            onmouseleave="this.style.background=''">
            <td style="font-weight:700">${d.name}</td>
            <td>${d.students.toLocaleString()}</td>
            <td>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:100px">${Utils.progressBar(d.pass, d.col)}</div>
                <span style="color:${d.col};font-weight:700">${d.pass}%</span>
              </div>
            </td>
            <td style="color:${tc};font-weight:600">${d.trend>=0?'+':''}${d.trend}%</td>
            <td style="color:var(--text2)">${d.schools} schools</td>
            <td>${Utils.pill(d.status, statPill[d.status])}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;
});
