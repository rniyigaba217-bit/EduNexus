App.register('grade-papers', c => {
  c.innerHTML = `
  <div style="background:rgba(255,209,102,.08);border:1px solid rgba(255,209,102,.2);border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:.88rem;color:var(--yellow)">
    📋 <strong>${State.pendingPapers.length} written papers</strong> require manual grading for <strong>Data Structures Midterm (Q4)</strong>.
  </div>
  ${State.pendingPapers.map((s, i) => `
  <div class="grade-entry" id="paper-${i}">
    <div class="grade-entry-top">
      <div><div style="font-weight:700">${s.name}</div><div style="font-size:.78rem;color:var(--text2)">ID: ${s.id}</div></div>
      <div class="pill pill-yellow" id="paper-status-${i}">Pending</div>
    </div>
    <div style="font-size:.78rem;color:var(--text2);margin-bottom:6px">Student's answer:</div>
    <div class="student-answer">${s.answer}</div>
    <div style="font-size:.78rem;color:var(--text2);margin-bottom:6px;margin-top:10px">Feedback comment:</div>
    <textarea class="comment-box" id="comment-${i}" placeholder="Add feedback for the student (will be visible to them)…"></textarea>
    <div class="grade-input-row" style="margin-top:10px">
      <span style="font-size:.85rem;color:var(--text2)">Score:</span>
      <input type="number" class="grade-input" id="score-${i}" placeholder="0" min="0" max="15">
      <span style="font-size:.85rem;color:var(--text2)">/ 15</span>
      <button class="btn-sm btn-success" style="margin-left:8px" onclick="GradePapers.save(${i})">✓ Save Grade</button>
    </div>
  </div>`).join('')}`;
});

const GradePapers = (() => {
  function save(i) {
    const score   = document.getElementById(`score-${i}`)?.value;
    const comment = document.getElementById(`comment-${i}`)?.value;
    if (!score) { Utils.toast('Please enter a score', 'error'); return; }
    const status = document.getElementById(`paper-status-${i}`);
    if (status) { status.className = 'pill pill-green'; status.textContent = `Graded ${score}/15`; }
    Utils.toast(`Grade saved for ${State.pendingPapers[i].name}`, 'success');
    Notifications.notifyGradePosted(State.pendingPapers[i].name, 'Data Structures Midterm', `${score}/15`);
  }
  return { save };
})();
