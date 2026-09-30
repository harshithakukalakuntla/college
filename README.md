# 🎓 CampusPulse - College Event Management System

A modern, responsive, and feature-complete **College Event Management System frontend** built exclusively with **HTML5, CSS3, and vanilla JavaScript (ES6+)**.

Designed with a sleek **blue/purple tech theme**, interactive animations, glassmorphism touches, toast notifications, dynamic filters, and digital boarding passes with QR codes.

---

## 🚀 Key Highlights

* **100% Framework-Free:** Built using pure HTML5, CSS3, and modern Vanilla JS (no React, Vue, Bootstrap, or Tailwind).
* **Mock API & LocalStorage Persistence:** Seeded with realistic university data (hackathons, cultural fests, workshops, seminars, sports meets, and career panels). Data persists across page reloads.
* **Flask REST API Ready:** Structured with a dedicated `js/api.js` service layer returning standard Promises. Easily toggle between `localStorage` and a real Python Flask backend by changing a single boolean flag.
* **Instant Demo Role Switcher:** Includes a persistent top banner allowing examiners and reviewers to switch between **Student**, **Admin**, and **Guest** modes with 1 click.
* **Mobile-Responsive:** Adaptive navigation drawer, responsive grids, and flexible tables for desktop, tablet, and mobile devices.

---

## 📁 Project Structure

```text
college-event-system/
├── index.html                   # Root entry point (auto-redirects to html/index.html)
├── README.md                    # Project documentation & Flask API integration guide
├── assets/
│   └── images/                  # Static graphic assets & placeholders
├── css/
│   ├── style.css                # Color variables (blue/purple theme), typography, base reset
│   ├── components.css           # Buttons, cards, badges, modal dialogs, toasts, navbar
│   └── dashboard.css            # Sidebar layout, KPI cards, boarding-pass tickets
├── js/
│   ├── mock-data.js             # Initial seeds for events, users, and registrations
│   ├── api.js                   # Unified Data Access Layer (localStorage / Flask fetch)
│   ├── auth.js                  # Session checks, role guards (admin/student), login/logout
│   ├── main.js                  # Toast notifications, responsive navbar, modal handlers
│   ├── events.js                # Search debounce, category chip filters, sorting
│   ├── event-details.js         # Single event presentation, capacity bar, registration modal
│   ├── student-dashboard.js     # Student KPI metrics, upcoming highlight, registrations
│   ├── my-events.js             # Digital boarding pass tickets with SVG QR code, print & cancel
│   ├── profile.js               # Student profile editor, avatar picker, department updates
│   ├── admin-dashboard.js       # Admin overview metrics, event CRUD table, delete handling
│   ├── create-event.js          # Unified create & edit event forms with image preview
│   └── registrations.js         # Admin registration roster, status toggles, and CSV export
└── html/
    ├── index.html               # Public Home landing page with hero & featured events
    ├── login.html               # Sign In page with 1-click demo filler buttons
    ├── register.html            # Student registration page with department & roll number
    ├── events.html              # Explore Events catalog with live search & filters
    ├── event-details.html       # Event details & registration modal
    ├── student-dashboard.html   # Student portal overview & quick metrics
    ├── my-events.html           # Student's registered events with digital passes
    ├── profile.html             # Profile management & avatar customization
    ├── admin-dashboard.html     # Admin dashboard with campus KPI statistics
    ├── create-event.html        # Create / Edit event form
    └── registrations.html       # Admin view of all attendee registrations & CSV export
```

---

## 👥 Demo Credentials

For quick evaluation without manual signup:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Student** | `student@college.edu` | `student` | Register for events, view tickets, edit profile |
| **Admin** | `admin@college.edu` | `admin` | Create/edit/delete events, view rosters, export CSV |

> 💡 **Tip:** You can also use the **Demo Mode Bar** at the top of every page to switch roles instantly without logging in again.

---

## 🌟 Pages & Feature Breakdown

### 1. Home Page (`html/index.html`)
* Hero banner with university event statistics (120+ events, 5,000+ students, 100% digital passes).
* Category quick-access cards (Technology, Cultural, Workshops, Seminars, Sports, Career).
* Trending upcoming events grid with direct registration links.
* Responsive navigation bar with mobile hamburger drawer and user profile pill dropdown.

### 2. Authentication (`html/login.html` & `html/register.html`)
* Role-based session storage.
* Instant 1-click pre-fill buttons for Student and Admin test accounts.
* Student registration captures Full Name, College Email, Roll Number, Department, Year, and Contact Number.

### 3. Events Catalog (`html/events.html`)
* Real-time search filter across event titles, organizers, venues, and keywords.
* Category filter chips for 1-click filtering.
* Sort selector (Upcoming First, Furthest Date, Most Popular Seats Filled, Alphabetical).
* Interactive capacity bar indicating remaining seats and "Sold Out" states.

### 4. Event Details & Registration (`html/event-details.html`)
* Comprehensive event presentation: Cover banner, tags, full description, eligibility criteria, rules, and coordinator contacts.
* Dynamic right-side card showing ticket price, seat availability progress bar, and schedule.
* Registration Modal: Pre-fills student details, includes event conduct agreement, creates registration, and instantly updates available seats.

### 5. Student Dashboard (`html/student-dashboard.html`)
* KPI metric cards: Registered Events, Upcoming Events, Completed Participations.
* Highlight card for the next upcoming event.
* Table of recent registrations with direct pass links.
* Recommended events widget.

### 6. My Events & Digital Passes (`html/my-events.html`)
* Boarding pass / ticket layout with perforated divider styling.
* Tamper-proof SVG QR code pattern generated per ticket.
* **Print Ticket** feature for physical entry verification.
* **Cancel Registration** action with confirmation prompt that automatically releases the seat.

### 7. Profile Management (`html/profile.html`)
* Editable student credentials (Name, Roll Number, Department, Year, Phone, Bio).
* Preset avatar gallery + custom avatar URL input with live preview.

### 8. Admin Dashboard (`html/admin-dashboard.html`)
* Executive KPI cards: Total Events, Total Registrations, Active Students, Upcoming Events.
* Event CRUD Management Table: Search events, view capacities, edit events, or delete events.
* Real-time recent student registration activity feed.

### 9. Create & Edit Event (`html/create-event.html`)
* Dual-purpose form (supports both creating new events and editing existing events via `?id=...`).
* Live image URL preview with 1-click sample images.
* Form validation for titles, dates, times, seat capacities, and coordinator info.

### 10. Registrations & Attendance Roster (`html/registrations.html`)
* Filter registrations by specific event or all campus events.
* Filter by status (Confirmed, Pending, Attended, Cancelled).
* Live search by student name, roll number, email, or ticket code.
* Inline status modifier dropdown.
* **Export to CSV** button generating downloadable spreadsheets of attendee rosters.

---

## 🔌 Connecting to a Python Flask REST API

The JavaScript architecture is intentionally isolated inside `js/api.js`. Every page accesses data exclusively through Promise-returning methods on the global `api` object.

### Step 1: Switch from Mock to Flask API
In `js/api.js`, change:
```javascript
const API_CONFIG = {
  USE_MOCK_API: false, // Set to false to disable localStorage and hit Flask
  BASE_URL: 'http://127.0.0.1:5000/api',
  ...
};
```

### Step 2: Implement Corresponding Flask Endpoints

| Flask Route | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Authenticate user; returns user object & token |
| `/api/auth/register` | `POST` | Create student account |
| `/api/auth/profile` | `PUT` | Update profile information |
| `/api/events` | `GET` | Return list of events with query params (`category`, `search`, `status`) |
| `/api/events/<id>` | `GET` | Return single event by ID |
| `/api/events` | `POST` | Create a new college event |
| `/api/events/<id>` | `PUT` | Update existing event |
| `/api/events/<id>` | `DELETE` | Delete event and associated registrations |
| `/api/events/<id>/register` | `POST` | Register student for event, decrement seat count, return ticket code |
| `/api/registrations/my` | `GET` | Return registrations for the logged-in student |
| `/api/registrations` | `GET` | Admin endpoint returning all registrations with filters |
| `/api/registrations/<id>` | `DELETE` | Cancel registration and restore event seat |
| `/api/registrations/<id>/status` | `PATCH` | Update registration status (`Confirmed`, `Attended`, etc.) |
| `/api/admin/stats` | `GET` | Return summary metrics for the Admin Dashboard |
| `/api/student/stats/<userId>` | `GET` | Return registered/upcoming event metrics for a student |

---

## 💻 How to Run Locally

You can open the project in any modern web browser directly:

### Option A: Open directly in browser
Double-click `index.html` at the project root or open `html/index.html`.

### Option B: Using Python's built-in HTTP server
From the project folder:
```bash
python -m http.server 8000
```
Then navigate to: `http://localhost:8000`

### Option C: Using VS Code Live Server
Right-click `index.html` or `html/index.html` and choose **"Open with Live Server"**.
