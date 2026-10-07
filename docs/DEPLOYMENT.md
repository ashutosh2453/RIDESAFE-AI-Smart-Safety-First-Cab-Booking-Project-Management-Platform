# 🚀 RideSafe AI — Vercel Production Deployment Guide

This guide provides the complete, battle-tested procedure for deploying the **RideSafe AI** full-stack platform (Web Frontend + Express REST API Backend) on **Vercel** using **Vercel Services** multi-service architecture, backed by a remote PostgreSQL database.

---

## 🏛️ Deployment Architecture Overview

```
                      ┌──────────────────────────────────────────┐
                      │              VERCEL PLATFORM             │
                      │                                          │
                      │   Public Domain:                         │
                      │   https://your-ridesafe-domain.vercel.app │
                      │                                          │
                      │  ┌────────────────────────────────────┐  │
Browser (Web Client) ─┼─►│ 🌐 Service 2: "web" (Vite / React) │  │
                      │  │    Root: web/                      │  │
                      │  │    Public Route: /(.*)             │  │
                      │  └────────────────────────────────────┘  │
                      │                     │                    │
                      │                     │ /api/* (Rewritten) │
                      │                     ▼                    │
                      │  ┌────────────────────────────────────┐  │
Android Mobile App ───┼─►│ 🔧 Service 1: "backend" (Express) │  │
                      │  │    Root: backend/                  │  │
                      │  │    Public Route: /api/(.*)         │  │
                      │  └────────────────────────────────────┘  │
                      └─────────────────────┬────────────────────┘
                                            │ Prisma ORM
                                            ▼
                           ┌──────────────────────────────────┐
                           │   🐘 Managed PostgreSQL          │
                           │   (Neon, Supabase, AWS RDS, etc.)│
                           └──────────────────────────────────┘
```

---

## 📋 Vercel Services Configuration (`vercel.json`)

RideSafe AI uses native **Vercel Services** defined in [vercel.json](file:///c:/Users/ashut/Music/ISMOBIOPHOTONIC/vercel.json):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "backend": {
      "root": "backend",
      "framework": "express"
    },
    "web": {
      "root": "web",
      "framework": "vite"
    }
  },
  "rewrites": [
    {
      "source": "/api",
      "destination": {
        "service": "backend"
      }
    },
    {
      "source": "/api/(.*)",
      "destination": {
        "service": "backend"
      }
    },
    {
      "source": "/(.*)",
      "destination": {
        "service": "web"
      }
    }
  ]
}
```

### Routing Rules Explained:
1. **`/api` and `/api/*`**: Routed with priority directly to the `backend` Express service.
2. **`/(.*)`**: All other browser requests fall through to the `web` Vite/React service.
3. **No Internal Service Bindings Required**: The backend does not call any other internal microservices in Vercel.

---

## 🐘 1. Database Setup (Remote PostgreSQL)

Vercel Serverless Functions require a remotely accessible cloud PostgreSQL database.

Recommended cloud database providers:
- **Neon Serverless Postgres** (Recommended for Vercel): [https://neon.tech](https://neon.tech)
- **Supabase**: [https://supabase.com](https://supabase.com)
- **AWS RDS / DigitalOcean Managed Databases**

### Connection String Format:
```env
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require"
```

### Initializing the Schema & Seed Data:
Before triggering your first Vercel deployment, push the Prisma schema and seed initial demo data from your local machine (or CI pipeline):

```bash
cd backend

# Point to your production remote database temporarily:
export DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require"

# Generate client and push schema tables:
npx prisma generate
npx prisma db push

# (Optional) Seed demo user, 8 verified drivers, and sample projects:
npm run prisma:seed
```

---

## ⚙️ 2. Environment Variables Configuration

Set these environment variables in your **Vercel Project Settings ➔ Environment Variables**:

### Backend Service Variables:
| Variable Name | Environment | Description / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Production, Preview | Remote PostgreSQL connection string with SSL (`sslmode=require`). |
| `JWT_SECRET` | Production, Preview | Strong random 64-character secret string. |
| `JWT_EXPIRES_IN`| Production, Preview | Token lifespan (e.g., `7d` or `24h`). |
| `CORS_ORIGIN` | Production, Preview | Comma-separated allowed origins (e.g., `https://your-domain.vercel.app`). |
| `AI_API_KEY` | Production, Preview | *(Optional)* OpenAI / LLM API key for assistant. Falls back to built-in rules if omitted. |
| `NODE_ENV` | Production | Set to `production`. |

### Web Service Variables:
| Variable Name | Environment | Description / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Production, Preview | Set to `/api` so API calls seamlessly route to the backend on the same domain. |

> [!IMPORTANT]
> Never set `AI_API_KEY` or `JWT_SECRET` on the `web` service. Only provide them to the `backend` service.

---

## 🚢 3. Step-by-Step Vercel Deployment

### Option A: Via GitHub Integration (Recommended)
1. Push your code to GitHub:
   ```bash
   git push origin main
   ```
2. Navigate to [Vercel Dashboard](https://vercel.com/new).
3. Click **"Import Project"** and select repository:
   `ashutosh2453/RIDESAFE-AI-Smart-Safety-First-Cab-Booking-Project-Management-Platform`
4. Vercel automatically detects the multi-service architecture from [vercel.json](file:///c:/Users/ashut/Music/ISMOBIOPHOTONIC/vercel.json).
5. Add the required Environment Variables in the project settings.
6. Click **Deploy**.

### Option B: Via Vercel CLI
```bash
# Link repository
vercel link

# Push environment variables
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
vercel env add VITE_API_URL production

# Deploy to Production
vercel --prod
```

---

## 📱 4. Android Mobile Application Configuration

The Android application is **NOT deployed as a Vercel service**. It runs natively on devices and consumes the deployed Vercel backend.

### Setting the Production API URL:
In `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=https://your-production-domain.vercel.app/api
```

### Building the Mobile Binary:
```bash
cd mobile
npm install --legacy-peer-deps

# Build standalone Android APK via EAS:
npx eas-cli build -p android --profile preview
```

Passengers can also adjust or confirm the backend URL inside the mobile app login screen under **"⚙️ Server Connection Settings"**.

---

## 🔍 5. Verification & Health Check

After deployment completes, verify both services:

### 1. Backend REST API Health Check:
```bash
curl -i https://your-production-domain.vercel.app/api/health
```
**Expected Response `200 OK`**:
```json
{
  "status": "online",
  "ok": true,
  "platform": "RideSafe AI Engine",
  "timestamp": "2026-10-08T00:15:00.000Z"
}
```

### 2. Authentication Test:
```bash
curl -X POST https://your-production-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@ridesafe.ai","password":"Demo@1234"}'
```

### 3. Web Client Verification:
Open `https://your-production-domain.vercel.app` in any modern web browser to confirm that the React/Vite single-page application loads with complete styling and interactive components.

---

## ⚠️ 6. Production Considerations & Limitations

### Persistent File Uploads
- In Vercel serverless environments, local filesystem access is ephemeral (`/tmp`). Files written to `/tmp` will not persist across function invocations or cold starts.
- For production photo uploads (such as surroundings visual assistance images), configure an external cloud object storage provider (such as **AWS S3**, **Cloudflare R2**, or **Supabase Storage**) in a subsequent release.

### Database Connection Pooling
- Serverless functions spawn multiple concurrent instances. To avoid exhausting connection limits on PostgreSQL, use a connection pooler URL (e.g. Neon connection pooling on port 6543 / pgbouncer) in `DATABASE_URL`.
