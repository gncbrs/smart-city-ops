# Smart City Operations Center

A real-time web operations dashboard for coordinating field units and incidents in a simulated smart city.

## Table of Contents

1. [Status / Maturity](#status--maturity)
2. [Key Features](#key-features)
3. [Technical Architecture](#technical-architecture)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Development Commands](#development-commands)
8. [Architecture & Design Decisions](#architecture--design-decisions)
9. [API Overview](#api-overview)
10. [Real-time Features (SignalR)](#real-time-features-signalr)
11. [Testing & Quality](#testing--quality)
12. [Deployment](#deployment)
13. [Known Limitations & Future Work](#known-limitations--future-work)
14. [Documentation Index](#documentation-index)
15. [Contributing & Maintenance](#contributing--maintenance)
16. [License & Attribution](#license--attribution)

---

## Status / Maturity

**System Health: 7.5 / 10** (verified 2026-08-30, see `docs/SYSTEM_HEALTH_AUDIT.md`) — the architecture is genuinely sound (Clean Architecture layering enforced, DB-level concurrency guard correct, all documented single-source-of-truth claims verified against source), and the three critical bugs the audit found were fixed the same cycle, in Phase 5.35. What remains open is low-priority and mostly cosmetic (a handful of unmigrated color literals, some avoidable UI re-render churn) — nothing that blocks day-to-day operation.

All three development levels of the case-study brief are complete:

- ✅ **Level 1 — Basic Operations Center**
- ✅ **Level 2 — Operational Awareness**
- ✅ **Level 3 — Advanced Operations**

Development has continued past Level 3 with polish and hardening passes. The most recent, Phase 5.45 (`docs/DEVELOPMENT_LOG.md`, Part 12 §70), rolled out a semantic button color hierarchy (danger/success/warning/secondary variants) so operational actions like "Cancel Task" and "Resolve Incident" are visually distinguishable at a glance instead of sharing one primary-blue style.

The full session-by-session technical decision log — every architectural choice, every alternative considered and rejected, every bug found and fixed — lives in [`docs/DEVELOPMENT_LOG.md`](docs/DEVELOPMENT_LOG.md), organized into 12 chronological parts with a table of contents at the top.

---

## Key Features

#### Level 1: Basic Operations Center
- Live incident monitoring on an interactive map
- Field unit dispatch and real-time position tracking
- Incident status updates as they happen

#### Level 2: Operational Awareness
- Active and completed task views
- High-priority incident highlighting
- Operational statistics and dashboards (incident counts, resolution times, field unit workload)
- Task history and per-incident timeline
- Filterable incident/field-unit lists and operational zone visualization on the map

#### Level 3: Advanced Operations
- Customizable rules for automatically assigning field units to incidents, with built-in protection against double-dispatching the same unit
- A recommendation engine that suggests the best field unit for an incident based on real driving time, not just straight-line distance
- Restricted zones that can block or flag automatic assignment in sensitive or hazardous areas
- Historical operations replay — scrub back through past incidents, dispatches, and field-unit movements on a timeline
- Field units animate smoothly from their current position to an incident instead of teleporting, following the actual road route

---

## Technical Architecture

#### Backend — Clean Architecture, 4-Layer Design
- **Domain**: Plain entities and enums (zero framework dependencies)
- **Application**: DTOs and service interfaces (feature-driven organization — one folder per domain concept)
- **Infrastructure**: EF Core/PostgreSQL persistence, service implementations, the SignalR hub
- **API**: Thin REST controllers, Swagger documentation, centralized exception-to-HTTP-status handling

Dependency direction is strictly inward: API → Infrastructure → Application → Domain. This was independently verified in the 2026-08-30 codebase audit — no `EntityFrameworkCore` or `Infrastructure` references exist anywhere in the Domain or Application project trees, so business rules can, in principle, be reasoned about (and eventually tested) without touching the database or HTTP layer.

#### Frontend — Component-Driven React + TypeScript
- **Feature folders**: one folder per domain concept (`incidents`, `field-units`, `operational-tasks`, `restricted-zones`, `operations-replay`, and more), each owning its own API client, hooks, components, and styles
- **Shared utilities**: reusable components, hooks, MapLibre GL integration, and TanStack React Query for server state
- **Fixed, non-scrolling layout**: a map with a filter/summary sidebar, a three-column bottom bar (field units / incidents / active tasks), and a full-screen menu overlay for statistics and drill-down views

#### Database
- PostgreSQL 16 with EF Core code-first migrations
- A partial unique index enforces "one active task per field unit" at the database level, closing a real dispatch race condition (see [Concurrency Safety](#architecture--design-decisions) below) — verified correct by the 2026-08-30 audit
- Every mutation raises a domain event that is broadcast over SignalR, keeping every connected client's view in sync in real time

---

## Technology Stack

| Concern | Choice | Rationale |
|---|---|---|
| Backend Framework | ASP.NET Core 8 | Modern, type-safe, strong async/concurrency support |
| Frontend UI | React 19 + TypeScript | Component-driven, strong type safety |
| Map Rendering | MapLibre GL JS | Open-source, performant vector tile rendering |
| Server State | TanStack React Query | Caching, cross-component synchronization, background refetch |
| Database | PostgreSQL 16 | Robust, mature, open-source relational database |
| ORM | Entity Framework Core | Type-safe LINQ queries, code-first migrations |
| Real-time | SignalR | WebSocket-based server push, built-in ASP.NET Core integration |
| Routing (driving directions) | OSRM (Open Source Routing Machine) | Real road-network routes and ETAs instead of straight-line estimates |
| HTTP Client | axios (frontend) | Simple, well-understood request/response handling |
| Styling | BEM + CSS custom properties | Maintainable, zero-runtime CSS-in-JS overhead |
| Build Tools | Vite (frontend), `dotnet` CLI (backend) | Fast development loop |

---

## Project Structure

```
smart-city-ops/
├── Src/
│   ├── SmartCityOps.Domain/           # Entities, enums (zero framework deps)
│   ├── SmartCityOps.Application/      # DTOs, service interfaces (per-feature folders)
│   ├── SmartCityOps.Infrastructure/   # EF Core, migrations, service impls, SignalR hub
│   ├── SmartCityOps.Api/              # Controllers, Swagger, DI wiring
│   └── incident-generator/            # External incident simulator (HTTP-only communication)
├── frontend/
│   ├── src/
│   │   ├── app/                       # Top-level App.tsx, providers, cross-feature hooks
│   │   ├── layouts/                   # Fixed operations-center layout shell
│   │   ├── features/                  # One folder per domain concept
│   │   └── shared/                    # Reusable components, hooks, utilities
│   └── public/
├── docs/
│   ├── DEVELOPMENT_LOG.md             # Full chronological technical journal (Part 1–12)
│   ├── SYSTEM_HEALTH_AUDIT.md         # Codebase audit report (2026-08-30)
│   ├── SYSTEM_PRE_AUTH_AUDIT_REPORT.md# Pre-auth architectural baseline (2026-08-31)
│   └── To-Do-List.txt                 # Open items, de-duplicated and priority-grouped
├── CLAUDE.md                          # Guidance used by Claude Code for this project
└── docker-compose.yml                 # Local PostgreSQL 16
```

---

## Getting Started

#### Prerequisites
- .NET 8 SDK (or higher)
- Node.js 18+ (for the frontend)
- Docker (for local PostgreSQL) — or any Postgres 16 instance
- Git

#### Installation & Running Locally

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd smart-city-ops
   ```

2. **Start the database**
   ```bash
   docker compose up -d
   ```
   Creates Postgres 16 on `localhost:5432` with database, user, and password all set to `smartcityops`. No local Docker? Any Postgres 16 instance works, as long as the connection string in `Src/SmartCityOps.Api/appsettings.Development.json` matches.

3. **Apply migrations**
   ```bash
   cd Src
   dotnet ef database update \
     --project SmartCityOps.Infrastructure \
     --startup-project SmartCityOps.Api
   ```

4. **Start the backend API** (from `Src/`)
   ```bash
   dotnet run --project SmartCityOps.Api
   ```
   Listens on `http://localhost:5080`. Swagger UI is available at `http://localhost:5080/swagger` in Development.

5. **Start the incident generator** (optional, but recommended — this is what makes incidents appear)

   In a new terminal, from `Src/`:
   ```bash
   dotnet run --project incident-generator
   ```
   Posts a simulated incident roughly every 15 seconds to the API. Configurable via `IncidentGenerator:IntervalSeconds` in `Src/incident-generator/appsettings.json`.

6. **Start the frontend**

   In a new terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Runs at `http://localhost:5173`, already configured (via CORS on the API side) to talk to the backend at `http://localhost:5080`.

#### Verification
- Open `http://localhost:5173` in a browser.
- The map should appear centered on Ankara, with operational zone overlays visible.
- With the incident generator running, new incidents should appear on the map roughly every 15 seconds.

---

## Development Commands

#### Backend (from `Src/`)

| Task | Command |
|---|---|
| Build everything | `dotnet build` |
| Run API | `dotnet run --project SmartCityOps.Api` |
| Run incident generator | `dotnet run --project incident-generator` |
| Apply migrations | `dotnet ef database update --project SmartCityOps.Infrastructure --startup-project SmartCityOps.Api` |
| Create new migration | `dotnet ef migrations add <Name> --project SmartCityOps.Infrastructure --startup-project SmartCityOps.Api` |

#### Frontend (from `frontend/`)

| Task | Command |
|---|---|
| Install dependencies | `npm install` |
| Dev server (hot reload) | `npm run dev` |
| Build for production | `npm run build` |
| Lint check | `npm run lint` |
| Preview production build | `npm run preview` |

---

## Architecture & Design Decisions

#### Clean Architecture Layering
The backend strictly enforces dependency inversion: the Domain layer has zero framework references, so entities and business rules are conceptually independent of EF Core or HTTP concerns. This was independently verified in the 2026-08-30 audit by inspecting the `.csproj` reference graph directly, not just by convention.

#### Concurrency Safety
Field-unit task assignment is protected by a database-level partial unique index on `OperationalTask.FieldUnitId`, filtered to rows with `Status = 'Assigned'`. This closes the classic "both requests read the unit as Available, both try to dispatch it" race condition: the entire assignment (field-unit mutation plus task insert) happens inside one transaction, so if two dispatch requests land on the same unit at once, the database rejects the second with a unique-constraint violation, which the API translates into a clean `409 Conflict`. Verified end-to-end by the audit, not just by reading the code.

#### Real-time Synchronization
SignalR broadcasts a single coarse-grained `OperationsUpdated` notification to all connected clients whenever a mutation happens anywhere in the system. The frontend's TanStack React Query integration listens for this event and invalidates the affected cache keys, triggering a refetch — this keeps every panel (map, incident list, task list, statistics) in sync without polling. It's a deliberate trade-off: simple and correct at the current traffic scale, at the cost of every client refetching several query keys on every mutation anywhere in the app (see `docs/SYSTEM_PRE_AUTH_AUDIT_REPORT.md`, N-3).

#### Fixed, Non-Scrolling Layout
The dashboard intentionally never scrolls — a map, a filter sidebar, and a three-column panel bar are always visible at once. This mirrors physical Network Operations Center design, where an operator should never have to scroll to see a mission-critical piece of information.

#### Priority Scoring
Incident priority is computed once, server-side, and exposed on every incident record — combining the incident's base severity with an age bonus (up to +30 points for incidents that have been open longer), clamped to a 0–100 scale. Both the live view and the historical replay view compute this the same way, so there is a single source of truth instead of two implementations that could drift apart.

#### Ankara Zone Data
The 12 Ankara district definitions used both for the map's operational-zone overlay and for weighting where the incident generator drops simulated incidents live in one place, `SmartCityOps.Domain/Common/AnkaraOperationalZones.cs`. The incident generator references the Domain project directly to read this list — which doesn't compromise its architectural independence from the rest of the backend, since Domain has zero framework dependencies of its own.

---

## API Overview

#### Main Endpoints

- `GET /api/incidents` — List all incidents (active + resolved)
- `GET /api/incidents/{id}` — Get a single incident
- `POST /api/incidents` — Create an incident (typically via the incident generator)
- `POST /api/incidents/{id}/resolve` — Mark an incident as resolved
- `GET /api/incidents/{id}/timeline` — Incident event history

- `GET /api/field-units` — List all field units and their status
- `GET /api/field-units/{id}` — Get a single field unit
- `PATCH /api/field-units/{id}/status` — Update field unit status (`Available` ↔ `OutOfService`)
- `GET /api/field-units/{id}/movement-history` — Field unit movement trail

- `GET /api/operational-tasks` — List all tasks
- `GET /api/operational-tasks/{id}` — Get a single task
- `POST /api/operational-tasks` — Create and assign a task to a field unit
- `POST /api/operational-tasks/{id}/reassign` — Reassign a task to another unit
- `POST /api/operational-tasks/{id}/complete` — Mark a task complete
- `POST /api/operational-tasks/{id}/cancel` — Cancel an in-progress task

- `GET /api/operations/statistics` — Dashboard statistics (incident counts, average resolution time, field-unit workload)
- `GET /api/operational-zones` — All operational zones (GeoJSON)
- `GET /api/restricted-zones` — All restricted zones
- `GET /api/restricted-zones/{id}` — Get a single restricted zone
- `POST /api/restricted-zones` — Define a restricted zone
- `DELETE /api/restricted-zones/{id}` — Remove a restricted zone
- `GET /api/incidents/{id}/recommendations` — Ranked field-unit recommendations for an incident

- `GET /api/operations/replay` — Historical state snapshot at a given timestamp
- `GET /api/operations/replay/range` — Available replay time span

Full Swagger documentation is available at `http://localhost:5080/swagger` when running in Development.

---

## Real-time Features (SignalR)

The backend's `OperationsHub` broadcasts a single `OperationsUpdated` notification whenever a mutating action completes (new incident, task assignment, task completion, cancellation, field-unit status change, restricted zone created, and so on) — this is intentionally coarse-grained rather than per-entity. The frontend's `useSignalR` hook listens for that event and invalidates ten React Query cache keys in response: `incidents`, `field-units`, `operational-tasks`, `field-unit-location-histories`, `field-unit-recommendations`, `restricted-zones`, `operational-statistics`, `incident-timeline`, `field-unit-movement-history`, and `replay-time-range`.

In practice, this means every panel on the dashboard — the map, the incident list, the task list, and the statistics view — stays current automatically, without the frontend ever polling the API or the operator needing to refresh the page.

---

## Testing & Quality

#### Code Quality Verification
- **Frontend**: `npm run lint` (oxlint) and `npm run build` (TypeScript compilation via `tsc -b`) are the available correctness checks. No frontend test runner (`vitest`/`jest`) is configured.
- **Backend**: `dotnet build` compiles cleanly with zero warnings across all five projects. No dedicated backend test project exists yet — verification has been manual, via Swagger, the `SmartCityOps.Api.http` request file, and the running frontend.

#### Codebase Audit (2026-08-30)
A full read-only audit of `frontend/src` and `Src/` (`docs/SYSTEM_HEALTH_AUDIT.md`) verified:
- ✅ Clean Architecture layering is correctly enforced (no EF Core/Infrastructure references leak into Domain or Application)
- ✅ The database-level concurrency guard for task assignment is correctly implemented
- ✅ Every documented single-source-of-truth claim (priority scoring, incident timeline, field-unit movement history, status lifecycle) was verified true against the actual code
- ⚠️ 3 correctness bugs were found and fixed the same cycle, in Phase 5.35: a live-vs-replay divergence in "ready to resolve" logic, an unmapped exception that surfaced a 500 instead of a 400, and an incident-generator exception handler narrow enough to silently kill the background worker on a transient error
- ⚠️ A handful of low-priority items remain open: some unmigrated CSS color literals, and avoidable marker/layer re-render churn on the map — see `docs/SYSTEM_HEALTH_AUDIT.md`'s "Recommended Action Items"

**System health rating: 7.5 / 10** — strong architecture, with the identified gaps being cosmetic or low-urgency rather than structural. Full findings in [`docs/SYSTEM_HEALTH_AUDIT.md`](docs/SYSTEM_HEALTH_AUDIT.md).

A follow-up architectural baseline (`docs/SYSTEM_PRE_AUTH_AUDIT_REPORT.md`, 2026-08-31) was produced ahead of a planned authentication project: it confirms the same structural strengths and flags that the backend currently has no authentication scheme registered at all, and the frontend has no token-carrying infrastructure — expected, since auth has been explicitly out of scope until now, but a hard prerequisite before any `[Authorize]` attribute can be added.

---

## Deployment

This project has not yet been deployed to production infrastructure. The recommended path, given the current architecture:

1. **Backend (Docker)**
   - A multi-stage Dockerfile (SDK layer for build, ASP.NET runtime layer for execution) would publish from `SmartCityOps.Api`.
   - **Known blocker**: `OsrmRoutingService` currently shells out to the `curl` binary as a subprocess (a documented workaround for a Windows-specific TLS handshake issue, see `docs/DEVELOPMENT_LOG.md` Part 12 §62). A minimal container base image may not ship `curl` — this needs to be resolved or explicitly documented as a required base-image dependency before containerizing.

2. **Frontend (Docker)**
   - A multi-stage build (Node layer for `npm run build`, a static file server such as nginx for the resulting `dist/` output) is the standard approach for a Vite SPA.

3. **Database (managed PostgreSQL)**
   - Any managed PostgreSQL 16 service (e.g. a cloud provider's managed Postgres offering) would work as-is; migrations should run as an explicit pre-deployment step (`dotnet ef database update`), not automatically at application startup.

4. **Authentication**
   - The backend currently has no authentication or authorization configured at all — every endpoint is open. Per `docs/SYSTEM_PRE_AUTH_AUDIT_REPORT.md`, this is a deliberate, tracked gap (auth was out of scope until now) rather than an oversight, but it must be closed before any non-local deployment.

#### Environment Configuration
- Backend: `Src/SmartCityOps.Api/appsettings.{Environment}.json` holds the Postgres connection string and CORS-allowed origins (`Cors:AllowedOrigins`); `Src/incident-generator/appsettings.json` holds `IncidentGenerator:ApiBaseUrl`/`IntervalSeconds`.
- Frontend: `VITE_API_BASE_URL` (Vite environment variable, baked in at build time) controls which backend the frontend talks to — it defaults to `http://localhost:5080/api`.
- HTTPS is currently disabled on the backend (`app.UseHttpsRedirection()` is commented out) — acceptable for local development only; this must be re-enabled before any deployment that isn't purely local (`docs/SYSTEM_PRE_AUTH_AUDIT_REPORT.md`, M-6).

---

## Known Limitations & Future Work

#### Known Limitations
- **No backend test project** — correctness has relied on manual verification (Swagger, the `.http` request file, and the running frontend). This is the single standing item across both audit reports.
- **No frontend test runner** — no `vitest`/`jest` configured; `npm run lint` and `npm run build` are the available automated checks.
- **No authentication or authorization** — every endpoint is open today. `docs/SYSTEM_PRE_AUTH_AUDIT_REPORT.md` lays out exactly what's needed before this can change.
- **OSRM routing depends on the public OSRM API** and, on Windows, shells out to the `curl` binary as a subprocess to work around a TLS handshake issue — not guaranteed uptime/SLA, and a portability consideration for containerized deployment.
- **Incident generator** simulates external incidents at a fixed interval; a production system would replace this with a real event feed.
- **Restricted zones** are simple circular/point-radius definitions today, not arbitrary polygons.
- **No load testing has been performed** — behavior at high incident/field-unit volumes is untested.

#### Planned Enhancements (beyond Level 3)
- A backend test project, prioritizing the services most likely to regress silently (incident readiness logic, replay reconstruction)
- JWT-based authentication and authorization, per the plan in `docs/SYSTEM_PRE_AUTH_AUDIT_REPORT.md`
- Replacing the OSRM `curl` subprocess with a direct `HttpClient` call for better container portability
- A top-level frontend loading/error boundary so an unreachable backend or unauthenticated state is visibly distinct from "no data yet"

---

## Documentation Index

#### Documentation Files
- **`docs/DEVELOPMENT_LOG.md`** — Full chronological technical journal (Parts 1–12), covering every architectural decision, rejected alternative, and bug found. Start here for the complete project history.
- **`CLAUDE.md`** — Internal Claude Code guidance (commands, architecture overview, current status). Used by Claude Code for context on this project.
- **`docs/SYSTEM_HEALTH_AUDIT.md`** — Full codebase audit report (2026-08-30). Verifies Clean Architecture claims, documents 3 fixed critical bugs, and lists remaining low-priority action items.
- **`docs/SYSTEM_PRE_AUTH_AUDIT_REPORT.md`** — Architectural baseline and readiness checklist ahead of a planned authentication project (2026-08-31).
- **This README** — you are here.

#### Running Tests / Verification
- Swagger UI: `http://localhost:5080/swagger` (Development mode only)
- HTTP client file: `Src/SmartCityOps.Api.http` (VS Code REST Client extension)
- Frontend linting: `npm run lint` from `frontend/`
- TypeScript check: `npm run build` (includes `tsc -b`)

---

## Contributing & Maintenance

#### Adding a New Feature
1. **Identify the layer**: does this touch domain logic (Domain/Application), persistence (Infrastructure), or just HTTP (Api)?
2. **Create feature folders**: add a new feature folder to `Src/SmartCityOps.Application/{FeatureName}` with a service interface (`I{FeatureName}Service`).
3. **Implement in Infrastructure**: add `Src/SmartCityOps.Infrastructure/{FeatureName}/{FeatureName}Service.cs` implementing the interface.
4. **Wire in DI**: register the service in `SmartCityOps.Infrastructure/DependencyInjection.cs`.
5. **Add a controller**: create `Src/SmartCityOps.Api/Controllers/{FeatureName}Controller.cs` with thin HTTP endpoints.
6. **Frontend**: create `frontend/src/features/{featureName}` with an `api/` client, `hooks/`, `components/`, and `styles/`.
7. **Update documentation**: add an entry to `docs/DEVELOPMENT_LOG.md`.

#### Making Changes
- Run `dotnet build` and `npm run build` before committing.
- Apply pending migrations before running the API: `dotnet ef database update ...`.
- Frontend changes should pass `npm run lint` cleanly.

#### Reporting Issues
- Check `docs/DEVELOPMENT_LOG.md`, Part 12, to see whether an issue was already found and fixed.
- For design questions, check the [Architecture & Design Decisions](#architecture--design-decisions) section above first.

---

## License & Attribution

#### License
Not yet specified.

#### Credits
- Map data © OpenStreetMap contributors
- Map tiles via OpenFreeMap (`liberty` style)
- Routing powered by OSRM (Open Source Routing Machine)
- Built with React, ASP.NET Core, MapLibre GL JS, and TanStack React Query
