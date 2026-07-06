# AI Resume Analyzer

A production-ready full-stack application that analyzes resumes like a real ATS system,
scores them out of 100, finds missing skills, matches against job descriptions, and
generates downloadable improvement reports.

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts + react-dropzone
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: JWT + bcrypt, email verification, forgot/reset password
- **AI**: Gemini API (default) or OpenAI API — pluggable via `AI_PROVIDER` env var
- **File handling**: Multer (upload) + pdf-parse (text extraction) + pdfkit (report generation)

## Project Structure
```
ai-resume-analyzer/
├── backend/
│   ├── config/          # DB connection
│   ├── models/          # Mongoose schemas (User, Resume, AnalysisReport, JobDescription, ActivityLog)
│   ├── controllers/      # Route handlers / business logic
│   ├── routes/           # Express route definitions
│   ├── middleware/        # auth, admin, upload, rate limiting, error handling
│   ├── utils/             # AI service, PDF parsing/generation, email, validators
│   └── server.js
├── frontend/
│   └── src/
│       ├── pages/         # Login, Register, Dashboard, Upload, Analysis, JobMatch, Admin, etc.
│       ├── components/    # Navbar, ResumeCard, ScoreGauge, SkillGapChart, ProtectedRoute
│       ├── context/       # AuthContext, ThemeContext (dark/light mode)
│       └── services/      # Axios API client
└── docs/
    ├── API_DOCUMENTATION.md
    ├── DATABASE_SCHEMA.md
    └── DEPLOYMENT.md
```

## Features
**Candidates**: register/login/email-verification, drag-and-drop PDF upload, AI-parsed resume
fields, ATS scoring (0-100), missing-skills detection, grammar/formatting feedback, stronger
bullet-point suggestions, job-description matching with match %, downloadable PDF report,
dashboard with score trend + skill-gap charts, searchable/paginated history, profile management,
dark/light mode.

**Admins**: view all users & resumes, delete users/resumes (cascades related data), platform-wide
analytics dashboard (signups, totals, average ATS score).

## Quick Start
See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for full local-dev and production deployment steps.

```bash
# 1. Backend
cd backend && cp .env.example .env  # fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY, etc.
npm install && npm run dev

# 2. Frontend (new terminal)
cd frontend && cp .env.example .env
npm install && npm run dev
```

Visit `http://localhost:5173`.

## Documentation
- [API Documentation](docs/API_DOCUMENTATION.md) — every endpoint, request/response shape
- [Database Schema](docs/DATABASE_SCHEMA.md) — collections, fields, relationships
- [Deployment Guide](docs/DEPLOYMENT.md) — Vercel + Render + MongoDB Atlas setup
