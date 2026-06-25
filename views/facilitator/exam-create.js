App.register('exam-create', c => {
  State.qCount = 1;
  c.innerHTML = `
  <div class="card" style="margin-bottom:20px">
    <div class="card-title">📝 Exam Details</div>
    <div class="grid-2">
      <div class="form-group"><label>Exam Title</label><input type="text" id="ex-title" placeholder="e.g. Data Structures Midterm"></div>
      <div class="form-group"><label>Course</label><select id="ex-course">${State.courses.map(c=>`<option>${c.name} (${c.code})</option>`).join('')}</select></div>
      <div class="form-group"><label>Date & Time</label><input type="datetime-local" id="ex-date"></div>
      <div class="form-group"><label>Duration (minutes)</label><input type="number" id="ex-dur" placeholder="90"></div>
      <div class="form-group"><label>Total Points</label><input type="number" id="ex-pts" placeholder="100"></div>
      <div class="form-group"><label>Grading Mode</label>
        <select id="ex-mode">
          <option>Mixed (Auto + Manual)</option>
          <option>Fully Manual</option>
          <option>Fully Automatic</option>
        </select>
      </div>
    </div>
  </div>
  <div id="questions-list">${ExamCreate.questionHTML(1, 'mcq')}</div>
  <div style="display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap">
    ${State.questionTypes.map(qt => `<button class="btn-sm btn-secondary" onclick="ExamCreate.addQuestion('${qt.value}')">+ ${qt.label}</button>`).join('')}
    <button class="btn-sm btn-primary"    onclick="ExamCreate.publish()">💾 Publish Exam</button>
    <button class="btn-sm btn-secondary"  onclick="Utils.toast('Draft saved!','success')">Save Draft</button>
  </div>`;
});

const ExamCreate = (() => {
  function questionHTML(num, type) {
    const typeLabel = State.questionTypes.find(t => t.value === type)?.label || 'Question';
    let body = '';

    if (type === 'mcq') {
      body = `
        ${['A','B','C','D'].map(l=>`<input type="text" style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:8px 12px;color:var(--text);width:100%;margin-bottom:6px;outline:none" placeholder="${l}. Option text">`).join('')}
        <div class="form-group" style="margin-top:8px"><label>Correct Answer</label><select style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:7px;color:var(--text)"><option>A</option><option>B</option><option>C</option><option>D</option></select></div>`;
    } else if (type === 'tf') {
      body = `<div class="form-group"><label>Correct Answer</label><select style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:7px;color:var(--text)"><option>True</option><option>False</option></select></div>`;
    } else if (type === 'fill') {
      body = `<div class="form-group"><label>Answer Key</label><input type="text" style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:8px 12px;color:var(--text);width:100%;outline:none" placeholder="Correct answer(s) separated by comma"></div>`;
    } else if (type === 'match') {
      body = `
        <div class="grid-2" style="gap:10px">
          <div>
            ${[1,2,3,4].map(i=>`<input type="text" style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:8px;color:var(--text);margin-bottom:6px;outline:none" placeholder="Term ${i}">`).join('')}
          </div>
          <div>
            ${[1,2,3,4].map(i=>`<input type="text" style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:8px;color:var(--text);margin-bottom:6px;outline:none" placeholder="Definition ${i}">`).join('')}
          </div>
        </div>`;
    } else if (type === 'code') {
      body = `
        <div class="form-group"><label>Language</label><select style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:7px;color:var(--text)"><option>Python</option><option>JavaScript</option><option>Java</option><option>C++</option></select></div>
        <div class="form-group"><label>Test Cases (one per line: input → expected output)</label><textarea class="code-box" style="min-height:80px" placeholder="[1,2,3] → 6\n[] → 0"></textarea></div>`;
    } else if (type === 'written') {
      body = `
        <div class="form-group"><label>Rubric / Grading Instructions</label><textarea class="answer-box" style="min-height:70px" placeholder="Describe what a full-mark answer should include…"></textarea></div>
        <div style="font-size:.8rem;color:var(--yellow);margin-top:4px">📝 This question requires manual grading</div>`;
    }

    return `
    <div class="card" style="margin-bottom:16px" id="q-card-${num}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div class="card-title" style="margin-bottom:0">Q${num} · ${typeLabel}</div>
        <button class="btn-sm btn-danger" onclick="this.closest('.card').remove()">Remove</button>
      </div>
      <div class="form-group"><label>Question Text</label><textarea class="answer-box" style="min-height:70px" placeholder="Enter your question…"></textarea></div>
      ${body}
      <div class="form-group" style="margin-top:8px"><label>Points</label><input type="number" placeholder="5" style="width:80px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:8px;color:var(--text);outline:none"></div>
    </div>`;
  }

  function addQuestion(type) {
    State.qCount++;
    document.getElementById('questions-list').insertAdjacentHTML('beforeend', questionHTML(State.qCount, type));
  }

  function publish() {
    const title = document.getElementById('ex-title')?.value.trim();
    if (!title) { Utils.toast('Please enter an exam title', 'error'); return; }
    Utils.toast(`Exam "${title}" published!`, 'success');
    Notifications.notifyExamScheduled(title, document.getElementById('ex-date')?.value || 'TBD');
  }

  return { questionHTML, addQuestion, publish };
})();
