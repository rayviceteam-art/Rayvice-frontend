# 🎨 RAYVICE — FRONTEND ENGINEERING SPECIFICATION & DARK UI DESIGN SYSTEM
## CLIENT-SIDE ARCHITECTURE & COMPONENT IMPLEMENTATION GUIDE

**Target Stack (LOCKED):**
* **Framework:** Next.js 14+ (App Router, TypeScript)
* **Styling:** Tailwind CSS (configured with Rayvice Dark Theme tokens)
* **Icons:** Lucide React (`lucide-react`)
* **State & Data Fetching:** React Hooks + Custom `apiClient` (`lib/api-client.ts`)
* **Auth Status:** ✅ **Module 1 (Login, Register, Forgot Password, Auth Context) is ALREADY IMPLEMENTED**
* **Target Audience:** Frontend Engineers, UI/UX Developers, AI Coding Agents

---

## 1. RAYVICE DARK UI DESIGN SYSTEM (SPECIFICATION & TOKENS)

Rayvice is built with a **"Premium Dark B2B SaaS"** aesthetic.  
**Core Visual Rule:** 90% Dark Neutrals, 8% Emerald/Teal Brand Accents, 2% Bright Status Accents.

```
+------------------------------------------------------------------------------------+
| 70-80% Dark Neutrals (#080B0D, #0A0F10, #131B1C)                                  |
| 15-20% Text & Borders (#F1F5F4, #9AA9A5, #253130)                                  |
| 5-10%  Emerald/Teal (#16A085, #5EE0C1, #0D332D)                                    |
+------------------------------------------------------------------------------------+
```

### 1.1 Color Tokens Palette

| Token Name | Hex Code | Tailwind Class | Primary Usage |
| :--- | :--- | :--- | :--- |
| **Background Default** | `#080B0D` | `bg-background` | Global app background |
| **Sidebar Background** | `#0A0F10` | `bg-background-sidebar` | Main navigation sidebar |
| **Surface / Card** | `#131B1C` | `bg-surface` / `bg-surface-card` | Standard cards, table headers |
| **Elevated / Modal** | `#182122` | `bg-surface-elevated` | Modals, dropdown menus, card hover |
| **Input Background** | `#0E1617` | `bg-background-input` | Text inputs, textareas, selects |
| **Border Default** | `#253130` | `border-border` | Standard card and container borders |
| **Border Hover** | `#34413F` | `border-border-hover` | Interactive element hover border |
| **Primary (Brand)** | `#16A085` | `bg-brand text-brand` | Primary CTAs, active buttons, focus |
| **Primary Hover** | `#1DB89A` | `hover:bg-brand-hover` | Button hover, active link hover |
| **Primary Light / Accent**| `#5EE0C1` | `text-brand-light` | Active nav icons, key metrics, accents |
| **Primary Dark / Active** | `#117A65` | `border-brand-dark` | Pressed buttons, active borders |
| **Primary Background** | `#0D332D` | `bg-brand-bg` | Active navigation item, highlighted cards |
| **Primary Text** | `#F1F5F4` | `text-text-primary` | Headings, main numbers, key labels |
| **Secondary Text** | `#9AA9A5` | `text-text-secondary` | Descriptions, supporting table text |
| **Muted Text** | `#687572` | `text-text-muted` | Placeholders, inactive icons, metadata |
| **Disabled Text** | `#3F4C49` | `text-text-disabled` | Disabled inputs, inactive controls |

### 1.2 Semantic Status Colors

* **Success (Green):** Text `#22C55E` | Bg `#0B2B1B` | Border `#166534` (Paid invoices, valid claims).
* **Warning (Amber):** Text `#F59E0B` | Bg `#2A210B` | Border `#92400E` (Draft invoices, low budget balance).
* **Error (Red):** Text `#EF4444` | Bg `#2B1010` | Border `#991B1B` (Rejected invoices, rate cap errors).
* **Info (Blue):** Text `#3B82F6` | Bg `#0C1D35` | Border `#1D4ED8` (NDIS Price Guide updates).

### 1.3 Typography & Radius Standards
* **Font Family:** `Inter`, sans-serif
* **Headings:**
  * H1: `text-3xl font-bold text-text-primary` (32px / 700)
  * H2: `text-2xl font-semibold text-text-primary` (24px / 600)
  * H3: `text-xl font-semibold text-text-primary` (20px / 600)
  * H4: `text-lg font-semibold text-text-primary` (18px / 600)
* **Border Radii:**
  * Small: `rounded-sm` (6px)
  * Buttons & Inputs: `rounded-btn` (8px)
  * Cards: `rounded-card` (12px)
  * Modals & Large Sections: `rounded-modal` (16px)

---

## 2. FRONTEND ARCHITECTURE & DIRECTORY STRUCTURE

```
Rayvice-frontend/
├── app/
│   ├── (auth)/             # [EXISTING] Login, Register, Forgot Password, Reset
│   ├── dashboard/          # [MODULE 2] Main Overview Dashboard
│   │   └── page.tsx
│   ├── clients/            # [MODULE 3] NDIS Clients & Plan Managers
│   │   ├── page.tsx        # Client List & Budget Overview
│   │   ├── new/page.tsx    # Add New Participant Form
│   │   └── [id]/page.tsx   # Participant Detail & History
│   ├── shifts/             # [MODULE 4] Shift Logging & Voice Entry
│   │   ├── page.tsx        # All Shifts (Filter by Uninvoiced / Invoiced)
│   │   └── new/page.tsx    # Shift Logger with Live Auto-Split Preview
│   ├── invoices/           # [MODULE 5] Invoicing & Auto-Rejection Shield
│   │   ├── page.tsx        # Invoice List (Draft, Sent, Paid)
│   │   ├── generate/       # Batch Invoice Creation Flow
│   │   │   └── page.tsx
│   │   └── [id]/page.tsx   # Invoice PDF Preview & Dispatch Status
│   ├── settings/           # [MODULE 6] ABN, Bank Details & Billing
│   │   ├── page.tsx        # Business Profile & Bank Details (BSB)
│   │   └── billing/        # Stripe Subscription Management ($24 AUD/mo)
│   │       └── page.tsx
│   ├── globals.css         # Global Tailwind & Custom Scrollbar Styles
│   ├── layout.tsx          # Root Layout & Font Definitions
│   └── providers.tsx       # AuthProvider & Toast Notifications
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx   # Sidebar + Top Navbar for Authenticated Pages
│   │   ├── Sidebar.tsx     # Rayvice Dark Sidebar with Emerald Active States
│   │   └── Header.tsx      # Topbar with Profile Avatar & Quick Log Action
│   ├── ui/
│   │   ├── Button.tsx      # Primary, Secondary, Ghost, Danger Variants
│   │   ├── Card.tsx        # Normal, Elevated, and Highlighted Cards
│   │   ├── Input.tsx       # Styled Dark Input with Focus Emerald Rings
│   │   ├── Badge.tsx       # Semantic Status Badges (Active, Pending, Paid)
│   │   ├── Table.tsx       # Dark Surface Table with Hover Highlights
│   │   ├── Modal.tsx       # 16px Rounded Elevated Modal Backdrop
│   │   └── VoiceRecorder.tsx # Audio Recording Button with Pulse Glow
│   ├── shifts/
│   │   ├── ShiftModal.tsx  # Fast 15-Second Shift Logger Modal
│   │   ├── SplitPreview.tsx # Live Preview of NDIS Day/Evening Split Lines
│   │   └── VoiceShiftParser.tsx # Voice to Structured Shift Extractor
│   └── invoices/
│       ├── PreFlightShield.tsx # Auto-Rejection Shield Validation Card
│       ├── InvoicePDFViewer.tsx # In-Browser PDF Preview
│       └── DispatchModal.tsx    # Plan Manager Email Sender Modal
└── lib/
    ├── api-client.ts       # [EXISTING] Axios/Fetch client connected to Express API
    ├── auth-context.tsx    # [EXISTING] Session and JWT tokens
    ├── ndis-rates.ts       # Client-side 2026 NDIS Price Limits Cache
    └── types.ts            # Shared TypeScript Interfaces
```

---

## 3. CORE UI MODULES & SCREEN SPECIFICATIONS

### 3.1 Module 2: Dashboard Overview (`app/dashboard/page.tsx`)

**Goal:** Gives the sole trader an instant snapshot of weekly billings, pending un-invoiced shifts, and a 1-tap shift entry button.

```
+------------------------------------------------------------------------------------+
|  Rayvice Dashboard                                        [ + Log Shift (Voice) ]  |
+------------------------------------------------------------------------------------+
|  [ STAT CARD 1 ]          [ STAT CARD 2 ]          [ STAT CARD 3 ]                 |
|  This Week's Earnings     Un-invoiced Shifts       Active Participants             |
|  $2,450.20 AUD            5 Shifts ($1,120 AUD)    6 Clients                       |
|  +12% from last week      [ Generate Invoice -> ]  All plans active                |
+------------------------------------------------------------------------------------+
|  [ RECENT SHIFTS TABLE ]                           [ NDIS BUDGET WATCH ]           |
|  Client     Date     Hours   Rate Type   Status    |  Sarah Jenkins: 85% Remaining |
|  Sarah J.   Today    3.0h    Day+Evening Pending   |  David Miller:  40% Remaining |
|  David M.   Yesterday 4.0h   Saturday    Pending   |  Emma Watson:   15% (Alert!)  |
+------------------------------------------------------------------------------------+
```

#### Key UI Components:
1. **Quick Action Header:** Prominent `#16A085` Primary CTA: `+ Log Shift (Voice)`.
2. **Un-invoiced Banner Alert:** If pending shifts > 0, shows a highlighted card (`bg-brand-bg border-brand-dark`) with a 1-click `Generate Invoice` button.
3. **Budget Health Watchlist:** Displays participant remaining budget with color-coded progress bars (Green > 30%, Amber 10-30%, Red < 10%).

---

### 3.2 Module 3: NDIS Clients & Plan Managers (`app/clients/page.tsx`)

**Goal:** Manage participant NDIS numbers, plan management types, and agency billing email routes.

#### Form Specification (`app/clients/new/page.tsx`):
* **Participant Full Name:** Text input (`bg-background-input border-border`).
* **NDIS Number (Required):** 9-digit numeric input with live format validator (e.g. `430 123 456`).
* **Date of Birth:** Optional date picker.
* **Plan Management Type:** 3-Way Radio / Segmented Button:
  1. `Plan-Managed` (90% of cases) — Reveals Plan Manager Agency Name & Billing Email fields.
  2. `Self-Managed` — Reveals Parent / Nominee direct email & phone.
  3. `NDIA-Managed` — Displays agency portal warning.
* **Default Support Category:** Dropdown selecting default item (e.g. `01_011_0107_1_1 - Daily Life Support`).
* **Agreed Hourly Rate ($ AUD):** Pre-filled with current 2026 NDIA cap (`$67.56`).

---

### 3.3 Module 4: Shift Logger with Voice & Live Split Preview (`app/shifts/page.tsx`)

**Goal:** Allow workers in their cars to log shifts in under 15 seconds via Voice or 1-Tap entry.

#### The Shift Logger Modal (`components/shifts/ShiftModal.tsx`):

```tsx
// components/shifts/ShiftModal.tsx
import React, { useState } from 'react';
import { Mic, Clock, Car, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ShiftModal({ isOpen, onClose, clients }: { isOpen: boolean; onClose: () => void; clients: any[] }) {
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:30');
  const [travelKms, setTravelKms] = useState('12');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-modal bg-surface-elevated border border-border p-6 shadow-modal">
        {/* Header with Voice Pulse */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
          <div>
            <h3 className="text-xl font-semibold text-text-primary">Log NDIS Shift</h3>
            <p className="text-sm text-text-secondary">Tap voice or enter shift times below</p>
          </div>
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'bg-brand text-white hover:bg-brand-hover shadow-glow'
            }`}
          >
            <Mic className="w-6 h-6" />
          </button>
        </div>

        {/* Live Auto-Split Preview Box */}
        <div className="rounded-card bg-surface border border-border p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-text-muted uppercase">
            <span>NDIS Calculation Engine</span>
            <span className="text-brand-light flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Split Active
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm py-1.5 border-b border-border/50">
              <span className="text-text-primary">01_011_0107_1_1 (Day 18:00 - 20:00)</span>
              <span className="font-semibold text-text-primary">2.0 hrs × $67.56 = $135.12</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1.5 border-b border-border/50">
              <span className="text-text-primary">01_015_0107_1_1 (Evening 20:00 - 21:30)</span>
              <span className="font-semibold text-text-primary">1.5 hrs × $74.42 = $111.63</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1.5">
              <span className="text-text-primary">01_799_0107_1_1 (Transport 12 km)</span>
              <span className="font-semibold text-text-primary">12 km × $0.97 = $11.64</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border font-bold text-brand-light">
            <span>Total Shift Claim:</span>
            <span>$258.39 AUD</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary">Save Shift</Button>
        </div>
      </div>
    </div>
  );
}
```

---

### 3.4 Module 5: Invoicing & "Auto-Rejection Shield" (`app/invoices/generate/page.tsx`)

**Goal:** Convert uninvoiced shifts into a 100% compliant PDF Tax Invoice and dispatch to Plan Managers with 0% rejection risk.

#### The Auto-Rejection Shield Component (`components/invoices/PreFlightShield.tsx`):

```tsx
// components/invoices/PreFlightShield.tsx
import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ShieldProps {
  isValid: boolean;
  errors: string[];
  totalAmount: number;
  recipientEmail: string;
}

export function PreFlightShield({ isValid, errors, totalAmount, recipientEmail }: ShieldProps) {
  if (isValid) {
    return (
      <div className="rounded-card bg-status-success-bg border border-status-success-border p-4 mb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-status-success flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-status-success-text flex items-center gap-2">
              Auto-Rejection Shield: 100% NDIS Compliant
            </h4>
            <p className="text-xs text-status-success-text/80 mt-1">
              All line items conform to official 2026 NDIA price limits. Invoice ready for instant 48-hour payment by Plan Manager.
            </p>
            <div className="mt-2 text-xs font-mono text-status-success-text">
              Dispatching to: <span className="underline">{recipientEmail}</span> | Total: ${totalAmount.toFixed(2)} AUD
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card bg-status-error-bg border border-status-error-border p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-status-error flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-status-error-text">
            Invoice Dispatch Blocked (Rejection Prevention Active)
          </h4>
          <ul className="mt-2 space-y-1 text-xs text-status-error-text list-disc list-inside">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. DESIGN SYSTEM UI COMPONENT LIBRARY

### 4.1 Button Component (`components/ui/Button.tsx`)

```tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all rounded-btn focus:outline-none disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = {
    primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-dark disabled:bg-surface-elevated disabled:text-text-disabled shadow-sm',
    secondary: 'bg-transparent border border-border-hover text-text-primary hover:bg-surface hover:border-brand disabled:border-border disabled:text-text-disabled',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary disabled:text-text-disabled',
    danger: 'bg-status-error text-white hover:bg-red-600 active:bg-red-700 disabled:bg-surface-elevated',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
```

---

### 4.2 Card Component (`components/ui/Card.tsx`)

```tsx
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'normal' | 'elevated' | 'highlighted';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'normal',
  className = '',
  ...props
}) => {
  const variantStyles = {
    normal: 'bg-surface border-border hover:border-border-hover',
    elevated: 'bg-surface-elevated border-border-hover shadow-modal',
    highlighted: 'bg-brand-bg border-brand-dark shadow-glow',
  };

  return (
    <div
      className={`rounded-card border p-5 transition-all ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
```

---

### 4.3 Input Component (`components/ui/Input.tsx`)

```tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-input bg-background-input px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted border transition-all focus:outline-none ${
            error
              ? 'border-status-error focus:ring-1 focus:ring-status-error'
              : 'border-border focus:border-brand focus:ring-1 focus:ring-brand'
          } disabled:bg-surface disabled:text-text-disabled disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-status-error">{error}</p>}
        {helperText && !error && <p className="text-xs text-text-secondary">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---

## 5. APP SHELL & SIDEBAR NAVIGATION (`components/layout/Sidebar.tsx`)

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CalendarCheck2, FileText, Settings, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Participants', href: '/clients', icon: Users },
    { name: 'Shifts & Hours', href: '/shifts', icon: CalendarCheck2 },
    { name: 'Tax Invoices', href: '/invoices', icon: FileText },
    { name: 'Business Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 flex flex-col h-screen bg-background-sidebar border-r border-border fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-border">
        <div className="w-8 h-8 rounded-btn bg-brand flex items-center justify-center text-white shadow-glow">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <span className="text-lg font-bold tracking-wide text-text-primary">Rayvice</span>
        <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-brand-bg text-brand-light border border-brand-dark ml-auto">
          NDIS OS
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-btn text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-bg text-brand-light border border-brand-dark'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-brand-light' : 'text-text-muted'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <div className="flex flex-col truncate">
          <span className="text-sm font-medium text-text-primary truncate">{user?.firstName} {user?.lastName}</span>
          <span className="text-xs text-text-muted truncate">{user?.email}</span>
        </div>
        <button
          onClick={logout}
          title="Log out"
          className="text-text-muted hover:text-status-error p-1.5 rounded transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
```

---

## 6. FRONTEND IMPLEMENTATION TIMELINE & ROADMAP

- [ ] **Day 1:** Implement `AppLayout.tsx` and `Sidebar.tsx` with Rayvice Dark UI tokens.
- [ ] **Day 2:** Build `/dashboard` overview cards & weekly billings metrics.
- [ ] **Day 3:** Build `/clients` participant listing, search, and creation forms.
- [ ] **Day 4:** Build `ShiftModal.tsx` with Live Auto-Split Preview calculation engine.
- [ ] **Day 5:** Connect `VoiceRecorder.tsx` to `/api/v1/shifts/voice-parse` for audio shift entry.
- [ ] **Day 6:** Build `/invoices/generate` batch selection & `PreFlightShield.tsx` validation banner.
- [ ] **Day 7:** Build In-Browser PDF preview & Direct Email Dispatch modal.

---
**Status:** 100% Complete & Aligned with Rayvice Dark UI Design System. Ready for developer implementation.
