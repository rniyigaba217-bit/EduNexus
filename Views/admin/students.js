App.register('students', c => {
  c.innerHTML = `
  <div class="section-header">
    <input type="text" id="stu-search" placeholder="🔍 Search by name, ID or department…"
      oninput="AdminStudents.filter(this.value)"
      style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;
             padding:9px 14px;color:var(--text);width:280px;outline:none">
    ${State.currentRole !== 'ministry' ? `<button class="btn-sm btn-primary" onclick="AdminStudents.openAdd()">+ Enroll Student</button>` : ''}
  </div>
  <div class="card">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Student ID</th>
          <th>Department</th>
          <th>Year</th>
          <th>Enrolment Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="stu-tbody">
        ${_stuRows(State.students)}
      </tbody>
    </table>
  </div>`;
});

function _stuRows(list) {
  if (!list.length) return `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text2)">No students found.</td></tr>`;
  return list.map(s => `
  <tr>
    <td>
      <div style="display:flex;align-items:center;gap:10px">
        <div class="avatar" style="width:30px;height:30px;background:linear-gradient(135deg,var(--accent),var(--accent2));font-size:.75rem">${Utils.initials(s.name)}</div>
        <strong>${s.name}</strong>
      </div>
    </td>
    <td style="color:var(--text2);font-family:monospace">${s.id}</td>
    <td>${s.dept}</td>
    <td>Year ${s.year}</td>
    <td>${Utils.pill(s.status, s.status === 'Active' ? 'pill-green' : s.status === 'At Risk' ? 'pill-red' : 'pill-yellow')}</td>
    <td>
      <button class="btn-sm btn-secondary" onclick="AdminStudents.viewProfile('${s.id}')">View</button>
    </td>
  </tr>`).join('');
}

const AdminStudents = (() => {

  function filter(query) {
    const q    = query.toLowerCase();
    const list = q
      ? State.students.filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)   ||
          s.dept.toLowerCase().includes(q))
      : State.students;
    const tbody = document.getElementById('stu-tbody');
    if (tbody) tbody.innerHTML = _stuRows(list);
  }

  function viewProfile(id) {
    const s = State.students.find(x => x.id === id);
    if (!s) return;
    const docReqs = JSON.parse(localStorage.getItem('edunexus_doc_requests') || '[]')
      .filter(r => r.studentId === s.id);
    Utils.openModal(`${s.name} — Student Profile`, `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
        <div class="avatar" style="width:48px;height:48px;background:linear-gradient(135deg,var(--accent),var(--accent2));font-size:1rem">${Utils.initials(s.name)}</div>
        <div>
          <div style="font-weight:700;font-size:1rem">${s.name}</div>
          <div style="font-size:.82rem;color:var(--text2)">${s.id} · ${s.dept} · Year ${s.year}</div>
        </div>
        <div style="margin-left:auto">${Utils.pill(s.status, s.status === 'Active' ? 'pill-green' : 'pill-red')}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
        ${[
          ['Department',       s.dept],
          ['Year of Study',    `Year ${s.year}`],
          ['Student ID',       s.id],
          ['Enrolment Status', s.status],
          ['Document Requests', docReqs.length ? `${docReqs.length} request(s)` : 'None'],
        ].map(([l, v]) => `
        <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:.87rem">
          <span style="color:var(--text2)">${l}</span>
          <span style="font-weight:600">${v}</span>
        </div>`).join('')}
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Close</button>
        <button class="btn-sm btn-primary" style="flex:1" onclick="AdminStudents.toggleStatus('${s.id}')">
          ${s.status === 'Active' ? 'Suspend Account' : 'Reactivate Account'}
        </button>
      </div>`);
  }

  function toggleStatus(id) {
    const s = State.students.find(x => x.id === id);
    if (!s) return;
    s.status = s.status === 'Active' ? 'Suspended' : 'Active';
    Utils.closeModal();
    Utils.toast(`${s.name} account ${s.status.toLowerCase()}.`, 'success');
    App.navigate('students');
  }

  function openAdd() {
    Utils.openModal('Enrol New Student', `
      <div class="form-group"><label>Full Name</label>
        <input type="text" id="st-name" placeholder="First Last" autocomplete="off">
      </div>
      <div class="form-group"><label>Email Address</label>
        <input type="email" id="st-email" placeholder="student@university.edu" autocomplete="off">
      </div>
      <div class="grid-2">
        <div class="form-group"><label>Department</label>
          <select id="st-dept">
            <option>Computer Science</option><option>Engineering</option>
            <option>Mathematics</option><option>Business Studies</option>
            <option>Medicine</option><option>Arts &amp; Humanities</option>
          </select>
        </div>
        <div class="form-group"><label>Year</label>
          <select id="st-year">
            <option value="1">Year 1</option><option value="2">Year 2</option>
            <option value="3">Year 3</option><option value="4">Year 4</option>
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

    if (!name)                          { Utils.toast('Enter a name.', 'error'); return; }
    if (!email || !email.includes('@')) { Utils.toast('Enter a valid email.', 'error'); return; }
    if (DB.findByEmail(email))           { Utils.toast('An account with this email already exists.', 'error'); return; }

    const password = DB.generatePassword();
    const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
    const profile  = { name, role:'student', roleLabel:`Student · ${dept}`, uni:State.currentUser().uni, avatar:initials, color:'#6c63ff', email };

    try {
      await DB.createUser(email, password, profile);
      const sid = 'CS-' + String(State.students.length + 1).padStart(4, '0');
      State.students.push({ name, id:sid, dept, year, gpa:0, status:'Active' });
      SysLog.write('account_create', `New student enrolled: ${name} (${dept}, Year ${year})`, 'info');
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
        <div><span style="color:var(--text2)">Email: </span><strong>${email}</strong></div>
        <div><span style="color:var(--text2)">Password: </span>
          <strong style="color:var(--accent);font-family:monospace;letter-spacing:.05em">${password}</strong>
        </div>
      </div>
      <div style="color:var(--yellow);font-size:.8rem;margin-top:12px;padding:10px 12px;
                  background:rgba(255,209,102,.07);border-radius:8px;border:1px solid rgba(255,209,102,.25)">
        ⚠️ This password is shown only once — copy it before closing.
      </div>
      <button class="btn-sm btn-primary" style="width:100%;margin-top:14px" onclick="Utils.closeModal()">Done</button>`);
  }

  return { filter, viewProfile, toggleStatus, openAdd, save };
})();
