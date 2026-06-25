function _uniAdminDash(c) {
  const docRequests = JSON.parse(localStorage.getItem('edunexus_doc_requests') || '[]');
  const pending     = docRequests.filter(r => r.status === 'pending').length;
  const processing  = docRequests.filter(r => r.status === 'processing').length;
  const needAction  = pending + processing;

  const depts = [
    { name:'Computer Science', students:1240, staff:28, courses:16 },
    { name:'Engineering',      students:980,  staff:24, courses:14 },
    { name:'Business Studies', students:740,  staff:20, courses:12 },
    { name:'Mathematics',      students:620,  staff:18, courses:10 },
    { name:'Medicine',         students:480,  staff:22, courses:22 },
    { name:'Arts & Humanities',students:380,  staff:16, courses:8  },
  ];
  const totalStudents = depts.reduce((s, d) => s + d.students, 0);
  const totalStaff    = depts.reduce((s, d) => s + d.staff,    0);
  const maxStudents   = Math.max(...depts.map(d => d.students));

  const taskQueue = [
    ...docRequests.filter(r => r.status === 'pending').slice(0, 3).map(r => ({
      label: `${r.type.replace(/_/g, ' ')} — ${r.studentName}`,
      sub:   r.reason,
      pill:  'pill-yellow',
      tag:   'Pending',
    })),
    ...docRequests.filter(r => r.status === 'processing').slice(0, 2).map(r => ({
      label: `${r.type.replace(/_/g, ' ')} — ${r.studentName}`,
      sub:   r.adminNote || 'In progress',
      pill:  'pill-blue',
      tag:   'Processing',
    })),
  ];

  c.innerHTML = `
  <div class="stats-grid" style="margin-bottom:20px">
    ${Utils.statCard('👥','rgba(108,99,255,.15)', totalStudents.toLocaleString(), 'Enrolled Students',   '↑ 3.2% this semester', 'up')}
    ${Utils.statCard('👨‍🏫','rgba(0,212,170,.15)',  totalStaff,                    'Teaching Staff',       '', '')}
    ${Utils.statCard('🏛️','rgba(255,209,102,.15)', depts.length,                  'Departments',          '', '')}
    ${Utils.statCard('📜','rgba(255,107,107,.15)', needAction,                    'Pending Doc Requests', needAction > 0 ? `${pending} awaiting action` : 'All processed', needAction > 0 ? 'down' : 'up')}
  </div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">🏛️ Enrollment by Department</div>
      ${depts.map(d => `
      <div style="margin-top:10px">
        <div style="display:flex;justify-content:space-between;font-size:.83rem;margin-bottom:4px">
          <span style="color:var(--text2)">${d.name}</span>
          <span style="font-weight:700">${d.students.toLocaleString()} <span style="color:var(--text2);font-weight:400">students</span></span>
        </div>
        ${Utils.progressBar(Math.round(d.students / maxStudents * 100), 'var(--accent)')}
      </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-title">📋 Admin Task Queue</div>
      ${taskQueue.length === 0
        ? `<div style="text-align:center;padding:24px 0;color:var(--text2)">
            <div style="font-size:2rem;margin-bottom:6px">✅</div>
            <div>No pending administrative tasks.</div>
           </div>`
        : taskQueue.map(t => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
            <div style="flex:1">
              <div style="font-size:.87rem;font-weight:600;text-transform:capitalize">${t.label}</div>
              <div style="font-size:.77rem;color:var(--text2)">${t.sub}</div>
            </div>
            <div class="pill ${t.pill}">${t.tag}</div>
          </div>`).join('')
      }
      ${needAction > 0 ? `
      <button class="btn-sm btn-primary" style="width:100%;margin-top:12px" onclick="App.navigate('doc-requests')">
        View All Requests (${needAction}) →
      </button>` : ''}
    </div>
  </div>`;
}
