# Rayvice Frontend — NDIS Sole-Trader Billing & Compliance OS

**Next.js 14+ (App Router, TypeScript) • Rayvice Dark UI Design System**

The mobile-first web frontend for Rayvice, engineered for independent Australian NDIS Sole Traders (Support Workers, Independent Carers, and Allied Health Providers).

---

## 1. What's Included

- **Module 1 (Auth & Onboarding):** Login, Register (Business/Sole Trader + Owner signup), Forgot Password, Reset Password, Verify Email pages, Google OAuth 2.0 1-Tap Sign-In.
- **Design System:** Custom Dark Theme (`#080B0D` background, `#131B1C` cards, `#16A085` emerald brand accents, Inter typography).
- **API Client (`lib/api-client.ts`):** Centralized HTTP client connected to Express API with auto access-token refresh on 401.
- **Auth Context (`lib/auth-context.tsx`):** Reactive user session & JWT state management.

---

## 2. Upcoming NDIS Modules

- **Dashboard (`/dashboard`):** Weekly billings progress, uninvoiced shifts counter, participant budget health watch.
- **Participants (`/clients`):** 9-digit NDIS validation, Plan Management badges, agency billing email routes.
- **Shift Logger (`/shifts`):** 15-second voice/1-tap logging, live auto-split rate engine preview.
- **Invoicing (`/invoices`):** Auto-Rejection Shield pre-flight validator, in-browser PDF viewer, direct email dispatch.
- **Settings (`/settings`):** ABN, BSB & Bank details, Stripe Australian subscription management ($24 AUD/mo).

---

## 3. Setup & Local Development

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL to http://localhost:5000/api (local) or your Render backend URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/login`.

---

## 4. Deploying to Vercel

1. Push changes to GitHub.
2. Ensure environment variable `NEXT_PUBLIC_API_URL` is set in Vercel dashboard to your Render backend API URL (e.g. `https://rayvice-backend.onrender.com/api`).
3. Ensure backend `CORS_ORIGIN` contains your Vercel domain.

