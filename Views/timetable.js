/* ── Seed timetable sessions ─────────────────────────────── */
(() => {
  if (localStorage.getItem('edunexus_tt_seeded')) return;
  const seed = [
    /* Computer Science — Year 3 (matches student Alex Johnson) */
    { id:'TT-001', courseCode:'CS301', courseName:'Data Structures',      facilitator:'Dr. Sarah Williams', room:'Block A, Room 101', dept:'Computer Science', year:3, day:'Monday',    start:8,  end:10 },
    { id:'TT-002', courseCode:'CS301', courseName:'Data Structures',      facilitator:'Dr. Sarah Williams', room:'Block A, Room 101', dept:'Computer Science', year:3, day:'Wednesday', start:8,  end:10 },
    { id:'TT-003', courseCode:'CS302', courseName:'Algorithms',           facilitator:'Prof. Ahmed Hassan',  room:'Block B, Room 203', dept:'Computer Science', year:3, day:'Tuesday',   start:10, end:12 },
    { id:'TT-004', courseCode:'CS302', courseName:'Algorithms',           facilitator:'Prof. Ahmed Hassan',  room:'Block B, Room 203', dept:'Computer Science', year:3, day:'Thursday',  start:10, end:12 },
    { id:'TT-005', courseCode:'CS303', courseName:'Operating Systems',    facilitator:'Dr. Anjali Patel',    room:'Block C, Lab 1',    dept:'Computer Science', year:3, day:'Monday',    start:14, end:16 },
    { id:'TT-006', courseCode:'CS303', courseName:'Operating Systems',    facilitator:'Dr. Anjali Patel',    room:'Block C, Lab 1',    dept:'Computer Science', year:3, day:'Wednesday', start:14, end:16 },
    { id:'TT-007', courseCode:'CS304', courseName:'Database Systems',     facilitator:'Dr. Kim',             room:'Block A, Room 105', dept:'Computer Science', year:3, day:'Friday',    start:9,  end:11 },
    { id:'TT-008', courseCode:'CS305', courseName:'Computer Networks',    facilitator:'Prof. James Chen',    room:'Block B, Room 207', dept:'Computer Science', year:3, day:'Tuesday',   start:14, end:16 },
    { id:'TT-009', courseCode:'CS306', courseName:'Software Engineering', facilitator:'Dr. Sarah Williams',  room:'Block A, Room 102', dept:'Computer Science', year:3, day:'Thursday',  start:14, end:17 },
    /* Computer Science — Year 2 */
    { id:'TT-010', courseCode:'CS201', courseName:'OOP Fundamentals',     facilitator:'Dr. Sarah Williams',  room:'Block A, Room 103', dept:'Computer Science', year:2, day:'Tuesday',   start:8,  end:10 },
    { id:'TT-011', courseCode:'CS202', courseName:'Discrete Mathematics', facilitator:'Prof. Ahmed Hassan',  room:'Block B, Room 201', dept:'Computer Science', year:2, day:'Monday',    start:10, end:12 },
    /* Engineering — Year 2 */
    { id:'TT-012', courseCode:'ENG201', courseName:'Thermodynamics',      facilitator:'Dr. Anjali Patel',    room:'Block D, Room 301', dept:'Engineering', year:2, day:'Monday',    start:10, end:12 },
    { id:'TT-013', courseCode:'ENG202', courseName:'Fluid Mechanics',     facilitator:'Prof. James Chen',    room:'Block D, Lab 2',    dept:'Engineering', year:2, day:'Tuesday',   start:8,  end:10 },
    { id:'TT-014', courseCode:'ENG203', courseName:'Circuit Analysis',    facilitator:'Dr. Anjali Patel',    room:'Block D, Room 305', dept:'Engineering', year:2, day:'Wednesday', start:10, end:12 },
    { id:'TT-015', courseCode:'ENG204', courseName:'Engineering Maths',   facilitator:'Dr. Linh Nguyen',     room:'Block A, Room 205', dept:'Engineering', year:2, day:'Friday',    start:8,  end:10 },
    /* Mathematics — Year 3 */
    { id:'TT-016', courseCode:'MTH301', courseName:'Real Analysis',       facilitator:'Dr. Linh Nguyen',     room:'Block A, Room 201', dept:'Mathematics', year:3, day:'Monday',    start:12, end:14 },
    { id:'TT-017', courseCode:'MTH302', courseName:'Linear Algebra',      facilitator:'Dr. Linh Nguyen',     room:'Block A, Room 201', dept:'Mathematics', year:3, day:'Wednesday', start:12, end:14 },
    { id:'TT-018', courseCode:'MTH303', courseName:'Statistics',          facilitator:'Dr. Linh Nguyen',     room:'Block A, Room 203', dept:'Mathematics', year:3, day:'Friday',    start:10, end:12 },
    /* Business Studies — Year 2 */
    { id:'TT-019', courseCode:'BUS201', courseName:'Microeconomics',      facilitator:'Prof. Kwame Asante',  room:'Block E, Room 101', dept:'Business Studies', year:2, day:'Tuesday',   start:12, end:14 },
    { id:'TT-020', courseCode:'BUS202', courseName:'Financial Accounting',facilitator:'Prof. Kwame Asante',  room:'Block E, Room 103', dept:'Business Studies', year:2, day:'Thursday',  start:8,  end:10 },
  ];
  localStorage.setItem('edunexus_timetable', JSON.stringify(seed));
  localStorage.setItem('edunexus_tt_seeded', '1');
})();

/* ── Page registration ───────────────────────────────────── */
App.register('timetable', c => {
  Timetable.render(c);
});

/* ── Timetable module ────────────────────────────────────── */
const Timetable = (() => {

  const DAYS      = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const DAY_SHORT = ['Mon','Tue','Wed','Thu','Fri'];
  const HOURS     = [8,9,10,11,12,13,14,15,16,17];
  const ROW_H     = 64;

  const DEPT_COLOR = {
    'Computer Science': { bg:'rgba(108,99,255,.14)', line:'var(--accent)',  fg:'var(--accent)'  },
    'Engineering':      { bg:'rgba(56,189,248,.14)', line:'var(--blue)',    fg:'var(--blue)'    },
    'Mathematics':      { bg:'rgba(255,209,102,.14)',line:'var(--yellow)',  fg:'var(--yellow)'  },
    'Medicine':         { bg:'rgba(0,212,170,.14)',  line:'var(--accent2)', fg:'var(--accent2)' },
    'Business Studies': { bg:'rgba(0,212,170,.14)',  line:'var(--accent2)', fg:'var(--accent2)' },
    'Arts & Humanities':{ bg:'rgba(206,147,216,.14)',line:'var(--purple)',  fg:'var(--purple)'  },
  };

  let _view = 'week';

  function _c(dept) {
    return DEPT_COLOR[dept] || DEPT_COLOR['Computer Science'];
  }

  function _fmtH(h) {
    const sfx = h < 12 ? 'am' : 'pm';
    const d   = h <= 12 ? h : h - 12;
    return `${d}:00${sfx}`;
  }

  function _load()  { return JSON.parse(localStorage.getItem('edunexus_timetable') || '[]'); }
  function _saveAll(d){ localStorage.setItem('edunexus_timetable', JSON.stringify(d)); }

  function _filter(all) {
    const role = State.currentRole;
    const user = State.currentUser();
    if (role === 'student') {
      const s = State.students.find(x => x.name === user.name);
      const dept = s ? s.dept : 'Computer Science';
      const year = s ? s.year : 3;
      return all.filter(sl => sl.dept === dept && sl.year === year);
    }
    if (role === 'facilitator') {
      return all.filter(sl => sl.facilitator === user.name);
    }
    return all;
  }

  function render(c) {
    const slots    = _filter(_load());
    const canEdit  = State.currentRole === 'uni-admin';
    const role     = State.currentRole;

    const header = role === 'student'     ? 'My Class Timetable'
                 : role === 'facilitator' ? 'My Teaching Schedule'
                 : 'University Timetable';

    c.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;
                margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div>
        <div style="font-weight:700;font-size:.97rem">${header}</div>
        <div style="font-size:.82rem;color:var(--text2);margin-top:2px">
          ${slots.length} session${slots.length !== 1 ? 's' : ''} this week
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <div style="display:flex;border:1px solid var(--border);border-radius:8px;overflow:hidden">
          <button id="tt-btn-week" class="btn-sm"
            style="border:none;border-radius:0;background:var(--accent);color:#fff;font-weight:700"
            onclick="Timetable.setView('week')">Week</button>
          <button id="tt-btn-list" class="btn-sm"
            style="border:none;border-radius:0;background:transparent;color:var(--text2)"
            onclick="Timetable.setView('list')">List</button>
        </div>
        ${canEdit ? `<button class="btn-sm btn-primary" onclick="Timetable.openAdd()">+ Add Session</button>` : ''}
      </div>
    </div>
    <div id="tt-view">
      ${_weekGrid(slots, canEdit)}
    </div>`;
  }

  function _weekGrid(slots, canEdit) {
    const totalRows = HOURS.length;
    let cells = '';

    /* -- corner cell -- */
    cells += `<div style="grid-row:1;grid-column:1;background:var(--bg2);
      border-right:1px solid var(--border);border-bottom:2px solid var(--border);
      display:flex;align-items:center;justify-content:center;
      font-size:.7rem;color:var(--text2);font-weight:600">TIME</div>`;

    /* -- day header cells -- */
    DAYS.forEach((day, i) => {
      const d = new Date();
      const todayName = DAYS[d.getDay() - 1] || '';
      const isToday   = day === todayName;
      cells += `
      <div style="grid-row:1;grid-column:${i+2};
        background:${isToday ? 'rgba(108,99,255,.12)' : 'var(--bg2)'};
        border-right:1px solid var(--border);border-bottom:2px solid var(--border);
        display:flex;align-items:center;justify-content:center;
        font-weight:${isToday ? '800' : '600'};font-size:.87rem;
        color:${isToday ? 'var(--accent)' : 'var(--text)'}">
        ${DAY_SHORT[i]}
        ${isToday ? '<span style="display:inline-block;width:5px;height:5px;background:var(--accent);border-radius:50%;margin-left:5px;vertical-align:middle"></span>' : ''}
      </div>`;
    });

    /* -- time label + background cells per row -- */
    HOURS.forEach((h, idx) => {
      const row = idx + 2;
      cells += `
      <div style="grid-row:${row};grid-column:1;
        border-right:1px solid var(--border);border-bottom:1px solid var(--border);
        display:flex;align-items:flex-start;justify-content:flex-end;
        padding:5px 6px 0 0;font-size:.7rem;color:var(--text2)">${_fmtH(h)}</div>`;
      DAYS.forEach((_, ci) => {
        cells += `<div style="grid-row:${row};grid-column:${ci+2};
          border-right:1px solid var(--border);border-bottom:1px solid var(--border);
          background:var(--bg3)"></div>`;
      });
    });

    /* -- class blocks -- */
    slots.forEach(sl => {
      const col      = DAYS.indexOf(sl.day) + 2;
      const rowStart = (sl.start - 8) + 2;
      const rowEnd   = (sl.end   - 8) + 2;
      const dur      = sl.end - sl.start;
      const cl       = _c(sl.dept);
      cells += `
      <div onclick="Timetable.detail('${sl.id}')"
        style="grid-row:${rowStart}/${rowEnd};grid-column:${col};
          background:${cl.bg};border-left:3px solid ${cl.line};
          border-radius:0 8px 8px 0;margin:3px 4px;padding:7px 9px;
          cursor:pointer;overflow:hidden;z-index:2;box-sizing:border-box;
          transition:filter .15s"
        onmouseenter="this.style.filter='brightness(1.12)'"
        onmouseleave="this.style.filter='brightness(1)'">
        <div style="font-weight:700;font-size:.77rem;color:${cl.fg}">${sl.courseCode}</div>
        <div style="font-size:.78rem;font-weight:600;margin-top:2px;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sl.courseName}</div>
        ${dur >= 2 ? `
        <div style="font-size:.7rem;color:var(--text2);margin-top:3px">📍 ${sl.room.split(',')[0]}</div>
        <div style="font-size:.7rem;color:var(--text2)">${_fmtH(sl.start)}–${_fmtH(sl.end)}</div>` : ''}
      </div>`;
    });

    return `
    <div style="overflow-x:auto;border-radius:12px;border:1px solid var(--border)">
      <div style="
        display:grid;
        grid-template-columns:54px repeat(5,minmax(110px,1fr));
        grid-template-rows:42px repeat(${totalRows},${ROW_H}px);
        min-width:620px">
        ${cells}
      </div>
    </div>`;
  }

  function _listView(slots) {
    if (slots.length === 0) {
      return `<div class="card">${Utils.empty('No sessions scheduled this week')}</div>`;
    }
    const sorted = [...slots].sort((a, b) => {
      const dd = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
      return dd !== 0 ? dd : a.start - b.start;
    });
    let rows = sorted.map(s => {
      const cl = _c(s.dept);
      return `
      <tr onclick="Timetable.detail('${s.id}')" style="cursor:pointer">
        <td style="font-weight:700">${s.day.slice(0,3)}</td>
        <td style="font-size:.83rem;color:var(--text2);white-space:nowrap">
          ${_fmtH(s.start)}–${_fmtH(s.end)}
        </td>
        <td>
          <div style="font-weight:600">${s.courseCode} — ${s.courseName}</div>
          <div style="font-size:.77rem;color:${cl.fg}">${s.dept} · Year ${s.year}</div>
        </td>
        <td style="font-size:.83rem;color:var(--text2)">${s.room}</td>
        <td style="font-size:.83rem">${s.facilitator}</td>
      </tr>`;
    }).join('');
    return `
    <div class="card">
      <table>
        <thead><tr>
          <th>Day</th><th>Time</th><th>Course</th><th>Room</th><th>Facilitator</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }

  function setView(v) {
    _view = v;
    const slots   = _filter(_load());
    const canEdit = State.currentRole === 'uni-admin';
    const el      = document.getElementById('tt-view');
    if (!el) return;
    el.innerHTML = v === 'week' ? _weekGrid(slots, canEdit) : _listView(slots);

    const wb = document.getElementById('tt-btn-week');
    const lb = document.getElementById('tt-btn-list');
    if (wb) { wb.style.background = v === 'week' ? 'var(--accent)' : 'transparent'; wb.style.color = v === 'week' ? '#fff' : 'var(--text2)'; wb.style.fontWeight = v === 'week' ? '700' : '400'; }
    if (lb) { lb.style.background = v === 'list' ? 'var(--accent)' : 'transparent'; lb.style.color = v === 'list' ? '#fff' : 'var(--text2)'; lb.style.fontWeight = v === 'list' ? '700' : '400'; }
  }

  function detail(id) {
    const s = _load().find(x => x.id === id);
    if (!s) return;
    const cl      = _c(s.dept);
    const canEdit = State.currentRole === 'uni-admin';
    Utils.openModal(`${s.courseCode} — ${s.courseName}`, `
      <div style="border-left:4px solid ${cl.line};padding-left:12px;margin-bottom:16px">
        <div style="font-weight:700;font-size:1rem">${s.courseName}</div>
        <div style="font-size:.83rem;color:${cl.fg};margin-top:2px">${s.dept}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:0;margin-bottom:16px">
        ${[
          ['📅 Day',         s.day],
          ['⏰ Time',        `${_fmtH(s.start)} – ${_fmtH(s.end)} &nbsp;(${s.end - s.start}h)`],
          ['📍 Room',        s.room],
          ['👨‍🏫 Facilitator', s.facilitator],
          ['🏛️ Department',  s.dept],
          ['📚 Year Group',  `Year ${s.year}`],
        ].map(([l, v]) => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;
          border-bottom:1px solid var(--border);font-size:.87rem">
          <span style="color:var(--text2)">${l}</span>
          <span style="font-weight:600">${v}</span>
        </div>`).join('')}
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Close</button>
        ${canEdit ? `<button class="btn-sm" style="flex:1;background:rgba(255,107,107,.15);color:var(--red);border:1px solid rgba(255,107,107,.3)"
          onclick="Timetable.remove('${id}')">Remove Session</button>` : ''}
      </div>`);
  }

  function openAdd() {
    Utils.openModal('Add Timetable Session', `
      <div class="grid-2">
        <div class="form-group"><label>Course Code</label>
          <input type="text" id="tt-code" placeholder="CS401" autocomplete="off">
        </div>
        <div class="form-group"><label>Course Name</label>
          <input type="text" id="tt-cname" placeholder="Advanced Algorithms" autocomplete="off">
        </div>
      </div>
      <div class="form-group"><label>Facilitator</label>
        <input type="text" id="tt-fac" placeholder="Dr. Name" autocomplete="off">
      </div>
      <div class="form-group"><label>Room / Location</label>
        <input type="text" id="tt-room" placeholder="Block A, Room 101" autocomplete="off">
      </div>
      <div class="grid-2">
        <div class="form-group"><label>Department</label>
          <select id="tt-dept">
            <option>Computer Science</option><option>Engineering</option>
            <option>Mathematics</option><option>Medicine</option>
            <option>Business Studies</option><option>Arts &amp; Humanities</option>
          </select>
        </div>
        <div class="form-group"><label>Year Group</label>
          <select id="tt-year">
            <option value="1">Year 1</option><option value="2">Year 2</option>
            <option value="3" selected>Year 3</option><option value="4">Year 4</option>
          </select>
        </div>
      </div>
      <div class="grid-2">
        <div class="form-group"><label>Day</label>
          <select id="tt-day">
            ${DAYS.map(d => `<option>${d}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label>Start – End</label>
          <div style="display:flex;gap:8px">
            <select id="tt-start" style="flex:1">
              ${[8,9,10,11,12,13,14,15,16].map(h => `<option value="${h}">${_fmtH(h)}</option>`).join('')}
            </select>
            <select id="tt-end" style="flex:1">
              ${[9,10,11,12,13,14,15,16,17].map(h => `<option value="${h}">${_fmtH(h)}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:6px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-primary"   style="flex:1" onclick="Timetable.save()">Add Session</button>
      </div>`);
  }

  function save() {
    const code  = document.getElementById('tt-code')?.value.trim();
    const cname = document.getElementById('tt-cname')?.value.trim();
    const fac   = document.getElementById('tt-fac')?.value.trim();
    const room  = document.getElementById('tt-room')?.value.trim();
    const dept  = document.getElementById('tt-dept')?.value;
    const year  = parseInt(document.getElementById('tt-year')?.value);
    const day   = document.getElementById('tt-day')?.value;
    const start = parseInt(document.getElementById('tt-start')?.value);
    const end   = parseInt(document.getElementById('tt-end')?.value);

    if (!code || !cname || !fac || !room) { Utils.toast('Fill in all fields.', 'error'); return; }
    if (end <= start) { Utils.toast('End time must be after start time.', 'error'); return; }

    const all   = _load();
    const newId = 'TT-' + String(all.length + 1).padStart(3, '0');
    all.push({ id:newId, courseCode:code, courseName:cname, facilitator:fac, room, dept, year, day, start, end });
    _saveAll(all);
    SysLog.write('data_sync', `Timetable: ${code} ${cname} added — ${day} ${_fmtH(start)}–${_fmtH(end)}`, 'info');
    Utils.closeModal();
    Utils.toast('Session added to timetable.', 'success');
    App.navigate('timetable');
  }

  function remove(id) {
    Utils.confirm('Remove this timetable session?', () => {
      const filtered = _load().filter(x => x.id !== id);
      _saveAll(filtered);
      Utils.closeModal();
      Utils.toast('Session removed.', 'success');
      App.navigate('timetable');
    });
  }

  return { render, setView, detail, openAdd, save, remove };
})();
