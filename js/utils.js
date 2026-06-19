/**
 * EduNexus — utils.js
 * Reusable UI helpers used across all views.
 */

const Utils = (() => {

  /* ── Modal ────────────────────────────────────── */
  function openModal(title, bodyHTML) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    document.getElementById('modal-overlay').classList.add('open');
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    if (State.modalTimer) { clearInterval(State.modalTimer); State.modalTimer = null; }
  }

  /* ── Tab switcher ────────────────────────────── */
  function switchTab(el) {
    el.closest('.tabs').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
  }

  /* ── Stars picker ────────────────────────────── */
  function setStars(n) {
    const row = document.getElementById('star-row');
    if (row) row.querySelectorAll('span').forEach((s, i) => s.textContent = i < n ? '★' : '☆');
  }

  /* ── Grade colour helper ─────────────────────── */
  function gradeColor(pct) {
    if (pct >= 85) return 'var(--green)';
    if (pct >= 70) return 'var(--yellow)';
    return 'var(--red)';
  }

  function gradePill(pct) {
    if (pct >= 85) return 'pill-green';
    if (pct >= 70) return 'pill-blue';
    if (pct >= 60) return 'pill-yellow';
    return 'pill-red';
  }

  function letterGrade(pct) {
    if (pct >= 90) return 'A+';
    if (pct >= 85) return 'A';
    if (pct >= 80) return 'B+';
    if (pct >= 75) return 'B';
    if (pct >= 70) return 'C+';
    if (pct >= 65) return 'C';
    if (pct >= 60) return 'D+';
    return 'F';
  }

  /* ── Avatar initials ─────────────────────────── */
  function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  /* ── Progress bar HTML ───────────────────────── */
  function progressBar(pct, color = 'var(--accent)') {
    return `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${color}"></div></div>`;
  }

  /* ── Stat card HTML ──────────────────────────── */
  function statCard(icon, iconBg, value, label, change = '', changeClass = '') {
    return `
    <div class="stat-card">
      <div class="stat-icon" style="background:${iconBg}">${icon}</div>
      <div class="stat-info">
        <div class="stat-value">${value}</div>
        <div class="stat-label">${label}</div>
        ${change ? `<div class="stat-change ${changeClass}">${change}</div>` : ''}
      </div>
    </div>`;
  }

  /* ── Bar chart HTML ──────────────────────────── */
  function barChart(data) {
    // data: [{label, value, color}]
    const max = Math.max(...data.map(d => d.value));
    return `
    <div class="bar-chart">
      ${data.map(d => `
      <div class="bar" style="height:${(d.value/max)*100}%;background:${d.color || 'var(--accent)'}">
        <div class="bar-val">${d.value}%</div>
        <div class="bar-label">${d.label}</div>
      </div>`).join('')}
    </div>
    <div style="margin-top:28px"></div>`;
  }

  /* ── Pill badge HTML ─────────────────────────── */
  function pill(text, cls = 'pill-accent') {
    return `<span class="pill ${cls}">${text}</span>`;
  }

  /* ── Empty state ─────────────────────────────── */
  function empty(msg = 'Nothing here yet') {
    return `<div class="empty">${msg}</div>`;
  }

  /* ── Toast notification ──────────────────────── */
  function toast(message, type = 'success') {
    const t = document.createElement('div');
    t.style.cssText = `
      position:fixed;bottom:24px;right:24px;z-index:999;
      background:${type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--red)' : 'var(--accent)'};
      color:#fff;padding:12px 20px;border-radius:10px;font-size:.9rem;
      font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,.4);
      animation:fadeIn .3s ease;
    `;
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  /* ── Confirm dialog ──────────────────────────── */
  function confirm(message, onYes) {
    openModal('Confirm', `
      <p style="color:var(--text2);margin-bottom:20px">${message}</p>
      <div style="display:flex;gap:10px">
        <button class="btn-sm btn-secondary" style="flex:1" onclick="Utils.closeModal()">Cancel</button>
        <button class="btn-sm btn-danger" style="flex:1" onclick="Utils.closeModal();(${onYes.toString()})()">Confirm</button>
      </div>`);
  }

  /* ── Format date ─────────────────────────────── */
  function formatDate(d = new Date()) {
    return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  }

  function formatTime(d = new Date()) {
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  /* ── Expose ──────────────────────────────────── */
  return {
    openModal, closeModal, switchTab, setStars,
    gradeColor, gradePill, letterGrade,
    initials, progressBar, statCard, barChart,
    pill, empty, toast, confirm,
    formatDate, formatTime,
  };
})();

/* ── Global click handlers ───────────────────── */
document.addEventListener('click', e => {
  const panel = document.getElementById('notif-panel');
  if (panel?.classList.contains('open') && !panel.contains(e.target) && !e.target.closest('.notif-btn')) {
    Notifications.close();
  }
  const overlay = document.getElementById('modal-overlay');
  if (overlay?.classList.contains('open') && e.target === overlay) {
    Utils.closeModal();
  }
});