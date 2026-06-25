App.register('fac-materials', c => {
  c.innerHTML = `
  <div class="section-header">
    <div class="tabs" style="margin-bottom:0;max-width:360px">
      <div class="tab active" onclick="Utils.switchTab(this)">All</div>
      <div class="tab" onclick="Utils.switchTab(this)">By Week</div>
      <div class="tab" onclick="Utils.switchTab(this)">By Course</div>
    </div>
    <button class="btn-sm btn-primary" onclick="FacMaterials.openAdd()">+ Add Material</button>
  </div>
  <div id="fac-mat-list">
    ${_renderFacMaterials()}
  </div>`;
});

const FacMaterials = (() => {
  function _renderList() {
    const el = document.getElementById('fac-mat-list');
    if (el) el.innerHTML = _renderFacMaterials();
  }

  function openAdd() {
    Utils.openModal('Add Learning Material', `
      <div class="form-group"><label>Material Title</label><input type="text" id="mat-title" placeholder="e.g. Week 5 – Hash Tables Notes"></div>
      <div class="form-group"><label>Course</label>
        <select id="mat-course">${State.courses.map(c=>`<option value="${c.code}">${c.name} (${c.code})</option>`).join('')}</select>
      </div>
      <div class="grid-2">
        <div class="form-group"><label>Week / Module</label>
          <select id="mat-week">${[1,2,3,4,5,6,7,8,9,10,11,12].map(w=>`<option>Week ${w}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label>Type</label>
          <select id="mat-type"><option>PDF</option><option>Video</option><option>Slides</option><option>Link</option><option>Assignment</option></select>
        </div>
      </div>
      <div id="upload-zone-container"></div>
      <div style="display:flex;gap:10px;margin-top:16px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-primary"   style="flex:1" onclick="FacMaterials.save()">Upload & Save</button>
      </div>`);

    FileUpload.renderZone('upload-zone-container', result => {
      FacMaterials._pendingFile = result;
    });
  }

  function openEdit(idx) {
    const m = State.materials[idx];
    Utils.openModal('Edit Material', `
      <div class="form-group"><label>Title</label><input type="text" id="edit-title" value="${m.name}"></div>
      <div class="form-group"><label>Week</label>
        <select id="edit-week">${[1,2,3,4,5,6,7,8].map(w=>`<option ${m.week==='Week '+w?'selected':''}>Week ${w}</option>`).join('')}</select>
      </div>
      <div style="display:flex;gap:10px;margin-top:16px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-primary"   style="flex:1" onclick="FacMaterials.update(${idx})">Save Changes</button>
      </div>`);
  }

  function update(idx) {
    State.materials[idx].name = document.getElementById('edit-title').value;
    State.materials[idx].week = document.getElementById('edit-week').value;
    Utils.closeModal();
    App.navigate('fac-materials');
    Utils.toast('Material updated!', 'success');
  }

  function remove(idx) {
    Utils.confirm('Delete this material? This cannot be undone.', () => {
      State.materials.splice(idx, 1);
      App.navigate('fac-materials');
      Utils.toast('Material deleted', 'error');
    });
  }

  function save() {
    const title  = document.getElementById('mat-title')?.value.trim();
    const course = document.getElementById('mat-course')?.value;
    const week   = document.getElementById('mat-week')?.value;
    const type   = document.getElementById('mat-type')?.value;
    if (!title) { Utils.toast('Please enter a title', 'error'); return; }

    const icons = { PDF:'📄', Video:'🎥', Slides:'📑', Link:'🔗', Assignment:'📋' };
    State.addMaterial({
      icon:   icons[type] || '📄',
      name:   title,
      type,
      size:   FacMaterials._pendingFile?.size || '—',
      date:   Utils.formatDate(),
      week,
      course,
    });
    Utils.closeModal();
    App.navigate('fac-materials');
    Utils.toast('Material uploaded successfully!', 'success');
    Notifications.notifyExamScheduled(title, week);
    FacMaterials._pendingFile = null;
  }

  return { openAdd, openEdit, update, remove, save, _pendingFile: null };
})();

function _renderFacMaterials() {
  return State.materials.map((m, i) => `
  <div class="material-item">
    <div class="material-icon" style="background:${m.type==='PDF'?'rgba(255,107,107,.15)':m.type==='Video'?'rgba(108,99,255,.15)':m.type==='Slides'?'rgba(255,209,102,.15)':'rgba(0,212,170,.15)'}">${m.icon}</div>
    <div class="material-info">
      <div class="material-name">${m.name}</div>
      <div class="material-meta">${Utils.pill(m.type, m.type==='PDF'?'pill-red':m.type==='Video'?'pill-accent':m.type==='Slides'?'pill-yellow':'pill-green')} ${m.size} · ${m.date} · ${m.week} · ${m.course}</div>
    </div>
    <div class="material-actions">
      <button class="btn-sm btn-secondary" onclick="FacMaterials.openEdit(${i})">✏️ Edit</button>
      <button class="btn-sm btn-danger"    onclick="FacMaterials.remove(${i})">🗑️</button>
    </div>
  </div>`).join('');
}
