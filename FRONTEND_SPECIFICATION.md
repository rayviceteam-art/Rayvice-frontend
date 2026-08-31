# 🎨 RAYVICE — NDIS SOLE-TRADER BILLING & COMPLIANCE OS (AUSTRALIA)
## COMPREHENSIVE FRONTEND ENGINEERING SPECIFICATION & DARK UI DESIGN SYSTEM

> **Document Version**: 2.0.0 (Production Blueprint)  
> **Target Audience**: Frontend Engineers, UI/UX Developers, AI Coding Agents  
> **Core Objective**: Eliminate 100% of guesswork so any AI agent or software engineer can build the exact user interface, components, routing, and state workflows without guessing design tokens, forms, or business rules.  
> **Target Market**: Australia — National Disability Insurance Scheme (NDIS) Sole Traders.

---

## 1. RAYVICE DARK UI DESIGN SYSTEM (TOKENS & SPECIFICATIONS)

Rayvice is built with a **"Premium Dark B2B SaaS"** aesthetic engineered specifically for high contrast, fast mobile entry, and reduced eye strain for support workers logging shifts in their vehicles.

### 1.1 Color Tokens Hierarchy

```
+------------------------------------------------------------------------------------+
| 70-80% Dark Neutrals (#080B0D, #0A0F10, #131B1C, #182122)                         |
| 15-20% Text & Borders (#F1F5F4, #9AA9A5, #253130, #34413F)                         |
| 5-10%  Emerald/Teal Brand Accents (#16A085, #5EE0C1, #0D332D, #117A65)             |
+------------------------------------------------------------------------------------+
```

| Token Name | Hex Code | Tailwind Class | Primary Usage |
| :--- | :--- | :--- | :--- |
| **Background Default** | `#080B0D` | `bg-background` | Global application canvas |
| **Sidebar Background** | `#0A0F10` | `bg-[#0A0F10]` | Navigation sidebar & sticky topbars |
| **Surface / Card** | `#131B1C` | `bg-surface` / `bg-[#131B1C]` | Standard cards, table rows, panel backgrounds |
| **Elevated / Modal** | `#182122` | `bg-surface-elevated` | Modals, dropdown menus, floating popovers |
| **Input Background** | `#0E1617` | `bg-[#0E1617]` | Text fields, selects, time pickers, textareas |
| **Border Default** | `#253130` | `border-border` / `border-[#253130]` | Card outlines, dividers, subtle borders |
| **Border Hover** | `#34413F` | `border-[#34413F]` | Interactive card & input hover states |
| **Primary Brand** | `#16A085` | `bg-brand text-brand` / `#16A085` | Primary CTA buttons, active focus rings |
| **Primary Hover** | `#1DB89A` | `hover:bg-[#1DB89A]` | Button hover states, active tab highlights |
| **Primary Light (Glow)**| `#5EE0C1` | `text-[#5EE0C1]` | Active icons, total claim amounts, key metrics |
| **Primary Dark (Border)**| `#117A65` | `border-[#117A65]` | Pressed buttons, badge borders |
| **Primary Background** | `#0D332D` | `bg-[#0D332D]` | Active navigation background, highlight badge |
| **Primary Text** | `#F1F5F4` | `text-[#F1F5F4]` | H1–H4 Headings, primary labels, main numbers |
| **Secondary Text** | `#9AA9A5` | `text-[#9AA9A5]` | Subtitles, helper text, table column labels |
| **Muted Text** | `#687572` | `text-[#687572]` | Inactive icons, timestamps, placeholders |
| **Disabled Text** | `#3F4C49` | `text-[#3F4C49]` | Disabled inputs, inactive controls |

### 1.2 Semantic Status Badges & Colors

* **Success (Green):** Text `#22C55E` | Bg `#0B2B1B` | Border `#166534` (Paid invoices, 100% compliant shield).
* **Warning (Amber):** Text `#F59E0B` | Bg `#2A210B` | Border `#92400E` (Draft invoices, budget warning > 70% used).
* **Error (Red):** Text `#EF4444` | Bg `#2B1010` | Border `#991B1B` (Blocked invoices, price cap violations, budget exhausted).
* **Info (Blue):** Text `#3B82F6` | Bg `#0C1D35` | Border `#1D4ED8` (NDIS 2026 Price Guide catalogue updates).

### 1.3 Typography & Radius Standards
* **Font Family:** `Inter`, sans-serif
* **Headings:**
  * H1: `text-3xl font-bold text-[#F1F5F4] tracking-tight` (32px / 700)
  * H2: `text-2xl font-semibold text-[#F1F5F4] tracking-tight` (24px / 600)
  * H3: `text-xl font-semibold text-[#F1F5F4]` (20px / 600)
  * H4: `text-base font-semibold text-[#F1F5F4]` (16px / 600)
* **Border Radii:**
  * Small: `rounded-sm` (4px)
  * Buttons & Inputs: `rounded-btn` (8px / `rounded-lg`)
  * Cards: `rounded-card` (12px / `rounded-xl`)
  * Modals & Large Banners: `rounded-modal` (16px / `rounded-2xl`)

---

## 2. FRONTEND ROUTE ARCHITECTURE & DIRECTORY STRUCTURE

```
Rayvice-frontend/
├── app/
│   ├── (auth)/                     # [MODULE 1] Authentication Pages (Implemented)
│   │   ├── login/page.tsx          # Email/Password + 1-Tap Google Sign-In
│   │   ├── register/page.tsx       # Sole Trader signup with ABN/Industry
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── verify-email/page.tsx
│   ├── dashboard/                  # [MODULE 2] Overview Dashboard
│   │   └── page.tsx                # Billings stats, Uninvoiced banner, Budget watch
│   ├── clients/                    # [MODULE 3] NDIS Participants & Plan Managers
│   │   ├── page.tsx                # Client directory table with search & filter
│   │   ├── new/page.tsx            # Add participant form (Plan vs Self Managed)
│   │   └── [id]/page.tsx           # Participant history, budget utilization & notes
│   ├── shifts/                     # [MODULE 4] Shift Logging & Live Auto-Split
│   │   ├── page.tsx                # Shift list (Uninvoiced vs Invoiced tabs)
│   │   └── new/page.tsx            # Dedicated shift logger view
│   ├── invoices/                   # [MODULE 5] Invoicing & Auto-Rejection Shield
│   │   ├── page.tsx                # Invoice directory (Draft, Sent, Paid, Rejected)
│   │   ├── generate/page.tsx       # Batch shift selection & Pre-Flight Shield
│   │   └── [id]/page.tsx           # In-browser PDF viewer & direct email dispatch
│   ├── settings/                   # [MODULE 6] Business Profile & Bank Details
│   │   ├── page.tsx                # ABN, BSB, Account Number, GST config
│   │   └── billing/page.tsx        # Stripe subscription portal ($24 AUD/mo)
│   ├── globals.css                 # Dark UI variables & custom scrollbar
│   ├── layout.tsx                  # Root layout with NDIS metadata
│   └── providers.tsx               # AuthProvider, Toast notifications
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx           # Authenticated shell (Sidebar + Header + Main)
│   │   ├── Sidebar.tsx             # Rayvice Dark Sidebar with Emerald navigation
│   │   ├── Header.tsx              # Top bar with "+ Log Shift (Voice)" quick CTA
│   │   ├── AuthLayout.tsx          # Auth centered card layout
│   │   └── ProtectedRoute.tsx      # Auth session route guard
│   ├── ui/
│   │   ├── Button.tsx              # Primary, Secondary, Ghost, Danger variants
│   │   ├── Card.tsx                # Normal, Elevated, and Highlighted cards
│   │   ├── Input.tsx               # Dark input with emerald focus ring & error states
│   │   ├── Badge.tsx               # Semantic status badge pill
│   │   ├── Table.tsx               # Dark surface table with hover rows
│   │   ├── Modal.tsx               # 16px rounded backdrop modal
│   │   └── VoiceRecorder.tsx       # Audio recorder button with red pulsing glow
│   ├── shifts/
│   │   ├── ShiftModal.tsx          # Fast 15-second popup shift logger
│   │   ├── SplitPreview.tsx        # Real-time auto-split rate breakdown box
│   │   └── VoiceShiftParser.tsx    # Audio speech-to-JSON extractor
│   └── invoices/
│       ├── PreFlightShield.tsx     # Auto-Rejection Shield validation card
│       ├── InvoicePDFViewer.tsx    # In-browser PDF stream preview
│       └── DispatchModal.tsx       # Plan Manager email dispatch confirmation
└── lib/
    ├── api-client.ts               # Axios instance with 401 token refresh interceptor
    ├── auth-context.tsx            # User session & JWT state
    ├── auth-service.ts             # Auth REST client
    ├── ndis-rates.ts               # Official 2026 NDIA price limits cache
    ├── types.ts                    # Shared TypeScript interfaces
    └── validators.ts               # Zod validation schemas
```

---

## 3. DETAILED UI MODULE SPECIFICATIONS

---

### 📌 MODULE 1: AUTHENTICATION & ONBOARDING (IMPLEMENTED)

#### 3.1 Purpose & Flow
- Fast, low-friction registration tailored to Australian sole traders.
- Directly supports **1-Tap Google Sign-Up** (`GoogleButton.tsx`) and standard Email/Password.
- Registration creates the tenant, activates the **9-day free trial** (216 hours, limited to 1 participant, 5 shifts, 2 invoices), and redirects immediately to `/dashboard`.

#### 3.2 Key Views
1. **`/login`:** Email + Password with password visibility toggle + Google Sign-In.
2. **`/register`:** Fields: Business Name (`e.g. Liam Support Services`), Phone (`0412 345 678`), Role (`e.g. NDIS Support Worker`), Owner Name, Email, Password.
3. **`/forgot-password` & `/reset-password`:** Single-use token reset flow with real-time password strength validation.

---

### 📌 MODULE 2: OVERVIEW DASHBOARD (`app/dashboard/page.tsx`) (IMPLEMENTED)

#### 4.1 Purpose & Screen Layout
Provides sole traders with an instant 5-second snapshot of weekly revenue, pending unbilled shifts, and participant budget health.

```
+------------------------------------------------------------------------------------+
|  Rayvice Dashboard                                        [ + Log Shift (Voice) ]  |
+------------------------------------------------------------------------------------+
|  [ STAT CARD 1 ]          [ STAT CARD 2 ]          [ STAT CARD 3 ]                 |
|  This Week's Earnings     Uninvoiced Shifts        Active Participants             |
|  $2,450.20 AUD            5 Shifts ($1,120.00 AUD) 6 Clients                       |
|  +14% vs last week        [ Generate Invoice -> ]  All budgets healthy             |
+------------------------------------------------------------------------------------+
|  [ UNINVOICED SHIFTS BANNER ALERT ]                                                |
|  ⚡ You have 5 unbilled shifts ready for invoicing ($1,120.00 AUD).                |
|  [ Batch Generate Invoices (Shield Protected) -> ]                                 |
+------------------------------------------------------------------------------------+
|  [ RECENT SHIFTS TABLE (5 Most Recent) ]           [ NDIS BUDGET HEALTH WATCH ]    |
|  Client       Date     Hours    Rate Type  Amount  |  Sarah J:  82% ($12,300 left) |
|  Sarah J.     Today    3.5 hrs  Day+Eve    $258.39 |  David M:  45% ($4,500 left)  |
|  David M.     Yest.    4.0 hrs  Saturday   $380.28 |  Emma W:   12% (⚠️ Alert)     |
+------------------------------------------------------------------------------------+
```

#### 4.2 Key Interactive Elements
1. **Top Right Header CTA:** Prominent `#16A085` button `+ Log Shift (Voice)` -> Opens `ShiftModal.tsx` from anywhere.
2. **Uninvoiced Alert Banner:** Visible if `pendingShiftsCount > 0`. Styled with `bg-[#0D332D] border-[#117A65]`. 1-click navigates to `/invoices/generate`.
3. **Budget Health Watchlist:** Displays participant remaining balance with color-coded progress bars:
   - Green (`> 30%` remaining)
   - Amber (`10% - 30%` remaining)
   - Red (`< 10%` remaining — prevents working on exhausted funding).

---

### 📌 MODULE 3: NDIS PARTICIPANTS & PLAN MANAGERS (`app/clients/page.tsx`)

#### 5.1 Purpose & Screen Specifications
Manage participant details, 9-digit NDIS IDs, and Plan Manager agency claim routing.

#### 5.2 Create Participant Form (`app/clients/new/page.tsx`)
* **Participant Full Name:** Text input (`bg-[#0E1617] border-[#253130]`).
* **NDIS Number (Required):** 9-digit input with real-time numeric format checker (e.g. `430123456`). Rejects anything not exactly 9 digits.
* **Plan Management Type Segmented Control:**
  1. `Plan-Managed` (Default / 85%):
     - Displays **Plan Manager Agency Name** (e.g. *My Plan Manager*, *Plan Partners*, *Moira*, *Capital Guardians*).
     - Displays **Plan Manager Claims Email** (e.g. `invoices@myplanmanager.com.au`).
  2. `Self-Managed`:
     - Displays **Parent / Nominee Billing Email** & Phone.
  3. `NDIA-Managed`:
     - Displays warning: *"Invoices for NDIA-managed participants must be claimed through the PRODA Myplace portal."*
* **Default Support Category:** Dropdown selecting standard NDIA code (`01_011_0107_1_1 - Daily Life Support`).
* **Agreed Hourly Rate ($ AUD):** Pre-populated with current 2026 NDIA price cap (`$67.56`).
* **Total Allocated Budget ($ AUD):** Optional budget tracking cap (e.g. `$15,000.00`).

---

### 📌 MODULE 4: SHIFT LOGGER WITH VOICE AI & LIVE AUTO-SPLIT (`app/shifts/page.tsx`)

#### 6.1 Purpose & User Flow
Allows sole traders to log a shift in under 15 seconds from their car using **Voice Audio** or **1-Tap Form Entry**, with live rate-split calculations rendered on screen.

#### 6.2 The Shift Logger Modal Component (`components/shifts/ShiftModal.tsx`)

```tsx
// components/shifts/ShiftModal.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Mic, Clock, Car, CheckCircle2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Array<{ id: string; participantName: string; ndisNumber: string }>;
  onShiftSaved: () => void;
}

export function ShiftModal({ isOpen, onClose, clients, onShiftSaved }: ShiftModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:30');
  const [travelKms, setTravelKms] = useState('12');
  const [caseNotes, setCaseNotes] = useState('Assisted with community access and evening meal preparation.');

  // Live Auto-Split Calculation Engine (Client-Side Preview)
  const splitCalculation = useMemo(() => {
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    const startDec = sH + sM / 60;
    const endDec = eH + eM / 60;
    const totalHours = Math.max(0, Number((endDec - startDec).toFixed(2)));
    const kms = Number(travelKms) || 0;

    const DAY_RATE = 67.56;
    const EVE_RATE = 74.42;
    const KM_RATE = 0.97;
    const THRESHOLD = 20.0; // 8:00 PM

    let dayHours = 0;
    let eveHours = 0;

    if (endDec <= THRESHOLD) {
      dayHours = totalHours;
    } else if (startDec >= THRESHOLD) {
      eveHours = totalHours;
    } else {
      dayHours = Number((THRESHOLD - startDec).toFixed(2));
      eveHours = Number((endDec - THRESHOLD).toFixed(2));
    }

    const dayTotal = Number((dayHours * DAY_RATE).toFixed(2));
    const eveTotal = Number((eveHours * EVE_RATE).toFixed(2));
    const travelTotal = Number((kms * KM_RATE).toFixed(2));
    const grandTotal = Number((dayTotal + eveTotal + travelTotal).toFixed(2));

    return { totalHours, dayHours, eveHours, dayTotal, eveTotal, travelTotal, grandTotal, kms };
  }, [startTime, endTime, travelKms]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#182122] border border-[#253130] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#253130] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0D332D] text-[#5EE0C1] flex items-center justify-center border border-[#117A65]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#F1F5F4]">Log NDIS Shift</h3>
              <p className="text-xs text-[#9AA9A5]">15-second entry with live NDIA auto-split</p>
            </div>
          </div>
          <button
            onClick={() => setIsRecording(!isRecording)}
            title="Tap to speak shift details"
            className={`flex items-center justify-center w-11 h-11 rounded-full transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                : 'bg-[#16A085] text-white hover:bg-[#1DB89A] shadow-glow'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9AA9A5] mb-1">Participant</label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full rounded-lg bg-[#0E1617] border border-[#253130] px-3.5 py-2 text-sm text-[#F1F5F4] focus:border-[#16A085] focus:outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.participantName} (NDIS: {c.ndisNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Date" type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} />
            <Input label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <Input label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>

          <Input
            label="Activity-Based Transport (KM)"
            type="number"
            value={travelKms}
            onChange={(e) => setTravelKms(e.target.value)}
            placeholder="0"
          />

          {/* LIVE NDIS AUTO-SPLIT ENGINE PREVIEW */}
          <div className="rounded-xl bg-[#131B1C] border border-[#253130] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#687572] uppercase tracking-wider">
              <span>NDIS Auto-Split Engine</span>
              <span className="text-[#5EE0C1] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 2026 NDIA Limits Active
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {splitCalculation.dayHours > 0 && (
                <div className="flex justify-between text-[#F1F5F4]">
                  <span>01_011_0107_1_1 (Daytime {startTime} - {splitCalculation.eveHours > 0 ? '20:00' : endTime})</span>
                  <span className="font-mono">{splitCalculation.dayHours}h × $67.56 = ${splitCalculation.dayTotal}</span>
                </div>
              )}
              {splitCalculation.eveHours > 0 && (
                <div className="flex justify-between text-[#5EE0C1]">
                  <span>01_015_0107_1_1 (Evening 20:00 - {endTime})</span>
                  <span className="font-mono">{splitCalculation.eveHours}h × $74.42 = ${splitCalculation.eveTotal}</span>
                </div>
              )}
              {splitCalculation.kms > 0 && (
                <div className="flex justify-between text-[#9AA9A5]">
                  <span>01_799_0107_1_1 (Travel {splitCalculation.kms} km)</span>
                  <span className="font-mono">{splitCalculation.kms} km × $0.97 = ${splitCalculation.travelTotal}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#253130] font-bold text-sm text-[#5EE0C1]">
              <span>Total Claim Amount:</span>
              <span>${splitCalculation.grandTotal.toFixed(2)} AUD</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onShiftSaved}>Save Shift (${splitCalculation.grandTotal.toFixed(2)})</Button>
        </div>
      </div>
    </div>
  );
}
```

---

### 📌 MODULE 5: INVOICING & PRE-FLIGHT REJECTION SHIELD (`app/invoices/generate/page.tsx`)

#### 7.1 Purpose & Shield UI Specifications
Prevents any invoice from reaching a Plan Manager with errors.

#### 7.2 The Pre-Flight Shield Component (`components/invoices/PreFlightShield.tsx`)

```tsx
// components/invoices/PreFlightShield.tsx
import React from 'react';
import { ShieldCheck, AlertOctagon } from 'lucide-react';

interface ShieldProps {
  isValid: boolean;
  errors: string[];
  totalAmount: number;
  recipientEmail: string;
  agencyName: string;
}

export function PreFlightShield({ isValid, errors, totalAmount, recipientEmail, agencyName }: ShieldProps) {
  if (isValid) {
    return (
      <div className="rounded-xl bg-[#0B2B1B] border border-[#166534] p-4 mb-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-[#22C55E] shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-[#22C55E]">
              Auto-Rejection Shield: 100% NDIS Compliant
            </h4>
            <p className="text-xs text-[#22C55E]/80 mt-1">
              All line items conform to official 2026 NDIA price caps. ABN, BSB, and 9-digit NDIS IDs verified. Ready for instant 48-hour payment.
            </p>
            <div className="mt-2 text-xs font-mono text-[#22C55E]">
              Routing directly to: <span className="underline">{agencyName} ({recipientEmail})</span> | Total: ${totalAmount.toFixed(2)} AUD
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#2B1010] border border-[#991B1B] p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertOctagon className="w-6 h-6 text-[#EF4444] shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-[#EF4444]">
            Invoice Dispatch Blocked (Rejection Prevention Active)
          </h4>
          <ul className="mt-2 space-y-1 text-xs text-[#EF4444] list-disc list-inside font-mono">
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

### 📌 MODULE 2 / SETTINGS: BUSINESS PROFILE & BANKING (`app/settings/page.tsx`) (IMPLEMENTED)

#### 8.1 Purpose & Form Fields
1. **Business Profile:** Business Legal Name, Contact Email, Contact Phone, Industry (`NDIS Support Worker`).
2. **Australian Tax & Banking Compliance:**
   - **ABN:** 11 digits (e.g. `51824753556`)
   - **BSB:** Format `XXX-XXX` (e.g. `062-000`)
   - **Account Number:** 6 to 9 digits (e.g. `12345678`)
   - **Bank Name:** (e.g. `Commonwealth Bank of Australia`)
   - **Custom Invoice Prefix:** (e.g. `INV`, `LSW`)
   - **GST Registration Toggle:** (Default: `false`)

#### 8.2 Subscription Portal & 9-Day Free Trial UI (`app/settings/billing/page.tsx`)
1. **Trial Countdown Banner:**
   - Visual card with `#0D332D` background and `#5EE0C1` badge:
   - *"🎁 9-Day Free Trial Active (X days remaining). Limited to 1 Participant, 5 Shifts, 2 Invoices."*
   - Real-time progress bar showing: `1/1 Participants Used`, `X/5 Shifts Logged`, `X/2 Invoices Generated`.
2. **Subscription Pricing Tiers (Side-by-Side Cards):**
   - **⚡ Starter Plan ($24 AUD / mo):**
     - Target: Part-time Sole Traders.
     - Up to 5 Active Participants.
     - Unlimited Shift Logging (Manual).
     - Up to 20 Invoices / month with Auto-Rejection Shield.
     - Direct Plan Manager Email Delivery.
     - Button: `[ Subscribe with Stripe - $24 AUD/mo ]`
   - **🚀 Pro Plan ($44 AUD / mo - Recommended):**
     - Target: Full-time Support Workers & Carers.
     - Unlimited Participants & Clients.
     - Unlimited Shifts & Unlimited Invoices.
     - 🎙️ **Unlimited Voice-to-Shift AI Logging**.
     - Plan Manager Payment Reminders & PRODA CSV Claims Export.
     - Button: `[ Upgrade to Pro - $44 AUD/mo ]`
3. **Feature-Limit Modal (`components/billing/UpgradeModal.tsx`):**
   - When a trial user attempts to add a 2nd participant or 6th shift, displays a dark backdrop modal:
   - *"Free trial limit reached: 1 Participant maximum during test. Upgrade to Starter or Pro to continue growing your business."*
   - 1-Click redirect to Stripe Checkout session.

---

## 4. DESIGN SYSTEM UI COMPONENT PRIMITIVES

### 4.1 Button (`components/ui/Button.tsx`)
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
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all rounded-lg focus:outline-none disabled:cursor-not-allowed';
  const sizeStyles = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' };
  const variantStyles = {
    primary: 'bg-[#16A085] text-white hover:bg-[#1DB89A] active:bg-[#117A65] disabled:bg-[#182122] disabled:text-[#3F4C49] shadow-sm',
    secondary: 'bg-transparent border border-[#253130] text-[#F1F5F4] hover:bg-[#131B1C] hover:border-[#16A085] disabled:border-[#253130] disabled:text-[#3F4C49]',
    ghost: 'bg-transparent text-[#9AA9A5] hover:bg-[#131B1C] hover:text-[#F1F5F4] disabled:text-[#3F4C49]',
    danger: 'bg-[#EF4444] text-white hover:bg-red-600 active:bg-red-700 disabled:bg-[#182122]',
  };

  return (
    <button className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} disabled={disabled || isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
```

### 4.2 Input (`components/ui/Input.tsx`)
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
          <label htmlFor={inputId} className="block text-xs font-medium text-[#9AA9A5]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg bg-[#0E1617] px-3.5 py-2.5 text-sm text-[#F1F5F4] placeholder:text-[#687572] border transition-all focus:outline-none ${
            error
              ? 'border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]'
              : 'border-[#253130] focus:border-[#16A085] focus:ring-1 focus:ring-[#16A085]'
          } disabled:bg-[#182122] disabled:text-[#3F4C49] disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[#EF4444]">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#9AA9A5]">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
```

---

## 5. MANDATORY AI FRONTEND CODING RULES

1. **NO UI GUESSING:** Always adhere to the Rayvice Dark Palette (`#080B0D` background, `#131B1C` cards, `#16A085` brand emerald).
2. **AUSTRALIAN FORMATTING:** Dates must be displayed in Australian format (`DD/MM/YYYY`), phone placeholders `0412 345 678`, and currency formatted as `$XX.XX AUD`.
3. **AUTOMATIC AUTO-SPLIT PREVIEW:** Any shift entry form MUST render the live calculation breakdown box showing Day vs Evening rate items.
4. **SHIELD BANNER VISIBILITY:** The `PreFlightShield` component MUST be rendered on the invoice generation screen before any dispatch action.
5. **ERROR HANDLING:** Always wrap API calls with `getApiErrorMessage(error)` from `lib/api-client.ts` to surface clear backend error messages to the user via `react-hot-toast`.

