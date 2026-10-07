# RideSafe AI — REST API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require an HTTP `Authorization` header formatted as:
```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. System Health & Diagnostics

### `GET /health`
Returns the status of the RideSafe AI backend server.

- **Auth Required**: No
- **Response `200 OK`**:
```json
{
  "status": "online",
  "platform": "RideSafe AI Engine",
  "timestamp": "2026-10-08T00:15:00.000Z"
}
```

---

## 2. Authentication & User Profile (`/auth`)

### `POST /auth/register`
Registers a new passenger user.

- **Auth Required**: No
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password@123",
  "phoneNumber": "+919876543210"
}
```
- **Response `201 Created`**:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "c1f7a0b3-96b4-4e4b-b0b3-1e5b871c42f0",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "PASSENGER"
  }
}
```

### `POST /auth/login`
Authenticates an existing user and issues a JWT token.

- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "demo@ridesafe.ai",
  "password": "Demo@1234"
}
```
- **Response `200 OK`**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u-demo-passenger-001",
    "name": "Demo Passenger",
    "email": "demo@ridesafe.ai",
    "role": "PASSENGER"
  }
}
```

### `GET /auth/profile`
Retrieves current authenticated user's profile and settings.

- **Auth Required**: Yes (`Bearer <token>`)
- **Response `200 OK`**:
```json
{
  "user": {
    "id": "u-demo-passenger-001",
    "name": "Demo Passenger",
    "email": "demo@ridesafe.ai",
    "phoneNumber": "+919876543210",
    "role": "PASSENGER"
  }
}
```

---

## 3. Cab Booking & Ride Management (`/rides`)

### `POST /rides` (or `POST /rides/book`)
Books a ride, automatically calculates dynamic fare, assigns the optimal nearby driver via the SmartMatch ranking algorithm, and issues a 4-digit security PIN.

- **Auth Required**: Yes
- **Request Body**:
```json
{
  "pickupLocation": "SRM University, Gate 1, Kattankulathur",
  "destination": "Chennai International Airport, Terminal 2",
  "vehicleType": "SEDAN",
  "pickupLandmark": "Beside the campus clocktower",
  "pickupLat": 12.823,
  "pickupLng": 80.044,
  "destLat": 12.994,
  "destLng": 80.170,
  "projectId": "p-demo-01"
}
```
- **Response `201 Created`**:
```json
{
  "ride": {
    "id": "r-7b81b29a-2cf4-455b-8eb1-46da09230531",
    "status": "REQUESTED",
    "verificationPin": "4819",
    "pickupLocation": "SRM University, Gate 1, Kattankulathur",
    "destination": "Chennai International Airport, Terminal 2",
    "vehicleType": "SEDAN",
    "fare": 721.50,
    "distanceKm": 28.5,
    "durationMinutes": 45,
    "driver": {
      "id": "d-rajesh",
      "name": "Rajesh Kumar",
      "rating": 4.9,
      "totalRides": 1420,
      "vehicle": {
        "model": "Honda City (White)",
        "plateNumber": "TN 09 BK 4021"
      }
    }
  }
}
```

### `GET /rides`
Lists rides for the authenticated passenger with optional pagination and status filtering.

- **Auth Required**: Yes
- **Query Params**: `status` (optional), `limit` (default: 20)

### `GET /rides/:id`
Fetches complete details for a specific ride including driver, vehicle, and safety metadata.

### `POST /rides/:id/verify-pin`
Validates the 4-digit ride verification PIN.

- **Request Body**:
```json
{
  "pin": "4819"
}
```
- **Response `200 OK`**:
```json
{
  "message": "Ride PIN verified successfully. Ride started.",
  "status": "STARTED"
}
```

### `POST /rides/:id/verify-vehicle`
Submits the pre-boarding vehicle checklist.

- **Request Body**:
```json
{
  "isPlateVerified": true,
  "isModelVerified": true,
  "isColorVerified": true,
  "isDriverPhotoVerified": true
}
```

### `POST /rides/:id/route-check`
Evaluates simulated GPS corridor deviation against the planned travel route.

- **Request Body**:
```json
{
  "currentLat": 12.835,
  "currentLng": 80.058
}
```
- **Response `200 OK`**:
```json
{
  "deviationMeters": 45,
  "isDeviationDetected": false,
  "alertLevel": "NORMAL"
}
```

### `POST /rides/:id/sos`
Initiates an immediate Emergency SOS protocol.

- **Response `200 OK`**:
```json
{
  "message": "Emergency SOS protocol initiated",
  "incidentId": "inc-4a9f2...",
  "trustedContactsNotified": 2,
  "status": "SOS_BROADCASTED"
}
```

### `POST /rides/:id/share`
Generates a public URL and share code for family/friends to track the ride.

- **Response `200 OK`**:
```json
{
  "shareCode": "RS-8921-X",
  "shareUrl": "http://localhost:5173/track/RS-8921-X"
}
```

---

## 4. Drivers & SmartMatch Scoring (`/drivers`)

### `GET /drivers`
Lists verified active drivers with ratings, availability, and vehicle details.

### `POST /drivers/smartmatch`
Runs the algorithmic scoring engine against available drivers for given trip parameters without booking.

---

## 5. Trusted Contacts & Safety Hub (`/contacts`)

- `GET /contacts`: Retrieves list of emergency contacts.
- `POST /contacts`: Adds a contact (`name`, `phoneNumber`, `relationship`).
- `DELETE /contacts/:id`: Removes a contact.

---

## 6. Transportation Project & Task Management (`/projects` & `/tasks`)

- `GET /projects`: List trip projects.
- `POST /projects`: Create a trip project (`title`, `description`, `category`).
- `GET /tasks`: List checklist items.
- `POST /tasks`: Create a task (`title`, `priority`, `projectId`).
- `PATCH /tasks/:id`: Toggle completion or update priority.

---

## 7. RideSafe AI Assistant (`/ai`)

### `POST /ai/chat`
Interacts with the RideSafe AI travel and safety assistant.

- **Request Body**:
```json
{
  "message": "How does the 4-digit PIN verification protect me?"
}
```
- **Response `200 OK`**:
```json
{
  "reply": "🔢 The 4-digit PIN verification ensures you never enter the wrong vehicle. Before starting the trip, your driver must enter this code, confirming mutual identity and ride authentication."
}
```
