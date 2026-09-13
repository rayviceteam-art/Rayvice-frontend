# RAYVICE — MODULE 4 FRONTEND MASTER SPECIFICATION
## Shift Logger with Voice AI, Live Auto-Split & Dashboard

**Version:** 1.0 (FINAL — APPROVED)
**Module:** 4 of 5 (frontend half)
**Status:** Ready for implementation
**Audience:** Any AI coding agent or developer implementing the frontend
**Companion document:** `MODULE_4_BACKEND_SPECIFICATION.md` (binding backend contract)

---

## SECTION 0 — HOW TO USE THIS DOCUMENT (BINDING RULES)

This document is the **single source of truth** for Module 4 frontend work. Read it fully before writing code.

### 0.1 Non-negotiable rules

1. **DO NOT INVENT FEATURES.** If it is not in this document, it does not get built.
2. **DO NOT CHANGE MODULES 1, 2, 3 UI.** Login, register, sidebar, business settings, and the entire participants (`/clients`) area must keep working exactly as they do today.
3. **THE BACKEND IS AUTHORITATIVE FOR MONEY.** The on-screen split preview is a *mirror* for instant feedback only. On save, the values returned by the backend replace the preview. Never persist client-calculated amounts.
4. **DO NOT HARDCODE NDIS RATES.** Rates for the preview come from the shared client-side rate constants that mirror the seeded catalogue (`lib/ndis-rates.ts`). The catalogue in the database remains the source of truth.
5. **DO NOT USE `new Date().toISOString().split('T')[0]` FOR SHIFT DATES.** "Today" must be computed in the **business timezone**, otherwise a worker logging a shift at 8 AM in Sydney can get yesterday's date.
6. **DO NOT COMPUTE TIERS IN UTC.** Weekday/weekend/evening decisions in the preview use the business timezone exactly like the backend (luxon).
7. **VOICE NEVER AUTO-SAVES.** The AI result only prefills the form. The worker must press save.
8. **DO NOT REPLACE THE DESIGN SYSTEM.** Use the existing `components/ui/*` primitives and the existing dark theme tokens. No new colour system, no new font, no new component library.
9. **DO NOT DELETE EXISTING WORKING BEHAVIOUR** such as the global "Log Shift" CTA in the header, the trial banner, or the sidebar routes.
10. **EVERY SCREEN NEEDS FOUR STATES:** loading, empty, error, and happy path. This is mandatory, not optional.

### 0.2 Definition of done

Every acceptance criterion in Section 17 passes, the app builds (`npx next build`), `npx tsc --noEmit` is clean, and no Module 1–3 page regresses.

---

## SECTION 1 — PROJECT CONTEXT (WHY THIS UI EXISTS)

### 1.1 What Rayvice is

Rayvice is a billing and NDIS-compliance OS for **Australian NDIS sole-trader support workers**. The web app is a dark-themed, mobile-first B2B SaaS. Everything is designed for one reality: **the user is often sitting in a car, in a driveway, at 9 PM, on a phone, and wants to log a shift in under 15 seconds.**

### 1.2 What Module 4 adds to the product

Modules 1–3 gave the user an account, a business profile with bank details, and a participant directory with budgets. **Module 4 is the first module that earns the user money**: it turns "I worked 6pm to 9:30pm and drove 12 km" into an exact, NDIS-capped claim amount that plan managers will pay without rejecting.

### 1.3 The UX problem being solved

| Problem | Frontend answer |
|---|---|
| Manual rate splitting in Excel takes hours | Live auto-split preview that updates as the user types |
| Workers are in the car, not at a desk | Voice-first logging + one-tap defaults + huge touch targets |
| A wrong number becomes a rejected invoice (3–6 week delay) | Human confirmation step, transparent per-tier breakdown, visible caps |
| Workers forget which participant/rate applies | Participant pre-selected, agreed rate and support item pre-filled |
| Silent failures destroy trust | Every action has an explicit success/error toast and a recoverable state |

---

## SECTION 2 — SCOPE

### 2.1 In scope (build this)

1. `/shifts` list page — tabs (Uninvoiced / Invoiced / All), filters, pagination, summary strip, row actions.
2. `/shifts/new` dedicated logger page (mobile-first full-page form).
3. `ShiftModal` (global quick logger, opened from the header CTA on every screen).
4. Voice recording UI: `VoiceRecorder` + `VoiceShiftParser` (record → upload → prefilled form).
5. Live auto-split preview panel shared by both logger surfaces.
6. Shift detail/edit view for `PENDING` shifts; invoiced shifts render read-only with a lock notice.
7. Cancel (soft-delete) confirmation modal with the "unbilled shift" warning pattern.
8. Dashboard widgets driven by `GET /dashboard/summary`: weekly earnings, uninvoiced banner, active participants, recent shifts, budget watch, trial usage.
9. Service layer rewrite: `lib/shifts-service.ts` (real API), `lib/dashboard-service.ts`.
10. Plan gating UI: voice upgrade modal, trial limit states.
11. Budget warning UI (amber ≥ 70%, red ≥ 100%).
12. Loading skeletons, empty states, error states with retry for every new surface.

### 2.2 Out of scope (v2 — DO NOT BUILD)

| # | Deferred | Reason |
|---|---|---|
| 1 | Sleepover / night flat-rate entry mode | Backend v2 — item code not confirmed |
| 2 | Cancellation-claim (short-notice) UI | Backend v2 |
| 3 | PRODA / Myplace CSV export button | Module 5 / Pro feature |
| 4 | Offline queue + background sync (PWA) | v2; keep the current simple fallback only |
| 5 | 15-minute billing-increment setting UI | v2 |
| 6 | Invoice generation from the shifts page | Module 5 (`/invoices/generate`) — only link to it |
| 7 | Map / travel-route distance calculation | km is user-entered |
| 8 | Push notifications / reminders | v2 |

---

## SECTION 3 — GLOSSARY

| Term | Meaning |
|---|---|
| **Shift** | One block of support work (date, start, end, optional km). |
| **Split / line item** | One claimable component of a shift (`DAY`, `EVENING`, `SATURDAY`, `SUNDAY`, `HOLIDAY`, `TRAVEL`). |
| **Rate tier** | Which NDIS rate applies to a line. |
| **Cap** | The maximum NDIS rate; shown so the user sees compliance. |
| **Effective rate** | `min(agreed rate, cap)` — the rate actually billed. |
| **Uninvoiced / PENDING** | Logged but not yet on an invoice; still editable. |
| **Invoiced / INVOICED** | Locked; immutable. |
| **Cancelled** | Soft-deleted; kept for audit, excluded from totals. |
| **Business timezone** | `Business.timezone` (default `Australia/Sydney`) — the only timezone used for tiers. |
| **Voice parse** | Audio → transcript → structured prefill. Never a save. |

---

## SECTION 4 — TECH STACK & CONVENTIONS (USE EXACTLY THESE)

| Area | Requirement |
|---|---|
| Framework | **Next.js 14 App Router** (`app/` directory), React 18, TypeScript 5.6 strict |
| Rendering | Client components (`'use client'`) for all interactive Module 4 pages — the app is a SPA-style dashboard today |
| Styling | **Tailwind CSS** with the existing token classes (`text-text-primary`, `bg-surface`, `border-border`, `rounded-card`, `text-h4`, …). Inline hex values only where the existing code already does so |
| Icons | `lucide-react` |
| HTTP | The existing shared axios instance `apiClient` from `lib/api-client.ts` (adds the bearer token, handles 401 refresh). Never call `fetch` directly for business data |
| Toasts | `useToast()` from `lib/toast-context.tsx` → `showToast(message, 'success' \| 'error')` |
| Auth/roles | `useAuth()` from `lib/auth-context.tsx`; role checks via `can('OWNER', 'OFFICE_MANAGER')`. Roles are exactly `OWNER`, `OFFICE_MANAGER`, `TECHNICIAN`, `SUPER_ADMIN` |
| Money/date formatting | `formatAud()` and `formatCalendarDate()` from `lib/format.ts`. Never hand-roll currency strings |
| Timezone math | **luxon** (add `luxon` + `@types/luxon`) — same library as the backend |
| Forms | Controlled React state + Zod schemas in `lib/validators.ts` (the pattern used by `ClientForm`). Do NOT introduce react-hook-form for Module 4 (the existing client form does not use it) |
| Errors | `getApiErrorMessage()`, `getApiErrorCode()`, `getApiFieldErrors()` from `lib/api-client.ts` |
| UI primitives | `components/ui/`: `Button`, `Input`, `Select`, `Card` (`Card/CardHeader/CardBody`), `Modal`, `Badge`, `Table` (`Table/Thead/Th/Tr/Td`), `Skeleton` |
| Layout | `AppLayout` wraps every authenticated page; `Header` receives `title`/`subtitle` and `onOpenShiftModal` |
| Tests | No test runner is configured today. Required verification is: `npx tsc --noEmit`, `npx next build`, plus the manual QA checklist in Section 15 |
| New dependencies allowed | `luxon`, `@types/luxon` only |

---

## SECTION 5 — ROUTES, FILES & COMPONENT MAP

### 5.1 Routes

| Route | File | Purpose |
|---|---|---|
| `/shifts` | `app/shifts/page.tsx` | Shift directory (tabs, filters, pagination, actions) |
| `/shifts/new` | `app/shifts/new/page.tsx` | Full-page logger (mobile-first, deep-linkable) |
| `/shifts/[id]` | `app/shifts/[id]/page.tsx` | Shift detail + edit (PENDING) / read-only (INVOICED) |
| `/dashboard` | `app/dashboard/page.tsx` (existing) | Adds Module 4 widgets |

The global quick logger (`ShiftModal`) is mounted once in `AppLayout` and is opened from the header CTA — it is not a route.

### 5.2 Files to create

```
app/shifts/page.tsx                     # list page
app/shifts/new/page.tsx                 # dedicated logger
app/shifts/[id]/page.tsx                # detail / edit
components/shifts/ShiftForm.tsx         # shared form used by new page, modal and edit
components/shifts/ShiftModal.tsx        # existing file — refactor to use ShiftForm
components/shifts/SplitPreview.tsx      # live auto-split panel
components/shifts/ShiftTable.tsx        # list rows + skeleton + empty states
components/shifts/ShiftFilters.tsx      # date range, participant, status, search
components/shifts/VoiceRecorder.tsx     # mic button + recording states
components/shifts/VoiceShiftParser.tsx  # upload + prefill orchestration
components/shifts/CancelShiftModal.tsx  # soft-cancel confirmation
components/shifts/VoiceUpgradeModal.tsx # Pro/trial gating for voice
components/dashboard/WeeklyEarningsCard.tsx
components/dashboard/UninvoicedBanner.tsx
components/dashboard/BudgetWatchCard.tsx
components/dashboard/RecentShiftsCard.tsx
lib/shifts-service.ts                   # REWRITE: real API (keep the exported ShiftRecord shape)
lib/dashboard-service.ts                # new: dashboard summary API
lib/shift-calculator.ts                 # NEW: shared client-side split mirror
lib/types.ts                            # additive types only
lib/validators.ts                       # additive shift schemas only
```

### 5.3 Files to modify (and nothing else)

| File | Change |
|---|---|
| `app/dashboard/page.tsx` | Replace the local shift list with `GET /dashboard/summary` data; wire the Module 4 widgets |
| `app/layout.tsx` / `app/providers.tsx` | Only if a provider is genuinely required — prefer none |
| `components/layout/AppLayout.tsx` | Keep `ShiftModal` mount; ensure `onShiftSaved` refreshes the current view |
| `components/layout/Header.tsx` | Keep the CTA; label stays `+ Log Shift (Voice)` |
| `lib/types.ts` | Add `Shift`, `ShiftLineItem`, `ShiftStatus`, `RateTier`, `ShiftListResponse`, `DashboardSummary`, and add `timezone`/`planTier` to `Business`/`BusinessProfile` |
| `lib/ndis-rates.ts` | Add the tier rate constants + item codes (mirror of the catalogue) — do not remove existing exports |

**Forbidden:** touching Module 1–3 pages, the auth context logic, the api-client interceptors, the design tokens, or the sidebar structure.

---

## SECTION 6 — DESIGN SYSTEM & LAYOUT RULES

### 6.1 Theme tokens — EXACT match with Modules 1–3 (reuse, never redefine)

**Source of truth:** `tailwind.config.ts` (colours, font sizes, radius, shadows) and `app/globals.css` (base background, focus ring, scrollbars). Module 4 must be visually indistinguishable from Modules 1–3 — same tokens, same classes, same look.

| Purpose | Tailwind class | Hex | Notes |
|---|---|---|---|
| Page background | `bg-background` | `#080B0D` | Set on `body` in `globals.css` |
| Sidebar background | `bg-background-sidebar` / `bg-[#0A0F10]` | `#0A0F10` | Sidebar + header bar |
| Card / surface | `bg-surface` | `#131B1C` | Cards, panels, tables |
| Elevated | `bg-elevated` | `#182122` | Modals, hover rows |
| Input background | `bg-input` / `bg-[#0E1617]` | `#0E1617` | All form inputs/selects |
| Border (default) | `border-border` | `#253130` | Every card, table, divider |
| Border (hover) | — | `#34413F` | Row hover, scrollbar hover |
| Border (focus) | — | `#16A085` | `:focus-visible` outline in `globals.css` |
| Text primary | `text-text-primary` | `#F1F5F4` | Headings, values |
| Text secondary | `text-text-secondary` | `#9AA9A5` | Labels, hints |
| Text muted | `text-text-muted` | `#687572` | Empty values (`—`), captions |
| Text disabled | — | `#3F4C49` | Locked inputs |
| Brand | `bg-brand` / `text-brand` | `#16A085` | Primary buttons, active states |
| Brand hover | `hover:bg-brand-hover` | `#1DB89A` | Button hover |
| Brand soft bg | `bg-brand-bg` / `bg-[#0D332D]` | `#0D332D` | Info panels, badges, pills |
| Brand soft text | `text-brand-light` / `text-[#5EE0C1]` | `#5EE0C1` | Brand badge text, emphasis |
| Brand soft border | `border-brand-dark` / `border-[#117A65]` | `#117A65` | Brand panel borders |
| Success | `text-success`, `bg-success-bg`, `border-success-border` | `#22C55E` / `#0B2B1B` / `#166534` | Compliant, paid, healthy budget |
| Warning | `text-warning`, `bg-warning-bg`, `border-warning-border` | `#F59E0B` / `#2A210B` / `#92400E` | Budget ≥ 70%, long shift |
| Error | `text-error`, `bg-error-bg`, `border-error-border` | `#EF4444` / `#2B1010` / `#991B1B` | Blocked, cancelled, invalid |
| Info | `text-info` / `bg-info-bg` | `#3B82F6` / `#0C1D35` | Neutral notices |

**Typography / shape tokens (same as every other module):**

| Token | Value | Class |
|---|---|---|
| Font family | Inter | `font-sans` (set globally) |
| H1 / H2 / H3 / H4 | 32 / 24 / 20 / 16 px, weight 700/600 | `text-h1` … `text-h4` |
| Body / caption | `body1` 16 px, `body2` 14 px, `caption` 12 px | `text-body1`, `text-body2`, `text-caption` |
| Card radius | 12 px | `rounded-card` |
| Card shadow | `0 4px 16px rgba(0,0,0,0.20)` | `shadow-card` |
| Monospace values (amounts, item codes) | system mono | `font-mono` |

Rules:
1. **Prefer semantic classes** (`bg-surface`, `border-border`, `text-text-secondary`). Arbitrary hex classes (`bg-[#0D332D]`) are allowed **only** when they match a token above and the surrounding existing code already uses that style.
2. **Never introduce a new colour, gradient, font, radius or shadow.** If a state needs emphasis and no token covers it, use the warning/error tokens.
3. Reuse existing primitives (`components/ui/*`) rather than restyling them. If `SplitPreview` needs a panel, it uses `Card`/`CardBody` styling, not a custom box.
4. New Module 4 screens must render correctly next to `/clients` and `/dashboard` with no visual jump in background, spacing, or typography.

### 6.2 Mobile-first rules (mandatory)

1. Every input, select and button has a **minimum touch height of 44 px** on mobile.
2. The logger must be usable with **one thumb**: primary actions sit at the bottom of the form, full-width on `< sm`.
3. Time and date inputs use native `type="date"` / `type="time"` (already the pattern in `ShiftModal`).
4. Numeric inputs use `inputMode="decimal"` and `step="0.1"`.
5. Tables on mobile: the table scrolls horizontally inside a container (`overflow-x-auto`) — cards are NOT required for v1, but the first column must stay readable at 360 px width.
6. No horizontal page scroll at any breakpoint.

### 6.3 Copy rules

- Use **Australian English** spelling (`kilometres`, `organise`) in user-facing text.
- Currency is always AUD (`formatAud`).
- Hours are shown with up to 2 decimals (`2.5 h`, `3.5 h`, `0.25 h`).
- Never show a raw `errorCode` to the user; always map through `getApiErrorMessage()`.
- Voice consent line (shown once per session before the first recording): **"Voice is processed by AI to fill the form. Review before saving."**

---

## SECTION 7 — `/shifts` LIST PAGE (`app/shifts/page.tsx`)

### 7.1 Purpose

The shift directory: see everything logged, filter it, act on uninvoiced shifts, and jump to invoicing (Module 5).

### 7.2 Page structure (top to bottom)

1. `AppLayout` with `title="Shifts & Splitter"`, `subtitle="Logged shifts with automatic NDIS rate splits"`.
2. Page heading row: `<h1>Shifts</h1>` + description, and a right-aligned `+ Log Shift` button (`variant="primary"`) that opens `ShiftModal` (or navigates to `/shifts/new` — the modal is preferred on every screen).
3. Tab bar (segmented control, same visual pattern as `PlanManagementSelector`):
   - `Uninvoiced` (default) → `status=PENDING`
   - `Invoiced` → `status=INVOICED`
   - `All` → no status filter (cancelled rows appear here)
   Each tab may show a count badge when known (Uninvoiced count comes from the dashboard summary; do not add a separate endpoint for counts).
4. `ShiftFilters` row.
5. Summary strip: `Total ${summary.totalAmount} • ${summary.totalHours} h • ${summary.count} shifts` for the **current filter**.
6. `ShiftTable` (or loading skeleton / empty / error state).
7. Pagination controls (`Previous` / `Page X of Y` / `Next`) — identical markup to `/clients`.

### 7.3 Filters (`ShiftFilters`)

| Control | Type | Sends | Default |
|---|---|---|---|
| From date | `type="date"` | `from` | empty (all time) |
| To date | `type="date"` | `to` | empty |
| Participant | `Select` of active participants | `clientId` | `ALL` |
| Worker | `Select` of team members | `userId` | `ALL` — **rendered only when `can('OWNER','OFFICE_MANAGER')`** |
| Status | (covered by tabs) | `status` | PENDING |

Rules:
- Changing any filter resets to page 1 (same debounce-free behaviour as the clients page).
- A **"Clear filters"** text button appears only when at least one filter is set.
- Invalid range (`from > to`) shows an inline hint and blocks the request.
- Do NOT add a free-text search box — the backend list endpoint does not support text search.

### 7.4 Table specification

| Column | Content | Notes |
|---|---|---|
| Date | `formatCalendarDate(shiftDate)` | Sortable via header click (`sort=shiftDate`) |
| Participant | `clientName` (primary) + `NDIS: {ndisNumber}` (muted, smaller) | Truncate name with `truncate` |
| Time | `{startTime} – {endTime}` | If `endTime <= startTime` append a `Next day` badge (brand-soft) |
| Hours | `totalHours` (2 dp) | — |
| Split | One `Badge` per distinct tier from `lineItems` (`DAY`, `EVE`, `SAT`, `SUN`, `HOL`, `KM`) | Abbreviated labels exactly as listed |
| Travel | `{travelKms} km` or `—` | `—` when 0 |
| Amount | `formatAud(grandTotal)` in `font-mono` | Bold |
| Status | `Badge` — PENDING = brand, INVOICED = neutral, CANCELLED = error | — |
| Actions | `View` link, `Edit` (PENDING only), `Cancel` (PENDING only) | Icon buttons with `aria-label` |

- Row click navigates to `/shifts/[id]`; action buttons call `event.stopPropagation()`.
- Loading state: 6 skeleton rows (same pattern as `ClientTable`).
- Empty state (no filters): heading **"No shifts logged yet"**, body **"Log your first shift to see the NDIS rate split."**, primary button `+ Log Shift`.
- Empty state (filters applied): heading **"No shifts match these filters"**, body **"Try a different date range or participant."**, secondary button `Clear filters`.
- Error state: heading **"Unable to load shifts"**, message from `getApiErrorMessage()`, `Try Again` button (secondary, with `RefreshCw` icon).

### 7.5 Row actions

| Action | Visible when | Behaviour |
|---|---|---|
| View | always | `router.push('/shifts/' + id)` |
| Edit | `status === 'PENDING'` **and** (`can('OWNER','OFFICE_MANAGER')` or `shift.userId === user.id`) | Opens the edit surface (`/shifts/[id]?edit=1`) |
| Cancel | same rule as Edit | Opens `CancelShiftModal` |

Invoiced rows show a small **lock** icon instead of Edit/Cancel, with `title="On invoice — cannot be changed"`.

### 7.6 Data loading

```
shiftsService.list({ page, pageSize: 20, status, clientId, userId, from, to, sort, order })
→ { items, pagination, summary }
```
- Requests are re-issued when any filter, tab, or page changes.
- After a successful create / edit / cancel, re-fetch the current page (do not mutate local state optimistically — the split amounts must come from the server).

---

## SECTION 8 — SHIFT FORM (`components/shifts/ShiftForm.tsx`)

### 8.1 Purpose

One form component used by three surfaces: the quick modal, the dedicated `/shifts/new` page, and the edit view. It owns validation, defaults, the live preview and the submit behaviour. Identical behaviour everywhere is mandatory.

### 8.2 Props

```ts
interface ShiftFormProps {
  mode: 'create' | 'edit';
  initialShift?: Shift;              // edit only
  participants: ParticipantOption[]; // active clients of the business
  defaultClientId?: string;          // from ?clientId= query param
  businessTimezone: string;          // Business.timezone
  isSubmitting: boolean;
  serverFieldErrors?: Record<string, string[] | undefined>;
  onSubmit: (payload: CreateShiftPayload | UpdateShiftPayload, idempotencyKey: string) => void;
  onCancel: () => void;
}
```

### 8.3 Field specification (exact order)

| # | Field | Control | Default | Validation |
|---|---|---|---|---|
| 1 | Participant | `Select` (active participants) | `defaultClientId` → else first participant → else empty | required (`clientId`) |
| 2 | Date | `type="date"` | **today in the business timezone** | required; not future; not older than 90 days |
| 3 | Start time | `type="time"` | `09:00` | required, `HH:mm` |
| 4 | End time | `type="time"` | `13:00` | required; equal to start is invalid; earlier than start = overnight (allowed) |
| 5 | Overnight hint | inline badge (no input) | — | shown when `endTime <= startTime`: **"Crosses midnight — will be split at 12:00 AM"** |
| 6 | Travel | `type="number"` `inputMode="decimal"` `min=0` `max=500` `step=0.1`, label **"Activity-Based Transport (km)"** | `0` | optional, 0–500, ≤ 2 decimals |
| 7 | Support item | `Select` from `SUPPORT_ITEMS` | client's `defaultSupportItemCode` → else `01_011_0107_1_1` | required |
| 8 | Public holiday | 3-button segmented control: **Auto** / **Public holiday** / **Normal day** | `Auto` (`isPublicHoliday: null`) | — |
| 9 | Case notes | `textarea` (4 rows), max 2000 | empty | optional, ≤ 2000 chars; live counter shown after 1500 |
| 10 | Split preview | `SplitPreview` | — | always visible, never blocks submit |

**Field labels must be exactly:** `Participant`, `Date`, `Start Time`, `End Time`, `Activity-Based Transport (km)`, `Default Support Category`, `Public Holiday`, `Case Notes`.

### 8.4 Defaults & smart behaviour

1. **Today** = `DateTime.now().setZone(businessTimezone).toISODate()`. Never `new Date().toISOString()`.
2. Selecting a participant **re-applies their `defaultSupportItemCode`** (only if the user has not manually changed the support item in this session).
3. If the business has exactly one active participant, auto-select it (fewer taps for a sole trader).
4. Deep link support: `/shifts/new?clientId=<uuid>` preselects the participant.
5. Edit mode: all fields prefilled from the shift; the participant select is **disabled** with hint **"Participant cannot be changed — cancel and re-log the shift instead."** (backend rule D20) and `clientId` is never sent in the PATCH body.

### 8.5 Client-side validation (`lib/validators.ts` — additive)

```ts
export const shiftFormSchema = z.object({
  clientId: z.string().uuid('Select a participant.'),
  shiftDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a valid start time.'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Enter a valid end time.'),
  travelKms: z.number().min(0, 'Travel cannot be negative.').max(500, 'Travel cannot exceed 500 km.').optional(),
  supportItemCode: z.string().min(1, 'Select a support category.'),
  caseNotes: z.string().max(2000, 'Notes cannot exceed 2000 characters.').optional(),
});
```
Additional checks performed in the component (not the schema): date not in the future (`SHIFT_DATE_IN_FUTURE` copy), date not older than 90 days, duration not more than 16 hours, and end ≠ start. These must show the same user-facing messages as the backend mapping in Section 12.

### 8.6 Submit behaviour

1. Validate locally; on failure, show inline field errors and focus the first invalid field; **do not call the API**.
2. Generate an `Idempotency-Key` (UUID v4) **once per form session** and reuse it for retries of the same submission; regenerate after a successful save.
3. Disable the submit button while `isSubmitting` (prevents double taps).
4. Submit button label:
   - create → `Save Shift (${formatAud(previewGrandTotal)})` — e.g. `Save Shift ($258.39)`
   - edit → `Save Changes (${formatAud(previewGrandTotal)})`
   - while submitting → `Saving…` with the button's `isLoading` state.
5. On success: `showToast('Shift logged successfully.')` (create) / `showToast('Shift updated successfully.')` (edit), then refresh the parent view and close the surface.
6. On error: keep the form filled, show a `role="alert"` banner with `getApiErrorMessage()`, and map field errors with `getApiFieldErrors()` to the matching inputs.
7. Dirty-state guard: register a `beforeunload` handler while the form has unsaved changes (same pattern as `ClientForm`).

---

## SECTION 9 — QUICK LOGGER MODAL (`components/shifts/ShiftModal.tsx`)

### 9.1 Purpose

The 15-second logger, reachable from the header CTA on every authenticated screen. It is mounted once in `AppLayout`.

### 9.2 Props (keep backwards compatible with the current call site)

```ts
interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients?: ShiftClientOption[];   // optional override; when absent the modal loads active participants itself
  onShiftSaved?: () => void;       // parent refresh hook
  defaultClientId?: string;
}
```

`AppLayout` currently passes `isOpen`, `onClose` and `onShiftSaved` — do not change that contract.

### 9.3 Layout

1. Modal container: `Modal` primitive, panel `max-w-lg`, `max-h-[90vh]`, internal scroll (`overflow-y-auto`) so the mobile keyboard never hides the save button.
2. Header: clock icon tile + title **"Log NDIS Shift"** + subtitle **"15-second entry with live NDIA auto-split"**, and the `VoiceRecorder` mic button on the right.
3. Body: `ShiftForm` (create mode).
4. Footer: `Cancel` (secondary) and the save button — both from `ShiftForm`'s own footer, not the Modal footer, so the label can show the live amount.

### 9.4 Behaviour

- On open: reset the form (participant defaults, today's date, `09:00`–`13:00`, travel `0`, notes empty). **Never keep stale values from the previous shift.**
- The participant list is loaded from `clientsService.list({ isActive: true, pageSize: 100 })` when the `clients` prop is absent, and cached for the session.
- On successful save: toast, call `onShiftSaved?.()`, close the modal, and reset the form.
- Closing with unsaved changes asks for confirmation via the existing `Modal` primitive (title **"Discard unsaved shift?"**, body **"Your changes will be lost."**, buttons `Keep editing` / `Discard`).
- Escape key and backdrop click close the modal only when the form is clean.

---

## SECTION 10 — LIVE AUTO-SPLIT PREVIEW (`components/shifts/SplitPreview.tsx`)

### 10.1 Purpose

Show, in real time, exactly how the shift will be billed. This panel is the trust-building centrepiece of Module 4 — it must match the backend result line for line.

### 10.2 Calculation mirror (`lib/shift-calculator.ts`)

- A pure client-side function `calculateShiftSplit(input, rates, timezone)` that mirrors the backend engine rules **exactly**:
  - tier priority `HOLIDAY > SUNDAY > SATURDAY > weekday`; weekday splits at `20:00` local;
  - overnight = end on the next day, split at local midnight; each segment rated by its own day;
  - `effectiveRate = min(clientHourlyRateAgreed ?? cap, cap)`;
  - travel uses the statutory km rate and is never reduced by the agreed rate;
  - quantities and amounts rounded to 2 decimals; total = sum of rounded line amounts;
  - public holiday resolution: `Auto` → from the client-side AU holiday list for the business state; `Public holiday` → forced; `Normal day` → forced off.
- It is used **only** for the preview. After save, render the server's `lineItems` verbatim.
- Add to `lib/ndis-rates.ts` (additive): `NDIS_RATES_2026` with the six tiers (`itemCode`, `cap`, `unit`) — the same values that are seeded in the database.

### 10.3 Panel layout

```
┌───────────────────────────────────────────────┐
│ NDIS Auto-Split Engine       ✓ 2026 NDIA Limits│
│                                               │
│ 01_011_0107_1_1  Daytime 18:00 – 20:00        │
│                              2.00 h × $67.56  │
│                                    = $135.12  │
│ 01_015_0107_1_1  Evening 20:00 – 21:30        │
│                              1.50 h × $74.42  │
│                                    = $111.63  │
│ 01_799_0107_1_1  Travel 12 km                 │
│                              12 km × $0.97    │
│                                     = $11.64  │
│ ───────────────────────────────────────────── │
│ Total Claim Amount                 $258.39 AUD│
└───────────────────────────────────────────────┘
```

Rules:
- Panel background `bg-surface`, border `border-border`, rounded `rounded-card`, padding 16 px.
- Header row: label **"NDIS Auto-Split Engine"** (uppercase, `text-xs`, tracking-wide, muted) and right-aligned **"✓ 2026 NDIA Limits Active"** in brand-soft.
- Each line: item code + human range on the left, `quantity × rate` and the amount on the right (`font-mono`).
- `DAY` line text `text-text-primary`; `EVENING` line `text-[#5EE0C1]`; other tiers `text-text-primary` with a tier badge; travel line `text-text-secondary`.
- Overnight display: each segment shows its own real times. The first segment's end shows `24:00` and the next segment starts at `00:00`, e.g. `Friday 22:00 – 24:00` then `Saturday 00:00 – 01:00`.
- Total row: top border, bold, brand colour, format `$258.39 AUD`.
- When the applied rate is **below** the cap (agreed-rate case), append `(agreed rate)` in muted text next to the rate.
- When no valid times are entered yet: show the panel with a muted line **"Enter a start and end time to see the split."** and a `$0.00` total (never hide the panel).
- When the duration is invalid (end equals start): show an error-tinted line **"End time must be after start time."** and disable save.

### 10.4 Warnings inside the panel

| Condition | Display |
|---|---|
| Duration > 12 h | Warning-tinted row: **"Long shift (over 12 hours) — please confirm the times."** |
| Participant budget ≥ 70% after this shift | Warning row: **"This will put {name} at {pct}% of their allocated budget."** |
| Participant budget ≥ 100% after this shift | Error-tinted row: **"This exceeds {name}'s allocated budget."** (informational only — save stays enabled, per backend decision D2) |
| Travel km > 0 and the selected support item disallows travel | Error row: **"Travel cannot be claimed with this support category."** and save disabled |

---

## SECTION 11 — SHIFT DETAIL & EDIT (`app/shifts/[id]/page.tsx`)

### 11.1 Read-only view

1. `AppLayout` with `title="{participantName}"`, `subtitle="{formatCalendarDate(shiftDate)} • {startTime}–{endTime}"`.
2. Back link **"← Back to Shifts"**.
3. Summary card: participant + NDIS number, date, time (with `Next day` badge when applicable), total hours, total amount (large, brand), status badge.
4. **Split breakdown card**: the same line structure as `SplitPreview` but rendered from the server `lineItems` (read-only, no recomputation).
5. Public holiday row when `isPublicHoliday`: **"Billed at the public holiday rate — {publicHolidayName}"**.
6. Meta card: timezone used, calculated at (`formatCalendarDate` + time), created by, case notes.
7. Action row (right-aligned):
   - `Edit Shift` (secondary) — only when `status === 'PENDING'` and the role/ownership rule passes.
   - `Cancel Shift` (danger) — same rule.
   - When `status === 'INVOICED'`: a neutral info banner instead — **"This shift is on an invoice and cannot be changed."**
   - When `status === 'CANCELLED'`: an error-tinted banner — **"This shift was cancelled and is excluded from totals."**

### 11.2 Edit mode

- Entered via `?edit=1` (or the `Edit Shift` button). Renders `ShiftForm` in `mode="edit"` inside a `Card`.
- Save → `PATCH /shifts/:id`; on success: toast **"Shift updated successfully."**, exit edit mode, re-fetch the shift.
- Errors `409 SHIFT_ALREADY_INVOICED` / `409 SHIFT_CANCELLED` show a banner and force a re-fetch (the UI state was stale).
- Cancel → returns to the read-only view without saving.

### 11.3 Cancel modal (`components/shifts/CancelShiftModal.tsx`)

- Title: **"Cancel this shift?"**
- Body: **"The shift will be removed from your uninvoiced totals but kept in your records for audit. This cannot be undone from the app."**
- Buttons: `Keep shift` (secondary) / `Cancel shift` (danger).
- On success: toast **"Shift cancelled."** and navigate back to `/shifts`.
- Backend rule reminder: this is a **soft cancel**; never use wording like "permanently delete".

---

## SECTION 12 — VOICE AI UX

### 12.1 Components

| Component | Responsibility |
|---|---|
| `VoiceRecorder.tsx` | Microphone button, permission handling, recording state machine, visible timer, cancel, 60-second auto-stop |
| `VoiceShiftParser.tsx` | Orchestrates upload → preview → prefill of `ShiftForm`; owns consent notice and error handling |
| `VoiceUpgradeModal.tsx` | Shown when voice is unavailable on the current plan/trial |

### 12.2 `VoiceRecorder` state machine

| State | UI | Transitions |
|---|---|---|
| `idle` | Round brand button, `Mic` icon, `title="Tap to speak shift details"` | tap → `requesting` |
| `requesting` | Button shows a spinner; label **"Requesting microphone…"** | permission granted → `recording`; denied → `denied` |
| `recording` | Red button with pulsing glow (`animate-pulse`, red `shadow-[0_0_20px_rgba(239,68,68,0.5)]`), live timer `0:07`, `Stop` and `Cancel` controls, `aria-live="polite"` status **"Recording…"** | stop → `processing`; 60 s reached → auto-stop → `processing`; cancel → discard → `idle` |
| `processing` | Button shows spinner; label **"Transcribing…"**; the rest of the form stays usable | result → `idle` + prefill; failure → `error` |
| `denied` | Inline warning: **"Microphone access is blocked. Allow it in your browser settings, or type the shift instead."** Manual entry stays fully available | retry → `requesting` |
| `error` | Inline error with the mapped message + `Try again` | retry → `idle` |

### 12.3 Recording implementation rules

1. Use `navigator.mediaDevices.getUserMedia({ audio: true })` and `MediaRecorder`.
2. **MIME selection order (mandatory):**
   ```
   audio/webm;codecs=opus → audio/webm → audio/mp4 → audio/aac → (browser default)
   ```
   Pick the first entry for which `MediaRecorder.isTypeSupported(...)` returns true. This is what makes iPhone Safari work (it has no webm support).
3. Recording hard-stops at **60 seconds** (show a countdown after 45 s: **"0:15 left"**).
4. If the recorded blob exceeds **5 MB**, discard and show **"Recording is too long — please keep it under 60 seconds."**
5. Always stop the media tracks (`stream.getTracks().forEach(t => t.stop())`) when recording ends, is cancelled, or the component unmounts. A microphone left open is a privacy bug.
6. The recorded audio blob is held in memory only; it is never written to `localStorage`, never uploaded anywhere except `POST /shifts/voice-parse`, and is cleared after the request completes.

### 12.4 Consent notice (mandatory)

- Before the **first** recording in a browser session, show a one-line notice: **"Voice is processed by AI to fill the form. Review before saving."** with `Got it` (dismiss) — store the dismissal in `sessionStorage` under `_rvVoiceConsent`.
- Never record before the user has accepted it.

### 12.5 Upload & prefill flow (`VoiceShiftParser`)

1. Build `FormData`: `file` = recorded blob (named `shift.<ext>`), `timezone` = `Business.timezone`.
2. `POST /shifts/voice-parse` through `apiClient` with `Content-Type: multipart/form-data` (let the browser set the boundary — do not set the header manually in a way that omits the boundary).
3. While uploading: show the `processing` state; the manual form remains editable and the save button remains available.
4. On success, prefill the form:
   - `clientId` ← `matchedClientId` (if not null) else the first `clientCandidates` entry when there is exactly one
   - `shiftDate`, `startTime`, `endTime`, `travelKms`, `caseNotes` ← parsed values (skip `null`s; never overwrite a field the user has already edited manually in this session)
   - Focus the first entry of `missingFields`, if any
5. **AI-filled fields must be visually marked** with a brand-soft border and a small `AI` badge next to the label. The badge disappears as soon as the user edits that field.
6. Show the transcript preview (max 300 chars) in a muted, collapsible line: **"Heard: “…”"**.
7. Show a warning banner when `confidence < 0.5` or `missingFields.length > 0`: **"Please check the highlighted fields before saving."**
8. **Never auto-submit.** The worker must press the save button.
9. After a successful parse the response's `usage` block updates the local plan state (used/limit) so the mic can be disabled proactively on the next attempt.

### 12.6 Plan gating behaviour

| Backend response | UI |
|---|---|
| `403 VOICE_PLAN_REQUIRED` | Open `VoiceUpgradeModal` — title **"Voice AI is a Pro feature"**, body **"Starter includes unlimited manual shift logging. Upgrade to Pro for unlimited voice-to-shift AI."**, buttons `Not now` / `Upgrade to Pro` (→ `/settings/billing`) |
| `403 TRIAL_VOICE_LIMIT_REACHED` | Open `VoiceUpgradeModal` — title **"Free trial voice limit reached"**, body **"Your trial includes 3 voice transcriptions. Upgrade to keep using voice logging."** |
| `402 TRIAL_EXPIRED` | `VoiceUpgradeModal` — title **"Trial ended"**, body **"Subscribe to continue logging shifts."** |
| `503 VOICE_UNAVAILABLE` | Inline error: **"Voice logging is temporarily unavailable. Please type the shift details."** (no modal) |
| `413` / `415` / `422` | Inline error with the mapped message from Section 16 |
| `504` (provider timeout) | Inline error: **"Voice service timed out — please type the shift details."** |
| `429 RATE_LIMITED` | Inline error: **"Too many voice attempts — please wait a moment."** |

- When the mic is known to be unavailable (trial exhausted, Starter plan), render the mic button **disabled** with `title` explaining why, but keep it clickable to open the upgrade modal.

---

## SECTION 13 — DASHBOARD WIDGETS (`app/dashboard/page.tsx`)

### 13.1 Data source (single request)

```ts
const summary = await dashboardService.getSummary();
// GET /dashboard/summary  →  DashboardSummary
```
Replace the current dashboard behaviour of calling `shiftsService.getRecent(10)` and subscribing to local shifts. **One request, no per-widget calls, no localStorage.**

### 13.2 Widget specifications

| Widget | Component | Content | Empty / edge behaviour |
|---|---|---|---|
| **This Week's Earnings** | `WeeklyEarningsCard` | `formatAud(thisWeek.earnings)` big; `{thisWeek.hours} h • {thisWeek.shiftCount} shifts` muted; change line: `↑ {changePercent}% vs last week` (green) / `↓ {abs}% vs last week` (red) | `changePercent === null` → render **"— vs last week"** muted (never `Infinity`/`NaN`) |
| **Uninvoiced banner** | `UninvoicedBanner` | Visible only when `uninvoiced.shiftCount > 0`: **"⚡ You have {n} unbilled shift(s) ready for invoicing ({formatAud(amount)})."** + button **"Generate Invoice →"** → `/invoices/generate` | Hidden entirely at 0 |
| **Active Participants** | inline card | `activeParticipants` count; sub-line **"All budgets healthy"** when `budgetWatch.length === 0`, else **"{n} nearing budget limit"** (amber) | 0 participants → **"No participants yet"** + link to `/clients/new` |
| **Recent Shifts** | `RecentShiftsCard` | Up to 5 rows from `recentShifts`: date, participant, `start–end`, amount, status badge; each row links to `/shifts/[id]`; footer link **"View all shifts →"** | Empty → **"No shifts logged yet"** + `+ Log Shift` button |
| **NDIS Budget Health Watch** | `BudgetWatchCard` | List of `budgetWatch` rows (max 10): participant name, `formatAud(spent) of formatAud(total)`, utilisation %, progress bar. Reuse the existing `components/clients/BudgetProgress.tsx` | Empty → **"All participant budgets are healthy"** with a success-tinted panel |
| **Trial usage** | inside `UninvoicedBanner` area or the existing trial pill | When `trial !== null`: **"{shiftsUsed}/{shiftsLimit} trial shifts used • {daysRemaining} days left"** | `trial === null` → render nothing |

### 13.3 Invoice CTA dependency

`/invoices/generate` belongs to **Module 5** and may not exist yet. Until that route ships, render the banner button as **disabled** with `title="Available with invoicing (Module 5)"` and keep the amount text visible. Do **not** build any invoice UI in this module.

### 13.4 Realtime-ish refresh

- Re-fetch the summary when: the page mounts, the quick logger reports a successful save (`onShiftSaved`), or the user returns to the tab after being away (`visibilitychange`).
- Show the previous numbers while refreshing (no full-page spinner after the first load) and a subtle top-right spinner.

---

## SECTION 14 — SERVICE LAYER, TYPES & COMPATIBILITY

### 14.1 `lib/shifts-service.ts` (rewrite)

**Hard requirement:** existing call sites must keep working unchanged:
- `app/dashboard/page.tsx` currently uses `shiftsService.getRecent(10)` and `shiftsService.subscribe(...)`
- `components/clients/ClientDetailCard.tsx` uses `shiftsService.list({ clientId })` and expects `ShiftRecord[]`
- `components/shifts/ShiftModal.tsx` uses `shiftsService.create({...})`

Therefore the rewrite must export:

```ts
export interface ShiftRecord { /* unchanged field list — see below */ }

export const shiftsService = {
  // NEW (list page) — returns the full server envelope
  async listPaged(params: ShiftListParams): Promise<{ items: ShiftRecord[]; pagination: Pagination; summary: ShiftSummary }>,
  // KEPT for ClientDetailCard compatibility — maps items to ShiftRecord[]
  async list(params?: { clientId?: string; status?: string }): Promise<ShiftRecord[]>,
  async getById(id: string): Promise<ShiftRecord>,
  async create(payload: CreateShiftPayload, idempotencyKey?: string): Promise<ShiftRecord>,
  async update(id: string, payload: UpdateShiftPayload): Promise<ShiftRecord>,
  async cancel(id: string): Promise<void>,
  async getUninvoiced(params?: { clientId?: string }): Promise<UninvoicedGroup[]>,
  async voiceParse(form: FormData): Promise<VoiceParseResult>,
  // KEPT but now async-safe
  getRecent: (limit: number) => ShiftRecord[],      // delegates to the dashboard summary cache
  subscribe: (cb: () => void) => () => void,         // keep the signature; emit after mutations
};
```

Mapping rules (`ShiftView` → `ShiftRecord`):
- `clientName`, `ndisNumber`, `dayHours`, `eveHours`, `hourlyRate`, `dayTotal`, `eveTotal`, `travelTotal`, `grandTotal` come straight from the server (backend Section 21.1).
- `status` is `PENDING | INVOICED | CANCELLED` — the previous local-only `'PENDING' | 'INVOICED' | 'CANCELLED'` union is unchanged, so no consumer breaks.
- Numbers are already serialised as numbers by the backend; do not `Number()`-wrap blindly, but do guard against `null` with `?? 0`.

### 14.2 Removal of the localStorage fallback

The current `shifts-service.ts` falls back to `localStorage` (`rayvice_logged_shifts`) when the API fails. **Remove that fallback for Module 4:**
- A shift that only exists in the browser can never be invoiced, so silent local writes create phantom data and false trust.
- On network/API failure, surface an error (`showToast(...)` / error state) with a retry.
- Clean up: on first load after this change, delete the legacy `rayvice_logged_shifts` key so stale local rows do not reappear.

### 14.3 `lib/dashboard-service.ts` (new)

```ts
export const dashboardService = {
  async getSummary(): Promise<DashboardSummary>  // GET /dashboard/summary
};
```
- Cache the result in module scope and expose `getCachedSummary()` for `shiftsService.getRecent()` compatibility.
- Re-fetch after any shift mutation (create/edit/cancel).

### 14.4 Type additions (`lib/types.ts` — additive only)

```ts
export type ShiftStatus = 'PENDING' | 'INVOICED' | 'CANCELLED';
export type RateTier = 'DAY' | 'EVENING' | 'SATURDAY' | 'SUNDAY' | 'HOLIDAY' | 'TRAVEL';

export interface ShiftLineItem {
  rateTier: RateTier; supportItemCode: string; description: string;
  quantity: number; unit: 'Hour' | 'KM';
  ndisCapRate: number; appliedRate: number; amount: number;
  segmentStart: string | null; segmentEnd: string | null; sortOrder: number;
}

export interface Shift { /* full ShiftView from backend Section 21.1, incl. lineItems: ShiftLineItem[] */ }

export interface ShiftListResponse { items: Shift[]; pagination: Pagination; summary: ShiftSummary; }
export interface ShiftSummary { totalAmount: number; totalHours: number; count: number; }
export interface CreateShiftPayload { clientId: string; shiftDate: string; startTime: string; endTime: string; travelKms?: number; caseNotes?: string; isPublicHoliday?: boolean | null; supportItemCode?: string; }
export type UpdateShiftPayload = Omit<Partial<CreateShiftPayload>, 'clientId'>;

export interface BudgetBlock { allocatedTotal: number | null; allocatedSpent: number; utilizationPercent: number | null; level: 'OK' | 'WARNING' | 'EXHAUSTED'; }
export interface ShiftMutationResponse { shift: Shift; budget: BudgetBlock; warnings: string[]; }

export interface DashboardSummary {
  thisWeek: { earnings: number; hours: number; shiftCount: number; previousWeekEarnings: number; changePercent: number | null };
  uninvoiced: { shiftCount: number; totalAmount: number };
  activeParticipants: number;
  recentShifts: Shift[];
  budgetWatch: Array<{ clientId: string; participantName: string; allocatedTotal: number; allocatedSpent: number; utilizationPercent: number; level: 'WARNING' | 'EXHAUSTED' }>;
  trial: { status: string; daysRemaining: number; shiftsUsed: number; shiftsLimit: number } | null;
}

export interface VoiceParseResult {
  transcriptPreview: string;
  parsed: { clientFirstName: string | null; shiftDate: string | null; startTime: string | null; endTime: string | null; travelKms: number | null; caseNotes: string | null; confidence: number; missingFields: string[] };
  matchedClientId: string | null;
  clientCandidates: Array<{ id: string; participantName: string; ndisNumber: string }>;
  ndisNumberRedacted: boolean;
  usage: { voiceParsesUsed: number; voiceParsesLimit: number; planTier: string };
}
```

Also **additive** to `Business` / `BusinessProfile`: `timezone?: string; state?: string | null; planTier?: string;`. Nothing existing is removed or renamed.

---

## SECTION 15 — MANUAL QA CHECKLIST (run before declaring done)

**Environment:** log in as a business with ≥ 2 participants and a mix of shifts.

| # | Check |
|---|---|
| 1 | `/shifts` loads with the Uninvoiced tab active and correct totals in the summary strip. |
| 2 | Every tab, filter and page change issues the correct request and shows a loading skeleton. |
| 3 | Empty business shows "No shifts logged yet" with the `+ Log Shift` button. |
| 4 | Filters that match nothing show the filtered empty state and "Clear filters" works. |
| 5 | Simulated API failure shows the error card and `Try Again` recovers. |
| 6 | Header CTA opens the quick logger from `/dashboard`, `/clients`, `/settings` and `/shifts`. |
| 7 | Logger opens with today's date **in the business timezone** (verify with a Sydney business after 10:00 PM). |
| 8 | Live preview matches the backend result exactly for: plain weekday, straddling 20:00, Saturday, Sunday, holiday (forced), overnight, travel-only, agreed-rate-below-cap. |
| 9 | Overnight shift renders two segments with `24:00` / `00:00` boundaries. |
| 10 | Setting end time equal to start time disables save and shows the inline error. |
| 11 | Date in the future and date older than 90 days are both blocked client-side with the correct message. |
| 12 | Travel > 500 km is blocked; travel on a travel-disallowed item shows the error row. |
| 13 | Saving shows the correct toast, returns to the list, and the new row shows the server amounts. |
| 14 | Double-clicking save creates only one shift (idempotency). |
| 15 | Editing a PENDING shift re-runs the split and updates the totals. |
| 16 | An INVOICED shift shows the lock notice and exposes no edit/cancel actions. |
| 17 | Cancelling removes the shift from uninvoiced totals and shows it only under "All" with a Cancelled badge. |
| 18 | Participant budget on `/clients/[id]` increases after logging a shift, and decreases after cancelling it. |
| 19 | Budget warning appears at ≥ 70% and the error-tinted line at ≥ 100%, and **save still works**. |
| 20 | Dashboard widgets all populate from one `/dashboard/summary` request (verify a single network call). |
| 21 | `changePercent` shows "—" when the previous week had zero earnings. |
| 22 | Uninvoiced banner appears only when there are unbilled shifts. |
| 23 | Voice: recording starts, shows the timer, auto-stops at 60 s, and prefills the form. |
| 24 | Voice: AI-filled fields carry the `AI` badge and the badge clears on manual edit. |
| 25 | Voice: the transcript preview appears and is ≤ 300 characters. |
| 26 | Voice: denying microphone permission shows the "blocked" message and manual entry still works. |
| 27 | Voice: on iPhone Safari the recording uploads successfully (mp4 path). |
| 28 | Voice: trial business sees the limit modal on the 4th parse; Starter business sees the Pro modal. |
| 29 | Voice: provider failure shows the timeout message and manual entry still works. |
| 30 | Voice never saves a shift by itself and the consent notice appears once per session. |
| 31 | TECHNICIAN sees only their own shifts and no worker filter; OWNER sees all shifts and the worker filter. |
| 32 | Nothing regressed in `/clients`, `/clients/[id]`, `/settings`, `/login` (participant detail still lists recent shifts). |
| 33 | `npx tsc --noEmit` is clean and `npx next build` succeeds. |
| 34 | No console errors on any Module 4 screen; no microphone stream left open after recording. |

---

## SECTION 16 — ERROR MESSAGE MAPPING & TOASTS

### 16.1 `errorCode` → user message

| `errorCode` | Message shown |
|---|---|
| `TRIAL_SHIFT_LIMIT_REACHED` | "Free trial limit of 5 shifts reached. Subscribe to log unlimited shifts." (+ upgrade modal) |
| `TRIAL_VOICE_LIMIT_REACHED` | "Your trial includes 3 voice transcriptions. Upgrade to keep using voice logging." |
| `VOICE_PLAN_REQUIRED` | "Voice AI is a Pro feature. Upgrade to Pro to use voice logging." |
| `VOICE_UNAVAILABLE` | "Voice logging is temporarily unavailable. Please type the shift details." |
| `VOICE_FILE_TOO_LARGE` | "Recording is too long — please keep it under 60 seconds." |
| `INVALID_AUDIO_FORMAT` | "That audio format is not supported on this device." |
| `VOICE_AUDIO_TOO_LONG` | "Recording is too long — please keep it under 60 seconds." |
| `VOICE_TRANSCRIPT_UNUSABLE` | "We couldn't understand the recording. Please try again or type the shift." |
| `VOICE_TRANSCRIPTION_FAILED` / `VOICE_PARSE_FAILED` | "Voice service timed out — please type the shift details." |
| `SHIFT_ALREADY_INVOICED` | "This shift is on an invoice and cannot be changed." |
| `SHIFT_CANCELLED` | "This shift was cancelled and can no longer be edited." |
| `SHIFT_OVERLAP` | "This overlaps another shift for the same worker. Adjust the times or edit the other shift." |
| `DUPLICATE_SHIFT` | "A shift with the same start time already exists for this participant." |
| `SHIFT_DATE_IN_FUTURE` | "You can't log a shift in the future." |
| `SHIFT_DATE_TOO_OLD` | "Shifts can only be logged up to 90 days back." |
| `SHIFT_DURATION_TOO_LONG` | "A shift can't be longer than 16 hours." |
| `SHIFT_DURATION_INVALID` | "End time must be after start time." |
| `TRAVEL_KM_INVALID` | "Travel must be between 0 and 500 km." |
| `TRAVEL_NOT_ALLOWED_FOR_ITEM` | "Travel can't be claimed with this support category." |
| `INVALID_SUPPORT_ITEM` | "Select a valid support category." |
| `CLIENT_NOT_FOUND` / `CLIENT_INACTIVE` | "That participant is no longer available. Choose another." |
| `TRIAL_EXPIRED` | "Your trial has ended. Subscribe to continue logging shifts." |
| `RATE_LIMITED` | "Too many attempts — please wait a moment and try again." |
| `FORBIDDEN` | "You don't have permission to do that." |
| *(fallback)* | `getApiErrorMessage()` default text |

### 16.2 Toast copy (exact)

| Event | Toast |
|---|---|
| Shift created | success — **"Shift logged successfully."** |
| Shift updated | success — **"Shift updated successfully."** |
| Shift cancelled | success — **"Shift cancelled."** |
| Voice prefill applied | success — **"Voice captured — review the details before saving."** |
| Any failure | error — the mapped message above |

Toasts never contain raw API messages, stack traces, or `errorCode` strings.

---

## SECTION 17 — ACCEPTANCE CRITERIA (DEFINITION OF DONE)

1. ☐ `/shifts` exists (no 404) and is reachable from the sidebar item already labelled "Shifts & Splitter".
2. ☐ Tabs map to `status=PENDING | INVOICED | (none)` and reset pagination.
3. ☐ Filters (from, to, participant, worker) work; the worker filter is OWNER/OFFICE_MANAGER-only.
4. ☐ Summary strip reflects the whole filtered set, not just the current page.
5. ☐ Table columns, status badges and the `Next day` badge match Section 7.4.
6. ☐ Loading skeletons, both empty states, and the error state with retry all exist.
7. ☐ `/shifts/new`, the quick modal and the edit view all use the same `ShiftForm` and behave identically.
8. ☐ Today's date is computed in the business timezone (verified in QA).
9. ☐ The live preview matches the backend amounts for all eight QA scenarios.
10. ☐ The preview shows per-line item codes, ranges, quantities, rates and the AUD total.
11. ☐ Agreed-rate-below-cap lines are annotated "(agreed rate)".
12. ☐ Overnight shifts display two segments split at midnight.
13. ☐ Budget warnings (≥ 70% amber, ≥ 100% red) render and never block saving.
14. ☐ Travel validation (range + item permission) is enforced in the UI.
15. ☐ Save is disabled while submitting and uses an `Idempotency-Key`.
16. ☐ Success toasts and navigation/reload behaviour match Section 16.2.
17. ☐ Server field errors map onto the correct inputs via `getApiFieldErrors()`.
18. ☐ Dirty forms warn before unload and before discarding the modal.
19. ☐ PENDING shifts are editable; INVOICED shifts are read-only with a lock notice; CANCELLED shifts are read-only.
20. ☐ Cancel uses the soft-cancel modal copy exactly as specified.
21. ☐ Voice recording works on Chrome/Android (webm) **and** iOS Safari (mp4 fallback), auto-stops at 60 s, and enforces the 5 MB cap.
22. ☐ Media tracks are always stopped; audio is never persisted anywhere.
23. ☐ The consent notice appears once per session before the first recording.
24. ☐ AI-filled fields show the `AI` badge and the transcript preview (≤ 300 chars).
25. ☐ Missing fields are focused and the low-confidence banner is shown.
26. ☐ Voice never auto-saves; the worker must confirm.
27. ☐ Plan gating renders the correct modal for Starter, trial-limit and trial-expired cases and disables the mic proactively.
28. ☐ Voice provider failures degrade to a manual-entry message.
29. ☐ Dashboard renders all six widgets from a single `/dashboard/summary` call.
30. ☐ `changePercent === null` renders "—" (no NaN/Infinity).
31. ☐ Budget watch lists ≥ 70% participants, sorted descending, max 10.
32. ☐ `ClientDetailCard` ("Recent Shifts" on the participant page) still works with the rewritten service.
33. ☐ The localStorage shift fallback is removed and the legacy key is cleaned up.
34. ☐ No Module 1–3 page regressed.
35. ☐ `npx tsc --noEmit` and `npx next build` both pass.
36. ☐ No raw `errorCode`, stack trace or untranslated API text is ever shown to a user.

---

## SECTION 18 — OUT OF SCOPE RECAP (v2)

Do **not** build: sleepover/night entry mode, cancellation-claim UI, PRODA/Myplace CSV export, offline queue and background sync, 15-minute billing-increment settings, map-based travel distance, push notifications, invoice generation UI (Module 5 owns `/invoices/*`), and any change to the design system, auth flow, or participant pages.

---

## SECTION 19 — IMPLEMENTATION PHASES

| Phase | Work | Exit criteria |
|---|---|---|
| 1 | Types + `shifts-service` rewrite + legacy cleanup | `ClientDetailCard` and the dashboard still compile and work |
| 2 | `lib/shift-calculator.ts` + `lib/ndis-rates.ts` additions | Preview matches hand-checked examples (Section 10.2) |
| 3 | `ShiftForm` + `SplitPreview` | Create/edit works through the quick modal |
| 4 | `/shifts` list page (+ filters, table, states) | Tabs/filters/pagination/actions all functional |
| 5 | `/shifts/[id]` detail + edit + cancel modal | Immutability rules enforced in the UI |
| 6 | Voice: `VoiceRecorder` + `VoiceShiftParser` + gating modals | QA items 23–30 pass |
| 7 | Dashboard widgets + `dashboard-service` | QA items 20–22 and 29–31 pass |
| 8 | Full QA checklist + `tsc` + `next build` | Section 15 and Section 17 fully green |

Commit each phase separately. Do not start a phase before the previous phase's exit criteria pass.

---

## SECTION 20 — OPEN QUESTIONS (defaults are binding until answered)

| # | Question | Default |
|---|---|---|
| Q1 | Should the table show a per-tier colour legend? | No — badges only |
| Q2 | Should `/shifts/new` exist as a route, or is the modal enough? | **Both** (the route is required by the spec) |
| Q3 | Default logger times | `09:00`–`13:00` (matches the existing modal) |
| Q4 | Show the participant's budget bar inside the logger? | Only the warning line, not the full bar |
| Q5 | Should technicians be able to see the business-wide worker filter? | No |

---

**END OF MODULE 4 FRONTEND SPECIFICATION — v1.0**
