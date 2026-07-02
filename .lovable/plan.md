
# Phaos CRM — Build Plan

A high-velocity B2B sales workspace with all 10 modules wired to a real backend, ready for a future voice integration. Built as a modular component architecture so each surface can evolve independently.

## Approach

1. **Design first.** Render 5 design directions (3 from the design tool + 2 custom: one dark, one light, both inspired by phaosai.com branding). You pick one; everything is built against it.
2. **Backend on.** Enable Lovable Cloud immediately so leads, deals, tasks, contacts, activities, and call logs persist and sync across the dialer, timeline, and task manager.
3. **Frontend shell + all modules.** Every module from your brief, populated with realistic seed data, fully navigable.
4. **Voice-ready architecture.** Dialer UI + global "active call" state machine + server function stubs ready for a future telephony provider — no provider name shipped in the UI or code.

## Architecture

```text
src/
├── routes/
│   ├── __root.tsx              Sidebar shell + global call bar
│   ├── _authenticated/         Auth gate (managed)
│   │   ├── dashboard.tsx       Command Center
│   │   ├── leads.tsx           Lead table + filters
│   │   ├── leads.$id.tsx       Contact profile + activity feed + enrichment
│   │   ├── pipeline.tsx        Kanban deal board
│   │   ├── tasks.tsx           Monday-style task board
│   │   ├── contacts.tsx        Contact directory
│   │   ├── documents.tsx       File library + preview
│   │   ├── analytics.tsx       Leaderboard + funnel
│   │   └── settings.tsx
│   └── auth.tsx                Email + Google sign-in
├── components/
│   ├── shell/                  Sidebar, topbar, mobile bottom-nav
│   ├── dialer/                 Side-panel dialer, keypad, queue, controls
│   ├── leads/                  LeadTable, FilterBar, ActivityTimeline
│   ├── pipeline/               KanbanBoard, DealCard, StageColumn
│   ├── tasks/                  TaskGroup, TaskRow, status pills
│   ├── contacts/               EnrichmentProfile, DataOverviewCard
│   ├── documents/              FilePicker, FilePreview
│   ├── analytics/              MetricWidget, FunnelChart, Leaderboard
│   └── ui/                     shadcn primitives
├── stores/
│   └── active-call.ts          Zustand store — survives navigation
└── lib/
    ├── leads.functions.ts      CRUD via createServerFn
    ├── deals.functions.ts
    ├── tasks.functions.ts
    ├── activities.functions.ts
    └── calls.functions.ts      Dialer events (provider-agnostic)
```

## Module breakdown

**Command Center Dashboard** (Salesforce Lightning ref) — 6-widget grid: Closed Business gauge, Sales Pipeline by stage (horizontal bars), Sales Activity by Rep (stacked bars), Month-over-Month line, Forecast by Month, Pipeline by Rep. Edit mode + Add Widget.

**Power Dialer** (side panel, always-mountable) — collapsible right panel with active call header (name, number, live duration), keypad, mute/hold/transfer/record, Next-in-Queue card, disposition buttons (No Answer, Went to VM, Contact Not In, Left Message, Call Back Later, Busy, Not Interested), and a Call List queue table. State lives in a global Zustand store so the call persists across route changes.

**Lead Management** (Zoho ref) — dense data table: checkbox column, sortable headers (Last Name, Lead Source, Phone, Annual Revenue, Email), pagination, filter chip rail, "Create Contact" + bulk Actions, view switcher. Click row → contact profile.

**Contact Profile + Activity Feed** (HubSpot ref) — left rail (avatar, quick actions: Note/Email/Call/Log/Task/Meet, About card), center activity timeline (Activity/Notes/Emails/Calls/Tasks tabs, filter dropdowns, grouped by month, mixed event types: lifecycle, video view, form submission, email, call), right rail (Company, Related Companies, Deals, Tickets accordions).

**Pipeline Kanban** (Pipedrive ref) — 5 stage columns (Qualified, Contact Made, Demo Scheduled, Proposal Made, Negotiations Started), stage totals + deal counts, draggable cards with colored bar, rotting-deal warning icon, won/lost indicators, bottom drop-zones (DELETE / LOST / WON / MOVE-CONVERT) appear during drag. View switcher (board / list / forecast).

**Task Manager** (Monday ref) — grouped boards ("This Week", "Next Week"), colored group strip, columns (Item, Owner, Priority high/med/low, Status working/waiting/approved, Date, Description), inline add, group summary bars.

**Contact Enrichment** (Clearbit ref) — sidebar nav (Home, Target Market, Visitors, People, Companies, Integrations, Batch, APIs, Advertising, Connect, Usage, Support), greeting header, Data Overview metric cards with sparklines (New companies, New people, Visitors, Companies/People enriched), Match Rate Analysis with attribute bars.

**Document Management** (Salesforce ref) — Select File modal: left source list (Owned by Me, Shared with Me, Recent, Following, Libraries, External Sources), search, file rows with type-colored icon, name, date, size, format. Upload + Add actions.

**Analytics / Leaderboard** (Dialpad ref) — date range + team selector, Conversion Funnel (Total Calls → Conversations → Playbook Adherence), Leaderboard table (Name, Total Calls + sparkline + delta, Validated Calls, Quality Calls, Avg Playbook Adherence colored, Disposition columns).

**Mobile View** (Pipedrive ref) — responsive: bottom tab bar (Deals/Activities/Contacts/More), filter chips (Open/Today/Cold), card list with title/contact/value/status, floating green + FAB, status check circles.

## Backend (Lovable Cloud)

Tables: `profiles`, `leads`, `contacts`, `companies`, `deals`, `deal_stages`, `tasks`, `activities` (polymorphic timeline events), `calls`, `documents`, `user_roles`. RLS scoped to `auth.uid()` on user-owned rows + `has_role()` for admin views. Auth: email/password + Google. Seed migration loads ~30 leads, 13 deals across 5 stages, ~20 tasks, mixed activity timeline, sample documents, leaderboard stats.

## Global "active call" state

Zustand store (`stores/active-call.ts`): `{ status, leadId, contactName, number, startedAt, queue[], muted, onHold, recording }`. Mounted in `__root.tsx` as a persistent side panel — opening a different route never tears down the call. Dialer actions emit to `calls.functions.ts` which writes to the `calls` + `activities` tables, so the timeline updates in real time.

## Design system

- High-contrast professional. Dense data, generous tap targets.
- Tokens in `src/styles.css` `@theme` + `@theme inline` (OKLCH).
- Tailwind v4, shadcn primitives, lucide icons, Recharts for the dashboard, dnd-kit for Kanban + tasks.
- Mobile-first responsive with the documented grid+min-w-0+shrink-0 header pattern.

## Build sequence (one continuous build after design pick)

1. Render 5 design directions (3 generated + 2 Phaos-branded dark/light); you pick.
2. Enable Lovable Cloud; create schema + RLS + seed migration; wire auth.
3. App shell, sidebar, routing, design tokens.
4. Dashboard → Leads table → Contact profile + timeline.
5. Pipeline Kanban → Tasks board.
6. Enrichment profile → Documents → Analytics/Leaderboard.
7. Global dialer panel + active-call store + calls server fns.
8. Mobile responsive pass + bottom nav.
9. Seed + smoke test all routes.

## Out of scope (call out)

- Real telephony (architecture is provider-ready; no provider wired or named).
- Email/calendar sync, real OAuth to Google/Microsoft beyond sign-in.
- Multi-tenant org switching beyond a single workspace.

