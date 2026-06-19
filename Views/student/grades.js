App.register('grades', c => {
  c.innerHTML = `
  <div class="stats-grid">
    ${[
      ['Overall GPA','83.4%','var(--green)','↑ 2.1%'],
      ['Best Course','OS · 91%','var(--accent2)',''],
      ['Needs Work','DB · 70%','var(--yellow)',''],
      ['Rank','#41 / 247','var(--blue)',''],
    ].map(([l,v,col,ch]) => `
    <div class="stat-card"><div class="stat-info">
      <div style="font-size:.82rem;color:var(--text2);margin-bottom:4px">${l}</div>
      <div class="stat-value" style="color:${col};font-size:1.3rem">${v}</div>
      ${ch ? `<div class="stat-change up">${ch}</div>` : ''}
    </div></div>`).join('')}
  </div>
  <div class="card">
    <div class="card-title">📊 Detailed Grade Breakdown</div>
    <table>
      <thead><tr><th>Course</th><th>Code</th><th>Quizzes</th><th>Midterm</th><th>Final</th><th>Assignments</th><th>Overall</th><th>Grade</th></tr></thead>
      <tbody>
        ${[
          ['Data Structures','CS301',90,85,88,92,88],
          ['Algorithms',     'CS302',72,80,70,78,76],
          ['Operating Sys.', 'CS303',95,90,91,88,91],
          ['Database Systems','CS304',68,72,70,69,70],
          ['Networks',       'CS305',80,85,80,84,82],
          ['Software Eng.',  'CS306',88,83,87,82,85],
        ].map(([n,code,q,m,f,a,o]) => `
        <tr>
          <td>${n}</td>
          <td>${Utils.pill(code,'pill-accent')}</td>
          <td>${q}%</td><td>${m}%</td><td>${f}%</td><td>${a}%</td>
          <td><strong>${o}%</strong></td>
          <td>${Utils.pill(Utils.letterGrade(o), Utils.gradePill(o))}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
});
