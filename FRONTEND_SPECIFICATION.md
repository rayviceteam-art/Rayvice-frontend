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

### 📌 MODULE 4: SHIFT LOGGER WITH VOICE AI, LIVE AUTO-SPLIT & DASHBOARD

> **FULL IMPLEMENTATION CONTRACT:** `MODULE_4_FRONTEND_SPECIFICATION.md` (repository root) is the binding, line-by-line frontend document for this module — screen specs, component props, exact copy, states, service contracts, QA checklist (34 items) and acceptance criteria (36 items). This section is the authoritative summary; where the two differ, the dedicated document wins. **No feature may be added that is not described in either document.**

#### 6.1 Purpose & UX Principles
Let a support worker log a shift in **under 15 seconds from their car** (voice or 1-tap form) with a **live NDIS rate-split preview** on screen, and give the owner a dashboard view of weekly earnings, unbilled work and participant budget health.

Principles:
1. **Fewer taps:** participant pre-selected, agreed rate and support item pre-filled, today's date pre-filled **in the business timezone**.
2. **Transparency:** every claim line is visible (item code, time range, hours × rate = amount) before saving — this is what prevents rejected invoices.
3. **Backend is authoritative for money:** the on-screen split is a mirror for instant feedback; after save the server values replace it.
4. **Human confirmation:** AI voice output only prefills the form. Nothing is auto-saved.
5. **Mobile-first:** 44 px minimum touch targets, one-thumb operation, native date/time inputs, no horizontal page scroll.

#### 6.2 Screens & Files
| Route | File | Purpose |
| :--- | :--- | :--- |
| `/shifts` | `app/shifts/page.tsx` | Directory: tabs (Uninvoiced / Invoiced / All), filters, pagination, row actions |
| `/shifts/new` | `app/shifts/new/page.tsx` | Dedicated full-page logger (deep-linkable, `?clientId=` supported) |
| `/shifts/[id]` | `app/shifts/[id]/page.tsx` | Detail + edit (PENDING only) / read-only with lock (INVOICED) |
| — | `components/shifts/ShiftModal.tsx` | Global quick logger mounted in `AppLayout`, opened from the header CTA |
| — | `components/shifts/ShiftForm.tsx` | Shared form used by the modal, the new page and the edit view |
| — | `components/shifts/SplitPreview.tsx` | Live auto-split panel |
| — | `components/shifts/ShiftTable.tsx`, `ShiftFilters.tsx`, `CancelShiftModal.tsx`, `VoiceRecorder.tsx`, `VoiceShiftParser.tsx`, `VoiceUpgradeModal.tsx` | List + voice + cancel surfaces |
| `/dashboard` | `app/dashboard/page.tsx` | Module 4 widgets (weekly earnings, uninvoiced banner, budget watch, recent shifts) |

Sidebar item "Shifts & Splitter" already links to `/shifts` (currently 404 — this module fixes that). The header CTA label stays **`+ Log Shift (Voice)`**.

#### 6.3 Design Compliance (MANDATORY — identical look to Modules 1–3)
- Reuse the existing tokens from `tailwind.config.ts` + `app/globals.css` — **no new colour, gradient, font, radius or shadow**.
- Key tokens: page bg `#080B0D` (`bg-background`), sidebar `#0A0F10`, surface `#131B1C` (`bg-surface`), elevated `#182122`, input `#0E1617` (`bg-input`), border `#253130` (`border-border`), text `#F1F5F4` / `#9AA9A5` / `#687572`, brand `#16A085` (hover `#1DB89A`), brand-soft `#0D332D` / `#5EE0C1` / `#117A65`, success `#22C55E`/`#0B2B1B`/`#166534`, warning `#F59E0B`/`#2A210B`/`#92400E`, error `#EF4444`/`#2B1010`/`#991B1B`.
- Typography: Inter, `text-h1…h4`, `text-body1/body2/caption`, `rounded-card` (12 px), `shadow-card`.
- Reuse `components/ui/*` primitives (`Button`, `Input`, `Select`, `Card`, `Modal`, `Badge`, `Table`, `Skeleton`). Do not restyle them.
- New screens must sit next to `/clients` and `/dashboard` with no visual jump.

#### 6.4 Shift Form (`components/shifts/ShiftForm.tsx`)
| # | Field | Control | Default |
| :--- | :--- | :--- | :--- |
| 1 | Participant | `Select` (active participants only) | `?clientId=` → else first participant |
| 2 | Date | `type="date"` | **today in `Business.timezone`** (never `new Date().toISOString()`) |
| 3 | Start Time | `type="time"` | `09:00` |
| 4 | End Time | `type="time"` | `13:00` |
| 5 | Activity-Based Transport (km) | number, 0–500, step 0.1 | `0` |
| 6 | Default Support Category | `Select` from the catalogue | participant's `defaultSupportItemCode` → else `01_011_0107_1_1` |
| 7 | Public Holiday | segmented control: Auto / Public holiday / Normal day | `Auto` (`isPublicHoliday: null`) |
| 8 | Case Notes | textarea, max 2000 | empty |

Behaviour: overnight badge when `endTime <= startTime` (**"Crosses midnight — will be split at 12:00 AM"**); participant change re-applies their default support item; edit mode disables the participant select (**"Participant cannot be changed — cancel and re-log the shift instead."**); Zod validation in `lib/validators.ts`; one `Idempotency-Key` (UUID) per form session; submit label **`Save Shift ($258.39)`** using the live total; dirty-form guard before unload and on modal close.

#### 6.5 Live Auto-Split Preview (`components/shifts/SplitPreview.tsx`)
- Client mirror rules (identical to the backend engine): `HOLIDAY > SUNDAY > SATURDAY > weekday`; weekday splits at **20:00 local**; overnight splits at local midnight with each segment rated by its own day; `effectiveRate = min(agreed, cap)`; travel uses the statutory km rate (never the agreed rate); quantities and amounts rounded to 2 decimals; total = sum of rounded lines.
- Panel layout: header **"NDIS Auto-Split Engine"** + **"✓ 2026 NDIA Limits Active"**; one row per line showing `item code + range`, `quantity × rate`, `= amount`; `EVENING` row in `#5EE0C1`; travel row muted; total row bold in brand colour as `$258.39 AUD`.
- Overnight rows display `Friday 22:00 – 24:00` then `Saturday 00:00 – 01:00`.
- Agreed-rate-below-cap lines are annotated **(agreed rate)**.
- Warning rows: long shift > 12 h (amber), budget ≥ 70% after this shift (amber), budget ≥ 100% (red, still saveable), travel claimed on a travel-disallowed item (red, save disabled).
- The panel is always visible; with incomplete times it shows **"Enter a start and end time to see the split."** and `$0.00`.

#### 6.6 Shift List (`/shifts`)
- Tabs: `Uninvoiced` (default → `status=PENDING`), `Invoiced` (`status=INVOICED`), `All` (no status filter; cancelled rows appear here with an error-tone badge).
- Filters: From date, To date, Participant, Worker (**OWNER/OFFICE_MANAGER only**). No free-text search (the API does not support it). Changing any filter resets to page 1; a "Clear filters" action appears only when a filter is set.
- Summary strip for the current filter: `Total $X • Y h • Z shifts`.
- Columns: Date, Participant (with NDIS number), Time (with `Next day` badge), Hours, Split badges (DAY/EVE/SAT/SUN/HOL/KM), Travel, Amount (`font-mono`, bold), Status, Actions.
- Row actions: `View` always; `Edit` and `Cancel` only when `status = PENDING` and the role/ownership rule passes; invoiced rows show a lock icon with `title="On invoice — cannot be changed"`.
- Pagination identical to `/clients` (Previous / Page X of Y / Next).
- Mandatory states: 6 skeleton rows while loading; **"No shifts logged yet"** + `+ Log Shift` when empty; **"No shifts match these filters"** + `Clear filters` when filtered empty; **"Unable to load shifts"** + `Try Again` on error.
- After create/edit/cancel always re-fetch from the server (never optimistically rewrite amounts).

#### 6.7 Detail, Edit & Cancel Rules
- **PENDING:** editable via `?edit=1`; the form prefills all fields; save calls `PATCH /shifts/:id` and re-runs the split.
- **INVOICED:** read-only with an info banner — **"This shift is on an invoice and cannot be changed."** No edit/cancel actions.
- **CANCELLED:** read-only with an error-tone banner — **"This shift was cancelled and is excluded from totals."**
- Cancel modal (`CancelShiftModal`): title **"Cancel this shift?"**, body **"The shift will be removed from your uninvoiced totals but kept in your records for audit. This cannot be undone from the app."**, buttons `Keep shift` / `Cancel shift`. This is a **soft cancel** — never use "delete permanently" wording.
- Detail page shows the server `lineItems` verbatim (no recomputation), plus the public-holiday line when applicable, timezone used, and calculated-at.

#### 6.8 Voice AI UX (`VoiceRecorder.tsx` + `VoiceShiftParser.tsx`)
- **States:** idle → requesting (spinner, "Requesting microphone…") → recording (red pulsing button, live timer, `aria-live` status) → processing ("Transcribing…") → idle + prefill; plus `denied` (**"Microphone access is blocked. Allow it in your browser settings, or type the shift instead."**) and `error` (message + retry). Manual entry is always available.
- **MIME fallback order (mandatory):** `audio/webm;codecs=opus` → `audio/webm` → `audio/mp4` → `audio/aac` → browser default, chosen via `MediaRecorder.isTypeSupported`. This is what makes iPhone Safari work.
- **Hard limits:** 60 s auto-stop (countdown after 45 s), 5 MB max; audio is held in memory only, never written to storage, never re-uploaded anywhere except `POST /shifts/voice-parse`, and media tracks are always stopped.
- **Consent (mandatory):** before the first recording per session show **"Voice is processed by AI to fill the form. Review before saving."** with `Got it` (dismissal stored in `sessionStorage`).
- **Prefill:** matched participant / candidates, date, times, km, notes; **AI-filled fields get an `AI` badge** that clears on manual edit; first missing field is focused; collapsible **"Heard: “…”"** transcript preview (≤ 300 chars); amber banner **"Please check the highlighted fields before saving."** when `confidence < 0.5` or fields are missing; the response `usage` block updates the local plan state.
- **Never auto-submits.**
- **Gating:** `403 VOICE_PLAN_REQUIRED` → Pro upgrade modal; `403 TRIAL_VOICE_LIMIT_REACHED` → trial voice modal (3 parses); `402 TRIAL_EXPIRED` → subscribe modal; `503 VOICE_UNAVAILABLE` / `504` / `429` / `413` / `415` / `422` → inline messages, manual entry unaffected. When the mic is known-unavailable it renders disabled but still opens the upgrade modal.

#### 6.9 Dashboard Widgets (`app/dashboard/page.tsx`)
Single request: `GET /dashboard/summary` (no per-widget calls, no localStorage).

| Widget | Content | Edge case |
| :--- | :--- | :--- |
| This Week's Earnings | `formatAud(earnings)`, `{hours} h • {shiftCount} shifts`, change vs last week | `changePercent === null` → **"— vs last week"** (never NaN/Infinity) |
| Uninvoiced banner | **"⚡ You have {n} unbilled shift(s) ready for invoicing ({amount})."** + `Generate Invoice →` | Hidden when count is 0; the CTA stays disabled with `title="Available with invoicing (Module 5)"` until Module 5 ships |
| Active Participants | Count + **"All budgets healthy"** or **"{n} nearing budget limit"** (amber) | 0 → **"No participants yet"** + link to `/clients/new` |
| Recent Shifts | 5 rows (date, participant, times, amount, status), each linking to `/shifts/[id]`, footer **"View all shifts →"** | Empty → **"No shifts logged yet"** + `+ Log Shift` |
| NDIS Budget Health Watch | Up to 10 participants at ≥ 70% with `formatAud(spent) of formatAud(total)` and a progress bar (reuse `components/clients/BudgetProgress.tsx`) | Empty → **"All participant budgets are healthy"** (success tone) |
| Trial usage | **"{used}/{limit} trial shifts used • {days} days left"** | `trial === null` → render nothing |

Refresh on mount, after a successful shift save, and on tab `visibilitychange` — keeping the previous numbers visible while refreshing.

#### 6.10 Service Layer & Module 1–3 Compatibility
- `lib/shifts-service.ts` is **rewritten to use the real API** (`apiClient`), and `lib/dashboard-service.ts` is added.
- **Backward compatibility is mandatory:** `components/clients/ClientDetailCard.tsx` uses `shiftsService.list({ clientId })` and expects `ShiftRecord[]`; `app/dashboard/page.tsx` uses `getRecent()` / `subscribe()`; `ShiftModal` uses `create()`. These exported names, the `ShiftRecord` field list and the `subscribe` signature must be preserved (new `listPaged()` is added alongside).
- **The `localStorage` fallback (`rayvice_logged_shifts`) is removed:** a shift that exists only in the browser can never be invoiced and creates phantom data. On API failure show an error + retry, and delete the legacy key on first load.
- New types (additive): `Shift`, `ShiftLineItem`, `ShiftStatus`, `RateTier`, `ShiftListResponse`, `ShiftSummary`, `BudgetBlock`, `ShiftMutationResponse`, `DashboardSummary`, `VoiceParseResult`; plus `timezone` / `state` / `planTier` on `Business` / `BusinessProfile`.
- New dependency allowed: **luxon** (+ `@types/luxon`) — used for business-timezone "today" and the preview mirror.

#### 6.11 States, Errors & Copy
- Error mapping (`errorCode` → message) covers: `TRIAL_SHIFT_LIMIT_REACHED`, `TRIAL_VOICE_LIMIT_REACHED`, `VOICE_PLAN_REQUIRED`, `VOICE_UNAVAILABLE`, `VOICE_FILE_TOO_LARGE`, `INVALID_AUDIO_FORMAT`, `VOICE_AUDIO_TOO_LONG`, `VOICE_TRANSCRIPT_UNUSABLE`, `VOICE_TRANSCRIPTION_FAILED`, `VOICE_PARSE_FAILED`, `SHIFT_ALREADY_INVOICED`, `SHIFT_CANCELLED`, `SHIFT_OVERLAP`, `DUPLICATE_SHIFT`, `SHIFT_DATE_IN_FUTURE`, `SHIFT_DATE_TOO_OLD`, `SHIFT_DURATION_TOO_LONG`, `SHIFT_DURATION_INVALID`, `TRAVEL_KM_INVALID`, `TRAVEL_NOT_ALLOWED_FOR_ITEM`, `INVALID_SUPPORT_ITEM`, `CLIENT_NOT_FOUND`/`CLIENT_INACTIVE`, `TRIAL_EXPIRED`, `RATE_LIMITED`, `FORBIDDEN` (+ `getApiErrorMessage()` fallback). Never show a raw `errorCode` or stack trace.
- Toasts (exact): **"Shift logged successfully."**, **"Shift updated successfully."**, **"Shift cancelled."**, **"Voice captured — review the details before saving."**, plus error-tone mapped messages.
- Every new surface needs loading, empty, error and happy states.

#### 6.12 Mobile & Accessibility
- 44 px minimum touch targets; primary actions full-width at the bottom on mobile; native date/time inputs; numeric inputs use `inputMode="decimal"`.
- Modals scroll internally (`max-h-[90vh] overflow-y-auto`) so the keyboard never hides the save button.
- Tables scroll horizontally inside a container; the first column stays readable at 360 px; no horizontal page scroll.
- Recording state announced via `aria-live="polite"`; all icon-only buttons carry `aria-label`; validation errors are linked to inputs and the first invalid field receives focus.

#### 6.13 QA & Acceptance
The dedicated document defines a **34-item manual QA checklist** (Section 15) and **36 acceptance criteria** (Section 17) — including: preview matching the backend for eight scenarios, overnight split rendering, invoiced immutability, idempotent double-tap save, budget threshold warnings, voice on iOS Safari, plan-gating modals, single dashboard request, no Module 1–3 regressions, and clean `npx tsc --noEmit` + `npx next build`. Both lists are binding.

#### 6.14 Out of Scope for v1 (v2 backlog — DO NOT BUILD)
Sleepover/night entry mode, cancellation-claim UI, PRODA/Myplace CSV export, offline queue and background sync, 15-minute billing-increment settings, map-based travel distance, push notifications, and any invoice-generation UI (Module 5 owns `/invoices/*`). The design system, auth flow and participant pages must not be modified.

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

