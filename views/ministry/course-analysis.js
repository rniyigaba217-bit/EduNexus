App.register('course-analysis', c => MinistryPrograms.render(c));

const MinistryPrograms = (() => {

  const PROGRAMS = [
    { id:'cs', name:'Computer Science & IT', icon:'💻', natAvg:82,
      note:'Strong nationally. Algorithm-theory courses consistently underperform across institutions.',
      topCourse:'Data Structures (91%)', weakCourse:'Algorithms II (68%)',
      schools:[
        {school:'University of Technology',   pass:86, students:1240, trend:+2.1},
        {school:'National Engineering Univ.', pass:80, students:480,  trend:+1.0},
        {school:'Southern Polytechnic',        pass:74, students:320,  trend:+1.8},
        {school:'Business School',             pass:73, students:180,  trend:+0.5},
      ]
    },
    { id:'med', name:'Medicine & Health Sciences', icon:'⚕️', natAvg:88,
      note:'Top-performing faculty nationally. Biostatistics is a weak point across all institutions.',
      topCourse:'Clinical Medicine (94%)', weakCourse:'Biostatistics (71%)',
      schools:[
        {school:'State Medical University',   pass:94, students:820, trend:+3.2},
        {school:'University of Technology',   pass:89, students:540, trend:+3.0},
        {school:'Arts & Sciences University', pass:76, students:120, trend:+0.8},
      ]
    },
    { id:'eng', name:'Engineering', icon:'⚙️', natAvg:79,
      note:'Civil and Electrical strong. Environmental Engineering declining sharply at all institutions.',
      topCourse:'Electrical Engineering (83%)', weakCourse:'Environmental Eng. (72%)',
      schools:[
        {school:'National Engineering Univ.', pass:81, students:1740, trend:-0.2},
        {school:'University of Technology',   pass:79, students:980,  trend:+0.8},
        {school:'Southern Polytechnic',        pass:67, students:380,  trend:-1.2},
      ]
    },
    { id:'bus', name:'Business & Economics', icon:'📊', natAvg:79,
      note:'Entrepreneurship shining nationally at 84%. Economics and Management consistently weak.',
      topCourse:'Entrepreneurship (84%)', weakCourse:'Macroeconomics (63%)',
      schools:[
        {school:'Business School',            pass:83, students:2410, trend:+0.8},
        {school:'University of Technology',   pass:80, students:340,  trend:+1.5},
        {school:'Arts & Sciences University', pass:70, students:280,  trend:-1.8},
        {school:'National Engineering Univ.', pass:68, students:120,  trend:-0.5},
      ]
    },
    { id:'arts', name:'Arts & Humanities', icon:'🎨', natAvg:71,
      note:'Lowest-performing faculty nationally. Significant funding concerns. Ministry attention required.',
      topCourse:'Psychology (76%)', weakCourse:'Philosophy (64%)',
      schools:[
        {school:'University of Technology',   pass:73, students:481,  trend:-2.8},
        {school:'Arts & Sciences University', pass:71, students:1840, trend:-1.0},
        {school:'Southern Polytechnic',        pass:67, students:220,  trend:-1.9},
      ]
    },
    { id:'math', name:'Mathematics & Statistics', icon:'🔢', natAvg:74,
      note:'Year 2–3 content significantly harder than Year 1. Dropout spikes at Year 2 across all institutions.',
      topCourse:'Linear Algebra I (79%)', weakCourse:'Linear Algebra II (58%)',
      schools:[
        {school:'State Medical University',   pass:82, students:180, trend:+1.0},
        {school:'University of Technology',   pass:74, students:720, trend:-1.2},
        {school:'Business School',            pass:73, students:280, trend:-0.5},
        {school:'National Engineering Univ.', pass:71, students:380, trend:-0.8},
        {school:'Arts & Sciences University', pass:66, students:300, trend:-2.1},
      ]
    }
  ];

  /* ─────────────────────────────────────────────────────────
     LIST VIEW — all programmes
  ───────────────────────────────────────────────────────── */
  function render(c) {
    c.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="font-weight:700;font-size:.97rem">📚 National Performance by Programme</div>
      <div style="font-size:.82rem;color:var(--text2);margin-top:2px">
        Click any programme card to see school-by-school breakdown and rankings
      </div>
    </div>
    <div class="grid-2">
      ${PROGRAMS.map(p => {
        const best  = p.schools.reduce((a,b) => a.pass > b.pass ? a : b);
        const worst = p.schools.reduce((a,b) => a.pass < b.pass ? a : b);
        const natCol = p.natAvg >= 85 ? 'var(--green)' : p.natAvg >= 75 ? 'var(--yellow)' : 'var(--red)';
        const totalStudents = p.schools.reduce((a,b) => a + b.students, 0);
        return `
        <div class="card" style="cursor:pointer;transition:.15s;border:1px solid var(--border)"
          onclick="MinistryPrograms.detail('${p.id}')"
          onmouseenter="this.style.borderColor='var(--accent)';this.style.boxShadow='0 4px 20px rgba(108,99,255,.12)'"
          onmouseleave="this.style.borderColor='var(--border)';this.style.boxShadow=''">

          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="font-size:1.6rem;line-height:1">${p.icon}</div>
              <div>
                <div style="font-weight:700;font-size:.93rem">${p.name}</div>
                <div style="font-size:.77rem;color:var(--text2);margin-top:2px">
                  ${p.schools.length} institutions · ${totalStudents.toLocaleString()} students
                </div>
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:1.5rem;font-weight:800;color:${natCol};line-height:1">${p.natAvg}%</div>
              <div style="font-size:.7rem;color:var(--text2);margin-top:2px">national avg</div>
            </div>
          </div>

          ${p.schools.slice(0,3).map(s => {
            const bc = s.pass >= 82 ? 'var(--green)' : s.pass >= 74 ? 'var(--accent)' : 'var(--yellow)';
            const name = s.school.length > 28 ? s.school.slice(0,26)+'…' : s.school;
            return `
            <div style="margin-bottom:7px">
              <div style="display:flex;justify-content:space-between;
                font-size:.77rem;margin-bottom:3px">
                <span style="color:var(--text2)">${name}</span>
                <span style="font-weight:700;color:${bc}">${s.pass}%</span>
              </div>
              ${Utils.progressBar(s.pass, bc)}
            </div>`;
          }).join('')}

          ${p.schools.length > 3 ? `
          <div style="font-size:.76rem;color:var(--text2);margin-top:2px">
            +${p.schools.length-3} more institution${p.schools.length-3>1?'s':''} · Click to expand
          </div>` : ''}

          <div style="display:flex;justify-content:space-between;font-size:.77rem;
            margin-top:12px;padding-top:10px;border-top:1px solid var(--border)">
            <span style="color:var(--green)">
              🏆 Best: ${best.school.split(' ').slice(0,2).join(' ')} (${best.pass}%)
            </span>
            <span style="color:var(--red)">
              ⚠️ Lowest: ${worst.school.split(' ')[0]} (${worst.pass}%)
            </span>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }

  /* ─────────────────────────────────────────────────────────
     DETAIL VIEW — one programme
  ───────────────────────────────────────────────────────── */
  function detail(id) {
    const p = PROGRAMS.find(x => x.id === id);
    if (!p) return;
    const c      = document.getElementById('main-content');
    const sorted = [...p.schools].sort((a,b) => b.pass - a.pass);
    const natCol = p.natAvg >= 85 ? 'var(--green)' : p.natAvg >= 75 ? 'var(--yellow)' : 'var(--red)';
    const gap    = sorted[0].pass - sorted[sorted.length-1].pass;
    const totalStudents = p.schools.reduce((a,b) => a + b.students, 0);

    c.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn-sm btn-secondary"
        onclick="MinistryPrograms.render(document.getElementById('main-content'))">
        ← All Programmes
      </button>
      <div style="flex:1;min-width:0">
        <div style="font-weight:800;font-size:1.05rem">${p.icon} ${p.name}</div>
        <div style="font-size:.82rem;color:var(--text2);margin-top:2px">
          ${p.schools.length} institutions offering this programme · ${totalStudents.toLocaleString()} students nationally
        </div>
      </div>
      ${Utils.pill('National Avg: '+p.natAvg+'%',
        p.natAvg>=82?'pill-green':p.natAvg>=74?'pill-blue':'pill-yellow')}
    </div>

    <div class="stats-grid" style="margin-bottom:20px">
      ${Utils.statCard('📊','rgba(108,99,255,.15)', p.natAvg+'%', 'National Average', '', '')}
      ${Utils.statCard('👥','rgba(0,212,170,.15)', totalStudents.toLocaleString(), 'Total Enrolled', p.schools.length+' institutions', '')}
      ${Utils.statCard('🏆','rgba(0,212,170,.15)', sorted[0].pass+'%', 'Best Performer',
        sorted[0].school.split(' ').slice(0,3).join(' '), 'up')}
      ${Utils.statCard('⚠️','rgba(255,107,107,.15)', sorted[sorted.length-1].pass+'%', 'Needs Support',
        sorted[sorted.length-1].school.split(' ').slice(0,3).join(' '), 'down')}
    </div>

    <div class="grid-2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-title">🏫 School Rankings for ${p.name}</div>
        ${sorted.map((s,i) => {
          const bc = s.pass >= 82 ? 'var(--green)' : s.pass >= 74 ? 'var(--accent)' : 'var(--red)';
          const tc = s.trend >= 0 ? 'var(--green)' : 'var(--red)';
          return `
          <div style="padding:12px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:24px;height:24px;border-radius:50%;flex-shrink:0;
                  background:${i===0?'var(--accent)':i===1?'rgba(108,99,255,.2)':'var(--bg3)'};
                  display:flex;align-items:center;justify-content:center;
                  font-size:.74rem;font-weight:800;
                  color:${i===0?'#fff':i===1?'var(--accent)':'var(--text2)'}">${i+1}</div>
                <span style="font-size:.87rem;font-weight:${i===0?700:400}">${s.school}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
                <span style="font-size:.77rem;color:${tc}">${s.trend>=0?'+':''}${s.trend}%</span>
                <span style="font-weight:700;color:${bc}">${s.pass}%</span>
              </div>
            </div>
            ${Utils.progressBar(s.pass, bc)}
            <div style="font-size:.76rem;color:var(--text2);margin-top:4px">
              ${s.students.toLocaleString()} students enrolled
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="card">
        <div class="card-title">📋 Programme Intelligence</div>

        <div style="background:var(--bg3);border-radius:10px;padding:14px;margin-bottom:14px">
          <div style="font-size:.75rem;color:var(--text2);margin-bottom:6px;font-weight:600">
            Ministry Analysis
          </div>
          <div style="font-size:.87rem;line-height:1.65;color:var(--text)">${p.note}</div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">
          <div style="background:rgba(0,212,170,.08);border:1px solid rgba(0,212,170,.2);
            border-radius:8px;padding:12px">
            <div style="font-size:.72rem;color:var(--accent2);font-weight:700;
              text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">
              🏆 Top Course Nationally
            </div>
            <div style="font-size:.9rem;font-weight:600">${p.topCourse}</div>
          </div>
          <div style="background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.2);
            border-radius:8px;padding:12px">
            <div style="font-size:.72rem;color:var(--red);font-weight:700;
              text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">
              ⚠️ Weakest Course Nationally
            </div>
            <div style="font-size:.9rem;font-weight:600">${p.weakCourse}</div>
          </div>
        </div>

        <div style="background:var(--bg3);border-radius:8px;padding:12px">
          <div style="font-size:.75rem;color:var(--text2);font-weight:600;margin-bottom:8px">
            Quality Spread
          </div>
          <div style="font-size:.87rem;margin-bottom:4px">
            Best vs Worst gap: <strong style="color:${gap>15?'var(--red)':'var(--green)'}">${gap}pp</strong>
          </div>
          <div style="font-size:.8rem;color:var(--text2);margin-bottom:8px">
            ${gap > 15
              ? '⚠️ Wide gap — quality is uneven across institutions. Targeted support needed.'
              : '✅ Relatively consistent quality across all institutions.'}
          </div>
          ${Utils.progressBar(gap*2, gap>15?'var(--red)':'var(--green)')}
        </div>
      </div>
    </div>`;
  }

  return { render, detail };
})();
