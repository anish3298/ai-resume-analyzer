# Database Schema — MongoDB Atlas (Mongoose Models)

## `users`
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercase |
| password | String | bcrypt-hashed, `select: false` |
| role | String | `candidate` \| `admin`, default `candidate` |
| isVerified | Boolean | default `false` |
| verificationToken / verificationTokenExpires | String / Date | `select: false` |
| resetPasswordToken / resetPasswordExpires | String / Date | `select: false` |
| profile.phone / profile.targetRole / profile.avatarUrl | String | optional |
| isActive | Boolean | default `true`, used for soft-deactivation |
| timestamps | createdAt, updatedAt | auto |

## `resumes`
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → users | required, indexed |
| originalFileName | String | as uploaded by user |
| storedFileName | String | randomized name on disk |
| filePath | String | absolute path on server |
| fileSize | Number | bytes |
| rawText | String | full extracted PDF text |
| parsed.name / email / phone | String | AI/regex extracted |
| parsed.skills / education / experience / projects / certifications | [String] | AI extracted |
| status | String | `uploaded` \| `parsed` \| `analyzed` \| `failed` |
| timestamps | | |

## `analysisreports`
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → users | indexed |
| resume | ObjectId → resumes | required |
| jobDescription | ObjectId → jobdescriptions | nullable (only for JD-match runs) |
| atsScore | Number | 0-100 |
| matchPercentage | Number | 0-100, nullable |
| missingSkills / recommendedSkills / missingKeywords | [String] | |
| grammarIssues | [{ text, suggestion }] | |
| formattingIssues | [String] | |
| strongerBulletPoints | [{ original, improved }] | |
| suggestedCertifications / suggestedProjects | [String] | |
| overallHiringReadiness | String | `Strong` \| `Moderate` \| `Needs Improvement` |
| summary | String | 2-3 sentence AI summary |
| reportPdfPath | String | path to generated PDF report |
| rawAIResponse | Mixed | full AI JSON for auditing/debugging |
| timestamps | | |

## `jobdescriptions`
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → users | indexed |
| title / company | String | optional metadata |
| rawText | String | pasted JD text |
| extractedKeywords | [String] | keywords matched during JD-match analysis |
| timestamps | | |

## `activitylogs`
| Field | Type | Notes |
|---|---|---|
| user | ObjectId → users | nullable |
| action | String enum | e.g. `USER_LOGIN`, `RESUME_UPLOADED`, `ADMIN_DELETED_USER`, etc. |
| metadata | Mixed | contextual data (ids, filenames) |
| ipAddress | String | |
| timestamps | | |

---

## Relationships
```
User (1) ───< Resume (many)
User (1) ───< AnalysisReport (many)
User (1) ───< JobDescription (many)
Resume (1) ───< AnalysisReport (many)
JobDescription (1) ───< AnalysisReport (many, nullable)
User (1) ───< ActivityLog (many)
```

## Indexes
- `users.email` — unique
- `resumes.user` — for fast per-user listing
- `analysisreports.user` — for dashboard/history queries
- `jobdescriptions.user` — for per-user JD history
