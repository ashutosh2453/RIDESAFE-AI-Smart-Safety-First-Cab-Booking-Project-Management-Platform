# 📡 RideSafe AI — Complete REST API Reference

The **RideSafe AI REST API** powers all core operations across Web and Mobile clients.

- **Base URL (Local)**: `http://localhost:5000/api`
- **Base URL (Vercel Production)**: `https://<your-vercel-domain>.vercel.app/api`
- **Content-Type**: `application/json` (except photo upload endpoints which use `multipart/form-data`)

---

## 🔐 Authentication & Headers

Protected endpoints require a standard HTTP `Authorization` header containing a valid Bearer JWT:

```http
Authorization: Bearer <jwt_token>
```

When unauthenticated or when the token is expired/invalid, the API returns:
```json
{
  "success": false,
  "message": "Authentication required. Invalid or missing token.",
  "error": "UNAUTHORIZED"
}
```

---

## 📑 Table of Contents

1. [System Health & Diagnostics](#1-system-health--diagnostics)
2. [Authentication & User Management](#2-authentication--user-management)
3. [Cab Booking & Ride Management](#3-cab-booking--ride-management)
4. [Passenger Safety & Incident Protocols](#4-passenger-safety--incident-protocols)
5. [Visual Pickup Assistance](#5-visual-pickup-assistance)
6. [Driver Fleet & SmartMatch Engine](#6-driver-fleet--smartmatch-engine)
7. [Trusted Contacts Hub](#7-trusted-contacts-hub)
8. [Transportation Projects](#8-transportation-projects)
9. [Travel Tasks & Checklists](#9-travel-tasks--checklists)
10. [Dashboard Analytics](#10-dashboard-analytics)
11. [RideSafe AI Travel Assistant](#11-ridesafe-ai-travel-assistant)
12. [Error Handling Specification](#12-error-handling-specification)

---

## 1. System Health & Diagnostics

### `GET /api/health`
Checks server status and database readiness.

- **Auth Required**: No
- **Success Response (`200 OK`)**:
```json
{
  "status": "online",
  "ok": true,
  "platform": "RideSafe AI Engine",
  "timestamp": "2026-10-08T00:15:00.000Z"
}
```

---

## 2. Authentication & User Management

### `POST /api/auth/register`
Creates a new passenger account and returns an authenticated session.

- **Auth Required**: No
- **Request Body**:
```json
{
  "name": "Alex Johnson",
  "email": "alex@ridesafe.ai",
  "password": "Password123!",
  "phoneNumber": "+919876543210"
}
```
- **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "e4a781b0-466d-4d7a-b50a-9952086c2e3a",
      "name": "Alex Johnson",
      "email": "alex@ridesafe.ai",
      "role": "PASSENGER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `POST /api/auth/login`
Authenticates a user using email and password.

- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "demo@ridesafe.ai",
  "password": "Demo@1234"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "397e38d1-00a0-4ace-8992-6be533639e68",
      "email": "demo@ridesafe.ai",
      "name": "Demo Passenger",
      "role": "PASSENGER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `GET /api/auth/me`
Retrieves the profile of the currently authenticated passenger.

- **Auth Required**: Yes (`Bearer <token>`)
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "id": "397e38d1-00a0-4ace-8992-6be533639e68",
    "name": "Demo Passenger",
    "email": "demo@ridesafe.ai",
    "phoneNumber": "+919876543210",
    "role": "PASSENGER",
    "createdAt": "2026-10-07T12:00:00.000Z"
  }
}
```

---

## 3. Cab Booking & Ride Management

### `POST /api/rides` (or `/api/rides/book`)
Books a new ride with automated SmartMatch driver assignment, dynamic fare calculation, and 4-digit verification PIN generation.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "pickup": "SRM University, Gate 1, Kattankulathur",
  "destination": "Chennai International Airport, Terminal 2",
  "rideType": "SEDAN",
  "landmark": "Near the campus clocktower",
  "projectId": "p-demo-01",
  "distanceKm": 28.5,
  "durationMin": 45
}
```
- **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Ride booked successfully",
  "data": {
    "id": "7b81b29a-2cf4-455b-8eb1-46da09230531",
    "status": "REQUESTED",
    "pin": "4819",
    "pickup": "SRM University, Gate 1, Kattankulathur",
    "destination": "Chennai International Airport, Terminal 2",
    "landmark": "Near the campus clocktower",
    "rideType": "SEDAN",
    "fareEstimate": 721.5,
    "baseFare": 80,
    "distanceFare": 427.5,
    "timeFare": 112.5,
    "distanceKm": 28.5,
    "durationMin": 45,
    "driver": {
      "id": "d-rajesh",
      "name": "Rajesh Kumar",
      "rating": 4.9,
      "totalRides": 1420,
      "phoneNumber": "+919811122233",
      "vehicle": {
        "model": "Honda City",
        "vehicleNumber": "TN 09 BK 4021",
        "color": "White",
        "type": "SEDAN"
      }
    }
  }
}
```

---

### `GET /api/rides`
Retrieves past and active rides for the authenticated user.

- **Auth Required**: Yes
- **Query Parameters**:
  - `status` (optional): Filter by `REQUESTED`, `STARTED`, `COMPLETED`, etc.
  - `limit` (optional): Page size limit (default: 20)
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "7b81b29a-2cf4-455b-8eb1-46da09230531",
      "status": "COMPLETED",
      "pickup": "SRM University, Gate 1",
      "destination": "Chennai Airport",
      "fareEstimate": 721.5,
      "createdAt": "2026-10-08T00:10:00.000Z"
    }
  ]
}
```

---

### `GET /api/rides/:id`
Retrieves full details for a specific ride.

- **Auth Required**: Yes
- **Success Response (`200 OK`)**: Returns complete ride record with driver, vehicle, and checklist metadata.

---

### `POST /api/rides/:id/verify-pin`
Verifies the passenger's 4-digit PIN to authorize driver departure and advance ride status to `STARTED`.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "pin": "4819"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Ride PIN verified successfully. Ride started.",
  "data": {
    "status": "STARTED",
    "startedAt": "2026-10-08T00:15:30.000Z"
  }
}
```

---

### `POST /api/rides/:id/verify-vehicle`
Submits the pre-boarding physical verification checklist.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "vehicleMatches": true,
  "notes": "Verified plate TN 09 BK 4021 and white sedan"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Vehicle verification recorded"
}
```

---

### `POST /api/rides/:id/status`
Advances the ride through its lifecycle state machine (`DRIVER_ARRIVING` ➔ `DRIVER_ARRIVED` ➔ `STARTED` ➔ `COMPLETED`).

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "status": "DRIVER_ARRIVED"
}
```

---

### `POST /api/rides/:id/complete`
Marks the ride as completed and calculates final metrics.

- **Auth Required**: Yes
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Ride completed successfully",
  "data": {
    "status": "COMPLETED",
    "completedAt": "2026-10-08T00:55:00.000Z"
  }
}
```

---

### `POST /api/rides/:id/cancel`
Cancels an active or pending ride.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "reason": "Driver arrived at alternate gate"
}
```

---

### `POST /api/rides/:id/rating`
Submits passenger rating and review for the driver.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "rating": 5,
  "review": "Excellent driver, arrived promptly and vehicle was spotless."
}
```

---

## 4. Passenger Safety & Incident Protocols

### `POST /api/rides/:id/sos`
Triggers an immediate Emergency SOS protocol. Broadcasts emergency alerts to all trusted contacts and creates a `CRITICAL` severity incident.

- **Auth Required**: Yes
- **Rate Limited**: Maximum 5 SOS events per minute
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Emergency SOS protocol initiated",
  "data": {
    "incidentId": "inc-4a9f201a-8b1e",
    "severity": "CRITICAL",
    "trustedContactsNotified": 2,
    "status": "SOS_BROADCASTED"
  }
}
```

---

### `POST /api/rides/:id/route-check`
Checks simulated GPS corridor deviation against expected route geometry.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "currentLat": 12.835,
  "currentLng": 80.058,
  "deviationMeters": 250
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "deviationMeters": 250,
    "isDeviationDetected": true,
    "alertLevel": "HIGH",
    "message": "Route deviation detected. Safety notification triggered."
  }
}
```

---

### `POST /api/rides/:id/unsafe`
Flags an unsafe situation (e.g., driver mismatch, uncomfortable behavior).

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "reason": "License plate did not match application details",
  "details": "Car model was silver hatchback instead of white sedan"
}
```

---

### `POST /api/rides/:id/share`
Generates a tokenized public URL for family and friends to monitor the ride in real time.

- **Auth Required**: Yes
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "shareToken": "RS-8921-X",
    "shareUrl": "https://your-domain.vercel.app/shared-trip/RS-8921-X",
    "expiresAt": "2026-10-08T06:00:00.000Z"
  }
}
```

---

### `GET /api/shared-trip/:token`
Publicly retrieves live trip status and coordinates for trusted third parties.

- **Auth Required**: No (Token-authenticated)
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "pickup": "SRM University, Gate 1",
    "destination": "Chennai Airport",
    "status": "STARTED",
    "vehicleModel": "Honda City (White)",
    "vehiclePlate": "TN 09 BK 4021",
    "driverName": "Rajesh Kumar"
  }
}
```

---

## 5. Visual Pickup Assistance

### `POST /api/rides/:id/pickup-photo`
Uploads a surroundings photo from the passenger's camera to assist the driver in identifying their pickup location.

- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `photo` (File): JPEG, PNG, or WebP image (Max 5MB)
  - `description` (Text, optional): e.g., *"Standing near Gate 2 ATM"*
- **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "message": "Pickup photo uploaded successfully",
  "data": {
    "id": "pic-5a21c",
    "imageUrl": "/api/uploads/pickup-1791400234-a1b2c3d4.jpg",
    "description": "Standing near Gate 2 ATM"
  }
}
```

---

### `GET /api/rides/:id/pickup-photo`
Lists all visual assistance photos uploaded for a ride.

- **Auth Required**: Yes

---

### `GET /api/uploads/:filename`
Serves stored pickup image assets securely.

- **Auth Required**: Yes

---

## 6. Driver Fleet & SmartMatch Engine

### `GET /api/drivers`
Lists verified active drivers in the fleet.

- **Auth Required**: Yes
- **Query Parameters**: `status` (optional, e.g., `AVAILABLE`)
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "d-rajesh",
      "name": "Rajesh Kumar",
      "rating": 4.9,
      "totalRides": 1420,
      "status": "AVAILABLE",
      "vehicle": {
        "model": "Honda City",
        "vehicleNumber": "TN 09 BK 4021",
        "color": "White",
        "type": "SEDAN"
      }
    }
  ]
}
```

---

### `POST /api/drivers/smartmatch`
Runs the algorithmic scoring engine against available drivers without creating a ride.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "pickup": "SRM University, Gate 1",
  "destination": "Chennai Airport",
  "rideType": "SEDAN"
}
```
- **Success Response (`200 OK`)**: Returns ordered candidate drivers with normalized composite scores.

---

## 7. Trusted Contacts Hub

### `GET /api/trusted-contacts` (or `/api/contacts`)
Retrieves the passenger's saved emergency contacts.

- **Auth Required**: Yes
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "c-parent-01",
      "name": "Sunita Chauhan",
      "phoneNumber": "+919876543211",
      "relationship": "PARENT"
    }
  ]
}
```

---

### `POST /api/trusted-contacts`
Adds a new emergency contact.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "name": "Vikram Chauhan",
  "phoneNumber": "+919876543212",
  "relationship": "SIBLING"
}
```
- **Success Response (`201 Created`)**

---

### `DELETE /api/trusted-contacts/:id`
Deletes an emergency contact.

- **Auth Required**: Yes
- **Success Response (`200 OK`)**

---

## 8. Transportation Projects

### `GET /api/projects`
Lists transportation projects owned by the passenger.

- **Auth Required**: Yes
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "p-demo-01",
      "name": "Chennai Airport Departure",
      "description": "Itinerary for afternoon terminal drop-off",
      "status": "IN_PROGRESS",
      "taskCount": 4,
      "completedTaskCount": 2
    }
  ]
}
```

---

### `POST /api/projects`
Creates a new travel itinerary project.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "name": "Weekend Campus Commute",
  "description": "Round-trip transport between campus and central station",
  "startDate": "2026-10-10T09:00:00.000Z"
}
```

---

## 9. Travel Tasks & Checklists

### `GET /api/tasks`
Lists travel tasks, optionally filtered by `projectId`.

- **Auth Required**: Yes
- **Query Parameters**: `projectId` (optional)

---

### `POST /api/tasks`
Adds a new checklist task under a project.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "projectId": "p-demo-01",
  "name": "Confirm 4-digit ride PIN before departure",
  "priority": "HIGH"
}
```

---

### `PUT /api/tasks/:id` (or `PATCH /api/tasks/:id`)
Updates task status or priority.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "status": "COMPLETED"
}
```

---

### `DELETE /api/tasks/:id`
Deletes a task.

- **Auth Required**: Yes

---

## 10. Dashboard Analytics

### `GET /api/dashboard`
Returns aggregated analytics and safety statistics for the authenticated passenger.

- **Auth Required**: Yes
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "totalRides": 14,
    "completedRides": 12,
    "activeRides": 1,
    "safetyScore": 98.5,
    "trustedContactsCount": 2,
    "activeProjectsCount": 2,
    "recentRides": []
  }
}
```

---

## 11. RideSafe AI Travel Assistant

### `POST /api/ai/chat`
Converses with the RideSafe AI Assistant for itinerary planning, PIN guidance, and safety inquiries.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "message": "What should I do if the car model doesn't match the app?",
  "sessionId": "optional-uuid"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "sessionId": "chat-7b81b29a",
    "reply": "⚠️ **Safety First:** If the vehicle model or plate does not match, DO NOT enter the cab. Tap 'Flag Vehicle Mismatch' in the app to immediately abort the ride and report the incident.",
    "createdAt": "2026-10-08T00:15:00.000Z"
  }
}
```

---

### `GET /api/ai/history/:sessionId`
Retrieves past conversation messages for a chat session.

- **Auth Required**: Yes

---

## 12. Error Handling Specification

All API errors return consistent JSON structures:

| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_ERROR` | Request body failed Zod schema validation. |
| `401 Unauthorized` | `UNAUTHORIZED` | Token missing, invalid, or expired. |
| `403 Forbidden` | `FORBIDDEN` | Insufficient role or access permissions. |
| `404 Not Found` | `NOT_FOUND` | Resource (ride, project, user) does not exist. |
| `409 Conflict` | `CONFLICT` | Resource already exists (e.g. duplicate email). |
| `429 Too Many Requests` | `RATE_LIMITED` | Endpoint rate limit exceeded (e.g. SOS limiter). |
| `500 Server Error` | `INTERNAL_ERROR` | Internal server exception. |

### Error Response Example:
```json
{
  "success": false,
  "message": "Invalid credentials provided",
  "error": "UNAUTHORIZED"
}
```
