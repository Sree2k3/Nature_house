# Nature House — Local Development Architecture and Implementation Design

**Status:** Implementation design for local development; no deployment is planned or authorized  
**Product:** Public plant and aquarium catalog with a local owner/staff admin portal  
**Runtime target:** Node.js running Next.js App Router on the developer's machine  
**Persistence target:** Local PostgreSQL is authoritative for structured data; local filesystem media store is authoritative for images  
**External services:** No server-side external services. WhatsApp and Maps links are user-initiated browser links only. Use local/bundled fonts so page rendering does not depend on Google Fonts availability.  
**Supersedes:** The deployment, Supabase Auth/Storage, Vercel Edge, and zero-cost-hosting assumptions in the earlier version of this document.

This design translates the audit into an implementation contract for a coding agent. It describes intended local behavior and boundaries, not deployed infrastructure. Do not deploy, provision cloud services, access production data, or add cloud credentials as part of implementation.

## 1. Goals and non-goals

### Goals

- Make the local application reliable across server restarts.
- Make the database the single source of truth for catalog, schedule, and admin account records.
- Ensure an API reports success only after the durable operation succeeds.
- Replace public reset-secret disclosure and source-defined admin defaults with a local bootstrap/reset workflow.
- Store image bytes as files outside the source tree and store only metadata/references in PostgreSQL.
- Keep the product’s current Nature House visual identity and improve accessibility of implemented controls.
- Keep local page rendering usable without a network request for fonts or imagery; use existing local font assets or system fallbacks.
- Keep the implementation straightforward for one local application instance and a modest catalog.

### Non-goals for this work

- Cloud deployment, DNS, SSL provisioning, hosted database setup, cloud object storage, CDN, edge runtime, autoscaling, or production monitoring.
- Claiming production security/compliance or the performance targets in older docs.
- Building online email delivery for password recovery. Local credential recovery is an operator CLI action.
- Rewriting the public catalog or introducing a cart, payments, customer accounts, or an unrelated visual redesign.

## 2. Binding architecture decisions

1. **One top-level app.** The active project is `/mnt/d/Nature_House`; `nature-house-app/` is a scaffold and is not part of the running product unless the owner later says otherwise. Do not copy product code into it.
2. **Node runtime only.** Database, filesystem, password hashing, and media route code must execute in Node.js, not Edge Runtime.
3. **Local PostgreSQL is authoritative.** Use the existing `pg` dependency and `DATABASE_URL`. No silent fallback to mock data or runtime JSON for successful mutations.
4. **Local filesystem is authoritative for image bytes.** Store files under a configurable local data directory, defaulting to `var/media` under the project root. This directory must be ignored by Git. Do not put user uploads in `public/`, `src/data`, or generated build output.
5. **Custom local admin auth remains server-side.** Admin accounts are persisted in PostgreSQL. No public registration and no public password-reset code/token response. Initial setup and recovery use explicit local CLI commands.
6. **No provider-specific cloud integration.** Supabase SDK, hosted auth, buckets, service-role keys, Vercel caching, and cloud provisioning are out of scope. If a later deployment is requested, revisit this architecture before implementing that work.
7. **No silent mock fallback in normal app mode.** Mock catalog fixtures may be used only through an explicit test/demo adapter. Missing DB configuration should fail clearly for admin/data operations and show a safe user-facing unavailable state.
8. **No deploy step.** Build/test locally only as authorized by the implementation task. Never deploy or connect this code to a hosted service.
9. **Local network boundary.** The development server should bind to loopback (`127.0.0.1`/`localhost`) by default. Do not bind to all interfaces or expose the admin portal to a LAN without an explicit later request.

## 3. Target topology

```mermaid
flowchart LR
  Browser[Local browser] --> Next[Next.js Node server]
  Next --> Auth[Admin auth service]
  Next --> Catalog[Catalog and schedule services]
  Auth --> PG[(Local PostgreSQL)]
  Catalog --> PG
  Next --> Media[(Local media directory outside source tree)]
  Browser -->|WhatsApp / Maps link after user action| External[User's installed app or website]
```

Public reads and admin writes both pass through the Next.js server. The browser never connects directly to PostgreSQL or the media directory. Every admin API mutation authenticates and authorizes on the server. `pg` connection credentials remain server-side.

## 4. Module boundaries and target tree

Keep existing route/component locations where possible. Introduce small modules to separate persistence, validation, auth, and media concerns:

```text
src/
  app/
    api/
      admin/
        auth/login/route.ts
        auth/logout/route.ts
        plants/route.ts
        aquariums/route.ts
        schedule/route.ts
        media/route.ts              # authenticated upload/delete coordination
      catalog/route.ts              # optional JSON refresh endpoint
      schedule/route.ts             # public schedule read
    media/[mediaId]/route.ts        # safe local media streaming by UUID
  lib/
    db.ts                           # pool/configuration/errors only
    auth.ts                         # password/session primitives
    authService.ts                  # account lookup, login, role, lockout
    catalogService.ts               # domain operations only; DB-backed
    scheduleService.ts              # domain operations only; DB-backed
    mediaStore.ts                   # validated local file read/write/delete
    validations.ts                  # request schemas and normalization
    errors.ts                       # safe domain/API error mapping
  types/
    catalog.ts
    api.ts                           # shared request/response types if useful
scripts/
  db-migrate.mjs                    # apply versioned local migrations
  admin-create.mjs                  # interactive bootstrap/add account
  admin-reset.mjs                   # local interactive password reset
database/
  migrations/                       # ordered, immutable migrations
  seed.local.sql                     # optional deterministic demo fixture
var/media/                           # runtime uploads; ignored by Git
```

Names can be adjusted to existing conventions, but each responsibility must have one clear owner. Do not leave persistence and domain logic entangled in the same service merely to preserve old fallback behavior.

### Layer responsibilities

- **Route handlers:** parse request, authenticate/authorize, validate input, call one service operation, map typed result to HTTP status, and return a documented response. No SQL/file implementation here.
- **Services:** enforce business rules and coordinate DB/media operations. Return typed success or domain failure; do not swallow errors.
- **Database module:** own pool lifecycle, query execution, and transaction helper. Do not return ambiguous `null` for query failure.
- **Media store:** validate UUID-derived paths, enforce size/type policy, write atomically, and never accept an arbitrary filesystem path from a request.
- **UI components:** collect/display state and call APIs. Client validation improves usability but never replaces server validation.
- **Fonts/assets:** use existing checked-in font files in `src/app/fonts` where appropriate and retain system fallbacks. Do not add runtime Google Fonts `@import` dependency for the local-only app.

## 5. Data model and migrations

Use ordered SQL migrations recorded in a `schema_migrations` table. A migration is applied once, in order, inside a transaction when PostgreSQL supports transactional execution of its statements. Never run ad hoc schema-and-seed setup against a database implicitly.

### Structured data

Retain the existing `categories`, `plants`, `aquariums`, and `site_settings` concepts, with these changes:

- Add `admin_accounts`: UUID primary key, normalized unique email, display name, role, password hash, active flag, token/session version, created/updated timestamps. Never seed real credentials or a default password.
- Add `login_attempts` only if persistent local throttling is needed; store a normalized account key and time-window counters, not plaintext passwords. A simple local single-process limiter may remain in memory only if explicitly treated as best-effort, but it must not be described as distributed/production protection.
- Add `media_assets`: UUID, relative storage key, validated MIME type, byte size, width, height, checksum, creation time. Records reference this row (e.g. `image_id`) instead of embedding a data URL in `image_url`.
- Add constraints for non-negative prices and physically sensible numeric values. Keep dimensions as structured fields if the UI needs to search/filter them; if dimensions remain descriptive text, validate format at the service boundary.
- Add an availability state only after selecting clear semantics. Minimum safe initial states: `in_stock` and `out_of_stock`; do not overload out-of-stock to mean made-to-order. Keep existing booleans if minimizing migration risk, but make the UI copy consistent.
- Add `updated_at` triggers through versioned migrations. Do not use unsupported `CREATE POLICY IF NOT EXISTS` syntax.

### Database access policy

The local app server is the only DB client. Use a dedicated local application role with only the schema/table privileges the app needs; do not connect as a superuser in routine app operation. Since the browser does not access PostgreSQL, PostgreSQL RLS is not the primary authorization boundary in this local design. API authorization is mandatory. Do not claim Supabase RLS behavior unless a future hosted architecture actually implements it.

## 6. Local admin authentication design

### Account provisioning

- No default admins/passwords in source or seed files.
- Add an interactive local CLI bootstrap command that prompts for email, name, role, and password without echoing the password. Require an explicit confirmation before creating the first account.
- Add a separate CLI password reset command. It should identify an existing account, prompt securely for a new password twice, update the persisted hash and increment `token_version`, and print no secret material.
- Do not expose account creation or password reset through public anonymous routes. Remove/disable the existing public reset page/API as part of implementation.
- Never read `.env.local` and echo its contents. Environment loaders must not log values.

### Password storage

Use a built-in Node crypto password KDF (`scrypt` with a random salt and documented parameters; no new dependency is needed). Store an algorithm/version marker, salt, work parameters, and derived hash. Use constant-time comparison and reject malformed hashes. Do not use a static salt or a shared default hash. Require at least 12 characters for newly set passwords, permit long passphrases (at least 128 characters), do not silently trim passwords, and never log them.

### Session

- `SESSION_SECRET` is required; no source fallback. For local setup, provide a documented command to generate a random secret and place it in the developer’s ignored local environment file without printing it after generation.
- Signed payload contains only account ID, issued-at, expiry, and token version. Resolve current account/role from PostgreSQL during verification; do not trust a role embedded in a long-lived token.
- Set `httpOnly`, `sameSite: 'strict'` where compatible, `secure: false` for plain local HTTP only, `path: '/'`, and an explicit bounded lifetime. If local HTTPS is later used, set `secure: true`.
- Check account active state and token version on each protected request. Password reset increments token version, invalidating prior sessions.
- Logout is a POST operation that expires the cookie with matching path/same-site attributes. Do not use GET for state-changing logout.
- Keep external response messages generic for login failures. Record limited, non-sensitive auth events without password, token, or reset data.
- Require same-origin checks for cookie-authenticated write requests in addition to SameSite behavior.

### Role enforcement

Define the local role matrix before implementing role-sensitive UI. If all local staff are equally privileged for now, use one explicit `admin` role rather than implying unimplemented owner/botanist/manager restrictions. If roles remain distinct, enforce permissions in services/API handlers, not only by hiding buttons.

## 7. Media lifecycle (local filesystem)

### Upload contract

1. Admin selects a file. Client can resize/compress to reduce upload time, but server validates independently.
2. Client posts `multipart/form-data` to authenticated `POST /api/admin/media`.
3. Server enforces an input byte limit, decodes/validates supported image content, rejects SVG and non-image payloads, checks actual MIME/signature, enforces max dimensions/output bytes, and normalizes orientation where supported.
4. Server generates UUID and safe extension. It writes to a temporary file within the media directory, flushes/closes it, then atomically renames to final name.
5. Server inserts metadata row in PostgreSQL. If DB insert fails, remove the just-written file. If file write fails, insert no DB row.
6. Return `{ media: { id, url, mimeType, width, height, bytes } }`; never return base64.

For local implementation, select a modest input/output policy and centralize it in config (for example: input up to 12 MiB; normalized longest edge up to 1600 px; output target below 1 MiB). These are starting limits to measure, not product guarantees. Report the chosen values in UI and tests.

### Storage path safety

- Default root: `var/media`, overridable only by a server environment variable such as `NATURE_HOUSE_MEDIA_DIR`.
- Resolve root to an absolute path once at startup; reject paths outside that root.
- Derive file names solely from validated UUIDs plus a server-selected extension. Never join a request-provided path.
- Do not expose directory listing or arbitrary file reads.
- Serve via `/media/[mediaId]`: validate UUID, look up metadata, verify resolved path remains inside root, stream file with allowlisted MIME, `X-Content-Type-Options: nosniff`, and a safe cache policy. Do not accept a user-supplied filesystem path.
- Keep uploaded media out of Git, `.next`, and the public source tree. Document local backup/restore manually; no automated cloud backup is part of this phase.

### Update/delete behavior

- Upload replacement media first; update the catalog reference transactionally; only after DB commit, remove the old media file/row. If old file removal fails, keep a cleanup record/log and report the catalog update as committed with cleanup pending (do not claim complete purge).
- For catalog delete, first fetch the record and media ID; delete the DB row transactionally, then remove local file. Because PostgreSQL and filesystem cannot share one transaction, use a small `media_cleanup_queue` table or durable cleanup state. Retry cleanup through an explicit local maintenance command. Do not lose the media key before cleanup is recorded.
- UI distinguishes `saved`, `saved; old image cleanup pending`, and `failed` states.

## 8. API contracts

Use JSON for catalog/schedule records and multipart only for media bytes. Responses must not leak DB errors, filesystem paths, tokens, or stack traces.

| Route | Method | Auth | Contract |
|---|---|---|---|
| `/api/admin/auth/login` | POST | Anonymous, rate limited | `{ email, password }` → generic success or generic 401; sets session cookie |
| `/api/admin/auth/logout` | POST | Session optional | Expires session cookie; no GET mutation |
| `/api/admin/plants` | GET | Admin | Returns validated plant records |
| `/api/admin/plants` | POST | Admin | Validated create DTO; returns record only after DB commit |
| `/api/admin/plants` | PUT | Admin | `{ id, ...allowedPatch }`; reject unknown fields; distinguish 404 from DB failure |
| `/api/admin/plants?id=...` | DELETE | Admin | Delete record and enqueue/remove media; response accurately reports cleanup state |
| `/api/admin/aquariums` | GET/POST/PUT/DELETE | Admin | Same guarantees, aquarium-specific schema |
| `/api/admin/media` | POST | Admin | multipart file; returns media ID and local URL, never data URL |
| `/media/[mediaId]` | GET | Public catalog media only | UUID lookup and safe stream; no path parameter |
| `/api/admin/schedule` | GET/POST | Admin | Enumerated actions with per-action validation; durable DB writes |
| `/api/schedule` | GET | Public | Optional validated month/year; bounded values and consistent timezone |
| `/api/catalog` | GET | Public | Keep only if client refresh is still needed; no-store until a deliberate local cache model exists |

Use stable error envelopes such as `{ error: { code, message, fieldErrors? } }`. Map validation to 400, unauthenticated to 401, unauthorized role to 403, missing record to 404, conflict to 409, payload too large to 413, and unexpected persistence errors to a generic 500 with a correlation ID. Do not return internal exception messages.

### Validation rules

- Parse JSON and verify top-level object shape.
- Normalize email once; validate length/format and use case-insensitive uniqueness.
- Trim strings and cap per-field length.
- Require `Number.isFinite(price)` and `price >= 0`; validate glass thickness/volume ranges and dimensions.
- Validate booleans as booleans; do not coerce arbitrary strings via `Boolean(value)`.
- Validate image reference as a known media UUID or known safe placeholder; reject `data:` URLs for new writes after migration.
- For schedule, validate exact date formats, start ≤ end, allowed status values, and supported month/year bounds. Use `Asia/Kolkata` as the product timezone only if the owner confirms it; otherwise define a configured timezone in one place.
- Use allowlisted update mapping; never pass untrusted request object directly into domain state.

## 9. UI and interaction implementation design

### Cards and availability

- Make image/detail activators semantic `<button>` controls with visible keyboard focus. Keep WhatsApp CTA as a distinct button/link so nested actions do not conflict.
- Use a canonical availability state and one formatting helper for plant cards, aquarium cards, detail modal, admin toggle, and WhatsApp message. Initial scope may remain two-state (`in_stock`/`out_of_stock`); use “made to order” only if represented separately in data.
- Ensure stock toggle disables while pending, reverts on server error, and announces result with an accessible status region.

### Dialogs

All modal/lightbox/form/delete dialogs must:

- Have `role="dialog"`, `aria-modal="true"`, an accessible title, and description when needed.
- Move focus to a sensible first control on open; keep Tab/Shift+Tab inside; close on Escape where safe; restore focus to the opener.
- Preserve and restore the exact prior `document.body.style.overflow` value rather than always setting `unset`.
- Keep close controls visible and named. Confirm destructive operations with the item identity and explain irreversible consequences.
- Respect reduced motion; transitions must not delay access or lock focus.

### Form/save states

- Server validation is authoritative. Show field-level errors and preserve entered data after recoverable failure.
- Prevent duplicate submissions while saving.
- Distinguish uploading media, saving record, success, partial cleanup, and failure.
- Do not show a success toast until durable DB commit is confirmed.
- Keep mobile forms usable with the software keyboard open and on short viewport heights; avoid inaccessible nested scroll regions.

### Visual direction

Retain current warm linen/forest/aquarium palette, existing typography direction, and card structure. Do not rebrand. Make only evidence-supported refinements: availability clarity, consistent status colors, accessible focus, stable image placeholders, and clearer save/error feedback. Verify visually at 360×800, 393×852, tablet, desktop, and 200% zoom before making broader style changes.

## 10. Cache and local performance design

There is no CDN or edge cache in this phase. Prefer simple correctness:

- Keep catalog reads dynamic while admin writes are being stabilized.
- Remove redundant client refresh polling if server-rendered data and focus refresh are duplicative; if retained, document when it runs and test stale-state behavior.
- Use DB indexes for actual query ordering/filtering. Current expected catalog is small; do not add caching infrastructure without measured need.
- Use stable media URLs based on media UUID, fixed aspect ratios, width/height metadata, and lazy loading for below-the-fold cards.
- Measure local response size, DB query count, image size, and interaction responsiveness after media changes. Do not claim 100–200 concurrency readiness or Lighthouse scores from local source inspection.

## 11. Error handling and observability (local)

- Define typed errors (`ValidationError`, `NotFoundError`, `ConflictError`, `PersistenceError`, `MediaError`, `UnauthorizedError`). Map once at route boundaries.
- Log request/correlation ID, route, operation, duration, and safe error category. Never log passwords, cookies, session tokens, reset material, full data URLs, or SQL credentials.
- Return generic errors to the browser; local server log may contain sanitized stack traces with no secrets.
- Add health check only if useful for local development; it must report no credentials and should distinguish DB unavailable without exposing host/password.
- Pool connections must be released in `finally`; use transaction helper with rollback and release on error.

## 12. Implementation sequence for a coding agent

The coding agent must implement in dependency order and stop to report any ambiguity that changes data meaning. Do not deploy.

### Step 1 — Establish local baseline and safe tests

- Read repository instructions, inspect Git status if available, inspect scripts before execution, and preserve local data.
- Identify whether a local PostgreSQL instance is available without printing `.env.local` values. Do not connect to an unknown or hosted database.
- Add isolated test configuration using a disposable local test database and temporary media root. Never run destructive tests against a developer’s normal database or media directory.

### Step 2 — Schema and DB error model

- Add versioned migrations for admin accounts/media metadata/cleanup state and any required catalog references.
- Replace ad hoc setup behavior with explicit migration command and safe local seed command.
- Add transaction and typed query errors; keep SQL parameterized.
- Fix plant insert placeholders and create repository-level tests before switching service paths.

### Step 3 — Auth remediation

- Introduce persisted admin service and CLI bootstrap/reset commands.
- Require `SESSION_SECRET`; remove static password/signing fallbacks.
- Replace public reset route/page with local CLI recovery; remove secret-returning API behavior.
- Implement session expiry/version/revocation, generic login errors, role enforcement, and same-origin checks.
- Add auth unit/route integration tests before proceeding.

### Step 4 — Durable catalog and schedule services

- Make PostgreSQL the sole normal runtime source of truth.
- Remove successful mutation behavior that relies on `globalThis`/JSON fallback.
- Migrate `scheduleService` read/write behavior to DB and validate dates/actions.
- Add create/update/delete/restart persistence tests for both catalogs and schedule.

### Step 5 — Local media pipeline

- Add local media store, upload route, safe serving route, media metadata, and cleanup queue.
- Migrate existing runtime records containing data URLs only after a backup of local database and source data; keep the migration repeatable and report counts, not image contents.
- Update forms to upload binary data and persist media IDs/URLs. Remove old data URL behavior after migration tests pass.
- Add file validation, failure cleanup, and deletion tests.

### Step 6 — API/UI integration and accessibility

- Add request schemas and stable error mapping to all admin routes.
- Update UI to use accurate mutation states and canonical availability.
- Fix semantic card controls and shared accessible dialog lifecycle.
- Add component/browser tests for keyboard, responsive layout, save failures, and duplicate submit prevention.

### Step 7 — Local verification and docs reconciliation

- Run only targeted tests against disposable local resources; record exact commands and outcomes.
- Run type/lint/build checks only if safe and explicitly within task scope.
- Update README, `.env.example`, `RUNBOOK.md`, `DATABASE.md`, `SECURITY_PRIVACY.md`, `API.md`, and this architecture to remove Supabase/Vercel/production claims that do not apply to local-only work.
- Report changed files, migration/data impact, tests, unverified areas, and explicit statement that nothing was deployed.

## 13. Test and acceptance matrix

| Layer | Required local acceptance |
|---|---|
| Migration | Clean disposable DB applies all migrations; re-run behavior is controlled; schema version recorded |
| Auth | No default account; CLI bootstrap/reset persists; no anonymous reset secret; token expiry/version revocation works |
| API authorization | Every admin endpoint returns 401 without session; role permissions enforced where roles differ; origin checks reject cross-origin write |
| Catalog | Plant/aquarium CRUD round trips; database failure returns error; no local fallback false success |
| Schedule | Actions validated and durable after service restart; dates use one timezone/range policy |
| Media | Upload validates bytes/type/size; DB stores metadata only; route cannot traverse paths; failed DB/file operations compensate safely |
| Delete | DB record and media cleanup state consistent; retry cleanup works; UI does not claim uncompleted purge |
| UI accessibility | Card actions keyboard-operable; dialogs trap/restore focus; errors/status are announced; reduced motion supported |
| Responsive | No horizontal overflow at specified viewport sizes and 200% zoom; admin forms usable with mobile keyboard |
| Performance | Record local measured payload, image sizes, query count, and key interaction timings; do not compare to cloud targets as if deployed |

## 14. Local configuration contract

Keep `.env.example` local-only and minimal. It should contain placeholders, never real credentials:

```env
DATABASE_URL=postgresql://nature_house_app:change-me@127.0.0.1:5432/nature_house
SESSION_SECRET=generate-a-random-secret-locally
NATURE_HOUSE_MEDIA_DIR=./var/media
NATURE_HOUSE_TIME_ZONE=Asia/Kolkata
```

The example value for `SESSION_SECRET` is an instruction placeholder, not a usable secret; generate a random local value. The implementation must validate required config and print variable names/errors only, never their values. `DATABASE_SSL` is off for local loopback unless local PostgreSQL is explicitly configured for TLS. Do not include Supabase/Vercel values in the active local contract.

## 15. Future deployment boundary

Deployment is not part of the current task. Before any future deployment, create a separate architecture decision for hosted PostgreSQL, object storage, secrets, email/account recovery, DB migrations, backup/restore, TLS, cache invalidation, rate limiting, logging, and operational ownership. The local filesystem adapter must not be assumed to work across serverless instances. The code should keep a narrow `MediaStore` interface so a future adapter can be designed, but do not implement or configure a hosted adapter now.

## 16. Complete implementation checklist

This checklist names the implementation deliverables. Checking a box means the coding agent changed and verified the application; this design document does not mean the item is already implemented. Implement in dependency order from Section 12 and report any item that cannot be completed.

### Repository, configuration, and database

- [ ] Keep the top-level app as the only active application. Leave `nature-house-app/` untouched as an inactive scaffold.
- [ ] Bind the local Next.js server to loopback by default.
- [ ] Replace mixed local/Supabase environment documentation with the local variables in Section 14. Validate variable presence without printing values.
- [ ] Add a versioned migration runner and `schema_migrations` ledger. Make it explicit, local-only, and safe against accidental hosted DB URLs.
- [ ] Add migrations for admin accounts, media metadata/references, and media-cleanup state. Correct the plant/aquarium schema and indexes as required by actual query patterns.
- [ ] Remove invalid/redundant policy statements from the local schema. Do not claim Supabase RLS in this architecture.
- [ ] Add an explicit opt-in local demo seed. Do not create default admin accounts or passwords.
- [ ] Implement DB transaction/query helpers with typed failure outcomes, rollback, client release, and sanitized logging.
- [ ] Fix plant INSERT parameter mapping and check row counts in every create/update/delete operation.
- [ ] Stop using runtime JSON, `globalThis`, or mock data as implicit normal runtime persistence. Retain mock fixtures only behind explicit test/demo selection.
- [ ] Move catalog, categories, store settings, schedule notices, and studio broadcast persistence to PostgreSQL.

### Authentication and authorization

- [ ] Add persisted admin account provisioning and role model. If differentiated roles are not required, remove misleading unused roles and use one admin role.
- [ ] Add interactive local admin-create and admin-reset CLI commands with hidden password input and safe output.
- [ ] Remove the source default password hash, static admin identities, fallback session signing key, and unused `ADMIN_PASSWORD` contract.
- [ ] Require a randomly generated local `SESSION_SECRET`; fail closed if absent or invalid.
- [ ] Implement versioned salted password hashing with Node `scrypt`, constant-time verification, password length rules, and hash format versioning.
- [ ] Implement signed sessions with explicit expiry, account ID, active-account lookup, token/session version check, explicit cookie options, and password-reset revocation.
- [ ] Add server-side authorization to every admin page/API operation. Add same-origin checks for cookie-authenticated mutations.
- [ ] Make login failures externally generic; add a bounded local login throttle and safe auth audit events.
- [ ] Remove the public password-reset UI and API flow. No anonymous endpoint may return reset material or change a password.
- [ ] Make logout POST-only and expire the session cookie using matching attributes.

### Media and catalog workflow

- [ ] Implement `MediaStore` local filesystem adapter rooted at `var/media` or configured local directory, outside source/public/build output and ignored by Git.
- [ ] Add authenticated multipart upload API with request byte limits, content-signature/MIME validation, dimension limits, normalization, UUID filenames, atomic writes, and compensation if DB metadata insert fails.
- [ ] Add PostgreSQL media metadata and catalog foreign-key/reference fields. Never store a data URL or image bytes in catalog JSON/DB text.
- [ ] Add UUID-only media serving route with path containment, MIME allowlist, `nosniff`, safe cache headers, and no directory listing.
- [ ] Replace both admin forms’ FileReader/base64 persistence with upload-then-save flow. Client compression may reduce transfer, but server checks remain authoritative.
- [ ] Implement media replacement and item deletion lifecycle, including durable cleanup state, retry command, accurate partial-success responses, and orphan reconciliation.
- [ ] Update cards/detail/admin UI to use local media URLs, stable aspect ratio, dimensions, lazy-loading where appropriate, and graceful missing-image placeholder.
- [ ] Migrate existing base64 images and catalog records with dry-run, staging directory, counts/checksums, idempotence, backup, and rollback. Do not delete old sources automatically.

### API, schedule, and user-visible states

- [ ] Add runtime schemas for plant, aquarium, media, schedule notice, and broadcast DTOs. Reject unknown update fields, wrong types, invalid numeric ranges, excessive strings, and oversized bodies.
- [ ] Map validation, auth, not-found, conflict, media, and DB failures to stable HTTP status/error envelopes. Do not leak internals.
- [ ] Make create/update/delete responses correspond to committed DB state. Distinguish DB failure from missing row and return affected-row evidence.
- [ ] Replace schedule JSON persistence with PostgreSQL operations; validate action names, date ranges, and year/month inputs. Centralize timezone policy.
- [ ] Define a canonical availability state and use consistent labels/CTAs across cards, detail modal, admin, and WhatsApp text. Keep two-state behavior unless owner requirements add made-to-order.
- [ ] Remove or justify duplicate catalog focus polling; retain dynamic local freshness without introducing CDN/ISR infrastructure.
- [ ] Add truthful upload/save/error/cleanup feedback and prevent duplicate form submissions. Roll back optimistic UI state on failed requests.

### Accessibility, visuals, and local operations

- [ ] Make card image/detail actions semantic, keyboard-operable controls with visible focus.
- [ ] Implement shared accessible dialog behavior: dialog semantics, labels, initial focus, focus containment/restoration, Escape, and prior scroll-lock restoration.
- [ ] Announce validation, asynchronous saves, stock changes, and failures to assistive technology.
- [ ] Respect reduced-motion preference and use local/bundled font files or system fallback; remove runtime Google Fonts dependency.
- [ ] Verify public and admin flows at 360×800, 393×852, tablet, desktop, and 200% zoom. Preserve the Nature House design language.
- [ ] Add sanitized structured local logs and optional safe DB health status. Never log credentials, cookies, reset data, or image data.
- [ ] Document local DB/media backup and restore without running it against user data. No cloud backup/deployment is part of this phase.

### Verification and completion

- [ ] Create isolated local test DB and temporary media root; prove tests cannot target hosted or normal user data.
- [ ] Add unit/integration tests for auth, migration, catalog/schedule CRUD, DB failure handling, media validation/cleanup, and API authorization.
- [ ] Add component/browser tests for card keyboard operation, dialogs/focus, mobile forms, validation, save failures, and duplicate submissions.
- [ ] Add local performance measurements for query count, response size, image size, and interaction timing; do not claim cloud capacity or production readiness.
- [ ] Reconcile README, DATABASE, API, RUNBOOK, SECURITY_PRIVACY, TESTING_QA, TRD, `.env.example`, and this document with implemented local behavior.
- [ ] Report changed files, data migration and rollback, exact test commands/results, limitations, and explicitly state that nothing was deployed.
