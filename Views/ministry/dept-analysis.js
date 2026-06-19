App.register('dept-analysis', c => {
  c.innerHTML = `
  <div class="card">
    <div class="card-title">🏛️ Performance by Department (National)</div>
    ${[['Computer Science',18420,82,'var(--green)'],['Medicine & Health',8240,88,'var(--accent2)'],['Engineering',14210,79,'var(--blue)'],['Business',12840,80,'var(--yellow)'],['Mathematics',6410,74,'var(--yellow)'],['Arts & Humanities',5840,71,'var(--red)'],['Law',4210,77,'var(--blue)'],['Education',3840,84,'var(--green)']].map(([n,s,g,col])=>`
    <div style="display:flex;align-items:center;gap:16px;padding:14px 0;border-bottom:1px solid var(--border)">
      <div style="flex:1"><div style="font-weight:600;margin-bottom:4px">${n}</div><div style="font-size:.8rem;color:var(--text2)">${s.toLocaleString()} students</div></div>
      <div style="width:200px">${Utils.progressBar(g,col)}</div>
      <div style="width:48px;font-weight:700;color:${col};text-align:right">${g}%</div>
    </div>`).join('')}
  </div>`;
});
