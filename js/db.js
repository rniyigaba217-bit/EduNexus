// ─────────────────────────────────────────────────────────
// EduNexus — Local Database
// Hardcoded seed accounts below. Runtime-created accounts
// (created by admins in the UI) are stored in localStorage
// under EXTRA_KEY and merged transparently on every lookup.
//
// To generate a SHA-256 hash for a new seed password, paste
// this snippet in the browser console:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('YourPassword'))
//     .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
// ─────────────────────────────────────────────────────────

const DB = (() => {

  const EXTRA_KEY = 'edunexus_created_users';

  // ── Seed Accounts ──────────────────────────────────────
  const _seed = [
    {
      email:        'student@edunexus.dev',
      passwordHash: '9d971338728c9b113ae7239d13863434ad0b67036db2453ce01a0456ae33dbd8',
      profile: {
        name:'Alex Johnson', role:'student', roleLabel:'Student · CS Dept',
        uni:'University of Technology', avatar:'AJ', color:'#6c63ff',
        email:'student@edunexus.dev',
      },
    },
    {
      email:        'facilitator@edunexus.dev',
      passwordHash: 'e49741c5931e3a7f46eeeaf228ce30f11d103fd61efb759856895cdf67a20693',
      profile: {
        name:'Dr. Sarah Williams', role:'facilitator', roleLabel:'Facilitator · CS Dept',
        uni:'University of Technology', avatar:'SW', color:'#00d4aa',
        email:'facilitator@edunexus.dev',
      },
    },
    {
      email:        'admin@edunexus.dev',
      passwordHash: '8532184512cde54a9c7e2c6038113bb1d14f2292ca72c44f4bb4f51773680b4c',
      profile: {
        name:'Prof. Mark Davis', role:'uni-admin', roleLabel:'University Admin',
        uni:'University of Technology', avatar:'MD', color:'#ffd166',
        email:'admin@edunexus.dev',
      },
    },
    {
      email:        'superadmin@edunexus.dev',
      passwordHash: '85689e913b7d8a64eddc92dac4ccb9e4d81eb4a975ad74caf07a854984321695',
      profile: {
        name:'System Admin', role:'super-admin', roleLabel:'Super Administrator',
        uni:'EduNexus Platform', avatar:'SA', color:'#ff6b6b',
        email:'superadmin@edunexus.dev',
      },
    },
    {
      email:        'ministry@edunexus.dev',
      passwordHash: '2ce3b5af29ff9ec88db25f5f89375db212614fe653ffb4b16732f26a8b2d0179',
      profile: {
        name:'Dr. Amina Kone', role:'ministry', roleLabel:'Ministry of Education',
        uni:'Ministry Dashboard', avatar:'AK', color:'#ce93d8',
        email:'ministry@edunexus.dev',
      },
    },
    {
      email:        'director@edunexus.dev',
      passwordHash: '93089ea4a753442f02b01ed8b8f1bc34c978c7641e32ec88ac19812e000c8a19',
      profile: {
        name:'Dr. Fatima Osei', role:'school-director', roleLabel:'School Director',
        uni:'University of Technology', avatar:'FO', color:'#38bdf8',
        email:'director@edunexus.dev',
      },
    },
  ];

  // ── localStorage helpers ────────────────────────────────
  function _loadExtra() {
    try { return JSON.parse(localStorage.getItem(EXTRA_KEY) || '[]'); } catch { return []; }
  }

  function _saveExtra(arr) {
    localStorage.setItem(EXTRA_KEY, JSON.stringify(arr));
  }

  function _all() {
    return [..._seed, ..._loadExtra()];
  }

  // ── Crypto helpers ──────────────────────────────────────
  async function _sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function generatePassword() {
    const upper   = 'ABCDEFGHJKMNPQRSTUVWXYZ';
    const lower   = 'abcdefghjkmnpqrstuvwxyz';
    const digits  = '23456789';
    const special = '@#!$';
    const rng = crypto.getRandomValues(new Uint8Array(10));
    // Guarantee one from each required class, then pad with mixed chars
    const all = upper + lower + digits + special;
    const chars = [
      upper  [rng[0] % upper.length],
      upper  [rng[1] % upper.length],
      lower  [rng[2] % lower.length],
      lower  [rng[3] % lower.length],
      digits [rng[4] % digits.length],
      special[rng[5] % special.length],
      all    [rng[6] % all.length],
      all    [rng[7] % all.length],
      all    [rng[8] % all.length],
      all    [rng[9] % all.length],
    ];
    // Simple shuffle using a second set of random bytes
    const sh = crypto.getRandomValues(new Uint8Array(10));
    for (let i = chars.length - 1; i > 0; i--) {
      const j = sh[i] % (i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  }

  // ── Public API ──────────────────────────────────────────
  function findByEmail(email) {
    const key = email.trim().toLowerCase();
    return _all().find(u => u.email === key) || null;
  }

  function getAllByRole(role) {
    return _all().filter(u => u.profile.role === role).map(u => u.profile);
  }

  async function createUser(email, plainPassword, profile) {
    const key = email.trim().toLowerCase();
    if (findByEmail(key)) throw new Error('Email already registered');
    const hash = await _sha256(plainPassword);
    const extra = _loadExtra();
    extra.push({ email: key, passwordHash: hash, profile: { ...profile, email: key } });
    _saveExtra(extra);
  }

  return { findByEmail, getAllByRole, createUser, generatePassword };
})();
