App.register('admins', c => {
  const admins = DB.getAllByRole('uni-admin');
  c.innerHTML = `
  <div class="section-header">
    <div>${admins.length} University Admin${admins.length !== 1 ? 's' : ''}</div>
    <button class="btn-sm btn-primary" onclick="SuperAdmins.openAdd()">+ Add Admin</button>
  </div>
  <div class="card">
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>University</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        ${admins.map(p => `
        <tr>
          <td><div style="display:flex;align-items:center;gap:10px">
            <div class="avatar" style="width:32px;height:32px;background:linear-gradient(135deg,${p.color},#0f1117);font-size:.75rem">${p.avatar}</div>
            ${p.name}
          </div></td>
          <td style="color:var(--text2);font-size:.87rem">${p.email}</td>
          <td>${p.uni}</td>
          <td>${Utils.pill('Active','pill-green')}</td>
          <td><button class="btn-sm btn-secondary">View</button></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
});

const SuperAdmins = (() => {

  function openAdd() {
    const unis = State.universities.map(u => `<option value="${u.name}">${u.name}</option>`).join('');
    Utils.openModal('Create University Admin', `
      <div class="form-group"><label>Full Name</label>
        <input type="text" id="sa-name" placeholder="Prof. First Last" autocomplete="off">
      </div>
      <div class="form-group"><label>Email Address</label>
        <input type="email" id="sa-email" placeholder="admin@university.edu" autocomplete="off">
      </div>
      <div class="form-group"><label>Assign to University</label>
        <select id="sa-uni">${unis}</select>
      </div>
      <div style="display:flex;gap:10px;margin-top:6px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-primary"   style="flex:1" onclick="SuperAdmins.save()">Create Account</button>
      </div>`);
  }

  async function save() {
    const name  = document.getElementById('sa-name')?.value.trim();
    const email = document.getElementById('sa-email')?.value.trim().toLowerCase();
    const uni   = document.getElementById('sa-uni')?.value;

    if (!name)                         { Utils.toast('Please enter a name', 'error'); return; }
    if (!email || !email.includes('@')) { Utils.toast('Please enter a valid email', 'error'); return; }
    if (DB.findByEmail(email))          { Utils.toast('An account with this email already exists', 'error'); return; }

    const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
    const password = DB.generatePassword();
    const profile  = {
      name,
      role:      'uni-admin',
      roleLabel: 'University Admin',
      uni,
      avatar:    initials,
      color:     '#ffd166',
      email,
    };

    try {
      await DB.createUser(email, password, profile);
      Utils.closeModal();
      App.navigate('admins');
      _showCredentials(name, email, password);
    } catch (e) {
      Utils.toast('Failed to create account: ' + e.message, 'error');
    }
  }

  function _showCredentials(name, email, password) {
    Utils.openModal('Account Created', `
      <div style="text-align:center;margin-bottom:18px">
        <div style="font-size:2.4rem">✅</div>
        <div style="color:var(--green);font-weight:700;font-size:1.05rem;margin-top:8px">${name} can now log in</div>
        <div style="color:var(--text2);font-size:.83rem;margin-top:4px">Share these one-time credentials with the new admin</div>
      </div>
      <div style="background:var(--bg2);border-radius:10px;padding:16px;border:1px solid var(--border);line-height:2">
        <div style="font-size:.9rem"><span style="color:var(--text2)">Email: </span><strong>${email}</strong></div>
        <div style="font-size:.9rem"><span style="color:var(--text2)">Password: </span>
          <strong style="color:var(--accent);font-family:monospace;font-size:1.05rem;letter-spacing:.05em">${password}</strong>
        </div>
      </div>
      <div style="color:var(--yellow);font-size:.8rem;margin-top:12px;padding:10px 12px;
                  background:rgba(255,209,102,.07);border-radius:8px;border:1px solid rgba(255,209,102,.25)">
        ⚠️ This password is shown only once — copy it before closing.
      </div>
      <button class="btn-sm btn-primary" style="width:100%;margin-top:14px" onclick="Utils.closeModal()">Done</button>`);
  }

  return { openAdd, save };
})();
