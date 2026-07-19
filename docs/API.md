# API Reference — StadiumGenie-AI

This document lists the major endpoints implemented by the backend. For each endpoint: Method, URL, Authentication, Request Body (if any), Success Response example, and common status codes.

---

## Authentication

### Register
- Method: POST
- URL: /api/v1/auth/register
- Authentication: No
- Request Body:
  - name (string)
  - email (string)
  - password (string)
- Success Response (201):
  {
    "success": true,
    "message": "User registered",
    "data": { "user": { "id","name","email" } }
  }
- Status codes: 201, 422 (validation), 500

### Login
- Method: POST
- URL: /api/v1/auth/login
- Authentication: No
- Request Body:
  - email (string)
  - password (string)
- Success Response (200):
  {
    "success": true,
    "message": "Logged in",
    "data": { "accessToken": "<jwt>", "user": { "id","name","email","role" } }
  }
- Status codes: 200, 401, 422, 500

### Me
- Method: GET
- URL: /api/v1/auth/me
- Authentication: Bearer token required
- Request Body: none
- Success Response (200):
  {
    "success": true,
    "data": { "user": { "id","name","email","role" } }
  }
- Status codes: 200, 401

---

## Stadiums

### List stadiums
- Method: GET
- URL: /api/v1/stadiums
- Authentication: Public
- Request Body: none
- Success (200): { "success": true, "data": [ {stadium}, ... ], "meta": {...} }
- Status codes: 200

### Get stadium by id
- Method: GET
- URL: /api/v1/stadiums/:id
- Authentication: Public
- Success (200): { "success": true, "data": { stadium } }
- Status codes: 200, 404

### Create stadium
- Method: POST
- URL: /api/v1/stadiums
- Authentication: Bearer token (admin required)
- Request Body:
  - name, city, capacity, etc.
- Success (201): { "success": true, "message": "Stadium created", "data": { stadium } }
- Status codes: 201, 401, 403, 422

### Update stadium
- Method: PUT
- URL: /api/v1/stadiums/:id
- Authentication: Bearer token (admin required)
- Request Body: fields to update
- Success (200): { "success": true, "message": "Stadium updated", "data": { stadium } }
- Status codes: 200, 401, 403, 422, 404

### Delete stadium
- Method: DELETE
- URL: /api/v1/stadiums/:id
- Authentication: Bearer token (admin required)
- Success (200): { "success": true, "message": "Stadium removed" }
- Status codes: 200, 401, 403, 404

---

## Events

### List events
- Method: GET
- URL: /api/v1/events
- Authentication: Public
- Success (200): { "success": true, "data": [ {event}, ... ], "meta": {...} }
- Status codes: 200

### Get event by id
- Method: GET
- URL: /api/v1/events/:id
- Authentication: Public
- Success (200): { "success": true, "data": { event } }
- Status codes: 200, 404

### Create event
- Method: POST
- URL: /api/v1/events
- Authentication: Bearer token (admin required)
- Request Body:
  - stadiumId, title, startDateTime, endDateTime, totalSeats, price, etc.
- Success (201): { "success": true, "message": "Event created", "data": { event } }
- Status codes: 201, 401, 403, 422

### Update event
- Method: PUT
- URL: /api/v1/events/:id
- Authentication: Bearer token (admin required)
- Request Body: fields to update
- Success (200): { "success": true, "message": "Event updated", "data": { event } }
- Status codes: 200, 401, 403, 422, 404

### Delete event
- Method: DELETE
- URL: /api/v1/events/:id
- Authentication: Bearer token (admin required)
- Success (200): { "success": true, "message": "Event removed" }
- Status codes: 200, 401, 403, 404

---

## Bookings

### Create booking
- Method: POST
- URL: /api/v1/bookings
- Authentication: Bearer token required
- Request Body:
  - eventId (ObjectId), quantity (int)
- Success (201): { "success": true, "message": "Booking created", "data": { booking } }
- Status codes: 201, 401, 422, 400

### List bookings (current user)
- Method: GET
- URL: /api/v1/bookings
- Authentication: Bearer token required
- Success (200): { "success": true, "data": [ {booking}, ... ], "meta": {...} }
- Status codes: 200, 401

### Get booking by id
- Method: GET
- URL: /api/v1/bookings/:id
- Authentication: Bearer token required
- Success (200): { "success": true, "data": { booking } }
- Status codes: 200, 401, 403, 404

### Cancel booking (delete)
- Method: DELETE
- URL: /api/v1/bookings/:id
- Authentication: Bearer token required
- Success (200): { "success": true, "message": "Booking cancelled" }
- Status codes: 200, 401, 403, 404

---

## Payments

### Create payment
- Method: POST
- URL: /api/v1/payments
- Authentication: Bearer token required
- Request Body:
  - bookingId (ObjectId), paymentMethod (enum: card,upi,netbanking,wallet,cash)
- Notes: amount and paymentReference are generated server-side; payment simulated
- Success (201): { "success": true, "message": "Payment created", "data": { payment } }
- Status codes: 201, 401, 422, 400

### List payments (current user)
- Method: GET
- URL: /api/v1/payments
- Authentication: Bearer token required
- Success (200): { "success": true, "data": [ {payment}, ... ], "meta": {...} }
- Status codes: 200, 401

### Get payment by id
- Method: GET
- URL: /api/v1/payments/:id
- Authentication: Bearer token required
- Success (200): { "success": true, "data": { payment } }
- Status codes: 200, 401, 403, 404

---

## Tickets

### List tickets (current user)
- Method: GET
- URL: /api/v1/tickets
- Authentication: Bearer token required
- Success (200): { "success": true, "data": [ {ticket}, ... ], "meta": {...} }
- Status codes: 200, 401

### Get ticket by id
- Method: GET
- URL: /api/v1/tickets/:id
- Authentication: Bearer token required
- Success (200): { "success": true, "data": { ticket } }
- Status codes: 200, 401, 403, 404

Notes: Tickets are generated automatically after successful payments. There are no public POST/PUT/DELETE ticket endpoints.

---

## Admin (Dashboard & Statistics) — Admin only

All admin endpoints require Bearer token and admin role.

### Dashboard Summary
- Method: GET
- URL: /api/v1/admin/dashboard
- Authentication: Bearer token (admin)
- Success (200): { "success": true, "data": { totalUsers, totalStadiums, totalEvents, totalBookings, totalPayments, totalTickets, activeEvents, completedEvents, cancelledEvents, totalRevenue, totalSeatsBooked } }

### Recent Bookings
- Method: GET
- URL: /api/v1/admin/recent-bookings
- Authentication: Bearer token (admin)
- Success (200): { "success": true, "data": [ bookings 10 newest ], "meta": {...} }

### Recent Payments
- Method: GET
- URL: /api/v1/admin/recent-payments
- Authentication: Bearer token (admin)
- Success (200): { "success": true, "data": [ payments 10 newest ], "meta": {...} }

### Recent Tickets
- Method: GET
- URL: /api/v1/admin/recent-tickets
- Authentication: Bearer token (admin)
- Success (200): { "success": true, "data": [ tickets 10 newest ], "meta": {...} }

### Event Statistics
- Method: GET
- URL: /api/v1/admin/events
- Authentication: Bearer token (admin)
- Success (200): [ { eventId, title, stadium, availableSeats, totalSeats, bookedSeats, occupancyPercentage, status }, ... ]

### Stadium Statistics
- Method: GET
- URL: /api/v1/admin/stadiums
- Authentication: Bearer token (admin)
- Success (200): [ { stadiumId, name, city, events, totalBookings, revenue }, ... ]

---

## Response format

Successful responses:
{
  "success": true,
  "message": "optional message",
  "data": {...},
  "meta": {...}
}

Errors:
{
  "success": false,
  "message": "Error message",
  "errors": [...],
  "statusCode": <http status>
}

---

## Notes & Conventions

- All protected endpoints require `Authorization: Bearer <token>`.
- IDs are MongoDB ObjectId strings.
- Validation errors return 422 with details.
- The payment flow is simulated for development; amounts and paymentReference are server-controlled.