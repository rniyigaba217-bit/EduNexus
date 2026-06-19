App.register('courses', c => {
  c.innerHTML = `<div class="grid-3">
    ${State.courses.map(co => `
    <div class="card" style="cursor:pointer" onclick="App.navigate('materials')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
        ${Utils.pill(co.code,'pill-accent')}
        <div class="grade-circle" style="background:${co.grade>=85?'rgba(0,212,170,.15)':'rgba(255,209,102,.15)'};color:${Utils.gradeColor(co.grade)}">${co.grade}%</div>
      </div>
      <div style="font-weight:700;font-size:1rem;margin-bottom:4px">${co.name}</div>
      <div style="font-size:.82rem;color:var(--text2);margin-bottom:12px">${co.prof} · ${co.credits} credits</div>
      ${Utils.progressBar(co.grade, Utils.gradeColor(co.grade))}
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="event.stopPropagation();App.navigate('materials')">Materials</button>
        <button class="btn-sm btn-primary"   style="flex:1" onclick="event.stopPropagation();App.navigate('exams')">Exams</button>
      </div>
    </div>`).join('')}
  </div>`;
});
