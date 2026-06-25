App.register('stu-attendance', c => {
  const stored  = JSON.parse(localStorage.getItem('edunexus_attendance') || '[]');
  const user    = State.currentUser();
  const student = State.students.find(s => s.name === user.name) || State.students[0];

  // Group sessions by course
  const byCourse = {};
  State.courses.forEach(co => { byCourse[co.code] = { name: co.name, sessions: [] }; });
  stored.forEach(session => {
    const rec = session.records.find(r => r.studentId === student.id);
    if (!rec || !byCourse[session.courseCode]) return;
    byCourse[session.courseCode].sessions.push({
      date:    session.date,
      title:   session.lectureTitle,
      present: rec.present,
    });
  });

  // Overall stats
  let totalSessions = 0, totalPresent = 0;
  Object.values(byCourse).forEach(co => {
    totalSessions += co.sessions.length;
    totalPresent  += co.sessions.filter(s => s.present).length;
  });
  const overallPct = totalSessions ? Math.round(totalPresent / totalSessions * 100) : null;
  const atRisk     = overallPct !== null && overallPct < 75;

  c.innerHTML = `
  ${overallPct !== null ? `
  <div class="stats-grid" style="margin-bottom:20px">
    ${Utils.statCard('✅', 'rgba(0,212,170,.15)', overallPct + '%', 'Overall Attendance',
      atRisk ? '⚠️ Below 75% — at risk' : 'Above minimum threshold',
      atRisk ? 'down' : 'up')}
    ${Utils.statCard('📅', 'rgba(108,99,255,.15)', totalSessions,              'Sessions Held',     '')}
    ${Utils.statCard('✓',  'rgba(0,212,170,.15)',  totalPresent,               'Sessions Attended', '')}
    ${Utils.statCard('✗',  'rgba(255,107,107,.15)', totalSessions - totalPresent, 'Sessions Missed', '')}
  </div>` : ''}

  <div class="card" style="margin-bottom:16px">
    <div class="card-title">📚 Attendance by Course</div>
    ${stored.length === 0
      ? `<div style="text-align:center;padding:30px 0;color:var(--text2)">
          <div style="font-size:2rem;margin-bottom:8px">📋</div>
          <div>No attendance has been recorded by your facilitators yet.</div>
         </div>`
      : Object.entries(byCourse).map(([code, co]) => {
          const total   = co.sessions.length;
          if (total === 0) return `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
              <div style="flex:1">
                <div style="font-size:.87rem;font-weight:600">${co.name}</div>
                <div style="font-size:.75rem;color:var(--text2)">${code} · No sessions recorded</div>
              </div>
              <div class="pill" style="background:var(--bg3);color:var(--text2)">—</div>
            </div>`;
          const present = co.sessions.filter(s => s.present).length;
          const pct     = Math.round(present / total * 100);
          const col     = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--yellow)' : 'var(--red)';
          const pill    = pct >= 80 ? 'pill-green'   : pct >= 60 ? 'pill-yellow'   : 'pill-red';
          return `
          <div style="padding:12px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <div>
                <div style="font-size:.87rem;font-weight:600">${co.name}</div>
                <div style="font-size:.75rem;color:var(--text2)">${code} · ${present}/${total} sessions</div>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                ${pct < 75 ? `<span style="font-size:.75rem;color:var(--red);font-weight:600">⚠️ At Risk</span>` : ''}
                <div class="pill ${pill}">${pct}%</div>
              </div>
            </div>
            ${Utils.progressBar(pct, col)}
            <div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap">
              ${co.sessions.slice(-15).map(s => `
              <div title="${s.date}: ${s.title}"
                style="width:18px;height:18px;border-radius:3px;
                  background:${s.present ? 'rgba(0,212,170,.3)' : 'rgba(255,107,107,.25)'};
                  border:1px solid ${s.present ? 'rgba(0,212,170,.5)' : 'rgba(255,107,107,.45)'}">
              </div>`).join('')}
            </div>
          </div>`;
        }).join('')
    }
  </div>

  ${atRisk ? `
  <div style="background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.3);border-radius:12px;padding:16px;display:flex;gap:12px;align-items:flex-start">
    <div style="font-size:1.5rem">⚠️</div>
    <div>
      <div style="font-weight:700;color:var(--red);margin-bottom:4px">Attendance At Risk</div>
      <div style="font-size:.85rem;color:var(--text2);line-height:1.6">
        Your overall attendance (${overallPct}%) is below the 75% minimum threshold.
        This may affect your eligibility to sit examinations. Please speak with your academic advisor.
      </div>
    </div>
  </div>` : ''}`;
});
