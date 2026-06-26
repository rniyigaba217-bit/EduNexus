App.register('school-analysis', c => MinistrySchools.render(c));

const MinistrySchools = (() => {

  const SCHOOLS = [
    { id:'uot',  name:'University of Technology',   short:'U of Tech',        rank:1,
      location:'Kigali',   est:2001, students:4821, staff:183, faculties:12,
      passRate:82, gpa:78.4, dropout:3.1, sat:4.6,
      trend:[75,77,79,81,82,82], atRisk:421, complaints:184,
      depts:[
        {name:'Computer Science',  s:1240, p:86, t:'+2.1', ok:true },
        {name:'Engineering',        s:980,  p:79, t:'+0.8', ok:true },
        {name:'Mathematics',        s:720,  p:74, t:'-1.2', ok:false},
        {name:'Business Studies',   s:860,  p:81, t:'+1.5', ok:true },
        {name:'Medicine',           s:540,  p:89, t:'+3.0', ok:true },
        {name:'Arts & Humanities',  s:481,  p:68, t:'-2.8', ok:false},
      ],
      highlights:['Top CS department nationally (86%)','Medical programme ranked #1','Digital-first campus — PWA deployed'],
      concerns:['Arts & Humanities declining (-2.8%)','Mathematics below national average (74%)'],
      reviews:[
        {stars:5, text:'Strong CS and clinical programmes. Top faculty-to-student ratio in the country.', dept:'General'},
        {stars:3, text:'Arts faculty underfunded. Projectors broken for three weeks straight.', dept:'Arts'},
        {stars:4, text:'Good campus infrastructure overall. Library collection needs updating.', dept:'Engineering'},
      ]
    },
    { id:'smu',  name:'State Medical University',   short:'State Medical',     rank:2,
      location:'Butare',   est:1985, students:2140, staff:98,  faculties:8,
      passRate:88, gpa:83.2, dropout:2.8, sat:4.7,
      trend:[80,82,84,86,88,88], atRisk:198, complaints:87,
      depts:[
        {name:'Medicine & Surgery',  s:820, p:94, t:'+3.2', ok:true },
        {name:'Pharmacy',            s:380, p:88, t:'+1.1', ok:true },
        {name:'Nursing',             s:540, p:84, t:'+0.5', ok:true },
        {name:'Public Health',       s:280, p:86, t:'+2.0', ok:true },
        {name:'Biomedical Sciences', s:120, p:79, t:'-0.8', ok:false},
      ],
      highlights:['Highest pass rate nationally (88%)','Lowest dropout rate (2.8%)','Nationally accredited clinical training'],
      concerns:['Biomedical Sciences slightly declining (-0.8%)','Limited STEM diversity outside health sciences'],
      reviews:[
        {stars:5, text:'Best clinical training in the country. Exceptional mentorship and facilities.', dept:'Medicine'},
        {stars:5, text:'Pharmacy labs are world-class. Amazing hands-on experience throughout.', dept:'Pharmacy'},
        {stars:4, text:'Nursing programme well-structured. More simulation labs needed.', dept:'Nursing'},
      ]
    },
    { id:'neu',  name:'National Engineering Univ.', short:'Natl. Engineering', rank:3,
      location:'Musanze',  est:1994, students:3210, staff:142, faculties:10,
      passRate:79, gpa:75.1, dropout:4.2, sat:4.3,
      trend:[72,74,76,77,79,79], atRisk:389, complaints:241,
      depts:[
        {name:'Civil Engineering',      s:740, p:81, t:'+1.8', ok:true },
        {name:'Electrical Engineering', s:620, p:83, t:'+2.2', ok:true },
        {name:'Mechanical Engineering', s:580, p:77, t:'-0.5', ok:false},
        {name:'Computer Engineering',   s:480, p:80, t:'+1.0', ok:true },
        {name:'Architecture',           s:400, p:74, t:'-1.5', ok:false},
        {name:'Environmental Eng.',     s:390, p:72, t:'-2.1', ok:false},
      ],
      highlights:['Strong Civil & Electrical programmes','Industry partnerships with 12 major firms'],
      concerns:['Environmental Engineering declining (-2.1%)','Infrastructure complaint volume rising'],
      reviews:[
        {stars:4, text:'Great industry links. Lab equipment is top-tier for engineering.', dept:'Civil'},
        {stars:2, text:'Environmental Engineering curriculum is outdated. Needs urgent investment.', dept:'Env Eng'},
        {stars:3, text:'Teaching quality inconsistent across departments.', dept:'General'},
      ]
    },
    { id:'asu',  name:'Arts & Sciences University', short:'Arts & Sciences',   rank:4,
      location:'Gitarama', est:1998, students:1840, staff:76,  faculties:7,
      passRate:71, gpa:69.8, dropout:6.4, sat:3.9,
      trend:[65,67,69,70,71,71], atRisk:512, complaints:318,
      depts:[
        {name:'Literature & Languages', s:480, p:73, t:'+0.5', ok:true },
        {name:'History & Politics',     s:320, p:70, t:'-1.8', ok:false},
        {name:'Psychology',             s:380, p:76, t:'+1.2', ok:true },
        {name:'Philosophy',             s:200, p:64, t:'-3.1', ok:false},
        {name:'Fine Arts',              s:280, p:69, t:'-0.9', ok:false},
        {name:'Sociology',              s:180, p:68, t:'-2.2', ok:false},
      ],
      highlights:['Psychology programme growing strongly (+1.2%)','Active community outreach programmes'],
      concerns:['Highest dropout rate in lower tier (6.4%)','Philosophy & Sociology declining sharply','Infrastructure critically underfunded'],
      reviews:[
        {stars:3, text:'Good lecturers in Literature but classes are severely overcrowded.', dept:'Literature'},
        {stars:2, text:'Philosophy department has broken projectors and no updated textbooks.', dept:'Philosophy'},
        {stars:4, text:'Psychology programme surprised me — excellent faculty, well-organised.', dept:'Psychology'},
      ]
    },
    { id:'bs',   name:'Business School',            short:'Business School',   rank:5,
      location:'Kigali',   est:2005, students:2410, staff:104, faculties:5,
      passRate:80, gpa:76.2, dropout:3.8, sat:4.2,
      trend:[74,75,77,78,80,80], atRisk:301, complaints:198,
      depts:[
        {name:'Finance & Banking',   s:640, p:83, t:'+2.1', ok:true },
        {name:'Marketing',           s:520, p:80, t:'+0.8', ok:true },
        {name:'Management',          s:480, p:79, t:'-0.5', ok:false},
        {name:'Economics',           s:420, p:76, t:'-1.8', ok:false},
        {name:'Entrepreneurship',    s:350, p:84, t:'+3.2', ok:true },
      ],
      highlights:['Top Entrepreneurship programme nationally (84%)','92% graduate employment within 6 months'],
      concerns:['Economics declining (-1.8%)','Management curriculum needs modernisation'],
      reviews:[
        {stars:4, text:'Entrepreneurship programme is innovative and very well funded.', dept:'Entrepreneurship'},
        {stars:3, text:'Economics lectures are dry and need a case-study approach.', dept:'Economics'},
        {stars:5, text:'Finance department placed 92% of graduates into jobs within 6 months.', dept:'Finance'},
      ]
    },
    { id:'sp',   name:'Southern Polytechnic',       short:'Southern Polytech.',rank:6,
      location:'Huye',     est:2010, students:1620, staff:88,  faculties:6,
      passRate:68, gpa:65.3, dropout:8.1, sat:3.6,
      trend:[62,63,65,66,68,68], atRisk:612, complaints:376,
      depts:[
        {name:'Applied Sciences',  s:380, p:71, t:'+0.5', ok:true },
        {name:'Information Tech.', s:320, p:74, t:'+1.8', ok:true },
        {name:'Agriculture Tech.', s:280, p:67, t:'-1.2', ok:false},
        {name:'Construction',      s:260, p:62, t:'-3.4', ok:false},
        {name:'Textiles & Design', s:220, p:64, t:'-1.9', ok:false},
        {name:'Food Science',      s:160, p:69, t:'+0.3', ok:true },
      ],
      highlights:['Information Technology improving (+1.8%)','Practical vocational focus suited to industry'],
      concerns:['Highest dropout rate nationally (8.1%)','Construction declining sharply (-3.4%)','Critical infrastructure safety issues flagged'],
      reviews:[
        {stars:2, text:'Classrooms overcrowded. Not enough computers for IT practical labs.', dept:'IT'},
        {stars:3, text:'Agriculture programme is practical and well-run but chronically underfunded.', dept:'Agriculture'},
        {stars:1, text:'Construction equipment is dangerous and outdated. Ministry intervention required immediately.', dept:'Construction'},
      ]
    }
  ];

  function _col(v) {
    return v >= 82 ? 'var(--green)' : v >= 74 ? 'var(--yellow)' : 'var(--red)';
  }

  /* ─────────────────────────────────────────────────────────
     LIST VIEW — all schools
  ───────────────────────────────────────────────────────── */
  function render(c) {
    c.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;
      margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div>
        <div style="font-weight:700;font-size:.97rem">🏫 University Performance — National Overview</div>
        <div style="font-size:.82rem;color:var(--text2);margin-top:2px">
          ${SCHOOLS.length} registered institutions · Click any row to drill into school detail
        </div>
      </div>
      <div style="display:flex;gap:6px">
        ${Utils.pill('National Avg: 79%','pill-blue')}
        ${Utils.pill('↑ 1.8% YoY','pill-green')}
      </div>
    </div>

    <div class="card">
      <table>
        <thead><tr>
          <th>Rank</th><th>University</th><th>Location</th>
          <th>Students</th><th>Pass Rate</th><th>Dropout</th>
          <th>Satisfaction</th><th>Status</th><th></th>
        </tr></thead>
        <tbody>
          ${SCHOOLS.map(s => {
            const col    = _col(s.passRate);
            const status = s.passRate >= 82 ? ['Strong','pill-green']
                         : s.passRate >= 74 ? ['Satisfactory','pill-yellow']
                         :                    ['Needs Support','pill-red'];
            const stars  = Math.round(s.sat);
            return `
            <tr style="cursor:pointer;transition:.15s"
              onclick="MinistrySchools.detail('${s.id}')"
              onmouseenter="this.style.background='rgba(108,99,255,.06)'"
              onmouseleave="this.style.background=''">
              <td>
                <div style="width:28px;height:28px;border-radius:50%;
                  background:${s.rank<=2?'var(--accent)':s.rank<=4?'var(--bg3)':'rgba(255,107,107,.15)'};
                  display:flex;align-items:center;justify-content:center;
                  font-weight:800;font-size:.78rem;
                  color:${s.rank<=2?'#fff':s.rank<=4?'var(--text2)':'var(--red)'}">#${s.rank}</div>
              </td>
              <td>
                <div style="font-weight:700;font-size:.9rem">${s.name}</div>
                <div style="font-size:.74rem;color:var(--text2)">${s.faculties} faculties · Est. ${s.est}</div>
              </td>
              <td style="font-size:.84rem;color:var(--text2)">📍 ${s.location}</td>
              <td style="font-weight:600">${s.students.toLocaleString()}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:60px">${Utils.progressBar(s.passRate, col)}</div>
                  <span style="color:${col};font-weight:700">${s.passRate}%</span>
                </div>
              </td>
              <td style="font-weight:600;
                color:${s.dropout<=4?'var(--green)':s.dropout<=6?'var(--yellow)':'var(--red)'}">
                ${s.dropout}%
              </td>
              <td>
                <span style="color:var(--yellow)">${'★'.repeat(stars)}</span><span style="color:var(--border)">${'★'.repeat(5-stars)}</span>
                <span style="font-size:.76rem;color:var(--text2);margin-left:3px">${s.sat}</span>
              </td>
              <td>${Utils.pill(status[0], status[1])}</td>
              <td style="color:var(--accent);font-size:.82rem;white-space:nowrap">Details →</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  }

  /* ─────────────────────────────────────────────────────────
     DETAIL VIEW — one school
  ───────────────────────────────────────────────────────── */
  function detail(id) {
    const s = SCHOOLS.find(x => x.id === id);
    if (!s) return;
    const c   = document.getElementById('main-content');
    const col = _col(s.passRate);

    c.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn-sm btn-secondary"
        onclick="MinistrySchools.render(document.getElementById('main-content'))">
        ← All Universities
      </button>
      <div style="flex:1;min-width:0">
        <div style="font-weight:800;font-size:1.05rem">${s.name}</div>
        <div style="font-size:.82rem;color:var(--text2);margin-top:2px">
          📍 ${s.location} · Est. ${s.est} · ${s.faculties} faculties · ${s.staff} staff members
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${Utils.pill('Rank #'+s.rank, s.rank<=2?'pill-green':s.rank<=4?'pill-blue':'pill-red')}
        ${Utils.pill(s.atRisk+' At-Risk','pill-yellow')}
      </div>
    </div>

    <div class="stats-grid" style="margin-bottom:20px">
      ${Utils.statCard('👥','rgba(108,99,255,.15)', s.students.toLocaleString(), 'Total Students', s.faculties+' faculties', '')}
      ${Utils.statCard('📈',
        s.passRate>=82?'rgba(0,212,170,.15)':s.passRate>=74?'rgba(255,209,102,.15)':'rgba(255,107,107,.15)',
        s.passRate+'%', 'Pass Rate',
        (s.passRate>=79?'Above':'Below')+' 79% national avg',
        s.passRate>=79?'up':'down')}
      ${Utils.statCard('📉','rgba(255,107,107,.15)', s.dropout+'%', 'Dropout Rate',
        s.dropout<=4?'✅ Below 4% threshold':'⚠️ Above 4% threshold',
        s.dropout<=4?'up':'down')}
      ${Utils.statCard('⭐','rgba(255,209,102,.15)', s.sat+'/5', 'Satisfaction',
        s.sat>=4.5?'Excellent':s.sat>=4.0?'Good':'Needs improvement',
        s.sat>=4?'up':'down')}
    </div>

    <div class="grid-2" style="margin-bottom:20px">
      <div class="card">
        <div class="card-title">📈 Pass Rate Trend (2021–2026)</div>
        ${Utils.barChart(s.trend.map((v,i) => ({
          label: String(2021+i), value: v,
          color: v>=82?'var(--green)':v>=74?'var(--accent)':'var(--yellow)'
        })))}
        <div style="font-size:.78rem;color:var(--text2);margin-top:24px;text-align:center">
          ${s.trend[5] > s.trend[0]
            ? `↑ +${s.trend[5]-s.trend[0]}pp improvement since 2021`
            : `→ Performance stable over 5 years`}
        </div>
      </div>

      <div class="card">
        <div class="card-title">🔎 Key Observations</div>
        <div style="margin-bottom:14px">
          <div style="font-size:.72rem;color:var(--green);font-weight:700;
            text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">✅ Strengths</div>
          ${s.highlights.map(h => `
          <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px">
            <span style="color:var(--green);flex-shrink:0;margin-top:1px">●</span>
            <span style="font-size:.85rem;color:var(--text2)">${h}</span>
          </div>`).join('')}
        </div>
        <div>
          <div style="font-size:.72rem;color:var(--red);font-weight:700;
            text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px">⚠️ Concerns</div>
          ${s.concerns.map(con => `
          <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px">
            <span style="color:var(--red);flex-shrink:0;margin-top:1px">●</span>
            <span style="font-size:.85rem;color:var(--text2)">${con}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-title">🏛️ Performance by Department</div>
      <table>
        <thead><tr>
          <th>Department</th><th>Students</th><th>Pass Rate</th><th>Year-on-Year</th><th>Status</th>
        </tr></thead>
        <tbody>
          ${s.depts.map(d => {
            const dc = _col(d.p);
            const tc = d.t.startsWith('+') ? 'var(--green)' : 'var(--red)';
            return `
            <tr>
              <td style="font-weight:600">${d.name}</td>
              <td>${d.s.toLocaleString()}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:80px">${Utils.progressBar(d.p, dc)}</div>
                  <span style="color:${dc};font-weight:700;font-size:.88rem">${d.p}%</span>
                </div>
              </td>
              <td style="color:${tc};font-weight:600">${d.t}%</td>
              <td>${Utils.pill(d.ok?'Active':'Watch', d.ok?'pill-green':'pill-yellow')}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title">💬 Student Reviews (Sample)</div>
        ${s.reviews.map(r => `
        <div style="padding:12px 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span>
              <span style="color:var(--yellow)">${'★'.repeat(r.stars)}</span>
              <span style="color:var(--border)">${'★'.repeat(5-r.stars)}</span>
            </span>
            <span style="font-size:.74rem;color:var(--text2);background:var(--bg3);
              padding:2px 8px;border-radius:10px">${r.dept}</span>
          </div>
          <div style="font-size:.84rem;color:var(--text2);line-height:1.6;
            font-style:italic">"${r.text}"</div>
        </div>`).join('')}
      </div>

      <div class="card">
        <div class="card-title">📋 Complaints &amp; At-Risk</div>
        <div style="text-align:center;padding:16px 0 12px">
          <div style="font-size:2.6rem;font-weight:800;
            color:${s.complaints>=300?'var(--red)':s.complaints>=150?'var(--yellow)':'var(--green)'}">
            ${s.complaints}
          </div>
          <div style="font-size:.85rem;color:var(--text2);margin-top:4px">Complaints this month</div>
          <div style="margin-top:6px">
            ${Utils.pill(
              s.complaints>=300?'High Volume':s.complaints>=150?'Moderate':'Low',
              s.complaints>=300?'pill-red':s.complaints>=150?'pill-yellow':'pill-green'
            )}
          </div>
        </div>
        <div style="background:var(--bg3);border-radius:10px;padding:14px;margin-top:4px">
          <div style="font-size:.78rem;color:var(--text2);font-weight:600;margin-bottom:6px">
            At-Risk Students
          </div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--yellow)">
            ${s.atRisk.toLocaleString()}
          </div>
          <div style="font-size:.78rem;color:var(--text2);margin:4px 0 8px">
            ${Math.round(s.atRisk/s.students*100)}% of total enrollment flagged
          </div>
          ${Utils.progressBar(Math.round(s.atRisk/s.students*100),'var(--yellow)')}
        </div>
        <button class="btn-sm btn-secondary" style="width:100%;margin-top:12px"
          onclick="App.navigate('complaints')">View All Complaints →</button>
      </div>
    </div>`;
  }

  return { render, detail };
})();
