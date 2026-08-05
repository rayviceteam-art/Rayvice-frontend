# Rayvice Frontend — Module 1: Authentication, Organization & Tenant Foundation

Next.js (App Router, TypeScript) frontend for the auth module only, wired to
match `src/auth/auth.routes.ts` on the backend exactly.

## What's included

- Login, Register (business + owner signup), Forgot Password, Reset Password,
  Verify Email pages
- A minimal protected `/dashboard` placeholder proving login → session →
  protected route works end-to-end (real dashboard widgets are a later module)
- Centralized API client (`lib/api-client.ts`) with automatic access-token
  refresh on 401
- Auth state via React Context (`lib/auth-context.tsx`)
- Design system colors/typography from FRONTEND-02 wired into Tailwind

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local — set NEXT_PUBLIC_API_URL to your Render backend's /api URL
npm run dev
```

Open http://localhost:3000 — it redirects to `/login`.

## Deploying to Vercel

1. Push this to GitHub.
2. Import the repo in Vercel.
3. Add environment variable `NEXT_PUBLIC_API_URL` (Vercel dashboard →
   Settings → Environment Variables) pointing at your Render backend, e.g.
   `https://rayvice-backend.onrender.com/api`.
4. Deploy.

## Before this works end-to-end, confirm on the backend

- `CORS_ORIGIN` (Render env var) matches your Vercel URL exactly.
- The refresh-token cookie (`src/utils/cookies.ts`) is set with
  `SameSite=None; Secure` — required because Vercel and Render are different
  domains. Without this, login works but the session won't survive a page
  refresh.
- `/api/auth/*` paths match what's in `lib/auth-service.ts` — if your Express
  app mounts auth routes somewhere other than `/api/auth`, update
  `NEXT_PUBLIC_API_URL` or the paths accordingly.

## Testing this module manually

1. `/register` — create a business + owner account → should land on
   `/dashboard` immediately (3-day trial auto-activates).
2. Refresh the dashboard page — you should stay logged in (tests the
   refresh-token cookie flow).
3. Click "Log out" → redirected to `/login`.
4. Log back in with the same credentials at `/login`.
5. `/forgot-password` → check email for reset link → `/reset-password?token=...`
6. Check email for verification link → `/verify-email?token=...`

## Next module

Do not add business/CRM/dashboard features to these files. Start a new
module in its own folder under `app/` and reuse `lib/api-client.ts`,
`lib/auth-context.tsx`, and the `components/ui/*` primitives as-is.
