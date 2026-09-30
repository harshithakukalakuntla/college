/**
 * profile.js
 * Handles student/user profile editing and avatar customization.
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = window.auth.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  initProfileForm(user);
});

function initProfileForm(user) {
  // Set text labels
  const nameDisplay = document.getElementById('profile-display-name');
  const roleDisplay = document.getElementById('profile-display-role');
  const avatarImg = document.getElementById('profile-avatar-preview');

  if (nameDisplay) nameDisplay.textContent = user.name;
  if (roleDisplay) roleDisplay.textContent = `${user.role.toUpperCase()} &bull; ${user.department || 'Student'}`;
  if (avatarImg) avatarImg.src = user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  // Fill form inputs
  const nameInput = document.getElementById('prof-name');
  const emailInput = document.getElementById('prof-email');
  const rollInput = document.getElementById('prof-roll');
  const deptInput = document.getElementById('prof-dept');
  const yearInput = document.getElementById('prof-year');
  const phoneInput = document.getElementById('prof-phone');
  const bioInput = document.getElementById('prof-bio');
  const avatarInput = document.getElementById('prof-avatar-url');

  if (nameInput) nameInput.value = user.name || '';
  if (emailInput) emailInput.value = user.email || '';
  if (rollInput) rollInput.value = user.rollNumber || '';
  if (deptInput) deptInput.value = user.department || '';
  if (yearInput) yearInput.value = user.year || '3rd Year';
  if (phoneInput) phoneInput.value = user.phone || '';
  if (bioInput) bioInput.value = user.bio || '';
  if (avatarInput) avatarInput.value = user.avatar || '';

  // Avatar URL live preview
  if (avatarInput && avatarImg) {
    avatarInput.addEventListener('input', (e) => {
      if (e.target.value.trim()) {
        avatarImg.src = e.target.value.trim();
      }
    });
  }

  // Handle Form Submit
  const form = document.getElementById('profile-edit-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const saveBtn = document.getElementById('btn-save-profile');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving Changes...';
      }

      const updatedData = {
        name: nameInput.value.trim(),
        rollNumber: rollInput.value.trim(),
        department: deptInput.value.trim(),
        year: yearInput.value,
        phone: phoneInput.value.trim(),
        bio: bioInput.value.trim(),
        avatar: avatarInput.value.trim() || user.avatar
      };

      try {
        const res = await window.api.auth.updateProfile(updatedData);
        window.main.showToast('Profile updated successfully!', 'success');

        // Update displays
        if (nameDisplay) nameDisplay.textContent = res.user.name;
        if (roleDisplay) roleDisplay.textContent = `${res.user.role.toUpperCase()} &bull; ${res.user.department}`;

        // Re-render navbar
        if (window.renderNavbar) window.renderNavbar();
      } catch (err) {
        window.main.showToast(err.message, 'error');
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Changes';
        }
      }
    });
  }
}

function selectPresetAvatar(url) {
  const avatarInput = document.getElementById('prof-avatar-url');
  const avatarImg = document.getElementById('profile-avatar-preview');
  if (avatarInput) avatarInput.value = url;
  if (avatarImg) avatarImg.src = url;
}

window.selectPresetAvatar = selectPresetAvatar;
