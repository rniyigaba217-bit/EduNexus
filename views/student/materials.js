App.register('materials', c => {
  c.innerHTML = `
  <div class="section-header">
    <div class="tabs" style="margin-bottom:0;max-width:400px">
      <div class="tab active" onclick="Utils.switchTab(this)">All</div>
      <div class="tab" onclick="Utils.switchTab(this)">By Week</div>
      <div class="tab" onclick="Utils.switchTab(this)">By Type</div>
    </div>
  </div>
  <div style="margin-bottom:20px">
    ${State.materials.map(m => `
    <div class="material-item">
      <div class="material-icon" style="background:${m.type==='PDF'?'rgba(255,107,107,.15)':m.type==='Video'?'rgba(108,99,255,.15)':m.type==='Slides'?'rgba(255,209,102,.15)':'rgba(0,212,170,.15)'}">${m.icon}</div>
      <div class="material-info">
        <div class="material-name">${m.name}</div>
        <div class="material-meta">
          ${Utils.pill(m.type, m.type==='PDF'?'pill-red':m.type==='Video'?'pill-accent':m.type==='Slides'?'pill-yellow':'pill-green')}
          ${m.size} · Uploaded ${m.date} · ${m.week}
        </div>
      </div>
      <div class="material-actions">
        <button class="btn-sm btn-primary">⬇ Download</button>
      </div>
    </div>`).join('')}
  </div>`;
});
