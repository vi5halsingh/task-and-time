# Task and Time Tracking App (Suntek Tracker)

A full-stack task management and real-time time tracking application built with React, Vite, Node.js, Express, PostgreSQL, Prisma, and Gemini AI.

---

## 🛠 Tech Stack

- **Frontend**:
  - React + Vite + TypeScript
  - Tailwind CSS (responsive styling)
  - TanStack Query (React Query for data fetching & state caching)
  - Axios (HTTP client)
  - React Router (client-side routing)
  - Recharts (productivity charts)
  - Lucide React (icons)
- **Backend**:
  - Node.js + Express + TypeScript
  - PostgreSQL (relational database)
  - Prisma ORM (migrations and type-safe query builder)
  - Zod (input schema validation)
  - JWT + HTTP-only cookies (secure authentication)
  - bcryptjs (password hashing)
- **AI Integration**:
  - Google Gemini API (natural language task enhancement)

---

## 📁 Project Architecture

```
suntek/
├── client/                     # Frontend Vite + React + TypeScript App
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Screen components
│   │   ├── context/            # Auth and Timer context state
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # Axios API services
│   │   ├── types/              # Frontend TypeScript definitions
│   │   ├── App.tsx             # Main App router and TanStack provider
│   │   ├── main.tsx            # DOM root entrypoint
│   │   └── index.css           # Tailwind CSS directives
│   ├── .env.example            # Client environment variables template
│   ├── tailwind.config.js      # Tailwind configuration
│   └── package.json
│
├── server/                     # Backend Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── middlewares/        # Auth verification, error handler, validation
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic & Gemini AI client
│   │   ├── lib/                # Prisma singleton instance
│   │   └── index.ts            # Express server entrypoint
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema definition
│   │   └── migrations/         # SQL migration history
│   ├── .env.example            # Server environment variables template
│   └── package.json
│
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL instance running (e.g. Docker or local service)

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both `client/` and `server/`:

```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```

Ensure `server/.env` contains your PostgreSQL connection string:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/suntek_tracker?schema=public
JWT_SECRET=your_jwt_secret_change_in_production
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Database Migration & Prisma Generation
```bash
npm run prisma:migrate
npm run prisma:generate
```

### 4. Run Development Servers
From the root directory, run both frontend and backend concurrently:
```bash
npm run dev
```

Or run them individually:
```bash
# Start backend on http://localhost:5000
npm run dev:server

# Start frontend on http://localhost:5173
npm run dev:client
```

---

## 📡 Backend Health Check

```bash
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "status": "ok",
  "service": "suntek-tracker-api",
  "uptime": 8.97,
  "timestamp": "2026-09-25T18:14:31.061Z",
  "database": "connected"
}
```
