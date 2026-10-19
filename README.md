# AI Resume Checker

AI Resume Checker is a React/Vite frontend and an Express/MongoDB API. The
frontend and API are deployed separately: Vercel serves the frontend and Render
runs the API.

## Local development

Requirements: Node.js 20 or newer and npm.

1. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI` and
   `JWT_SECRET`. Add a `GEMINI_API_KEY` to enable Gemini-powered analysis.
2. Install dependencies and run both apps from the repository root:

   ```sh
   npm ci
   npm --prefix backend ci
   npm --prefix frontend/ai-resume-checker-ui-boilerplate-code ci
   npm run dev
   ```

The frontend runs at `http://localhost:5173` and proxies `/api` to the backend
at `http://127.0.0.1:5000`. The API health endpoint is `/api/health`.

## Deploy the API to Render

The root `render.yaml` defines the web service. In Render, create a Blueprint
from this repository and provide:

- `MONGO_URI`: a MongoDB connection string reachable by Render.
- `CLIENT_ORIGIN`: the exact Vercel frontend origin, for example
  `https://your-project.vercel.app`. Multiple origins can be comma-separated.
- `GEMINI_API_KEY` (optional): set this if you want Gemini-powered analysis.

Render generates `JWT_SECRET` and sets `NODE_ENV=production`. The API uses
Render's `PORT` and exposes `/api/health` for health checks.

## Deploy the frontend to Vercel

Import the repository into Vercel and set the **Root Directory** to
`frontend/ai-resume-checker-ui-boilerplate-code`. Use the default Vite build
settings (`npm run build`, output directory `dist`) and add this environment
variable:

- `VITE_API_URL`: the Render API URL ending in `/api`, for example
  `https://your-api.onrender.com/api`.

Set it for each Vercel environment you deploy (Production, Preview, and/or
Development), then redeploy after changing it. `vercel.json` routes client-side
React Router paths back to the Vite app.

The API must allow the exact Vercel origin through Render's `CLIENT_ORIGIN`
setting. Production auth cookies require HTTPS; the API sets them as secure,
HTTP-only, and `SameSite=None`.

## Environment variables

The API reads its environment from Render or `backend/.env` locally. The
frontend reads `VITE_API_URL` at build time; leave it unset locally to use the
Vite development proxy. Do not commit `.env` files or production credentials.
