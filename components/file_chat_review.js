/* ═══════════════════════════════════════════════════
   components/file-upload.js
   Real file handling with preview, type detection,
   and base64 storage (swap for Supabase Storage in prod)
════════════════════════════════════════════════════ */
const FileUpload = (() => {

  let pendingFile = null;

  const ALLOWED = {
    'application/pdf':                         { label:'PDF',   icon:'📄', pill:'pill-red'    },
    'video/mp4':                               { label:'Video', icon:'🎥', pill:'pill-accent'  },
    'video/webm':                              { label:'Video', icon:'🎥', pill:'pill-accent'  },
    'application/vnd.ms-powerpoint':           { label:'Slides',icon:'📑', pill:'pill-yellow'  },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                                               { label:'Slides',icon:'📑', pill:'pill-yellow'  },
    'application/msword':                      { label:'Doc',   icon:'📝', pill:'pill-blue'    },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                                               { label:'Doc',   icon:'📝', pill:'pill-blue'    },
    'application/zip':                         { label:'ZIP',   icon:'🗜️', pill:'pill-purple'  },
    'text/plain':                              { label:'Text',  icon:'📄', pill:'pill-blue'    },
  };

  /** Renders a drag-and-drop upload zone into `containerId` */
  function renderZone(containerId, onUploaded) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="upload-zone" id="uz-${containerId}"
           ondragover="event.preventDefault();this.style.borderColor='var(--accent)'"
           ondragleave="this.style.borderColor=''"
           ondrop="FileUpload._drop(event,'${containerId}',arguments)">
        <div class="upload-icon">☁️</div>
        <p>Drag & drop your file here or <span style="color:var(--accent);cursor:pointer" onclick="document.getElementById('fi-${containerId}').click()">browse</span></p>
        <p style="margin-top:6px;font-size:.78rem;opacity:.6">PDF · PPT · MP4 · DOC · ZIP · TXT — max 50 MB</p>
        <input type="file" id="fi-${containerId}" style="display:none"
               accept=".pdf,.ppt,.pptx,.mp4,.webm,.doc,.docx,.zip,.txt"
               onchange="FileUpload._fileSelected(event,'${containerId}')">
      </div>
      <div id="up-preview-${containerId}" style="display:none;margin-top:12px"></div>`;

    // store callback
    FileUpload._callbacks = FileUpload._callbacks || {};
    FileUpload._callbacks[containerId] = onUploaded;
  }

  function _drop(event, cid) {
    event.preventDefault();
    document.getElementById(`uz-${cid}`).style.borderColor = '';
    const file = event.dataTransfer.files[0];
    if (file) _process(file, cid);
  }

  function _fileSelected(event, cid) {
    const file = event.target.files[0];
    if (file) _process(file, cid);
  }

  function _process(file, cid) {
    if (file.size > 50 * 1024 * 1024) {
      Utils.toast('File exceeds 50 MB limit', 'error');
      return;
    }
    pendingFile = file;
    const meta  = ALLOWED[file.type] || { label: 'File', icon: '📁', pill: 'pill-accent' };
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

    const preview = document.getElementById(`up-preview-${cid}`);
    preview.style.display = 'block';
    preview.innerHTML = `
      <div class="material-item" style="background:var(--bg3)">
        <div class="material-icon" style="background:rgba(108,99,255,.15)">${meta.icon}</div>
        <div class="material-info">
          <div class="material-name">${file.name}</div>
          <div class="material-meta"><span class="pill ${meta.pill}">${meta.label}</span> ${sizeMB} MB</div>
        </div>
        <div style="color:var(--green);font-size:1.2rem">✓</div>
      </div>`;

    // Store callback result object
    if (FileUpload._callbacks?.[cid]) {
      FileUpload._callbacks[cid]({
        file,
        name:  file.name,
        type:  meta.label,
        icon:  meta.icon,
        pill:  meta.pill,
        size:  sizeMB + ' MB',
      });
    }
  }

  return { renderZone, _drop, _fileSelected, _process };
})();


/* ═══════════════════════════════════════════════════
   components/chat.js
════════════════════════════════════════════════════ */
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


/* ═══════════════════════════════════════════════════
   components/reviews.js
════════════════════════════════════════════════════ */
const Reviews = (() => {

  const mockReviews = [
    { tag:'Teaching Quality', text:'Professor Williams is outstanding. She breaks complex algorithms into digestible steps.', stars:5, course:'Data Structures', time:'2 hours ago' },
    { tag:'Infrastructure',   text:'The computer labs desperately need upgrades. Half the machines are too slow for modern IDEs.', stars:2, course:'General', time:'Yesterday' },
    { tag:'Course Content',   text:'The OS curriculum is very well structured. Loved the practical projects.', stars:4, course:'Operating Systems', time:'2 days ago' },
    { tag:'Admin Process',    text:'Registration process is way too complicated. Took 3 weeks to resolve a conflict.', stars:2, course:'Administration', time:'3 days ago' },
    { tag:'Teaching Quality', text:'The algorithms course is tough but fair. Would appreciate more office hours.', stars:3, course:'Algorithms', time:'4 days ago' },
  ];

  function render(c) {
    const canReview = State.currentRole === 'student';
    const canManage = ['facilitator','uni-admin','super-admin','ministry'].includes(State.currentRole);

    c.innerHTML = `
    <div class="section-header">
      <div style="font-size:.9rem;color:var(--text2)">🔒 All reviews are submitted anonymously</div>
      ${canReview ? `<button class="btn-sm btn-primary" onclick="Reviews.openForm()">+ Write Review</button>` : ''}
    </div>
    ${mockReviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-author">👤 Anonymous · ${r.time}</div>
        <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
      </div>
      <div class="review-text">${r.text}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
        <div class="review-tag"># ${r.tag} · ${r.course}</div>
        ${canManage ? `<div style="display:flex;gap:6px">
          <button class="btn-sm btn-secondary" onclick="Reviews.reply(this)">Reply</button>
          <button class="btn-sm btn-danger"    onclick="Reviews.flag(this)">Flag</button>
        </div>` : ''}
      </div>
    </div>`).join('')}`;
  }

  function openForm() {
    Utils.openModal('Write Anonymous Review', `
      <div style="background:rgba(108,99,255,.08);border:1px solid rgba(108,99,255,.2);border-radius:8px;padding:12px;margin-bottom:16px;font-size:.85rem;color:var(--text2)">
        🔒 Your identity is never revealed. Reviews are fully anonymous.
      </div>
      <div class="form-group"><label>Category</label>
        <select><option>Teaching Quality</option><option>Infrastructure</option><option>Course Content</option><option>Admin Process</option><option>Other</option></select>
      </div>
      <div class="form-group"><label>Course (optional)</label>
        <select><option>General</option>${State.courses.map(c => `<option>${c.name} (${c.code})</option>`).join('')}</select>
      </div>
      <div class="form-group"><label>Rating</label>
        <div style="display:flex;gap:10px;font-size:1.5rem;cursor:pointer" id="star-row">
          ${[1,2,3,4,5].map(i => `<span onclick="Utils.setStars(${i})">☆</span>`).join('')}
        </div>
      </div>
      <div class="form-group"><label>Your Review</label>
        <textarea class="answer-box" id="review-text" placeholder="Share your honest experience…"></textarea>
      </div>
      <div style="display:flex;gap:10px;margin-top:4px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-primary"   style="flex:1" onclick="Reviews.submit()">Submit Anonymously</button>
      </div>`);
  }

  function submit() {
    Utils.closeModal();
    Utils.toast('Review submitted anonymously! Thank you.', 'success');
  }

  function reply(btn) { Utils.toast('Reply feature coming soon', 'info'); }
  function flag(btn)  { Utils.toast('Review flagged for review', 'error'); }

  return { render, openForm, submit, reply, flag };
})();

App.register('reviews', c => Reviews.render(c));