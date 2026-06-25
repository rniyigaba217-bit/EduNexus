App.register('attendance', c => {
  const stored  = JSON.parse(localStorage.getItem('edunexus_attendance') || '[]');
  const courses  = State.courses.slice(0, 4);
  const students = State.students;
  const today    = new Date().toISOString().slice(0, 10);

  const IS  = 'width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);outline:none;box-sizing:border-box';
  const SEL = 'width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);outline:none';

  c.innerHTML = `
  <div class="grid-2">
    <div class="card">
      <div class="card-title">📋 Take Attendance</div>
      <div style="display:flex;flex-direction:column;gap:12px">

        <div>
          <label style="font-size:.82rem;color:var(--text2);display:block;margin-bottom:5px">Course</label>
          <select id="att-course" style="${SEL}">
            ${courses.map(co => `<option value="${co.code}">${co.code} — ${co.name}</option>`).join('')}
          </select>
        </div>

        <div>
          <label style="font-size:.82rem;color:var(--text2);display:block;margin-bottom:5px">Lecture / Session</label>
          <input id="att-title" type="text" placeholder="e.g. Week 7 – Binary Trees" style="${IS}">
        </div>

        <div>
          <label style="font-size:.82rem;color:var(--text2);display:block;margin-bottom:5px">Date</label>
          <input id="att-date" type="date" value="${today}" style="${IS}">
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span style="font-size:.82rem;color:var(--text2)">Students (${students.length})</span>
            <div style="display:flex;gap:12px">
              <span style="font-size:.78rem;color:var(--green);cursor:pointer;font-weight:600" onclick="Attendance.markAll('present')">✓ All Present</span>
              <span style="font-size:.78rem;color:var(--red);cursor:pointer;font-weight:600"   onclick="Attendance.markAll('absent')">✗ All Absent</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${students.map(s => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg3);border-radius:8px">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:#fff;flex-shrink:0">${Utils.initials(s.name)}</div>
              <div style="flex:1">
                <div style="font-size:.85rem;font-weight:600">${s.name}</div>
                <div style="font-size:.75rem;color:var(--text2)">${s.id}</div>
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn-sm" id="att-p-${s.id}" onclick="Attendance.mark('${s.id}','present')"
                  style="background:var(--bg2);color:var(--text2);border:1px solid var(--border)">✓ Present</button>
                <button class="btn-sm" id="att-a-${s.id}" onclick="Attendance.mark('${s.id}','absent')"
                  style="background:var(--bg2);color:var(--text2);border:1px solid var(--border)">✗ Absent</button>
              </div>
            </div>`).join('')}
          </div>
        </div>

        <button class="btn btn-primary" onclick="Attendance.save()">💾 Save Session</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📊 Past Sessions (${stored.length})</div>
      ${stored.length === 0
        ? `<div style="text-align:center;padding:40px 0;color:var(--text2)">
            <div style="font-size:2rem;margin-bottom:8px">📋</div>
            <div style="font-size:.9rem">No sessions recorded yet.<br>Use the form to take your first attendance.</div>
           </div>`
        : stored.slice().reverse().slice(0, 10).map(s => {
            const present = s.records.filter(r => r.present).length;
            const total   = s.records.length;
            const pct     = total ? Math.round(present / total * 100) : 0;
            const col     = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--yellow)' : 'var(--red)';
            const pill    = pct >= 80 ? 'pill-green'   : pct >= 60 ? 'pill-yellow'   : 'pill-red';
            return `
            <div style="padding:10px 0;border-bottom:1px solid var(--border)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
                <div>
                  <div style="font-size:.87rem;font-weight:600">${s.lectureTitle}</div>
                  <div style="font-size:.75rem;color:var(--text2)">${s.courseCode} · ${s.date}</div>
                </div>
                <div class="pill ${pill}">${present}/${total} · ${pct}%</div>
              </div>
              ${Utils.progressBar(pct, col)}
            </div>`;
          }).join('')
      }
    </div>
  </div>`;
});

const Attendance = (() => {
  const marks = {};

  function mark(id, val) {
    marks[id] = val;
    const pBtn = document.getElementById('att-p-' + id);
    const aBtn = document.getElementById('att-a-' + id);
    if (!pBtn || !aBtn) return;
    pBtn.style.cssText = val === 'present'
      ? 'background:rgba(0,212,170,.2);color:var(--green);border:1px solid rgba(0,212,170,.4)'
      : 'background:var(--bg2);color:var(--text2);border:1px solid var(--border)';
    aBtn.style.cssText = val === 'absent'
      ? 'background:rgba(255,107,107,.15);color:var(--red);border:1px solid rgba(255,107,107,.35)'
      : 'background:var(--bg2);color:var(--text2);border:1px solid var(--border)';
  }

  function markAll(val) {
    State.students.forEach(s => mark(s.id, val));
  }

  function save() {
    const courseCode   = document.getElementById('att-course').value;
    const lectureTitle = (document.getElementById('att-title').value || '').trim();
    const date         = document.getElementById('att-date').value;

    if (!lectureTitle) { Utils.toast('Enter a lecture title first.', 'error'); return; }
    if (!date)         { Utils.toast('Select a date.', 'error');               return; }

    const course  = State.courses.find(co => co.code === courseCode);
    const records = State.students.map(s => ({
      studentId:   s.id,
      studentName: s.name,
      present:     marks[s.id] === 'present',
    }));

    const stored = JSON.parse(localStorage.getItem('edunexus_attendance') || '[]');
    stored.push({
      id: Date.now(),
      courseCode,
      courseName:    course ? course.name : courseCode,
      lectureTitle,
      date,
      facilitator:   State.currentUser().name,
      records,
    });
    localStorage.setItem('edunexus_attendance', JSON.stringify(stored));

    for (const k in marks) delete marks[k];

    const present = records.filter(r => r.present).length;
    SysLog.write('attendance', `${State.currentUser().name} recorded attendance — ${courseCode} ${lectureTitle} (${present}/${records.length} present)`, 'info');
    Utils.toast(`Attendance saved — ${present}/${records.length} present`, 'success');
    State.addNotification('Attendance recorded', `${lectureTitle} · ${courseCode}`);
    App.navigate('attendance');
  }

  return { mark, markAll, save };
})();
