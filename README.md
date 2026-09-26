# Suntek Tracker — Task & Time Tracking App

> **Suntek AI Full Stack Developer Assignment Submission**  
> **Candidate**: Vishal Singh Lodhi ([vishalsinghlodhi16@gmail.com](mailto:vishalsinghlodhi16@gmail.com))  
> **Assignment Notion Spec**: [Full Stack Assignment Details](https://curved-memory-1dd.notion.site/Full-Stack-Assignment-1eb1fc0d84b0803f9f43d02ce956b10f)

---

## 🌐 Live URLs & Demo Credentials

| Resource | URL |
|---|---|
| **Live Frontend Application** | [https://trackit-beta-eosin.vercel.app](https://trackit-beta-eosin.vercel.app) |
| **Live Backend API** | [https://track-it-pu57.onrender.com](https://track-it-pu57.onrender.com) |
| **API Health Check** | [https://track-it-pu57.onrender.com/api/health](https://track-it-pu57.onrender.com/api/health) |
| **GitHub Repository** | [https://github.com/vi5halsingh/task-and-time](https://github.com/vi5halsingh/task-and-time) |

### 🔑 Demo Account Credentials
- **Email**: `vishalsinghlodhi16@gmail.com`
- **Password**: `11111111`

*(You can also register a fresh account directly on the application)*

---

## 📋 Project Overview & Architecture

**Suntek Tracker** is an enterprise-grade productivity web application designed to help individuals and teams manage tasks, track real-time focus sessions, and visualize daily productivity metrics.

Built strictly according to Suntek AI's technical evaluation criteria, the project adheres to:
- **Clean Architecture & Separation of Concerns**: Controllers, middlewares, services, data access layers, and type-safe schemas.
- **Restrained, Mature UI/UX**: Designed without generic AI-generated templates or flashy noise — prioritizing high information density, intentional whitespace, accessible contrast, and subtle micro-interactions.
- **Server-Authoritative Timing Engine**: Time calculations, active timer guarantees, and midnight-crossing boundary clipping are strictly validated on the server.
- **Cross-Domain Resilient Authentication**: Dual-mode auth combining secure HTTP-only cookies (`SameSite=None; Secure`) and `Authorization: Bearer` header fallback to resist modern browser 3rd-party cookie blocking between Vercel and Render.

---

## 🛠 Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, TanStack Query v5, Axios, React Router v7, Recharts, Lucide React |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, Zod, JWT, Cookie-Parser, CORS, Bcryptjs |
| **Database** | PostgreSQL (Neon Serverless for Production, Docker/Postgres for Local Dev) |
| **AI Integration** | Google Gemini API (`@google/genai`) for natural-language task decomposition |
| **Cloud Hosting** | Vercel (Frontend SPA) + Render (Backend Web Service) + Neon (Cloud PostgreSQL) |

---

## ⚡ Core Features & Engineering Highlights

### 1. Robust Authentication & Session Management
- Secure user registration, login, logout, and token verification (`/api/auth/me`).
- Password hashing with salted `bcryptjs` (cost factor 10).
- **Dual-Mode Auth (Cookie + Bearer Fallback)**:
  - Sets HTTP-only cookie with `SameSite=None; Secure` in production.
  - Automatically attaches `Authorization: Bearer <token>` through Axios request interceptors to prevent session loss on browsers blocking third-party cross-site cookies.

### 2. Task Management & Gemini AI Enhancement
- Full task lifecycle management with statuses: `PENDING`, `IN_PROGRESS`, and `COMPLETED`.
- Instant client-side search, real-time status filtering tabs, and accurate task counters.
- **Google Gemini AI Integration**:
  - Accepts natural-language shorthand (e.g. *"prepare deck for client meeting tomorrow afternoon"*).
  - Deconstructs input into a professional title and bulleted actionable description.
  - Built with dynamic `.env` re-parsing and an offline heuristic fallback parser for 100% availability even under API quota exhaustion.

### 3. Server-Authoritative Real-Time Timer
- **Single Active Timer Invariant**: Enforces at the database transaction level that a user can have at most one active running timer at any given moment.
- Starting a timer on a new task automatically stops any currently running session, commits its duration, and transitions the new task to `IN_PROGRESS`.
- **Drift-Proof Frontend Clock**: Calculates elapsed time dynamically from server `startTime` (`Date.now() - startTime`), preventing drift caused by browser tab throttling.
- **Multi-Tab Sync**: Synchronizes timer state across open tabs using the browser `BroadcastChannel` API (`suntek_timer_channel`).

### 4. Daily Productivity Summary & Analytics
- Queryable via `GET /api/analytics/daily-summary?date=YYYY-MM-DD&timezone=...`.
- **Accurate Midnight Crossing Calculation**:
  - Handles time tracking sessions that cross calendar day boundaries (e.g., 23:30 to 01:00).
  - Server clamps intervals to day boundaries: counts exactly 30 minutes on Day 1 and 60 minutes on Day 2 without duplicate double-counting.
- **Data Visualization**: Recharts vertical/horizontal bar chart with dynamic scaling, custom hover tooltips, and relative percentage progress bars.
- High-level KPIs: Total Tracked Time, Tasks Worked On, Completed Tasks, and In-Progress/Pending tasks.

---

## 📁 Repository Structure

```
suntek/
├── client/                         # Frontend Single Page App (Vite + React + TS)
│   ├── src/
│   │   ├── components/             # Reusable UI (AppHeader, ActiveTimerBar, TaskCard, etc.)
│   │   ├── context/                # Global AuthContext & TimerContext (ticker + BroadcastChannel)
│   │   ├── pages/                  # LoginPage, RegisterPage, TaskDashboard, DailySummaryPage
│   │   ├── services/               # Axios API modules (auth, task, timeLog, analytics)
│   │   ├── types/                  # TypeScript types, DTOs & form contracts
│   │   ├── App.tsx                 # Protected routing & TanStack Query provider
│   │   └── index.css               # Tailwind CSS design system
│   ├── vercel.json                 # SPA client-side rewrite rules for Vercel
│   └── package.json
│
├── server/                         # Backend REST API (Node.js + Express + TS)
│   ├── src/
│   │   ├── controllers/            # Route controllers (auth, task, timeLog, analytics)
│   │   ├── middlewares/            # requireAuth, errorHandler, validateBody
│   │   ├── routes/                 # Express router definitions
│   │   ├── services/               # Business logic, time calculations & Gemini AI
│   │   ├── schemas/                # Zod validation schemas
│   │   ├── lib/                    # Prisma client singleton & JWT utilities
│   │   └── index.ts                # Server entrypoint with CORS & reverse-proxy trust
│   ├── prisma/
│   │   ├── schema.prisma           # Relational schema (User, Task, TimeLog)
│   │   └── migrations/             # SQL migration history
│   └── package.json
│
├── package.json                    # Root orchestration scripts
└── README.md
```

---

## 📡 API Specification

### Authentication
- `POST /api/auth/register` — Create new user account & set session cookie
- `POST /api/auth/login` — Authenticate credentials & return session token
- `POST /api/auth/logout` — Revoke session cookie & clear auth state
- `GET /api/auth/me` — Retrieve currently logged-in user profile

### Tasks
- `GET /api/tasks` — List all user tasks with aggregated duration
- `POST /api/tasks` — Create task with status `PENDING` / `IN_PROGRESS` / `COMPLETED`
- `POST /api/tasks/ai-generate` — Decompose prompt into structured title & description via Gemini AI
- `GET /api/tasks/:id` — Fetch single task details
- `PATCH /api/tasks/:id` — Update title, description, or status
- `DELETE /api/tasks/:id` — Delete task (cascades to related time logs)

### Time Tracking
- `GET /api/time-logs/active` — Return currently running timer for authenticated user
- `POST /api/time-logs/start` — Start tracking task (auto-stops running timer)
- `POST /api/time-logs/stop` — Stop active timer & persist session duration
- `GET /api/time-logs` — Retrieve user's historical time logs
- `DELETE /api/time-logs/:id` — Delete specific time log

### Analytics
- `GET /api/analytics/daily-summary?date=YYYY-MM-DD&timezone=...` — Timezone-aware productivity summary with midnight clipping

---

## 🗄 Database Schema (Prisma / PostgreSQL)

```prisma
enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  name         String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  tasks        Task[]
  timeLogs     TimeLog[]

  @@map("users")
}

model Task {
  id          String      @id @default(uuid())
  userId      String
  title       String
  description String?     @db.Text
  status      TaskStatus  @default(PENDING)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  timeLogs    TimeLog[]

  @@index([userId])
  @@index([userId, status])
  @@map("tasks")
}

model TimeLog {
  id              String    @id @default(uuid())
  userId          String
  taskId          String
  startTime       DateTime
  endTime         DateTime?
  durationSeconds Int?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  task            Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([taskId])
  @@index([userId, startTime])
  @@map("time_logs")
}
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+ (Tested on v20 and v24)
- **PostgreSQL**: Local PostgreSQL server or Docker container

### 2. Installation
```bash
git clone https://github.com/vi5halsingh/task-and-time.git
cd task-and-time

# Install dependencies across root, server, and client
npm run install:all
```

### 3. Environment Variables
Create `.env` in `server/` and `client/`:

**`server/.env`**:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password123@localhost:5432/suntek_tracker?schema=public"
JWT_SECRET="your-local-dev-jwt-secret-key"
CLIENT_URL="http://localhost:5173"
GEMINI_API_KEY="your-google-gemini-api-key"
```

**`client/.env`**:
```env
VITE_API_URL="http://localhost:5000/api"
```

### 4. Database Setup & Migrations
```bash
npm run prisma:migrate
npm run prisma:generate
```

### 5. Start Development Servers
```bash
# Starts both frontend (port 5173) and backend (port 5000) concurrently
npm run dev
```

---

## 🤖 AI Usage & Prompts Log

*As requested by Suntek AI, below is the transparent summary of AI prompts and workflows used during the development lifecycle:*

### Architectural Alignment Prompt:
> *"Analyze the assignment requirements for the Task and Time Tracking App. Provide functional and technical requirements, API routes, database schemas with Prisma, validation constraints with Zod, and a phased implementation roadmap (Phase 1 to Phase 5). Do not create code before confirming the stack."*

### Time Tracking & Atomic Timer Invariant Prompt:
> *"Implement server-authoritative time tracking in Express and Prisma. Enforce that a user can only have one active timer. When a new timer starts, automatically stop the existing timer, calculate elapsed seconds, and set status to IN_PROGRESS. Synchronize across browser tabs using BroadcastChannel without timer drift."*

### Midnight Crossing Calculation Prompt:
> *"A time log may cross midnight (e.g. 23:30 to 01:00). For September 26, only count 01:00 - 00:00 = 1 hour. Do not double count the 90-minute session. Implement date boundary overlap calculation accurately on the server with user timezone support."*

### Production Cookie & Cross-Domain Fallback Prompt:
> *"Prepare the completed application for production deployment on Vercel (client) and Render (backend). Ensure HTTP-only cookies work with cross-origin HTTPS requests using SameSite=None; Secure, and add a Bearer token fallback in Axios and Express to prevent session drops caused by third-party cookie blocking in modern browsers."*

---

## 👤 Author & Acknowledgement

- **Developer**: Vishal Singh Lodhi
- **Email**: [vishalsinghlodhi16@gmail.com](mailto:vishalsinghlodhi16@gmail.com)
- **Role**: Full Stack Developer Candidate
- **Company**: Suntek AI
