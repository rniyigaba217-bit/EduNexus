function _superDash(c) {
  c.innerHTML = `
  <div class="stats-grid">
    ${Utils.statCard('🏫','rgba(108,99,255,.15)','24','Universities','↑ 2 new','up')}
    ${Utils.statCard('👥','rgba(0,212,170,.15)','84,219','Total Students','↑ 6.1%','up')}
    ${Utils.statCard('👨‍🏫','rgba(255,209,102,.15)','3,841','Facilitators','')}
    ${Utils.statCard('⚠️','rgba(255,107,107,.15)','7','Flagged Issues','Needs review','down')}
  </div>
  <div class="grid-2">
    <div class="card">
      <div class="card-title">🏫 Top Universities</div>
      ${[['Univ. of Technology','88%',1],['State Medical Univ.','85%',2],['Natl. Eng. Univ.','82%',3],['Arts & Sciences','79%',4],['Business School','77%',5]].map(([n,v,r])=>`
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="width:24px;height:24px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:var(--text2)">${r}</div>
        <div style="flex:1;font-size:.87rem">${n}</div>
        <div style="font-weight:700;color:var(--green)">${v}</div>
      </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-title">🌐 Platform Usage</div>
      ${[['Daily Active Users','12,841','var(--accent)','↑ 8%'],['Exams Taken This Month','4,219','var(--green)','↑ 12%'],['Materials Uploaded','8,341','var(--blue)','↑ 3%'],['AI Advisor Sessions','24,100','var(--purple)','↑ 22%']].map(([l,v,col,ch])=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:.85rem;color:var(--text2)">${l}</span>
        <span style="font-weight:700;color:${col}">${v} <span style="font-size:.75rem;color:var(--green)">${ch}</span></span>
      </div>`).join('')}
    </div>
  </div>`;
}
