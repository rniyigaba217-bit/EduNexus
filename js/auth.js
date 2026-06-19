const Auth = (() => {

  const SESSION_KEY  = 'edunexus_session';
  const ATTEMPTS_KEY = 'edunexus_attempts';
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MS   = 5 * 60 * 1000; // 5 minutes

  // Restore session automatically on page refresh
  (function init() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    try {
      _mountApp(JSON.parse(raw));
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  })();

  async function login() {
    const email    = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    _clearError();

    if (!email || !password) {
      _showError('Please enter your email and password.');
      return;
    }

    if (_isLockedOut()) {
      _showError('Too many failed attempts. Please wait 5 minutes and try again.');
      return;
    }

    _setLoading(true);

    try {
      const user = DB.findByEmail(email);
      const hash = await _sha256(password);

      // Same timing whether email exists or not — prevents user enumeration
      if (!user || hash !== user.passwordHash) {
        _recordFailure();
        _setLoading(false);
        _showError('Incorrect email or password.');
        return;
      }

      // Success — clear failures, save session
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user.profile));
      _mountApp(user.profile);

    } catch {
      _setLoading(false);
      _showError('An unexpected error occurred. Please try again.');
    }
  }

  function logout() {
    if (State.modalTimer) { clearInterval(State.modalTimer); State.modalTimer = null; }
    State.aiHistory = [];
    State.clearProfile();
    localStorage.removeItem(SESSION_KEY);
    document.getElementById('app').style.display          = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-password').value       = '';
    _setLoading(false);
  }

  function _mountApp(profile) {
    State.setProfile(profile);

    document.getElementById('login-screen').style.display  = 'none';
    document.getElementById('app').style.display           = 'flex';
    document.getElementById('sidebar-avatar').textContent  = profile.avatar;
    document.getElementById('sidebar-avatar').style.background = `linear-gradient(135deg,${profile.color},#0f1117)`;
    document.getElementById('sidebar-uname').textContent   = profile.name;
    document.getElementById('sidebar-urole').textContent   = profile.roleLabel;
    document.getElementById('uni-name-label').textContent  = profile.uni;
    document.getElementById('topbar-role-label').textContent = profile.roleLabel.split(' · ')[0];

    Nav.build();
    App.navigate('dashboard');
  }

  async function _sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function _isLockedOut() {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return false;
    const { count, lastAt } = JSON.parse(raw);
    if ((Date.now() - lastAt) >= LOCKOUT_MS) {
      localStorage.removeItem(ATTEMPTS_KEY);
      return false;
    }
    return count >= MAX_ATTEMPTS;
  }

  function _recordFailure() {
    const raw  = localStorage.getItem(ATTEMPTS_KEY);
    const data = raw ? JSON.parse(raw) : { count: 0, lastAt: 0 };
    data.count  += 1;
    data.lastAt  = Date.now();
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data));
  }

  function _showError(msg) {
    const el = document.getElementById('login-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function _clearError() {
    const el = document.getElementById('login-error');
    if (el) { el.textContent = ''; el.style.display = 'none'; }
  }

  function _setLoading(on) {
    const btn = document.getElementById('login-btn');
    if (btn) { btn.disabled = on; btn.textContent = on ? 'Signing in…' : 'Sign In'; }
  }

  return { login, logout };
})();
