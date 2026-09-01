# Smart City Ops — Pre-Auth System Audit Report

**Date:** 2026-08-31
**Scope:** Backend (`Src/`) + Frontend (`frontend/`), read-only analysis. No source code was modified.
**Purpose:** Technical health check and architectural baseline before introducing JWT-based
Authentication & Authorization (operator identity, endpoint security, auth context).

**Build verification (as required):**
- `dotnet build Src/SmartCityOps.sln` → **0 Warnings, 0 Errors** (all 5 projects).
- `npm run build` (frontend) → succeeds (`tsc -b && vite build`); only a pre-existing chunk-size
  advisory from Vite (`maplibre-vendor` ~955 kB / 249 kB gzip), not an error.
- `npm run lint` (frontend, oxlint) → 0 errors, 9 warnings (all pre-existing, see §3.6).

---

## 1. Executive Summary

The codebase is in good structural health. Clean Architecture boundaries are genuinely respected
(verified via `.csproj` references, not just folder names), the DB-level concurrency guard on task
assignment is correctly implemented, exception→HTTP-status mapping is centralized and consistent,
and `CancellationToken` discipline is solid throughout the backend. The frontend has zero `any`/
`@ts-ignore` usage and clean hook cleanup (no MapLibre/SignalR listener leaks found).

The critical work before introducing auth is concentrated, not scattered: **the backend has no
authentication scheme registered at all** (`app.UseAuthorization()` runs with no
`app.UseAuthentication()`, so adding a bare `[Authorize]` today would throw at request time), and
**the frontend has no token-carrying infrastructure** (`httpClient.ts` is an 8-line unconfigured
axios instance, the SignalR connection is a bare module-level singleton with no
`accessTokenFactory`, and there is no router/protected-route primitive since `react-router-dom` was
previously removed as unused). Neither gap is a sign of poor engineering — auth was explicitly out
of scope until now — but both are hard blockers, not incremental tweaks.

Two secondary items are worth resolving in the same pass as auth, since they compound the risk of
auth-related bugs: unclear TypeScript `strict`/`strictNullChecks` status on the frontend (a new
`token: string | null` surface is exactly where a missing null-check bites), and the complete
absence of a top-level loading/error boundary on the frontend (a 401 today would render
indistinguishably from "no data yet," which is confusing for an operator and would delay noticing
an auth regression).

No Critical findings block *starting* auth work; the two Critical items above are exactly the work
the auth project needs to do first.

---

## 2. Component Health Scores

Scored 1 (poor) – 5 (excellent) against general engineering health, not auth-readiness
specifically. Auth-readiness is scored separately in §5.

| Component | Score | Notes |
|---|---|---|
| Backend — Clean Architecture boundaries | 5/5 | No violations found in `.csproj` reference graph. |
| Backend — EF Core / data access | 4/5 | `AsNoTracking()` used consistently; real DB-level concurrency guard; no optimistic concurrency tokens on `FieldUnit`/`Incident` (minor gap). |
| Backend — SignalR Hub | 3/5 | Functionally solid coarse-broadcast pattern; hub body is empty (no auth, no connection lifecycle hooks, no reconnect-storm mitigation). |
| Backend — REST API consistency | 5/5 | Thin controllers, centralized exception handling, consistent status codes, full `CancellationToken` threading. |
| Backend — External services (OSRM) | 3/5 | Correctly built (no command injection, CT-aware, sane fallback) but shells out to `curl` as a subprocess — a portability risk for containerized deployment, and no retry/circuit-breaker. |
| Backend — Test coverage | 1/5 | No test project exists in the solution. |
| Frontend — Feature modularity | 5/5 | Structure consistently applied; no encapsulation violations found. |
| Frontend — React Query usage | 3/5 | No global `staleTime`/`onError` config; SignalR invalidation list is well-maintained but has no enforcement mechanism to keep it in sync as query keys grow. |
| Frontend — Custom hooks / MapLibre lifecycle | 5/5 | Cleanup, refs, and dependency arrays all correct; no leaks found. |
| Frontend — CSS / design system | 4/5 | BEM + CSS custom properties consistently applied; desktop-only, no mobile breakpoint pattern exists (not necessarily a defect, but relevant to a new login screen). |
| Frontend — TypeScript type safety | 3/5 | Zero `any`/`@ts-ignore` in practice, but `strict` mode is not explicitly enabled in `tsconfig.app.json` — the discipline is by convention, not compiler-enforced. |
| Frontend — Test coverage | 1/5 | No test runner configured. |

---

## 3. Findings by Category

### 3.1 Critical

| # | Area | Finding | Impact |
|---|---|---|---|
| C-1 | Backend / Program.cs | `app.UseAuthorization()` is called with **no** `app.UseAuthentication()` and no authentication scheme registered anywhere (`AddAuthentication(...)` is absent from both Api's `DependencyInjection` and Infrastructure's). Adding `[Authorize]` to any controller or `OperationsHub` today throws `InvalidOperationException: No authentication handler is configured` at request time. | This is the single concrete blocker for JWT rollout. Must add `AddAuthentication().AddJwtBearer(...)` and insert `app.UseAuthentication()` before `app.UseAuthorization()`. |
| C-2 | Frontend / shared/lib | No token-carrying infrastructure exists: `httpClient.ts` has zero interceptors, `signalRConnection.ts`'s `HubConnectionBuilder` has no `accessTokenFactory`, and the connection is a **module-level singleton** created once outside React — there's no clean seam to swap in a token on login or tear down/reconnect on logout without restructuring the module into a factory. | Auth work cannot attach a bearer token to REST or SignalR traffic without first refactoring these two files; the SignalR singleton pattern specifically needs a design decision (factory + reset-on-logout) before implementation starts. |

### 3.2 Major

| # | Area | Finding | Impact |
|---|---|---|---|
| M-1 | Backend / SignalR Hub | `OperationsHub.cs` has an empty body — no `OnConnectedAsync` override, no connection tracking, no per-connection auth context once JWT lands. SignalR's browser client needs the token passed via querystring (`accessTokenFactory`) since the default `Authorization` header doesn't survive the WebSocket upgrade — this is easy to get wrong on first attempt. | Plan the Hub auth wiring explicitly; don't assume `[Authorize]` alone is sufficient — SignalR auth has its own transport quirks. |
| M-2 | Backend / OSRM integration | `OsrmRoutingService` shells out to the `curl` binary via `Process.Start` rather than using `HttpClient` directly (a documented TLS-handshake workaround). This creates a hard runtime dependency on `curl` being present on PATH in every deployment environment. | Should be resolved (or at minimum documented as a deployment prerequisite) before any containerized/production rollout — a minimal container image may not ship `curl`. Independent of auth, but worth fixing in the same hardening pass. |
| M-3 | Backend / OSRM integration | No Polly retry/circuit-breaker around the OSRM subprocess call; a sustained OSRM outage means every request pays the full 3–4s timeout with no backoff or failure caching. | Latent latency/availability risk under OSRM degradation; not auth-related but worth flagging as tech debt. |
| M-4 | Backend / Program.cs, secrets | No secrets-manager scaffolding exists in `Api`/`Infrastructure` (`incident-generator` has a `UserSecretsId`; the other two projects don't). A JWT signing key needs a real home (env var / user-secrets / key vault) before auth lands, and none exists today. | Decide the JWT signing-key storage strategy as an explicit first step of the auth project, not an afterthought. |
| M-5 | Backend / incident-generator | `Worker.cs` POSTs to the API with a bare, unauthenticated `HttpClient`. Once `[Authorize]` lands on `IncidentsController`, this worker will need a service-account credential (client-credentials JWT or static API key); zero scaffolding for that exists today (`IncidentGeneratorOptions` only holds `ApiBaseUrl`/`IntervalSeconds`). | Auth rollout must include a machine-to-machine auth path for the generator, or it will silently start failing every POST once the incidents endpoint is protected. |
| M-6 | Backend / Program.cs | `app.UseHttpsRedirection()` is commented out — the API is HTTP-only today. Bearer tokens sent over plain HTTP in any non-local deployment are interceptable. | Not blocking for local dev auth work, but must be revisited before any non-local deployment carries real JWTs. |
| M-7 | Frontend / TypeScript config | `tsconfig.app.json` does not explicitly set `strict: true` or its constituent flags (`strictNullChecks`, `noImplicitAny`, etc.). Given TypeScript 5's default of `strict: false` when unset, the codebase is very likely compiling **without** compiler-enforced null safety — its current cleanliness (zero `any`, minimal `!`) is a matter of developer discipline, not a compiler guarantee. | Should be verified and, ideally, turned on before writing new auth state (`token: string | null`, decoded-claims types) — exactly the kind of surface where a missed null-check causes either a crash or, worse, a silently-unauthenticated request treated as authenticated. |
| M-8 | Frontend / app/hooks/useOperationsData.ts | The hook that feeds nearly the entire dashboard reads only `data` from every `useQuery` call (defaulting to `[]` on undefined); `isLoading`/`isError`/`error` are never surfaced at this level. There is no top-level "app still loading" or "backend unreachable" screen anywhere in the app. | A 401 on initial load after auth lands would render as an empty, quiet dashboard — indistinguishable from "no incidents yet" — with no visible signal to the operator that they need to log in. An app-level loading/error boundary should be added alongside auth, not deferred. |
| M-9 | Frontend / routing | `react-router-dom` was previously removed as an unused dependency (per project history) and no client-side router exists. A login screen / protected-route gate has no existing routing primitive to attach to. | Needs an explicit decision: reintroduce a router, or build a custom conditional-render gate in `App.tsx` consistent with the existing menu-overlay/replay-mode pattern. Either is viable; it just needs to be decided up front rather than improvised mid-implementation. |
| M-10 | Frontend / React Query | The global `QueryClient` (`app/providers.tsx`) has zero configuration — no `staleTime`, `gcTime`, or shared `onError`/`retry`. There is currently no chokepoint for a uniform "401 response → force logout" reaction across all queries/mutations. | Auth will need either a shared `onError` on the `QueryClient` defaults or an axios response interceptor (see C-2) as the single place a 401 is handled app-wide; today neither exists. |

### 3.3 Minor

| # | Area | Finding | Impact |
|---|---|---|---|
| N-1 | Backend / data model | No optimistic concurrency tokens (`[Timestamp]`/rowversion) on `FieldUnit` or `Incident`. The task-assignment race is already closed by a DB-level partial unique index (correct, see §4), but two simultaneous plain edits to the same entity outside that path (e.g. two concurrent `PATCH /field-units/{id}/status` calls) could still lost-update. | Low practical impact today given the coarse-grained SignalR broadcast UX naturally serializes most operator actions; worth a future ticket, not urgent. |
| N-2 | Backend / OSRM integration | CLAUDE.md's development log states a "required User-Agent header" is sent by `OsrmRoutingService`; the current `RunCurlAsync` implementation does not pass an explicit `-H "User-Agent: ..."` flag (curl's own default `User-Agent: curl/x.x` is what's actually sent, and evidently satisfies OSRM's public server). | Documentation/code drift — harmless today, but worth correcting the doc or adding the explicit header to match intent. |
| N-3 | Backend / SignalR | Broadcasts are fully coarse-grained (`Clients.All`, single `"OperationsUpdated"` event, no payload, no per-client filtering) — a deliberate design choice per project docs. Under high event frequency this causes every connected client to refetch ~10 query keys per mutation. | Not a bug at current traffic scale; flagged as a scaling consideration, and relevant to auth in that a future per-operator or per-role broadcast filter would need connection-level identity, which the Hub doesn't currently track at all (see M-1). |
| N-4 | Frontend / React Query | `operational-zones` and `operations-snapshot` query keys are fetched but never invalidated by the `OperationsUpdated` SignalR handler. Zones are documented as time-invariant, so this is likely intentional. | If zones or snapshots ever become mutable via a future admin UI, this becomes a stale-data bug; worth an explicit code comment recording the intent now while it's still correct. |
| N-5 | Frontend / operations-map | `useIncidentMarkers.ts` fully tears down and recreates all incident markers on every `incidents` array change, unlike `useFieldUnitMarkers.ts`'s incremental diff-based update. | Minor perf inefficiency at scale; not a correctness bug. |
| N-6 | Frontend / oxlint | 9 pre-existing lint warnings, all `react(refs)` (accessing `.current` during render in 6 map/layer hooks) and `react(set-state-in-effect)` (3 occurrences in `useRestrictedZoneForm.ts` and `useReplayController.ts`). Zero lint **errors**. | Cosmetic/best-practice warnings, not bugs — listed here for completeness since the task asked to verify lint/build state; no action required before auth work. |

### 3.4 Suggestions

| # | Area | Finding |
|---|---|---|
| S-1 | Frontend / feature structure | No barrel exports (`index.ts`) or lint rule enforces feature encapsulation; today's cross-feature imports are clean, but nothing prevents drift as an `auth` feature is added and inevitably becomes a dependency of many others. Worth deciding where shared auth state/hooks live (`shared/` vs. a new `features/auth/`) before the first import happens. |
| S-2 | Frontend / CSS | The app is desktop-only (only 4 stylesheets use `@media` at all, no mobile drawer pattern). Not a defect for an ops-center dashboard, but a new full-page login screen is the first view rendered before the rest of the app, so it should be checked at common viewport widths independently of the rest of the (intentionally desktop-first) UI. |
| S-3 | Backend / EF Core | `IncidentService`'s resolved-last ordering (`OrderBy(dto => dto.Status == IncidentStatus.Resolved.ToString() ? 1 : 0)`) runs client-side on already-materialized DTOs rather than in SQL — correct and safe today, just worth knowing it's post-materialization if the list grows large enough to matter. |
| S-4 | Backend / testing | Formalize the "no backend test project" gap as an explicit tracked item (it already is, per project docs) — auth logic (token validation, claims mapping, role checks) is exactly the kind of code that benefits most from unit tests, so standing up a minimal test project alongside the auth work (rather than before or after) is a reasonable place to finally close this gap. |

### 3.5 What's Already Solid (no action needed)

- Clean Architecture dependency direction is genuinely respected end-to-end, verified at the `.csproj` level, not just by convention.
- The field-unit task-assignment concurrency race is correctly closed via a partial unique DB index (`IX_OperationalTasks_FieldUnitId_ActiveAssignment`, filtered `WHERE Status = 'Assigned'`) plus a `PostgresErrorCodes.UniqueViolation` catch → `ResourceConflictException` (409) — this is the right way to handle this class of race and needs no rework.
- Exception → HTTP status mapping is centralized in `DomainExceptionHandler` and consistently used; no controller bypasses it with ad-hoc try/catch.
- `CancellationToken` is threaded correctly from controller → service → EF Core / external HTTP calls throughout every path sampled, including the OSRM subprocess call (linked token source, kills the process tree on cancellation).
- `OsrmRoutingService`'s subprocess invocation uses `ProcessStartInfo.ArgumentList` (not a concatenated shell string) with `UseShellExecute = false` — no command injection risk despite spawning `curl`.
- CORS policy is appropriately scoped to explicit localhost origins (not wildcarded), so layering bearer-token auth on top requires no CORS rework.
- Frontend MapLibre/SignalR hook lifecycle management is clean throughout — `map.remove()` on unmount, correct marker/source/layer diffing and cleanup, no stale-closure bugs found in any of the 7 hooks reviewed.
- Zero `any`/`@ts-ignore`/`@ts-expect-error` usage anywhere in the frontend; the 5 non-null assertions found are all narrow and local.
- No frontend test runner and no backend test project are pre-existing, known, already-tracked gaps — not new findings, confirmed still accurate.

### 3.6 Build/Lint Verification Detail

- `dotnet build Src/SmartCityOps.sln`: 0 Warnings, 0 Errors, all 5 projects (Domain, Application,
  Infrastructure, Api, IncidentGenerator) built successfully.
- `npm run build` (frontend): `tsc -b && vite build` succeeded; only Vite's standard advisory about
  the `maplibre-vendor` chunk exceeding 500 kB (pre-existing, documented in project history as an
  accepted tradeoff — MapLibre is lazy-loaded so this doesn't affect initial load).
- `npm run lint` (frontend, oxlint): 0 errors, 9 pre-existing warnings (see N-6).

---

## 4. Auth Integration Impact Assessment

### 4.1 Backend surfaces requiring `[Authorize]`

| Surface | Current state | Work required |
|---|---|---|
| 8 REST controllers (`IncidentsController`, `FieldUnitsController`, `OperationalTasksController`, `RestrictedZonesController`, `OperationalZonesController`, `FieldUnitLocationHistoriesController`, `FieldUnitRecommendationsController`, dashboard/statistics controller) | No `[Authorize]`/`[AllowAnonymous]` on any of them — fully open today. | Register JWT bearer auth (C-1) before adding `[Authorize]` anywhere, or every protected request will 500 instead of 401. |
| `OperationsHub` (SignalR) | Empty body, no auth, no connection lifecycle hooks. | Needs `[Authorize]` + SignalR's querystring-token transport handling (M-1) — not a drop-in of the same REST pattern. |
| `incident-generator` worker | Unauthenticated `HttpClient` POST loop, no credential scaffolding. | Needs a service-account / client-credentials flow or static API key path (M-5) or it breaks the moment incidents endpoints are protected. |

### 4.2 Frontend surfaces requiring auth wiring

| Surface | Current state | Work required |
|---|---|---|
| `shared/lib/httpClient.ts` | 8-line bare axios instance, no interceptors. | Add request interceptor (attach bearer token) and response interceptor (401 → logout/redirect) — greenfield, not a retrofit. |
| `shared/lib/signalRConnection.ts` | Module-level singleton `HubConnection`, no `accessTokenFactory`. | Restructure into a factory that accepts a token getter; needs explicit reset-on-logout handling (C-2). |
| Routing / route protection | No router exists (`react-router-dom` previously removed). | Decide: reintroduce a router, or build a custom `App.tsx`-level gate (M-9). |
| Auth state storage | No context/provider exists in `app/providers.tsx`. | New `AuthProvider`/context needed; decide token storage (memory vs. `localStorage`/cookie) as part of the design, not an afterthought. |
| App-level loading/error UX | None exists (`useOperationsData.ts` swallows `isLoading`/`isError`). | Add a top-level boundary so a 401 is visibly distinguishable from "no data yet" (M-8). |

### 4.3 Secret management, token lifetime, PBKDF2 considerations

- No secrets-manager pattern exists in `Api`/`Infrastructure` today (M-4) — establish where the JWT
  signing key lives (env var / `dotnet user-secrets` for dev, a real secret store for any
  non-local deployment) before writing the token-issuance code.
- `appsettings.Development.json`'s Postgres connection string is committed in plaintext — low risk
  as a local-only dev credential, but confirms there is no precedent for secret redaction in this
  repo; the JWT signing key should not follow that same pattern once it leaves local dev.
- HTTPS is currently disabled (`UseHttpsRedirection()` commented out, M-6) — acceptable for local
  dev where bearer tokens only traverse `localhost`, but must be revisited before any deployment
  carries real tokens over the network.
- No operator/identity/password-hashing code exists yet anywhere in the codebase (confirmed no
  `PBKDF2`, `Rfc2898DeriveBytes`, `BCrypt`, or `Identity` references in `Src/`) — this is fully
  greenfield work, not a migration from a weaker existing scheme.

---

## 5. Auth-Readiness Checklist

Ordered roughly by dependency (top items unblock the ones below them).

- [ ] **Backend:** Register a JWT bearer authentication scheme (`AddAuthentication().AddJwtBearer(...)`) and insert `app.UseAuthentication()` before `app.UseAuthorization()` in `Program.cs` (C-1).
- [ ] **Backend:** Decide and implement JWT signing-key storage (env var / user-secrets locally, a real secret store beyond local dev) (M-4).
- [ ] **Backend:** Design operator identity model (new entity/table, PBKDF2 or equivalent password hashing) — currently fully greenfield.
- [ ] **Backend:** Design the `incident-generator` machine-to-machine auth path (service credential or API key) before protecting incident-creation endpoints (M-5).
- [ ] **Backend:** Add SignalR-specific auth wiring to `OperationsHub` (querystring token transport, not just `[Authorize]`) (M-1).
- [ ] **Backend:** Re-enable `app.UseHttpsRedirection()` before any non-local deployment carries real tokens (M-6).
- [ ] **Frontend:** Add request/response interceptors to `httpClient.ts` (token attach, 401 handling) (C-2).
- [ ] **Frontend:** Restructure `signalRConnection.ts` from a bare singleton into a token-aware factory with logout-reset support (C-2).
- [ ] **Frontend:** Decide routing strategy for a login screen / protected routes (reintroduce a router vs. custom `App.tsx` gate) (M-9).
- [ ] **Frontend:** Add an `AuthProvider`/context and decide token storage strategy (M-9 related).
- [ ] **Frontend:** Add a top-level loading/error boundary so an unauthenticated state is visibly distinct from "no data yet" (M-8).
- [ ] **Frontend:** Verify/enable `strict`/`strictNullChecks` in `tsconfig.app.json` before writing new nullable auth-state types (M-7).
- [ ] **Frontend:** Wire a shared 401 → logout reaction, either via the interceptor (above) or a global `QueryClient` `onError` (M-10).
- [ ] **Cross-cutting (non-blocking, do in the same hardening pass if convenient):** Replace `OsrmRoutingService`'s `curl` subprocess dependency with a direct `HttpClient` call, or document `curl` as a required deployment prerequisite (M-2).
- [ ] **Cross-cutting (non-blocking):** Stand up a minimal backend test project, prioritizing coverage of the new auth logic (S-4).

---

## 6. Methodology

This report was produced via two parallel, read-only source-level investigations (backend and
frontend), cross-referenced against `CLAUDE.md`'s development log for historical context, then
independently verified for the two required build/lint commands. No files were modified. File:line
references cited by the investigating agents were spot-checked against the current repository
state before inclusion; findings are stated as of 2026-08-31 and should be re-verified if
significant time passes before the auth project begins.
