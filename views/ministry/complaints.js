App.register('complaints', c => {
  c.innerHTML = `
  <div class="stats-grid">
    ${[['Total This Month','1,204','var(--text)'],['Resolved','847','var(--green)'],['Pending','312','var(--yellow)'],['Escalated','45','var(--red)']].map(([l,v,col])=>`
    <div class="stat-card"><div class="stat-info"><div style="font-size:.82rem;color:var(--text2)">${l}</div><div class="stat-value" style="color:${col}">${v}</div></div></div>`).join('')}
  </div>
  <div class="card">
    <div class="card-title">📋 Complaints by Category & University</div>
    <table>
      <thead><tr><th>Category</th><th>Count</th><th>Top University</th><th>Trend</th><th>Priority</th></tr></thead>
      <tbody>
        ${[['Infrastructure / Equipment',384,'Southern Polytechnic','↑ 12%','pill-red'],['Teaching Quality',248,'Arts & Sciences','↓ 4%','pill-yellow'],['Course Content',198,'Natl. Engineering','→ 0%','pill-blue'],['Admin Processes',184,'State Medical','↑ 3%','pill-yellow'],['Exam Fairness',124,'University of Tech.','↓ 8%','pill-green'],['Platform Issues',66,'All Universities','↓ 22%','pill-green']].map(([cat,count,top,trend,pc])=>`
        <tr><td>${cat}</td><td><strong>${count}</strong></td><td style="color:var(--text2);font-size:.85rem">${top}</td>
          <td style="color:${trend.startsWith('↑')?'var(--red)':trend.startsWith('↓')?'var(--green)':'var(--text2)'}">${trend}</td>
          <td>${Utils.pill('Priority',pc)}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>`;
});
