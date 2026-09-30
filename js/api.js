/**
 * api.js
 * Centralized API service layer for College Event Management System.
 *
 * Current mode: MOCK API using localStorage (for frontend-only prototyping).
 * Future mode: Set USE_MOCK_API = false and point API_BASE_URL to your Flask backend.
 * All frontend code interacts through this uniform Promise-based API interface.
 */

const API_CONFIG = {
  USE_MOCK_API: true,
  BASE_URL: 'http://127.0.0.1:5000/api', // Flask backend endpoint
  STORAGE_KEYS: {
    USERS: 'college_events_users',
    EVENTS: 'college_events_list',
    REGISTRATIONS: 'college_events_registrations',
    CURRENT_USER: 'college_events_current_user'
  },
  MOCK_DELAY_MS: 60 // Simulated network latency for realistic async feel
};

// Utility to simulate async fetch delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to safely read from localStorage
function getLocalData(key, fallback = []) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

// Helper to safely write to localStorage
function setLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

/**
 * Main API client object
 */
const api = {
  /**
   * AUTHENTICATION & USER MANAGEMENT
   * Flask Endpoints:
   *   POST /api/auth/login
   *   POST /api/auth/register
   *   GET  /api/auth/me
   *   PUT  /api/auth/profile
   */
  auth: {
    async login(email, password) {
      if (!API_CONFIG.USE_MOCK_API) {
        const res = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      const users = getLocalData(API_CONFIG.STORAGE_KEYS.USERS);
      const user = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      if (!user) {
        throw new Error('Invalid email or password. Try student@college.edu / student or admin@college.edu / admin');
      }

      // Save user session (sanitize password)
      const sessionUser = { ...user };
      delete sessionUser.password;
      setLocalData(API_CONFIG.STORAGE_KEYS.CURRENT_USER, sessionUser);
      return { success: true, user: sessionUser };
    },

    async register(userData) {
      if (!API_CONFIG.USE_MOCK_API) {
        const res = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      const users = getLocalData(API_CONFIG.STORAGE_KEYS.USERS);
      const exists = users.some((u) => u.email.toLowerCase() === userData.email.trim().toLowerCase());

      if (exists) {
        throw new Error('An account with this college email already exists.');
      }

      const newUser = {
        id: `USR-${Date.now().toString().slice(-6)}`,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'student',
        rollNumber: userData.rollNumber || `2024CS${Math.floor(1000 + Math.random() * 9000)}`,
        department: userData.department || 'Computer Science & Engineering',
        year: userData.year || '1st Year',
        phone: userData.phone || '',
        avatar: userData.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(userData.name)}`,
        bio: userData.bio || 'New student at CampusPulse.',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      setLocalData(API_CONFIG.STORAGE_KEYS.USERS, users);

      // Auto login newly registered user
      const sessionUser = { ...newUser };
      delete sessionUser.password;
      setLocalData(API_CONFIG.STORAGE_KEYS.CURRENT_USER, sessionUser);

      return { success: true, user: sessionUser };
    },

    getCurrentUser() {
      return getLocalData(API_CONFIG.STORAGE_KEYS.CURRENT_USER, null);
    },

    setCurrentUser(user) {
      setLocalData(API_CONFIG.STORAGE_KEYS.CURRENT_USER, user);
    },

    logout() {
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.CURRENT_USER);
      return Promise.resolve({ success: true });
    },

    async updateProfile(profileData) {
      if (!API_CONFIG.USE_MOCK_API) {
        const res = await fetch(`${API_CONFIG.BASE_URL}/auth/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData)
        });
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      const currentUser = getLocalData(API_CONFIG.STORAGE_KEYS.CURRENT_USER, null);
      if (!currentUser) throw new Error('No user is currently logged in.');

      const users = getLocalData(API_CONFIG.STORAGE_KEYS.USERS);
      const userIndex = users.findIndex((u) => u.id === currentUser.id);

      if (userIndex === -1) throw new Error('User not found.');

      // Update in users database
      users[userIndex] = {
        ...users[userIndex],
        ...profileData
      };
      setLocalData(API_CONFIG.STORAGE_KEYS.USERS, users);

      // Update current session
      const updatedSession = { ...users[userIndex] };
      delete updatedSession.password;
      setLocalData(API_CONFIG.STORAGE_KEYS.CURRENT_USER, updatedSession);

      return { success: true, user: updatedSession };
    }
  },

  /**
   * EVENTS MANAGEMENT
   * Flask Endpoints:
   *   GET    /api/events
   *   GET    /api/events/<id>
   *   POST   /api/events
   *   PUT    /api/events/<id>
   *   DELETE /api/events/<id>
   */
  events: {
    async getAll(filters = {}) {
      if (!API_CONFIG.USE_MOCK_API) {
        const queryParams = new URLSearchParams(filters).toString();
        const res = await fetch(`${API_CONFIG.BASE_URL}/events?${queryParams}`);
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      let events = getLocalData(API_CONFIG.STORAGE_KEYS.EVENTS);

      // Apply category filter
      if (filters.category && filters.category !== 'all') {
        events = events.filter((e) => e.category.toLowerCase() === filters.category.toLowerCase());
      }

      // Apply search query (title, organizer, tags, description)
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        events = events.filter((e) =>
          e.title.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          (e.tags && e.tags.some(t => t.toLowerCase().includes(q)))
        );
      }

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        events = events.filter((e) => e.status.toLowerCase() === filters.status.toLowerCase());
      }

      // Sort by date upcoming first
      events.sort((a, b) => new Date(a.date) - new Date(b.date));

      return { success: true, count: events.length, data: events };
    },

    async getById(id) {
      if (!API_CONFIG.USE_MOCK_API) {
        const res = await fetch(`${API_CONFIG.BASE_URL}/events/${id}`);
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      const events = getLocalData(API_CONFIG.STORAGE_KEYS.EVENTS);
      const event = events.find((e) => e.id === id);

      if (!event) throw new Error(`Event with ID "${id}" was not found.`);
      return { success: true, data: event };
    },

    async create(eventData) {
      if (!API_CONFIG.USE_MOCK_API) {
        const res = await fetch(`${API_CONFIG.BASE_URL}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        });
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      const events = getLocalData(API_CONFIG.STORAGE_KEYS.EVENTS);

      const newEvent = {
        id: `EVT-${Date.now().toString().slice(-4)}`,
        title: eventData.title,
        category: eventData.category || 'Technology',
        date: eventData.date,
        time: eventData.time || '10:00 AM - 04:00 PM',
        venue: eventData.venue,
        organizer: eventData.organizer || 'College Event Committee',
        coordinatorName: eventData.coordinatorName || 'Faculty Coordinator',
        coordinatorEmail: eventData.coordinatorEmail || 'events@college.edu',
        totalSeats: parseInt(eventData.totalSeats, 10) || 100,
        registeredSeats: 0,
        price: eventData.price || 'Free',
        status: eventData.status || 'Upcoming',
        featured: Boolean(eventData.featured),
        image: eventData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        description: eventData.description || 'No description provided.',
        eligibility: eventData.eligibility || 'All students',
        rules: eventData.rules || 'Bring valid college ID card.',
        tags: Array.isArray(eventData.tags) ? eventData.tags : (eventData.tags ? eventData.tags.split(',').map(s => s.trim()) : ['Campus', 'Event'])
      };

      events.unshift(newEvent);
      setLocalData(API_CONFIG.STORAGE_KEYS.EVENTS, events);

      return { success: true, data: newEvent, message: 'Event created successfully!' };
    },

    async update(id, eventData) {
      if (!API_CONFIG.USE_MOCK_API) {
        const res = await fetch(`${API_CONFIG.BASE_URL}/events/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        });
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      const events = getLocalData(API_CONFIG.STORAGE_KEYS.EVENTS);
      const index = events.findIndex((e) => e.id === id);

      if (index === -1) throw new Error('Event not found.');

      events[index] = {
        ...events[index],
        ...eventData,
        totalSeats: parseInt(eventData.totalSeats ?? events[index].totalSeats, 10),
        tags: Array.isArray(eventData.tags)
          ? eventData.tags
          : (typeof eventData.tags === 'string' ? eventData.tags.split(',').map(t => t.trim()) : events[index].tags)
      };

      setLocalData(API_CONFIG.STORAGE_KEYS.EVENTS, events);
      return { success: true, data: events[index], message: 'Event updated successfully!' };
    },

    async delete(id) {
      if (!API_CONFIG.USE_MOCK_API) {
        const res = await fetch(`${API_CONFIG.BASE_URL}/events/${id}`, {
          method: 'DELETE'
        });
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      let events = getLocalData(API_CONFIG.STORAGE_KEYS.EVENTS);
      const existing = events.find((e) => e.id === id);
      if (!existing) throw new Error('Event does not exist.');

      events = events.filter((e) => e.id !== id);
      setLocalData(API_CONFIG.STORAGE_KEYS.EVENTS, events);

      // Also clean up registrations for this event
      let registrations = getLocalData(API_CONFIG.STORAGE_KEYS.REGISTRATIONS);
      registrations = registrations.filter((r) => r.eventId !== id);
      setLocalData(API_CONFIG.STORAGE_KEYS.REGISTRATIONS, registrations);

      return { success: true, message: 'Event deleted successfully.' };
    }
  },

  /**
   * REGISTRATIONS
   * Flask Endpoints:
   *   GET    /api/registrations
   *   GET    /api/registrations/my
   *   POST   /api/events/<id>/register
   *   DELETE /api/registrations/<id>
   *   PATCH  /api/registrations/<id>/status
   */
  registrations: {
    async getAll(filters = {}) {
      if (!API_CONFIG.USE_MOCK_API) {
        const queryParams = new URLSearchParams(filters).toString();
        const res = await fetch(`${API_CONFIG.BASE_URL}/registrations?${queryParams}`);
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      let regs = getLocalData(API_CONFIG.STORAGE_KEYS.REGISTRATIONS);

      if (filters.eventId && filters.eventId !== 'all') {
        regs = regs.filter((r) => r.eventId === filters.eventId);
      }
      if (filters.status && filters.status !== 'all') {
        regs = regs.filter((r) => r.status.toLowerCase() === filters.status.toLowerCase());
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        regs = regs.filter(
          (r) =>
            r.studentName.toLowerCase().includes(q) ||
            r.studentEmail.toLowerCase().includes(q) ||
            r.rollNumber.toLowerCase().includes(q) ||
            r.eventTitle.toLowerCase().includes(q) ||
            r.ticketCode.toLowerCase().includes(q)
        );
      }

      regs.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
      return { success: true, count: regs.length, data: regs };
    },

    async getByUser(userId) {
      if (!API_CONFIG.USE_MOCK_API) {
        const res = await fetch(`${API_CONFIG.BASE_URL}/registrations/my?userId=${userId}`);
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      const regs = getLocalData(API_CONFIG.STORAGE_KEYS.REGISTRATIONS);
      const myRegs = regs.filter((r) => r.userId === userId);
      myRegs.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

      return { success: true, count: myRegs.length, data: myRegs };
    },

    async register(eventId, studentDetails) {
      if (!API_CONFIG.USE_MOCK_API) {
        const res = await fetch(`${API_CONFIG.BASE_URL}/events/${eventId}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentDetails)
        });
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      const events = getLocalData(API_CONFIG.STORAGE_KEYS.EVENTS);
      const eventIndex = events.findIndex((e) => e.id === eventId);
      if (eventIndex === -1) throw new Error('Event not found.');

      const event = events[eventIndex];

      // Check if event is full
      if (event.registeredSeats >= event.totalSeats) {
        throw new Error('Sorry, this event is already sold out / fully booked!');
      }

      // Check if already registered
      const regs = getLocalData(API_CONFIG.STORAGE_KEYS.REGISTRATIONS);
      const already = regs.find(
        (r) => r.eventId === eventId && (r.userId === studentDetails.userId || r.studentEmail === studentDetails.email)
      );

      if (already) {
        throw new Error('You are already registered for this event. Check "My Events"!');
      }

      // Increment registeredSeats
      events[eventIndex].registeredSeats = (events[eventIndex].registeredSeats || 0) + 1;
      setLocalData(API_CONFIG.STORAGE_KEYS.EVENTS, events);

      // Create registration entry
      const randomTicketNum = Math.floor(1000 + Math.random() * 9000);
      const acronym = event.title.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') || 'EVT';
      const ticketCode = `TKT-${acronym}-${randomTicketNum}`;

      const newReg = {
        id: `REG-${Date.now().toString().slice(-5)}`,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventVenue: event.venue,
        userId: studentDetails.userId,
        studentName: studentDetails.name,
        studentEmail: studentDetails.email,
        rollNumber: studentDetails.rollNumber || 'N/A',
        department: studentDetails.department || 'N/A',
        phone: studentDetails.phone || 'N/A',
        status: 'Confirmed',
        ticketCode: ticketCode,
        registeredAt: new Date().toISOString()
      };

      regs.unshift(newReg);
      setLocalData(API_CONFIG.STORAGE_KEYS.REGISTRATIONS, regs);

      return { success: true, data: newReg, message: 'Registration confirmed successfully!' };
    },

    async cancel(registrationId) {
      if (!API_CONFIG.USE_MOCK_API) {
        const res = await fetch(`${API_CONFIG.BASE_URL}/registrations/${registrationId}`, {
          method: 'DELETE'
        });
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      let regs = getLocalData(API_CONFIG.STORAGE_KEYS.REGISTRATIONS);
      const target = regs.find((r) => r.id === registrationId);
      if (!target) throw new Error('Registration record not found.');

      // Decrement event seats count
      const events = getLocalData(API_CONFIG.STORAGE_KEYS.EVENTS);
      const eventIndex = events.findIndex((e) => e.id === target.eventId);
      if (eventIndex !== -1 && events[eventIndex].registeredSeats > 0) {
        events[eventIndex].registeredSeats -= 1;
        setLocalData(API_CONFIG.STORAGE_KEYS.EVENTS, events);
      }

      regs = regs.filter((r) => r.id !== registrationId);
      setLocalData(API_CONFIG.STORAGE_KEYS.REGISTRATIONS, regs);

      return { success: true, message: 'Registration cancelled successfully.' };
    },

    async updateStatus(registrationId, status) {
      if (!API_CONFIG.USE_MOCK_API) {
        const res = await fetch(`${API_CONFIG.BASE_URL}/registrations/${registrationId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      const regs = getLocalData(API_CONFIG.STORAGE_KEYS.REGISTRATIONS);
      const index = regs.findIndex((r) => r.id === registrationId);
      if (index === -1) throw new Error('Registration not found.');

      regs[index].status = status;
      setLocalData(API_CONFIG.STORAGE_KEYS.REGISTRATIONS, regs);

      return { success: true, data: regs[index], message: `Status updated to ${status}.` };
    }
  },

  /**
   * DASHBOARD & ANALYTICS STATS
   * Flask Endpoints:
   *   GET /api/admin/stats
   *   GET /api/student/stats/<userId>
   */
  stats: {
    async getAdminStats() {
      if (!API_CONFIG.USE_MOCK_API) {
        const res = await fetch(`${API_CONFIG.BASE_URL}/admin/stats`);
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      const events = getLocalData(API_CONFIG.STORAGE_KEYS.EVENTS);
      const users = getLocalData(API_CONFIG.STORAGE_KEYS.USERS);
      const registrations = getLocalData(API_CONFIG.STORAGE_KEYS.REGISTRATIONS);

      const totalEvents = events.length;
      const totalStudents = users.filter((u) => u.role === 'student').length;
      const totalRegistrations = registrations.length;
      const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date().setHours(0, 0, 0, 0)).length;

      // Category breakdown
      const categoryCounts = events.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
      }, {});

      return {
        success: true,
        data: {
          totalEvents,
          totalStudents,
          totalRegistrations,
          upcomingEvents,
          categoryCounts,
          recentRegistrations: registrations.slice(0, 5),
          recentEvents: events.slice(0, 5)
        }
      };
    },

    async getStudentStats(userId) {
      if (!API_CONFIG.USE_MOCK_API) {
        const res = await fetch(`${API_CONFIG.BASE_URL}/student/stats/${userId}`);
        return await res.json();
      }

      await delay(API_CONFIG.MOCK_DELAY_MS);
      const registrations = getLocalData(API_CONFIG.STORAGE_KEYS.REGISTRATIONS);
      const events = getLocalData(API_CONFIG.STORAGE_KEYS.EVENTS);

      const myRegs = registrations.filter((r) => r.userId === userId);
      const registeredCount = myRegs.length;

      // Count upcoming from my registered events
      const registeredEventIds = new Set(myRegs.map(r => r.eventId));
      const registeredEvents = events.filter(e => registeredEventIds.has(e.id));
      const upcomingCount = registeredEvents.filter(e => new Date(e.date) >= new Date().setHours(0, 0, 0, 0)).length;

      return {
        success: true,
        data: {
          registeredCount,
          upcomingCount,
          completedCount: registeredCount - upcomingCount >= 0 ? registeredCount - upcomingCount : 0,
          myRegistrations: myRegs
        }
      };
    }
  }
};

// Export to window so vanilla scripts can use `api`
window.api = api;
