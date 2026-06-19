function _studentDash(c) {
  c.innerHTML = `
  <div class="stats-grid">
    ${Utils.statCard('📚','rgba(108,99,255,.15)','6','Active Courses','↑ 1 new this semester','up')}
    ${Utils.statCard('📊','rgba(0,212,170,.15)','83.4%','Overall GPA','↑ 2.1% from last semester','up')}
    ${Utils.statCard('📝','rgba(255,209,102,.15)','2','Upcoming Exams','Next: Mon 9am','')}
    ${Utils.statCard('⚡','rgba(255,107,107,.15)','3','Assignments Due','Submit by Friday','down')}
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
