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
  `FieldUnitLocationHistory`, `FieldUnitStatusHistory`) and enums. No framework dependencies.
- **`SmartCityOps.Application`** — one folder per feature (`Incidents`, `FieldUnits`,
  `OperationalTasks`, `OperationalZones`, `FieldUnitLocationHistories`, `FieldUnitRecommendations`,
  `RestrictedZones`, `OperationsReplay`, `Dashboard`, plus `Common`), each holding DTOs (records) and
  a service interface (`I*Service`). No implementations here. `Common/Routing/` holds
  `IRoutingService` (`GetDrivingRouteAsync` and, since Phase 5.32, `GetDrivingTableAsync` for
  batch driving durations/distances) and its result records `RouteGeometryResult`
  (`GeoJsonCoordinates`, `DurationSeconds`, `DistanceMeters`) and `TravelMatrixResult`
  (`DurationsSeconds`, `DistancesMeters`) — see `docs/DEVELOPMENT_LOG.md` Part 12 §57.
  `Dashboard/` holds `IOperationalStatisticsService`
  (`GetStatisticsAsync`, exposed via `GET /api/operations/statistics`) and its DTOs
  (`OperationalStatisticsDto`, `IncidentTypeCountDto`, `FieldUnitWorkloadDto`) — see
  `docs/DEVELOPMENT_LOG.md` Part 12 §52. `IIncidentService` also exposes `GetTimelineAsync`
  (backing `GET /api/incidents/{id}/timeline`) and `IFieldUnitService` exposes
  `GetMovementHistoryAsync` (backing `GET /api/field-units/{id}/movement-history`) — see
  `docs/DEVELOPMENT_LOG.md` Part 12 §53. `IFieldUnitService` also exposes
  `UpdateStatusAsync` (backing `PATCH /api/field-units/{id}/status`), which persists each
  `Available ↔ OutOfService` transition as a `FieldUnitStatusHistory` audit row — see
  `docs/DEVELOPMENT_LOG.md` Part 12 §56. `Incidents/` also holds the static
  `IncidentPriorityScoreCalculator` (base score by `IncidentPriority` + an age bonus of up to +30
  for minutes since `ReportedAt`, clamped 0–100), whose result is exposed on `IncidentDto` as
  `PriorityScore` — see `docs/DEVELOPMENT_LOG.md` Part 12 §54. `IncidentDto` also exposes
  `bool IsReadyToResolve` (`true` when the incident is not `Resolved` and has no operational tasks
  with `OperationalTaskStatus.Assigned` — `Completed`, `Reassigned`, and `Cancelled` are all
  terminal and never block readiness), computed by `IncidentService.GetAllAsync`/`CreateAsync`/
  `ResolveAsync` and, for historical snapshots, by `OperationsReplayService.IsTaskActiveAt` against
  the replay timestamp — see `docs/DEVELOPMENT_LOG.md` Part 12 §55. Live and replay share this exact
  `Assigned`-only definition since Phase 5.35 (§60), which fixed a divergence where the live path
  had counted `Reassigned`/`Cancelled` tasks as active forever. `IOperationalTaskService` also
  exposes `CancelAsync` (backing `POST /api/operational-tasks/{id}/cancel`), which transitions an
  `Assigned` task to `OperationalTaskStatus.Cancelled`, sets `OperationalTask.CancelledAt`, frees the
  field unit back to `Available`, and reverts the incident to `Open` if no other active task remains
  for it — see `docs/DEVELOPMENT_LOG.md` Part 12 §58.
- **`SmartCityOps.Infrastructure`** — EF Core (`ApplicationDbContext`, Npgsql), entity
  configurations (`Persistence/Configurations`), migrations (`Persistence/Migrations`), and the
  service implementations, mirrored per feature folder. `DependencyInjection.AddInfrastructure`
  wires DbContext + all `I*Service → *Service` registrations. Also owns the SignalR hub
  (`Hubs/OperationsHub.cs`) and the domain-event-to-SignalR handler
  (`Hubs/SignalROperationsNotificationHandler.cs`). `Common/Routing/OsrmRoutingService.cs`
  implements `IRoutingService` as a Typed `HttpClient` against the public OSRM driving-routing API
  (3s timeout, culture-invariant coordinate formatting, Haversine straight-line fallback at 40 km/h
  if OSRM is unreachable/errors); task creation (`OperationalTaskService.AssignFieldUnitAsync`)
  calls it to fetch a real driving route and persists the GeoJSON polyline on
  `OperationalTask.RouteGeometry` — see `docs/DEVELOPMENT_LOG.md` Part 12 §51. On Windows,
  `RunCurlAsync` additionally passes curl's Schannel-only `--ssl-no-revoke` flag (gated behind
  `OperatingSystem.IsWindows()`) to avoid `CRYPT_E_NO_REVOCATION_CHECK` handshake failures on
  corporate networks where the CRL/OCSP endpoint is unreachable; `OperationalTaskService` also
  floors `EstimatedEtaSeconds` at a `MinimumEtaSeconds = 5` constant so a same-location or
  near-zero-duration dispatch still animates instead of teleporting — see `docs/DEVELOPMENT_LOG.md`
  Part 12 §62.
  `OsrmRoutingService.GetDrivingTableAsync` additionally queries OSRM's `/table/v1/driving` batch
  endpoint (same curl/timeout/fallback behavior as above); `FieldUnitRecommendationService`
  (`FieldUnitRecommendations/`) calls it once per incident with all candidate field units as
  origins to score recommendations by real driving time/distance instead of Haversine, falling
  back to `IEtaEstimator`/`GeoCalculator` per unit when OSRM returns `null` — see
  `docs/DEVELOPMENT_LOG.md` Part 12 §57. Since Phase 5.34, those origins are each unit's *effective*
  real-time coordinate rather than its stored `Latitude/Longitude`: `GeoCalculator.GetInFlightPosition`
  (`Common/GeoCalculator.cs`) interpolates a dispatched unit's position along its active task's
  origin→destination line by elapsed time vs. `EstimatedEtaSeconds`, so a unit still travelling to a
  first assignment is scored from where it actually is, not from the destination coordinates
  `AssignFieldUnitAsync` already wrote onto it — see `docs/DEVELOPMENT_LOG.md` Part 12 §59.
- **`SmartCityOps.Api`** — controllers (one per feature, thin — inject the service interface and
  return DTOs), `Program.cs`, `DependencyInjection.AddApiServices` (CORS policy
  `FrontendCorsPolicy` from `Cors:AllowedOrigins` config, Swagger), and
  `ExceptionHandling/DomainExceptionHandler` for centralized error → ProblemDetails mapping
  (`KeyNotFoundException`→404, `ValidationException`→400, `ArgumentException`→400 since Phase 5.35
  §60, `ResourceConflictException`→409, `DomainConflictException`→409 since Phase 5.36 §61). A bare
  `InvalidOperationException` is no longer mapped here as of Phase 5.36 — only the purpose-built
  `DomainConflictException` (`SmartCityOps.Domain.Exceptions`, thrown by services for genuine
  business-rule conflicts, e.g. `IncidentService.ResolveAsync` on an already-resolved incident or
  `FieldUnitService.UpdateStatusAsync`'s `Dispatched`-related guards) reaches 409; any other
  `InvalidOperationException` now falls through to the standard 500 pipeline. Since Phase 5.38,
  `IncidentService.ResolveAsync` also rejects resolution with `DomainConflictException` (→409) when
  the incident still has any `OperationalTask` with `OperationalTaskStatus.Assigned` — enforcing the
  same `IsReadyToResolve` invariant (§55) server-side instead of force-completing those tasks.

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

**Ankara zone data has a single source of truth.** `Src/SmartCityOps.Domain/Common/AnkaraOperationalZones.cs`
holds an `OperationalZoneDefinition` record (`Name`, `Latitude`, `Longitude`, `Spread`, `Weight`)
and a static `AnkaraOperationalZones.All` list of 12 Ankara zones (the original 7 — Merkez/Çankaya,
Keçiören, Mamak, Etimesgut, Sincan, Gölbaşı, Pursaklar — plus 5 outer districts added in Phase 5.17:
Yenimahalle, Altındağ, Polatlı, Elmadağ, Kahramankazan) — this is the only place zone
boundaries/weights are defined; there is no longer a duplicated copy anywhere. Both consumers read
from it: `OperationalZoneService.GetAllAsync`
(`Src/SmartCityOps.Infrastructure/OperationalZones/OperationalZoneService.cs`, serves the map's
operational-zones layer via the API) maps `AnkaraOperationalZones.All` to `OperationalZoneDto`, and
`Src/incident-generator/Worker.cs` (weights where simulated incidents land) calls
`AnkaraOperationalZones.All` directly via a `<ProjectReference>` to `SmartCityOps.Domain` in
`SmartCityOps.IncidentGenerator.csproj`. This reference doesn't compromise the generator's
architectural independence from Api/Infrastructure (see "Incident Generator" above) — `Domain` has
zero framework dependencies, only plain C# records/enums, so the generator still doesn't share any
API/Infrastructure/Application code. See `docs/DEVELOPMENT_LOG.md`, Part 12 §29–30, §42. If you change
district boundaries or weights, update only `AnkaraOperationalZones.All` — both consumers pick it
up automatically.

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

The sidebar (`app/components/OperationsSidebar.tsx`) renders `FilterPanel` plus
`features/incidents/components/ActiveIncidentsList.tsx` — a scrollable card list of non-resolved
incidents, filtered by the active priority filter and sorted via `sortActiveIncidents` (priority
score descending, then `type` ascending). Each card displays the incident type label, priority
badge, status badge, and reported time — no progress/percentage bar (removed in Phase 5.24, see
below). The sort order is still driven by `features/incidents/lib/incidentPriorityScore.ts`'s
`getIncidentPriorityScore`, which hashes `incident.id` into a 0-100 score bucketed by `priority`
(Low 0-30 / Medium 31-70 / High 71-100, no backend schema change needed since the score is derived,
not stored) purely as a deterministic tie-breaker within each priority tier; it is not rendered
anywhere. The 5 summary counters that used to live in the sidebar (Active Incidents, High Priority
Active Incidents, Available/Dispatched/Out of Service Field Units) were moved into an "Operational
Overview" stat-card grid at the top of the Menu's `features/dashboard/components/
StatisticsSection.tsx`.

Styling is plain CSS with BEM naming, one stylesheet per component, colocated under each feature's
`styles/` folder — no CSS-in-JS, no Tailwind. Colors are centralized rather than hardcoded per
stylesheet: `frontend/src/index.css` defines a `:root` set of CSS custom properties (Tailwind Slate
surfaces/text plus semantic priority/zone/wash tokens, e.g. `--color-surface-panel`,
`--color-priority-high`, `--color-zone-restricted-fill`) that every stylesheet consumes via
`var(--color-...)`, and `frontend/src/shared/constants/colors.ts` exports a matching `APP_COLORS`
TypeScript object for the few places a CSS variable can't reach — MapLibre GL paint expressions and
`Marker({ color })` calls, which need literal color strings (see Phase 5.25 below). Any new
component should draw its colors from one of these two sources rather than hardcoding a hex/rgba
literal.

Map: MapLibre GL JS against the OpenFreeMap `liberty` style, encapsulated in
`features/operations-map` (`useMapInstance` owns the map lifecycle; `useIncidentMarkers` /
`useFieldUnitMarkers` / `useOperationalZoneLayers` layer data onto it; `applyMapFilters` handles
the filter-panel logic). Since Phase 5.39, `useIncidentMarkers` stabilizes its `onSelectIncident`
callback via a ref (matching `useFieldUnitMarkers`'s existing pattern) so an unmemoized parent
callback no longer tears down/recreates every incident marker, and `useOperationalZoneLayers`
splits source/layer creation (`[map]`, once) from data updates (`[map, zones]`, via
`source.setData(featureCollection)`) instead of removing and re-adding the GeoJSON source/layers
on every zones refetch — see `docs/DEVELOPMENT_LOG.md` Part 12 §64.

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
table's min/max columns in a single SQL statement. No behavior change. Phase 5.10
(`docs/DEVELOPMENT_LOG.md`, Part 12 §24) added an interactive "Pick on Map" coordinate mode for the
Restricted Zone creation form: `frontend/src/app/hooks/useCoordinatePicker.ts` holds
`isPickingCoordinates`/`pickedCoordinates` state in `App.tsx` (alongside `useSelection` and
`useReplayController`), since it has to coordinate both the map and the menu at once. Starting a
pick closes the menu (`setMenuView("closed")`) so the operator can see the map; a click on empty
map space while picking is active — the same "genuinely empty space" click that normally calls
`onClearSelection()` (see Selection UX below) — instead calls `onPickCoordinates({ lat, lng })` and
reopens the menu to `"restricted-zones"`. `useMapInstance`'s `onMapClick` callback now receives the
MapLibre `MapMouseEvent` (previously took no arguments) so callers can read `event.lngLat`, and the
hook sets the map canvas cursor to `crosshair` while picking. A `CoordinatePickerBanner`
(`frontend/src/features/restricted-zones/components/`) stays visible over the map with a Cancel
button while the menu is closed for picking. No backend/migration change. If you add another mode
that needs to intercept the map's empty-space click for a purpose other than selection, follow this
same pattern rather than adding a second click listener.

Phase 5.11 (`docs/DEVELOPMENT_LOG.md`, Part 12 §27) fixed the field-unit teleportation bug flagged
as outstanding below: on task assignment, `OperationalTaskService.CreateAsync` sets
`fieldUnit.Latitude/Longitude` to the incident's coordinates in the same transaction that creates
the task, but `useSignalR.ts` invalidates the `field-units` and `operational-tasks` React Query
caches as two separate requests off the same `OperationsUpdated` event — when `field-units`
resolved first, `useFieldUnitMarkers`'s animation loop saw a `Dispatched` unit with no matching
task yet in `findInFlightTask` and snapped the marker straight to the (already-updated)
destination, which is what looked like a teleport. `useFieldUnitMarkers.ts` now holds a
`lastRestingPositionsRef` (`Map<string, GeoLocation>`): a `Dispatched` unit with no in-flight task
yet keeps its marker at that last resting position instead of snapping to `fieldUnit.latitude/
longitude`, and the ref is only updated to the new destination once an in-flight task is found and
`getTravelProgress(...) >= 1`, or once the unit is `Available`/`OutOfService`. No backend/migration
change; `npm run lint`/`npm run build` clean. Diagnosed via temporary logging in
`getTravelProgress`/`useFieldUnitMarkers.ts` (removed once the root cause was confirmed) — a
timezone-parsing hypothesis for `assignedAt` and a marker-diff-effect-reset hypothesis were both
ruled out by code inspection before landing on the cross-query race above.

Phase 5.12 (`docs/DEVELOPMENT_LOG.md`, Part 12 §28) finally ran the full browser visual smoke test
that §25/§26/§27 had repeatedly left outstanding, using a headless Chrome driven by `puppeteer-core`
(pointed at the system's existing Chrome install, no new project dependency added) — and it caught a
real bug: the field unit marker never animated at all, even though the dashed route line
(`useDispatchedRouteLayers.ts`) rendered correctly. Root cause: `findInFlightTask` in
`useFieldUnitMarkers.ts` used `.find()` to grab the *first* task matching a field unit's id, then
checked `isInFlightTask` on that single result — but a field unit accumulates task history, so if an
old `Completed` task for that unit happened to come before the new `Assigned` one in the
`operationalTasks` array, `.find()` returned the stale task, `isInFlightTask` on it was `false`, and
the function returned `null` forever, even while a genuinely in-flight task existed elsewhere in the
array. This is why `useDispatchedRouteLayers.ts` was unaffected — its `buildFeatureCollection` calls
`isInFlightTask` inside a `flatMap` over *every* task, not `.find()`-then-check on one. Fixed by
combining the field-unit-match and in-flight checks into a single `find` predicate (via a
`isInFlightTaskForFieldUnit(fieldUnitId)` type-predicate factory, so `.find()`'s return type narrows
correctly to `InFlightOperationalTask`). Verified by reading marker `style.transform` values from
the live DOM before/after a 15-second window against a real assigned task: 0/23 markers moved before
the fix, 1/23 (the dispatched unit) moved after. `npm run lint`/`npm run build` clean; no
backend/migration change; no test/debug code left in the tree. This is a distinct bug from the
Phase 5.11 teleportation race above — different root cause (wrong task selected, not a timing race)
and different symptom (marker never moves at all, vs. an instant snap-to-destination).

Known open items, per `docs/DEVELOPMENT_LOG.md`, Part 12 §25 (the stale-selection item below was
resolved by Phase 5.14, see §36-37):
- **No backend test project exists yet** — still fully manual verification (see Commands section).
- Restricted-zone creation's center coordinate can now be set via "Pick on Map" (Phase 5.10) or by
  typing lat/lng directly; radius is still a free-text/number input (consistent with every other
  radius-style input in the project — there's no natural "drag on map" equivalent for a radius).
  Restricted zones now have default seed data (Phase 5.16,
  `docs/DEVELOPMENT_LOG.md` Part 12 §41): `RestrictedZoneConfiguration.cs` seeds "Kızılay Security
  Zone" (`SecurityLockdown`) and "Eskişehir Road Construction" (`RoadConstruction`) via
  `HasData(...)` and the `SeedRestrictedZones` migration, so `RestrictedZoneAssignmentRule` has
  real data to evaluate against out-of-the-box after `dotnet ef database update` — no longer
  dependent on an operator first creating a zone via `POST /api/restricted-zones`.
- ~~Replay reconstructs `OutOfService` transitions approximately, since they aren't timestamped in
  the DB~~ — **resolved by Phase 5.31** (`docs/DEVELOPMENT_LOG.md` Part 12 §56): field units now
  have an explicit, audited `Available ↔ OutOfService` lifecycle transition via
  `PATCH /api/field-units/{id}/status`, and `OperationsReplayService` reconstructs historical status
  from the `FieldUnitStatusHistories` audit table instead of treating `OutOfService` as
  time-invariant. `Reassigned` hand-off moments, previously also approximated (via the new task's
  `AssignedAt`), are now explicit: `OperationalTask` has a dedicated nullable `ReassignedAt` column,
  set by `OperationalTaskService.ReassignAsync` at the same instant as the new task's `AssignedAt`,
  and `OperationsReplayService` resolves field-unit availability and historical active tasks against
  that exact timestamp instead of approximating (Phase 5.18, `docs/DEVELOPMENT_LOG.md` Part 12 §43).
  Restricted zones and operational zones are still treated as time-invariant in replay (always shown
  as their current state).

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

Phase 5.13 (`docs/DEVELOPMENT_LOG.md`, Part 12 §29–30) unified the previously-duplicated Ankara
zone data (see "Ankara zone data has a single source of truth" above) across two steps: Step 1
extracted a shared `OperationalZoneDefinition`/`AnkaraOperationalZones.All` into
`SmartCityOps.Domain.Common` and refactored `OperationalZoneService` to read from it; Step 2 added
a `SmartCityOps.Domain` project reference to `SmartCityOps.IncidentGenerator.csproj` and rewired
`incident-generator/Worker.cs`'s `GetRandomZone()` to read from `AnkaraOperationalZones.All`
instead of its own local copy. This unification is now complete — see `docs/To-Do-List.txt`.

`App.tsx` orchestration was simplified in two steps (`docs/DEVELOPMENT_LOG.md`, Part 12 §31–32).
Step 1 extracted the derived-selector logic (looking up the active task for the selected field
unit, filtering available field units for reassignment) into pure functions in
`frontend/src/app/lib/operationsSelectors.ts` (`getActiveTaskForFieldUnit`, `getTasksForIncident`,
`getAvailableFieldUnits`). Step 2 extracted the conditional live-vs-replay-snapshot data
resolution into `frontend/src/app/hooks/useReplayAwareData.ts` — `useReplayAwareData(liveData,
replay, snapshot)` returns `{ incidents, fieldUnits, operationalTasks, restrictedZones }`, reading
from `snapshot` when replay mode is active and a snapshot is loaded, otherwise from `liveData`
(`restrictedZones` always comes from `liveData`, since restricted zones are treated as
time-invariant in replay). `App.tsx` now composes these two helpers instead of inlining `.find`/
`.filter`/ternary logic. No behavior change; `npm run lint`/`npm run build` clean.

`RestrictedZonesSection.tsx` (324 lines) was decomposed into hooks + subcomponents across three
steps (`docs/DEVELOPMENT_LOG.md`, Part 12 §33–35). `frontend/src/features/restricted-zones/hooks/
useRestrictedZoneForm.ts` owns the "create zone" form state (including the `pickedCoordinates`
sync effect) and `useRestrictedZoneEdit.ts` owns inline row-editing state, each wrapping their
respective mutation hook (`useCreateRestrictedZone`/`useUpdateRestrictedZone`).
`frontend/src/features/restricted-zones/components/RestrictedZoneTable.tsx` renders the table
shell and picks `RestrictedZoneRow.tsx` (read-only) or `RestrictedZoneEditRow.tsx` (inline edit)
per row by `editingId`; `RestrictedZoneForm.tsx` renders the "Define New Restricted Zone" form,
including the "Pick on Map" button. A shared `ZONE_TYPES` constant moved to
`frontend/src/features/restricted-zones/constants.ts` so both `RestrictedZoneEditRow` and
`RestrictedZoneForm` read from one source. `RestrictedZonesSection.tsx` itself is now a ~74-line
composition container: it calls the two hooks, wires up `handleDelete` (kept inline —
`useDeleteRestrictedZone` + `window.confirm`, too small to warrant its own hook), and passes props
down to `RestrictedZoneTable`/`RestrictedZoneForm`. One deliberate deviation from the original
layout: the update-error message used to render once below the table regardless of which row was
being edited; it now renders inside `RestrictedZoneEditRow`'s own action cell, closer to the row
being edited — a cosmetic change only, not a functional one. `docs/To-Do-List.txt`'s "parçala"
item for this component is marked `[x]`.

Phase 5.14 (`docs/DEVELOPMENT_LOG.md`, Part 12 §36–37) resolved the stale selection-state risk
noted above, across two steps. Step 1 refactored `frontend/src/app/hooks/useSelection.ts` to store
only `selectedIncidentId: string | null`/`selectedFieldUnitId: string | null` instead of full
`Incident`/`FieldUnit` snapshots, exposing `toggleIncidentSelection`/`toggleFieldUnitSelection`
(same-ID-deselects toggle, replacing the old `setSelectedIncident`/`setSelectedFieldUnit`),
`selectIncident`/`selectFieldUnit` (unconditional set), `deselectIncident`/`deselectFieldUnit`, and
`clearSelection`; `frontend/src/app/lib/operationsSelectors.ts` gained
`getSelectedIncident(selectedId, incidents)`/`getSelectedFieldUnit(selectedId, fieldUnits)` to
resolve the live object from a React Query array by ID. Step 2 wired `App.tsx` to the new API:
`selectedIncident`/`selectedFieldUnit` are no longer local state — they're derived every render via
`getSelectedIncident`/`getSelectedFieldUnit` against `useReplayAwareData`'s output, so a SignalR
`OperationsUpdated` invalidation now automatically re-resolves the selection against fresh data (or
drops it to "no selection" if the ID no longer exists), with no separate cleanup mechanism needed.
Map/`IncidentPanel`/`ActiveTasksPanel` selection callbacks wrap `toggleIncidentSelection(id)`/
`toggleFieldUnitSelection(id)` (preserving the old click-to-toggle behavior); `Menu`'s
`onSelectIncident`/`onSelectFieldUnit` call `selectIncident(id)`/`selectFieldUnit(id)` unconditionally
and close the menu. Downstream component prop types (`FieldUnitColumn`, `IncidentPanel`,
`ActiveTasksPanel`, `OperationsSidebar`) were unchanged — they still receive derived
`Incident | null`/`FieldUnit | null` objects, just sourced differently now. `npm run lint`/`npm run
build` clean (0 errors); no backend/migration change. `docs/To-Do-List.txt`'s "SignalR sonrası seçim
state'ini reaktif hale getir" and "`useSelection.ts` hook'unu ID tabanlı reaktif yapıya dönüştür"
items are marked `[x]`.

`OperationalTaskService.CreateAsync`/`ReassignAsync` (`docs/DEVELOPMENT_LOG.md`, Part 12 §38) had
their duplicated task-creation/field-unit-mutation/location-history/concurrency-guard block
extracted into a private `AssignFieldUnitAsync` helper in
`Src/SmartCityOps.Infrastructure/OperationalTasks/OperationalTaskService.cs` — pure "extract
method", no behavior change. `useFieldUnitMarkers.ts` (`docs/DEVELOPMENT_LOG.md`, Part 12 §39) had
its animation `useEffect` dependency array reduced to `[map]` (previously
`[map, fieldUnits, operationalTasks]`), reading field units/tasks each frame via
`fieldUnitsByIdRef`/`operationalTasksRef` instead of closing over the props, so the
`requestAnimationFrame` chain now runs continuously instead of restarting on every SignalR-driven
refetch.

Phase 5.15 / Audit (`docs/DEVELOPMENT_LOG.md`, Part 12 §40) was a read-only, code-verified audit
(not prose-trusted) of the full backend + frontend against `docs/To-Do-List.txt`, which had two
overlapping/duplicated lists with several stale entries. `docs/To-Do-List.txt` was rewritten into
one de-duplicated, priority-grouped list; every remaining open item was re-verified directly
against source (grep/read), not inferred from this file's prose. One new finding surfaced:
`Src/SmartCityOps.sln`'s `ProjectConfigurationPlatforms` section was missing `Debug|Any
CPU.Build.0`/`Release|Any CPU.Build.0` mappings for every project (only the `x64` platform
variants had `Build.0`), so `dotnet build SmartCityOps.sln` under the default `Debug|Any CPU`
configuration silently compiled zero projects. Tracked as a new Technical Debt
item in `docs/To-Do-List.txt` and fixed in Phase 5.22 below. Confirmed still accurate as of this audit: no backend test project,
no frontend test runner (`vitest`/`jest` absent from `frontend/package.json`), no
`RestrictedZoneConfiguration.cs` seed data, `AnkaraOperationalZones.All` still has 7 zones (Sincan
is present; Yenimahalle/Altındağ/Polatlı are not), and `OperationalTaskService.ReassignAsync` still
never sets `oldTask.CompletedAt`. Zero stray `TODO`/`FIXME`/`console.log` found anywhere in `Src/`
or `frontend/src/`. `dotnet build`/`npm run lint`/`npm run build` all confirmed green.

Phase 5.17 (`docs/DEVELOPMENT_LOG.md`, Part 12 §42) closed the outer-district coverage gap §40's
audit had flagged: `AnkaraOperationalZones.All` gained 5 new zones — Yenimahalle, Altındağ
(Ulus/Dışkapı), Polatlı, Elmadağ, Kahramankazan — bringing the total from 7 to 12, with weights kept
proportional (central/inner districts weighted higher than the newly-added outer ones). Both
consumers (`OperationalZoneService.GetAllAsync` and `incident-generator/Worker.cs`) picked up all 12
zones automatically, per the single-source-of-truth design above — no consumer code changed.
`ANKARA_BOUNDS` in `frontend/src/features/operations-map/lib/mapConfig.ts` was extended from
`[[32.4, 39.6], [33.3, 40.2]]` to `[[32.0, 39.45], [33.35, 40.3]]` so the map camera can comfortably
reach Polatlı and Kahramankazan, which fell outside/at the edge of the previous bounds. Verified via
a live `GET /api/operational-zones` call (all 12 zones present with the expected coordinates) plus
`dotnet build`/`npm run lint`/`npm run build`, all clean. `docs/To-Do-List.txt`'s "Operational Zones
kapsama alanını genişlet" item is now `[x]`, moved to the completed archive section.

Phase 5.18 (`docs/DEVELOPMENT_LOG.md`, Part 12 §43) added an explicit nullable `ReassignedAt`
(`DateTimeOffset?`) column to `OperationalTask` (and `OperationalTaskDto`) to capture the exact
hand-off moment during a reassignment, replacing the previous `AssignedAt`-of-the-new-task
approximation flagged in §38/§40.
`OperationalTaskService.ReassignAsync` now sets `oldTask.ReassignedAt` to the same `now` timestamp
used for the new task's `AssignedAt`; `OperationsReplayService` resolves field-unit availability and
which tasks were active at a given replay timestamp against `ReassignedAt` precisely, instead of
approximating, and `GetReplayTimeRangeAsync`'s aggregate query now also considers
`MaxReassignedAt`. Migration `AddOperationalTaskReassignedAt` was generated, inspected (nullable
`timestamp with time zone` column), and applied via `dotnet ef database update`. `dotnet build`/
`npm run lint`/`npm run build` all clean. `docs/To-Do-List.txt`'s "Operations Replay simülasyonunu
kesinleştir — Reassign devir zamanı" item is now `[x]`, moved to the completed archive section.

Phase 5.22 (`docs/DEVELOPMENT_LOG.md`, Part 12 §47) fixed the `Src/SmartCityOps.sln` build mapping
gap flagged by the Phase 5.15 audit above: `.Debug|Any CPU.Build.0`/`.Release|Any CPU.Build.0`
mappings (pointing to `Debug|x64`/`Release|x64`, matching each project's existing `ActiveCfg`) were
added for all 5 project GUIDs (`SmartCityOps.Domain`, `SmartCityOps.Application`,
`SmartCityOps.Infrastructure`, `SmartCityOps.Api`, `SmartCityOps.IncidentGenerator`). Standard
`dotnet build` / `dotnet build SmartCityOps.sln` from `Src/` now builds all 5 projects cleanly (0
warnings, 0 errors) under the default `Debug|Any CPU` configuration — no `-p:Platform=x64` or
explicit `.csproj` path is needed anymore. `docs/To-Do-List.txt`'s "`SmartCityOps.sln` — `Debug|Any
CPU` konfigürasyonu proje derlemiyor" item is now `[x]`, moved to the completed archive section.

Phase 5.23 (`docs/DEVELOPMENT_LOG.md`, Part 12 §48) reorganized the sidebar: the 5 summary counters
moved into an "Operational Overview" stat-card grid in the Menu's `StatisticsSection.tsx`, and a new
`ActiveIncidentsList.tsx` + `incidentPriorityScore.ts` (see "Frontend" section above) rendered a
scrollable, sorted card list of active incidents in their place, originally with a deterministic
progress-bar/percentage badge per card. `FilterPanel`'s checkbox rows were also modernized into
compact filter-chip buttons with priority-colored selected states. Phase 5.24
(`docs/DEVELOPMENT_LOG.md`, Part 12 §49) removed that progress-bar/percentage badge as misleading on
an operations dashboard (the score is a derived hash, not a real signal): `ActiveIncidentsList.tsx`
now renders only type/priority badge/status badge/reported time per card, the corresponding
`.active-incidents-list__score-*` CSS rules were deleted, and the now-unused
`getPriorityScoreColor`/`PriorityScoreColor` were removed from `incidentPriorityScore.ts`. Sort
order and filtering (`sortActiveIncidents`, `getIncidentPriorityScore`) are unchanged.
`npm run lint`/`npm run build` clean; no backend/migration change.

Phase 5.25 (`docs/DEVELOPMENT_LOG.md`, Part 12 §50) standardized the frontend's color palette:
~45 hardcoded color literals across 21 stylesheets and 5 MapLibre layer hooks (26 files) were
migrated to the centralized `:root` tokens / `APP_COLORS` constant described in the "Frontend"
section above, in three steps — Step 1.1 introduced the token set itself plus fixed
`ActiveIncidentsList.css` (Low Priority badge was rendering neon-green text on a blue-tinted
background instead of green-on-green) and `FilterPanel.css`; Step 1.2 tokenized the remaining 15
stylesheets (layout shell, shared buttons/table/timeline, menu overlay, incident/field-unit panels,
task buttons, dashboard, recommendations, restricted zones, replay control bar); Step 1.3 connected
`OperationsMap.css` and the 5 MapLibre layer hooks (`useIncidentMarkers.ts`,
`useFieldUnitMarkers.ts`, `useDispatchedRouteLayers.ts`, `useOperationalZoneLayers.ts`,
`useRestrictedZoneLayers.ts`) to `APP_COLORS`, fixing a High Priority color divergence between map
markers (`#e20b0b`) and UI chips (`#ef4444`). Pure color-literal substitution — zero layout/behavior
change, `npm run lint`/`npm run build` clean throughout.

Phase 5.26 (`docs/DEVELOPMENT_LOG.md`, Part 12 §51) replaced field-unit travel's Euclidean
straight-line interpolation with real road-network navigation via OSRM (Open Source Routing
Machine). Backend: `IRoutingService`/`RouteGeometryResult` (Application) and `OsrmRoutingService`
(Infrastructure, a Typed `HttpClient` with a 3s timeout, culture-invariant coordinate formatting, a
required `User-Agent` header, and a Haversine 40 km/h straight-line fallback if OSRM is unreachable)
are called from `OperationalTaskService.AssignFieldUnitAsync` on every dispatch/reassign; the
resulting GeoJSON polyline and real driving duration are persisted on the new nullable
`OperationalTask.RouteGeometry` column (migration `AddOperationalTaskRouteGeometry`) and
`EstimatedEtaSeconds`, and flow through to `OperationsReplayService` snapshots. This superseded the
inline `IEtaEstimator` straight-line ETA estimate for this one call site (that service is unchanged
and still used elsewhere, e.g. `FieldUnitRecommendationService`). Frontend:
`geoInterpolation.ts`'s `getCurrentPosition` now parses `task.routeGeometry` and interpolates along
the exact polyline segment matching current travel progress (`interpolateAlongPolyline` +
`haversineDistance`), and `useDispatchedRouteLayers.ts` renders that same polyline as the
dispatched-route line — both fall back to the original 2-point origin→destination line for legacy
tasks with no `routeGeometry`. A live-verification pass caught and fixed a real bug: OSRM's public
server was silently rejecting every request (missing `User-Agent`, and a latent Turkish-locale
decimal-comma risk in coordinate formatting), so every route was silently falling back to a straight
line; re-verified live afterward with `routeGeometry` returning ~330 real coordinate points along
Ankara streets. `dotnet build`/`npm run lint`/`npm run build` all clean; no test/debug code left in
the tree.

Phase 5.27 (`docs/DEVELOPMENT_LOG.md`, Part 12 §52) migrated operational metrics — Overview counts,
Incidents by Type, Average Resolution Time, and Field Unit Workload, previously computed client-side
in `buildOperationalStatistics.ts` — to a dedicated backend aggregation service,
`IOperationalStatisticsService`/`OperationalStatisticsService`, exposed via `GET
/api/operations/statistics` and consumed by `StatisticsSection.tsx` through a new
`useOperationalStatistics` React Query hook kept live by the existing `OperationsUpdated` SignalR
invalidation pattern (`["operational-statistics"]` added alongside the other six query keys). A live
test caught and fixed a real bug: `g.Key.ToString()` inside a `GroupBy(...).Select(...)` LINQ
projection can't be translated to SQL by Npgsql/EF Core, which threw an `InvalidOperationException`
that `DomainExceptionHandler` maps to `409 Conflict` — fixed by materializing the grouped result first
and only calling `.ToString()` in memory afterward. `buildOperationalStatistics.ts` was deleted after
confirming no remaining imports. `dotnet build`/`npm run lint`/`npm run build` all clean.

Phase 5.28 (`docs/DEVELOPMENT_LOG.md`, Part 12 §53) migrated Incident Timeline and Field Unit
Movement History assembly — previously client-side array loops over `incidents`/`fieldUnits`/
`operationalTasks`/`locationHistory`, including a simulated `Date.now()` arrival calculation — to
dedicated backend endpoints, `GET /api/incidents/{id}/timeline` and `GET
/api/field-units/{id}/movement-history` (`IIncidentService.GetTimelineAsync`/
`IFieldUnitService.GetMovementHistoryAsync`, see "Backend" above). `IncidentTimelineSection.tsx` and
`FieldUnitMovementHistorySection.tsx` now fetch their own data via `useIncidentTimeline`/
`useFieldUnitMovementHistory` React Query hooks instead of receiving raw arrays as props, and the
now-obsolete `locationHistory` prop-drilling chain through `App.tsx`/`Menu.tsx`/
`MenuSectionRouter.tsx` was removed. `useSignalR.ts`'s invalidation list grew accordingly
(`["incident-timeline"]`, `["field-unit-movement-history"]`).

Phase 5.29 (`docs/DEVELOPMENT_LOG.md`, Part 12 §54) migrated incident triage scoring and active
incident sorting — previously a client-side hash-of-`incident.id` in the now-deleted
`incidentPriorityScore.ts` — to the backend: `IncidentPriorityScoreCalculator` (see "Backend" above)
computes a real base-priority-plus-age score, exposed as `IncidentDto.PriorityScore` and returned
pre-sorted (non-resolved incidents by `PriorityScore` descending then `ReportedAt` ascending,
resolved last) from `GET /api/incidents`; `OperationsReplayService` computes the same score against
the replay timestamp for snapshots. `OperationsSidebar.tsx` no longer sorts incidents itself — it
only filters out resolved incidents and passes the backend's order straight through to
`ActiveIncidentsList`. `dotnet build`/`npm run lint`/`npm run build` all clean.

Phase 5.30 (`docs/DEVELOPMENT_LOG.md`, Part 12 §55) migrated "Ready to Resolve" incident
eligibility — previously a client-side `Set` cross-reference between `operationalTasks` and
`incidents` in `ActiveTasksPanel.tsx` — to the backend: `IncidentDto.IsReadyToResolve` (see
"Backend" above) is computed by `IncidentService.GetAllAsync`/`CreateAsync`/`ResolveAsync` and, for
historical snapshots, by `OperationsReplayService` via a shared `IsTaskActiveAt` helper evaluated
against the replay timestamp. `ActiveTasksPanel.tsx` now filters its "Ready to Resolve" table
directly on `incident.isReadyToResolve` instead of building its own incident/task cross-reference.
`dotnet build`/`npm run lint`/`npm run build` all clean.

Phase 5.31 (`docs/DEVELOPMENT_LOG.md`, Part 12 §56) closed the last remaining "Known open items" gap
above: field units gained an explicit, audited `Available ↔ OutOfService` lifecycle transition.
`FieldUnitStatusHistory` (Domain) records every transition; `FieldUnitService.UpdateStatusAsync`
(backing the new `PATCH /api/field-units/{id}/status`) validates that a `Dispatched` unit can't be
changed directly and that `Dispatched` can't be set through this endpoint (only task assignment may
do that), writes the audit row, and dispatches the existing `FieldUnitUpdatedEvent` through the same
SignalR pattern as every other mutation. `OperationsReplayService` now derives each field unit's
historical status from `FieldUnitStatusHistories` (latest row at-or-before the replay timestamp,
overridden by an active dispatch) instead of the old time-invariant `OutOfService` special case.
`FieldUnitPanel.tsx` gained "Set Out of Service"/"Set Available" action buttons (hidden in
replay/`readOnly` mode) wired through a new `useUpdateFieldUnitStatus` React Query mutation hook.
Migration `AddFieldUnitStatusHistory` applied; `dotnet build`/`npm run lint`/`npm run build` all
clean.

Phase 5.32 (`docs/DEVELOPMENT_LOG.md`, Part 12 §57) extended the field-unit recommendation engine
with the same real-driving-time approach Phase 5.26 brought to route geometry: `IRoutingService`
gained `GetDrivingTableAsync` (batch OSRM `/table/v1/driving` query), implemented in
`OsrmRoutingService` by reusing the existing curl/timeout infrastructure, returning a new
`TravelMatrixResult` (`DurationsSeconds`/`DistancesMeters`) or `null` on failure.
`FieldUnitRecommendationService` now issues one batched table request per incident across all
candidate field units instead of computing Haversine distance/ETA per unit, falling back to the
pre-existing `GeoCalculator`/`IEtaEstimator` path per unit whenever OSRM's result is `null` or
missing that unit's entry. `FieldUnitScoringContext`/`DistanceScoreRule` needed no changes, since
they already consumed generic `DistanceKm`/`Eta` values regardless of source. `dotnet build`/
`npm run lint`/`npm run build` all clean; no frontend files touched.

Phase 5.33 (`docs/DEVELOPMENT_LOG.md`, Part 12 §58) added a Cancel/abort task lifecycle transition,
previously missing alongside `Complete`/`Reassign`: `OperationalTaskStatus.Cancelled` and
`OperationalTask.CancelledAt` (migration `AddOperationalTaskCancelledAt`) back a new
`OperationalTaskService.CancelAsync` (`POST /api/operational-tasks/{id}/cancel`), which guards
`Status == Assigned`, frees the field unit to `Available`, reverts the incident from `InProgress` to
`Open` when no other active task remains for it, and dispatches a new `TaskCancelledEvent` through
the existing SignalR pattern. `OperationsReplayService`'s `IsTaskActiveAt`/`GetReplayTimeRangeAsync`
account for `CancelledAt` the same way they already do for `ReassignedAt`. On the frontend,
`FieldUnitPanel.tsx` gained a "Cancel Task" button next to "Complete Task" (via a new
`useCancelTask` mutation hook), and `buildCompletedHistoryRows`/`CompletedTasksSection.tsx` — now
titled "Task History" — list cancelled tasks alongside completed ones with an explicit status
column. `dotnet build`/`npm run lint`/`npm run build` all clean.

Phase 5.34 (`docs/DEVELOPMENT_LOG.md`, Part 12 §59) fixed an in-flight destination illusion in the
recommendation engine: a dispatched field unit's stored `Latitude/Longitude` are already the
incident coordinates it's travelling *to* (set by `AssignFieldUnitAsync`, §51), so
`FieldUnitRecommendationService` was previously scoring travelling units as if they'd already
arrived when ranking recommendations for a different, concurrent incident. `GeoCalculator` gained
`GetInFlightPosition` (origin/destination linear interpolation by elapsed time vs.
`EstimatedEtaSeconds`, mirroring the frontend's existing `geoInterpolation.ts` approach), and
`FieldUnitRecommendationService` now looks up each candidate unit's currently `Assigned` task (if
any) and computes its effective real-time coordinate before building the OSRM `GetDrivingTableAsync`
origins list and the Haversine/`IEtaEstimator` fallback path — see "Backend" above. `dotnet build`
clean (0 warnings, 0 errors); no frontend files touched.

Phase 5.35 (`docs/DEVELOPMENT_LOG.md`, Part 12 §60) fixed the top findings from a full-stack system
health audit (`docs/SYSTEM_HEALTH_AUDIT.md`): `IncidentService.GetAllAsync`'s `IsReadyToResolve`
computation had diverged from `OperationsReplayService.IsTaskActiveAt`, counting `Reassigned`/
`Cancelled` tasks as active forever instead of terminal — fixed by filtering on
`OperationalTaskStatus.Assigned` only, so live and replay now agree; `DomainExceptionHandler` gained
an `ArgumentException`→400 mapping (previously an invalid `FieldUnitService.UpdateStatusAsync`
status string surfaced as a raw 500), with the redundant local try/catch in
`IncidentsController.Create` removed in favor of the centralized handler; `incident-generator/
Worker.cs`'s POST loop now catches `Exception` generally (logged as a warning, loop continues) with
a dedicated no-op branch for a genuine shutdown-triggered `OperationCanceledException`, instead of
only catching `HttpRequestException` and risking a silent, permanent worker death on any other
transient failure; and `useCompleteTask.ts`'s cache invalidation list was aligned with
`useCreateTask.ts`/`useCancelTask.ts` by adding `operational-statistics` and
`field-unit-location-histories`. `dotnet build SmartCityOps.sln`/`npm run lint`/`npm run build` all
clean.

Phase 5.36 (`docs/DEVELOPMENT_LOG.md`, Part 12 §61) closed two more `docs/SYSTEM_HEALTH_AUDIT.md`
findings. `FieldUnitService.GetMovementHistoryAsync` had the same enum-`.ToString()`-inside-a-LINQ-
projection risk that Phase 5.27 (§52) had already hit and fixed once elsewhere — it now selects into
an anonymous type with the raw `IncidentType?` enum value, materializes via `.ToListAsync()`, and
only calls `.ToString()` in a second, in-memory `.Select(...)` into `FieldUnitMovementRecordDto`.
Separately, a new `DomainConflictException` (`Src/SmartCityOps.Domain/Exceptions/`, inheriting
`DomainException`) replaces the bare `InvalidOperationException` previously thrown by
`IncidentService.ResolveAsync` (already-resolved guard) and `FieldUnitService.UpdateStatusAsync`
(the two `Dispatched`-related guards) for genuine business-rule conflicts; `DomainExceptionHandler`
now maps `DomainConflictException`→409 instead of the old blanket `InvalidOperationException`→409
case (removed), so an unrelated runtime/BCL `InvalidOperationException` now correctly falls through
to the standard 500 pipeline instead of being reported to clients as a misleading 409. `dotnet build
SmartCityOps.sln` clean (0 warnings, 0 errors); no frontend files touched.

Phase 5.37 (`docs/DEVELOPMENT_LOG.md`, Part 12 §62) fixed OSRM routing on a corporate Windows
development machine, where every request was silently falling back to straight-line interpolation
(visible as a dashed straight route and an instant field-unit teleport). Root cause: Schannel-linked
`curl` failed the TLS handshake against OSRM with `CRYPT_E_NO_REVOCATION_CHECK` because the
corporate network can't reach the CRL/OCSP endpoint — fixed by conditionally passing curl's
`--ssl-no-revoke` flag on Windows only (`RunCurlAsync`, see "Backend" above). Independently,
`EstimatedEtaSeconds` had no floor and could be `0` (e.g. a fallback route with coincident
origin/destination), which the frontend's travel-progress animation reads as "already arrived" —
fixed with a `MinimumEtaSeconds = 5` floor in `OperationalTaskService`. A third, process-only issue
surfaced while verifying both fixes live: this repo's `dotnet build` (solution-level) and `dotnet
run --project SmartCityOps.Api` write to two different output directories
(`bin\x64\Debug\net8.0` vs `bin\Debug\net8.0`), so restarting via `dotnet run --no-build` after only
running `dotnet build` served a stale DLL — resolved by restarting with a plain `dotnet run`
instead. Verified live: a fresh task assignment returned a real 35-point OSRM polyline and a
duration-matched `estimatedEtaSeconds`, with zero fallback warnings logged. `dotnet build
SmartCityOps.sln`/`npm run build` both clean; the frontend's `routeGeometry` parsing needed no
changes — it was already correct.

Phase 5.38 (`docs/DEVELOPMENT_LOG.md`, Part 12 §63) closed a backend/frontend enforcement gap on the
`IsReadyToResolve` invariant (§55/§60): `IncidentService.ResolveAsync` previously force-completed any
`Assigned` `OperationalTask` still open on an incident (setting it `Completed` and its field unit
back to `Available`) instead of rejecting the resolve request, so a caller bypassing the frontend
could silently override in-progress dispatches. `ResolveAsync` now throws `DomainConflictException`
(→409, see "Backend" above) whenever any `Assigned` task remains for the incident, and the
force-completing loop was removed — resolution is strictly all-or-nothing. `dotnet build
SmartCityOps.sln` clean (0 warnings, 0 errors); no migration/frontend change, since
`ActiveTasksPanel.tsx`'s existing `IsReadyToResolve` gating already hid this path from the UI.

Phase 5.39 (`docs/DEVELOPMENT_LOG.md`, Part 12 §64) closed the marker/layer re-render churn finding
from `docs/SYSTEM_HEALTH_AUDIT.md` flagged below: `useIncidentMarkers.ts` was rebuilding every
incident marker on the map whenever a parent passed a fresh, unmemoized `onSelectIncident`
instance, since that callback sat directly in the effect's dependency array — fixed by capturing it
in a ref and trimming the dependency array to `[map, incidents, selectedIncidentId]`, the same
pattern `useFieldUnitMarkers.ts` already used. Separately, `useOperationalZoneLayers.ts` was
tearing down and recreating the GeoJSON source and both map layers (`removeLayer`/`removeSource`/
`addSource`/`addLayer`) on every `zones` update, including no-op SignalR-driven refetches — fixed by
splitting the hook into a `[map]`-only effect that creates the source/layers once and a
`[map, zones]` effect that pushes updates via `source.setData(featureCollection)`, MapLibre's
native in-place update, instead of removing/re-adding anything. `npm run build`/`npm run lint`
(frontend) and `dotnet build SmartCityOps.sln` (backend, unaffected but re-verified) all clean;
frontend-only change, no migration.

Phase 5.40 (`docs/DEVELOPMENT_LOG.md`, Part 12 §65) fixed unrealistic `AverageResolutionMinutes`
figures on the operational statistics dashboard (§52): a number of legacy/manually-tested resolved
incidents had `ResolvedAt` weeks or months after `ReportedAt`, skewing the average into the tens of
thousands of minutes. `Incidents` has no static `HasData(...)` seed (unlike `RestrictedZoneConfiguration.cs`,
§41) — every row comes from manual testing or the `incident-generator` worker — so the fix is a
data-only migration, `NormalizeIncidentResolutionDurations`, whose `Up` runs a raw SQL `UPDATE`
setting `ResolvedAt = ReportedAt + (15 + random() * 30 minutes)` for any resolved incident whose
duration exceeded 2 hours (plausible existing durations are left untouched); `Down` is a documented
no-op, since the original timestamps aren't recoverable. Verified live: `GET
/api/operations/statistics`'s `averageResolutionMinutes` dropped from a multi-thousand-minute figure
to `30.4` post-migration. `dotnet build Src/SmartCityOps.sln` clean (0 warnings, 0 errors); no
application/frontend code changed, since `OperationalStatisticsService`'s calculation itself was
already correct — only the underlying data was wrong.

Other candidates noted in `docs/DEVELOPMENT_LOG.md` Part 12: adding a backend test project (the only
remaining open item — see "Known open items" above) and the remaining lower-priority findings in
`docs/SYSTEM_HEALTH_AUDIT.md` (missing single-resource `GET /{id}` endpoints and a handful of
unmigrated color literals).
