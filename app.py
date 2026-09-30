"""
College Event Management System - Backend API
Built with Python Flask

Features:
- Event Management (CRUD: Add, View, Edit, Delete events)
- Student Authentication (Register & Login)
- Event Registration (Students can register for events)
- Admin Management (Admins can manage events and view attendees)
- In-memory data storage (Python lists and dictionaries, no database required)
- CORS enabled for frontend integration
- Clean RESTful JSON APIs
"""

from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes so frontend apps (React, Vue, HTML/JS) can connect
CORS(app)

# ==============================================================================
# IN-MEMORY DATA STORAGE
# Using Python lists of dictionaries to store users, events, and registrations.
# ==============================================================================

# Auto-increment ID counters
user_id_counter = 3
event_id_counter = 4
registration_id_counter = 2

# Seed Users (1 Admin and 1 Student pre-seeded for quick testing)
users = [
    {
        "id": 1,
        "name": "College Administrator",
        "email": "admin@college.edu",
        "password": "admin123",
        "role": "admin"  # Roles: 'admin' or 'student'
    },
    {
        "id": 2,
        "name": "Alice Johnson",
        "email": "alice@college.edu",
        "password": "alice123",
        "role": "student"
    }
]

# Seed Events
events = [
    {
        "id": 1,
        "title": "Annual Hackathon 2026",
        "description": "24-hour coding challenge to build innovative software solutions.",
        "date": "2026-10-15",
        "time": "09:00 AM",
        "venue": "Campus Main Auditorium",
        "category": "Technical",
        "capacity": 100,
        "created_by": 1
    },
    {
        "id": 2,
        "title": "Cultural Fest - Symphonia",
        "description": "Annual music, dance, and drama festival celebrating talent across campus.",
        "date": "2026-10-22",
        "time": "05:00 PM",
        "venue": "Open Air Amphitheatre",
        "category": "Cultural",
        "capacity": 300,
        "created_by": 1
    },
    {
        "id": 3,
        "title": "AI & Robotics Workshop",
        "description": "Hands-on workshop on machine learning models and robotic arms.",
        "date": "2026-11-05",
        "time": "10:30 AM",
        "venue": "Robotics Lab, Block B",
        "category": "Workshop",
        "capacity": 50,
        "created_by": 1
    }
]

# Seed Registrations
registrations = [
    {
        "id": 1,
        "event_id": 1,
        "student_id": 2,
        "student_name": "Alice Johnson",
        "student_email": "alice@college.edu",
        "registered_at": "2026-09-29 10:00:00"
    }
]


# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

def find_user_by_id(user_id):
    """Find and return a user by ID, or None if not found."""
    return next((u for u in users if u["id"] == user_id), None)


def find_user_by_email(email):
    """Find and return a user by email (case-insensitive), or None if not found."""
    return next((u for u in users if u["email"].lower() == email.strip().lower()), None)


def find_event_by_id(event_id):
    """Find and return an event by ID, or None if not found."""
    return next((e for e in events if e["id"] == event_id), None)


def get_event_registration_count(event_id):
    """Count how many students are registered for an event."""
    return sum(1 for r in registrations if r["event_id"] == event_id)


def sanitize_user(user):
    """Return user data without exposing the password."""
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
    }


# ==============================================================================
# GENERAL ROUTES
# ==============================================================================

@app.route("/", methods=["GET"])
def home():
    """Welcome route providing API information and available endpoints."""
    return jsonify({
        "success": True,
        "message": "Welcome to the College Event Management System API!",
        "version": "1.0.0",
        "endpoints": {
            "auth": {
                "register": "POST /api/register",
                "login": "POST /api/login",
                "users": "GET /api/users"
            },
            "events": {
                "get_all": "GET /api/events",
                "get_one": "GET /api/events/<event_id>",
                "create": "POST /api/events",
                "update": "PUT /api/events/<event_id>",
                "delete": "DELETE /api/events/<event_id>"
            },
            "registrations": {
                "register_for_event": "POST /api/events/<event_id>/register",
                "cancel_registration": "DELETE /api/events/<event_id>/register/<student_id>",
                "student_registered_events": "GET /api/students/<student_id>/events",
                "event_attendees": "GET /api/events/<event_id>/registrations"
            }
        }
    }), 200


# ==============================================================================
# AUTHENTICATION ROUTES (Student & Admin)
# ==============================================================================

@app.route("/api/register", methods=["POST"])
def register():
    """
    Register a new student (or admin).
    Request Body:
      - name (string, required)
      - email (string, required)
      - password (string, required)
      - role (string, optional: 'student' or 'admin', default: 'student')
    """
    global user_id_counter

    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Request body must be valid JSON."}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    role = data.get("role", "student").strip().lower()

    # Validation
    if not name or not email or not password:
        return jsonify({"success": False, "message": "Name, email, and password are required."}), 400

    if role not in ["student", "admin"]:
        return jsonify({"success": False, "message": "Role must be 'student' or 'admin'."}), 400

    if find_user_by_email(email):
        return jsonify({"success": False, "message": "A user with this email already exists."}), 409

    # Create and store new user
    new_user = {
        "id": user_id_counter,
        "name": name,
        "email": email,
        "password": password,
        "role": role
    }
    users.append(new_user)
    user_id_counter += 1

    return jsonify({
        "success": True,
        "message": f"User registered successfully as {role}.",
        "data": sanitize_user(new_user)
    }), 201


@app.route("/api/login", methods=["POST"])
def login():
    """
    Authenticate a user (Student or Admin).
    Request Body:
      - email (string, required)
      - password (string, required)
    """
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Request body must be valid JSON."}), 400

    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"success": False, "message": "Both email and password are required."}), 400

    user = find_user_by_email(email)
    if not user or user["password"] != password:
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "data": sanitize_user(user)
    }), 200


@app.route("/api/users", methods=["GET"])
def get_users():
    """Get all registered users (passwords omitted)."""
    sanitized = [sanitize_user(u) for u in users]
    return jsonify({
        "success": True,
        "count": len(sanitized),
        "data": sanitized
    }), 200


# ==============================================================================
# EVENT MANAGEMENT ROUTES (CRUD)
# ==============================================================================

@app.route("/api/events", methods=["GET"])
def get_events():
    """
    View all events.
    Includes the current registered count and remaining spots for each event.
    """
    enhanced_events = []
    for event in events:
        registered_count = get_event_registration_count(event["id"])
        capacity = event.get("capacity", 0)
        remaining_spots = max(0, capacity - registered_count) if capacity else None

        enhanced_event = dict(event)
        enhanced_event["registered_count"] = registered_count
        enhanced_event["remaining_spots"] = remaining_spots
        enhanced_events.append(enhanced_event)

    return jsonify({
        "success": True,
        "count": len(enhanced_events),
        "data": enhanced_events
    }), 200


@app.route("/api/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    """View details of a single event by ID."""
    event = find_event_by_id(event_id)
    if not event:
        return jsonify({"success": False, "message": f"Event with ID {event_id} not found."}), 404

    registered_count = get_event_registration_count(event_id)
    capacity = event.get("capacity", 0)
    remaining_spots = max(0, capacity - registered_count) if capacity else None

    event_detail = dict(event)
    event_detail["registered_count"] = registered_count
    event_detail["remaining_spots"] = remaining_spots

    return jsonify({
        "success": True,
        "data": event_detail
    }), 200


@app.route("/api/events", methods=["POST"])
def create_event():
    """
    Add a new event (Admin only).
    Request Body:
      - title (string, required)
      - description (string, required)
      - date (string, required, e.g. '2026-10-25')
      - time (string, optional, e.g. '10:00 AM')
      - venue (string, required)
      - category (string, optional, e.g. 'Technical', 'Sports', 'Cultural')
      - capacity (integer, optional, default: 100)
      - user_id (integer, required to verify admin permission)
    """
    global event_id_counter

    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Request body must be valid JSON."}), 400

    # Authorization Check
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"success": False, "message": "user_id is required to verify admin permissions."}), 401

    user = find_user_by_id(user_id)
    if not user or user["role"] != "admin":
        return jsonify({"success": False, "message": "Forbidden. Only admins can create events."}), 403

    # Input Validation
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    date = data.get("date", "").strip()
    venue = data.get("venue", "").strip()

    if not title or not description or not date or not venue:
        return jsonify({"success": False, "message": "title, description, date, and venue are required."}), 400

    try:
        capacity = int(data.get("capacity", 100))
        if capacity <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "capacity must be a positive integer."}), 400

    new_event = {
        "id": event_id_counter,
        "title": title,
        "description": description,
        "date": date,
        "time": data.get("time", "TBD").strip(),
        "venue": venue,
        "category": data.get("category", "General").strip(),
        "capacity": capacity,
        "created_by": user_id
    }
    events.append(new_event)
    event_id_counter += 1

    return jsonify({
        "success": True,
        "message": "Event created successfully.",
        "data": new_event
    }), 201


@app.route("/api/events/<int:event_id>", methods=["PUT"])
def update_event(event_id):
    """
    Edit an existing event (Admin only).
    Request Body:
      - user_id (integer, required to verify admin permission)
      - Any fields to update: title, description, date, time, venue, category, capacity
    """
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Request body must be valid JSON."}), 400

    # Authorization Check
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"success": False, "message": "user_id is required to verify admin permissions."}), 401

    user = find_user_by_id(user_id)
    if not user or user["role"] != "admin":
        return jsonify({"success": False, "message": "Forbidden. Only admins can update events."}), 403

    event = find_event_by_id(event_id)
    if not event:
        return jsonify({"success": False, "message": f"Event with ID {event_id} not found."}), 404

    # Update allowed fields if provided
    if "title" in data and data["title"].strip():
        event["title"] = data["title"].strip()
    if "description" in data and data["description"].strip():
        event["description"] = data["description"].strip()
    if "date" in data and data["date"].strip():
        event["date"] = data["date"].strip()
    if "time" in data:
        event["time"] = data["time"].strip()
    if "venue" in data and data["venue"].strip():
        event["venue"] = data["venue"].strip()
    if "category" in data:
        event["category"] = data["category"].strip()
    if "capacity" in data:
        try:
            capacity = int(data["capacity"])
            if capacity <= 0:
                raise ValueError
            event["capacity"] = capacity
        except (ValueError, TypeError):
            return jsonify({"success": False, "message": "capacity must be a positive integer."}), 400

    return jsonify({
        "success": True,
        "message": "Event updated successfully.",
        "data": event
    }), 200


@app.route("/api/events/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):
    """
    Delete an event (Admin only).
    Also removes all student registrations associated with this event.
    Query Param or Body:
      - user_id (integer, required to verify admin permission)
    """
    global events, registrations

    # Get user_id from query parameter or JSON body
    user_id = request.args.get("user_id", type=int)
    if not user_id and request.is_json:
        data = request.get_json(silent=True) or {}
        user_id = data.get("user_id")

    if not user_id:
        return jsonify({"success": False, "message": "user_id is required to verify admin permissions."}), 401

    user = find_user_by_id(user_id)
    if not user or user["role"] != "admin":
        return jsonify({"success": False, "message": "Forbidden. Only admins can delete events."}), 403

    event = find_event_by_id(event_id)
    if not event:
        return jsonify({"success": False, "message": f"Event with ID {event_id} not found."}), 404

    # Remove the event
    events = [e for e in events if e["id"] != event_id]

    # Clean up associated registrations
    registrations = [r for r in registrations if r["event_id"] != event_id]

    return jsonify({
        "success": True,
        "message": f"Event '{event['title']}' (ID: {event_id}) and its registrations were deleted successfully."
    }), 200


# ==============================================================================
# EVENT REGISTRATION ROUTES (Students)
# ==============================================================================

@app.route("/api/events/<int:event_id>/register", methods=["POST"])
def register_for_event(event_id):
    """
    Student registers for an event.
    Request Body:
      - student_id (integer, required)
    """
    global registration_id_counter

    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "Request body must be valid JSON."}), 400

    student_id = data.get("student_id")
    if not student_id:
        return jsonify({"success": False, "message": "student_id is required."}), 400

    # Check if student exists
    student = find_user_by_id(student_id)
    if not student:
        return jsonify({"success": False, "message": f"Student with ID {student_id} not found."}), 404

    if student["role"] != "student":
        return jsonify({"success": False, "message": "Only students can register for events."}), 403

    # Check if event exists
    event = find_event_by_id(event_id)
    if not event:
        return jsonify({"success": False, "message": f"Event with ID {event_id} not found."}), 404

    # Check if student is already registered for this event
    already_registered = any(
        r["event_id"] == event_id and r["student_id"] == student_id
        for r in registrations
    )
    if already_registered:
        return jsonify({
            "success": False,
            "message": "Student is already registered for this event."
        }), 409

    # Check capacity limit
    current_registrations = get_event_registration_count(event_id)
    if event.get("capacity") and current_registrations >= event["capacity"]:
        return jsonify({
            "success": False,
            "message": "Registration failed. This event has reached full capacity."
        }), 400

    # Create new registration
    new_reg = {
        "id": registration_id_counter,
        "event_id": event_id,
        "student_id": student_id,
        "student_name": student["name"],
        "student_email": student["email"],
        "event_title": event["title"],
        "registered_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    registrations.append(new_reg)
    registration_id_counter += 1

    return jsonify({
        "success": True,
        "message": f"Successfully registered for '{event['title']}'.",
        "data": new_reg
    }), 201


@app.route("/api/events/<int:event_id>/register/<int:student_id>", methods=["DELETE"])
def cancel_registration(event_id, student_id):
    """Cancel a student's registration for an event."""
    global registrations

    event = find_event_by_id(event_id)
    if not event:
        return jsonify({"success": False, "message": f"Event with ID {event_id} not found."}), 404

    reg = next(
        (r for r in registrations if r["event_id"] == event_id and r["student_id"] == student_id),
        None
    )
    if not reg:
        return jsonify({
            "success": False,
            "message": "No registration record found for this student and event."
        }), 404

    registrations = [
        r for r in registrations
        if not (r["event_id"] == event_id and r["student_id"] == student_id)
    ]

    return jsonify({
        "success": True,
        "message": f"Registration for event '{event['title']}' has been cancelled."
    }), 200


@app.route("/api/students/<int:student_id>/events", methods=["GET"])
def get_student_events(student_id):
    """
    Get all events a specific student is registered for.
    """
    student = find_user_by_id(student_id)
    if not student:
        return jsonify({"success": False, "message": f"Student with ID {student_id} not found."}), 404

    student_event_ids = [
        r["event_id"] for r in registrations if r["student_id"] == student_id
    ]

    registered_events_list = [
        find_event_by_id(eid) for eid in student_event_ids if find_event_by_id(eid)
    ]

    return jsonify({
        "success": True,
        "student": sanitize_user(student),
        "count": len(registered_events_list),
        "data": registered_events_list
    }), 200


@app.route("/api/events/<int:event_id>/registrations", methods=["GET"])
def get_event_registrations(event_id):
    """
    Get the list of all registered students for a specific event (Admin view).
    """
    event = find_event_by_id(event_id)
    if not event:
        return jsonify({"success": False, "message": f"Event with ID {event_id} not found."}), 404

    attendees = [r for r in registrations if r["event_id"] == event_id]

    return jsonify({
        "success": True,
        "event_id": event_id,
        "event_title": event["title"],
        "count": len(attendees),
        "data": attendees
    }), 200


# ==============================================================================
# GLOBAL ERROR HANDLERS
# ==============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "Resource not found. Please verify the endpoint URL."
    }), 404


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "success": False,
        "message": "HTTP method not allowed on this endpoint."
    }), 405


@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "success": False,
        "message": "An internal server error occurred."
    }), 500


# ==============================================================================
# APPLICATION ENTRY POINT
# ==============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print(" College Event Management System Backend")
    print(" Server running at: http://127.0.0.1:5000")
    print(" CORS enabled for frontend connections.")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=True)
