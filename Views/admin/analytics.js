App.register('analytics', c => {
  c.innerHTML = `
  <div class="stats-grid">
    ${[['Pass Rate','76.8%','var(--green)'],['Dropout Rate','4.2%','var(--red)'],['Avg GPA','78.3%','var(--blue)'],['Satisfaction','4.1/5','var(--yellow)']].map(([l,v,col])=>`
    <div class="stat-card"><div class="stat-info"><div style="font-size:.82rem;color:var(--text2)">${l}</div><div class="stat-value" style="color:${col}">${v}</div></div></div>`).join('')}
  </div>
  <div class="grid-2">
    <div class="card"><div class="card-title">📈 Monthly Performance Trend</div>
      ${Utils.barChart([72,74,71,76,78,80,79,82].map((v,i)=>({label:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'][i],value:v,color:'var(--accent)'})))}
    </div>
    <div class="card"><div class="card-title">⚠️ At-Risk Students by Dept</div>
      ${[['Computer Science',18,'var(--yellow)'],['Mathematics',34,'var(--red)'],['Engineering',12,'var(--yellow)'],['Business',8,'var(--blue)'],['Arts',21,'var(--red)']].map(([n,v,col])=>`
      <div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:.83rem;margin-bottom:4px"><span style="color:var(--text2)">${n}</span><span style="color:${col};font-weight:700">${v} students</span></div>${Utils.progressBar(v*2.5,col)}</div>`).join('')}
    </div>
  </div>`;
});
