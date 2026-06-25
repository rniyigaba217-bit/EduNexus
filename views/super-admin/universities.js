App.register('universities', c => {
  c.innerHTML = `
  <div class="section-header">
    <div>${State.universities.length} Universities on Platform</div>
    <button class="btn-sm btn-primary" onclick="UniAdmin.openAdd()">+ Register University</button>
  </div>
  <div class="card" style="overflow-x:auto">
    <table>
      <thead>
        <tr>
          <th>University</th>
          <th>Users</th>
          <th>Facilitators</th>
          <th>Departments</th>
          <th>Platform Status</th>
          <th>Admin Account</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${State.universities.map(u => `
        <tr>
          <td><strong>${u.name}</strong></td>
          <td>${u.students.toLocaleString()}</td>
          <td>${u.facilitators}</td>
          <td>${u.depts}</td>
          <td>${Utils.pill(u.status, u.status === 'Active' ? 'pill-green' : 'pill-yellow')}</td>
          <td style="color:var(--text2);font-size:.83rem">${u.admin}</td>
          <td>
            <button class="btn-sm btn-secondary" onclick="UniAdmin.viewDetails('${u.name}')">Details</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
});

const UniAdmin = (() => {
  function openAdd() {
    Utils.openModal('Add University', `
      <div class="form-group"><label>University Name</label><input type="text" id="uni-n" placeholder="University of..."></div>
      <div class="form-group"><label>Admin Name</label><input type="text" id="uni-a" placeholder="Prof. ..."></div>
      <div class="form-group"><label>Admin Email</label><input type="email" id="uni-e" placeholder="admin@uni.edu"></div>
      <div style="display:flex;gap:10px;margin-top:4px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-primary"   style="flex:1" onclick="UniAdmin.save()">Add University</button>
      </div>`);
  }
  function save() {
    const name = document.getElementById('uni-n')?.value.trim();
    if (!name) { Utils.toast('Please enter a name', 'error'); return; }
    State.universities.push({ name, students: 0, facilitators: 0, depts: 0, avg: 'N/A', status: 'Active', admin: document.getElementById('uni-a').value });
    SysLog.write('account_create', `University registered: ${name}`, 'info');
    Utils.closeModal();
    App.navigate('universities');
    Utils.toast(`${name} registered!`, 'success');
  }

  function viewDetails(name) {
    const u = State.universities.find(x => x.name === name);
    if (!u) return;
    Utils.openModal(`${u.name}`, `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[
          ['Users enrolled', u.students.toLocaleString()],
          ['Facilitators',   u.facilitators],
          ['Departments',    u.depts],
          ['Platform status',u.status],
          ['Admin account',  u.admin],
        ].map(([l, v]) => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="color:var(--text2);font-size:.87rem">${l}</span>
          <span style="font-weight:600">${v}</span>
        </div>`).join('')}
      </div>
      <button class="btn-sm btn-secondary" style="width:100%;margin-top:14px" onclick="Utils.closeModal()">Close</button>
    `);
  }

  return { openAdd, save, viewDetails };
})();
