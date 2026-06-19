App.register('ai-advisor', c => {
  c.innerHTML = `
  <div style="display:grid;grid-template-columns:1fr 300px;gap:20px;height:calc(100vh - 160px)">
    <div class="card" style="display:flex;flex-direction:column;padding:0;overflow:hidden">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px">
        <div class="ai-icon">🤖</div>
        <div><div style="font-weight:700">EduNexus AI Advisor</div><div style="font-size:.78rem;color:var(--green)">● Online · Powered by Claude</div></div>
      </div>
      <div class="ai-messages" id="ai-msgs">
        <div class="ai-msg ai-msg-ai">
          <div class="ai-icon">🤖</div>
          <div class="ai-bubble">Hi ${State.currentUser().name.split(' ')[0]}! 👋 I've analysed your grades across ${State.courses.length} courses.<br><br>
            Strongest: <strong>OS (91%)</strong> and <strong>Data Structures (88%)</strong>.<br>
            Focus area: <strong>Database Systems (70%)</strong> — especially SQL joins and normalisation.<br><br>
            How can I help you today?
          </div>
        </div>
        ${State.aiHistory.map(m => `
        <div class="ai-msg ${m.role === 'user' ? 'user-msg' : 'ai-msg-ai'}">
          ${m.role === 'assistant' ? '<div class="ai-icon">🤖</div>' : ''}
          <div class="ai-bubble">${m.content}</div>
          ${m.role === 'user' ? `<div class="ai-icon" style="background:linear-gradient(135deg,var(--accent),#8b5cf6)">${Utils.initials(State.currentUser().name)}</div>` : ''}
        </div>`).join('')}
      </div>
      <div style="padding:16px;border-top:1px solid var(--border);display:flex;gap:10px">
        <input type="text" id="ai-input" class="ai-input-area" style="flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px 16px;color:var(--text);font-size:.9rem;outline:none"
               placeholder="Ask anything about your studies…"
               onkeydown="if(event.key==='Enter')AIAdvisor.send()">
        <button class="ai-send" onclick="AIAdvisor.send()">Send</button>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px;overflow-y:auto">
      <div class="card">
        <div class="card-title">📊 My Performance</div>
        ${State.courses.map(co => `
        <div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:3px">
            <span style="color:var(--text2)">${co.code}</span>
            <span style="color:${Utils.gradeColor(co.grade)};font-weight:700">${co.grade}%</span>
          </div>
          ${Utils.progressBar(co.grade, Utils.gradeColor(co.grade))}
        </div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title">💡 Quick Questions</div>
        ${[
          'How can I improve my DB grade?',
          'What should I study for the DS exam?',
          'Explain recursion simply',
          'Create a weekly study plan for me',
          'What are my weakest topics?',
        ].map(q => `
        <div style="padding:8px 10px;background:var(--bg3);border-radius:8px;margin-bottom:6px;cursor:pointer;font-size:.82rem;transition:.2s"
             onmouseover="this.style.background='rgba(108,99,255,.15)'"
             onmouseout="this.style.background='var(--bg3)'"
             onclick="document.getElementById('ai-input').value='${q}';AIAdvisor.send()">${q}</div>`).join('')}
      </div>
    </div>
  </div>`;
});

const AIAdvisor = (() => {
  const SYSTEM = `You are EduNexus AI Advisor, a personalized learning assistant.
Student: Alex Johnson, Computer Science.
Grades: Data Structures 88%, Algorithms 76%, Operating Systems 91%, Database Systems 70%, Computer Networks 82%, Software Engineering 85%.
Be concise, friendly, and actionable. Give specific advice based on their grades. Respond in 2–4 sentences unless asked for more detail.`;

  async function send() {
    const inp = document.getElementById('ai-input');
    const msg = inp?.value.trim();
    if (!msg) return;
    inp.value = '';

    State.aiHistory.push({ role:'user', content: msg });
    _appendMsg('user', msg);
    _showTyping();

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM,
          messages: State.aiHistory,
        }),
      });
      const data  = await resp.json();
      const reply = data.content?.map(b => b.text || '').join('') || 'Connection error. Please try again.';
      State.aiHistory.push({ role:'assistant', content: reply });
      _removeTyping();
      _appendMsg('assistant', reply);
    } catch {
      _removeTyping();
      _appendMsg('assistant', 'I\'m having trouble connecting. Please try again in a moment.');
    }
  }

  function _appendMsg(role, text) {
    const msgs = document.getElementById('ai-msgs');
    if (!msgs) return;
    msgs.innerHTML += role === 'user'
      ? `<div class="ai-msg user-msg"><div class="ai-bubble">${text}</div><div class="ai-icon" style="background:linear-gradient(135deg,var(--accent),#8b5cf6)">${Utils.initials(State.currentUser().name)}</div></div>`
      : `<div class="ai-msg ai-msg-ai"><div class="ai-icon">🤖</div><div class="ai-bubble">${text}</div></div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }

  function _showTyping() {
    const msgs = document.getElementById('ai-msgs');
    if (msgs) msgs.innerHTML += `<div class="ai-msg ai-msg-ai" id="typing-ind"><div class="ai-icon">🤖</div><div class="ai-bubble"><div class="typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div></div>`;
  }

  function _removeTyping() {
    document.getElementById('typing-ind')?.remove();
  }

  return { send };
})();
