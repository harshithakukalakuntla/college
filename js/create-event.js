/**
 * create-event.js
 * Handles Create & Edit Event workflows for Admin users.
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

  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');

  await initEventForm(editId);
});

async function initEventForm(editId) {
  const isEditMode = Boolean(editId);
  const pageTitleEl = document.getElementById('form-page-title');
  const pageSubtitleEl = document.getElementById('form-page-subtitle');
  const submitBtn = document.getElementById('btn-submit-event');
  const form = document.getElementById('event-form');
  const imageInput = document.getElementById('evt-image');
  const imagePreview = document.getElementById('evt-image-preview');

  if (isEditMode) {
    if (pageTitleEl) pageTitleEl.textContent = 'Edit College Event';
    if (pageSubtitleEl) pageSubtitleEl.textContent = 'Update event schedules, guidelines, or venue details';
    if (submitBtn) submitBtn.textContent = 'Update Event Details';

    try {
      const res = await window.api.events.getById(editId);
      const event = res.data;

      document.getElementById('evt-title').value = event.title || '';
      document.getElementById('evt-category').value = event.category || 'Technology';
      document.getElementById('evt-date').value = event.date || '';
      document.getElementById('evt-time').value = event.time || '';
      document.getElementById('evt-venue').value = event.venue || '';
      document.getElementById('evt-organizer').value = event.organizer || '';
      document.getElementById('evt-coord-name').value = event.coordinatorName || '';
      document.getElementById('evt-coord-email').value = event.coordinatorEmail || '';
      document.getElementById('evt-seats').value = event.totalSeats || 100;
      document.getElementById('evt-price').value = event.price || 'Free';
      document.getElementById('evt-status').value = event.status || 'Upcoming';
      document.getElementById('evt-image').value = event.image || '';
      document.getElementById('evt-description').value = event.description || '';
      document.getElementById('evt-eligibility').value = event.eligibility || '';
      document.getElementById('evt-rules').value = event.rules || '';
      document.getElementById('evt-tags').value = (event.tags || []).join(', ');

      if (imagePreview && event.image) {
        imagePreview.src = event.image;
      }
    } catch (err) {
      window.main.showToast(`Error loading event: ${err.message}`, 'error');
    }
  }

  // Live image preview
  if (imageInput && imagePreview) {
    imageInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val) {
        imagePreview.src = val;
      }
    });
  }

  // Form submit handler
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isEditMode ? 'Updating...' : 'Publishing...';
      }

      const payload = {
        title: document.getElementById('evt-title').value.trim(),
        category: document.getElementById('evt-category').value,
        date: document.getElementById('evt-date').value,
        time: document.getElementById('evt-time').value.trim(),
        venue: document.getElementById('evt-venue').value.trim(),
        organizer: document.getElementById('evt-organizer').value.trim(),
        coordinatorName: document.getElementById('evt-coord-name').value.trim(),
        coordinatorEmail: document.getElementById('evt-coord-email').value.trim(),
        totalSeats: parseInt(document.getElementById('evt-seats').value, 10),
        price: document.getElementById('evt-price').value.trim() || 'Free',
        status: document.getElementById('evt-status').value,
        image: document.getElementById('evt-image').value.trim(),
        description: document.getElementById('evt-description').value.trim(),
        eligibility: document.getElementById('evt-eligibility').value.trim(),
        rules: document.getElementById('evt-rules').value.trim(),
        tags: document.getElementById('evt-tags').value.split(',').map((s) => s.trim()).filter(Boolean)
      };

      try {
        if (isEditMode) {
          await window.api.events.update(editId, payload);
          window.main.showToast('Event updated successfully!', 'success');
        } else {
          await window.api.events.create(payload);
          window.main.showToast('New event created and published!', 'success');
        }

        setTimeout(() => {
          window.location.href = 'admin-dashboard.html';
        }, 600);
      } catch (err) {
        window.main.showToast(err.message, 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = isEditMode ? 'Update Event Details' : 'Publish Event';
        }
      }
    });
  }
}

function setSampleImage(url) {
  const imageInput = document.getElementById('evt-image');
  const imagePreview = document.getElementById('evt-image-preview');
  if (imageInput) imageInput.value = url;
  if (imagePreview) imagePreview.src = url;
}

window.setSampleImage = setSampleImage;
