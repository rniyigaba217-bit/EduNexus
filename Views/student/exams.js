App.register('exams', c => {
  c.innerHTML = `
  <div class="grid-2" style="margin-bottom:20px">
    <div class="card">
      <div class="card-title">📝 Upcoming Exams</div>
      ${[
        ['Data Structures Midterm','CS301','Mon Jun 23 · 9:00am','90 min','50 pts'],
        ['Networks Quiz',          'CS305','Thu Jun 26 · 3:00pm','30 min','20 pts'],
      ].map(([n,code,d,dur,pts]) => `
      <div style="padding:14px;background:var(--bg3);border-radius:10px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div><div style="font-weight:700">${n}</div><div style="font-size:.8rem;color:var(--text2)">${code} · ${d}</div></div>
          <div class="pill pill-red">Upcoming</div>
        </div>
        <div style="display:flex;gap:8px;font-size:.78rem;color:var(--text2);margin-bottom:10px">
          <span>⏱ ${dur}</span><span>📊 ${pts}</span>
        </div>
        <button class="btn-sm btn-primary" onclick="StudentExam.start()">Start Exam</button>
      </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-title">✅ Completed Exams</div>
      ${[
        ['Algorithms Quiz 1','CS302','88/100','Jun 10'],
        ['OS Assignment',    'CS303','91/100','Jun 5' ],
        ['DB Quiz',          'CS304','70/100','May 28'],
      ].map(([n,code,g,d]) => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="flex:1"><div style="font-size:.87rem;font-weight:600">${n}</div><div style="font-size:.77rem;color:var(--text2)">${code} · ${d}</div></div>
        <div style="font-weight:700;color:${parseInt(g)>=85?'var(--green)':parseInt(g)>=70?'var(--yellow)':'var(--red)'}">${g}</div>
      </div>`).join('')}
    </div>
  </div>`;
});

const StudentExam = (() => {
  let timerInterval = null;
  let secs = 5400;

  function start() {
    secs = 5400;
    Utils.openModal('Data Structures Midterm', `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div><strong>CS301</strong> · 50 points · 90 minutes</div>
        <div class="exam-timer" id="modal-timer">1:30:00</div>
      </div>

      <div class="exam-card">
        <div class="question-num">Q1 · Multiple Choice · 5 pts</div>
        <div class="question-text">Which data structure operates on the LIFO principle?</div>
        ${[['A','Queue'],['B','Stack'],['C','Linked List'],['D','Binary Tree']].map(([l,t]) =>
          `<div class="option" onclick="StudentExam.selectOpt(this)">
            <div class="option-circle"></div><strong>${l}.</strong> ${t}
          </div>`).join('')}
      </div>

      <div class="exam-card">
        <div class="question-num">Q2 · True / False · 5 pts</div>
        <div class="question-text">A Binary Search Tree always has O(log n) search time.</div>
        ${[['True'],['False']].map(([t]) =>
          `<div class="option" onclick="StudentExam.selectOpt(this)">
            <div class="option-circle"></div>${t}
          </div>`).join('')}
      </div>

      <div class="exam-card">
        <div class="question-num">Q3 · Fill in the Blank · 5 pts</div>
        <div class="question-text">The time complexity of inserting into a hash table on average is ______.</div>
        <input type="text" style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 14px;color:var(--text);width:100%;outline:none;margin-top:6px" placeholder="Your answer…">
      </div>

      <div class="exam-card">
        <div class="question-num">Q4 · Written / Critical Thinking · 15 pts</div>
        <div class="question-text">Explain the difference between DFS and BFS. When would you prefer one over the other? Give an example use case for each.</div>
        <textarea class="answer-box" placeholder="Write your answer here…"></textarea>
        <div style="font-size:.78rem;color:var(--text2);margin-top:6px">📝 Manually graded by your professor with comments</div>
      </div>

      <div class="exam-card">
        <div class="question-num">Q5 · Code · 10 pts</div>
        <div class="question-text">Implement a Python function that checks if a string is a palindrome using a stack.</div>
        <textarea class="code-box" placeholder="def is_palindrome(s):\n    # Your code here\n    pass"></textarea>
        <div style="font-size:.78rem;color:var(--text2);margin-top:6px">⚡ Auto-graded against test cases</div>
      </div>

      <div class="exam-card">
        <div class="question-num">Q6 · Matching · 10 pts</div>
        <div class="question-text">Match each data structure to its best use case.</div>
        <div class="grid-2" style="gap:10px;margin-top:8px">
          <div>
            ${['Stack','Queue','Heap','Hash Table'].map((t,i) =>
              `<div style="padding:8px 12px;background:var(--bg3);border-radius:6px;margin-bottom:6px;font-size:.85rem">${i+1}. ${t}</div>`).join('')}
          </div>
          <div>
            ${['A. Priority scheduling','B. Browser history','C. Key-value lookup','D. Print queue'].map(t =>
              `<select style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:6px;color:var(--text);margin-bottom:6px">
                <option>Match…</option><option>1</option><option>2</option><option>3</option><option>4</option>
              </select>`).join('')}
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px">
        <button class="btn-sm btn-secondary" onclick="Utils.closeModal()">Save Draft</button>
        <button class="btn-sm btn-primary"   onclick="StudentExam.submit()">Submit Exam →</button>
      </div>`);
    _tick();
  }

  function _tick() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      secs--;
      const el = document.getElementById('modal-timer');
      if (!el) { clearInterval(timerInterval); return; }
      const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
      el.textContent = `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      el.className = 'exam-timer' + (secs < 600 ? ' warning' : '') + (secs < 120 ? ' danger' : '');
      if (secs <= 0) { clearInterval(timerInterval); submit(); }
    }, 1000);
    State.modalTimer = timerInterval;
  }

  function selectOpt(el) {
    el.closest('.exam-card').querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
  }

  function submit() {
    clearInterval(timerInterval);
    Utils.closeModal();
    Utils.toast('Exam submitted! Written answers will be graded by your professor.', 'success');
    Notifications.notifyGradePosted('Alex Johnson', 'Data Structures', 'Pending manual grading');
  }

  return { start, selectOpt, submit };
})();
