/**
 * EduNexus — syslog.js
 * Platform-wide system event logger. Super-admin reads from here.
 * All other modules call SysLog.write() to record events.
 */

const SysLog = (() => {
  const KEY = 'edunexus_syslog';
  const MAX = 300;

  /* ── Internal helpers ─────────────────────────── */
  function _load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }

  function _save(log) {
    if (log.length > MAX) log.length = MAX;
    localStorage.setItem(KEY, JSON.stringify(log));
  }

  function _ts(dt) {
    const d = new Date(dt || Date.now());
    return {
      time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      date: d.toISOString().slice(0, 10),
      ts:   d.getTime(),
    };
  }

  /* ── Public API ───────────────────────────────── */

  // Write a new event. level: 'info' | 'warning' | 'error'
  function write(type, detail, level = 'info') {
    const log = _load();
    const { time, date, ts } = _ts();
    log.unshift({ id: ts + Math.random(), type, detail, level, time, date, ts });
    _save(log);
  }

  // Return the most recent N events
  function get(limit = 50) {
    return _load().slice(0, limit);
  }

  // Events of a specific type
  function getByType(type, limit = 30) {
    return _load().filter(e => e.type === type).slice(0, limit);
  }

  // Count events of a given level recorded today
  function countToday(level) {
    const today = new Date().toISOString().slice(0, 10);
    return _load().filter(e => e.date === today && (!level || e.level === level)).length;
  }

  // Count events of a given type recorded today
  function countTodayType(type) {
    const today = new Date().toISOString().slice(0, 10);
    return _load().filter(e => e.date === today && e.type === type).length;
  }

  /* ── Seed realistic demo events on first load ─── */
  (function seed() {
    if (localStorage.getItem('edunexus_syslog_seeded')) return;

    const now = Date.now();
    const m   = 60 * 1000;

    const raw = [
      { ago:   4*m, type:'login_success',   detail:'facilitator@edunexus.dev logged in',                              level:'info'    },
      { ago:  11*m, type:'file_upload',      detail:'Dr. Williams uploaded "Week 8 — Trees.pdf" (4.2 MB) · CS301',    level:'info'    },
      { ago:  17*m, type:'login_fail',       detail:'unknown@domain.co — failed attempt 2/5',                          level:'warning' },
      { ago:  24*m, type:'login_success',    detail:'student@edunexus.dev logged in',                                 level:'info'    },
      { ago:  30*m, type:'assignment_sub',   detail:'Alex Johnson submitted "Binary Search Tree Implementation"',     level:'info'    },
      { ago:  44*m, type:'login_fail',       detail:'hacker99@test.com — locked out after 5 attempts',                level:'error'   },
      { ago:  51*m, type:'file_upload',      detail:'Prof. Ahmed uploaded "Algorithms Lecture.mp4" (220 MB) · CS302', level:'info'    },
      { ago:  62*m, type:'login_success',    detail:'admin@edunexus.dev logged in',                                   level:'info'    },
      { ago:  77*m, type:'system_error',     detail:'AI Advisor API timeout — auto-retry succeeded (2.1 s)',          level:'warning' },
      { ago:  89*m, type:'data_sync',        detail:'Platform sync completed — 48 records updated',                   level:'info'    },
      { ago: 109*m, type:'login_fail',       detail:'wrong@email.com — failed attempt 3/5',                           level:'warning' },
      { ago: 119*m, type:'file_upload',      detail:'Dr. Patel uploaded "OS Lab Manual.pdf" (8.1 MB) · CS303',        level:'info'    },
      { ago: 144*m, type:'login_success',    detail:'director@edunexus.dev logged in',                               level:'info'    },
      { ago: 159*m, type:'attendance',       detail:'Dr. Williams recorded attendance — CS301 Week 7 (5/6 present)',  level:'info'    },
      { ago: 179*m, type:'announcement',     detail:'Dr. Fatima Osei posted "End-of-Term Examination Schedule"',      level:'info'    },
      { ago: 209*m, type:'account_create',   detail:'New uni-admin account created: prof.kim@tech.edu',              level:'info'    },
      { ago: 239*m, type:'login_success',    detail:'ministry@edunexus.dev logged in',                               level:'info'    },
      { ago: 299*m, type:'data_sync',        detail:'Nightly backup completed — 2.3 GB archived',                    level:'info'    },
      { ago: 359*m, type:'system_error',     detail:'EmailJS rate limit reached — notifications queued',             level:'warning' },
      { ago: 419*m, type:'file_upload',      detail:'Dr. Kim uploaded "DB Systems Lecture 9.pdf" (3.8 MB) · CS304',  level:'info'    },
      { ago: 479*m, type:'assignment_create',detail:'Dr. Williams created assignment "Graph Traversal Report" · CS302', level:'info'  },
      { ago: 539*m, type:'login_fail',       detail:'intern@outsource.net — failed attempt 1/5',                     level:'warning' },
      { ago: 599*m, type:'login_success',    detail:'superadmin@edunexus.dev logged in',                             level:'info'    },
    ];

    const events = raw.map(e => {
      const { time, date, ts } = _ts(now - e.ago);
      return { id: ts, type: e.type, detail: e.detail, level: e.level, time, date, ts };
    });

    _save(events);
    localStorage.setItem('edunexus_syslog_seeded', '1');
  })();

  return { write, get, getByType, countToday, countTodayType };
})();
