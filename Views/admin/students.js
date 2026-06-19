App.register('students', c => {
  c.innerHTML = `
  <div class="section-header">
    <input type="text" placeholder="🔍 Search students…"
           style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;
                  padding:9px 14px;color:var(--text);width:260px;outline:none">
    ${State.currentRole !== 'ministry' ? `<button class="btn-sm btn-primary" onclick="AdminStudents.openAdd()">+ Add Student</button>` : ''}
  </div>
  <div class="card">
    <table>
      <thead><tr><th>Name</th><th>ID</th><th>Department</th><th>Year</th><th>GPA</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        ${State.students.map(s => `
        <tr>
          <td><div style="display:flex;align-items:center;gap:10px">
            <div class="avatar" style="width:30px;height:30px;background:linear-gradient(135deg,var(--accent),var(--accent2));font-size:.75rem">${Utils.initials(s.name)}</div>
            ${s.name}
          </div></td>
          <td style="color:var(--text2)">${s.id}</td>
          <td>${s.dept}</td>
          <td>Year ${s.year}</td>
          <td style="color:${Utils.gradeColor(s.gpa)};font-weight:700">${s.gpa}%</td>
          <td>${Utils.pill(s.status, s.status === 'Active' ? 'pill-green' : s.status === 'At Risk' ? 'pill-red' : 'pill-yellow')}</td>
          <td><button class="btn-sm btn-secondary">View</button></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
});

const AdminStudents = (() => {

  function openAdd() {
    Utils.openModal('Add New Student', `
      <div class="form-group"><label>Full Name</label>
        <input type="text" id="st-name" placeholder="First Last" autocomplete="off">
      </div>
      <div class="form-group"><label>Email Address</label>
        <input type="email" id="st-email" placeholder="student@university.edu" autocomplete="off">
      </div>
      <div class="grid-2">
        <div class="form-group"><label>Department</label>
          <select id="st-dept">
            <option>Computer Science</option>
            <option>Engineering</option>
            <option>Mathematics</option>
            <option>Business</option>
            <option>Medicine</option>
          </select>
        </div>
        <div class="form-group"><label>Year</label>
          <select id="st-year">
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:6px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-primary"   style="flex:1" onclick="AdminStudents.save()">Create Account</button>
      </div>`);
  }

  async function save() {
    const name  = document.getElementById('st-name')?.value.trim();
    const email = document.getElementById('st-email')?.value.trim().toLowerCase();
    const dept  = document.getElementById('st-dept')?.value;
    const year  = parseInt(document.getElementById('st-year')?.value || '1');

    if (!name)                         { Utils.toast('Please enter a name', 'error'); return; }
    if (!email || !email.includes('@')) { Utils.toast('Please enter a valid email', 'error'); return; }
    if (DB.findByEmail(email))          { Utils.toast('An account with this email already exists', 'error'); return; }

    const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
    const password = DB.generatePassword();
    const profile  = {
      name,
      role:      'student',
      roleLabel: `Student · ${dept}`,
      uni:       State.currentUser().uni,
      avatar:    initials,
      color:     '#6c63ff',
      email,
    };

    try {
      await DB.createUser(email, password, profile);
      const sid = 'CS-' + String(State.students.length + 1).padStart(4, '0');
      State.students.push({ name, id: sid, dept, year, gpa: 0, status: 'Active' });
      Utils.closeModal();
      App.navigate('students');
      _showCredentials(name, email, password);
    } catch (e) {
      Utils.toast('Failed to create account: ' + e.message, 'error');
    }
  }

  function _showCredentials(name, email, password) {
    Utils.openModal('Student Account Created', `
      <div style="text-align:center;margin-bottom:18px">
        <div style="font-size:2.4rem">✅</div>
        <div style="color:var(--green);font-weight:700;font-size:1.05rem;margin-top:8px">${name} can now log in</div>
        <div style="color:var(--text2);font-size:.83rem;margin-top:4px">Share these one-time credentials with the student</div>
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
