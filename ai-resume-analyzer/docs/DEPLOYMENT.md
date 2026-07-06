# Deployment Guide

## 1. MongoDB Atlas
1. Create a free cluster at https://cloud.mongodb.com
2. Create a database user and whitelist `0.0.0.0/0` (or your host's IP) under Network Access.
3. Copy the connection string into `MONGO_URI` in your backend `.env`.

## 2. Backend — Deploy to Render
1. Push the `backend/` folder to a GitHub repo (or the whole monorepo).
2. On Render: New → Web Service → connect your repo.
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
3. Add environment variables from `.env.example` in Render's dashboard (Environment tab):
   `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `AI_PROVIDER`, `GEMINI_API_KEY` or `OPENAI_API_KEY`,
   `CLIENT_URL` (your deployed frontend URL), `SMTP_*`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
4. Deploy. Note the Render URL, e.g. `https://resume-analyzer-api.onrender.com`.
5. (Optional) Run the admin seed once via Render's Shell tab: `npm run seed:admin`.

> Note: Render's free tier uses an ephemeral filesystem — uploaded PDFs and generated
> reports will be lost on redeploy/restart. For production, swap local disk storage
> for a persistent store (e.g. AWS S3, Cloudinary) in `middleware/upload.js` and
> `utils/pdfReportGenerator.js`.

## 3. Frontend — Deploy to Vercel
1. Push the `frontend/` folder to GitHub.
2. On Vercel: New Project → import repo.
   - Root directory: `frontend`
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variable: `VITE_API_URL=https://resume-analyzer-api.onrender.com/api`
4. Deploy. Update the backend's `CLIENT_URL` env var to this Vercel URL and redeploy the backend
   so CORS allows it.

## 4. Local Development
```bash
# Backend
cd backend
cp .env.example .env   # fill in real values
npm install
npm run dev             # http://localhost:5000

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## 5. Getting AI API Keys
- **Gemini**: https://aistudio.google.com/app/apikey (free tier available)
- **OpenAI**: https://platform.openai.com/api-keys

Set `AI_PROVIDER=gemini` or `AI_PROVIDER=openai` in the backend `.env` accordingly.

## 6. Production Checklist
- [ ] Strong, random `JWT_SECRET`
- [ ] Real SMTP credentials for email verification / password reset
- [ ] MongoDB Atlas IP allowlist restricted to Render's egress IPs (or use a VPC peering setup)
- [ ] File storage moved to S3/Cloudinary for persistence across deploys
- [ ] HTTPS enforced (Render and Vercel provide this by default)
- [ ] Monitor AI API usage/costs — analysis endpoints are rate-limited but track spend
