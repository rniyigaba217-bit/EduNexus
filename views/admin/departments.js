App.register('departments', c => {
  const depts = [
    { icon:'💻', name:'Computer Science', students:1240, staff:28, courses:16, status:'Active' },
    { icon:'⚙️', name:'Engineering',      students:980,  staff:24, courses:14, status:'Active' },
    { icon:'📐', name:'Mathematics',      students:620,  staff:18, courses:10, status:'Under Review' },
    { icon:'💊', name:'Medicine',         students:480,  staff:22, courses:22, status:'Active' },
    { icon:'📈', name:'Business Studies', students:740,  staff:20, courses:12, status:'Active' },
    { icon:'🎨', name:'Arts & Humanities',students:380,  staff:16, courses:8,  status:'Active' },
  ];

  c.innerHTML = `
  <div class="section-header">
    <span style="color:var(--text2);font-size:.87rem">${depts.length} departments registered</span>
    <button class="btn-sm btn-primary" onclick="AdminDepts.openAdd()">+ Add Department</button>
  </div>
  <div class="grid-3">
    ${depts.map(d => `
    <div class="card" style="display:flex;flex-direction:column;gap:0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="font-size:1.8rem">${d.icon}</div>
        ${Utils.pill(d.status, d.status === 'Active' ? 'pill-green' : d.status === 'Under Review' ? 'pill-yellow' : 'pill-red')}
      </div>
      <div style="font-weight:700;font-size:.97rem;margin-bottom:14px">${d.name}</div>
      <div style="display:flex;flex-direction:column;gap:7px;flex:1">
        ${[
          ['👥','Enrolled Students', d.students.toLocaleString()],
          ['👨‍🏫','Teaching Staff',    d.staff],
          ['📚','Courses Offered',   d.courses],
        ].map(([ico, label, val]) => `
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:.83rem">
          <span style="color:var(--text2)">${ico} ${label}</span>
          <span style="font-weight:700">${val}</span>
        </div>`).join('')}
      </div>
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);display:flex;gap:8px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="AdminDepts.view('${d.name}')">Details</button>
        <button class="btn-sm btn-primary" style="flex:1" onclick="AdminDepts.edit('${d.name}')">Manage</button>
      </div>
    </div>`).join('')}
  </div>`;
});

const AdminDepts = (() => {

  function view(name) {
    const depts = [
      { icon:'💻', name:'Computer Science', students:1240, staff:28, courses:16, status:'Active',
        hod:'Prof. Sarah Williams', budget:'$420,000', rooms:8 },
      { icon:'⚙️', name:'Engineering',      students:980,  staff:24, courses:14, status:'Active',
        hod:'Dr. James Chen',       budget:'$380,000', rooms:7 },
      { icon:'📐', name:'Mathematics',      students:620,  staff:18, courses:10, status:'Under Review',
        hod:'Prof. Linh Nguyen',    budget:'$210,000', rooms:5 },
      { icon:'💊', name:'Medicine',         students:480,  staff:22, courses:22, status:'Active',
        hod:'Dr. Yemi Adeyemo',     budget:'$650,000', rooms:12 },
      { icon:'📈', name:'Business Studies', students:740,  staff:20, courses:12, status:'Active',
        hod:'Prof. Kwame Asante',   budget:'$290,000', rooms:6 },
      { icon:'🎨', name:'Arts & Humanities',students:380,  staff:16, courses:8,  status:'Active',
        hod:'Prof. Rita Okafor',    budget:'$175,000', rooms:4 },
    ];
    const d = depts.find(x => x.name === name);
    if (!d) return;
    const ratio = (d.students / d.staff).toFixed(1);
    Utils.openModal(`${d.icon} ${d.name}`, `
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
        ${[
          ['Head of Department', d.hod],
          ['Status',             d.status],
          ['Enrolled Students',  d.students.toLocaleString()],
          ['Teaching Staff',     d.staff],
          ['Student:Staff Ratio',`${ratio}:1`],
          ['Courses Offered',    d.courses],
          ['Annual Budget',      d.budget],
          ['Classrooms / Labs',  d.rooms],
        ].map(([l, v]) => `
        <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:.87rem">
          <span style="color:var(--text2)">${l}</span>
          <span style="font-weight:600">${v}</span>
        </div>`).join('')}
      </div>
      <button class="btn-sm btn-secondary" style="width:100%" onclick="Utils.closeModal()">Close</button>`);
  }

  function edit(name) {
    Utils.openModal(`Manage — ${name}`, `
      <div style="color:var(--text2);font-size:.87rem;text-align:center;padding:12px 0">
        Department management settings coming soon.
      </div>
      <button class="btn-sm btn-secondary" style="width:100%;margin-top:10px" onclick="Utils.closeModal()">Close</button>`);
  }

  function openAdd() {
    Utils.openModal('Add Department', `
      <div class="form-group"><label>Department Name</label>
        <input type="text" id="dept-name" placeholder="e.g. Environmental Science" autocomplete="off">
      </div>
      <div class="grid-2">
        <div class="form-group"><label>Head of Department</label>
          <input type="text" id="dept-hod" placeholder="Prof. Name" autocomplete="off">
        </div>
        <div class="form-group"><label>Courses Offered</label>
          <input type="number" id="dept-courses" placeholder="10" min="1">
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:6px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-primary" style="flex:1" onclick="AdminDepts.save()">Create</button>
      </div>`);
  }

  function save() {
    const name = document.getElementById('dept-name')?.value.trim();
    if (!name) { Utils.toast('Enter a department name.', 'error'); return; }
    Utils.closeModal();
    Utils.toast(`Department "${name}" created.`, 'success');
    App.navigate('departments');
  }

  return { view, edit, openAdd, save };
})();
