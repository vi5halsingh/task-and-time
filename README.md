# Suntek Tracker — Task & Time Tracking App

A full-stack, production-ready productivity and time-tracking application designed with a restrained, mature UI and robust real-time tracking engine. Built with React, Vite, Node.js, Express, PostgreSQL, Prisma, Recharts, and Google Gemini AI.

---

## 🌐 Live URLs & Demo Credentials

- **Live Frontend**: `https://<your-vercel-app>.vercel.app` *(Replace with deployed Vercel URL)*
- **Live Backend API**: `https://<your-render-service>.onrender.com` *(Replace with deployed Render URL)*

### Demo Account
- **Email**: `alex@example.com`
- **Password**: `Password123!`

*(Or register a new account on the live app)*

---

## ✨ Features

1. **Authentication & Authorization**:
   - Secure registration, login, logout, and persistent session recovery (`/api/auth/me`).
   - Secure HTTP-only cookies (`auth_token`) with cross-site `SameSite=None; Secure` configuration for deployed production environments and `SameSite=Lax` for local development.
   - Passwords hashed with `bcryptjs`.

2. **Task Management**:
   - Task CRUD with title, description, and status (`PENDING`, `IN_PROGRESS`, `COMPLETED`).
   - Natural language input with instant AI expansion.
   - Real-time client-side search and status filter tabs with task counts.
   - Modal-based editing and safe deletion with cascade guarantees.

3. **Google Gemini AI Task Enhancement**:
   - Transforms rough natural-language notes (e.g. *"fix auth bug before demo"*) into structured, professional task titles and actionable descriptions.
   - Resilient architecture: dynamically loads environment keys with built-in heuristic fallback parsing if API keys are exhausted.

4. **Real-Time Time Tracking Engine**:
   - Live persistent timer that tracks elapsed seconds directly against server timestamps.
   - Strict single active timer constraint per user enforced atomically at the database level.
   - Starting a timer on a `PENDING` task automatically transitions it to `IN_PROGRESS`.
   - Multi-tab synchronization via browser `BroadcastChannel`.
   - Time tracking history log modal with duration formatting and log deletion.

5. **Daily Productivity Summary & Analytics**:
   - Timezone-aware daily aggregation (`GET /api/analytics/daily-summary?date=YYYY-MM-DD`).
   - Precise midnight-crossing boundary clipping: sessions spanning midnight (e.g., 23:30 to 01:00) count accurately toward each day without double-counting.
   - Interactive date selector with Previous/Next day navigation.
   - Key productivity metrics (Total tracked time, tasks worked on, completed tasks, active tasks).
   - Clean Recharts time distribution bar chart.
   - Tasks worked on breakdown with relative proportion progress bars.

6. **Restrained, Professional UI/UX**:
   - Built to feel like a mature productivity tool — subtle surfaces, clean typography, accessible contrast, and zero AI-generated visual clutter.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, TanStack Query v5, Axios, React Router v7, Recharts, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, Zod, JWT, Cookie-Parser, CORS, Bcryptjs |
| **Database** | PostgreSQL (Neon serverless for production, local Docker/Postgres for dev) |
| **AI** | Google Gemini API (`@google/genai`) |
| **Hosting** | Vercel (Frontend SPA) + Render (Backend Web Service) |

---

## 📁 Repository Architecture

```
suntek/
├── client/                     # Frontend Single Page App (Vite + React + TS)
│   ├── src/
│   │   ├── components/         # Reusable components (AppHeader, ActiveTimerBar, TaskCard, etc.)
│   │   ├── context/            # Global AuthContext & TimerContext
│   │   ├── pages/              # LoginPage, RegisterPage, TaskDashboard, DailySummaryPage
│   │   ├── services/           # Axios API services (auth, task, timeLog, analytics)
│   │   ├── types/              # TypeScript interfaces & DTOs
│   │   ├── App.tsx             # Root router with ProtectedRoute
│   │   └── main.tsx            # Application entrypoint
│   ├── vercel.json             # SPA client-side rewrite rules for Vercel
│   ├── .env.example            # Frontend environment variable template
│   └── package.json
│
├── server/                     # Backend REST API (Node.js + Express + TS)
│   ├── src/
│   │   ├── controllers/        # Route handlers (auth, task, timeLog, analytics)
│   │   ├── middlewares/        # requireAuth, errorHandler, validateBody
│   │   ├── routes/             # Express routers
│   │   ├── services/           # Business logic, time calculations & Gemini AI
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── types/              # Backend TypeScript types
│   │   ├── lib/                # Prisma client & JWT utilities
│   │   └── index.ts            # Server entrypoint with CORS & reverse-proxy trust
│   ├── prisma/
│   │   ├── schema.prisma       # Database models (User, Task, TimeLog)
│   │   └── migrations/         # PostgreSQL migration files
│   ├── .env.example            # Backend environment variable template
│   └── package.json
│
├── package.json                # Root convenience scripts (dev, build, prisma)
├── .gitignore                  # Git ignore rules (strictly excludes all .env files)
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
| Variable | Description | Example (Development) | Example (Production / Render) |
|---|---|---|---|
| `PORT` | HTTP port for server | `5000` | `10000` (set automatically by Render) |
| `NODE_ENV` | Environment mode | `development` | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/suntek_tracker?schema=public` | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Secret key for signing tokens | `dev_secret_key_suntek_2026` | `generate-a-strong-random-64-char-string` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:5173` | `https://suntek-tracker.vercel.app` |
| `GEMINI_API_KEY`| Google Gemini API key | `AIzaSy...` | `AIzaSy...` |

### Frontend (`client/.env`)
| Variable | Description | Example (Development) | Example (Production / Vercel) |
|---|---|---|---|
| `VITE_API_URL` | Base URL for backend API | `http://localhost:5000/api` | `https://suntek-backend.onrender.com/api` |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (Docker or local installation)

### 2. Clone & Install Dependencies
```bash
git clone <repository-url>
cd suntek

# Install dependencies in root, server, and client
npm run install:all
```

### 3. Setup Environment Files
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```
Update `server/.env` with your local PostgreSQL credentials and Gemini API key.

### 4. Run Database Migrations
```bash
npm run prisma:migrate
npm run prisma:generate
```

### 5. Start Development Servers
```bash
# Starts both server (port 5000) and client (port 5173) concurrently
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🚀 Production Deployment Guide

### Phase A: Setup Neon PostgreSQL Database
1. Go to [Neon](https://neon.tech) and create a free PostgreSQL project.
2. Under **Connection Details**, select **Prisma** or copy the connection string. It will look like:
   ```
   postgresql://<username>:<password>@<ep-name-123456>.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this connection string for use in Render.

---

### Phase B: Deploy Backend to Render
1. Go to [Render Dashboard](https://dashboard.render.com) and click **New + > Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `suntek-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     npm install && npm run build && npx prisma migrate deploy
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
4. Configure **Environment Variables** in Render:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: *(Your Neon PostgreSQL connection string from Phase A)*
   - `JWT_SECRET`: *(A secure random secret, e.g. run `openssl rand -hex 32`)*
   - `GEMINI_API_KEY`: *(Your Google Gemini API key)*
   - `CLIENT_URL`: `https://<your-vercel-project-name>.vercel.app` *(You can update this after creating your Vercel project)*
5. Click **Create Web Service** and wait for the build and deployment to succeed.
6. Copy your deployed backend service URL (e.g., `https://suntek-backend.onrender.com`).

---

### Phase C: Deploy Frontend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
2. Import your Git repository.
3. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` *(Click 'Edit' and select `client`)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Configure **Environment Variables** in Vercel:
   - `VITE_API_URL`: `https://suntek-backend.onrender.com/api` *(Your Render backend URL with `/api`)*
5. Click **Deploy**.
6. Once deployed, copy your production Vercel URL (e.g., `https://suntek-tracker.vercel.app`).
7. **Important**: Go back to Render, update the `CLIENT_URL` environment variable with your exact Vercel URL, and trigger a manual redeploy so CORS and cookies are synchronized!

---

## 📡 API Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user & set auth cookie | No |
| `POST` | `/api/auth/login` | Login user & set auth cookie | No |
| `POST` | `/api/auth/logout` | Clear auth cookie | Yes |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Yes |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/tasks` | Get all user tasks (with total logged seconds) | Yes |
| `POST` | `/api/tasks` | Create a new task | Yes |
| `POST` | `/api/tasks/ai-generate`| AI enhancement using Google Gemini | Yes |
| `GET` | `/api/tasks/:id` | Get specific task details | Yes |
| `PATCH` | `/api/tasks/:id` | Update task title, description, or status | Yes |
| `DELETE` | `/api/tasks/:id` | Delete task & cascade-delete related logs | Yes |

### Time Tracking (`/api/time-logs`)
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/time-logs/active` | Get user's current running timer (if any) | Yes |
| `POST` | `/api/time-logs/start` | Start tracking a task (auto-stops running timer) | Yes |
| `POST` | `/api/time-logs/stop` | Stop active tracking session & persist duration | Yes |
| `GET` | `/api/time-logs` | Get list of historical time logs | Yes |
| `DELETE` | `/api/time-logs/:id` | Delete a specific time log | Yes |

### Analytics (`/api/analytics`)
| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `GET` | `/api/analytics/daily-summary` | Daily time tracking breakdown & midnight calculation | Yes |

---

## 🔒 Security & Cookie Verification

In production:
- The backend runs behind Render's reverse proxy with `app.set('trust proxy', 1)`.
- Authentication cookies are set with:
  ```ts
  {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  }
  ```
- This configuration ensures that cross-origin HTTPS requests between the Vercel frontend and Render backend send and receive cookies securely without browser rejection.
- All endpoints query exclusively by `req.user.id` decoded from the verified JWT.

---

## 🧪 Testing Commands

```bash
# Verify backend TypeScript compilation
npm run --prefix server build

# Verify frontend TypeScript compilation & bundling
npm run --prefix client build

# Check Prisma migration status
npm run --prefix server prisma:migrate -- status
```
