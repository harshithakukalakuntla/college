/**
 * my-events.js
 * Student registered events list, digital tickets with QR code, and registration cancellation.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = window.auth.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Populate sidebar user info
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

  await loadMyEvents(user);
});

let myRegistrationsCache = [];

async function loadMyEvents(user) {
  const container = document.getElementById('my-events-container');
  if (!container) return;

  try {
    const res = await window.api.registrations.getByUser(user.id);
    myRegistrationsCache = res.data || [];
    renderTickets(myRegistrationsCache);
  } catch (err) {
    console.error('Error loading registered events:', err);
    container.innerHTML = `<div class="empty-state"><h3>Error loading tickets</h3><p>${err.message}</p></div>`;
  }
}

function renderTickets(registrations) {
  const container = document.getElementById('my-events-container');
  const countBadge = document.getElementById('my-events-count');
  if (!container) return;

  if (countBadge) {
    countBadge.textContent = `${registrations.length} Active Ticket${registrations.length === 1 ? '' : 's'}`;
  }

  if (registrations.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">🎟️</span>
        <h3>No Registered Events</h3>
        <p>You have not registered for any events yet. Check out the campus schedule and grab your spot!</p>
        <a href="events.html" class="btn btn-primary btn-sm">Explore Upcoming Events</a>
      </div>
    `;
    return;
  }

  container.innerHTML = registrations.map((reg) => createTicketCardHtml(reg)).join('');
}

function createTicketCardHtml(reg) {
  // Generate a mock SVG QR Code pattern based on ticketCode
  const qrSvg = generateMockQrSvg(reg.ticketCode);

  return `
    <div class="ticket-card animate-fade-in" id="ticket-${reg.id}">
      <div class="ticket-left">
        <div>
          <div class="ticket-top">
            <div>
              <span class="badge badge-primary" style="margin-bottom: 0.4rem;">EVENT PASS</span>
              <h3 class="ticket-title">${reg.eventTitle}</h3>
            </div>
            ${window.main.getStatusBadge(reg.status)}
          </div>

          <div class="ticket-meta-grid">
            <div class="ticket-meta-item">
              <small>Date</small>
              <span>${window.main.formatDate(reg.eventDate)}</span>
            </div>
            <div class="ticket-meta-item">
              <small>Schedule</small>
              <span>${reg.eventTime || '10:00 AM - 04:00 PM'}</span>
            </div>
            <div class="ticket-meta-item">
              <small>Location</small>
              <span>${reg.eventVenue}</span>
            </div>
            <div class="ticket-meta-item">
              <small>Attendee Name</small>
              <span>${reg.studentName}</span>
            </div>
            <div class="ticket-meta-item">
              <small>Roll / ID</small>
              <span>${reg.rollNumber}</span>
            </div>
            <div class="ticket-meta-item">
              <small>Registered On</small>
              <span>${window.main.formatDate(reg.registeredAt)}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center; margin-top: 1rem; flex-wrap: wrap;">
          <button class="btn btn-sm btn-outline-primary" onclick="printTicket('${reg.id}')">
            🖨️ Print Ticket
          </button>
          <a href="event-details.html?id=${reg.eventId}" class="btn btn-sm btn-outline-light" style="color: var(--text-main) !important; border-color: var(--border-color);">
            View Event Info
          </a>
          <button class="btn btn-sm btn-outline-danger" onclick="confirmCancelRegistration('${reg.id}', '${encodeURIComponent(reg.eventTitle)}')">
            Cancel Registration
          </button>
        </div>
      </div>

      <div class="ticket-divider"></div>

      <div class="ticket-right">
        <div class="ticket-qr-placeholder">
          ${qrSvg}
        </div>
        <div class="ticket-code-text">${reg.ticketCode}</div>
        <span style="font-size: 0.725rem; color: var(--text-light); margin-top: 0.35rem;">
          Scan at Gate for Entry
        </span>
      </div>
    </div>
  `;
}

/**
 * Procedural SVG QR pattern for crisp rendering without external scripts
 */
function generateMockQrSvg(code) {
  return `
    <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="90" height="90" fill="white"/>
      <!-- Top Left Position Marker -->
      <rect x="5" y="5" width="26" height="26" rx="4" fill="#0F172A"/>
      <rect x="9" y="9" width="18" height="18" rx="2" fill="white"/>
      <rect x="13" y="13" width="10" height="10" rx="1" fill="#4F46E5"/>
      <!-- Top Right Position Marker -->
      <rect x="59" y="5" width="26" height="26" rx="4" fill="#0F172A"/>
      <rect x="63" y="9" width="18" height="18" rx="2" fill="white"/>
      <rect x="67" y="13" width="10" height="10" rx="1" fill="#4F46E5"/>
      <!-- Bottom Left Position Marker -->
      <rect x="5" y="59" width="26" height="26" rx="4" fill="#0F172A"/>
      <rect x="9" y="63" width="18" height="18" rx="2" fill="white"/>
      <rect x="13" y="67" width="10" height="10" rx="1" fill="#4F46E5"/>
      <!-- Data Dots Matrix -->
      <rect x="36" y="8" width="6" height="6" fill="#0F172A"/>
      <rect x="46" y="8" width="6" height="6" fill="#0F172A"/>
      <rect x="36" y="18" width="6" height="6" fill="#4F46E5"/>
      <rect x="46" y="24" width="6" height="6" fill="#0F172A"/>
      <rect x="8" y="36" width="6" height="6" fill="#0F172A"/>
      <rect x="18" y="44" width="6" height="6" fill="#4F46E5"/>
      <rect x="28" y="36" width="6" height="6" fill="#0F172A"/>
      <rect x="36" y="36" width="18" height="18" rx="2" fill="#7C3AED"/>
      <rect x="40" y="40" width="10" height="10" rx="1" fill="white"/>
      <rect x="60" y="38" width="6" height="6" fill="#0F172A"/>
      <rect x="74" y="44" width="8" height="6" fill="#0F172A"/>
      <rect x="36" y="60" width="8" height="6" fill="#0F172A"/>
      <rect x="48" y="66" width="6" height="8" fill="#4F46E5"/>
      <rect x="64" y="62" width="6" height="6" fill="#0F172A"/>
      <rect x="74" y="70" width="8" height="6" fill="#0F172A"/>
      <rect x="62" y="76" width="6" height="6" fill="#0F172A"/>
    </svg>
  `;
}

function printTicket(regId) {
  const ticketElement = document.getElementById(`ticket-${regId}`);
  if (!ticketElement) return;

  const originalBody = document.body.innerHTML;
  const printContent = `
    <div style="padding: 2rem; max-width: 800px; margin: 0 auto; font-family: sans-serif;">
      <h2 style="color: #4F46E5; margin-bottom: 0.5rem;">🎓 CampusPulse - Official Event Admission Ticket</h2>
      <p style="color: #64748B; margin-bottom: 2rem;">Please present this pass with student ID at the entrance desk.</p>
      ${ticketElement.outerHTML}
    </div>
  `;

  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalBody;
  window.location.reload();
}

function confirmCancelRegistration(regId, encodedTitle) {
  const title = decodeURIComponent(encodedTitle);
  const ok = confirm(`Are you sure you want to cancel your registration for:\n\n"${title}"?\n\nThis will free up your seat for other students.`);

  if (ok) {
    cancelRegistration(regId);
  }
}

async function cancelRegistration(regId) {
  try {
    await window.api.registrations.cancel(regId);
    window.main.showToast('Registration cancelled. Seat released.', 'info');
    
    // Refresh list
    const user = window.auth.getUser();
    await loadMyEvents(user);
  } catch (err) {
    window.main.showToast(`Error: ${err.message}`, 'error');
  }
}

window.printTicket = printTicket;
window.confirmCancelRegistration = confirmCancelRegistration;
