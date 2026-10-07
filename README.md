# 🚕 RideSafe AI

<p align="center">
  <img src="https://img.shields.io/badge/RideSafe-AI-0A84FF?style=for-the-badge" alt="RideSafe AI"/>
  <img src="https://img.shields.io/badge/Full%20Stack-Web%20%2B%20Android-111827?style=for-the-badge" alt="Full Stack"/>
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-16A34A?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
</p>

<p align="center">
  <strong>Smart mobility. Safer rides. Connected project management.</strong><br/>
  A full-stack Web + Android prototype combining intelligent cab booking, passenger safety, AI assistance, and project/task management through one shared backend and database.
</p>

---

## 🌐 Project Vision

**RideSafe AI** is a safety-first transportation platform designed as a student/prototype full-stack system.

Instead of treating ride booking, safety, AI assistance, and project management as separate products, RideSafe connects them around a single user account:

> **Plan → Book → Match → Verify → Ride → Protect → Complete**

The platform has two clients:

- 🖥️ Web application
- 📱 Android mobile application

Both clients communicate with the **same REST API** and **same PostgreSQL database**.

---

## ✨ Core Capabilities

| Capability | Status |
|---|:---:|
| User authentication | ✅ |
| Project management | ✅ |
| Task management | ✅ |
| Dashboard analytics | ✅ |
| Search & filtering | ✅ |
| Cab booking prototype | ✅ |
| SmartMatch driver recommendation | ✅ |
| Fare estimation | ✅ |
| Driver & vehicle information | ✅ |
| 4-digit Ride PIN | ✅ |
| Visual pickup assistance | ✅ |
| Vehicle verification | ✅ |
| Safety Center | ✅ |
| SOS prototype | ✅ |
| Trusted contacts | ✅ |
| Trip sharing | ✅ |
| Route-deviation prototype | ✅ |
| AI transportation assistant | ✅ |
| Web + Android shared backend | ✅ |
| PostgreSQL relational database | ✅ |
| JWT authentication | ✅ |
| Secure mobile token storage | ✅ |
| Input validation | ✅ |
| Rate limiting | ✅ |

---

# 🎯 Product Modules

## 1. 🔐 Authentication

RideSafe uses a single account across Web and Android.

- Registration with Full Name, Email and Password
- Unique email validation
- bcrypt password hashing
- JWT authentication
- Protected routes
- Token expiration handling
- Session restoration
- Ownership authorization

Passwords are never stored or returned in plaintext.

---

## 2. 🚕 Ride Booking

Booking workflow:

```text
Pickup
  ↓
Destination
  ↓
Landmark
  ↓
Ride Type
  ↓
Fare Estimate
  ↓
SmartMatch
  ↓
Driver + Vehicle
  ↓
Ride PIN
  ↓
Active Ride
  ↓
Complete / Cancel
  ↓
Rating
```

Supported ride types:

- Mini
- Sedan
- SUV

Ride lifecycle:

```text
REQUESTED
    ↓
DRIVER_ASSIGNED
    ↓
DRIVER_ARRIVING
    ↓
DRIVER_ARRIVED
    ↓
STARTED
    ↓
COMPLETED
```

---

## 3. 🧠 SmartMatch

SmartMatch recommends a driver using a transparent rule-based scoring model.

| Factor | Weight |
|---|---:|
| Distance | 30% |
| ETA | 25% |
| Driver rating | 20% |
| Availability | 15% |
| Vehicle suitability | 10% |

Example:

```text
Arjun Kumar
★★★★☆ 4.8

Distance: 1.2 km
ETA: 4 minutes
Vehicle: Hyundai i20

SmartMatch Score
███████████████████░ 94%
```

SmartMatch is a rule-based prototype, not a machine-learning model.

---

## 4. 💰 Transparent Fare Estimation

Example:

```text
Base Fare          ₹80
Distance Component ₹120
Time Component     ₹60
────────────────────────
Estimated Fare     ₹260
```

The interface clearly labels this as an **Estimated Fare**. No real-money payment processing is implemented.

---

## 5. 📍 Landmark Pickup

Passengers can add extra pickup context.

```text
Pickup:
SRM Main Gate

Landmark:
Gate 2, beside the blue building
```

---

## 6. 📸 Visual Pickup Assistance

A passenger can capture/select a photo, add a description, and attach it to an active ride.

Example:

> “I am standing near Gate 2 beside the blue building.”

Uploaded images are intended to be protected through ride-level authorization.

---

## 7. 🔢 Ride PIN Verification

Every ride can have a unique 4-digit PIN.

```text
┌───────────────────────┐
│       RIDE PIN        │
│                       │
│          4827         │
│                       │
│ Share only when       │
│ entering the vehicle. │
└───────────────────────┘
```

The PIN is verified before the ride transitions to the started state.

---

## 8. 🚗 Driver & Vehicle Verification

Before entering the vehicle, the passenger can compare:

```text
Driver
Arjun Kumar
★★★★☆ 4.8

Vehicle
Hyundai i20
White
TN XX XX XXXX
```

Actions:

- ✅ Vehicle Matches
- ⚠️ Report Mismatch

---

# 🛡️ Safety System

## 9. Safety Center

The Safety Center is the central safety hub during an active ride.

```text
                 SAFETY CENTER
                       │
       ┌───────────────┼────────────────┐
       │               │                │
      SOS         Share Trip      Trusted Contacts
       │               │                │
       ├───────────────┼────────────────┤
       │               │                │
 Vehicle Verify     Ride PIN       Report Issue
       │
       └─────── I DON'T FEEL SAFE ───────┘
```

Available actions:

- 🚨 SOS prototype
- 🔗 Share Trip
- 👥 Trusted Contacts
- 🚘 Vehicle Verification
- 🔢 Ride PIN
- ⚠️ Report Issue
- 🆘 I Don't Feel Safe
- 📘 Safety Guidance

## 10. 🚨 SOS Prototype

The SOS workflow can:

1. Ask for confirmation
2. Create a safety event
3. Display safety guidance
4. Surface trusted contacts
5. Surface trip-sharing actions

**Prototype limitation:** this project does not claim direct police, ambulance, or emergency-authority integration.

## 11. 👥 Trusted Contacts

Fields:

- Name
- Phone
- Relationship

Only the authenticated user's trusted contacts are accessible.

## 12. 🔗 Trip Sharing

Controlled trip information can include:

- Driver
- Vehicle
- Pickup
- Destination
- Ride status
- Estimated arrival

Sensitive authentication information is never included.

## 13. 🧭 Route Deviation Prototype

```mermaid
flowchart LR
    A[Expected Route] --> C[Route Monitor]
    B[Simulated Current Route] --> C
    C --> D{Significant Deviation?}
    D -->|No| E[Continue Ride]
    D -->|Yes| F[Potential Route Deviation]
    F --> G[Safety Center]
    F --> H[Share Trip]
    F --> I[Trusted Contact]
```

This is a prototype route-deviation feature, not production-grade GPS safety.

---

# 🤖 AI Assistant

## RideSafe AI Assistant

The assistant can help with:

- Ride booking
- Pickup problems
- Driver information
- Ride status
- Fare explanations
- Safety guidance
- Ride PIN guidance
- Vehicle verification
- Trusted contacts
- Transportation questions
- Project/task assistance

### AI request architecture

```text
Web / Android
      │
      ▼
POST /api/ai/chat
      │
      ▼
Backend AI Service
      │
      ▼
LLM Provider
      │
      ▼
Safe Response
      │
      ▼
Web / Android
```

**The LLM API key must remain on the backend.**

---

# 📊 Unified Dashboard

The dashboard combines the mandatory project-management statistics with RideSafe mobility/safety statistics.

### Project metrics

- Total Projects
- Total Tasks
- Completed Tasks
- Pending Tasks
- Projects In Progress

### Ride metrics

- Total Rides
- Completed Rides
- Active Rides
- Cancelled Rides
- Average Rating
- Safety Events

```text
                 RIDESAFE DASHBOARD
                        │
          ┌─────────────┴─────────────┐
          │                           │
      MANAGEMENT                   MOBILITY
          │                           │
   ┌──────┼──────┐              ┌─────┼─────┐
   │      │      │              │     │     │
Projects Tasks Progress        Rides Safety Ratings
```

---

# 📁 Project & Task Management

Project management is a first-class feature.

## Projects

Fields:

- Project Name
- Description
- Status
- Start Date
- End Date
- Created Date

Statuses:

- Not Started
- In Progress
- Completed

## Tasks

Fields:

- Task Name
- Description
- Priority
- Status
- Due Date
- Created Date

Priorities:

- Low
- Medium
- High

Statuses:

- Pending
- In Progress
- Completed

### Example RideSafe project

```text
Project:
Chennai Airport Trip

Tasks:

✓ Book Cab
✓ Verify Driver
✓ Send Pickup Photo
○ Start Ride
○ Reach Destination
```

This makes the project-management requirement a natural part of RideSafe rather than an unrelated CRUD module.

---

# 🔎 Search & Filtering

### Projects

- Search by project name
- Filter by status

### Tasks

- Search by task name
- Filter by status
- Filter by priority

### Rides

- Search ride history
- Filter by status
- Filter by date

---

# 📱 Android Application

The Android client is a real mobile application rather than a scaled-down website.

Suggested navigation:

```text
Home
Rides
Projects
Safety
Profile
```

Additional screens:

- Book Ride
- SmartMatch
- Ride Details
- Active Ride
- Pickup Assistance
- Safety Center
- Trusted Contacts
- Ride History
- Project Details
- Task Details
- AI Assistant

### Secure authentication

JWT is stored using secure device storage such as **Expo SecureStore**, not plain local storage.

---

# 🔄 Cross-Platform Synchronization

The same account, backend, and database power both clients.

```mermaid
sequenceDiagram
    participant W as Web
    participant API as Express API
    participant DB as PostgreSQL
    participant M as Android

    W->>API: Login
    API->>DB: Verify user
    DB-->>API: User
    API-->>W: JWT

    W->>API: Create Project
    API->>DB: INSERT project
    DB-->>API: Project
    API-->>W: Project created

    M->>API: Login with same account
    API->>DB: Verify user
    DB-->>API: User
    API-->>M: JWT

    M->>API: GET /api/projects
    API->>DB: SELECT user's projects
    DB-->>API: Same project
    API-->>M: Project

    M->>API: Update Task
    API->>DB: UPDATE task
    DB-->>API: Updated task

    W->>API: Refresh
    API->>DB: SELECT task
    DB-->>API: Updated task
    API-->>W: IN_PROGRESS
```

---

# 🏗️ System Architecture

```mermaid
flowchart TB
    WEB[🖥️ React Web App]
    MOBILE[📱 React Native Android]

    WEB --> API[⚙️ Node.js + Express REST API]
    MOBILE --> API

    API --> AUTH[🔐 JWT + bcrypt]
    API --> VALIDATE[✅ Zod Validation]
    API --> SERVICES[🧩 Service Layer]
    API --> SECURITY[🛡️ Helmet + CORS + Rate Limiting]

    SERVICES --> PRISMA[Prisma ORM]
    PRISMA --> DB[(PostgreSQL)]

    SERVICES --> AI[🤖 AI Service]
    SERVICES --> FILES[📸 Protected Uploads]
```

---

# 🌊 Data Flow

```mermaid
flowchart LR
    U[User] --> C[Web / Android Client]
    C --> A[REST API]
    A --> M[Authentication Middleware]
    M --> V[Validation]
    V --> S[Business Services]
    S --> P[Prisma]
    P --> D[(PostgreSQL)]
    D --> P
    P --> S
    S --> A
    A --> C
    C --> U
```

---

# 🗃️ Database Design

Core entities:

```text
User
 ├── Projects
 │     └── Tasks
 │
 ├── Rides
 │     ├── PickupPhotos
 │     ├── SafetyEvents
 │     ├── TripShares
 │     └── RideRatings
 │
 ├── TrustedContacts
 │
 └── ChatSessions
       └── ChatMessages

Driver
 ├── Vehicle
 └── Rides
```

## ER Diagram

```mermaid
erDiagram
    USER ||--o{ PROJECT : owns
    PROJECT ||--o{ TASK : contains
    USER ||--o{ RIDE : books
    DRIVER ||--|| VEHICLE : operates
    DRIVER ||--o{ RIDE : assigned_to
    RIDE ||--o{ PICKUP_PHOTO : contains
    RIDE ||--o{ SAFETY_EVENT : generates
    RIDE ||--o| RIDE_RATING : receives
    RIDE ||--o| TRIP_SHARE : shares
    USER ||--o{ TRUSTED_CONTACT : manages
    USER ||--o{ CHAT_SESSION : starts
    CHAT_SESSION ||--o{ CHAT_MESSAGE : contains

    USER {
        string id PK
        string fullName
        string email UK
        string passwordHash
        datetime createdAt
        datetime updatedAt
    }

    PROJECT {
        string id PK
        string userId FK
        string name
        string description
        string status
        date startDate
        date endDate
        datetime createdAt
    }

    TASK {
        string id PK
        string projectId FK
        string userId FK
        string name
        string description
        string priority
        string status
        date dueDate
        datetime createdAt
    }

    DRIVER {
        string id PK
        string name
        float rating
        int rideCount
        string availability
    }

    VEHICLE {
        string id PK
        string driverId FK
        string model
        string vehicleNumber
        string color
        string type
    }

    RIDE {
        string id PK
        string userId FK
        string driverId FK
        string pickup
        string destination
        string landmark
        string rideType
        string status
        decimal estimatedFare
        datetime createdAt
    }

    PICKUP_PHOTO {
        string id PK
        string rideId FK
        string imagePath
        string description
        datetime createdAt
    }

    SAFETY_EVENT {
        string id PK
        string rideId FK
        string type
        string description
        datetime createdAt
    }

    TRUSTED_CONTACT {
        string id PK
        string userId FK
        string name
        string phone
        string relationship
    }

    RIDE_RATING {
        string id PK
        string rideId FK
        string userId FK
        string driverId FK
        int rating
        string review
    }

    TRIP_SHARE {
        string id PK
        string rideId FK
        string shareToken
        datetime expiresAt
    }

    CHAT_SESSION {
        string id PK
        string userId FK
        datetime createdAt
    }

    CHAT_MESSAGE {
        string id PK
        string sessionId FK
        string role
        string content
        datetime createdAt
    }
```

---

# 🧩 Technology Stack

## Web

| Technology | Purpose |
|---|---|
| React | UI |
| TypeScript | Type safety |
| Vite | Build tooling |
| Tailwind CSS | Styling |
| React Router | Navigation |
| Axios | API communication |
| React Hook Form | Forms |
| Zod | Validation |
| Recharts | Analytics |
| Lucide React | Icons |

## Mobile

| Technology | Purpose |
|---|---|
| React Native | Android |
| Expo | Mobile tooling |
| TypeScript | Type safety |
| React Navigation | Navigation |
| Expo SecureStore | Secure JWT storage |
| Expo Image Picker | Pickup photos |
| Axios | API communication |

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express | REST API |
| TypeScript | Type safety |
| Prisma | ORM |
| JWT | Authentication |
| bcrypt | Password hashing |
| Zod | Validation |
| Helmet | Security headers |
| CORS | Cross-origin security |
| express-rate-limit | Rate limiting |

## Database

**PostgreSQL**

Normalized relational design with foreign-key relationships.

---

# 🔐 Security Architecture

```mermaid
flowchart TD
    R[Request] --> CORS[CORS]
    CORS --> RATE[Rate Limiter]
    RATE --> AUTH[JWT Authentication]
    AUTH --> OWN[Ownership Authorization]
    OWN --> VAL[Zod Validation]
    VAL --> CTRL[Controller]
    CTRL --> SERVICE[Service Layer]
    SERVICE --> ORM[Prisma ORM]
    ORM --> DB[(PostgreSQL)]
```

### Security principles

- 🔐 bcrypt password hashing
- 🎫 JWT authentication
- 🛂 Protected routes
- 👤 Ownership checks
- 🧪 Backend input validation
- 🛡️ Helmet security headers
- 🚦 Authentication rate limiting
- 🌐 Controlled CORS
- 💉 Prisma/parameterized database access
- 📱 Secure mobile token storage
- 🔑 Backend-only AI API key
- 📸 Protected pickup uploads
- 🚫 No plaintext passwords
- 🚫 No sensitive credentials in responses

---

# 📡 API Reference

## Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Current user |

## Projects

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/projects | List projects |
| GET | /api/projects/:id | Project details |
| POST | /api/projects | Create project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |

## Tasks

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/tasks | List tasks |
| GET | /api/tasks/:id | Task details |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |

## Dashboard

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/dashboard | User dashboard |

## RideSafe

```text
GET    /api/rides
GET    /api/rides/:id
POST   /api/rides
PUT    /api/rides/:id
POST   /api/rides/:id/cancel
POST   /api/rides/:id/start
POST   /api/rides/:id/complete
POST   /api/rides/:id/verify-pin

GET    /api/drivers
GET    /api/drivers/:id
POST   /api/smartmatch
GET    /api/vehicles/:id

POST   /api/rides/:id/pickup-photo
GET    /api/rides/:id/pickup-photo

GET    /api/rides/:id/safety
POST   /api/rides/:id/safety-event
POST   /api/rides/:id/sos

GET    /api/trusted-contacts
POST   /api/trusted-contacts
PUT    /api/trusted-contacts/:id
DELETE /api/trusted-contacts/:id

POST   /api/rides/:id/share
GET    /api/rides/:id/share
POST   /api/rides/:id/route-check
POST   /api/ai/chat
POST   /api/rides/:id/rating
```

---

# 📂 Repository Structure

```text
RIDESAFE-AI/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   └── .env.example
│
├── web/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   └── .env.example
│
├── mobile/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── services/
│   │   ├── storage/
│   │   └── types/
│   └── .env.example
│
├── docs/
│   ├── API.md
│   ├── Architecture.md
│   ├── ER-Diagram.md
│   ├── Security.md
│   └── Deployment.md
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# ⚙️ Local Setup

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL 15+
- Git
- Expo / Expo Go
- Android Studio for local Android development
- Docker Desktop (optional)

## 1. Clone

```bash
git clone https://github.com/ashutosh2453/RIDESAFE-AI-Smart-Safety-First-Cab-Booking-Project-Management-Platform.git
cd RIDESAFE-AI-Smart-Safety-First-Cab-Booking-Project-Management-Platform
```

## 2. PostgreSQL

Create the database:

```sql
CREATE DATABASE ridesafe;
```

Backend environment:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ridesafe"
```

Then:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
```

If a seed script exists:

```bash
npx prisma db seed
```

## 3. Backend

Create `.env` inside `backend/`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ridesafe"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="1d"
CORS_ORIGIN="http://localhost:5173"
AI_API_KEY="your-server-side-key"
```

Run:

```bash
npm run dev
```

Backend:

`http://localhost:5000`

## 4. Web

```bash
cd web
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run:

```bash
npm run dev
```

Open:

`http://localhost:5173`

## 5. Android

```bash
cd mobile
npm install
```

Create `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:5000/api
```

For a physical Android device, use your computer's LAN IP instead of `localhost`.

Start Expo:

```bash
npx expo start
```

---

# 🔄 Cross-Platform Demo

### Web

1. Register
2. Login
3. Create a project
4. Create a task
5. Book a ride

### Android

1. Login with the same account
2. Pull to refresh
3. Confirm the project appears
4. Confirm the task appears
5. Change the task status

### Web

Refresh the page and verify the task changed.

This demonstrates:

```text
WEB
 ↓
SAME REST API
 ↓
SAME POSTGRESQL DATABASE
 ↓
ANDROID
```

---

# 🐳 Docker

If Docker support is configured:

```bash
docker compose up -d
docker compose ps
```

Stop:

```bash
docker compose down
```

---

# 🚀 Deployment

Recommended production architecture:

```text
                         Internet
                            │
              ┌─────────────┴─────────────┐
              │                           │
          Web Hosting                Android App
              │                           │
              └───────────┬───────────────┘
                          │
                          ▼
                   Backend Hosting
                          │
                          ▼
                    PostgreSQL
```

Production Web:

```env
VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api
```

Production Android:

```env
EXPO_PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN/api
```

Production backend:

```env
CORS_ORIGIN=https://YOUR-WEB-DOMAIN
DATABASE_URL=YOUR_PRODUCTION_DATABASE_URL
JWT_SECRET=YOUR_PRODUCTION_SECRET
AI_API_KEY=YOUR_SERVER_SIDE_AI_KEY
```

Never commit production secrets.

---

# 🧪 Testing Checklist

### Authentication
- [ ] Register
- [ ] Duplicate email rejected
- [ ] Login
- [ ] Invalid credentials rejected
- [ ] Logout
- [ ] Expired JWT handled

### Projects
- [ ] Create
- [ ] View
- [ ] Update
- [ ] Delete
- [ ] Search
- [ ] Filter

### Tasks
- [ ] Create
- [ ] Edit
- [ ] Delete
- [ ] Complete
- [ ] Search
- [ ] Status filter
- [ ] Priority filter

### RideSafe
- [ ] Book ride
- [ ] Fare estimate
- [ ] SmartMatch
- [ ] Driver details
- [ ] Vehicle verification
- [ ] Ride PIN
- [ ] Pickup photo
- [ ] Safety Center
- [ ] Trusted contacts
- [ ] Trip sharing
- [ ] Route deviation
- [ ] AI assistant
- [ ] Rating

### Cross-platform
- [ ] Web → Android synchronization
- [ ] Android → Web synchronization
- [ ] Pull-to-refresh
- [ ] Secure token storage
- [ ] Network error handling

---

# 📈 Product Scope

```mermaid
pie title RideSafe AI Capability Areas
    "Project & Task Management" : 20
    "Ride Booking & SmartMatch" : 20
    "Safety & Verification" : 25
    "AI Assistant" : 10
    "Authentication & Security" : 15
    "Cross-platform Experience" : 10
```

*The chart represents conceptual product scope, not measured production usage.*

---

# 🧭 End-to-End User Journey

```mermaid
flowchart TD
    START([Start]) --> AUTH{Authenticated?}

    AUTH -->|No| LOGIN[Login / Register]
    LOGIN --> DASH[Dashboard]
    AUTH -->|Yes| DASH[Dashboard]

    DASH --> BOOK[Book Ride]
    BOOK --> FARE[Fare Estimate]
    FARE --> MATCH[SmartMatch]
    MATCH --> VERIFY[Driver + Vehicle Verification]
    VERIFY --> PIN[Ride PIN]
    PIN --> ACTIVE[Active Ride]

    ACTIVE --> PICKUP[Pickup Assistance]
    ACTIVE --> SAFETY[Safety Center]
    ACTIVE --> SHARE[Share Trip]
    ACTIVE --> COMPLETE[Complete Ride]

    COMPLETE --> RATE[Rate Driver]
    RATE --> HISTORY[Ride History]

    DASH --> PROJECTS[Projects]
    PROJECTS --> TASKS[Tasks]
    TASKS --> PROGRESS[Track Progress]

    DASH --> AI[RideSafe AI Assistant]
```

---

# 🧠 Design Principles

### Safety-first
Safety controls remain accessible during an active ride.

### Privacy by design
Users can only access resources they own or are authorized to access.

### One source of truth
Web and Android use the same API and PostgreSQL database.

### Transparent intelligence
SmartMatch exposes the factors used for recommendations.

### Human-centered AI
The AI assistant provides guidance without pretending to be an emergency service.

### Prototype honesty
Simulated functionality is clearly identified as simulated.

---

# 🎬 Suggested 5-Minute Demo

```text
00:00  Login / Registration
00:30  Dashboard
01:00  Create Project
01:30  Create Task
02:00  Book Ride
02:30  SmartMatch + Fare
03:00  Driver + Vehicle Verification
03:20  Ride PIN + Pickup Assistance
03:40  Safety Center
04:00  Android Login
04:20  Pull-to-refresh
04:35  Same Project + Task
04:50  Modify Task on Android
05:00  Verify update on Web
```

---

# 🏆 Assignment Mapping

| Requirement | RideSafe Implementation |
|---|---|
| Registration | JWT + bcrypt |
| Login | Protected authentication |
| Logout | Session/token termination |
| Projects CRUD | Project Management |
| Tasks CRUD | Task Management |
| Dashboard | Unified analytics |
| Search | Projects, tasks, rides |
| Filtering | Status, priority, ride status |
| Web | React + Vite |
| Android | React Native + Expo |
| Shared backend | Express REST API |
| Shared database | PostgreSQL |
| Security | JWT, bcrypt, validation, rate limiting |
| API | REST architecture |
| Documentation | README + docs |
| ER Diagram | Mermaid ER model |
| Deployment | Production configuration |
| Cross-platform sync | Shared API + PostgreSQL |

---

# ⚠️ Prototype Disclaimer

RideSafe AI is an educational/student prototype.

It uses test data and simulated components where production integrations are unavailable.

It does not provide:

- Real emergency dispatch
- Guaranteed physical safety
- Guaranteed driver identity
- Production-grade GPS safety
- Real payment processing
- Guaranteed route-deviation detection

Do not use this prototype as a substitute for real emergency services or professional safety systems.

---

# 👨‍💻 Developer

**Ashutosh Chauhan**

GitHub: https://github.com/ashutosh2453

Repository: https://github.com/ashutosh2453/RIDESAFE-AI-Smart-Safety-First-Cab-Booking-Project-Management-Platform

---

<p align="center">
  <strong>🚕 RideSafe AI</strong><br/>
  <em>Move smarter. Ride safer.</em>
</p>
