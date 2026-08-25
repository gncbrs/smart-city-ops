# Smart City Operations Center

A web-based Operations Center for coordinating field units and incidents in a simulated smart
city environment. Operators monitor incoming incidents on a live map, dispatch field units,
track task progress, and review historical activity — all from a single, fixed operational
dashboard.

This project is being built incrementally through three defined development levels (Basic
Operations Center → Operational Awareness → Advanced Operations), following a case-study brief
that intentionally treats incidents as arriving from an external system rather than being
detected by the platform itself.

## Status

- **Level 1 — Basic Operations Center:** ✅ Complete
- **Level 2 — Operational Awareness:** ✅ Complete
  - Active/completed task views, high-priority highlighting, task history, operational
    statistics, incident/field-unit filtering, incident timeline, operational zones map
    visualization, field unit movement history, and real-time updates via SignalR
- **Frontend refactor:** a dedicated cleanup pass (dead code removal, de-duplication, component
  decomposition) — no behavior changes, see `docs/DEVELOPMENT_LOG.md`, Part 10
- **Backend refactor:** an equivalent cleanup pass on the API/Application/Infrastructure layers —
  no behavior changes, see `docs/DEVELOPMENT_LOG.md`, Part 11
- **Level 3 — Advanced Operations:** ✅ Complete
  - A composable task-assignment rule pipeline with a DB-level concurrency guard and task
    reassignment, field-unit recommendation scoring with ETA display, restricted-zone definition
    and enforcement, and replay of past operations via a snapshot/event-history API with a
    frontend scrubber. Also includes a field-unit travel animation (origin → destination over ETA,
    added beyond the case-study brief) and a matching "arrived at scene" step on the Incident
    Timeline. See `docs/DEVELOPMENT_LOG.md`, Part 12 for the full phase-by-phase breakdown and
    known open items.

Full session-by-session technical decision log — including rejected alternatives and the reasoning
behind them — lives in [`docs/DEVELOPMENT_LOG.md`](docs/DEVELOPMENT_LOG.md), a single consolidated
file with a Table of Contents linking to each session (`Part 1` through `Part 12`, chronological).

## Architecture

**Backend** — ASP.NET Core 8 Web API, Clean Architecture, four layers:
Api → Infrastructure → Application → Domain

- **Domain** — plain entities (`Incident`, `FieldUnit`, `OperationalTask`,
  `FieldUnitLocationHistory`) and enums, no framework dependencies.
- **Application** — DTOs and service interfaces per feature.
- **Infrastructure** — EF Core (PostgreSQL) persistence, service implementations, entity
  configurations and migrations.
- **Api** — controller-based REST endpoints, Swagger, CORS, centralized exception handling.

**Incident Generator** — a standalone .NET worker service that simulates incidents arriving from
an external monitoring system. It has no project reference to the API — it only communicates over
HTTP — by design, to mirror a real external integration. Incidents are distributed across a
weighted set of Ankara districts (`AnkaraZones`), which the API also exposes (as a separate,
manually-synced copy) for the map's operational-zones layer.

**Frontend** — React + TypeScript + Vite, feature-folder structure, fixed (non-scrolling) layout:
a map with a filter/summary sidebar on top, a three-column bottom bar (field unit / incident /
active tasks) below it, and a full-screen Menu overlay for Completed Tasks, Statistics, and
detail-drill-down views (incident timeline, field unit movement history).

| Concern | Choice |
|---|---|
| Map rendering | MapLibre GL JS (OpenFreeMap `liberty` style) |
| Server state | TanStack React Query |
| HTTP client | axios |
| Styling | Plain CSS + BEM, one stylesheet per component |
| Database | PostgreSQL 16 (EF Core, code-first migrations) |

## Project structure
Src/
SmartCityOps.Domain/ entities, enums
SmartCityOps.Application/ DTOs, service interfaces (per feature folder)
SmartCityOps.Infrastructure/ EF Core DbContext, migrations, service implementations
SmartCityOps.Api/ controllers, Program.cs, DI wiring
incident-generator/ standalone worker service (simulated external incident source)
frontend/
src/
app/ top-level composition (App.tsx, providers, app-level hooks/components)
layouts/ the fixed operations-center layout shell
features/ one folder per domain concept (incidents, field-units,
operational-tasks, operational-zones, operations-map, dashboard, menu,
field-unit-location-histories, field-unit-recommendations, restricted-zones,
operations-replay)
shared/ reusable components/hooks/lib used across features
docs/
DEVELOPMENT_LOG*.md full technical decision history, session by session
docker-compose.yml local PostgreSQL for development

## Running locally
### Prerequisites
- .NET 8 SDK
- Node.js (for the frontend)
- Docker (for local PostgreSQL) — or any local Postgres 16 instance
### 1. Start PostgreSQL
```bash
docker compose up -d
This starts Postgres on localhost:5432 with database/user/password all set to smartcityops
(see docker-compose.yml). No local Docker access? Any Postgres 16 instance works as long as the
connection string in Src/SmartCityOps.Api/appsettings.Development.json matches.

2. Apply database migrations
cd Src
dotnet ef database update --project SmartCityOps.Infrastructure --startup-project SmartCityOps.Api
3. Run the API
dotnet run --project SmartCityOps.Api
The API listens on http://localhost:5080. Swagger UI is available at
http://localhost:5080/swagger in Development.

4. Run the incident generator (optional, but needed to see live data)
dotnet run --project incident-generator
Posts a randomly generated incident to the API roughly every 15 seconds (configurable via
IncidentGenerator:IntervalSeconds in Src/incident-generator/appsettings.json), distributed
across a weighted set of Ankara districts.

5. Run the frontend
cd frontend
npm install
npm run dev
Opens at http://localhost:5173, already configured (via CORS on the API side) to talk to the
backend at http://localhost:5080.

Documentation
The docs/ folder contains a full, chronological technical journal of this project — every
architectural decision, every alternative considered and rejected, and every bug found and fixed,
written up as development progressed. Start at docs/DEVELOPMENT_LOG.md and follow the numbered
sequence for the complete history.