/* ── Seed counselors + initial appointments ─────────────────── */
(() => {
  const existingC = JSON.parse(localStorage.getItem('edunexus_counselors')  || '[]');
  const existingA = JSON.parse(localStorage.getItem('edunexus_appointments') || '[]');
  if (localStorage.getItem('edunexus_counseling_seeded') && existingC.length > 0 && existingA.length > 0) return;

  const counselors = [
    { id:'C-001', name:'Dr. Amara Diallo',   spec:'Academic Stress & Anxiety',
      bio:'Registered counsellor with 8+ years of experience in student wellbeing. Specialises in exam anxiety, burnout, time management, and improving academic performance.',
      avatar:'AD', color:'var(--accent)',  available:true,
      slots:[{day:'Monday',time:'10:00 AM'},{day:'Wednesday',time:'2:00 PM'},{day:'Friday',time:'11:00 AM'}] },
    { id:'C-002', name:'Ms. Kezia Muthoni',  spec:'Personal & Emotional Support',
      bio:'Qualified counsellor specialising in life transitions, relationship difficulties, grief, and the unique emotional pressures of university life. LGBTQ+ affirming.',
      avatar:'KM', color:'var(--accent2)', available:true,
      slots:[{day:'Tuesday',time:'9:00 AM'},{day:'Thursday',time:'3:00 PM'},{day:'Friday',time:'9:00 AM'}] },
    { id:'C-003', name:'Mr. Kwesi Amponsah', spec:'Career & Future Planning',
      bio:'Career counsellor helping students explore career paths, build professional skills, prepare for interviews, and navigate internship and graduate programme applications.',
      avatar:'KA', color:'var(--yellow)',  available:true,
      slots:[{day:'Monday',time:'2:00 PM'},{day:'Wednesday',time:'11:00 AM'},{day:'Thursday',time:'1:00 PM'}] },
    { id:'C-004', name:'Dr. Priya Varma',    spec:'Disability & Accessibility Support',
      bio:'Supporting students with disabilities, learning differences (dyslexia, ADHD), chronic illness, and mental health conditions to access their full academic potential.',
      avatar:'PV', color:'var(--blue)',    available:false,
      slots:[{day:'Tuesday',time:'11:00 AM'},{day:'Thursday',time:'10:00 AM'}] },
  ];

  const now = Date.now();
  const appointments = [
    { id:'APT-001', counselorId:'C-001', counselorName:'Dr. Amara Diallo',
      studentName:'Alex Johnson',  studentId:'CS-0001',
      slot:'Monday 10:00 AM', date:'2026-07-07', type:'academic',
      notes:'Feeling overwhelmed with upcoming exams and multiple assignment deadlines.',
      status:'confirmed', bookedAt: now - 86400000*4 },
    { id:'APT-002', counselorId:'C-002', counselorName:'Ms. Kezia Muthoni',
      studentName:'Maria Santos',  studentId:'CS-0041',
      slot:'Tuesday 9:00 AM', date:'2026-07-08', type:'personal',
      notes:'', status:'pending', bookedAt: now - 86400000*2 },
    { id:'APT-003', counselorId:'C-003', counselorName:'Mr. Kwesi Amponsah',
      studentName:'James Kwame',   studentId:'CS-0087',
      slot:'Monday 2:00 PM', date:'2026-07-14', type:'career',
      notes:'Looking for guidance on graduate school applications and CV writing.',
      status:'pending', bookedAt: now - 86400000 },
  ];

  localStorage.setItem('edunexus_counselors',    JSON.stringify(counselors));
  localStorage.setItem('edunexus_appointments',  JSON.stringify(appointments));
  localStorage.setItem('edunexus_counseling_seeded', '1');
})();

/* ── Page registration ───────────────────────────────────── */
App.register('counseling', c => {
  Counseling.render(c);
});

/* ── Counseling module ───────────────────────────────────── */
const Counseling = (() => {

  const SESSION_TYPES = [
    { value:'academic', label:'Academic Support' },
    { value:'personal', label:'Personal & Emotional Wellbeing' },
    { value:'career',   label:'Career Guidance' },
    { value:'crisis',   label:'Crisis Support' },
    { value:'general',  label:'General Counselling' },
  ];

  const STATUS_PILL = { pending:'pill-yellow', confirmed:'pill-green',
                        completed:'pill-blue', cancelled:'' };
  const TYPE_ICON   = { academic:'📚', personal:'💙', career:'🎯', crisis:'🆘', general:'💬' };

  function _loadC()      { return JSON.parse(localStorage.getItem('edunexus_counselors')   || '[]'); }
  function _loadA()      { return JSON.parse(localStorage.getItem('edunexus_appointments') || '[]'); }
  function _saveA(d)     { localStorage.setItem('edunexus_appointments', JSON.stringify(d)); }
  function _myName()     { return State.currentUser()?.name || ''; }
  function _myId()       { return State.students.find(s => s.name === _myName())?.id || 'CS-0001'; }

  function _nextDates(dayName, n) {
    const map = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
    const target = map[dayName];
    const out = [];
    const base = new Date();
    for (let i = 1; i <= 90 && out.length < n; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      if (d.getDay() === target) out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }

  function _upcomingSlots(counselor, limit) {
    const booked = new Set(
      _loadA().filter(a => a.counselorId === counselor.id && a.status !== 'cancelled')
              .map(a => `${a.date}|${a.slot}`)
    );
    return counselor.slots
      .flatMap(s => _nextDates(s.day, 3).map(date => ({
        label: `${date} — ${s.day}, ${s.time}`,
        key:   `${s.day} ${s.time}`,
        date,
      })))
      .sort((a, b) => a.date.localeCompare(b.date))
      .filter(s => !booked.has(`${s.date}|${s.key}`))
      .slice(0, limit);
  }

  function _relDate(dateStr) {
    const diff = Math.floor((new Date(dateStr) - new Date()) / 86400000);
    if (diff < 0)   return 'Past';
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  }

  /* ─────────────────── render ─────────────────── */
  function render(c) {
    const role = State.currentRole;
    if (role === 'uni-admin' || role === 'school-director') _adminView(c);
    else _studentView(c);
  }

  function _studentView(c) {
    const myName    = _myName();
    const appts     = _loadA().filter(a => a.studentName === myName)
                              .sort((a, b) => a.date.localeCompare(b.date));
    const today     = new Date().toISOString().slice(0, 10);
    const upcoming  = appts.find(a => a.status === 'confirmed' && a.date >= today);
    const counselors = _loadC();

    c.innerHTML = `
    ${upcoming ? `
    <div style="background:rgba(0,212,170,.1);border:1px solid rgba(0,212,170,.3);
      border-radius:12px;padding:15px 18px;margin-bottom:20px;
      display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <div style="font-size:1.8rem">📅</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;color:var(--accent2)">Upcoming Confirmed Session</div>
        <div style="font-size:.87rem;margin-top:3px">
          <strong>${upcoming.counselorName}</strong> · ${upcoming.slot} · ${upcoming.date}
          <span style="margin-left:8px;color:var(--text2);font-size:.8rem">${_relDate(upcoming.date)}</span>
        </div>
      </div>
      <button class="btn-sm btn-secondary" onclick="Counseling.cancel('${upcoming.id}')">Cancel</button>
    </div>` : ''}

    <!-- How it works strip -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
      ${[
        ['1','🔍','Browse','Choose a counsellor whose specialisation matches what you need.'],
        ['2','📅','Book','Pick an available slot. Sessions are 50 minutes, fully confidential.'],
        ['3','✅','Attend','Join your session in person. You will receive a reminder beforehand.'],
      ].map(([n, ico, title, desc]) => `
      <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;
        padding:16px;display:flex;flex-direction:column;align-items:flex-start;gap:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:22px;height:22px;background:var(--accent);border-radius:50%;
            display:flex;align-items:center;justify-content:center;font-size:.72rem;
            font-weight:800;color:#fff;flex-shrink:0">${n}</div>
          <span style="font-size:1.1rem">${ico}</span>
          <span style="font-weight:700;font-size:.9rem">${title}</span>
        </div>
        <div style="font-size:.8rem;color:var(--text2);line-height:1.6">${desc}</div>
      </div>`).join('')}
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-title">🧠 Our Counselling &amp; Support Team</div>
      <div style="font-size:.83rem;color:var(--text2);margin-bottom:16px">
        All sessions are <strong>strictly confidential</strong>. Sessions last 50 minutes.
        You can also reach the wellbeing team on <strong>ext. 4400</strong> or drop in at the
        Student Wellbeing Centre, Block F, Room 002.
      </div>
      <div class="grid-2">
        ${counselors.map(co => _card(co)).join('')}
      </div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-title">📋 My Appointments (${appts.length})</div>
      ${appts.length === 0
        ? `<div style="text-align:center;padding:28px 0;color:var(--text2)">
            <div style="font-size:2rem;margin-bottom:8px">🗓️</div>
            <div>No appointments yet — book a session above.</div>
           </div>`
        : appts.map(a => `
        <div style="padding:14px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap">
            <div style="display:flex;gap:12px;align-items:flex-start">
              <div style="font-size:1.4rem;padding-top:2px">${TYPE_ICON[a.type] || '💬'}</div>
              <div>
                <div style="font-weight:700;font-size:.9rem">${a.counselorName}</div>
                <div style="font-size:.8rem;color:var(--text2);margin-top:2px">
                  ${a.slot} · ${a.date}
                  <span style="margin-left:6px;color:${a.date < today && a.status !== 'completed' ? 'var(--red)' : 'var(--text2)'}">${_relDate(a.date)}</span>
                </div>
                <div style="font-size:.77rem;color:var(--text2);text-transform:capitalize;margin-top:2px">
                  ${a.type} session
                </div>
                ${a.notes ? `<div style="font-size:.77rem;color:var(--text2);margin-top:5px;
                  font-style:italic">"${a.notes}"</div>` : ''}
              </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
              ${Utils.pill(a.status.charAt(0).toUpperCase()+a.status.slice(1), STATUS_PILL[a.status])}
              ${a.status === 'pending' ? `
              <button class="btn-sm btn-secondary" onclick="Counseling.cancel('${a.id}')">Cancel</button>` : ''}
            </div>
          </div>
        </div>`).join('')}
    </div>

    <!-- Wellbeing Resources -->
    <div class="card">
      <div class="card-title">💡 Wellbeing Resources</div>
      <div style="font-size:.82rem;color:var(--text2);margin-bottom:14px">
        Self-help guides, tips, and emergency contacts — always available.
      </div>
      <div class="grid-2">
        ${[
          { ico:'😰', color:'rgba(255,107,107,.12)', border:'rgba(255,107,107,.25)', title:'Managing Exam Stress',
            body:'Break revision into 25-min Pomodoro blocks. Prioritise sleep and avoid all-nighters — memory consolidation happens during sleep.',
            tag:'Academic' },
          { ico:'🧘', color:'rgba(108,99,255,.1)',   border:'rgba(108,99,255,.25)',  title:'Mindfulness & Relaxation',
            body:'Try 5 minutes of box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat. The university\'s free Headspace license is available via the student portal.',
            tag:'Wellbeing' },
          { ico:'💬', color:'rgba(0,212,170,.1)',    border:'rgba(0,212,170,.25)',   title:'Talking to Someone',
            body:'You do not need a crisis to book a session. Regular check-ins are encouraged. Peer support is also available via the Student Union on ext. 4501.',
            tag:'Support' },
          { ico:'🆘', color:'rgba(255,209,102,.12)', border:'rgba(255,209,102,.3)',  title:'In Crisis? Get Help Now',
            body:'Campus security & welfare: ext. 999 (24/7). National mental health line: 0800-234-567 (free, 24/7). You are not alone — reach out immediately.',
            tag:'Urgent' },
          { ico:'💰', color:'rgba(56,189,248,.1)',   border:'rgba(56,189,248,.25)',  title:'Financial Stress',
            body:'Financial anxiety is one of the top stressors for students. The bursary office (Block A, Room 012) offers emergency hardship grants and flexible payment plans.',
            tag:'Practical' },
          { ico:'🎯', color:'rgba(206,147,216,.1)',  border:'rgba(206,147,216,.25)', title:'Study Skills & Focus',
            body:'Struggling with procrastination or concentration? The Academic Skills Centre (Wednesdays, 2–4pm) offers free drop-in sessions on time management and learning strategies.',
            tag:'Academic' },
        ].map(r => `
        <div style="background:${r.color};border:1px solid ${r.border};border-radius:10px;padding:14px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:1.3rem">${r.ico}</span>
            <div style="flex:1">
              <div style="font-weight:700;font-size:.87rem">${r.title}</div>
            </div>
            <span style="font-size:.7rem;padding:2px 8px;border-radius:10px;
              background:var(--bg3);color:var(--text2)">${r.tag}</span>
          </div>
          <div style="font-size:.81rem;color:var(--text2);line-height:1.65">${r.body}</div>
        </div>`).join('')}
      </div>
    </div>`;
  }

  function _card(co) {
    const slots   = _upcomingSlots(co, 1);
    const nextSlot = slots[0] ? slots[0].label.split(' — ')[1] : 'Fully booked';
    return `
    <div class="card" style="display:flex;flex-direction:column;gap:0;
      border:1px solid var(--border);padding:16px">
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px">
        <div class="avatar" style="width:44px;height:44px;font-size:.88rem;flex-shrink:0;
          background:linear-gradient(135deg,${co.color},var(--accent2))">
          ${co.avatar}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:.92rem">${co.name}</div>
          <div style="font-size:.76rem;color:var(--text2);margin-top:2px">${co.spec}</div>
          <div style="margin-top:5px">${Utils.pill(co.available ? 'Available' : 'On Leave', co.available ? 'pill-green' : 'pill-red')}</div>
        </div>
      </div>
      <div style="font-size:.81rem;color:var(--text2);line-height:1.65;flex:1;margin-bottom:12px">
        ${co.bio}
      </div>
      <div style="font-size:.78rem;color:var(--text2);margin-bottom:12px">
        <span style="font-weight:600">Next available:</span>
        <span style="margin-left:4px">${nextSlot}</span>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn-sm btn-secondary" style="flex:1"
          onclick="Counseling.viewProfile('${co.id}')">Profile</button>
        ${co.available
          ? `<button class="btn-sm btn-primary" style="flex:1"
               onclick="Counseling.book('${co.id}')">Book Session</button>`
          : `<button class="btn-sm btn-secondary" style="flex:1" disabled>Unavailable</button>`}
      </div>
    </div>`;
  }

  function _adminView(c) {
    const appts      = _loadA();
    const counselors = _loadC();
    const today      = new Date().toISOString().slice(0, 10);
    const pending    = appts.filter(a => a.status === 'pending').length;
    const confirmed  = appts.filter(a => a.status === 'confirmed').length;
    const todayCnt   = appts.filter(a => a.date === today && a.status !== 'cancelled').length;

    c.innerHTML = `
    <div class="stats-grid" style="margin-bottom:20px">
      ${Utils.statCard('📋','rgba(108,99,255,.15)', appts.length, 'Total Appointments',    '', '')}
      ${Utils.statCard('⏳','rgba(255,209,102,.15)', pending,      'Awaiting Confirmation', pending > 0 ? `${pending} need action` : 'All confirmed', pending > 0 ? 'down' : 'up')}
      ${Utils.statCard('✅','rgba(0,212,170,.15)',   confirmed,    'Confirmed Sessions',    '', '')}
      ${Utils.statCard('📅','rgba(56,189,248,.15)',  todayCnt,     "Today's Sessions",      '', '')}
    </div>

    <div class="grid-2" style="margin-bottom:20px">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div class="card-title" style="margin:0">🧠 Counselling Team</div>
          <button class="btn-sm btn-primary" onclick="Counseling.addCounselor()">+ Add</button>
        </div>
        ${counselors.map(co => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
          <div class="avatar" style="width:34px;height:34px;font-size:.74rem;flex-shrink:0;
            background:linear-gradient(135deg,${co.color},var(--accent2))">${co.avatar}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:.87rem">${co.name}</div>
            <div style="font-size:.77rem;color:var(--text2)">${co.spec}</div>
          </div>
          ${Utils.pill(co.available ? 'Active' : 'On Leave', co.available ? 'pill-green' : 'pill-yellow')}
        </div>`).join('')}
      </div>

      <div class="card">
        <div class="card-title">📊 Session Breakdown</div>
        ${[
          ['academic','📚','Academic Support'],
          ['personal','💙','Personal & Emotional'],
          ['career','🎯','Career Guidance'],
          ['crisis','🆘','Crisis Support'],
          ['general','💬','General'],
        ].map(([type, ico, label]) => {
          const n = appts.filter(a => a.type === type).length;
          const pct = appts.length ? Math.round(n / appts.length * 100) : 0;
          return `
          <div style="margin-top:10px">
            <div style="display:flex;justify-content:space-between;font-size:.83rem;margin-bottom:4px">
              <span style="color:var(--text2)">${ico} ${label}</span>
              <span style="font-weight:700">${n}</span>
            </div>
            ${Utils.progressBar(pct, 'var(--accent)')}
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-title">📋 All Appointments</div>
      <table>
        <thead><tr>
          <th>Student</th><th>Counsellor</th><th>Date &amp; Slot</th>
          <th>Type</th><th>Status</th><th>Action</th>
        </tr></thead>
        <tbody>
          ${appts.length === 0
            ? `<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text2)">No appointments yet.</td></tr>`
            : appts.sort((a, b) => a.date.localeCompare(b.date)).map(a => `
          <tr>
            <td style="font-weight:600">${a.studentName}</td>
            <td style="font-size:.85rem">${a.counselorName}</td>
            <td style="font-size:.82rem;color:var(--text2)">${a.date}<br>${a.slot}</td>
            <td>${TYPE_ICON[a.type]||'💬'} <span style="font-size:.8rem;text-transform:capitalize">${a.type}</span></td>
            <td>${Utils.pill(a.status.charAt(0).toUpperCase()+a.status.slice(1), STATUS_PILL[a.status])}</td>
            <td style="white-space:nowrap">
              ${a.status === 'pending' ? `
                <button class="btn-sm btn-primary" style="margin-right:4px"
                  onclick="Counseling.updateStatus('${a.id}','confirmed')">Confirm</button>
                <button class="btn-sm btn-secondary"
                  onclick="Counseling.updateStatus('${a.id}','cancelled')">Cancel</button>` : ''}
              ${a.status === 'confirmed' ? `
                <button class="btn-sm btn-secondary"
                  onclick="Counseling.updateStatus('${a.id}','completed')">Mark Done</button>` : ''}
              ${a.status === 'completed' || a.status === 'cancelled'
                ? `<span style="font-size:.8rem;color:var(--text2)">${a.status === 'completed' ? '✓ Done' : '✕ Cancelled'}</span>` : ''}
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  }

  /* ─────────────────── actions ─────────────────── */
  function viewProfile(counselorId) {
    const co = _loadC().find(x => x.id === counselorId);
    if (!co) return;
    Utils.openModal(co.name, `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
        <div class="avatar" style="width:52px;height:52px;font-size:1rem;
          background:linear-gradient(135deg,${co.color},var(--accent2))">${co.avatar}</div>
        <div>
          <div style="font-weight:700;font-size:1.02rem">${co.name}</div>
          <div style="font-size:.83rem;color:var(--text2)">${co.spec}</div>
          <div style="margin-top:6px">${Utils.pill(co.available ? 'Available' : 'On Leave', co.available ? 'pill-green' : 'pill-red')}</div>
        </div>
      </div>
      <div style="font-size:.87rem;line-height:1.7;color:var(--text2);margin-bottom:14px">${co.bio}</div>
      <div style="font-size:.83rem;margin-bottom:16px;padding:10px 12px;background:var(--bg3);border-radius:8px">
        <div style="color:var(--text2);font-size:.78rem;margin-bottom:6px">Available weekly slots:</div>
        ${co.slots.map(s => `<div style="font-size:.85rem">• ${s.day} at ${s.time}</div>`).join('')}
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Close</button>
        ${co.available ? `<button class="btn-sm btn-primary" style="flex:1"
          onclick="Utils.closeModal();Counseling.book('${co.id}')">Book Session</button>` : ''}
      </div>`);
  }

  function book(counselorId) {
    const co    = _loadC().find(x => x.id === counselorId);
    if (!co || !co.available) return;
    const slots = _upcomingSlots(co, 10);
    if (!slots.length) {
      Utils.toast('No available slots for this counsellor right now.', 'error');
      return;
    }
    Utils.openModal(`Book Session — ${co.name}`, `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;
        padding:12px;background:var(--bg3);border-radius:8px">
        <div class="avatar" style="width:36px;height:36px;font-size:.78rem;
          background:linear-gradient(135deg,${co.color},var(--accent2))">${co.avatar}</div>
        <div>
          <div style="font-weight:700;font-size:.9rem">${co.name}</div>
          <div style="font-size:.77rem;color:var(--text2)">${co.spec} · 50 min session</div>
        </div>
      </div>
      <div class="form-group">
        <label>Available Slot</label>
        <select id="bk-slot">
          ${slots.map(s => `<option value="${s.key}|||${s.date}">${s.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Type of Support</label>
        <select id="bk-type">
          ${SESSION_TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Notes <span style="font-weight:400;color:var(--text2)">(optional, strictly confidential)</span></label>
        <textarea id="bk-notes" rows="3"
          placeholder="Briefly describe what you'd like to discuss…"
          style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;
            padding:9px 12px;color:var(--text);outline:none;resize:vertical;font-family:inherit;
            font-size:.87rem;box-sizing:border-box"></textarea>
      </div>
      <div style="background:rgba(108,99,255,.06);border:1px solid rgba(108,99,255,.15);
        border-radius:8px;padding:10px 12px;font-size:.8rem;color:var(--text2);margin-bottom:14px">
        🔒 Everything shared in sessions is <strong>strictly confidential</strong>
        unless there is an immediate risk of harm.
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-primary" style="flex:1"
          onclick="Counseling._confirm('${counselorId}')">Confirm Booking</button>
      </div>`);
  }

  function _confirm(counselorId) {
    const slotEl  = document.getElementById('bk-slot');
    const typeEl  = document.getElementById('bk-type');
    const notesEl = document.getElementById('bk-notes');
    if (!slotEl) return;

    const [slot, date] = slotEl.value.split('|||');
    const type  = typeEl?.value  || 'general';
    const notes = notesEl?.value.trim() || '';

    const co = _loadC().find(x => x.id === counselorId);
    if (!co) return;

    const appts  = _loadA();
    const newId  = 'APT-' + String(appts.length + 1).padStart(3, '0');
    const myName = _myName();

    appts.push({ id: newId, counselorId, counselorName: co.name,
      studentName: myName, studentId: _myId(),
      slot, date, type, notes, status: 'pending', bookedAt: Date.now() });
    _saveA(appts);

    SysLog.write('data_sync',
      `Counselling booking: ${myName} → ${co.name} on ${date}`, 'info');
    Notifier.send('🧠 Appointment Requested',
      `Your session with ${co.name} on ${date} (${slot}) is pending confirmation.`,
      { to: [State.currentRole], type: 'info', icon: '📅' });

    Utils.closeModal();
    Utils.toast("Appointment request sent! You'll be notified when confirmed.", 'success');
    App.navigate('counseling');
  }

  function cancel(apptId) {
    Utils.confirm('Cancel this appointment?', () => {
      const appts = _loadA();
      const a     = appts.find(x => x.id === apptId);
      if (a) { a.status = 'cancelled'; _saveA(appts); }
      Utils.toast('Appointment cancelled.', 'success');
      App.navigate('counseling');
    });
  }

  function updateStatus(apptId, newStatus) {
    const appts = _loadA();
    const a     = appts.find(x => x.id === apptId);
    if (!a) return;
    a.status = newStatus;
    _saveA(appts);

    if (newStatus === 'confirmed') {
      Notifier.send('✅ Appointment Confirmed',
        `Your session with ${a.counselorName} on ${a.date} (${a.slot}) is confirmed.`,
        { to: ['student'], type: 'info', icon: '📅' });
      SysLog.write('data_sync',
        `Counselling confirmed: ${a.studentName} → ${a.counselorName} on ${a.date}`, 'info');
    }

    Utils.toast(`Appointment ${newStatus}.`, 'success');
    render(document.getElementById('main-content'));
  }

  function addCounselor() {
    Utils.openModal('Add Counsellor', `
      <div class="grid-2">
        <div class="form-group"><label>Full Name</label>
          <input type="text" id="co-name" placeholder="Dr. / Ms. / Mr. Name" autocomplete="off">
        </div>
        <div class="form-group"><label>Specialisation</label>
          <input type="text" id="co-spec" placeholder="e.g. Academic Stress" autocomplete="off">
        </div>
      </div>
      <div class="form-group"><label>Short Bio</label>
        <textarea id="co-bio" rows="3"
          style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:8px;
            padding:9px;color:var(--text);outline:none;resize:vertical;font-family:inherit;
            font-size:.87rem;box-sizing:border-box"
          placeholder="Brief professional background…"></textarea>
      </div>
      <div style="display:flex;gap:10px;margin-top:4px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-primary"   style="flex:1" onclick="Counseling._saveCounselor()">Add</button>
      </div>`);
  }

  function _saveCounselor() {
    const name = document.getElementById('co-name')?.value.trim();
    const spec = document.getElementById('co-spec')?.value.trim();
    const bio  = document.getElementById('co-bio')?.value.trim();
    if (!name || !spec) { Utils.toast('Enter name and specialisation.', 'error'); return; }
    const all      = _loadC();
    const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
    all.push({ id: 'C-' + String(all.length + 1).padStart(3, '0'),
      name, spec, bio: bio || spec, avatar: initials, color: 'var(--accent)',
      available: true, slots: [{ day:'Monday', time:'10:00 AM' }, { day:'Wednesday', time:'2:00 PM' }] });
    localStorage.setItem('edunexus_counselors', JSON.stringify(all));
    Utils.closeModal();
    Utils.toast(`${name} added to the counselling team.`, 'success');
    App.navigate('counseling');
  }

  return { render, viewProfile, book, _confirm, cancel, updateStatus, addCounselor, _saveCounselor };
})();
