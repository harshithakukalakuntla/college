/**
 * event-details.js
 * Loads specific event details and handles student registration workflow.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id') || 'EVT-101';

  await loadEventDetails(eventId);
});

let currentEvent = null;

async function loadEventDetails(eventId) {
  const container = document.getElementById('event-details-content');
  if (!container) return;

  try {
    const res = await window.api.events.getById(eventId);
    currentEvent = res.data;
    renderEventPage(currentEvent);
    setupRegistrationModal(currentEvent);
  } catch (err) {
    console.error('Failed to load event:', err);
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">⚠️</span>
        <h3>Event Not Found</h3>
        <p>${err.message}</p>
        <a href="events.html" class="btn btn-primary btn-sm">Back to All Events</a>
      </div>
    `;
  }
}

function renderEventPage(event) {
  const container = document.getElementById('event-details-content');
  const user = window.auth?.getUser();
  const seatsLeft = Math.max(0, event.totalSeats - (event.registeredSeats || 0));
  const percentFilled = Math.min(100, Math.round(((event.registeredSeats || 0) / event.totalSeats) * 100));
  const isSoldOut = seatsLeft <= 0;

  // Check if current logged in student has already registered
  let isAlreadyRegistered = false;
  if (user && user.role === 'student') {
    const allRegs = JSON.parse(localStorage.getItem('college_events_registrations') || '[]');
    isAlreadyRegistered = allRegs.some(
      (r) => r.eventId === event.id && (r.userId === user.id || r.studentEmail === user.email)
    );
  }

  // Tags HTML
  const tagsHtml = (event.tags || [])
    .map((tag) => `<span class="badge badge-default" style="text-transform: none; font-size: 0.8rem;">#${tag}</span>`)
    .join(' ');

  // Dynamic Action Button
  let actionButtonHtml = '';
  if (!user) {
    actionButtonHtml = `
      <a href="login.html" class="btn btn-primary btn-block btn-lg">
        🔒 Sign In to Register
      </a>
      <p class="text-center form-hint" style="margin-top: 0.5rem;">
        New student? <a href="register.html">Create an account</a>
      </p>
    `;
  } else if (user.role === 'admin') {
    actionButtonHtml = `
      <a href="create-event.html?id=${event.id}" class="btn btn-primary btn-block">
        ✏️ Edit This Event
      </a>
      <a href="registrations.html?eventId=${event.id}" class="btn btn-outline-primary btn-block" style="margin-top: 0.5rem;">
        👥 View Registered Students
      </a>
    `;
  } else if (isAlreadyRegistered) {
    actionButtonHtml = `
      <div class="alert alert-success" style="background: var(--success-bg); color: var(--success); padding: 0.85rem; border-radius: var(--radius-md); text-align: center; margin-bottom: 0.75rem; font-weight: 600;">
        ✓ You have registered for this event!
      </div>
      <a href="my-events.html" class="btn btn-success btn-block btn-lg">
        🎟️ View Ticket in My Events
      </a>
    `;
  } else if (isSoldOut) {
    actionButtonHtml = `
      <button class="btn btn-danger btn-block btn-lg" disabled style="opacity: 0.7; cursor: not-allowed;">
        ⛔ Registrations Closed (Sold Out)
      </button>
    `;
  } else {
    actionButtonHtml = `
      <button class="btn btn-primary btn-block btn-lg" onclick="window.main.openModal('register-modal')">
        ⚡ Register Now Free
      </button>
      <p class="text-center form-hint" style="margin-top: 0.5rem;">
        Instant confirmation ticket with QR code
      </p>
    `;
  }

  container.innerHTML = `
    <!-- Breadcrumb -->
    <div style="margin-bottom: 1.5rem; font-size: 0.875rem;">
      <a href="events.html" style="color: var(--text-muted);">&larr; Back to Events</a>
      <span style="color: var(--text-light); margin: 0 0.5rem;">/</span>
      <span style="color: var(--text-main); font-weight: 600;">${event.title}</span>
    </div>

    <div class="event-details-grid" style="display: grid; grid-template-columns: 2fr 1.1fr; gap: 2.5rem; align-items: start;">
      
      <!-- Main Left Column -->
      <div class="event-details-main">
        <div class="event-banner-image-wrap" style="position: relative; border-radius: var(--radius-xl); overflow: hidden; height: 380px; margin-bottom: 2rem; box-shadow: var(--shadow-md);">
          <img src="${event.image}" alt="${event.title}" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; top: 1.25rem; left: 1.25rem; display: flex; gap: 0.5rem;">
            ${window.main.getCategoryBadge(event.category)}
            ${window.main.getStatusBadge(event.status)}
          </div>
        </div>

        <h1 style="font-size: 2.15rem; margin-bottom: 1rem; line-height: 1.2;">${event.title}</h1>
        
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.75rem;">
          ${tagsHtml}
        </div>

        <!-- Description Section -->
        <div class="content-block" style="background: var(--bg-surface); padding: 1.75rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
          <h3 style="margin-bottom: 0.75rem;">About This Event</h3>
          <p style="font-size: 1rem; line-height: 1.7; color: var(--text-main);">${event.description}</p>
        </div>

        <!-- Eligibility & Guidelines -->
        <div class="content-block" style="background: var(--bg-surface); padding: 1.75rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
          <h3 style="margin-bottom: 0.75rem;">Eligibility & Guidelines</h3>
          <div style="margin-bottom: 1rem;">
            <strong style="color: var(--text-main); display: block; font-size: 0.9rem; margin-bottom: 0.25rem;">Who Can Attend:</strong>
            <p style="margin-bottom: 0.75rem;">${event.eligibility || 'Open to all enrolled university students.'}</p>
          </div>
          <div>
            <strong style="color: var(--text-main); display: block; font-size: 0.9rem; margin-bottom: 0.25rem;">Rules & Requirements:</strong>
            <p style="margin-bottom: 0;">${event.rules || 'Bring your valid college ID card.'}</p>
          </div>
        </div>

        <!-- Organizer / Coordinator Info -->
        <div class="content-block" style="background: var(--bg-surface); padding: 1.75rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
          <h3 style="margin-bottom: 0.75rem;">Event Organizer</h3>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
              🏛️
            </div>
            <div>
              <h4 style="margin-bottom: 0.2rem; font-size: 1.05rem;">${event.organizer}</h4>
              <p style="margin-bottom: 0; font-size: 0.85rem;">
                Faculty Coordinator: <strong>${event.coordinatorName}</strong> (${event.coordinatorEmail})
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Registration & Summary Box -->
      <div class="event-details-sidebar" style="position: sticky; top: 90px;">
        <div class="registration-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 2rem; box-shadow: var(--shadow-md);">
          
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
            <div>
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-light); text-transform: uppercase;">Ticket Price</span>
              <div style="font-size: 2rem; font-weight: 800; color: var(--success); font-family: var(--font-heading);">${event.price || 'Free'}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-light); text-transform: uppercase;">Availability</span>
              <div style="font-size: 1.1rem; font-weight: 700; color: ${isSoldOut ? 'var(--danger)' : 'var(--text-main)'};">
                ${isSoldOut ? 'Sold Out' : `${seatsLeft} Seats Left`}
              </div>
            </div>
          </div>

          <!-- Quick Event Meta List -->
          <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
            <div style="display: flex; gap: 0.85rem; align-items: flex-start;">
              <span style="font-size: 1.2rem;">📅</span>
              <div>
                <strong style="display: block; font-size: 0.85rem; color: var(--text-main);">Date</strong>
                <span style="font-size: 0.9rem; color: var(--text-muted);">${window.main.formatDate(event.date)}</span>
              </div>
            </div>

            <div style="display: flex; gap: 0.85rem; align-items: flex-start;">
              <span style="font-size: 1.2rem;">⏰</span>
              <div>
                <strong style="display: block; font-size: 0.85rem; color: var(--text-main);">Time & Schedule</strong>
                <span style="font-size: 0.9rem; color: var(--text-muted);">${event.time}</span>
              </div>
            </div>

            <div style="display: flex; gap: 0.85rem; align-items: flex-start;">
              <span style="font-size: 1.2rem;">📍</span>
              <div>
                <strong style="display: block; font-size: 0.85rem; color: var(--text-main);">Venue / Location</strong>
                <span style="font-size: 0.9rem; color: var(--text-muted);">${event.venue}</span>
              </div>
            </div>
          </div>

          <!-- Capacity Bar -->
          <div style="margin-bottom: 1.75rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.35rem;">
              <span>Registration Capacity</span>
              <span>${percentFilled}% Filled</span>
            </div>
            <div class="progress-track" style="height: 8px;">
              <div class="progress-fill" style="width: ${percentFilled}%; ${isSoldOut ? 'background: var(--danger);' : ''}"></div>
            </div>
          </div>

          <!-- Action Button Area -->
          ${actionButtonHtml}
        </div>
      </div>

    </div>
  `;
}

function setupRegistrationModal(event) {
  const user = window.auth?.getUser();
  if (!user || user.role !== 'student') return;

  const modalBody = document.getElementById('register-modal-form-content');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div style="background: var(--primary-light); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
      <h4 style="font-size: 0.95rem; color: var(--primary); margin-bottom: 0.25rem;">Event: ${event.title}</h4>
      <p style="margin: 0; font-size: 0.825rem; color: var(--text-muted);">
        📅 ${window.main.formatDate(event.date)} &bull; 📍 ${event.venue}
      </p>
    </div>

    <form id="confirm-registration-form">
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <input type="text" class="form-control" value="${user.name}" readonly style="background: var(--bg-subtle);" />
      </div>

      <div class="grid grid-cols-2" style="gap: 1rem;">
        <div class="form-group">
          <label class="form-label">College Email</label>
          <input type="email" class="form-control" value="${user.email}" readonly style="background: var(--bg-subtle);" />
        </div>
        <div class="form-group">
          <label class="form-label">Roll / Reg Number</label>
          <input type="text" class="form-control" id="reg-roll-input" value="${user.rollNumber || ''}" required />
        </div>
      </div>

      <div class="grid grid-cols-2" style="gap: 1rem;">
        <div class="form-group">
          <label class="form-label">Department</label>
          <input type="text" class="form-control" id="reg-dept-input" value="${user.department || 'Computer Science'}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Contact Phone</label>
          <input type="tel" class="form-control" id="reg-phone-input" value="${user.phone || ''}" placeholder="+91 9876543210" required />
        </div>
      </div>

      <div class="form-group" style="margin-top: 0.5rem;">
        <label class="form-check">
          <input type="checkbox" id="reg-agree-check" required checked />
          <span style="font-size: 0.85rem; color: var(--text-muted);">
            I agree to abide by the event code of conduct and carry my valid college ID.
          </span>
        </label>
      </div>

      <div class="modal-footer" style="padding-left: 0; padding-right: 0; padding-bottom: 0; background: transparent; border-top: none;">
        <button type="button" class="btn btn-outline-primary" data-modal-close onclick="window.main.closeModal('register-modal')">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary" id="btn-submit-registration">
          Confirm Registration
        </button>
      </div>
    </form>
  `;

  const form = document.getElementById('confirm-registration-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-submit-registration');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';

      const rollNumber = document.getElementById('reg-roll-input').value.trim();
      const department = document.getElementById('reg-dept-input').value.trim();
      const phone = document.getElementById('reg-phone-input').value.trim();

      try {
        const res = await window.api.registrations.register(event.id, {
          userId: user.id,
          name: user.name,
          email: user.email,
          rollNumber,
          department,
          phone
        });

        window.main.closeModal('register-modal');
        window.main.showToast('Registration Confirmed! Ticket Generated.', 'success');

        // Reload details view to update seats and show Registered state
        setTimeout(() => {
          loadEventDetails(event.id);
        }, 300);
      } catch (err) {
        window.main.showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Registration';
      }
    });
  }
}
