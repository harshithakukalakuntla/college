/**
 * main.js
 * Core UI interactions, toast notifications, navbar rendering, and global helpers.
 */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderDemoBar();
  initMobileMenu();
  initModals();
});

/**
 * Toast Notification System
 * @param {string} message - Message text
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {number} duration - Milliseconds before hiding
 */
function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate-slide-in`;

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || '•'}</span>
    <div class="toast-content">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Renders the top Demo quick switcher bar so reviewers and examiners
 * can immediately switch between Student, Admin, and Guest test views.
 */
function renderDemoBar() {
  // If demo bar container already in DOM, populate it
  const demoBanner = document.getElementById('demo-role-banner');
  if (!demoBanner) return;

  const user = window.auth?.getUser();
  const currentRole = user ? user.role : 'guest';

  demoBanner.innerHTML = `
    <div class="demo-banner-content">
      <span class="demo-tag"><span class="pulse-dot"></span> Demo Mode Active</span>
      <span class="demo-label">Current Role: <strong>${user ? user.name + ` (${user.role.toUpperCase()})` : 'Guest / Visitor'}</strong></span>
      <div class="demo-buttons">
        <button class="btn btn-xs ${currentRole === 'student' ? 'btn-primary' : 'btn-outline-light'}" onclick="window.auth.quickLogin('student')">
          👤 Switch to Student
        </button>
        <button class="btn btn-xs ${currentRole === 'admin' ? 'btn-primary' : 'btn-outline-light'}" onclick="window.auth.quickLogin('admin')">
          🛡️ Switch to Admin
        </button>
        ${user ? `<button class="btn btn-xs btn-outline-danger" onclick="window.auth.logout()">Sign Out</button>` : ''}
      </div>
    </div>
  `;
}

/**
 * Dynamic Navbar rendering based on user authentication and current page
 */
function renderNavbar() {
  const navContainer = document.getElementById('main-navbar');
  if (!navContainer) return;

  const user = window.auth?.getUser();
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  const isHome = currentPath === 'index.html' || currentPath === '';
  const isEvents = currentPath === 'events.html' || currentPath === 'event-details.html';
  const isDashboard = currentPath.includes('dashboard') || currentPath === 'my-events.html' || currentPath === 'registrations.html';

  let userNavHtml = '';

  if (user) {
    const isStudent = user.role === 'student';
    const dashboardLink = isStudent ? 'student-dashboard.html' : 'admin-dashboard.html';

    userNavHtml = `
      <div class="nav-user-dropdown" id="user-dropdown">
        <button class="user-pill-btn" onclick="toggleUserDropdown(event)" aria-label="User Menu">
          <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}" alt="${user.name}" class="nav-avatar" />
          <span class="nav-user-name">${user.name.split(' ')[0]}</span>
          <span class="badge ${isStudent ? 'badge-primary' : 'badge-admin'}">${user.role}</span>
          <span class="caret-down">▼</span>
        </button>
        <div class="dropdown-menu" id="dropdown-menu-list">
          <div class="dropdown-header">
            <strong>${user.name}</strong>
            <small>${user.email}</small>
          </div>
          <hr class="dropdown-divider" />
          <a href="${dashboardLink}" class="dropdown-item">
            <span>📊</span> ${isStudent ? 'Student Dashboard' : 'Admin Dashboard'}
          </a>
          ${isStudent ? `
            <a href="my-events.html" class="dropdown-item">
              <span>🎟️</span> My Registered Events
            </a>
          ` : `
            <a href="create-event.html" class="dropdown-item">
              <span>➕</span> Create New Event
            </a>
            <a href="registrations.html" class="dropdown-item">
              <span>👥</span> All Registrations
            </a>
          `}
          <a href="profile.html" class="dropdown-item">
            <span>👤</span> My Profile
          </a>
          <hr class="dropdown-divider" />
          <button onclick="window.auth.logout()" class="dropdown-item text-danger">
            <span>🚪</span> Sign Out
          </button>
        </div>
      </div>
    `;
  } else {
    userNavHtml = `
      <div class="nav-auth-buttons">
        <a href="login.html" class="btn btn-outline-primary btn-sm">Log In</a>
        <a href="register.html" class="btn btn-primary btn-sm">Get Started</a>
      </div>
    `;
  }

  // Dashboard link logic
  let dashTab = '';
  if (user) {
    const dashUrl = user.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';
    const dashLabel = user.role === 'admin' ? 'Admin Portal' : 'My Dashboard';
    dashTab = `<li><a href="${dashUrl}" class="nav-link ${isDashboard ? 'active' : ''}">${dashLabel}</a></li>`;
  }

  navContainer.innerHTML = `
    <div class="nav-wrapper container">
      <a href="index.html" class="brand-logo">
        <span class="brand-icon">🎓</span>
        <span class="brand-text">Campus<span class="text-gradient">Pulse</span></span>
      </a>

      <button class="mobile-menu-toggle" id="mobile-toggle" aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>

      <nav class="nav-links-wrapper" id="nav-links">
        <ul class="nav-links">
          <li><a href="index.html" class="nav-link ${isHome ? 'active' : ''}">Home</a></li>
          <li><a href="events.html" class="nav-link ${isEvents ? 'active' : ''}">Explore Events</a></li>
          ${dashTab}
        </ul>
        <div class="nav-right">
          ${userNavHtml}
        </div>
      </nav>
    </div>
  `;

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('dropdown-menu-list');
    const btn = document.getElementById('user-dropdown');
    if (dropdown && btn && !btn.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
}

function toggleUserDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('dropdown-menu-list');
  if (dropdown) dropdown.classList.toggle('show');
}

function initMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.classList.toggle('is-active');
    });
  }
}

/**
 * Global Modal handlers
 */
function initModals() {
  document.querySelectorAll('[data-modal-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });

  // Close modal when clicking on the dark backdrop
  document.querySelectorAll('.modal-overlay').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/**
 * Format Helpers
 */
function formatDate(dateString) {
  if (!dateString) return 'TBA';
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  } catch (e) {
    return dateString;
  }
}

function getCategoryBadge(category) {
  const cat = (category || '').toLowerCase();
  const colorMap = {
    technology: 'badge-tech',
    cultural: 'badge-cultural',
    workshop: 'badge-workshop',
    seminar: 'badge-seminar',
    sports: 'badge-sports',
    career: 'badge-career'
  };
  const badgeClass = colorMap[cat] || 'badge-default';
  return `<span class="badge ${badgeClass}">${category}</span>`;
}

function getStatusBadge(status) {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed' || s === 'completed' || s === 'active') {
    return `<span class="badge badge-success">${status}</span>`;
  }
  if (s === 'pending' || s === 'upcoming') {
    return `<span class="badge badge-warning">${status}</span>`;
  }
  if (s === 'cancelled' || s === 'sold out') {
    return `<span class="badge badge-danger">${status}</span>`;
  }
  return `<span class="badge badge-info">${status}</span>`;
}

// Attach to window object
window.main = {
  showToast,
  openModal,
  closeModal,
  formatDate,
  getCategoryBadge,
  getStatusBadge
};
