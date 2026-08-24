# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Smart City Operations Center — a web dashboard for coordinating field units and incidents in a
simulated smart city. Built incrementally against a case-study brief across three levels: Basic
Operations Center (done), Operational Awareness (done), Advanced Operations (in progress — see
"Current status" below).

Full session-by-session technical decision log (including rejected alternatives) is in
`docs/DEVELOPMENT_LOG.md` and its numbered continuations `DEVELOPMENT_LOG2.md`...`DEVELOPMENT_LOG12.md`
(read in order). Check the latest one before starting new work — it usually ends with a "next step"
note.

## Commands

### Backend (`Src/`)
```bash
# from Src/
dotnet build                                                        # build everything
dotnet run --project SmartCityOps.Api                                # API on http://localhost:5080 (Swagger UI at /swagger in Development)
dotnet run --project incident-generator                              # simulated external incident feed, posts to the API every ~15s
dotnet ef database update --project SmartCityOps.Infrastructure --startup-project SmartCityOps.Api   # apply migrations
dotnet ef migrations add <Name> --project SmartCityOps.Infrastructure --startup-project SmartCityOps.Api   # add a migration
```
There are no backend test projects in the solution — verification has so far been manual (Swagger /
`SmartCityOps.Api.http` / running frontend), see `docs/DEVELOPMENT_LOG11.md` §7.

Local Postgres: `docker compose up -d` (from repo root) starts Postgres 16 on `localhost:5432`,
db/user/password all `smartcityops`. Connection string lives in
`Src/SmartCityOps.Api/appsettings.Development.json`.

### Frontend (`frontend/`)
```bash
npm install
npm run dev       # http://localhost:5173, CORS-permitted against the API
npm run build      # tsc -b && vite build
npm run lint       # oxlint
npm run preview
```
No frontend test runner is configured either — `npm run lint` and `npm run build` (which runs
`tsc -b`) are the available correctness checks.

## Architecture

### Backend — Clean Architecture, 4 layers, dependencies point inward
`Api → Infrastructure → Application → Domain`

- **`SmartCityOps.Domain`** — plain entities (`Incident`, `FieldUnit`, `OperationalTask`,
  `FieldUnitLocationHistory`) and enums. No framework dependencies.
- **`SmartCityOps.Application`** — one folder per feature (`Incidents`, `FieldUnits`,
  `OperationalTasks`, `OperationalZones`, `FieldUnitLocationHistories`), each holding DTOs
  (records) and a service interface (`I*Service`). No implementations here.
- **`SmartCityOps.Infrastructure`** — EF Core (`ApplicationDbContext`, Npgsql), entity
  configurations (`Persistence/Configurations`), migrations (`Persistence/Migrations`), and the
  service implementations, mirrored per feature folder. `DependencyInjection.AddInfrastructure`
  wires DbContext + all `I*Service → *Service` registrations. Also owns the SignalR hub
  (`Hubs/OperationsHub.cs`).
- **`SmartCityOps.Api`** — controllers (one per feature, thin — inject the service interface and
  return DTOs), `Program.cs`, `DependencyInjection.AddApiServices` (CORS policy
  `FrontendCorsPolicy` from `Cors:AllowedOrigins` config, Swagger), and
  `ExceptionHandling/DomainExceptionHandler` for centralized error → ProblemDetails mapping.

**Incident Generator** (`Src/incident-generator`) — a separate worker service/executable with
**no project reference** to the Api/Application/Domain projects, by design: it only talks to the
API over HTTP (`IncidentGenerator:ApiBaseUrl` in its `appsettings.json`), to mirror a real external
integration that wouldn't share code with the platform. It posts a random incident roughly every
`IncidentGenerator:IntervalSeconds` seconds, distributed across a weighted set of Ankara districts.

**Real-time updates (SignalR)** — every mutating service method (`IncidentService`,
`OperationalTaskService`, etc.) calls `_hubContext.Clients.All.SendAsync("OperationsUpdated", ...)`
on `OperationsHub` (mapped at `/hubs/operations`) after `SaveChangesAsync`. There is only this one
coarse-grained event — no per-entity payload. The frontend's `useSignalRConnection` hook
(`frontend/src/shared/hooks/useSignalR.ts`) listens for it and invalidates all four React Query
keys (`incidents`, `field-units`, `operational-tasks`, `field-unit-location-histories`) rather than
consuming pushed data. When adding a new mutating endpoint or a new query key that should stay
live, follow both halves of this pattern.

**Ankara zone data is manually duplicated** between
`Src/SmartCityOps.Infrastructure/OperationalZones/OperationalZoneService.cs` (serves the map's
operational-zones layer via the API) and `Src/incident-generator/Worker.cs` (weights where
simulated incidents land). There is no shared source — if you change district boundaries/weights
in one, check whether the other needs the same change.

### Frontend — React + TypeScript + Vite, feature-folder structure
```
src/app/       top-level composition: App.tsx, providers.tsx, cross-feature hooks (useOperationsData, useSelection)
src/layouts/   OperationsCenterLayout — the fixed (non-scrolling) shell
src/features/  one folder per domain concept, each with its own api/ hooks/ components/ styles/ types.ts
src/shared/    cross-feature components, hooks, and lib (httpClient, signalRConnection, formatters)
```
Feature folders present: `incidents`, `field-units`, `field-unit-location-histories`,
`operational-tasks`, `operational-zones`, `operations-map`, `dashboard`, `menu`. Each feature's
`api/*.ts` wraps `shared/lib/httpClient.ts` (axios instance, base URL from
`VITE_API_BASE_URL` env var, default `http://localhost:5080/api`); each feature's `hooks/*.ts`
wraps that api module in a React Query hook.

Layout is fixed, not a scrolling page: a map + filter/summary sidebar on top, a three-column
bottom bar (field units / incidents / active tasks), and a full-screen `Menu` overlay
(`features/menu`) for Completed Tasks, Statistics, and drill-down detail views (incident timeline,
field unit movement history) routed via `MenuSectionRouter`.

Styling is plain CSS with BEM naming, one stylesheet per component, colocated under each feature's
`styles/` folder — no CSS-in-JS, no Tailwind.

Map: MapLibre GL JS against the OpenFreeMap `liberty` style, encapsulated in
`features/operations-map` (`useMapInstance` owns the map lifecycle; `useIncidentMarkers` /
`useFieldUnitMarkers` / `useOperationalZoneLayers` layer data onto it; `applyMapFilters` handles
the filter-panel logic).

`zustand` is a declared dependency but not currently used anywhere in `src/` — state is otherwise
React Query (server state) + component/hook-local state.

## Current status & known open issues

Level 1 and Level 2 are complete; a dedicated frontend refactor (`DEVELOPMENT_LOG10.md`) and
backend refactor (`DEVELOPMENT_LOG11.md`) cleanup pass followed, with no behavior changes. Level 3
("Advanced Operations") is in progress — see `docs/DEVELOPMENT_LOG12.md` for the work done so far:
a composable task-assignment rule pipeline, typed domain exceptions + a DB-level concurrency guard
for field-unit assignment, an in-memory domain event dispatcher decoupling services from SignalR,
and task reassignment (backend + frontend). Still open from Level 3's case-study scope: field unit
suggestion, ETA, restricted-zone definition, replay of past operations.

One of the two design risks flagged after the refactor passes has been resolved; the other is
still open:
- ~~`OperationalTaskService.CreateAsync` check-then-act race~~ — closed in `DEVELOPMENT_LOG12.md`
  Phase 0.2 via a partial unique index (`FieldUnitId` unique where `Status = 'Assigned'`) plus a
  `ResourceConflictException` thrown on the resulting `DbUpdateException`. The same guard covers
  reassignment (Phase 1.1).
- Frontend selection state (`frontend/src/app/hooks/useSelection.ts`) can still go stale after a
  SignalR `OperationsUpdated` invalidation — one operator's screen can still show a record another
  operator just changed. The assign/complete/reassign flows sidestep this locally by calling
  `clearSelection()` on success, but there's no general fix.

## Stray directory

`backend/` at the repo root is a leftover, empty (no source files, just `bin`/`obj` build output)
pre-restructure directory from before the project was moved under `Src/`. It is untracked and not
part of the current project — ignore it.
