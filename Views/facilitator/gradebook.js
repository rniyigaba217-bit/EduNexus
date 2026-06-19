App.register('gradebook', c => {
  c.innerHTML = `
  <div class="section-header">
    <div class="tabs" style="margin-bottom:0;max-width:360px">
      ${State.courses.slice(0,3).map((co,i)=>`<div class="tab ${i===0?'active':''}" onclick="Utils.switchTab(this)">${co.code}</div>`).join('')}
    </div>
    <button class="btn-sm btn-secondary" onclick="Utils.toast('CSV exported!','success')">⬇ Export CSV</button>
  </div>
  <div class="card">
    <div class="card-title">📊 Data Structures (CS301) · ${State.students.length} Students</div>
    <table>
      <thead><tr><th>Student</th><th>ID</th><th>Quiz</th><th>Midterm</th><th>Assignment</th><th>Final</th><th>Overall</th><th>Grade</th></tr></thead>
      <tbody>
        ${[
          ['Maria Santos','CS-0041',92,88,95,90,91],
          ['James Kwame','CS-0087',78,82,80,79,80],
          ['Priya Sharma','CS-0112',85,90,88,92,89],
          ['Carlos Rivera','CS-0156',65,70,72,68,69],
          ['Aisha Obi','CS-0203',95,91,94,93,93],
          ['Tom Bradley','CS-0241',58,62,65,60,61],
        ].map(([n,id,q,m,a,f,o])=>`
        <tr>
          <td>${n}</td><td style="color:var(--text2)">${id}</td>
          <td>${q}</td><td>${m}</td><td>${a}</td><td>${f}</td>
          <td><strong>${o}%</strong></td>
          <td>${Utils.pill(Utils.letterGrade(o), Utils.gradePill(o))}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
});
