App.register('trends', c => {
  c.innerHTML = `
  <div class="grid-2">
    <div class="card"><div class="card-title">📈 National GPA Trend (5 Years)</div>
      ${Utils.barChart([{label:'2021',value:71},{label:'2022',value:73},{label:'2023',value:75},{label:'2024',value:77},{label:'2025',value:79},{label:'2026',value:80}].map(d=>({...d,color:'var(--accent)'})))}
    </div>
    <div class="card"><div class="card-title">🎓 Enrollment Growth</div>
      ${Utils.barChart([{label:'2021',value:60},{label:'2022',value:66},{label:'2023',value:72},{label:'2024',value:78},{label:'2025',value:82},{label:'2026',value:84}].map(d=>({...d,color:'var(--accent2)'})))}
    </div>
  </div>
  <div class="grid-3">
    ${[['🎓 Graduation Rate','91.2%','↑ from 87.4% in 2021','var(--green)'],['📉 Dropout Rate','4.2%','↓ from 7.8% in 2021','var(--accent2)'],['🤖 AI Advisor Usage','62%','of students use it weekly','var(--accent)']].map(([t,v,d,col])=>`
    <div class="card"><div class="card-title">${t}</div><div style="font-size:2rem;font-weight:800;color:${col};margin:8px 0">${v}</div><div style="font-size:.83rem;color:var(--text2)">${d}</div></div>`).join('')}
  </div>`;
});
