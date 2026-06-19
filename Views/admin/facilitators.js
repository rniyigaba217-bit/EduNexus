App.register('facilitators', c => {
  const facils = DB.getAllByRole('facilitator');
  c.innerHTML = `
  <div class="section-header">
    <div>${facils.length} Facilitator${facils.length !== 1 ? 's' : ''}</div>
    <button class="btn-sm btn-primary" onclick="AdminFacilitators.openAdd()">+ Add Facilitator</button>
  </div>
  <div class="card">
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        ${facils.map(p => `
        <tr>
          <td><div style="display:flex;align-items:center;gap:10px">
            <div class="avatar" style="width:32px;height:32px;background:linear-gradient(135deg,${p.color},#0f1117);font-size:.75rem">${p.avatar}</div>
            ${p.name}
          </div></td>
          <td style="color:var(--text2);font-size:.87rem">${p.email}</td>
          <td>${p.roleLabel.split(' · ')[1] || '—'}</td>
          <td>${Utils.pill('Active','pill-green')}</td>
          <td><button class="btn-sm btn-secondary">View</button></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
});

const AdminFacilitators = (() => {

  function openAdd() {
    Utils.openModal('Add New Facilitator', `
      <div class="form-group"><label>Full Name</label>
        <input type="text" id="fac-name" placeholder="Dr. First Last" autocomplete="off">
      </div>
      <div class="form-group"><label>Email Address</label>
        <input type="email" id="fac-email" placeholder="facilitator@university.edu" autocomplete="off">
      </div>
      <div class="form-group"><label>Department</label>
        <select id="fac-dept">
          <option>Computer Science</option>
          <option>Engineering</option>
          <option>Mathematics</option>
          <option>Business</option>
          <option>Medicine</option>
          <option>Arts &amp; Sciences</option>
        </select>
      </div>
      <div style="display:flex;gap:10px;margin-top:6px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-primary"   style="flex:1" onclick="AdminFacilitators.save()">Create Account</button>
      </div>`);
  }

  async function save() {
    const name  = document.getElementById('fac-name')?.value.trim();
    const email = document.getElementById('fac-email')?.value.trim().toLowerCase();
    const dept  = document.getElementById('fac-dept')?.value;

    if (!name)                         { Utils.toast('Please enter a name', 'error'); return; }
    if (!email || !email.includes('@')) { Utils.toast('Please enter a valid email', 'error'); return; }
    if (DB.findByEmail(email))          { Utils.toast('An account with this email already exists', 'error'); return; }

    const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
    const password = DB.generatePassword();
    const profile  = {
      name,
      role:      'facilitator',
      roleLabel: `Facilitator · ${dept}`,
      uni:       State.currentUser().uni,
      avatar:    initials,
      color:     '#00d4aa',
      email,
    };

    try {
      await DB.createUser(email, password, profile);
      Utils.closeModal();
      App.navigate('facilitators');
      _showCredentials(name, email, password);
    } catch (e) {
      Utils.toast('Failed to create account: ' + e.message, 'error');
    }
  }

  function _showCredentials(name, email, password) {
    Utils.openModal('Facilitator Account Created', `
      <div style="text-align:center;margin-bottom:18px">
        <div style="font-size:2.4rem">✅</div>
        <div style="color:var(--green);font-weight:700;font-size:1.05rem;margin-top:8px">${name} can now log in</div>
        <div style="color:var(--text2);font-size:.83rem;margin-top:4px">Share these one-time credentials with the new facilitator</div>
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
