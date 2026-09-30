/**
 * registrations.js
 * Admin Registrations management: filter by event/status, search, inline status updates, CSV export.
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.auth.requireAuth('admin')) return;

  const user = window.auth.getUser();
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

  await initRegistrationsPage();
});

let allRegistrationsCache = [];
let allEventsCache = [];
let selectedEventId = 'all';
let selectedStatus = 'all';
let searchKeyword = '';

async function initRegistrationsPage() {
  try {
    // Check URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const initialEventId = urlParams.get('eventId');
    if (initialEventId) selectedEventId = initialEventId;

    // Load events for dropdown
    const eventsRes = await window.api.events.getAll();
    allEventsCache = eventsRes.data || [];
    populateEventFilterDropdown(allEventsCache, selectedEventId);

    // Load registrations
    const regsRes = await window.api.registrations.getAll();
    allRegistrationsCache = regsRes.data || [];

    setupFilters();
    renderFilteredRegistrations();
  } catch (err) {
    console.error('Error loading registrations:', err);
    window.main.showToast(err.message, 'error');
  }
}

function populateEventFilterDropdown(events, defaultEventId) {
  const select = document.getElementById('reg-filter-event');
  if (!select) return;

  let options = '<option value="all">All Events (Entire Campus)</option>';
  events.forEach((evt) => {
    const isSelected = evt.id === defaultEventId ? 'selected' : '';
    options += `<option value="${evt.id}" ${isSelected}>${evt.title}</option>`;
  });

  select.innerHTML = options;
}

function setupFilters() {
  const eventSelect = document.getElementById('reg-filter-event');
  if (eventSelect) {
    eventSelect.addEventListener('change', (e) => {
      selectedEventId = e.target.value;
      renderFilteredRegistrations();
    });
  }

  const statusSelect = document.getElementById('reg-filter-status');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      selectedStatus = e.target.value;
      renderFilteredRegistrations();
    });
  }

  const searchInput = document.getElementById('reg-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchKeyword = e.target.value.toLowerCase().trim();
      renderFilteredRegistrations();
    });
  }
}

function renderFilteredRegistrations() {
  const tbody = document.getElementById('registrations-tbody');
  const countBadge = document.getElementById('reg-count-badge');
  if (!tbody) return;

  let filtered = [...allRegistrationsCache];

  // Event filter
  if (selectedEventId !== 'all') {
    filtered = filtered.filter((r) => r.eventId === selectedEventId);
  }

  // Status filter
  if (selectedStatus !== 'all') {
    filtered = filtered.filter((r) => r.status.toLowerCase() === selectedStatus.toLowerCase());
  }

  // Keyword filter
  if (searchKeyword) {
    filtered = filtered.filter(
      (r) =>
        r.studentName.toLowerCase().includes(searchKeyword) ||
        r.studentEmail.toLowerCase().includes(searchKeyword) ||
        (r.rollNumber && r.rollNumber.toLowerCase().includes(searchKeyword)) ||
        r.ticketCode.toLowerCase().includes(searchKeyword) ||
        r.eventTitle.toLowerCase().includes(searchKeyword)
    );
  }

  if (countBadge) {
    countBadge.textContent = `${filtered.length} Registration${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 2.5rem;">No registrations match your search filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((r) => `
    <tr>
      <td>
        <span style="font-family: monospace; font-weight: 700; font-size: 0.85rem; color: var(--primary);">
          ${r.ticketCode}
        </span>
      </td>
      <td>
        <strong style="color: var(--text-main); font-size: 0.9rem;">${r.studentName}</strong>
        <small class="text-muted" style="display: block;">${r.studentEmail}</small>
        ${r.phone ? `<small class="text-muted" style="display: block;">📞 ${r.phone}</small>` : ''}
      </td>
      <td>
        <span style="font-weight: 600;">${r.rollNumber || 'N/A'}</span>
        <small class="text-muted" style="display: block;">${r.department || 'General'}</small>
      </td>
      <td>
        <a href="event-details.html?id=${r.eventId}" style="font-weight: 600; color: var(--text-main);">
          ${r.eventTitle}
        </a>
      </td>
      <td>${window.main.formatDate(r.registeredAt)}</td>
      <td>
        <select class="form-select" style="padding: 0.25rem 0.5rem; font-size: 0.775rem; width: auto;" onchange="updateRegStatus('${r.id}', this.value)">
          <option value="Confirmed" ${r.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="Pending" ${r.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Attended" ${r.status === 'Attended' ? 'selected' : ''}>Attended</option>
          <option value="Cancelled" ${r.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td>
        <button class="btn btn-xs btn-outline-danger" onclick="deleteRegistration('${r.id}', '${encodeURIComponent(r.studentName)}')" title="Cancel registration">
          🗑️ Cancel
        </button>
      </td>
    </tr>
  `).join('');
}

async function updateRegStatus(regId, newStatus) {
  try {
    await window.api.registrations.updateStatus(regId, newStatus);
    window.main.showToast(`Updated status to ${newStatus}`, 'success');
    const idx = allRegistrationsCache.findIndex((r) => r.id === regId);
    if (idx !== -1) {
      allRegistrationsCache[idx].status = newStatus;
    }
  } catch (err) {
    window.main.showToast(err.message, 'error');
  }
}

async function deleteRegistration(regId, encodedName) {
  const name = decodeURIComponent(encodedName);
  if (!confirm(`Cancel registration record for "${name}"?`)) return;

  try {
    await window.api.registrations.cancel(regId);
    window.main.showToast('Registration cancelled and seat restored.', 'info');
    allRegistrationsCache = allRegistrationsCache.filter((r) => r.id !== regId);
    renderFilteredRegistrations();
  } catch (err) {
    window.main.showToast(err.message, 'error');
  }
}

/**
 * Export filtered registrations as CSV
 */
function exportRegistrationsCsv() {
  if (allRegistrationsCache.length === 0) {
    window.main.showToast('No registrations to export.', 'warning');
    return;
  }

  let filtered = [...allRegistrationsCache];
  if (selectedEventId !== 'all') {
    filtered = filtered.filter((r) => r.eventId === selectedEventId);
  }
  if (selectedStatus !== 'all') {
    filtered = filtered.filter((r) => r.status.toLowerCase() === selectedStatus.toLowerCase());
  }

  const headers = ['Ticket Code', 'Student Name', 'Email', 'Roll Number', 'Department', 'Phone', 'Event Title', 'Registration Date', 'Status'];
  const rows = filtered.map((r) => [
    `"${r.ticketCode}"`,
    `"${r.studentName}"`,
    `"${r.studentEmail}"`,
    `"${r.rollNumber || ''}"`,
    `"${r.department || ''}"`,
    `"${r.phone || ''}"`,
    `"${r.eventTitle.replace(/"/g, '""')}"`,
    `"${r.registeredAt}"`,
    `"${r.status}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `college_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.main.showToast(`Exported ${filtered.length} records to CSV!`, 'success');
}

window.updateRegStatus = updateRegStatus;
window.deleteRegistration = deleteRegistration;
window.exportRegistrationsCsv = exportRegistrationsCsv;
