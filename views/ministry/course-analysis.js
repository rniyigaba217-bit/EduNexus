App.register('course-analysis', c => {
  c.innerHTML = `
  <div class="card">
    <div class="card-title">📚 Top & Bottom Performing Courses (National)</div>
    <div class="grid-2" style="margin-bottom:0">
      <div>
        <div style="color:var(--green);font-weight:700;margin-bottom:12px;font-size:.85rem">🏆 Top Performing</div>
        ${[['Advanced Surgery','Medicine',94],['Organic Chemistry Lab','Medicine',91],['Computer Architecture','CS',90],['Clinical Pharmacology','Medicine',89],['Machine Learning','CS',88]].map(([n,d,g])=>`
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
          <div style="flex:1"><div style="font-size:.87rem;font-weight:600">${n}</div><div style="font-size:.77rem;color:var(--text2)">${d}</div></div>
          <div style="color:var(--green);font-weight:700">${g}%</div>
        </div>`).join('')}
      </div>
      <div>
        <div style="color:var(--red);font-weight:700;margin-bottom:12px;font-size:.85rem">⚠️ Needs Attention</div>
        ${[['Linear Algebra II','Mathematics',58],['Thermodynamics','Engineering',61],['Macroeconomics','Business',63],['Statistics III','Mathematics',65],['Control Systems','Engineering',67]].map(([n,d,g])=>`
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
          <div style="flex:1"><div style="font-size:.87rem;font-weight:600">${n}</div><div style="font-size:.77rem;color:var(--text2)">${d}</div></div>
          <div style="color:var(--red);font-weight:700">${g}%</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
});
