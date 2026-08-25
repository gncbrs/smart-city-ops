# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Smart City Operations Center — a web dashboard for coordinating field units and incidents in a
simulated smart city. Built incrementally against a case-study brief across three levels: Basic
Operations Center (done), Operational Awareness (done), Advanced Operations (done — see
"Current status" below).

Full session-by-session technical decision log (including rejected alternatives) is in
`docs/DEVELOPMENT_LOG.md` — a single consolidated file with a Table of Contents at the top linking
to each session (`Part 1`...`Part 12`, chronological). Check the last part before starting new
work — it usually ends with a "next step" note.

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
`SmartCityOps.Api.http` / running frontend), see `docs/DEVELOPMENT_LOG.md`, Part 11 §7.

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
  `OperationalTasks`, `OperationalZones`, `FieldUnitLocationHistories`, `FieldUnitRecommendations`,
  `RestrictedZones`, `OperationsReplay`, plus `Common`), each holding DTOs (records) and a service
  interface (`I*Service`). No implementations here.
- **`SmartCityOps.Infrastructure`** — EF Core (`ApplicationDbContext`, Npgsql), entity
  configurations (`Persistence/Configurations`), migrations (`Persistence/Migrations`), and the
  service implementations, mirrored per feature folder. `DependencyInjection.AddInfrastructure`
  wires DbContext + all `I*Service → *Service` registrations. Also owns the SignalR hub
  (`Hubs/OperationsHub.cs`) and the domain-event-to-SignalR handler
  (`Hubs/SignalROperationsNotificationHandler.cs`).
- **`SmartCityOps.Api`** — controllers (one per feature, thin — inject the service interface and
  return DTOs), `Program.cs`, `DependencyInjection.AddApiServices` (CORS policy
  `FrontendCorsPolicy` from `Cors:AllowedOrigins` config, Swagger), and
  `ExceptionHandling/DomainExceptionHandler` for centralized error → ProblemDetails mapping.

**Incident Generator** (`Src/incident-generator`) — a separate worker service/executable with
**no project reference** to the Api/Application/Domain projects, by design: it only talks to the
API over HTTP (`IncidentGenerator:ApiBaseUrl` in its `appsettings.json`), to mirror a real external
integration that wouldn't share code with the platform. It posts a random incident roughly every
`IncidentGenerator:IntervalSeconds` seconds, distributed across a weighted set of Ankara districts.

**Real-time updates (SignalR)** — mutating service methods raise domain events through the
in-memory domain event dispatcher (`docs/DEVELOPMENT_LOG.md`, Part 12 §3 — Phase 0.3) rather than calling
SignalR directly. The single subscriber, `SignalROperationsNotificationHandler`
(`Src/SmartCityOps.Infrastructure/Hubs/SignalROperationsNotificationHandler.cs`), calls
`_hubContext.Clients.All.SendAsync("OperationsUpdated", ...)` on `OperationsHub` (mapped at
`/hubs/operations`) after `SaveChangesAsync`. There is only this one coarse-grained event — no
per-entity payload. The frontend's `useSignalRConnection` hook
(`frontend/src/shared/hooks/useSignalR.ts`) listens for it and invalidates six React Query keys
(`incidents`, `field-units`, `operational-tasks`, `field-unit-location-histories`,
`field-unit-recommendations`, `restricted-zones`) rather than consuming pushed data. When adding a
new mutating endpoint or a new query key that should stay live, follow both halves of this
pattern.

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
`operational-tasks`, `operational-zones`, `operations-map`, `dashboard`, `menu`,
`field-unit-recommendations`, `restricted-zones`, `operations-replay`. Each feature's
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

State is React Query (server state) + component/hook-local state; no client-side state library is
used (`zustand` and `react-router-dom` were removed from `package.json` as unused dependencies, see
`docs/DEVELOPMENT_LOG.md` Part 12 §17).

## Current status & known open issues

Level 1 and Level 2 are complete; a dedicated frontend refactor (`docs/DEVELOPMENT_LOG.md` Part 10)
and backend refactor (Part 11) cleanup pass followed, with no behavior changes. Level 3
("Advanced Operations") is now also complete — see `docs/DEVELOPMENT_LOG.md`, Part 12 §19 for the full
phase-by-phase status table. All four case-study items are done: a composable task-assignment rule
pipeline with a DB-level concurrency guard and task reassignment (Phase 0–1), field-unit
recommendation scoring + ETA display (Phase 2), restricted-zone definition and enforcement (Phase
3), and replay of past operations via a snapshot/event-history API with a frontend scrubber (Phase
4). Phase 5, added beyond the case-study brief on user request, animates field units moving along
an origin→destination line over their ETA instead of teleporting to the incident on assignment.
Phase 5.1 reuses that same origin/ETA data to add an "arrived at scene" step to the Incident
Timeline. Phase 5.2 (`docs/DEVELOPMENT_LOG.md`, Part 12 §16) polished map selection UX: clicking an
already-selected marker now deselects it, clicking empty map space calls `clearSelection()`, and
`IncidentPanel`/`FieldUnitPanel` each got a `✕` close button — see "Selection UX" below. Phase 5.3
(`docs/DEVELOPMENT_LOG.md`, Part 12 §17) removed the unused `zustand`/`react-router-dom`
dependencies and confirmed the already-deleted `OperationalStatistics.tsx` has no remaining
references. Phase 5.4 (`docs/DEVELOPMENT_LOG.md`, Part 12 §18) resolved the bundle-size warning:
`OperationsMap` is now lazy-loaded via `React.lazy`/`Suspense` in `frontend/src/app/App.tsx`, and
`frontend/vite.config.ts` routes `maplibre-gl` into its own `maplibre-vendor` chunk via
`manualChunks`. The main initial JS bundle dropped from 1,314 kB to 365 kB (gzip 357 kB → 110 kB);
MapLibre itself now only downloads when the map mounts. Phase 5.5
(`docs/DEVELOPMENT_LOG.md`, Part 12 §19) cleaned up `frontend/src/shared/hooks/useSignalR.ts`:
removed a stray debug `console.log` left in the SignalR connection-start handler and translated
its Turkish inline comments to English, matching the rest of the codebase. No behavior change.
Phase 5.6 (`docs/DEVELOPMENT_LOG.md`, Part 12 §20) removed the unused `https` profile from
`Src/SmartCityOps.Api/Properties/launchSettings.json` — the project only ever runs over HTTP on
port 5080 (see Commands section above); the `http` and `IIS Express` profiles are unchanged.
Phase 5.7 (`docs/DEVELOPMENT_LOG.md`, Part 12 §21) removed a stray extra blank line in
`Src/SmartCityOps.Infrastructure/DependencyInjection.cs` and reworked the commented-out
`Resolve Incident`/`Assign Task`/`Complete Task` requests in `Src/SmartCityOps.Api/SmartCityOps.Api.http`
(plus a newly added `Reassign Task` request) into live, sequentially runnable REST Client requests
that chain `@name`-tagged GET/POST responses (e.g. `{{getIncidents.response.body.$[0].id}}`)
instead of requiring manually pasted GUIDs. Phase 5.8 (`docs/DEVELOPMENT_LOG.md`, Part 12 §22)
deduplicated the field-unit travel progress/interpolation math: `useFieldUnitMarkers.ts` and
`useDispatchedRouteLayers.ts` both used to repeat the same "is this task in flight" null-check
inline; `frontend/src/features/operational-tasks/lib/geoInterpolation.ts` now exports a shared
`isInFlightTask` type guard and a `getCurrentPosition` helper that both hooks consume instead of
duplicating the progress/clamp logic. No behavior change. Phase 5.9
(`docs/DEVELOPMENT_LOG.md`, Part 12 §23) consolidated `OperationsReplayService.GetReplayTimeRangeAsync`
(`Src/SmartCityOps.Infrastructure/OperationsReplay/OperationsReplayService.cs`) from 8 sequential
scalar `MinAsync`/`MaxAsync` round trips down to 3 — one aggregate query per table (`Incidents`,
`FieldUnitLocationHistories`, `OperationalTasks`) using `GroupBy(_ => 1)` to compute all of that
table's min/max columns in a single SQL statement. No behavior change.

Known open items, per `docs/DEVELOPMENT_LOG.md`, Part 12 §24:
- **Phase 5 unverified in-browser**: its migration (`20260824125110_AddOperationalTaskOriginAndEta`)
  was generated but not yet applied to a local DB, and the feature has never been run/observed in
  the browser. Before further work, run `docker compose up -d` → `dotnet ef database update` →
  start the API and frontend, and smoke-test it.
- **No backend test project exists yet** — still fully manual verification (see Commands section).
- Frontend selection state (`frontend/src/app/hooks/useSelection.ts`) can still go stale after a
  SignalR `OperationsUpdated` invalidation — one operator's screen can still show a record another
  operator just changed. The assign/complete/reassign flows sidestep this locally by calling
  `clearSelection()` on success, but there's no general fix; clicking a recommendation card also
  changes selection without calling `clearSelection()` (out of scope of the existing workaround).
  This is a separate, still-open issue from the manual toggle/deselect interactions fixed in Phase
  5.2 below.
- Restricted-zone creation takes lat/lng/radius as free-text/number inputs — no click-on-map center
  picker yet (consistent with every other coordinate input in the project). No restricted zones
  exist by default (no seed data), so the assignment rule always returns `Success()` until an
  operator creates one via `POST /api/restricted-zones`.
- Replay reconstructs `Reassigned` hand-off moments and `OutOfService` transitions approximately,
  since they aren't timestamped in the DB; a real event-sourcing/audit-log table would be needed to
  fix this precisely. Restricted zones and operational zones are treated as time-invariant in
  replay (always shown as their current state).

**Selection UX (Phase 5.2, resolved):** manual selection toggle/deselect now works fully.
Re-clicking an already-selected incident/field-unit marker deselects it
(`frontend/src/app/hooks/useSelection.ts`); clicking empty map space calls `clearSelection()` via a
`click` listener wired up in `useMapInstance.ts`/`OperationsMap.tsx`; and both `IncidentPanel` and
`FieldUnitPanel` have a `✕` close button. Getting this right required
`event.stopPropagation()` in the marker click handlers (`useIncidentMarkers.ts`,
`useFieldUnitMarkers.ts`) — MapLibre appends marker elements inside the same canvas container the
map's own `click` listener is bound to, so without stopping propagation every marker click also
fired the empty-space deselect handler, instantly undoing the selection. If you add another
marker-like clickable overlay to the map, apply the same `stopPropagation()` pattern or it will
silently fight with `onClearSelection`.

The next step was not yet specified by the user as of `docs/DEVELOPMENT_LOG.md` Part 12; candidates noted
there: the Phase 5 (and now Phase 5.4) smoke test above, adding a backend test project, or a
general fix for the stale selection-state risk.
