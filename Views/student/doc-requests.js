App.register('stu-docs', c => {
  StuDocs.render(c);
});

const StuDocs = (() => {
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

  const statusMsg = {
    pending:    'Your request has been received and is awaiting processing.',
    processing: 'Admin is preparing your document. You will be notified when ready.',
    ready:      'Your document is ready for collection at the registrar\'s office.',
    delivered:  'Document has been collected.',
  };

  function _all()  { return JSON.parse(localStorage.getItem('edunexus_doc_requests') || '[]'); }
  function _save(d){ localStorage.setItem('edunexus_doc_requests', JSON.stringify(d)); }

  function _myId() {
    const u = State.currentUser();
    return u?.studentId || 'CS-0001';
  }

  function _myName() {
    return State.currentUser()?.name || 'Alex Johnson';
  }

  function render(c) {
    const mine = _all().filter(r => r.studentId === _myId())
                       .sort((a, b) => b.requestedAt - a.requestedAt);
    const ready = mine.filter(r => r.status === 'ready').length;

    c.innerHTML = `
    ${ready > 0 ? `
    <div style="background:rgba(0,212,170,.1);border:1px solid rgba(0,212,170,.3);
                border-radius:10px;padding:14px 16px;margin-bottom:18px;
                display:flex;align-items:center;gap:12px">
      <span style="font-size:1.4rem">📬</span>
      <div>
        <div style="font-weight:700;color:var(--accent2)">Document Ready for Collection</div>
        <div style="font-size:.83rem;color:var(--text2)">${ready} document(s) are ready at the registrar's office.</div>
      </div>
    </div>` : ''}

    <div class="grid-2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-title">📤 Submit a New Request</div>
        <div class="form-group" style="margin-top:10px">
          <label>Document Type</label>
          <select id="doc-type">
            <option value="official_transcript">Official Transcript</option>
            <option value="enrollment_certificate">Enrollment Certificate</option>
            <option value="clearance_letter">Clearance Letter</option>
            <option value="recommendation_letter">Recommendation Letter</option>
            <option value="academic_record">Academic Record</option>
          </select>
        </div>
        <div class="form-group">
          <label>Reason / Purpose</label>
          <textarea id="doc-reason" rows="3" placeholder="e.g. Scholarship application, visa renewal…"
            style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;
                   padding:10px;color:var(--text);width:100%;resize:vertical;outline:none;
                   font-family:inherit;font-size:.87rem"></textarea>
        </div>
        <button class="btn-sm btn-primary" style="width:100%" onclick="StuDocs.submit()">
          Submit Request
        </button>
      </div>

      <div class="card" style="display:flex;flex-direction:column;gap:6px">
        <div class="card-title">📊 Request Summary</div>
        ${[
          ['Total Submitted',  mine.length],
          ['Pending Review',   mine.filter(r => r.status === 'pending').length],
          ['In Processing',    mine.filter(r => r.status === 'processing').length],
          ['Ready to Collect', mine.filter(r => r.status === 'ready').length],
          ['Delivered',        mine.filter(r => r.status === 'delivered').length],
        ].map(([l, v]) => `
        <div style="display:flex;justify-content:space-between;padding:7px 0;
                    border-bottom:1px solid var(--border);font-size:.87rem">
          <span style="color:var(--text2)">${l}</span>
          <span style="font-weight:700">${v}</span>
        </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-title">📋 My Requests</div>
      ${mine.length === 0
        ? `<div style="text-align:center;padding:30px 0;color:var(--text2)">
            <div style="font-size:2rem;margin-bottom:8px">📄</div>
            <div>You have not submitted any document requests yet.</div>
           </div>`
        : mine.map(r => `
        <div style="padding:14px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
            <div style="flex:1">
              <div style="font-weight:700;font-size:.93rem">${typeLabel[r.type] || r.type}</div>
              <div style="font-size:.8rem;color:var(--text2);margin-top:2px">${r.reason}</div>
              ${r.adminNote ? `<div style="font-size:.8rem;color:var(--accent2);margin-top:4px">
                📝 Admin note: ${r.adminNote}</div>` : ''}
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
              ${Utils.pill(r.status.charAt(0).toUpperCase() + r.status.slice(1), statusPill[r.status])}
              <div style="font-size:.76rem;color:var(--text2)">${Utils.formatDate(r.requestedAt)}</div>
            </div>
          </div>
          <div style="font-size:.79rem;color:var(--text2);margin-top:8px;padding:8px 10px;
                      background:var(--bg2);border-radius:6px">
            ${statusMsg[r.status]}
          </div>
        </div>`).join('')}
    </div>`;
  }

  function submit() {
    const type   = document.getElementById('doc-type')?.value;
    const reason = document.getElementById('doc-reason')?.value.trim();
    if (!reason) { Utils.toast('Please describe the reason for this request.', 'error'); return; }

    const all = _all();
    const newId = 'DOC-' + String(all.length + 1).padStart(3, '0');
    all.push({
      id:           newId,
      studentId:    _myId(),
      studentName:  _myName(),
      dept:         State.currentUser()?.roleLabel?.split(' · ')[1] || 'Computer Science',
      type,
      reason,
      status:       'pending',
      requestedAt:  Date.now(),
      adminNote:    '',
      processedAt:  null,
    });
    _save(all);
    Utils.toast(`Request ${newId} submitted successfully.`, 'success');
    render(document.getElementById('main-content'));
  }

  return { render, submit };
})();
