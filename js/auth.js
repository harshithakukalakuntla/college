/**
 * auth.js
 * Authentication state helper and route protection.
 */

const auth = {
  getUser() {
    return window.api.auth.getCurrentUser();
  },

  isLoggedIn() {
    return Boolean(this.getUser());
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  isStudent() {
    const user = this.getUser();
    return user && user.role === 'student';
  },

  async login(email, password) {
    return await window.api.auth.login(email, password);
  },

  async register(userData) {
    return await window.api.auth.register(userData);
  },

  async logout() {
    await window.api.auth.logout();
    window.location.href = 'login.html';
  },

  /**
   * Fast Demo Login switcher for easy testing without typing credentials
   */
  async quickLogin(role = 'student') {
    const email = role === 'admin' ? 'admin@college.edu' : 'student@college.edu';
    const pass = role === 'admin' ? 'admin' : 'student';
    try {
      await this.login(email, pass);
      window.main?.showToast?.(`Logged in as ${role.toUpperCase()}`, 'success');
      setTimeout(() => {
        if (role === 'admin') {
          window.location.href = 'admin-dashboard.html';
        } else {
          window.location.href = 'student-dashboard.html';
        }
      }, 400);
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  },

  /**
   * Guard protected pages
   * @param {'admin'|'student'|'any'} requiredRole
   */
  requireAuth(requiredRole = 'any') {
    const user = this.getUser();

    if (!user) {
      // Save attempted URL to return after login
      const currentPath = window.location.pathname.split('/').pop();
      sessionStorage.setItem('redirect_after_login', currentPath);
      window.location.href = 'login.html';
      return false;
    }

    if (requiredRole === 'admin' && user.role !== 'admin') {
      alert('Access Denied: Admin privileges required.');
      window.location.href = 'student-dashboard.html';
      return false;
    }

    if (requiredRole === 'student' && user.role !== 'student') {
      // Admin trying to view student-specific dashboard - redirect or allow viewing
      // We can allow admin to switch, or redirect to admin dashboard
    }

    return true;
  }
};

window.auth = auth;
