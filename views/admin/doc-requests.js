/* ── Seed doc requests on first load ─────────────────────── */
(() => {
  const existing = JSON.parse(localStorage.getItem('edunexus_doc_requests') || '[]');
  if (localStorage.getItem('edunexus_doc_reqs_seeded') && existing.length > 0) return;
  const seed = [
    { id:'DOC-001', studentId:'CS-0001', studentName:'Alex Johnson',  dept:'Computer Science',
      type:'official_transcript',     reason:'Scholarship application',
      status:'pending',    requestedAt: Date.now() - 86400000 * 3, adminNote:'', processedAt:null },
    { id:'DOC-002', studentId:'CS-0041', studentName:'Maria Santos',  dept:'Computer Science',
      type:'enrollment_certificate',  reason:'Visa renewal requirement',
      status:'processing', requestedAt: Date.now() - 86400000 * 5, adminNote:'Being prepared by registrar', processedAt:null },
    { id:'DOC-003', studentId:'CS-0112', studentName:'Priya Sharma',  dept:'Engineering',
      type:'clearance_letter',        reason:'Final year clearance',
      status:'ready',      requestedAt: Date.now() - 86400000 * 7, adminNote:'Ready for collection', processedAt: Date.now() - 86400000 },
    { id:'DOC-004', studentId:'CS-0087', studentName:'James Kwame',   dept:'Computer Science',
      type:'recommendation_letter',   reason:'Graduate school application',
      status:'pending',    requestedAt: Date.now() - 86400000 * 1, adminNote:'', processedAt:null },
    { id:'DOC-005', studentId:'CS-0156', studentName:'Carlos Rivera', dept:'Mathematics',
      type:'official_transcript',     reason:'Transfer application',
      status:'delivered',  requestedAt: Date.now() - 86400000 * 10, adminNote:'Delivered to student', processedAt: Date.now() - 86400000 * 2 },
    { id:'DOC-006', studentId:'CS-0203', studentName:'Aisha Obi',     dept:'Computer Science',
      type:'academic_record',         reason:'Internship background check',
      status:'pending',    requestedAt: Date.now() - 86400000 * 2, adminNote:'', processedAt:null },
  ];
  localStorage.setItem('edunexus_doc_requests', JSON.stringify(seed));
  localStorage.setItem('edunexus_doc_reqs_seeded', '1');
})();

/* ── Page ─────────────────────────────────────────────────── */
App.register('doc-requests', c => {
  AdminDocReqs.render(c);
});

const AdminDocReqs = (() => {
  let activeFilter = 'all';

  const typeLabel = {
    official_transcript:    'Official Transcript',
    enrollment_certificate: 'Enrollment Certificate',
    clearance_letter:       'Clearance Letter',
    recommendation_letter:  'Recommendation Letter',
    academic_record:        'Academic Record',
  };

  const statusPill = {
    pending:    'pill-yellow',
    processing: 'pill-blue',
    ready:      'pill-green',
    delivered:  '',
  };

  function _all()  { return JSON.parse(localStorage.getItem('edunexus_doc_requests') || '[]'); }
  function _save(d){ localStorage.setItem('edunexus_doc_requests', JSON.stringify(d)); }

  function render(c) {
    const all = _all();
    const counts = {
      all: all.length,
      pending:    all.filter(r => r.status === 'pending').length,
      processing: all.filter(r => r.status === 'processing').length,
      ready:      all.filter(r => r.status === 'ready').length,
      delivered:  all.filter(r => r.status === 'delivered').length,
    };

    const tabs = [
      { key:'all',        label:`All (${counts.all})` },
      { key:'pending',    label:`Pending (${counts.pending})` },
      { key:'processing', label:`Processing (${counts.processing})` },
      { key:'ready',      label:`Ready (${counts.ready})` },
      { key:'delivered',  label:`Delivered (${counts.delivered})` },
    ];

    const list = activeFilter === 'all' ? all : all.filter(r => r.status === activeFilter);

    c.innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
      ${tabs.map(t => `
      <button class="btn-sm ${activeFilter === t.key ? 'btn-primary' : 'btn-secondary'}"
        onclick="AdminDocReqs.setFilter('${t.key}')">${t.label}</button>`).join('')}
    </div>
    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Student</th>
            <th>Document Type</th>
            <th>Reason</th>
            <th>Requested</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${list.length === 0
            ? `<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text2)">No requests in this category.</td></tr>`
            : list.map(r => `
          <tr>
            <td style="font-family:monospace;font-size:.82rem;color:var(--text2)">${r.id}</td>
            <td>
              <div style="font-weight:600">${r.studentName}</div>
              <div style="font-size:.77rem;color:var(--text2)">${r.dept}</div>
            </td>
            <td style="font-size:.85rem">${typeLabel[r.type] || r.type}</td>
            <td style="font-size:.83rem;color:var(--text2);max-width:160px">${r.reason}</td>
            <td style="font-size:.82rem;color:var(--text2)">${Utils.formatDate(r.requestedAt)}</td>
            <td>${Utils.pill(r.status.charAt(0).toUpperCase() + r.status.slice(1), statusPill[r.status])}</td>
            <td>
              <button class="btn-sm btn-secondary" onclick="AdminDocReqs.manage('${r.id}')">
                ${r.status === 'pending' ? 'Process' : r.status === 'processing' ? 'Mark Ready' : r.status === 'ready' ? 'Mark Delivered' : 'View'}
              </button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  }

  function setFilter(f) {
    activeFilter = f;
    render(document.getElementById('main-content'));
  }

  function manage(id) {
    const all = _all();
    const r   = all.find(x => x.id === id);
    if (!r) return;

    const next = { pending:'processing', processing:'ready', ready:'delivered', delivered:null };
    const nextStatus = next[r.status];

    const noteField = r.status !== 'delivered' ? `
    <div class="form-group" style="margin-top:14px">
      <label>Admin Note</label>
      <input type="text" id="adoc-note" value="${r.adminNote || ''}" placeholder="Optional note for the student">
    </div>` : '';

    Utils.openModal(`${typeLabel[r.type] || r.type} — ${r.studentName}`, `
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
        ${[
          ['Student',   r.studentName],
          ['Student ID', r.studentId],
          ['Department', r.dept],
          ['Document',   typeLabel[r.type] || r.type],
          ['Reason',     r.reason],
          ['Status',     r.status.charAt(0).toUpperCase() + r.status.slice(1)],
          ['Requested',  Utils.formatDate(r.requestedAt)],
          ...(r.adminNote ? [['Admin Note', r.adminNote]] : []),
        ].map(([l, v]) => `
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:.85rem">
          <span style="color:var(--text2)">${l}</span>
          <span style="font-weight:600;text-align:right;max-width:200px">${v}</span>
        </div>`).join('')}
      </div>
      ${noteField}
      <div style="display:flex;gap:8px;margin-top:14px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Close</button>
        ${nextStatus ? `<button class="btn-sm btn-primary" style="flex:1"
          onclick="AdminDocReqs.advance('${id}','${nextStatus}')">
          Move to ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
        </button>` : ''}
      </div>`);
  }

  function advance(id, newStatus) {
    const all  = _all();
    const r    = all.find(x => x.id === id);
    if (!r) return;
    const note = document.getElementById('adoc-note');
    r.status      = newStatus;
    r.adminNote   = note ? note.value.trim() : r.adminNote;
    r.processedAt = newStatus === 'delivered' ? Date.now() : r.processedAt;
    _save(all);
    if (newStatus === 'ready') {
      Notifier.send(`Document Ready: ${typeLabel[r.type] || r.type}`,
        `${r.studentName}, your document is ready for collection at the registrar's office.`,
        { to: ['student'], type: 'document', icon: '📬' });
    }
    Utils.closeModal();
    Utils.toast(`Request ${id} moved to ${newStatus}.`, 'success');
    render(document.getElementById('main-content'));
  }

  return { render, setFilter, manage, advance };
})();
