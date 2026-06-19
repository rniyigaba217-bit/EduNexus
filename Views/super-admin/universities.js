App.register('universities', c => {
  c.innerHTML = `
  <div class="section-header"><div>${State.universities.length} Universities</div><button class="btn-sm btn-primary" onclick="UniAdmin.openAdd()">+ Add University</button></div>
  <div class="card"><table>
    <thead><tr><th>University</th><th>Students</th><th>Facilitators</th><th>Depts</th><th>Avg GPA</th><th>Status</th><th>Admin</th></tr></thead>
    <tbody>
      ${State.universities.map(u=>`
      <tr><td><strong>${u.name}</strong></td><td>${u.students.toLocaleString()}</td><td>${u.facilitators}</td><td>${u.depts}</td><td style="color:var(--green);font-weight:700">${u.avg}</td><td>${Utils.pill(u.status,'pill-green')}</td><td style="color:var(--text2);font-size:.83rem">${u.admin}</td></tr>`).join('')}
    </tbody>
  </table></div>`;
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
    if (!name) { Utils.toast('Please enter a name','error'); return; }
    State.universities.push({ name, students:0, facilitators:0, depts:0, avg:'N/A', status:'Active', admin: document.getElementById('uni-a').value });
    Utils.closeModal();
    App.navigate('universities');
    Utils.toast(`${name} added!`, 'success');
  }
  return { openAdd, save };
})();
