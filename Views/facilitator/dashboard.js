function _facilDash(c) {
  c.innerHTML = `
  <div class="stats-grid">
    ${Utils.statCard('👥','rgba(0,212,170,.15)','247','Total Students','↑ 12 new','up')}
    ${Utils.statCard('📚','rgba(108,99,255,.15)','4','Active Courses','')}
    ${Utils.statCard('📋','rgba(255,209,102,.15)','34','Papers to Grade','Needs attention','down')}
    ${Utils.statCard('📊','rgba(100,181,246,.15)','78.2%','Class Avg Grade','')}
  </div>
  <div class="grid-2">
    <div class="card">
      <div class="card-title">📊 Class Performance by Course</div>
      ${Utils.barChart([
        {label:'DS', value:85, color:'var(--accent)'},
        {label:'Algo',value:72,color:'var(--yellow)'},
        {label:'OS', value:88, color:'var(--green)'},
        {label:'DB', value:68, color:'var(--red)'},
        {label:'Net',value:79, color:'var(--blue)'},
      ])}
    </div>
    <div class="card">
      <div class="card-title">📋 Pending Tasks</div>
      ${[
        ['Grade DS Midterm Essays','34 papers','pill-red'],
        ['Upload Week 8 Materials','Algorithms','pill-yellow'],
        ['Review anonymous feedback','12 new','pill-yellow'],
        ['Create Networks Quiz','Due next week','pill-blue'],
      ].map(([t,d,pc])=>`
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="flex:1"><div style="font-size:.87rem;font-weight:600">${t}</div><div style="font-size:.77rem;color:var(--text2)">${d}</div></div>
        <div class="pill ${pc}">Task</div>
      </div>`).join('')}
    </div>
  </div>`;
}
