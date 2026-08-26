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

**Ankara zone data has a single source of truth.** `Src/SmartCityOps.Domain/Common/AnkaraOperationalZones.cs`
holds an `OperationalZoneDefinition` record (`Name`, `Latitude`, `Longitude`, `Spread`, `Weight`)
and a static `AnkaraOperationalZones.All` list of the 7 Ankara zones — this is the only place zone
boundaries/weights are defined; there is no longer a duplicated copy anywhere. Both consumers read
from it: `OperationalZoneService.GetAllAsync`
(`Src/SmartCityOps.Infrastructure/OperationalZones/OperationalZoneService.cs`, serves the map's
operational-zones layer via the API) maps `AnkaraOperationalZones.All` to `OperationalZoneDto`, and
`Src/incident-generator/Worker.cs` (weights where simulated incidents land) calls
`AnkaraOperationalZones.All` directly via a `<ProjectReference>` to `SmartCityOps.Domain` in
`SmartCityOps.IncidentGenerator.csproj`. This reference doesn't compromise the generator's
architectural independence from Api/Infrastructure (see "Incident Generator" above) — `Domain` has
zero framework dependencies, only plain C# records/enums, so the generator still doesn't share any
API/Infrastructure/Application code. See `docs/DEVELOPMENT_LOG.md`, Part 12 §29–30. If you change
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
  radius-style input in the project — there's no natural "drag on map" equivalent for a radius). No
  restricted zones exist by default (no seed data), so the assignment rule always returns
  `Success()` until an operator creates one via `POST /api/restricted-zones`.
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

Other candidates noted in `docs/DEVELOPMENT_LOG.md` Part 12: adding a backend test project.
