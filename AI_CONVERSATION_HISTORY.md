# AI Conversation & Prompt History Log

> **Project**: Suntek Tracker — Task & Time Tracking App  
> **Candidate**: Vishal Singh Lodhi ([vishalsinghlodhi16@gmail.com](mailto:vishalsinghlodhi16@gmail.com))  
> **Evaluation**: Suntek AI Full Stack Developer Assignment  
> **Assignment Link**: [Suntek Full Stack Assignment Notion Spec](https://curved-memory-1dd.notion.site/Full-Stack-Assignment-1eb1fc0d84b0803f9f43d02ce956b10f)

---

## 📌 Overview

As requested in the Suntek AI assignment guidelines (*"As part of our evaluation process, kindly share the AI prompts or conversation history used during the assignment along with your submission"*), this document records the chronological prompts, architectural decisions, and iterative refinement steps used during the development lifecycle.

The application was built systematically following a phased roadmap from requirements analysis to production deployment.

---

## 🧭 Phase 0: Requirements Analysis & Architecture Planning

### Prompt:
```text
First, read and understand the complete assignment requirements provided for this project.
Do NOT write or modify any code yet.

Analyze the assignment and provide:
1. Functional requirements
2. Technical requirements
3. User flows
4. Required pages/screens
5. Required frontend components
6. Required backend APIs
7. Database entities and relationships
8. Authentication and authorization requirements
9. Validation and error-handling requirements
10. Important edge cases
11. Recommended technology stack
12. Recommended project architecture
13. Suggested implementation phases in the correct order

Strictly follow the assignment requirements and do not invent unnecessary features.
At this stage, only analyze and propose the implementation plan.
```

### Key Decisions Made:
- **Frontend Stack**: React 18, Vite, TypeScript, Tailwind CSS, TanStack Query v5, Axios, React Router v7, Recharts.
- **Backend Stack**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Zod, JWT with HTTP-only cookies, bcryptjs.
- **AI Stack**: Google Gemini API (`@google/genai`).
- **Phased Delivery Strategy**:
  - Phase 1: Clean client/server setup, Prisma database schema, initial migration.
  - Phase 2: Authentication system (JWT, HTTP-only cookie, AuthContext, ProtectedRoute, restrained UI).
  - Phase 3: Task CRUD, client filtering, search, and Google Gemini AI task decomposition.
  - Phase 4: Server-authoritative real-time time tracking engine, active timer constraint, multi-tab sync.
  - Phase 5: Daily productivity summary, midnight-crossing time calculation, Recharts visualization.
  - Phase 6: Production deployment (Vercel, Render, Neon PostgreSQL) and cross-domain auth resilience.

---

## 🏗️ Phase 1: Project Setup & Database Modeling

### Prompt:
```text
Proceed with Phase 1 only.
1. Create a clean client/server project structure based on the approved architecture.
2. Initialize both frontend and backend with TypeScript.
3. Configure the development scripts so client and server can be run easily.
4. Configure Tailwind CSS on the frontend.
5. Configure Prisma with PostgreSQL.
6. Create the initial Prisma schema containing: User, Task, TimeLog.
7. Add proper primary keys, foreign keys, relationships, timestamps, enums and indexes according to the requirements.
8. Configure cascade behavior for user/task deletion where appropriate.
9. Create the initial database migration.
10. Add .env.example files.
```

### Outcomes:
- Initialized `client/` and `server/` with strict TypeScript configurations.
- Defined Prisma models: `User`, `Task`, `TimeLog` with `TaskStatus` enum (`PENDING`, `IN_PROGRESS`, `COMPLETED`).
- Created indexes on `[userId]`, `[userId, status]`, `[userId, startTime]` for query optimization.
- Configured cascade delete on `User -> Task` and `Task -> TimeLog`.
- Generated initial migration: `20260925181257_init`.

---

## 🔐 Phase 2: Authentication & Design System

### Prompt:
```text
Proceed with Phase 2: Authentication only.

IMPORTANT UI/UX DIRECTION:
The UI must NOT look AI-generated or like a generic Tailwind/shadcn template.
Design it as if it were created by an experienced product UI/UX designer.

Avoid:
- Excessive rounded cards, pill-shaped elements, excessive borders
- Heavy/bold typography everywhere, giant headings, excessive shadows
- Gradient backgrounds, generic "AI SaaS dashboard" aesthetics

Prefer:
- Strong visual hierarchy, restrained surfaces, comfortable spacing
- Clear regular/medium typography, accessible contrast, responsive layout

Backend APIs:
1. POST /api/auth/register (name, email, password >= 8 chars)
2. POST /api/auth/login (email, password)
3. POST /api/auth/logout (clears cookie)
4. GET /api/auth/me (returns current user)
```

### Outcomes:
- Built authentication endpoints with Zod request validation and bcrypt password hashing.
- Issued signed JWT tokens stored in HTTP-only cookies (`auth_token`).
- Implemented `AuthContext`, `ProtectedRoute`, `PublicOnlyRoute`, `LoginPage`, and `RegisterPage`.
- Established a restrained, professional design system based on zinc neutral scales, subtle borders, and clear typography.

---

## 📝 Phase 3: Task Management & Gemini AI Enhancement

### Prompt:
```text
Proceed with Phase 3: Task Management and AI Integration.
Do not implement time tracking or daily analytics yet.

Backend:
1. GET /api/tasks (returns user's tasks with total tracked duration)
2. POST /api/tasks (title, description?, status)
3. GET /api/tasks/:id
4. PATCH /api/tasks/:id (title?, description?, status?)
5. DELETE /api/tasks/:id
6. POST /api/tasks/ai-generate (body: { prompt: string })
   - Use Google Gemini API to analyze prompt
   - Return suggested structured title and clear description
   - If AI fails or is unavailable, return meaningful fallback or error

Frontend:
- Task creation bar with natural language input
- Task list with status filtering (All, Pending, In Progress, Completed)
- Search filter (title and description)
- Edit task modal
- Confirmation on delete
```

### Outcomes:
- Built full CRUD endpoints in `task.controller.ts` scoped strictly by `req.user.id`.
- Integrated Google Gemini API (`@google/genai`) using model `gemini-2.5-flash`.
- Added dynamic `.env` re-parsing in `ai.service.ts` to pick up runtime key updates without restarting server.
- Built an offline heuristic fallback parser that extracts actionable steps if API quota is reached or network drops.
- Developed `TaskDashboard`, `TaskCreateBar`, `TaskCard`, and `TaskEditModal`.

---

## ⏱️ Phase 4: Server-Authoritative Real-Time Time Tracking

### Prompt:
```text
Proceed with Phase 4: Real-Time Time Tracking.
Do NOT implement daily analytics yet.

Backend:
1. GET /api/time-logs/active (returns current running timer if any)
2. POST /api/time-logs/start (body: { taskId })
   - Ensure a user can only have ONE active timer at a time
   - If an active timer already exists, atomically stop it and start the new one
   - Automatically transition task to IN_PROGRESS if PENDING
3. POST /api/time-logs/stop (calculates elapsed seconds, persists endTime & durationSeconds)
4. GET /api/time-logs (list historical logs)
5. DELETE /api/time-logs/:id

Frontend:
- ActiveTimerBar (persists across navigation)
- Real-time running counter without browser drift
- Start/stop button directly on task cards and active bar
- Multi-tab synchronization
- TimeLogHistoryModal
```

### Outcomes:
- Designed atomic Prisma transaction (`prisma.$transaction`) in `timeLog.service.ts`:
  - Stops any currently active timer, calculates `durationSeconds = Math.floor((now - startTime) / 1000)`.
  - Transitions `PENDING` task to `IN_PROGRESS`.
  - Creates the new active `TimeLog` with `endTime: null`.
- Built drift-proof frontend timer in `TimerContext.tsx` calculating elapsed seconds from `startTime` directly.
- Implemented multi-tab sync via browser `BroadcastChannel('suntek_timer_channel')`.
- Built `ActiveTimerBar` and `TimeLogHistoryModal` with delete capabilities.

---

## 📊 Phase 5: Daily Productivity Summary & Midnight Overlap

### Prompt:
```text
Proceed with Phase 5: Daily Productivity Summary and Analytics.

Requirements:
1. GET /api/analytics/daily-summary?date=YYYY-MM-DD
2. Validate date using Zod.
3. Use authenticated user's timezone appropriately.
4. Calculate requested calendar day's boundaries correctly.
5. Return: { date, totalTrackedSeconds, tasksWorkedOn, completedTasks, pendingTasks, inProgressTasks }
6. Include amount of time spent on each task during that day.
7. Sort tasks worked on by time spent descending.

CRITICAL TIME CALCULATION:
A time log may cross midnight (e.g. 23:30 to 01:00).
For September 26, only count: 01:00 - 00:00 = 1 hour.
Do not count the entire 90-minute session toward both days.
Implement date-overlap calculation correctly on the server.

Frontend:
- Date selector with Previous/Next day navigation
- High-level metric cards
- Recharts time distribution chart
- Tasks worked on breakdown with relative percentage bars
- Empty, loading, and error states
- Ensure active timer remains visible and updates summary when stopped
```

### Outcomes:
- Developed timezone-aware boundary calculation using `Intl.DateTimeFormat`:
  - Accurately converts calendar date to UTC boundaries: `[dayStart, dayEnd)`.
- Implemented exact interval clamping formula:
  ```ts
  const clampedStart = Math.max(logStartMs, dayStart.getTime());
  const clampedEnd = Math.min(logEndMs, dayEnd.getTime());
  const durationOnDay = Math.floor((clampedEnd - clampedStart) / 1000);
  ```
  Verified that a 90-minute log (23:30 to 01:00) outputs:
  - Day 1: Exactly 1,800 seconds (30 mins).
  - Day 2: Exactly 3,600 seconds (60 mins).
  - Total: 5,400 seconds (90 mins) without double counting.
- Built `DailySummaryPage.tsx` using Recharts `BarChart` with dynamic scaling.
- Integrated query cache invalidations across `TimerContext`, `TaskDashboard`, and `TimeLogHistoryModal`.

---

## 🚀 Phase 6: Production Deployment & Cross-Domain Cookie Troubleshooting

### Prompt:
```text
Prepare the completed application for production deployment.
Deployment targets:
- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

Requirements:
1. Configure production environment variables.
2. Ensure no secrets are committed to Git.
3. Update .gitignore.
4. Ensure backend starts using npm start.
5. Ensure Prisma migrations execute against Neon PostgreSQL.
6. Configure CORS correctly for https://<frontend-domain>.
7. Configure production cookie settings (httpOnly, secure, sameSite).
8. Add vercel.json for SPA client-side routing.
```

### Debugging & Resolution During Deployment:
**Symptom**: On deployed Vercel URL (`trackit-beta-eosin.vercel.app`), users faced `401 Unauthorized` and `AI suggestion was unavailable` upon performing task operations.  
**Root Cause**:
- Vercel and Render are different public domains (`.vercel.app` vs `.onrender.com`).
- Modern browsers (Chrome, Safari, Firefox) classify cookies exchanged across these domains as **Third-Party Cross-Site Cookies** and block them by default.
- Even with `SameSite=None; Secure`, browser privacy policies frequently drop cross-origin cookies.

**Solution (Dual-Mode Authentication)**:
1. **Bearer Token Fallback**: Modified login/register APIs to return `{ user, token }` in the response payload.
2. **Axios Interceptor**: Automatically stores token in `localStorage` and attaches `Authorization: Bearer <token>` on all outbound requests.
3. **Flexible Middleware**: Updated Express `requireAuth` middleware to check both `req.cookies.auth_token` AND `req.headers.authorization`.
4. **Render Proxy Trust**: Enabled `app.set('trust proxy', 1)` in Express so HTTPS connections forwarded by Render's reverse proxy are correctly recognized as secure.

---

## 🎯 Verification & Testing Summary

| Test Area | Description | Status |
|---|---|---|
| **Authentication** | Registration, login, logout, password hashing, session recovery | ✅ Verified |
| **Cross-Domain Auth** | Cookie + Bearer fallback working seamlessly between Vercel and Render | ✅ Verified |
| **Task Management** | Task creation, status updating, edit modal, delete cascade | ✅ Verified |
| **Gemini AI** | Shorthand expansion to title + bulleted description + offline fallback | ✅ Verified |
| **Active Timer** | Single active timer constraint, automatic transition to IN_PROGRESS | ✅ Verified |
| **Timer Sync** | Zero drift ticker, cross-tab synchronization via BroadcastChannel | ✅ Verified |
| **Midnight Clamping** | Exact boundary clipping for multi-day time logs | ✅ Verified |
| **Daily Summary** | Recharts bar visualization, percentage calculation, status breakdown | ✅ Verified |
| **Multi-User Isolation** | Cross-tenant data isolation; users cannot access each other's data | ✅ Verified |
| **TypeScript / Build** | Zero TypeScript compilation errors in client (`tsc -b`) and server (`tsc`) | ✅ Verified |

---

*End of AI Conversation & Prompt History Log.*
