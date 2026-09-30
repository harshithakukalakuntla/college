# College Event Management System - Backend

A simple, lightweight, and beginner-friendly RESTful backend API for a **College Event Management System** built with **Python Flask**.

## 🌟 Key Features

* **Event Management (CRUD)**: Add, view, edit, and delete events.
* **Authentication**: Student and Admin registration and login.
* **Event Registration**: Students can register for events and view registered events.
* **Admin Controls**: Only admins can create, edit, delete events, and view event attendee lists.
* **Zero Database / No SQL**: Stores all data in-memory using native Python lists and dictionaries.
* **CORS Enabled**: Seamless integration with modern frontend frameworks (React, Vue, Angular, plain HTML/JS).
* **RESTful JSON API**: Clean status codes, structured JSON responses, and validation error messages.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Application
```bash
python app.py
```
The server will start at: `http://127.0.0.1:5000`

### 3. Run Automated Tests
```bash
python test_app.py
```

---

## 👥 Pre-seeded Test Accounts

The system starts with pre-configured accounts for testing:

| Role | Email | Password | User ID |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `admin123` | `1` |
| **Student** | `alice@college.edu` | `alice123` | `2` |

---

## 📋 API Reference

All requests and responses use `Content-Type: application/json`.

### 1. General & Info
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and list of available endpoints |

---

### 2. Authentication
#### Register User
* **Endpoint**: `POST /api/register`
* **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@college.edu",
    "password": "password123",
    "role": "student"
  }
  ```
  *(Role can be `"student"` or `"admin"`. Default is `"student"`)*

#### Login User
* **Endpoint**: `POST /api/login`
* **Body**:
  ```json
  {
    "email": "john@college.edu",
    "password": "password123"
  }
  ```

#### Get All Users
* **Endpoint**: `GET /api/users`

---

### 3. Events Management (CRUD)

#### View All Events
* **Endpoint**: `GET /api/events`
* **Response**: Returns all events along with `registered_count` and `remaining_spots`.

#### View Single Event
* **Endpoint**: `GET /api/events/<event_id>`

#### Add Event (Admin Only)
* **Endpoint**: `POST /api/events`
* **Body**:
  ```json
  {
    "title": "Spring Hackathon 2026",
    "description": "24-hour coding challenge.",
    "date": "2026-10-30",
    "time": "10:00 AM",
    "venue": "Campus Auditorium",
    "category": "Technical",
    "capacity": 100,
    "user_id": 1
  }
  ```

#### Edit Event (Admin Only)
* **Endpoint**: `PUT /api/events/<event_id>`
* **Body**:
  ```json
  {
    "user_id": 1,
    "venue": "New Auditorium",
    "capacity": 120
  }
  ```

#### Delete Event (Admin Only)
* **Endpoint**: `DELETE /api/events/<event_id>?user_id=1`
* *(Also deletes all student registrations associated with the event)*

---

### 4. Event Registration (Students)

#### Register for an Event
* **Endpoint**: `POST /api/events/<event_id>/register`
* **Body**:
  ```json
  {
    "student_id": 2
  }
  ```
* Prevents duplicate registration and checks capacity limits.

#### Cancel Event Registration
* **Endpoint**: `DELETE /api/events/<event_id>/register/<student_id>`

#### View Student's Registered Events
* **Endpoint**: `GET /api/students/<student_id>/events`

#### View Attendees for an Event (Admin View)
* **Endpoint**: `GET /api/events/<event_id>/registrations`

---

## 🌐 Connecting to a Frontend

CORS is globally enabled on the Flask backend via `CORS(app)`. You can make fetch or axios calls from your frontend running on any port (e.g. `http://localhost:3000` or `http://localhost:5173`):

```javascript
// Example: Fetching events in frontend
fetch('http://127.0.0.1:5000/api/events')
  .then(res => res.json())
  .then(data => console.log(data));
```
