/**
 * student-dashboard.js
 * Student Dashboard metrics, registered events overview, and reminders.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Ensure user is authenticated as student or admin
  const user = window.auth.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  renderStudentSidebar(user);
  await loadStudentDashboard(user);
});

function renderStudentSidebar(user) {
  const sidebarUserCard = document.getElementById('sidebar-user-card');
  if (sidebarUserCard) {
    sidebarUserCard.innerHTML = `
      <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}" alt="${user.name}" class="sidebar-avatar" />
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${user.name}</div>
        <div class="sidebar-user-role">${user.department || 'Student'}</div>
      </div>
    `;
  }
}

async function loadStudentDashboard(user) {
  try {
    // Fetch stats
    const statsRes = await window.api.stats.getStudentStats(user.id);
    const stats = statsRes.data;

    // Update KPI numbers
    const totalRegEl = document.getElementById('stat-total-registered');
    if (totalRegEl) totalRegEl.textContent = stats.registeredCount;

    const upcomingEl = document.getElementById('stat-upcoming');
    if (upcomingEl) upcomingEl.textContent = stats.upcomingCount;

    const completedEl = document.getElementById('stat-completed');
    if (completedEl) completedEl.textContent = stats.completedCount;

    // Fetch user registrations
    const regsRes = await window.api.registrations.getByUser(user.id);
    const myRegistrations = regsRes.data || [];

    // Fetch all events for recommended section & full event info
    const eventsRes = await window.api.events.getAll();
    const allEvents = eventsRes.data || [];

    renderUpcomingHighlight(myRegistrations, allEvents);
    renderRecentRegistrations(myRegistrations);
    renderRecommendedEvents(myRegistrations, allEvents);
  } catch (err) {
    console.error('Error loading student dashboard:', err);
    window.main?.showToast?.(err.message, 'error');
  }
}

function renderUpcomingHighlight(myRegistrations, allEvents) {
  const container = document.getElementById('upcoming-highlight-card');
  if (!container) return;

  if (myRegistrations.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 2rem;">
        <span class="empty-state-icon">🎟️</span>
        <h3>No Registered Events Yet</h3>
        <p>Explore exciting hackathons, workshops, and fests happening on campus!</p>
        <a href="events.html" class="btn btn-primary btn-sm">Explore Events Now</a>
      </div>
    `;
    return;
  }

  // Find next upcoming
  const nextReg = myRegistrations[0];
  const nextEvent = allEvents.find((e) => e.id === nextReg.eventId) || {
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    title: nextReg.eventTitle,
    date: nextReg.eventDate,
    time: nextReg.eventTime || '10:00 AM',
    venue: nextReg.eventVenue
  };

  container.innerHTML = `
    <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); color: #FFFFFF; border-radius: var(--radius-xl); overflow: hidden; display: flex; flex-wrap: wrap; box-shadow: var(--shadow-lg);">
      <div style="flex: 1 1 350px; padding: 2.25rem; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <span class="badge badge-warning" style="margin-bottom: 1rem;">NEXT UPCOMING EVENT</span>
          <h2 style="color: #FFFFFF; font-size: 1.6rem; margin-bottom: 0.75rem;">${nextEvent.title}</h2>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; color: #C7D2FE; margin-bottom: 1.5rem;">
            <span>📅 <strong>${window.main.formatDate(nextEvent.date)}</strong> (${nextEvent.time})</span>
            <span>📍 <strong>${nextEvent.venue}</strong></span>
            <span>🎫 Ticket Code: <strong style="color: #FBBF24; font-family: monospace;">${nextReg.ticketCode}</strong></span>
          </div>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <a href="my-events.html" class="btn btn-primary btn-sm">View Boarding Pass</a>
          <a href="event-details.html?id=${nextReg.eventId}" class="btn btn-outline-light btn-sm">Event Details</a>
        </div>
      </div>
      <div style="flex: 1 1 250px; min-height: 220px; position: relative;">
        <img src="${nextEvent.image}" alt="${nextEvent.title}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    </div>
  `;
}

function renderRecentRegistrations(registrations) {
  const container = document.getElementById('student-registrations-table');
  if (!container) return;

  if (registrations.length === 0) {
    container.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding: 2rem;">No registered events.</td></tr>`;
    return;
  }

  container.innerHTML = registrations.slice(0, 4).map((reg) => `
    <tr>
      <td>
        <strong style="color: var(--text-main); font-size: 0.9rem;">${reg.eventTitle}</strong>
        <small class="text-muted" style="display: block;">Ticket: <span style="font-family: monospace;">${reg.ticketCode}</span></small>
      </td>
      <td>${window.main.formatDate(reg.eventDate)}</td>
      <td>${reg.eventVenue}</td>
      <td>${window.main.getStatusBadge(reg.status)}</td>
      <td>
        <a href="my-events.html" class="btn btn-xs btn-outline-primary">View Pass</a>
      </td>
    </tr>
  `).join('');
}

function renderRecommendedEvents(myRegistrations, allEvents) {
  const container = document.getElementById('recommended-events-grid');
  if (!container) return;

  const registeredEventIds = new Set(myRegistrations.map((r) => r.eventId));
  const unbookedEvents = allEvents.filter((e) => !registeredEventIds.has(e.id)).slice(0, 2);

  if (unbookedEvents.length === 0) {
    container.innerHTML = `<p class="text-muted">You are registered for all available events! Amazing initiative!</p>`;
    return;
  }

  container.innerHTML = unbookedEvents.map((e) => `
    <div class="event-card animate-fade-in">
      <div class="event-card-img-wrap" style="height: 140px;">
        <img src="${e.image}" alt="${e.title}" class="event-card-img" />
        <div class="event-card-top-badges">
          ${window.main.getCategoryBadge(e.category)}
        </div>
      </div>
      <div class="event-card-body" style="padding: 1rem;">
        <h4 style="font-size: 1rem; margin-bottom: 0.35rem;">
          <a href="event-details.html?id=${e.id}">${e.title}</a>
        </h4>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.75rem;">
          📅 ${window.main.formatDate(e.date)} &bull; 📍 ${e.venue}
        </div>
        <a href="event-details.html?id=${e.id}" class="btn btn-sm btn-outline-primary btn-block">
          Register &rarr;
        </a>
      </div>
    </div>
  `).join('');
}
