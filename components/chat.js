const Chat = (() => {

  const rooms = [
    { id:'cs-general', name:'#cs-general',          icon:'💬', preview:'I finished it, happy to help' },
    { id:'math-201',   name:'#math-201',             icon:'📐', preview:'The calculus notes are gold'  },
    { id:'net-305',    name:'#networks-305',         icon:'🌐', preview:'Anyone understand subnetting?' },
    { id:'reviews',    name:'🔒 Anonymous Reviews',  icon:'⭐', preview:'Anonymous review forum'       },
  ];

  function render(c) {
    c.innerHTML = `
    <div class="chat-layout">
      <div class="chat-sidebar">
        <div class="chat-header">💬 Chat Rooms</div>
        ${rooms.map(r => `
        <div class="chat-room ${r.id === State.activeChatRoom ? 'active' : ''}"
             onclick="Chat.switchRoom('${r.id}')">
          <div class="room-name">${r.icon} ${r.name}</div>
          <div class="room-preview">${r.preview}</div>
        </div>`).join('')}
      </div>
      <div class="chat-main">
        <div class="chat-topbar">
          <div><strong>${rooms.find(r => r.id === State.activeChatRoom)?.name || ''}</strong></div>
          ${State.activeChatRoom === 'reviews' ? '<div class="pill pill-purple">👤 All messages are anonymous</div>' : ''}
        </div>
        <div class="chat-messages" id="chat-msgs">${_renderMsgs()}</div>
        <div class="chat-input-area">
          ${State.activeChatRoom !== 'reviews'
            ? `<label class="anon-toggle"><input type="checkbox" id="anon-cb" ${State.anonMode ? 'checked' : ''} onchange="State.anonMode=this.checked"> 👤 Anon</label>`
            : '<div style="font-size:.78rem;color:var(--text2)">👤 Anonymous</div>'}
          <input type="text" id="chat-input" placeholder="Type a message…" onkeydown="if(event.key==='Enter')Chat.send()">
          <button class="send-btn" onclick="Chat.send()">Send</button>
        </div>
      </div>
    </div>`;
  }

  function _renderMsgs() {
    const msgs = State.chatMessages[State.activeChatRoom] || [];
    const me   = State.currentUser().name;
    return msgs.map(m => `
    <div class="msg ${m.user === me && !m.anon ? 'own' : ''}">
      <div class="msg-avatar" style="background:${m.anon ? 'var(--bg3)' : 'linear-gradient(135deg,var(--accent),var(--accent2))'}">
        ${m.anon ? '👤' : Utils.initials(m.user)}
      </div>
      <div class="msg-body">
        <div class="msg-meta">${m.anon ? 'Anonymous' : m.user} · ${m.time}</div>
        <div class="msg-text ${m.anon ? 'msg-anon' : ''}">${m.text}</div>
      </div>
    </div>`).join('');
  }

  function switchRoom(id) {
    State.activeChatRoom = id;
    App.navigate('chat');
  }

  function send() {
    const inp    = document.getElementById('chat-input');
    const anonCb = document.getElementById('anon-cb');
    const isAnon = State.activeChatRoom === 'reviews' || (anonCb?.checked);
    const txt    = inp.value.trim();
    if (!txt) return;

    State.addChatMessage(State.activeChatRoom, {
      user: State.currentUser().name,
      text: txt,
      anon: isAnon,
      time: Utils.formatTime(),
    });
    inp.value = '';

    const msgsEl = document.getElementById('chat-msgs');
    if (msgsEl) { msgsEl.innerHTML = _renderMsgs(); msgsEl.scrollTop = msgsEl.scrollHeight; }
  }

  return { render, switchRoom, send };
})();

App.register('chat', c => Chat.render(c));
