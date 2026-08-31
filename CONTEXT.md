# Rayvice — Project Master Context (Frontend)

> **Last Updated**: August 31, 2026  
> **Status**: Module 1 Complete (Authentication, Multi-Tenant Foundation, Google OAuth 2.0 Integration, Rayvice Dark UI System)  
> **Niche**: Australian NDIS Sole-Trader Billing & Compliance OS

---

## 1. Project Overview & Architecture

**Rayvice Frontend** is a mobile-first, high-performance Next.js web application engineered for independent Australian NDIS Sole Traders (Support Workers, Independent Carers, and Allied Health Providers).

### System Architecture
```
┌────────────────────────────────────────────────────────┐
│              Rayvice Frontend (Next.js)                │
│    Hosted on Vercel: https://www.rayvice.com           │
│    App Router • TailwindCSS • React Hot Toast • Lucide │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / REST API
┌──────────────────────────▼─────────────────────────────┐
│              Rayvice Backend (Express + TS)            │
│    Hosted on Render: https://rayvice-backend.onrender.com
│    Prisma ORM • PostgreSQL • JWT Auth • Resend/SMTP    │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│          PostgreSQL Database (Neon / Multi-Tenant)     │
│    Tenant-isolated via businessId • Immutable Audits   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack & Deployments

| Component | Technology | Production Deployment |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS | Vercel (`rayvice.com`, `www.rayvice.com`) |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, Zod | Render (`rayvice-backend.onrender.com`) |
| **Database** | PostgreSQL (Neon Serverless) | Neon PostgreSQL |
| **Authentication**| JWT (Access/Refresh Tokens), Google OAuth 2.0, Argon2id | Hybrid (Local + OAuth) |
| **Design System** | Rayvice Dark UI Design System (Emerald/Teal `#16A085` on Dark `#080B0D`) | Tailwind Custom Theme |

---

## 3. Rayvice Dark UI Design System

* **Backgrounds:** Global `#080B0D`, Sidebar `#0A0F10`, Card Surface `#131B1C`, Elevated `#182122`, Input `#0E1617`
* **Borders:** Default `#253130`, Hover `#34413F`, Focus `#16A085`
* **Brand Accents:** Primary `#16A085`, Hover `#1DB89A`, Light Accent `#5EE0C1`, Active Dark `#117A65`, Active Bg `#0D332D`
* **Typography:** `Inter` (H1 32px Bold, H2 24px SemiBold, Body 14-16px, Caption 12px)
* **Design Balance:** 90% Dark Neutrals, 8% Emerald Brand, 2% Semantic Status Accents.

---

## 4. Frontend Route Architecture

### Module 1: Auth & Onboarding ✅ (COMPLETE)
* `/login` — Email/password + 1-Tap Google Sign-In
* `/register` — Business registration + Google Sign-Up (Starts 14-day trial)
* `/forgot-password` & `/reset-password`
* `/verify-email`

### Modules 2–6: NDIS OS Core (UPCOMING)
* `/dashboard` — Weekly billings, pending un-invoiced shifts counter, participant budget health watch
* `/clients` & `/clients/new` — NDIS Participant management, 9-digit validation, Plan Manager email routing
* `/shifts` & `/shifts/new` — Shift logging, Voice-to-JSON assistant, live auto-split calculation preview
* `/invoices` & `/invoices/generate` — Auto-Rejection Shield pre-flight validator, PDF viewer, direct email dispatch
* `/settings` & `/settings/billing` — ABN, BSB/Bank account config & Stripe subscriptions ($24 AUD/mo)

---

## 5. Environment Variables Reference (`.env.local`)

```bash
NEXT_PUBLIC_API_URL="https://rayvice-backend.onrender.com/api"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="1059143178866-opnovptf4l8tfe8cefeln6lvf29mdedv.apps.googleusercontent.com"
```
