# API Documentation — AI Resume Analyzer

Base URL (local): `http://localhost:5000/api`

All authenticated routes require an `Authorization: Bearer <token>` header.
All responses follow the shape: `{ success: boolean, message?: string, ...data }`.

---

## Auth

### `POST /auth/register`
Register a new candidate account.
```json
// Request body
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }

// Response 201
{ "success": true, "token": "jwt...", "user": { ... } }
```

### `POST /auth/login`
```json
{ "email": "jane@example.com", "password": "secret123" }
// -> { success, token, user }
```

### `GET /auth/verify-email?token=...`
Verifies the user's email using the token sent to their inbox.

### `POST /auth/forgot-password`
```json
{ "email": "jane@example.com" }
```

### `POST /auth/reset-password`
```json
{ "token": "reset_token_from_email", "newPassword": "newSecret123" }
```

### `GET /auth/me` (Private)
Returns the currently authenticated user.

---

## Resumes (Private — Candidate)

### `POST /resumes/upload`
`multipart/form-data` with field `resume` (PDF, max 5MB).
Extracts text, runs AI structured parsing, and stores the resume.
```json
// Response 201
{ "success": true, "resume": { "_id": "...", "parsed": { "skills": [...], ... }, "status": "parsed" } }
```

### `GET /resumes?page=1&limit=10`
Paginated list of the logged-in user's resumes.

### `GET /resumes/:id`
Fetch a single resume (must belong to the requester).

### `DELETE /resumes/:id`
Deletes the resume record and its file from disk.

---

## Analysis (Private — Candidate)

### `POST /analysis/ats/:resumeId`
```json
{ "targetRole": "Frontend Developer" }
// -> { success: true, analysis: { atsScore, missingSkills, recommendedSkills,
//      grammarIssues, formattingIssues, strongerBulletPoints,
//      suggestedCertifications, suggestedProjects, overallHiringReadiness, summary } }
```

### `POST /analysis/jd-match/:resumeId`
```json
{ "jobDescriptionText": "full JD text...", "title": "Backend Engineer", "company": "Acme" }
// -> { success: true, analysis: { matchPercentage, missingKeywords, overallHiringReadiness, summary }, jobDescription }
```

### `GET /analysis/history?page=1&limit=10&search=filename`
Paginated analysis history for the logged-in user.

### `GET /analysis/dashboard-stats`
```json
{
  "success": true,
  "stats": {
    "totalAnalyzed": 12,
    "averageScore": 78,
    "trend": [{ "date": "...", "score": 70 }, ...],
    "skillGap": [{ "skill": "Docker", "count": 4 }, ...]
  }
}
```

### `GET /analysis/:id/report-pdf`
Streams a downloadable PDF improvement report (`application/pdf`).

---

## Users (Private)

### `PUT /users/profile`
```json
{ "name": "Jane Doe", "phone": "+1234567890", "targetRole": "Data Analyst" }
```

### `PUT /users/change-password`
```json
{ "currentPassword": "old", "newPassword": "newSecret123" }
```

---

## Admin (Private — Admin role only)

### `GET /admin/users?page=1&limit=20&search=jane`
### `DELETE /admin/users/:id` — cascades and deletes all resumes/reports for that user.
### `GET /admin/resumes?page=1&limit=20`
### `DELETE /admin/resumes/:id`
### `GET /admin/analytics`
```json
{
  "success": true,
  "analytics": {
    "totalUsers": 120,
    "totalResumes": 340,
    "totalAnalyses": 500,
    "averageATSScore": 71,
    "signupsByDay": [{ "date": "2026-07-01", "count": 5 }, ...]
  }
}
```

---

## Error Format
```json
{ "success": false, "message": "Human-readable error message" }
```

Common status codes: `400` validation, `401` unauthorized, `403` forbidden, `404` not found,
`409` conflict (duplicate), `429` rate-limited, `502` AI provider error, `500` server error.

## Rate Limits
- General API: 100 requests / 15 min / IP
- Auth endpoints: 10 requests / 15 min / IP
- AI analysis endpoints: 20 requests / hour / IP
