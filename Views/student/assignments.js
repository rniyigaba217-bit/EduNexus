App.register('assignments', c => {
  const assignments = JSON.parse(localStorage.getItem('edunexus_assignments') || '[]');
  const submissions = JSON.parse(localStorage.getItem('edunexus_submissions') || '[]');
  const user        = State.currentUser();
  const student     = State.students.find(s => s.name === user.name) || State.students[0];

  const mySubs      = submissions.filter(s => s.studentId === student.id);
  const submittedIds = new Set(mySubs.map(s => s.assignmentId));
  const graded      = mySubs.filter(s => s.grade !== undefined);

  const now  = new Date();
  const open = assignments.filter(a => !submittedIds.has(a.id) && new Date(a.dueDate) >= now);
  const past = assignments.filter(a =>  submittedIds.has(a.id) || new Date(a.dueDate) < now);

  c.innerHTML = `
  <div class="stats-grid" style="margin-bottom:20px">
    ${Utils.statCard('📌','rgba(255,209,102,.15)', open.length,       'Open Assignments',  open.length > 0 ? 'Submit before due date' : 'All caught up!',      '')}
    ${Utils.statCard('✅','rgba(0,212,170,.15)',    mySubs.length,     'Submitted',         '',                                                                  'up')}
    ${Utils.statCard('📊','rgba(108,99,255,.15)',   graded.length,     'Graded',            '',                                                                  '')}
    ${Utils.statCard('📋','rgba(255,107,107,.15)',  assignments.length - mySubs.length, 'Still Pending', '', '')}
  </div>

  <div class="card" style="margin-bottom:20px">
    <div class="card-title">📌 Open Assignments (${open.length})</div>
    ${open.length === 0
      ? `<div style="text-align:center;padding:30px 0;color:var(--text2)">
          <div style="font-size:2rem;margin-bottom:8px">🎉</div>
          <div>No pending assignments! You're all caught up.</div>
         </div>`
      : open.map(a => {
          const daysLeft = Math.ceil((new Date(a.dueDate) - now) / 86400000);
          const urgency  = daysLeft <= 2 ? 'pill-red' : daysLeft <= 5 ? 'pill-yellow' : 'pill-blue';
          return `
          <div style="padding:14px;background:var(--bg3);border-radius:10px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
              <div style="flex:1;margin-right:10px">
                <div style="font-weight:700">${a.title}</div>
                <div style="font-size:.78rem;color:var(--text2)">${a.courseCode} — ${a.courseName} · ${a.points} pts</div>
              </div>
              <div class="pill ${urgency}">${daysLeft}d left</div>
            </div>
            <div style="font-size:.83rem;color:var(--text2);line-height:1.6;margin-bottom:10px">${a.description}</div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
              ${a.allowFiles ? `<div class="pill pill-blue">📎 File upload allowed</div>` : ''}
              <button class="btn-sm btn-primary" onclick="StudentAssignments.openSubmit(${a.id})">Submit Work →</button>
            </div>
          </div>`;
        }).join('')
    }
  </div>

  <div class="card">
    <div class="card-title">✅ Submitted & Past</div>
    ${past.length === 0
      ? `<div style="color:var(--text2);font-size:.85rem;padding:16px 0">No past assignments yet.</div>`
      : past.map(a => {
          const mySub = mySubs.find(s => s.assignmentId === a.id);
          const isPast = new Date(a.dueDate) < now;
          return `
          <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
            <div style="font-size:1.2rem;margin-top:2px">${mySub ? '✅' : '❌'}</div>
            <div style="flex:1">
              <div style="font-size:.87rem;font-weight:600">${a.title}</div>
              <div style="font-size:.75rem;color:var(--text2)">${a.courseCode} · Due ${a.dueDate} · ${a.points} pts</div>
              ${mySub ? `<div style="font-size:.78rem;color:var(--text2);margin-top:2px">Submitted ${mySub.submittedAt}</div>` : ''}
              ${mySub?.feedback ? `<div style="font-size:.8rem;color:var(--accent);margin-top:4px">💬 "${mySub.feedback}"</div>` : ''}
            </div>
            <div style="text-align:right;flex-shrink:0">
              ${mySub?.grade !== undefined
                ? `<div style="font-weight:700;color:${Utils.gradeColor(mySub.grade / a.points * 100)}">${mySub.grade}/${a.points}</div>
                   <div style="font-size:.75rem;color:var(--text2)">${Utils.letterGrade(mySub.grade / a.points * 100)}</div>`
                : mySub
                  ? `<div class="pill pill-yellow">Pending grade</div>`
                  : isPast
                    ? `<div class="pill pill-red">Missed</div>`
                    : ''
              }
            </div>
          </div>`;
        }).join('')
    }
  </div>`;
});

const StudentAssignments = (() => {

  function openSubmit(assignmentId) {
    const assignments = JSON.parse(localStorage.getItem('edunexus_assignments') || '[]');
    const a = assignments.find(x => x.id === assignmentId);
    if (!a) return;

    Utils.openModal(`Submit — ${a.title}`, `
      <div style="margin-bottom:14px;font-size:.83rem;color:var(--text2)">
        ${a.courseCode} · ${a.points} pts · Due ${a.dueDate}
      </div>
      <div style="background:var(--bg3);border-radius:8px;padding:12px;margin-bottom:14px;font-size:.85rem;color:var(--text2);line-height:1.6">
        ${a.description}
      </div>
      <label style="font-size:.82rem;color:var(--text2);display:block;margin-bottom:5px">Your answer / response</label>
      <textarea id="sub-text" rows="5" placeholder="Type your response here…"
        style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--text);outline:none;resize:vertical;box-sizing:border-box;font-family:inherit;margin-bottom:12px"></textarea>
      ${a.allowFiles ? `
      <label style="font-size:.82rem;color:var(--text2);display:block;margin-bottom:5px">Attach file (optional)</label>
      <input id="sub-file" type="file" accept=".pdf,.doc,.docx,.zip,.py,.js,.txt"
        style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;color:var(--text);box-sizing:border-box;margin-bottom:12px">
      ` : ''}
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:4px">
        <button class="btn-sm btn-secondary" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-primary"   onclick="StudentAssignments.submit(${assignmentId})">Submit Assignment →</button>
      </div>
    `);
  }

  function submit(assignmentId) {
    const text      = (document.getElementById('sub-text')?.value || '').trim();
    const fileInput = document.getElementById('sub-file');
    const fileName  = fileInput?.files?.[0]?.name || '';

    if (!text && !fileName) {
      Utils.toast('Write a response or attach a file before submitting.', 'error');
      return;
    }

    const user    = State.currentUser();
    const student = State.students.find(s => s.name === user.name) || State.students[0];
    const list    = JSON.parse(localStorage.getItem('edunexus_submissions') || '[]');

    if (list.find(s => s.assignmentId === assignmentId && s.studentId === student.id)) {
      Utils.toast('You have already submitted this assignment.', 'error');
      return;
    }

    list.push({
      id:           Date.now(),
      assignmentId,
      studentId:    student.id,
      studentName:  student.name,
      text,
      fileName,
      submittedAt:  new Date().toISOString().slice(0, 10),
    });
    localStorage.setItem('edunexus_submissions', JSON.stringify(list));
    const asgn = JSON.parse(localStorage.getItem('edunexus_assignments') || '[]').find(a => a.id === assignmentId);
    SysLog.write('assignment_sub', `${student.name} submitted "${asgn ? asgn.title : 'assignment'}"`, 'info');
    Utils.closeModal();
    Utils.toast('Assignment submitted successfully!', 'success');
    State.addNotification('Assignment submitted', 'Your work has been received by your facilitator.');
    App.navigate('assignments');
  }

  return { openSubmit, submit };
})();
