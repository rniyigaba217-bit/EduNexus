function _studentDash(c) {
  c.innerHTML = _todayWidget() + `
  <div class="stats-grid">
    ${Utils.statCard('📚','rgba(108,99,255,.15)','6','Active Courses','↑ 1 new this semester','up')}
    ${Utils.statCard('📊','rgba(0,212,170,.15)','83.4%','Overall GPA','↑ 2.1% from last semester','up')}
    ${Utils.statCard('📝','rgba(255,209,102,.15)','2','Upcoming Exams','Next: Mon 9am','')}
    ${Utils.statCard('⚡','rgba(255,107,107,.15)', _dueTodayCount(),'Assignments Due','Submit by Friday','down')}
  </div>
  <div class="grid-2">
    <div class="card">
      <div class="card-title">📈 Grade Overview by Course</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${State.courses.map(co => `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:.83rem;margin-bottom:5px">
            <span style="color:var(--text2)">${co.name}</span>
            <span style="color:${Utils.gradeColor(co.grade)};font-weight:700">${co.grade}%</span>
          </div>
          ${Utils.progressBar(co.grade, Utils.gradeColor(co.grade))}
        </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-title">📅 Upcoming Schedule</div>
      ${[
        ['Mon 9:00am','Data Structures Exam','exam','📝'],
        ['Mon 2:00pm','Algorithms Lecture','class','🎓'],
        ['Tue 11:00am','OS Assignment Due','assignment','⚡'],
        ['Wed 9:00am','Networks Lab','lab','🔬'],
        ['Thu 3:00pm','Software Eng. Quiz','exam','📝'],
        ['Fri 12:00pm','DB Assignment Due','assignment','⚡'],
      ].map(([t,n,type,icon]) => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="font-size:1.2rem">${icon}</div>
        <div style="flex:1"><div style="font-size:.87rem;font-weight:600">${n}</div><div style="font-size:.77rem;color:var(--text2)">${t}</div></div>
        <div class="pill ${type==='exam'?'pill-red':type==='assignment'?'pill-yellow':'pill-blue'}">${type}</div>
      </div>`).join('')}
    </div>
  </div>
  <div class="grid-2">
    <div class="card">
      <div class="card-title">🤖 AI Advisor Tip</div>
      <div style="background:rgba(108,99,255,.08);border:1px solid rgba(108,99,255,.2);border-radius:10px;padding:16px">
        <div style="font-size:.9rem;line-height:1.7;color:var(--text2)">
          Based on your recent performance, <strong style="color:var(--text)">Algorithms (76%)</strong> and
          <strong style="color:var(--text)">Database Systems (70%)</strong> need attention.
          Review <em>graph traversal</em> and <em>SQL joins</em> this week.
        </div>
        <button class="btn-sm btn-primary" style="margin-top:12px" onclick="App.navigate('ai-advisor')">Chat with AI Advisor →</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">💬 Recent Chat Activity</div>
      ${(State.chatMessages['cs-general'] || []).slice(-3).map(m => `
      <div style="padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="font-size:.78rem;color:var(--text2);margin-bottom:3px">${m.anon ? '👤 Anonymous' : '👤 ' + m.user} · ${m.time}</div>
        <div style="font-size:.87rem">${m.text}</div>
      </div>`).join('')}
      <button class="btn-sm btn-secondary" style="margin-top:10px;width:100%" onclick="App.navigate('chat')">Open Chat →</button>
    </div>
  </div>`;
}

/* ── Today widget ────────────────────────────────────── */
function _todayWidget() {
  const DAYS  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now   = new Date();
  const todayName  = DAYS[now.getDay()];
  const todayStr   = now.toISOString().slice(0, 10);
  const tmrwStr    = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  const dateLabel  = `${todayName}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  /* today's classes from timetable */
  const allSlots = JSON.parse(localStorage.getItem('edunexus_timetable') || '[]');
  const me       = State.students.find(s => s.name === (State.currentUser()?.name || ''));
  const myDept   = me?.dept || 'Computer Science';
  const myYear   = me?.year || 3;
  const mySlots  = allSlots
    .filter(s => s.dept === myDept && s.year === myYear && s.day === todayName)
    .sort((a, b) => a.start - b.start);

  /* assignments due today / tomorrow */
  const allAsgns  = JSON.parse(localStorage.getItem('edunexus_assignments') || '[]');
  const submitted = new Set(
    JSON.parse(localStorage.getItem('edunexus_submissions') || '[]').map(s => s.assignmentId)
  );
  const dueToday  = allAsgns.filter(a => a.dueDate === todayStr   && !submitted.has(a.id));
  const dueTmrw   = allAsgns.filter(a => a.dueDate === tmrwStr    && !submitted.has(a.id));

  /* greeting */
  const hr   = now.getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (State.currentUser()?.name || 'Student').split(' ')[0];

  return `
  <div style="background:linear-gradient(135deg,rgba(108,99,255,.1) 0%,rgba(0,212,170,.06) 100%);
    border:1px solid rgba(108,99,255,.22);border-radius:14px;padding:18px 20px;margin-bottom:20px">

    <div style="display:flex;align-items:flex-start;justify-content:space-between;
      margin-bottom:14px;gap:10px;flex-wrap:wrap">
      <div>
        <div style="font-weight:700;font-size:1rem">${greet}, ${firstName} 👋</div>
        <div style="font-size:.81rem;color:var(--text2);margin-top:2px">${dateLabel}</div>
      </div>
      <button class="btn-sm btn-secondary" style="font-size:.78rem;white-space:nowrap"
        onclick="App.navigate('timetable')">Full Timetable →</button>
    </div>

    ${mySlots.length > 0 ? `
    <div style="margin-bottom:${dueToday.length + dueTmrw.length > 0 ? '14px' : '0'}">
      <div style="font-size:.72rem;color:var(--text2);font-weight:700;text-transform:uppercase;
        letter-spacing:.7px;margin-bottom:8px">Today's Classes (${mySlots.length})</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${mySlots.map(s => `
        <div style="background:var(--bg3);border:1px solid var(--border);
          border-left:3px solid var(--accent);border-radius:8px;padding:9px 13px">
          <div style="font-weight:700;font-size:.84rem;color:var(--accent)">${s.courseCode}</div>
          <div style="font-size:.8rem;color:var(--text);margin-top:1px">${s.courseName}</div>
          <div style="font-size:.74rem;color:var(--text2);margin-top:3px">
            ${_fmt(s.start)}–${_fmt(s.end)} · 📍 ${s.room.split(',')[0]}
          </div>
        </div>`).join('')}
      </div>
    </div>` : `
    <div style="font-size:.84rem;color:var(--text2);margin-bottom:${dueToday.length + dueTmrw.length > 0 ? '14px' : '0'}">
      ✅ No classes scheduled today — enjoy the break!
    </div>`}

    ${dueToday.length > 0 ? `
    <div style="margin-bottom:${dueTmrw.length > 0 ? '10px' : '0'}">
      <div style="font-size:.72rem;color:var(--red);font-weight:700;text-transform:uppercase;
        letter-spacing:.7px;margin-bottom:8px">⚠️ Due Today (${dueToday.length})</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${dueToday.map(a => `
        <div onclick="App.navigate('assignments')" style="cursor:pointer;
          background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.28);
          border-radius:8px;padding:7px 12px">
          <span style="font-weight:600;font-size:.83rem">${a.title}</span>
          <span style="color:var(--text2);font-size:.77rem;margin-left:6px">${a.courseCode}</span>
        </div>`).join('')}
      </div>
    </div>` : ''}

    ${dueTmrw.length > 0 ? `
    <div>
      <div style="font-size:.72px;color:var(--yellow);font-weight:700;text-transform:uppercase;
        letter-spacing:.7px;margin-bottom:8px;font-size:.72rem">📌 Due Tomorrow (${dueTmrw.length})</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${dueTmrw.map(a => `
        <div onclick="App.navigate('assignments')" style="cursor:pointer;
          background:rgba(255,209,102,.1);border:1px solid rgba(255,209,102,.28);
          border-radius:8px;padding:7px 12px">
          <span style="font-weight:600;font-size:.83rem">${a.title}</span>
          <span style="color:var(--text2);font-size:.77rem;margin-left:6px">${a.courseCode}</span>
        </div>`).join('')}
      </div>
    </div>` : ''}

  </div>`;
}

function _fmt(h) {
  return `${h <= 12 ? h : h - 12}:00${h < 12 ? 'am' : 'pm'}`;
}

function _dueTodayCount() {
  const today = new Date().toISOString().slice(0, 10);
  const subs  = new Set(
    JSON.parse(localStorage.getItem('edunexus_submissions') || '[]').map(s => s.assignmentId)
  );
  return JSON.parse(localStorage.getItem('edunexus_assignments') || '[]')
    .filter(a => a.dueDate === today && !subs.has(a.id)).length || 3;
}
