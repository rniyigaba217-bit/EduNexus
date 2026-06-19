App.register('departments', c => {
  c.innerHTML = `<div class="grid-3">
    ${[['💻 Computer Science',1240,'16 courses',82,'var(--accent)'],['⚙️ Engineering',980,'14 courses',78,'var(--blue)'],['📐 Mathematics',620,'10 courses',74,'var(--yellow)'],['💊 Medicine',480,'22 courses',88,'var(--green)'],['📈 Business',740,'12 courses',80,'var(--accent2)'],['🎨 Arts',380,'8 courses',71,'var(--purple)']].map(([n,s,c,g,col])=>`
    <div class="card">
      <div style="font-size:1.5rem;margin-bottom:10px">${n.split(' ')[0]}</div>
      <div style="font-weight:700;font-size:1rem;margin-bottom:12px">${n.slice(2)}</div>
      <div style="font-size:.83rem;color:var(--text2)">👥 ${s} students</div>
      <div style="font-size:.83rem;color:var(--text2);margin-bottom:8px">📚 ${c}</div>
      ${Utils.progressBar(g, col)}
      <div style="color:${col};font-weight:700;margin-top:4px">${g}% avg</div>
    </div>`).join('')}
  </div>`;
});
