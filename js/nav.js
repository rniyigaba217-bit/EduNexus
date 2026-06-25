const Nav = (() => {

  function build() {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = '';
    (State.navConfig[State.currentRole] || []).forEach(item => {
      if (item.section) {
        nav.innerHTML += `<div class="nav-section">${item.section}</div>`;
      } else {
        nav.innerHTML += `
          <div class="nav-item" id="nav-${item.id}" onclick="App.navigate('${item.id}')">
            <span class="icon">${item.icon}</span>
            <span>${item.label}</span>
          </div>`;
      }
    });
  }

  function setActive(page) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('nav-' + page);
    if (el) {
      el.classList.add('active');
      el.scrollIntoView({ block:'nearest', behavior:'smooth' });
    }
    if (window.innerWidth <= 768) closeSidebar();
  }

  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const opening = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', opening);
    if (overlay) overlay.classList.toggle('open', opening);
  }

  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  return { build, setActive, toggleSidebar, closeSidebar };
})();
