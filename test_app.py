"""
Comprehensive Test Suite for College Event Management System Backend
Tests all endpoints using Flask's built-in test client.
"""

import unittest
import json
from app import app, users, events, registrations


class TestCollegeEventManager(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_01_root_endpoint(self):
        """Test API welcome endpoint."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertIn('endpoints', data)

    def test_02_student_registration(self):
        """Test registering a new student."""
        payload = {
            "name": "Bob Smith",
            "email": "bob@college.edu",
            "password": "bobpassword",
            "role": "student"
        }
        response = self.client.post(
            '/api/register',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['email'], 'bob@college.edu')
        self.assertNotIn('password', data['data'])

    def test_03_duplicate_registration_fails(self):
        """Test registering with an existing email fails."""
        payload = {
            "name": "Duplicate Alice",
            "email": "alice@college.edu",
            "password": "pass",
            "role": "student"
        }
        response = self.client.post(
            '/api/register',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 409)
        data = response.get_json()
        self.assertFalse(data['success'])

    def test_04_login_success(self):
        """Test login with valid credentials."""
        payload = {
            "email": "alice@college.edu",
            "password": "alice123"
        }
        response = self.client.post(
            '/api/login',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['role'], 'student')

    def test_05_login_invalid_password(self):
        """Test login with wrong password fails."""
        payload = {
            "email": "alice@college.edu",
            "password": "wrongpassword"
        }
        response = self.client.post(
            '/api/login',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
        data = response.get_json()
        self.assertFalse(data['success'])

    def test_06_get_all_events(self):
        """Test viewing all events."""
        response = self.client.get('/api/events')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertIsInstance(data['data'], list)
        self.assertGreaterEqual(len(data['data']), 3)

    def test_07_get_single_event(self):
        """Test viewing single event by ID."""
        response = self.client.get('/api/events/1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['id'], 1)
        self.assertIn('remaining_spots', data['data'])

    def test_08_admin_create_event(self):
        """Test admin creating a new event."""
        payload = {
            "title": "Robo Wars 2026",
            "description": "Combat robotics tournament.",
            "date": "2026-11-20",
            "time": "02:00 PM",
            "venue": "Outdoor Arena",
            "category": "Robotics",
            "capacity": 80,
            "user_id": 1  # Admin ID
        }
        response = self.client.post(
            '/api/events',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['title'], 'Robo Wars 2026')

    def test_09_non_admin_cannot_create_event(self):
        """Test student cannot create an event."""
        payload = {
            "title": "Unauthorized Event",
            "description": "Should fail",
            "date": "2026-12-01",
            "venue": "Hall C",
            "user_id": 2  # Student ID
        }
        response = self.client.post(
            '/api/events',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 403)
        data = response.get_json()
        self.assertFalse(data['success'])

    def test_10_admin_update_event(self):
        """Test admin updating an event."""
        payload = {
            "user_id": 1,
            "venue": "Campus Grand Hall",
            "capacity": 150
        }
        response = self.client.put(
            '/api/events/1',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['venue'], 'Campus Grand Hall')
        self.assertEqual(data['data']['capacity'], 150)

    def test_11_student_registers_for_event(self):
        """Test student registering for an event."""
        payload = {"student_id": 2}
        response = self.client.post(
            '/api/events/2/register',
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['event_id'], 2)

    def test_12_student_duplicate_event_registration(self):
        """Test duplicate registration for same event fails."""
        payload = {"student_id": 2}
        response = self.client.post(
            '/api/events/1/register',  # Already seeded for event 1
            data=json.dumps(payload),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 409)
        data = response.get_json()
        self.assertFalse(data['success'])

    def test_13_get_student_events(self):
        """Test viewing all events a student registered for."""
        response = self.client.get('/api/students/2/events')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertGreaterEqual(data['count'], 1)

    def test_14_admin_view_event_attendees(self):
        """Test viewing attendees of an event."""
        response = self.client.get('/api/events/1/registrations')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertGreaterEqual(data['count'], 1)

    def test_15_cancel_event_registration(self):
        """Test student unregistering from an event."""
        response = self.client.delete('/api/events/2/register/2')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])

    def test_16_admin_delete_event(self):
        """Test admin deleting an event."""
        response = self.client.delete('/api/events/3?user_id=1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['success'])

        # Verify it's gone
        get_res = self.client.get('/api/events/3')
        self.assertEqual(get_res.status_code, 404)


if __name__ == '__main__':
    unittest.main()
