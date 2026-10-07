# RideSafe AI — Production Deployment Guide

This guide details recommended deployment strategies across cloud providers (Vercel, Render, Railway, AWS, DigitalOcean) and Docker containerization.

---

## 1. Environment Configurations

### Backend (`/backend/.env`)
```ini
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://user:password@db-host:5432/ridesafe_ai?sslmode=require"
JWT_SECRET="generate-a-strong-64-char-random-secret"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="https://ridesafe-ai.vercel.app,https://yourdomain.com"
UPLOAD_DIR="./uploads"
AI_API_KEY="your-gemini-or-openai-api-key"
```

### Web (`/web/.env`)
```ini
VITE_API_URL=https://api.yourdomain.com/api
```

---

## 2. Docker Deployment

### 2.1 Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 5000
CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]
```

### 2.2 Web Dockerfile (`web/Dockerfile`)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 3. Cloud Provider Quick Deploy

### Backend on Render / Railway
1. Create a new Web Service pointing to repository subfolder `backend`.
2. Attach a managed **PostgreSQL** instance.
3. Set environment variable `DATABASE_URL` to the Postgres connection string.
4. Set Build Command: `npm install && npx prisma generate && npx prisma db push && npm run build`
5. Set Start Command: `npm start` (or `node dist/server.js`)

### Frontend on Vercel
1. Import the Git repository in Vercel.
2. Set Root Directory to `web`.
3. Set Framework Preset to **Vite**.
4. Set Environment Variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`.
5. Deploy.
