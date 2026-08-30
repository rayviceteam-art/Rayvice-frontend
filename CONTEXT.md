# Rayvice — Project Master Context

> **Last Updated**: August 30, 2026  
> **Status**: Module 1 Complete (Authentication, Multi-Tenant Foundation, Google OAuth 2.0 Integration)

---

## 1. Project Overview & Architecture

**Rayvice** is an AI-powered multi-tenant SaaS platform built for field service, automotive repair, and specialty service businesses.

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
│          PostgreSQL Database (Multi-Tenant)            │
│    Tenant-isolated via businessId • Immutable Audits   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack & Deployments

| Component | Technology | Production Deployment |
| :--- | :--- | :--- |
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS | Vercel (`rayvice.com`, `www.rayvice.com`) |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, Zod | Render (`rayvice-backend.onrender.com`) |
| **Database** | PostgreSQL | Cloud PostgreSQL (Prisma Managed) |
| **Authentication**| JWT (Access/Refresh Tokens), Google OAuth 2.0, bcrypt | Hybrid (Local + OAuth) |
| **Email Service** | SMTP / Resend API | Transactional Verification & Reset |

---

## 3. Database Schema & Multi-Tenancy (Module 1)

All records are strictly isolated by `businessId` (Tenant isolation).

### Key Models (`prisma/schema.prisma`):
- **`Business`**: The tenant entity. Includes trial tracking (`trialStartedAt`, `trialEndsAt`, `hasUsedTrial`, `status`).
  - Statuses: `TRIALING`, `ACTIVE`, `READ_ONLY`, `SUSPENDED`
- **`User`**: Belongs to exactly 1 Business.
  - Roles: `OWNER`, `OFFICE_MANAGER`, `TECHNICIAN`
  - Statuses: `INVITED`, `ACTIVE`, `SUSPENDED`
- **`RefreshToken`**: Secure SHA-256 hashed refresh tokens with rotation & revocation.
- **`EmailVerificationToken`**: Token for initial registration email confirmation.
- **`PasswordResetToken`**: Secure hashed password reset tokens with single-use consumption.
- **`InvitationToken`**: Allows Owners to invite staff members to their organization.
- **`AuditLog`**: Immutable ledger of all security, authentication, and organizational events.

---

## 4. Authentication & Security Flows

1. **Email / Password Flow**:
   - `POST /api/auth/register` (Creates Business in `TRIALING` + User as `OWNER` + sends verification email)
   - `POST /api/auth/login` (Returns Access Token + HttpOnly Refresh Token)
   - `POST /api/auth/refresh` (Rotates Refresh Token)
   - `POST /api/auth/logout` (Revokes session)
   - `POST /api/auth/forgot-password` & `POST /api/auth/reset-password`
   - `POST /api/auth/verify-email` & `POST /api/auth/resend-verification`
2. **Google OAuth 2.0 Flow**:
   - `POST /api/auth/google` (Verifies Google `id_token` / `access_token`, auto-provisions or logs in user)
   - Google Client ID: `1059143178866-opnovptf4l8tfe8cefeln6lvf29mdedv.apps.googleusercontent.com`
   - Frontend Trigger: `components/ui/GoogleButton.tsx`

---

## 5. Environment Variables Reference

### Frontend (`Rayvice-frontend/.env.local` & Vercel)
- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g. `https://rayvice-backend.onrender.com/api`)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: `1059143178866-opnovptf4l8tfe8cefeln6lvf29mdedv.apps.googleusercontent.com`

### Backend (`Rayvice-backend/.env` & Render)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_ACCESS_SECRET`: Secret for signing access tokens
- `JWT_REFRESH_SECRET`: Secret for signing refresh tokens
- `PORT`: Default `5000` / dynamic port
- `CORS_ORIGIN`: Allowed origins (e.g. `https://www.rayvice.com,https://rayvice.com`)

---

## 6. Recently Modified Files & Commits

### Frontend (`Rayvice-frontend`):
- `tailwind.config.ts` & `app/globals.css`: Implemented Rayvice Dark UI Design System (Neutrals `#080B0D`/`#131B1C`, Brand Teal `#16A085`, Text `#F1F5F4`/`#9AA9A5`).
- `components/ui/Button.tsx`, `Card.tsx`, `Input.tsx`, `GoogleButton.tsx`: Full component dark styling, focus rings, hover states, and transitions.
- `components/layout/AuthLayout.tsx` & `app/dashboard/page.tsx`: Updated layouts, dark headers, emerald brand glow badge, and alert states.
- `app/(auth)/*`: Completely updated all auth views (Login, Register, Forgot Password, Reset Password, Verify Email) with dark cards, modern typography, and input visibility toggles.

### Backend (`Rayvice-backend`):
- `src/auth/auth.controller.ts`: Added `googleAuth` handler.
- `src/auth/auth.service.ts`: Added `verifyGoogleToken` and tenant provisioning for Google users.
- `src/auth/auth.validators.ts`: Added `googleAuthSchema`.
- `src/auth/auth.routes.ts`: Added `/api/auth/google` endpoint.

---

## 7. Next Steps & Pending Roadmap

1. **Module 2: Customer Management & CRM**
   - Customer profiles (Contact info, vehicles/equipment, service history)
   - Address and service location management
2. **Module 3: Scheduling & Dispatching**
   - Appointment calendar and technician route assignment
   - Availability and dispatch rules
3. **Module 4: AI Voice & Chat Assistant**
   - Automated inbound call/chat intake
   - Lead qualification and appointment booking integration
4. **Module 5: Invoicing & Billing**
   - Stripe integration, automated invoicing, trial expiration enforcement
