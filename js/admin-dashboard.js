/**
 * admin-dashboard.js
 * Admin portal metrics, event management CRUD table, and quick actions.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Validate admin role
  if (!window.auth.requireAuth('admin')) return;

  const user = window.auth.getUser();
  renderAdminSidebar(user);
  await loadAdminDashboard();
});

let adminEventsCache = [];

function renderAdminSidebar(user) {
  const sidebarUserCard = document.getElementById('sidebar-user-card');
  if (sidebarUserCard) {
    sidebarUserCard.innerHTML = `
      <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}" alt="${user.name}" class="sidebar-avatar" />
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${user.name}</div>
        <div class="sidebar-user-role">Administrator</div>
      </div>
    `;
  }
}

async function loadAdminDashboard() {
  try {
    const statsRes = await window.api.stats.getAdminStats();
    const stats = statsRes.data;

    // Update KPI counters
    const elEvents = document.getElementById('admin-stat-events');
    const elRegs = document.getElementById('admin-stat-registrations');
    const elStudents = document.getElementById('admin-stat-students');
    const elUpcoming = document.getElementById('admin-stat-upcoming');

    if (elEvents) elEvents.textContent = stats.totalEvents;
    if (elRegs) elRegs.textContent = stats.totalRegistrations;
    if (elStudents) elStudents.textContent = stats.totalStudents;
    if (elUpcoming) elUpcoming.textContent = stats.upcomingEvents;

    // Fetch and render events table
    const eventsRes = await window.api.events.getAll();
    adminEventsCache = eventsRes.data || [];
    renderAdminEventsTable(adminEventsCache);

    // Setup table search
    const searchInput = document.getElementById('admin-event-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        const filtered = adminEventsCache.filter(
          (evt) =>
            evt.title.toLowerCase().includes(q) ||
            evt.category.toLowerCase().includes(q) ||
            evt.venue.toLowerCase().includes(q)
        );
        renderAdminEventsTable(filtered);
      });
    }

    // Render Recent Registrations Activity
    renderRecentRegistrationsWidget(stats.recentRegistrations || []);
  } catch (err) {
    console.error('Failed to load admin stats:', err);
    window.main.showToast(err.message, 'error');
  }
}

function renderAdminEventsTable(events) {
  const tbody = document.getElementById('admin-events-tbody');
  const countBadge = document.getElementById('admin-events-count');
  if (!tbody) return;

  if (countBadge) countBadge.textContent = `${events.length} Events Total`;

  if (events.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 2.5rem;">No events found.</td></tr>`;
    return;
  }

  tbody.innerHTML = events.map((event) => {
    const seatsRatio = `${event.registeredSeats || 0} / ${event.totalSeats}`;
    const isSoldOut = (event.registeredSeats || 0) >= event.totalSeats;

    return `
      <tr>
        <td style="width: 60px;">
          <img src="${event.image}" alt="${event.title}" style="width: 50px; height: 38px; object-fit: cover; border-radius: var(--radius-sm);" />
        </td>
        <td>
          <a href="event-details.html?id=${event.id}" style="font-weight: 700; color: var(--text-main);">
            ${event.title}
          </a>
          <small class="text-muted" style="display: block;">Organizer: ${event.organizer}</small>
        </td>
        <td>${window.main.getCategoryBadge(event.category)}</td>
        <td>
          <div style="font-weight: 600;">${window.main.formatDate(event.date)}</div>
          <small class="text-muted">${event.time}</small>
        </td>
        <td>
          <span style="font-weight: 700; color: ${isSoldOut ? 'var(--danger)' : 'var(--text-main)'};">
            ${seatsRatio}
          </span>
          <small class="text-muted" style="display: block;">${isSoldOut ? 'Full' : 'Available'}</small>
        </td>
        <td>${window.main.getStatusBadge(event.status)}</td>
        <td>
          <div class="table-actions">
            <a href="registrations.html?eventId=${event.id}" class="btn btn-xs btn-outline-primary" title="View attendees">
              👥 Attendees
            </a>
            <a href="create-event.html?id=${event.id}" class="btn btn-xs btn-outline-primary" title="Edit event">
              ✏️ Edit
            </a>
            <button class="btn btn-xs btn-outline-danger" onclick="confirmDeleteEvent('${event.id}', '${encodeURIComponent(event.title)}')" title="Delete event">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderRecentRegistrationsWidget(regs) {
  const container = document.getElementById('admin-recent-regs-tbody');
  if (!container) return;

  if (regs.length === 0) {
    container.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="padding: 1.5rem;">No recent registrations recorded.</td></tr>`;
    return;
  }

  container.innerHTML = regs.map((r) => `
    <tr>
      <td>
        <strong style="color: var(--text-main); font-size: 0.85rem;">${r.studentName}</strong>
        <small class="text-muted" style="display: block;">${r.studentEmail}</small>
      </td>
      <td>
        <span style="font-size: 0.85rem; font-weight: 600;">${r.eventTitle}</span>
      </td>
      <td><span style="font-family: monospace; font-size: 0.8rem; font-weight: 700;">${r.ticketCode}</span></td>
      <td>${window.main.getStatusBadge(r.status)}</td>
    </tr>
  `).join('');
}

function confirmDeleteEvent(eventId, encodedTitle) {
  const title = decodeURIComponent(encodedTitle);
  const ok = confirm(`Are you sure you want to permanently delete event:\n\n"${title}"?\n\nThis will remove all associated registrations.`);

  if (ok) {
    deleteEvent(eventId);
  }
}

async function deleteEvent(eventId) {
  try {
    await window.api.events.delete(eventId);
    window.main.showToast('Event deleted successfully.', 'success');
    await loadAdminDashboard();
  } catch (err) {
    window.main.showToast(`Error: ${err.message}`, 'error');
  }
}

window.confirmDeleteEvent = confirmDeleteEvent;
