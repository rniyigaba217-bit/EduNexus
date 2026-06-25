// Seed default assignments on first load (runs for all roles at page load)
(function seedAssignments() {
  if (localStorage.getItem('edunexus_assignments_seeded')) return;
  localStorage.setItem('edunexus_assignments', JSON.stringify([
    {
      id: 1,
      title: 'Binary Search Tree Implementation',
      courseCode: 'CS301', courseName: 'Data Structures',
      description: 'Implement a BST with insert, delete, and search operations in Python. Include proper documentation, edge-case handling, and at least 5 unit tests.',
      dueDate: '2026-07-05', points: 50, allowFiles: true,
      createdBy: 'Dr. Sarah Williams', createdAt: '2026-06-15',
    },
    {
      id: 2,
      title: 'Graph Traversal Comparison Report',
      courseCode: 'CS302', courseName: 'Algorithms',
      description: 'Write a 1000-word report comparing DFS and BFS. Cover time/space complexity, practical use cases, and provide a coded example of each.',
      dueDate: '2026-07-10', points: 30, allowFiles: false,
      createdBy: 'Dr. Sarah Williams', createdAt: '2026-06-18',
    },
  ]));
  localStorage.setItem('edunexus_assignments_seeded', '1');
})();

App.register('fac-assignments', c => {
  const assignments = JSON.parse(localStorage.getItem('edunexus_assignments') || '[]');
  const submissions = JSON.parse(localStorage.getItem('edunexus_submissions') || '[]');

  const IS  = 'width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);outline:none;box-sizing:border-box';
  const SEL = 'width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);outline:none';
  const TA  = IS + ';resize:vertical;font-family:inherit';

  c.innerHTML = `
  <div class="grid-2" style="margin-bottom:20px">
    <div class="card">
      <div class="card-title">➕ Create Assignment</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div>
          <label style="font-size:.82rem;color:var(--text2);display:block;margin-bottom:5px">Title</label>
          <input id="asgn-title" type="text" placeholder="e.g. Graph Traversal Report" style="${IS}">
        </div>
        <div>
          <label style="font-size:.82rem;color:var(--text2);display:block;margin-bottom:5px">Course</label>
          <select id="asgn-course" style="${SEL}">
            ${State.courses.slice(0, 4).map(co =>
              `<option value="${co.code}|${co.name}">${co.code} — ${co.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size:.82rem;color:var(--text2);display:block;margin-bottom:5px">Description / Instructions</label>
          <textarea id="asgn-desc" rows="4" placeholder="Describe what students need to submit…" style="${TA}"></textarea>
        </div>
        <div class="grid-2" style="gap:12px">
          <div>
            <label style="font-size:.82rem;color:var(--text2);display:block;margin-bottom:5px">Due Date</label>
            <input id="asgn-due" type="date" style="${IS}">
          </div>
          <div>
            <label style="font-size:.82rem;color:var(--text2);display:block;margin-bottom:5px">Max Points</label>
            <input id="asgn-points" type="number" value="50" min="1" max="200" style="${IS}">
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <input id="asgn-files" type="checkbox" style="width:16px;height:16px;accent-color:var(--accent)">
          <label for="asgn-files" style="font-size:.85rem;cursor:pointer">Allow file upload</label>
        </div>
        <button class="btn btn-primary" onclick="FacAssignments.create()">📌 Post Assignment</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📌 Posted Assignments (${assignments.length})</div>
      ${assignments.length === 0
        ? `<div style="text-align:center;padding:40px 0;color:var(--text2)">
            <div style="font-size:2rem;margin-bottom:8px">📌</div>
            <div>No assignments posted yet. Create one on the left.</div>
           </div>`
        : assignments.map(a => {
            const subs   = submissions.filter(s => s.assignmentId === a.id);
            const graded = subs.filter(s => s.grade !== undefined).length;
            const isOpen = new Date(a.dueDate) >= new Date();
            return `
            <div style="padding:13px 0;border-bottom:1px solid var(--border)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
                <div style="flex:1;margin-right:10px">
                  <div style="font-size:.87rem;font-weight:600">${a.title}</div>
                  <div style="font-size:.75rem;color:var(--text2)">${a.courseCode} · Due ${a.dueDate} · ${a.points} pts</div>
                </div>
                <div class="pill ${isOpen ? 'pill-green' : 'pill-red'}">${isOpen ? 'Open' : 'Closed'}</div>
              </div>
              <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
                <div class="pill pill-blue">${subs.length} submitted</div>
                ${graded > 0 ? `<div class="pill pill-yellow">${graded} graded</div>` : ''}
                <button class="btn-sm btn-secondary" style="margin-left:auto" onclick="FacAssignments.viewSubs(${a.id})">View Submissions →</button>
              </div>
            </div>`;
          }).join('')
      }
    </div>
  </div>`;
});

const FacAssignments = (() => {

  function create() {
    const title     = (document.getElementById('asgn-title').value || '').trim();
    const courseVal = document.getElementById('asgn-course').value;
    const desc      = (document.getElementById('asgn-desc').value || '').trim();
    const due       = document.getElementById('asgn-due').value;
    const points    = parseInt(document.getElementById('asgn-points').value) || 50;
    const allowFiles = document.getElementById('asgn-files').checked;

    if (!title) { Utils.toast('Enter an assignment title.', 'error'); return; }
    if (!desc)  { Utils.toast('Add a description / instructions.', 'error'); return; }
    if (!due)   { Utils.toast('Select a due date.', 'error'); return; }

    const [courseCode, courseName] = courseVal.split('|');
    const list = JSON.parse(localStorage.getItem('edunexus_assignments') || '[]');
    list.push({
      id: Date.now(),
      title, courseCode, courseName,
      description: desc,
      dueDate: due, points, allowFiles,
      createdBy:  State.currentUser().name,
      createdAt:  new Date().toISOString().slice(0, 10),
    });
    localStorage.setItem('edunexus_assignments', JSON.stringify(list));
    SysLog.write('assignment_create', `${State.currentUser().name} created assignment "${title}" · ${courseCode}`, 'info');
    Notifier.send(`New Assignment: ${title}`, `${courseCode} · Due ${due}`, { to: ['student'], type: 'assignment', icon: '📌' });
    Utils.toast('Assignment posted!', 'success');
    App.navigate('fac-assignments');
  }

  function viewSubs(assignmentId) {
    const assignments = JSON.parse(localStorage.getItem('edunexus_assignments') || '[]');
    const submissions = JSON.parse(localStorage.getItem('edunexus_submissions') || '[]');
    const a    = assignments.find(x => x.id === assignmentId);
    if (!a) return;
    const subs = submissions.filter(s => s.assignmentId === assignmentId);

    Utils.openModal(`Submissions — ${a.title}`, `
      <div style="margin-bottom:12px;font-size:.83rem;color:var(--text2)">
        ${a.courseCode} · ${a.points} pts · Due ${a.dueDate}
      </div>
      ${subs.length === 0
        ? `<div style="text-align:center;padding:30px 0;color:var(--text2)">No submissions yet.</div>`
        : subs.map(s => `
          <div style="padding:12px;background:var(--bg3);border-radius:8px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <div>
                <div style="font-weight:600;font-size:.87rem">${s.studentName}</div>
                <div style="font-size:.75rem;color:var(--text2)">Submitted ${s.submittedAt}</div>
              </div>
              ${s.grade !== undefined
                ? `<div class="pill pill-green">${s.grade}/${a.points}</div>`
                : `<div class="pill pill-yellow">Ungraded</div>`}
            </div>
            <div style="font-size:.83rem;color:var(--text2);background:var(--bg2);border-radius:6px;padding:10px;margin-bottom:8px;line-height:1.6;max-height:120px;overflow-y:auto">
              ${s.text || '<em>No text response.</em>'}
            </div>
            ${s.fileName ? `<div style="font-size:.8rem;color:var(--accent);margin-bottom:8px">📎 ${s.fileName}</div>` : ''}
            <div style="display:flex;gap:8px;align-items:center">
              <input id="grade-${s.id}" type="number" min="0" max="${a.points}"
                placeholder="Grade / ${a.points}" value="${s.grade !== undefined ? s.grade : ''}"
                style="width:100px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);outline:none;box-sizing:border-box">
              <input id="fb-${s.id}" type="text" placeholder="Feedback (optional)"
                style="flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);outline:none">
              <button class="btn-sm btn-primary" onclick="FacAssignments.grade(${s.id},${assignmentId},${a.points})">Save</button>
            </div>
            ${s.feedback ? `<div style="font-size:.78rem;color:var(--accent);margin-top:6px">💬 ${s.feedback}</div>` : ''}
          </div>`).join('')
      }
    `);
  }

  function grade(submissionId, assignmentId, maxPoints) {
    const gradeVal = parseInt(document.getElementById('grade-' + submissionId)?.value);
    const feedback = (document.getElementById('fb-' + submissionId)?.value || '').trim();

    if (isNaN(gradeVal) || gradeVal < 0 || gradeVal > maxPoints) {
      Utils.toast(`Grade must be 0 – ${maxPoints}.`, 'error');
      return;
    }

    const submissions = JSON.parse(localStorage.getItem('edunexus_submissions') || '[]');
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;
    sub.grade    = gradeVal;
    sub.feedback = feedback;
    localStorage.setItem('edunexus_submissions', JSON.stringify(submissions));
    const asgns = JSON.parse(localStorage.getItem('edunexus_assignments') || '[]');
    const asgn  = asgns.find(x => x.id === assignmentId);
    if (asgn) Notifier.send(`Grade Posted: ${asgn.title}`, `Score: ${gradeVal}/${maxPoints} pts${feedback ? ' · ' + feedback : ''}`, { to: ['student'], type: 'grade', icon: '📊' });
    Utils.toast('Grade saved!', 'success');
    viewSubs(assignmentId);
  }

  return { create, viewSubs, grade };
})();
