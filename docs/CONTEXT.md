Goal (Revised)

Ship a focused MVP that proves differentiation vs Runna by delivering truly adaptive planning (full weekly re‑plan, not just pace nudges), effort‑first coaching (RPE/HR with GAP & heat guidance), and missed‑run reflow—using a deterministic backend. You already have substantial frontend UI (home, intake wizard, plan preview). This plan assumes we reuse your UI, wire in a real planning engine + persistence, then harden with tests, Docker, and CI. Target a closed beta (100–300 users) by Day 90 with ≥35% D30 for engaged cohort.

Your current starting point

Frontend: Home page (needs copy tweaks), intake wizard (answers captured), plan preview UI.

Backend: Shell only.

DevOps: No tests yet, not dockerised, no pipeline.

Implication: We front‑load the planning engine + API + storage, wire your existing UI, then add tests and ops. No rewrites; minimal UI delta.

Positioning (Home page copy — suggested patch)

Hero:Plans that truly adapt—automatically.Runzi rebuilds your week from what you actually did—RPE, missed runs, and fatigue—not just target paces. Effort‑first guidance with terrain & heat smarts.

Bullets:

Weekly auto‑replan with a clear “what changed & why” diff

Effort‑first targets (RPE/HR), with GAP & heat guidance for real‑world pacing

Missed‑run reflow to protect stimulus sequencing (no intensity stacking)

Time‑boxed weeks: run + short strength/mobility built‑in

CTA: Create your plan → (keeps existing design)

Scope (MVP)

User value

Personalised plan in minutes (goal, target date, weekly hours, constraints, niggles)

Weekly auto‑replan from: completed sessions + RPE + missed/shortened runs + optional HR

Effort‑first targets with coach’s notes (RPE primary; pace advisory; GAP/heat hints)

Missed‑run reflow

Integrated 15–25′ mobility/strength sessions with niggle‑aware swaps

Activity ingest v1: manual log (Strava read is Phase 4)

Non‑goals (post‑MVP)

Watch app; push to Garmin/Apple

HRV/Readiness integrations

Human coach chat

Localization

Success metrics

Setup time < 7 minutes (p50)

≥ 80% complete week 1 with ≥ 3 logged sessions

Weekly replan acceptance ≥ 70%

D30 retained (engaged cohort) ≥ 35%

NPS ≥ 40 in beta

Architecture (aligned to your stack)

Frontend: React + Vite + TS + Tailwind; Recharts. (Reuse your wizard and plan preview.)
Backend: Node/Express + TS; Prisma + PostgreSQL. Deterministic planner (no LLMs required).
Infra: Docker Compose (web, api, db); GitHub Actions CI (mocked UI, E2E, API tests).
Analytics: PostHog or Plausible.

Shared types (monorepo or /shared)

PlanInput, Plan, WeekPlan, Workout, ActivityLog, ReplanDiff (see Types section).

Minimal data model (Prisma)

model User { id String @id @default(cuid()); email String @unique; name String?; plans Plan[] }
model Plan { id String @id @default(cuid()); userId String; user User @relation(fields: [userId], references: [id]); goal String; startDate DateTime; targetDate DateTime?; weeklyHoursMin Int; weeklyHoursMax Int; runsPerWeek Int; surfaces String?; constraints Json?; injuries Json?; medicalFlags Json?; weeks Week[] }
model Week { id String @id @default(cuid()); planId String; plan Plan @relation(fields: [planId], references: [id]); weekIndex Int; startDate DateTime; rampPercent Float; intensityMix Json; rationale Json?; workouts Workout[] }
model Workout { id String @id @default(cuid()); weekId String; week Week @relation(fields: [weekId], references: [id]); type String; date DateTime; durationMin Int; focus String?; structure Json?; notes String? }
model ActivityLog { id String @id @default(cuid()); userId String; date DateTime; type String; durationMin Int; distanceKm Float?; rpe Int?; avgHr Int?; notes String?; source String }

API surface (v1)

POST /plans → create plan from wizard (PlanInput) → returns Plan (at least Week 0–1)

GET /plans/:id → plan with weeks

POST /plans/:id/replan → body: { anchorWeek } + server pulls recent logs → returns ReplanDiff

POST /logs → create ActivityLog

GET /logs?from=...&to=... → list

Types (shared)

export type Goal = "5k" | "10k" | "Half" | "Marathon" | "Base" | "ReturnToRun";
export interface PlanInput { goal: Goal; targetDate?: string; startDate: string; weeklyHoursMin: number; weeklyHoursMax: number; runsPerWeek: number; surfaces?: ("road"|"trail"|"track")[]; constraints?: { daysUnavailable?: number[]; longRunDay?: number }; injuries?: string[]; medicalFlags?: string[] }
export type WorkoutType = "run"|"mobility"|"strength";
export interface Workout { id: string; type: WorkoutType; date: string; durationMin: number; structure?: unknown; focus?: "Z2"|"Tempo"|"Threshold"|"Intervals"|"Long"|"Recovery"; notes?: string }
export interface WeekPlan { weekIndex: number; startDate: string; rampPercent: number; intensityMix: { easy:number; moderate:number; hard:number }; workouts: Workout[]; rationale?: string[] }
export interface Plan { id: string; userId: string; input: PlanInput; weeks: WeekPlan[] }
export interface ActivityLog { id:string; userId:string; date:string; type:WorkoutType; durationMin:number; distanceKm?:number; rpe?:number; avgHr?:number; notes?:string; source:"manual"|"strava"|"csv" }
export interface ReplanRequest { planId:string; weekIndex:number }
export interface ReplanDiff { before: WeekPlan; after: WeekPlan; reasons: string[] }

Planning logic (deterministic)

Initial plan

Pyramidal/80‑20 distribution; ramp ≤ 8% weekly; long run ≤ 30–35% of time.

Inject 2× mobility + 1× strength per week (15–25′), time‑boxed.

Weekly replan

Inputs: completed logs (RPE, distance/time, HR optional), missed runs, niggle flag.

Rules: missed key workout → move stimulus; repeated RPE ≥ 8 → −10–15% volume next week + convert one quality to easy; high long‑run decoupling → downgrade tempo → aerobic; niggle → plyo→isometric swap.

Output: updated week + reasons.

Coach’s notes

RPE first, pace advisory; GAP/heat hints automatically shown in notes.

UI deltas (small)

Wizard: add fields for weeklyHoursMin/Max, runsPerWeek, constraints.longRunDay, constraints.daysUnavailable, injuries/niggle flags. Tooltips for RPE scale.

Plan preview: show guardrails (ramp %, intensity mix), Why this plan (rationale), and buttons: Log workout, Trigger replan.

Diff modal: side‑by‑side Week N (before/after) + reasons list; Accept/Undo.

Home page: apply copy patch above (keep existing layout).

90‑Day Plan (reordered for your state)

Sprint 0 — Foundations (Days 1–5)

Create /shared types (above) and path aliases

Prisma schema + migrations; seed a small library of mobility/strength templates

Express API scaffold: /plans, /logs, /plans/:id/replan

Wire wizard submit → POST /plans → render Week 0–1 in your existing plan preview

(Optional) Minimal Docker Compose with Postgres + pgAdmin; .env templates

Deliverable: End‑to‑end: create plan → see week → data persists.

Sprint 1 — Adaptivity Core (Days 6–14)

Implement replan rules + ReplanDiff

Diff UI (modal) with reasons and Accept/Undo

Coach’s Notes composer (RPE‑first, GAP/heat hints)

Manual logging page (distance/time/RPE/notes) and hooks on plan view

Deliverable: Log runs → trigger replan → accept; notes populated.

Sprint 2 — Hardening & UX (Days 15–28)

Add schedule editor (drag within week) with guardrails (no intensity stacking)

Empty states, error handling, onboarding tips

Analytics events: created_plan, logged_workout, replan_accepted, churn_signals

Testing pass v1: unit (planner & rules), API (Supertest), mocked UI (Playwright)

Deliverable: Stable UX; tests covering core flows.

Sprint 3 — S&C + Niggle‑aware (Days 29–42)

Library of 10× mobility & 10× strength sessions; niggle flags drive swaps

CSV import for historic runs (last 30 days)

Visuals: ramp%, intensity mix, monotony/strain indicators

Deliverable: Whole‑week adapts run + S&C; simple history import.

Sprint 4 — Strava Read + Race Day (Days 43–60)

Strava OAuth read → activity_logs (dedupe with manual)

Race plan v1: pace band + fueling schedule (downloadable PNG/PDF)

Pricing screen (soft gate) + beta invites/feature flags

Deliverable: Real data ingest; basic race‑day output.

Sprint 5 — Ops & Beta (Days 61–90)

Docker for api/web/db; GitHub Actions CI (build, lint, unit/API/Playwright)

Performance pass; accessibility checks

Weekly email digest + replan notification

Private beta launch; feedback loop (in‑app report + office hour)

Deliverable: Beta live to 100–300 runners.

Acceptance criteria snapshots

Create plan: Given goal + weekly hours + constraints → plan length & weekly guardrails visible.

Replan: After logging a missed tempo + long‑run RPE ≥ 8 → next week reduces volume and moves threshold; reasons shown.

Niggle: If Achilles niggle flagged → plyos replaced with isometrics; long‑run gains walk breaks.

Import: CSV import shows last 30 days; duplicates resolved deterministically.

Testing strategy (start small, expand)

Unit (Vitest): generator, rules engine, notes composer

API (Supertest): /plans, /logs, /replan happy & edge cases

Mocked UI (Playwright): wizard → plan → log → replan → accept

E2E later: with real API + seeded DB

Immediate 7‑day checklist

Add /shared/types and refactor wizard submit → PlanInput

Implement Prisma models + POST /plans to return Week 0–1

Render those weeks in your existing plan preview (no UI rewrite)

Build manual log form + POST /logs

Implement minimal replan() rules (missed‑run & high‑RPE) + Diff modal

Patch home page copy to the positioning above

Create .env.example for DB/API secrets (prep for Docker)

Nice‑to‑haves if time remains

Course GPX import + elevation‑aware pacing

Readiness proxy (simple illness/sleep check‑in)

Clubs/coached templates

—
Bottom line: No rewrites. We keep your UI, wire a deterministic planner + storage, then add adaptivity, logs, and a clean diff UX. Docker/tests/pipeline come once the core loop works end‑to‑end.



Day‑by‑day schedule (12 weeks)

Use this as the single source of truth. Adjust as needed; keep the history by striking through removed items and appending the new plan beneath.

Week 1 — Foundations & first end‑to‑end loop

Day 1

Create /shared/types and add: PlanInput, Plan, WeekPlan, Workout, ActivityLog, ReplanDiff.

Init Prisma + Postgres, write schema, run first migration.

Express scaffold: /health, /plans, /logs, /plans/:id/replan.

Day 2

Implement generateInitialPlan(input) with guardrails (ramp ≤ 8%, long‑run ≤ 35%, pyramidal mix).

Implement POST /plans → returns Week 0–1; persist Plan + Weeks + Workouts.

Seed 5 mobility + 5 strength templates (15–25′).

Day 3

Wire wizard submit → PlanInput → POST /plans.

Render Week 0–1 in plan preview (reuse UI) with guardrails panel.

Add “Why this plan” bullets (rationale on ramp %, intensity mix, long‑run cap).

Day 4

Build Manual Log UI (distance, time, RPE, notes; HR optional).

Implement POST /logs and simple /logs?from&to list; show logs under plan.

Day 5

Minimal replan(plan, logs, anchorWeek) rules: missed‑run reflow + high‑RPE volume cut (−10–15%).

Implement POST /plans/:id/replan → return ReplanDiff { before, after, reasons }.

Diff modal with Accept/Undo; persist accepted week.

Day 6

Patch home hero copy to adaptive USP; add error states & loading.

Path aliases (frontend/backend) + tidy folder structure.

Day 7

Tests v0: unit (generator happy path), API (Supertest: /plans, /replan happy path).

Optional: Docker Compose for api+db; .env.example.

Week 2 — Adaptivity core & visibility

Day 8

Expand replan rules: explicit stimulus carryover (missed tempo → move threshold next week).

Map all rule triggers to human‑readable reasons[].

Day 9

Recompute weekly intensity distribution after changes; keep pyramidal within ±5%.

Ensure long‑run stays ≤ 35% of weekly time after replan.

Day 10

Long‑run decoupling proxy: if HR present & decoupling > 7–8% → downgrade next week’s tempo to aerobic.

Notes composer v1 (RPE‑first; GAP/heat hints).

Day 11

Persist adjustments audit: who/when/why; support Undo.

Add “What changed & why” sidebar to plan page.

Day 12

Charts: ramp %, intensity mix. Recharts line/bar with clean legends.

Day 13

Playwright mocked UI tests: wizard → plan → log → replan → accept.

Day 14

Bugfix/refactor; tag v0.1; write CHANGELOG.

Week 3 — UX hardening & onboarding

Day 15

Schedule editor: drag within a week; guardrails prevent intensity stacking.

Day 16

Empty states for plans/logs; inline validation on wizard.

Day 17

Onboarding tips (coach callouts on first plan); glossary links for RPE, GAP, decoupling.

Day 18

Error surfaces: network/API fallbacks; retries on transient errors.

Day 19

Analytics baseline (PostHog/Plausible): created_plan, logged_workout, replan_accepted.

Day 20

Accessibility pass on wizard & plan pages.

Day 21

Tests v1: unit for rules, snapshot tests for diff composer.

Week 4 — Strength/Mobility & niggle‑aware swaps

Day 22

Expand library to 10 mobility + 10 strength sessions; tag by load/impact.

Day 23

Niggle flags in log (Achilles, knee, hip, back) → rules to swap plyo → iso, jumps → calf raises, etc.

Day 24

Inject S&C adaptively in weekly plan based on niggle + fatigue budget.

Day 25

UI: toggle to view/replace S&C; tooltips on substitutions.

Day 26

Tests: substitution logic; guard against scheduling two high‑impact days back‑to‑back.

Day 27

Polish copy in coach’s notes for niggle guidance.

Day 28

Bugfix & refactor.

Week 5 — Import & insights

Day 29

CSV import for last 30 days; map to ActivityLog; dedupe with manual logs.

Day 30

History view (table + totals) and basic filters.

Day 31

Monotony/strain indicators (weekly load / stdev; flag high monotony).

Day 32

Surface insights post‑run: “Decoupling high → next long run cap HR X; add 5′ walk breaks.”

Day 33

Tests for import parser + dedupe.

Day 34

UX polish on tables & charts.

Day 35

Tag v0.2.

Week 6 — Strava read (no write) & dedupe

Day 36

Strava OAuth (read scope); store tokens securely.

Day 37

Import pipeline: fetch recent activities → ActivityLog mapper.

Day 38

Dedupe strategy (by start time, distance, duration tolerance) vs manual/CSV.

Day 39

UI: Connect/Disconnect Strava; import status; last sync time.

Day 40

Error handling & rate‑limit backoff.

Day 41

Tests for mapping/dedupe; log trace ids for imports.

Day 42

Bugfix & doc; tag v0.3.

Week 7 — Race day planner (v1)

Day 43

Pace band generator from goal pace & course style; fueling schedule baseline.

Day 44

Export PNG/PDF; brand with Runzi.

Day 45

UI: simple wizard and preview.

Day 46

Integrate with plan: add fueling reminders to key long runs.

Day 47

Tests: calculator correctness.

Day 48

Polish; examples for 5k/10k/HM/Marathon.

Day 49

Tag v0.4.

Week 8 — Polish, onboarding & empty states

Day 50

First‑run tutorial & sample plan (demo user seed).

Day 51

Loading skeletons & toasts; consistent empty states.

Day 52

Copy pass across app; tone/voice consistency.

Day 53

Light theming (dark mode toggle optional).

Day 54

QA sweep; fix papercuts.

Day 55

Add feedback widget (“Report plan issue”).

Day 56

Tag v0.5.

Week 9 — Pricing, flags, beta funnel

Day 57

Soft gate pricing screen; coupon support for early testers.

Day 58

Feature flags for risky features; kill‑switch.

Day 59

Invite system (codes or email allowlist); simple landing page.

Day 60

Event tracking for funnel; goal tracking in analytics.

Day 61

Test payments flow in sandbox (if enabled) or defer to later.

Day 62

Docs: “How Runzi adapts” explainer page.

Day 63

Tag v0.6.

Week 10 — Ops: Docker, CI, perf, accessibility

Day 64

Dockerize api/web/db; healthchecks; docker compose up.

Day 65

GitHub Actions: build, lint, unit, API, Playwright mocked UI.

Day 66

Add wait‑on and service readiness in CI; artifacts for reports.

Day 67

Perf: identify hotspots (planner & import); cache where safe.

Day 68

Accessibility deep pass (labels, color contrast, keyboard nav).

Day 69

Smoke test script; staging env config.

Day 70

Tag v0.7.

Week 11 — Notifications & hardening

Day 71

Weekly email digest template (plan summary + suggested tweaks).

Day 72

Replan notification (email only v1).

Day 73

Error monitoring & logs (Sentry or similar).

Day 74

Seed robust demo data; beta checklist.

Day 75

Bug bash; triage; fix criticals.

Day 76

Security review (deps, headers, rate limits).

Day 77

Tag v0.8.

Week 12 — Private beta launch

Day 78

Beta invite wave 1 (100–150 users); support channel.

Day 79

Monitor metrics; fix onboarding snags.

Day 80

Collect qualitative feedback; daily triage.

Day 81

Patch release v0.8.1; update docs/FAQ.

Day 82

Beta invite wave 2 (up to 300 total); iterate on pricing copy.

Day 83

Metrics review: retention, replan acceptance, session completion.

Day 84

Tag v0.9; write post‑beta plan (Now/Next/Later).

Recurring weekly cadence

Mon: planning review (cut scope ruthlessly).

Wed: mid‑week demo video (5–8 min).

Fri: release/tag + changelog; retro bullets.

Definition of done (per feature)

Code + tests + docs + analytics events + error states + accessibility.

If the plan changes, add a dated note under the affected week/day rather than deleting history, so we retain context and decisions.









Notes for DB:

How we updated the database (repeatable recipe)

We avoided Prisma’s shadow-DB (permission issues) and used a manual SQL migration applied inside the container.

Prereqs (one-time):

.env

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/runzi?schema=public"
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"  # optional


prisma/migration_lock.toml → provider = "postgresql".

Each time you change the Prisma schema:

Edit prisma/schema.prisma to the new desired state (models/fields).

Generate a diff SQL file OR create one manually:

If prisma migrate diff works in your env:

npx prisma migrate diff \
  --from-url "postgresql://postgres:postgres@localhost:5432/runzi?schema=public" \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/<YYYYMMDD_HHMMSS>_update.sql


If that fails (P1003 etc.), manually create prisma/migrations/<YYYYMMDD_HHMMSS>_update/migration.sql and paste the SQL changes (like we did today).

Apply the SQL inside the Postgres container:

docker exec -i runzi-db psql -U postgres -d runzi -f - < prisma/migrations/<YYYYMMDD_HHMMSS>_update/migration.sql


(Replace runzi-db with your container name if different.)

Regenerate Prisma Client:

npx prisma generate


Do NOT run prisma db pull unless you’re reverse-engineering the DB; you already have the schema file.

Start the app and test.

Notes:

This approach does not create a shadow DB, so it avoids the “permission denied to create database” error entirely.

If you must start fresh locally: npx prisma migrate reset (wipes dev DB), then apply your latest SQL as above and npx prisma generate.

