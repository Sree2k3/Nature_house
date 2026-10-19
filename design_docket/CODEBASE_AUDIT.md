# Nature House — Deep Engineering Audit

**Audit mode:** Read-only source review  
**Repository:** `/mnt/d/Nature_House`  
**Scope:** Top-level Next.js application, nested scaffold, data/auth services, API routes, UI components, SQL, scripts, manifests, and project documentation  
**Runtime validation:** Not performed; reasons are documented below  
**Original audit:** Read-only; no application files or data were changed.  
**Follow-up documentation design:** `design_docket/Architecture.md` and this report were updated to define a local-only implementation target.

**Current owner direction (supersedes earlier unknown-status notes):** Work is for local development only. There is no deployment currently, and no deployment, cloud provisioning, production migration, or live-system change is part of the implementation. The binding target design is in [Architecture.md](Architecture.md). It selects local Node.js + local PostgreSQL for structured data, a local filesystem media adapter outside the source tree, and local CLI-based admin bootstrap/reset. Any later deployment requires a separate architecture decision.

## 1. Executive summary

Nature House is intended to be a public plant and aquarium catalog with a private inventory and store-notice admin portal. The top-level app is implemented in Next.js 14/React 18/TypeScript with Tailwind, Framer Motion, `pg`, and browser-side image handling.

The largest concern is the mismatch between older deployment-focused docs and the implementation. The current owner direction resolves the target for this work: local Node.js app, local PostgreSQL as the source of truth, local filesystem media, and no deployment. The top-level source currently uses custom HMAC authentication, direct PostgreSQL queries, local JSON files, and in-memory fallbacks. Image processing stores a data URL as the `image_url` value; no implemented media file upload/delete flow was found in the inspected paths.

### Highest-risk findings

1. **Password reset is takeover-prone:** the unauthenticated reset initiation returns both the signed reset token and verification code to the caller.
2. **Authentication has source-defined defaults:** the code contains a default password hash and HMAC signing fallback. If local configuration is missing or incorrect, these defaults may allow admin login or session forgery by someone able to reach the app.
3. **Plant database inserts are malformed:** the SQL uses 14 parameters but the call supplies 15. Errors are swallowed and the system proceeds with local state.
4. **Mutations can falsely report success:** database errors resolve to `null`, yet services update memory/files and routes return success.
5. **Runtime files and process memory compete with PostgreSQL as local application persistence:** this can cause false-success writes and divergent inventory/schedule state.
6. **The claimed storage purge is not implemented in the catalog delete path:** deleted records can leave media behind, and the UI/API claim more than they do.
7. **Photos are embedded as base64 JPEG data URLs:** this conflicts with the intended optimized local media-store design and increases request, database, and page payload size.

Treat admin authentication and local data integrity as the first implementation priorities. No deployment is currently planned.

## 2. Product purpose and verified stack

### Product intent

Repository documentation describes:

- Public browsing of nursery plants and handcrafted aquariums.
- Product detail/photo inspection, category filtering, WhatsApp inquiries, and store directions.
- Mobile-first owner workflows for adding/editing inventory, stock toggles, photos, and store notices.
- Low operating cost and roughly 100–200 concurrent active visitors.

Those are product goals from documentation, not measured runtime outcomes.

### Technology evidence

- Top-level `package.json`: Next.js 14.2, React 18, TypeScript, Tailwind CSS, Framer Motion, `pg`, and `browser-image-compression` listed as a dependency.
- `src/app`: App Router pages and Route Handlers.
- `src/lib/db.ts`: PostgreSQL pool based on `DATABASE_URL`.
- `database/schema.sql` and `database/seed.sql`: PostgreSQL schema and seed.
- `src/components/admin/*`: admin inventory/calendar UI; image processing is implemented with FileReader/canvas in the inspected form files, rather than the listed compression package.
- `nature-house-app/`: a separate, minimal create-next-app scaffold with its own package manifests and generic README; it does not contain the product functionality and is not wired into the root scripts.

### Architecture mismatch and implementation direction

`DATABASE.md`, `RUNBOOK.md`, and `SECURITY_PRIVACY.md` retain old Supabase/Vercel assumptions. For current implementation work, follow [Architecture.md](Architecture.md): top-level app only, local PostgreSQL, local media directory, local CLI auth bootstrap/reset, and no cloud services. Do not use the old RLS/deployment assertions as evidence about the local app. Reconcile the remaining documents after implementation, without adding deployment configuration.

## 3. Repository and architecture map

```text
Public route: src/app/page.tsx
  → catalogService: PostgreSQL queries + runtime JSON/memory fallback
  → CatalogClient and catalog components
  → /api/catalog refresh endpoint
  → WhatsApp, maps, images

Admin route: src/app/admin/page.tsx
  → custom HMAC cookie verification in src/lib/auth.ts
  → AdminDashboardClient / CalendarManager
  → /api/admin/* handlers
  → catalogService / scheduleService
  → PostgreSQL and/or local JSON/memory state
```

### Key files

- Routes: `src/app/page.tsx`, `src/app/admin/page.tsx`, `src/app/admin/login/page.tsx`, `src/app/admin/reset-password/page.tsx`.
- APIs: `src/app/api/catalog/route.ts`, `src/app/api/schedule/route.ts`, `src/app/api/admin/{login,logout,reset-password,plants,aquariums,schedule}/route.ts`.
- Services: `src/lib/{auth,db,catalogService,scheduleService,storeHours,whatsapp}.ts`.
- UI: `src/components/*`, `src/components/admin/*`.
- Data: `src/data/mockCatalog.ts`, `src/data/runtimeCatalog.json`, `src/data/runtimeSchedule.json`.
- Database: `database/schema.sql`, `database/seed.sql`.
- Scripts: `scripts/e2e-all-phases-test.js`, `scripts/test-all-connectivity.js`, `scripts/verify-all-loading.js`, `scripts/setup-db.mjs`.
- Docs: `design_docket/*` and root README.

No `AGENTS.md` was found under the repository file search. Git status could not be obtained: Git reports the directory is not a repository across the mounted filesystem boundary even though a `.git` directory is present. No attempt was made to repair or alter Git metadata.

## 4. Critical user journeys

### Browse and inquire

`src/app/page.tsx` loads catalog data server-side and passes it to `CatalogClient`. The client refreshes `/api/catalog` on focus/visibility with a cooldown. Cards and detail components provide item information, image inspection, and WhatsApp links.

### Admin login and mutations

The login form posts to `/api/admin/login`. `src/lib/auth.ts` checks an in-memory admin list and creates a signed session cookie. Admin pages and API routes call `verifyAdminSession()`. Inventory mutations call the catalog service, which attempts PostgreSQL and also mutates local runtime state.

### Store notices/calendar

The admin schedule API calls `scheduleService` and then revalidates page paths. Schedule persistence writes `src/data/runtimeSchedule.json` and attempts a fire-and-forget database sync. Public schedule reads from the service’s in-process/file state.

### Image flow

The plant and aquarium forms read the selected file as a data URL, resize it using a canvas, encode JPEG at quality 0.82, and include the entire data URL in the `imageUrl` field sent to the inventory API. This differs from the local binary media-store design in `Architecture.md` and from the older superseded Supabase Storage docs.

## 5. Findings

Severity uses P0–P4 from the audit prompt. **Confirmed** means the behavior is established by source; deployment impact may still depend on configuration. No live attack, DB mutation, or runtime reproduction was performed.

### NH-SEC-01 — Public password reset returns the token and verification code

- **Severity/confidence/status:** P1 High / High / Confirmed by source
- **Category:** Authentication, security
- **Affected:** `src/app/api/admin/reset-password/route.ts:13–45`; `src/lib/auth.ts:291–344`
- **Evidence:** The unauthenticated `verify-email` action calls `requestPasswordReset()` and returns `resetToken` and `verificationCode` in the JSON response. Both values are also derivable from the signed payload structure in `auth.ts`.
- **Trigger/impact:** Anyone who knows an authorized admin email can call the endpoint, obtain both recovery factors, and submit a new password. This defeats the intended identity verification and can grant full admin access.
- **Root cause:** The API treats knowledge of the email as identity proof and sends recovery material to the same requester rather than a separate trusted channel.
- **Remediation:** Remove the public reset page/API from the local app. Provide a local interactive CLI reset command that updates the persisted password hash and increments a session version. Return no recovery secret to HTTP callers; keep generic login errors and safe local audit events.
- **Complexity/dependencies:** Medium; implement the local auth and CLI contract in `Architecture.md`.
- **Regression risks:** Staff who forget a password must have access to the local developer/operator environment to reset it. This project has no email recovery requirement in the current no-deployment phase.
- **Verification:** Confirm anonymous reset endpoints are absent/disabled; CLI reset updates the account; previous sessions fail; no password/token appears in logs.

### NH-SEC-02 — Default password and HMAC signing fallback are source-defined

- **Severity/confidence/status:** P1 High / High / Confirmed by source; practical exposure depends on whether the local app is reachable by another user and whether defaults are active
- **Category:** Authentication, secret management
- **Affected:** `src/lib/auth.ts:17–19, 53–97`; `.env.example` documents `ADMIN_PASSWORD` and `SESSION_SECRET`.
- **Evidence:** Source defines an initial password hash (with a comment identifying its corresponding default password), default admin identities, and a fallback session signing secret. Search of `src` did not find code reading `ADMIN_PASSWORD`.
- **Trigger/impact:** Missing or misconfigured local environment values leave known defaults active. A known signing secret can be used to produce a syntactically valid session token for an authorized account. The configured password variable appears not to override the hash.
- **Remediation:** Remove all authentication defaults from source. Validate required secrets at startup and fail closed. Provision unique admin credentials through a secure mechanism; persist credential updates. Rotate any signing key previously used in a live environment.
- **Complexity/dependencies:** Medium; implement the local account/session design in `Architecture.md`.
- **Verification:** Startup fails when secrets are absent; no source-known credential authenticates; generated tokens signed with incorrect keys are rejected. Keep secrets redacted in test output.

### NH-SEC-03 — In-memory throttling and auth state are not shared or durable

- **Severity/confidence/status:** P2 Medium / High / Confirmed by source
- **Category:** Authentication reliability and abuse prevention
- **Affected:** `src/lib/auth.ts:80–104, 224–284, 330–337, 415–432`
- **Evidence:** Admin registry, reset state, and login attempts use `globalThis`, `Map`, or module/process memory. Password reset updates the in-memory admin record only.
- **Trigger/impact:** Restarts reset lockouts and credential updates. This is a consistency/security weakness even for local development; multi-instance consequences apply only if a future deployment is designed.
- **Remediation:** Store admin credentials in local PostgreSQL, use a bounded local throttling policy, and implement session versioning for password changes. Do not adopt a managed identity provider in this local phase.
- **Complexity/dependencies:** Medium; see local auth design in `Architecture.md`.
- **Verification:** Local DB tests prove credentials persist across app restart and reset invalidates previous sessions; verify throttling behavior and generic errors.

### NH-DATA-01 — Plant INSERT supplies 15 values for a 14-placeholder statement

- **Severity/confidence/status:** P1 High / High / Confirmed by source
- **Category:** Functional correctness, database persistence
- **Affected:** `src/lib/catalogService.ts:211–239`
- **Evidence:** SQL placeholders end at `$14` (`:217–221`); the parameter array contains 15 values (`:223–238`). The extra `imageUrl` shifts subsequent field values.
- **Trigger/impact:** PostgreSQL rejects plant creation. The exception is caught and creation proceeds using local state, masking the failure.
- **Remediation:** Match every column to exactly one correctly ordered placeholder and parameter. Use a query builder or typed DB function if it prevents recurring positional mistakes.
- **Complexity/dependencies:** Low.
- **Verification:** Against a disposable DB, create a plant and read it back; assert every field including image URL and stock fields. Add a negative DB-failure case.

### NH-DATA-02 — Persistence errors are converted into successful-looking changes

- **Severity/confidence/status:** P1 High / High / Confirmed by source
- **Category:** Data integrity and API reliability
- **Affected:** `src/lib/db.ts:45–66`; `src/lib/catalogService.ts` create/update/delete methods; `src/app/api/admin/plants/route.ts:28–75, 82–110, 117–148`; aquarium equivalents.
- **Evidence:** `query()` catches DB errors and returns `null`. Create methods ignore the result, update methods ignore it, and delete methods can continue into local state. API handlers then respond with `success: true` for returned service objects.
- **Trigger/impact:** Database outage, malformed SQL, missing schema, or permissions failure can result in admin UI success while the authoritative record was not written. Restart/another instance may lose or contradict the change.
- **Remediation:** Make DB service results explicit (success/error/rows affected). In the current local app, PostgreSQL is the structured-data source of truth; return an appropriate error if persistence fails. Keep fixture/demo fallback behind an explicit adapter, not as implicit normal runtime behavior.
- **Complexity/dependencies:** Medium; coordinate with NH-OPS-01.
- **Verification:** Inject DB unavailable, constraint violation, and missing-row cases. Assert appropriate HTTP status, no false toast, and unchanged UI data unless confirmed persisted.

### NH-OPS-01 — Filesystem and process memory compete with PostgreSQL as application persistence

- **Severity/confidence/status:** P2 Medium for the current local-only target / High / Confirmed implementation
- **Category:** Data durability, deployment architecture
- **Affected:** `src/lib/catalogService.ts:53–115`; `src/lib/scheduleService.ts:20, 56–97`
- **Evidence:** Catalog and schedule load JSON under `src/data`, write with `fs.writeFileSync`, and keep process-level cached state. Schedule DB sync is fire-and-forget and ignores failures.
- **Trigger/impact:** The local machine can retain JSON files, but the app combines PostgreSQL rows with independent JSON and process-memory records. A DB write failure can still produce success in the UI, and reads merge divergent copies. Restart behavior depends on which path contains the latest copy. Serverless consequences are a future risk only; deployment is not currently planned.
- **Remediation:** Follow the local-only target in `design_docket/Architecture.md`: local PostgreSQL for structured catalog/schedule data, local media directory for images, and no JSON/process-memory fallback in normal runtime. Treat persistence failures as failures. Do not configure cloud storage in this phase.
- **Complexity/dependencies:** Medium/high; requires a safe local-data migration plan.
- **Verification:** Persistence tests against a disposable local database across process restart; verify normal application reads do not merge runtime JSON or memory fallback.

### NH-DATA-03 — Delete routes claim storage purge without performing it

- **Severity/confidence/status:** P2 Medium / High / Confirmed in inspected path
- **Category:** Data integrity, privacy/retention
- **Affected:** `src/lib/catalogService.ts:329–349, 567–587`; plant API `:131–142`; aquarium API equivalent; `src/components/admin/DeleteConfirmModal.tsx` and dashboard confirmation toast.
- **Evidence:** Service deletion issues SQL row deletion and local filtering; the inspected code does not delete an image file. The endpoint and UI say the image was purged from storage.
- **Trigger/impact:** In the target local media design, deleting a catalog row without deleting its file leaves an orphan. Staff receive an inaccurate confirmation.
- **Remediation:** Implement the local `MediaStore` interface in `design_docket/Architecture.md`; delete by media ID, durably record cleanup state, and report partial completion accurately. Add a local cleanup/reconciliation command.
- **Complexity/dependencies:** Medium; depends on the local media metadata migration.
- **Verification:** Test DB row/file deletion, missing file behavior, filesystem permission failure, retry, and reported result.

### NH-PERF-01 — Image “compression” stores base64 JPEG data URLs in catalog records

- **Severity/confidence/status:** P2 Medium / High / Confirmed by source
- **Category:** Performance, data modeling, product requirement mismatch
- **Affected:** `src/components/admin/PlantFormModal.tsx:103–155, 194–207`; `AquariumFormModal.tsx:106–158, 197–221`; catalog insert/update fields in `src/lib/catalogService.ts`.
- **Evidence:** Browser code uses FileReader and canvas `toDataURL('image/jpeg', 0.82)`, then sends the full data URL as `imageUrl`. It does not produce WebP in the inspected path and does not upload a file to media storage. Fallback paths can retain the original data URL. The dependency list includes `browser-image-compression`, but these forms use their own canvas code.
- **Trigger/impact:** Image bytes are base64-encoded inside JSON and stored in a text column, increasing request and DB payload size. The data URL is then passed to public page rendering, so catalog responses and server-rendered HTML can become large. A 25 MB input cap is not an API payload/storage policy. This conflicts with the docs’ object-storage/CDN model and can affect mobile performance and DB growth.
- **Remediation:** Upload binary images through the local `MediaStore` adapter defined in `design_docket/Architecture.md`; store only a media ID/metadata reference in PostgreSQL. Convert to a supported optimized format with explicit dimensions and quality; validate MIME from decoded content, enforce server-side limits, and remove orphaned files on failed record creation. Do not rely on client compression as a security boundary. Cloud object storage is out of scope.
- **Complexity/dependencies:** Medium/high; define local media directory and migrate existing data URLs safely.
- **Verification:** Test accepted/rejected file types, payload size limits, upload recovery, resulting format/dimensions, DB metadata only, mobile bandwidth and page payload benchmarks.

### NH-DB-01 — Schema contains likely invalid `CREATE POLICY IF NOT EXISTS` syntax

- **Severity/confidence/status:** P1 High / Medium-high / Probable; not executed against PostgreSQL
- **Category:** Database setup/deployment
- **Affected:** `database/schema.sql:108–118`; `scripts/setup-db.mjs:41–53`
- **Evidence:** Four policies use `CREATE POLICY IF NOT EXISTS`. Standard PostgreSQL `CREATE POLICY` syntax does not include an `IF NOT EXISTS` clause. Setup executes the full schema and then seed; a syntax error aborts setup.
- **Impact:** Fresh schema setup may stop before RLS policies are created, blocking reproducible local or hosted setup.
- **Remediation:** Use a version-compatible idempotent migration approach (e.g. inspect policy catalog in a guarded block, or versioned migrations). Keep schema changes transactional where supported.
- **Complexity/dependencies:** Low/medium; confirm local PostgreSQL version.
- **Verification:** Apply schema/migrations to a disposable local PostgreSQL instance and confirm tables, triggers, indexes, and required grants exist. No hosted DB is in scope.

### NH-API-01 — Admin payload validation is incomplete

- **Severity/confidence/status:** P2 Medium / High / Confirmed by source
- **Category:** Data quality, API correctness
- **Affected:** `src/app/api/admin/plants/route.ts:34–62`; `src/app/api/admin/aquariums/route.ts:34–63`; corresponding PUT handlers.
- **Evidence:** Required-field checks rely on truthiness; values are then converted using `Number()` or `.trim()`. There is no shared schema validation for finite/non-negative prices, dimensions, string limits, supported categories, booleans, or URL/data-URL size.
- **Trigger/impact:** Malformed types can throw or persist invalid values; `NaN`/negative prices or huge image data can pass parts of the flow. Client validation does not protect direct API calls.
- **Remediation:** Add a server-side schema per item type and action. Normalize input once, cap body/string/image sizes, reject invalid types/ranges, and allowlist update fields rather than passing raw request bodies to service methods. Follow the precise field policy in `Architecture.md`.
- **Complexity/dependencies:** Medium.
- **Verification:** Boundary tests for missing, wrong type, oversized, negative, non-finite, unknown-field, and valid payloads.

### NH-API-02 — Schedule API accepts out-of-range year/month values

- **Severity/confidence/status:** P3 Low / High / Confirmed by source
- **Category:** API correctness
- **Affected:** `src/app/api/schedule/route.ts:12–24`; calendar generation in `src/lib/scheduleService.ts`.
- **Evidence:** `parseInt` output is used without checking `NaN`, month range, year bounds, or trailing invalid input.
- **Impact:** Malformed query strings can return nonsensical calendar metadata or unexpected date calculations.
- **Remediation:** Validate integer syntax and supported range; return `400` for invalid query parameters.
- **Verification:** Test month -1/12, non-number, huge year, empty parameter, and valid edge months.

### NH-AUTH-04 — Session cookie and account lifecycle need explicit policy

- **Severity/confidence/status:** P2 Medium / Medium / Probable risk
- **Category:** Security, session management
- **Affected:** `src/app/api/admin/login/route.ts:29–44`; `src/lib/auth.ts:442–500`; logout API.
- **Evidence:** Signed payload lifetime is seven days; cookie has `httpOnly`, `sameSite: lax`, and production `secure`, but no explicit `maxAge`/`expires`. Verification checks signature, expiration, and currently authorized email, but there is no durable revocation/version check. Logout clears the client cookie only.
- **Impact:** Session lifetime/revocation semantics may differ from intended policy; password change or incident response cannot reliably revoke tokens before expiry unless signing secret is rotated.
- **Remediation:** Define absolute/idle timeout, explicit cookie lifetime, session version or server-side revocation, and rotation procedure. Ensure cookie deletion attributes match issuance attributes.
- **Complexity/dependencies:** Medium; auth architecture decision.
- **Verification:** Test expiry, logout, password change revocation, required secret behavior, and cookie attributes in local HTTP configuration.

### NH-ARCH-01 — Admin route uses Referer/session query as a secondary “challenge”

- **Severity/confidence/status:** P3 Low / High / Confirmed by source
- **Category:** Architecture, UX/security boundary clarity
- **Affected:** `src/app/admin/page.tsx:25–42`; login page `src/app/admin/login/page.tsx:47–49`.
- **Evidence:** After cryptographic session verification, `/admin` also gates rendering on a Referer containing `/admin` or a `session=active` query parameter. The query value is not itself a secret or auth factor.
- **Impact:** Referer is an unreliable navigation signal and can be absent or altered; the check complicates normal navigation without strengthening the session boundary. Admin API authorization remains the meaningful boundary.
- **Remediation:** Use authentication state only. Remove navigation-history heuristics and keep all data protection in server routes and API handlers.
- **Complexity/dependencies:** Low.
- **Verification:** Test direct navigation, refresh, browser back/forward, and missing Referer while unauthenticated/authenticated.

### NH-A11Y-01 — Interactive image areas are clickable non-interactive `div`s

- **Severity/confidence/status:** P2 Medium / High / Confirmed by source
- **Category:** Accessibility, usability
- **Affected:** `src/components/PlantCard.tsx:41–46`; `AquariumCard.tsx:43–48`.
- **Evidence:** The photo container has an `onClick` and pointer cursor but is a `div` without keyboard role/tab stop. It opens the detail modal for pointer users only.
- **Impact:** Keyboard and switch users cannot activate the item detail from that control; semantics do not convey action.
- **Remediation:** Use a real button with an accessible name around the image/action, preserving card layout and avoiding nested interactive controls. Ensure focus styling is visible.
- **Complexity/dependencies:** Low.
- **Verification:** Keyboard-only test can tab to each item action and open it with Enter/Space; automated accessibility check flags no non-semantic click handler.

### NH-A11Y-02 — Dialogs do not show focus containment/restoration or dialog semantics

- **Severity/confidence/status:** P2 Medium / High / Confirmed static-code observation
- **Category:** Accessibility
- **Affected:** `src/components/PhotoLightbox.tsx:52–102`; `ItemDetailModal.tsx:55–69`; `CalendarModal.tsx:101–139`.
- **Evidence:** Inspected dialogs close on Escape and lock body scrolling, but do not show `role="dialog"`/`aria-modal`, focus initial placement, tab containment, or focus restoration in the inspected implementation.
- **Impact:** Keyboard and screen-reader users may lose context or move focus behind the overlay.
- **Remediation:** Standardize a shared accessible dialog primitive or implement equivalent semantics/focus lifecycle. Restore focus to the opener and preserve prior body overflow state on unmount.
- **Complexity/dependencies:** Medium.
- **Verification:** Keyboard and screen-reader walkthrough for open, tab, Escape, close, and return focus; test nested/rapid open-close cases.

### NH-UI-01 — Card stock messaging appears inconsistent with product semantics

- **Severity/confidence/status:** P2 Medium / Medium / Probable from source
- **Category:** UX and business correctness
- **Affected:** `src/components/AquariumCard.tsx:69–77`; relevant item detail/WhatsApp text in `src/components/ItemDetailModal.tsx` and `src/lib/whatsapp.ts`.
- **Evidence:** Aquarium cards show “Studio Tested” when in stock and “Bespoke Order” when not in stock; plant cards use “Nursery Ready” and “Sold Out”. The docs describe explicit in-stock/sold-out state and restock inquiry behavior.
- **Impact:** “Bespoke Order” can be read as an available custom order rather than an out-of-stock item. Confirm intended business wording and align card, details, and WhatsApp CTA.
- **Remediation:** Use explicit availability labels and action text, e.g. available now vs. made-to-order/restock inquiry only when those states exist as distinct data.
- **Complexity/dependencies:** Low; product owner confirms availability states.
- **Verification:** Acceptance tests for each stock/order state and consistent copy across card, modal, and generated inquiry.

## 6. Security and privacy summary

Positive controls observed: admin API routes generally call `verifyAdminSession`; the session cookie is `httpOnly`; production cookie issuance enables `secure`; SQL values are mostly parameterized; `next.config.mjs` sets frame, MIME sniffing, referrer, and permissions headers.

Remaining risks:

- Reset flow and source defaults are highest risk (NH-SEC-01/02).
- Login/reset throttling is process-local (NH-SEC-03).
- Role claims are carried in the session, but inspected mutation handlers do not make role-specific decisions. Confirm whether roles should be distinct.
- The docs claim Supabase RLS posture, but the app’s actual connection identity and RLS behavior are unverified.
- Security docs describe a CSP, but the inspected `next.config.mjs` does not configure one. Do not add a CSP blindly: first inventory fonts, images, scripts, and required inline styles/scripts, then test in report-only mode.
- The login endpoint returns different error messages for unknown emails vs failed passwords, enabling account enumeration (source: `auth.ts` validation messages and login route). Prefer consistent external responses while retaining safe internal audit signals.

## 7. Backend, API, and database summary

- PostgreSQL queries mostly use bind parameters, but creation has the plant-specific bind mismatch.
- Database errors are swallowed at the shared helper boundary and create false success in callers.
- Catalog service reads all rows, with no pagination. Current intended inventory is small (150–250), so profile before adding complexity; response bloat from inline images is a more immediate issue.
- Delete uses SQL by UUID, but the service also uses local fallback state. It does not transactionally coordinate DB and external media cleanup.
- `database/schema.sql` includes RLS policies and indexes, but compatibility and actual runtime role are unverified.
- `src/lib/db.ts` sets `ssl: { rejectUnauthorized: false }` when `DATABASE_SSL=true`. This disables certificate verification; confirm whether this is intended for the target provider. Prefer provider-specific SSL configuration that validates certificates.
- Connection pool is `max: 10` per process; aggregate connection count under serverless scale is not bounded by that one setting. Establish expected instance concurrency and provider limits before declaring it sized for 100–200 visitors.

## 8. Frontend and visual design review

Source indicates deliberate styling (biophilic colors, plant/aquarium accent colors, rounded cards, 4:3 images, loading skeletons, modals, and motion). No browser or screenshot inspection was performed, so no claims about actual visual alignment, clipping, contrast ratios, or responsive behavior are made.

### Recommended coherent improvement direction

Keep the existing Nature House identity. Improve clarity and resilience through:

1. **Availability system:** one explicit status model shared by plant/aquarium cards, details, admin controls, and WhatsApp message generation. Separate “sold out”, “made to order”, and “available now” only if the business actually supports those distinctions.
2. **Accessible overlays:** consistent modal surface with title, description, close control, focus trap, focus return, Escape support, and preserved scroll state.
3. **Image-first catalog performance:** render local media route URLs with known width/height/aspect ratio, responsive sizes, appropriate lazy loading, and a stable placeholder. Avoid base64 data URLs in page props.
4. **Admin publishing feedback:** show a clear progress and durable-save confirmation only after both media and record writes succeed; on partial failure, offer retry/cleanup rather than claiming success.
5. **Mobile admin ergonomics:** retain large touch controls and predictable sticky actions; validate on short viewport heights and 200% zoom, especially in form modals with long content.

Do not replace the design system until real browser review identifies specific problems. For a visual pass, inspect at 360×800, 393×852, tablet width, desktop, and 200% zoom, and capture public catalog, detail modal, lightbox, admin list, and both admin forms.

## 9. Performance and scalability

### Confirmed implementation concerns

- Inline base64 photo data can inflate DB rows, API JSON, SSR props, HTML/RSC payloads, and client memory (NH-PERF-01).
- `/api/catalog` and the home page are dynamic/no-store (`src/app/page.tsx`, API route), while docs claim ISR/edge caching. The implementation does not match the documented read-heavy cached architecture.
- Catalog loading runs multiple queries concurrently for each page/API refresh; category/store query counts and request frequency have not been measured.
- Image resizing uses browser canvas and data URL conversion, which allocates full image representations in memory. The documented Web Worker compression is not what these form handlers implement.
- `max: 10` pool is per process. For the current single local app, check the pool against local PostgreSQL limits; cross-instance pool sizing is future deployment work.

### Not measured

No Lighthouse, Core Web Vitals, bundle analysis, query profile, concurrency test, image-size distribution, or memory profile was run. Values in docs are not independently verified. Recommended baselines after persistence/auth corrections: mobile LCP/CLS/INP on representative devices, total initial transfer, catalog API latency/query count, DB connections under expected concurrent traffic, and image upload/display sizes.

## 10. Testing and QA

Existing root scripts are mostly static source/content assertions, with `test-all-connectivity.js` also trying a PostgreSQL connection and reading `.env.local`. `verify-all-loading.js` reads runtime JSON fixtures. `setup-db.mjs` executes schema and seed SQL and is mutative. None were run.

The end-to-end script name overstates its inspected form: the shown sections read source files and perform local logic simulations rather than driving the actual app/browser/database. The connectivity script can consider the database offline fallback a pass. These scripts cannot establish the documented security, mobile, performance, or persistence claims.

### Highest-value missing tests

- Auth: default-secret absence, reset takeover regression, CLI bootstrap/reset, local throttle behavior, role matrix, cookie expiry/revocation.
- API: strict request schemas, error status mapping, malformed JSON, large body, invalid IDs, unknown update fields.
- Data: PostgreSQL create/read/update/delete for both item types; rejected DB query must not return success; concurrent stock toggle; schedule persistence after restart.
- Images: MIME/size validation, local file upload and cleanup, data URL rejection or migration, partial failure recovery.
- UI: keyboard operability and accessible modal lifecycle; responsive forms on short mobile screens; availability state wording.
- Performance: local catalog payload/query baseline, image transfer sizes, and local connection pool behavior.

## 11. Dependency and local operations

- Root app has Next `14.2.35`, React 18, TypeScript 5, ESLint 8, Tailwind 3, `pg`, `@types/pg`, Framer Motion, `lucide-react`, and `browser-image-compression`. I did not run an advisory scan or inspect current external vulnerability databases.
- The nested scaffold duplicates package manifests and has installed dependencies of its own; treat as inactive scaffold unless owner changes direction. No deployment/CI work is in scope.
- `.env.example` mixes local PostgreSQL and Supabase settings; the local contract in `Architecture.md` should remove hosted-provider settings from the active local setup.
- `scripts/setup-db.mjs` reads `.env.local`, executes schema and seed. Replace with explicit versioned migrations and a separate opt-in local demo seed; never point this work at hosted DBs.
- Existing ops docs describe Supabase/Vercel and need a later documentation reconciliation to local-only behavior.
- No CI/CD configuration is needed for the current local-only phase.

## 12. Maintainability and architecture

- `catalogService.ts` combines SQL mapping, fallback logic, disk persistence, mock data, and business operations. This makes the source of truth and failure semantics difficult to reason about.
- `scheduleService.ts` combines calendar calculations, file persistence, DB sync, and notice business logic.
- Plant and aquarium API/service logic is largely duplicated; a small shared validation/persistence boundary could reduce drift, but only after fixing the data contract.
- Many comments describe intended behavior (persistent, cascade purge, cloud architecture) more strongly than implementation guarantees. Update docs only after architecture is decided and verified.
- Positive: most SQL is parameterized, auth checks are visible at each inspected admin API handler, and pages/components have a recognizable division of concerns.

## 13. Detailed improvement plan

### Phase 0 — Establish the local implementation contract

**Goal:** Avoid building fixes against the wrong architecture.

1. Use the top-level app as the active app; treat `nature-house-app/` as a scaffold unless owner direction changes.
2. Use local PostgreSQL as the structured-data source of truth and local filesystem storage for image bytes. Do not connect to hosted services.
3. Keep admin identity inside the app for local use, with persisted accounts and explicit CLI bootstrap/reset. Do not build email delivery or cloud auth in this phase.
4. Keep deployment, hosted provider, CDN, edge cache, DNS, SSL, and production operations explicitly out of scope.
5. Confirm product semantics for “sold out” versus “made to order” before adding availability states. If unanswered, keep the existing two-state inventory model and make copy consistent.

**Acceptance:** Follow [Architecture.md](Architecture.md) as the local source-of-truth design. No deployment is attempted and no cloud credentials are added.

### Phase 1 — Close admin takeover paths

1. Remove public password reset. Use an interactive local CLI reset command; never return reset code/token from an anonymous API.
2. Remove source-defined password and signing defaults. Require configuration at startup and fail closed.
3. Persist admin credential changes in local PostgreSQL and ensure resets revoke prior sessions by incrementing session/token version.
4. Implement a bounded local login throttling policy. Shared cloud rate limiting is out of scope until deployment is requested.
5. Make login/reset responses non-enumerating. Keep detailed diagnostic information server-side without logging credentials or reset material.
6. Define session policy: explicit expiration, secure cookie attributes, revocation, key rotation, logout semantics, and role authorization.

**Tests/acceptance:**

- Anonymous users cannot reset passwords or obtain recovery material.
- Anonymous reset API is removed/disabled; local CLI reset changes a persisted account and invalidates prior sessions.
- Missing signing configuration prevents startup/login.
- Forged, expired, revoked, and wrong-role sessions cannot reach protected operations.
- Local login throttling is bounded and its behavior does not disclose whether an email exists.

### Phase 2 — Make local catalog and schedule persistence truthful

1. Fix plant SQL bind parameters and write a DB integration test for each catalog action.
2. Change DB helpers to preserve error semantics. Callers must distinguish “no rows”, “no DB configured”, and “query failed”.
3. Use local PostgreSQL as the only normal application persistence path. Remove local JSON and process-memory fallbacks from normal mutation/read paths; keep explicit fixture adapters for tests/demo only.
4. Make create/update/delete transactional where related records must remain consistent. Return success only after durable commit.
5. Store schedule/notice data in local PostgreSQL rather than a writable application directory; make writes awaited and errors visible.
6. Add explicit migration versioning. Rework policy creation into version-compatible, repeatable migrations and verify grants/RLS using the actual application DB role.
7. Add conflict behavior for simultaneous stock changes and duplicate form submissions (e.g., optimistic version or idempotency token if needed).

**Tests/acceptance:**

- PostgreSQL create/read/update/delete round trips pass for plants and aquariums.
- Failed writes return an error and do not change the UI or pretend to persist.
- Restarting the local app process preserves catalog and schedule state from PostgreSQL.
- Schema migration can be applied to a clean test DB and safely re-applied per chosen migration strategy.
- API reports “not found” only when no record exists, not when the DB is unavailable.

### Phase 3 — Move media out of database records into the local media store

1. Implement a narrow `MediaStore` interface with a local filesystem adapter and upload binary files, not base64 JSON. Do not implement a cloud adapter now.
2. Validate content type by inspecting actual file bytes, cap input and output dimensions/size server-side, and reject unsupported formats.
3. Use a modern optimized format consistent with browser/device needs (WebP/AVIF as appropriate); do not assume client conversion is reliable.
4. Store object key, content metadata, and stable URL/reference in DB. Migrate existing data URLs deliberately, with inventory count and rollback plan.
5. Design record/media lifecycle: write temp file → commit metadata/record → finalize, and delete/compensate on failure. Add a durable cleanup queue/reconciliation command.
6. Replace false “purged everywhere” copy with accurate progress/partial-failure states.

**Tests/acceptance:**

- Public catalog contains URLs/keys, not data URLs.
- Invalid MIME, too-large file, malformed data, and local filesystem failures are handled safely.
- Record create/edit/delete and corresponding media create/delete are consistent or recoverable.
- Measure and compare page payload, request size, mobile transfer, and storage growth.

### Phase 4 — Validate API contracts and business state

1. Define schemas for plant, aquarium, schedule notice, and broadcast actions.
2. Validate types, finite numeric values, non-negative prices, dimensions, lengths, enums, URL protocols, booleans, and request body size.
3. For updates, map only supported fields; do not spread raw JSON into persistence code.
4. Validate schedule year/month and date ranges; normalize dates in one documented timezone (likely Asia/Kolkata based on product context, but confirm).
5. Define one explicit availability state and use it consistently in cards, detail dialogs, admin controls, stock filters, and WhatsApp text.
6. Add API-level origin/CSRF strategy appropriate to cookie-authenticated mutations, and test it. `SameSite=Lax` is useful but should not replace a documented threat model.

**Tests/acceptance:** Invalid requests produce stable 4xx errors without partial mutations; valid requests round-trip; each availability state has unambiguous copy and correct contact action.

### Phase 5 — Improve accessibility and mobile UX

1. Replace clickable image `div`s in cards with semantic buttons or links with visible focus styles and clear accessible names.
2. Standardize accessible modal behavior: `role="dialog"`, `aria-modal`, labelled title, initial focus, focus containment, Escape, focus restoration, and preservation of prior scroll locking.
3. Ensure validation and async save errors are announced; use status/live regions for save progress and completion.
4. Verify controls and touch targets on mid-range mobile, including short screens with browser chrome and on-screen keyboard.
5. Respect reduced-motion preferences for Framer Motion/CSS transitions.
6. Perform visual review before redesign. Preserve existing colors and identity; focus changes on established usability/accessibility findings.

**Tests/acceptance:** Keyboard-only user can browse, open/close each dialog, operate forms, and recover focus. Screen-reader labels and errors are understandable. No horizontal overflow at supported mobile sizes and 200% zoom.

### Phase 6 — Align local data freshness, performance, and operational claims

1. Keep local catalog reads simple and fresh; decide whether client focus refresh is needed after observing actual UX. Do not add ISR or edge cache.
2. Avoid redundant no-store polling if not required by product. If refresh remains, document cooldown and behavior.
3. Measure local query count, pool connections, and response sizes with representative catalog sizes (150–250 entries). Multi-instance capacity is not an acceptance requirement in this phase.
4. Profile mobile performance after media migration; measure LCP, CLS, INP, transferred bytes, JS bundle, image bytes, and cache hit behavior.
5. Add health/readiness behavior that does not expose sensitive details. Add structured logs with request IDs and mutation outcomes, never credentials or reset material.
6. Document a manual local backup/restore procedure for PostgreSQL and `var/media`; do not implement or execute it against user data without explicit task approval.

**Tests/acceptance:** Publish measured local baseline with environment/device/sample size; verify a local admin edit appears on the public page; prove backup/restore only against disposable test data. No hosted cache or deployment checks.

### Phase 7 — Test strategy and repository cleanup

1. Replace brittle source-string assertions with behavior tests where practical: auth service unit tests, route integration tests, DB tests, component tests, and a small set of browser journeys.
2. Rename static checks so they do not imply real connectivity/E2E verification. Ensure connectivity tests never print env values and clearly label DB offline skip versus pass.
3. Add security regression tests for all confirmed risks before remediation is considered complete.
4. Decide whether nested scaffold is maintained; if not, document/archive/remove it only as a separately approved cleanup.
5. Reconcile README and `design_docket` docs with the working app. Remove assertions of verified pass/benchmark/compliance status unless reproducible evidence exists.

## 14. Prioritized roadmap summary

| Order | Work item | Priority | Relative complexity | Dependency |
|---|---|---:|---:|---|
| 0 | Follow the local-only architecture decision in Architecture.md | P1 | Low | None; owner stated no deployment currently |
| 1 | Fix reset flow and remove auth defaults | P1 | Medium/high | Auth/recovery decision |
| 2 | Fix plant insert and persistence error handling | P1 | Low/medium | DB source-of-truth decision |
| 3 | Replace fallback persistence with local PostgreSQL | P1 | Medium/high | Disposable local DB and migration plan |
| 4 | Replace base64 media with local media storage and lifecycle | P1/P2 | Medium/high | Local media directory and migration plan |
| 5 | Fix schema migrations and local DB role/grants; RLS is not the primary app boundary | P1 | Medium | Local PostgreSQL version |
| 6 | Add request schemas, availability semantics, date validation | P2 | Medium | Product/business rules |
| 7 | Implement accessible interactive controls and dialogs | P2 | Medium | Shared UI approach |
| 8 | Measure local payloads, queries, and recovery | P2 | Medium | Durable data path |
| 9 | Replace static assertion tests and reconcile docs/scaffold | P2/P3 | Medium | Architecture stabilized |

## 15. Validation, limitations, and coverage

### Inspected

- Root and nested manifests/README files, project documentation, environment variable example (names/template only), app routes, main catalog/admin components, auth/database/catalog/schedule services, SQL schema/seed, Next config, and verification scripts.
- Source references are line-numbered based on the current checkout.

### Not verified

- `.env.local` values were not inspected.
- No browser, mobile device, running local app, local database, local media directory, hosted service, or deployment was accessed.
- No tests, build, lint, migrations, DB setup, benchmark, or network scan was run. The connectivity script reads `.env.local` and attempts a database connection; DB setup executes schema and seed; neither was safe for this read-only audit.
- No external dependency advisory scan was performed.
- Git working-tree status could not be read because repository metadata is inaccessible across the mount boundary.
- Visual findings are based on code structure, not rendered screenshots.

### Coverage checklist

| Area | Status | Notes |
|---|---|---|
| Repository instructions and status | Partial | No project AGENTS file found; Git status unavailable due mount boundary |
| App architecture and duplicated tree | Inspected | Top-level product app vs minimal nested scaffold |
| Admin auth and reset | Inspected, source-confirmed risks | No runtime attack test performed |
| Catalog API and persistence | Inspected, source-confirmed risks | No DB mutation or integration test performed |
| Schedule/calendar | Inspected | Persistence and query validation concerns identified |
| Image path | Inspected | Canvas JPEG data URL, no storage upload in inspected path |
| UI/UX/accessibility | Static source review | No browser or assistive technology testing |
| SQL and setup | Inspected | Schema not executed; policy syntax finding is probable pending target DB verification |
| Performance/scalability | Static analysis only | No metrics or load tests |
| Dependencies/advisories | Manifest reviewed | No current advisory lookup |
| Tests/scripts | Source inspected, not run | Some scripts can connect to configured DB; setup is mutative |

## 16. Overall assessment

The product concept and code organization are understandable, but older production/deployment claims exceed what the implementation demonstrates. The current scope is now clear: local development only. Implement local authentication setup, PostgreSQL-backed durable data, and filesystem-backed media as specified in `Architecture.md`; then address API validation, accessibility, and measured local performance. Do not implement cloud providers or deployment steps.

## 17. Coding-agent implementation contract (local-only)

Use this section with [Architecture.md](Architecture.md) when the owner authorizes implementation. `Architecture.md` is normative for design details; this section gives the audit-driven change map and sequencing. The implementation must not deploy, connect to hosted services, provision cloud resources, or modify production systems. Work against a disposable local test DB/media root for migration and integration tests.

### 17.1 Intended local source of truth

- **App:** top-level `/mnt/d/Nature_House` Next.js app. Treat `nature-house-app/` as inactive scaffold; do not migrate or delete it in the same task.
- **Structured data:** local PostgreSQL via `pg`, configured by `DATABASE_URL`. Remove normal runtime reads/writes to `runtimeCatalog.json`, `runtimeSchedule.json`, and `globalThis` stores. Keep mock fixtures only behind explicit test/demo injection.
- **Media:** local files below `var/media` or `NATURE_HOUSE_MEDIA_DIR`, outside `public/`, `src/`, `.next`, and Git. PostgreSQL stores metadata and references only.
- **Authentication:** local DB admin account table, required `SESSION_SECRET`, no source-defined default account/password/key, no anonymous public reset. CLI bootstrap and reset are the local recovery workflow.
- **External links:** WhatsApp/Maps remain user-initiated links; no server-side calls to them.

### 17.2 File-level implementation map

| Existing location | Required implementation outcome |
|---|---|
| `src/lib/db.ts` | Keep pool configuration only; add typed query/transaction helpers; preserve DB errors; ensure client release and rollback; no credentials in logs |
| `src/lib/auth.ts` | Remove static default hash/key/admin list; implement versioned password hash and HMAC session verification with DB account lookup, expiry, active flag, token version, same-origin write policy |
| `src/lib/authService.ts` (new) | Account lookup, login checks, local lockout policy, role authorization, password update/session invalidation |
| `scripts/admin-create.mjs` (new) | Interactive first-admin/bootstrap and additional local account creation; hidden password prompt; no default users or secret output |
| `scripts/admin-reset.mjs` (new) | Interactive local password reset; update persisted hash and token version; no reset material over HTTP |
| `src/app/admin/reset-password/page.tsx` | Remove public recovery UI or replace with neutral instruction to use local operator recovery; no API reset secret flow |
| `src/app/api/admin/reset-password/route.ts` | Remove the current secret-returning flow; endpoint should be absent or return 404/410. Update UI and tests accordingly |
| `src/app/api/admin/login/route.ts` | Validate body, generic failure response, set explicit local session cookie, never emit secrets |
| `src/app/api/admin/logout/route.ts` | POST only; clear cookie consistently; no state-changing GET |
| `src/lib/catalogService.ts` | DB-backed domain operations only; fix plant placeholders; check row counts; no JSON/memory fallback; no base64 media |
| `src/lib/scheduleService.ts` | DB-backed schedule reads/writes; remove implicit file writes/async ignored DB sync; validate date transitions |
| `src/app/api/admin/plants/route.ts`, `aquariums/route.ts` | Validate action schemas, authorize on every call, map typed errors accurately, only return success after transaction commits |
| `src/app/api/admin/schedule/route.ts` | Validate enumerated actions and all fields, preserve authorization, report DB failures accurately |
| `src/app/api/schedule/route.ts` | Validate optional year/month and use one configured timezone policy |
| `src/lib/validations.ts` (new or existing) | Runtime schemas for all API input DTOs; reject unknown update fields and oversized values |
| `src/lib/mediaStore.ts` (new) | Safe local filesystem `MediaStore`; UUID names, atomic writes, byte/type/dimension limits, safe read/delete, path containment |
| `src/app/api/admin/media/route.ts` (new) | Session-guarded multipart upload; validate bytes independently of client; return media metadata/ID only |
| `src/app/media/[mediaId]/route.ts` (new) | Public UUID-based image streaming with MIME allowlist, no path traversal, `nosniff`, safe cache headers |
| `src/components/admin/PlantFormModal.tsx`, `AquariumFormModal.tsx` | Replace data URL creation with binary upload followed by record save; show upload/save/partial cleanup/error states |
| `src/components/admin/AdminDashboardClient.tsx` | Do not optimistic-confirm persistence prematurely; revert or show failure when server rejects; truthful media deletion feedback |
| `src/components/PlantCard.tsx`, `AquariumCard.tsx` | Semantic keyboard-operable detail action; coherent availability state/copy |
| `src/components/PhotoLightbox.tsx`, `ItemDetailModal.tsx`, `CalendarModal.tsx`, admin dialogs | Shared dialog semantics, focus lifecycle, Escape, focus return, and prior scroll-state restoration |
| `database/schema.sql` / `database/seed.sql` | Split into versioned migrations and explicit local demo seed. Remove invalid policy syntax and hosted-only claims; never seed credentials |
| `scripts/setup-db.mjs` | Replace with explicit local migration runner; refuse non-loopback/unknown DB targets unless an explicitly separate future tool is designed |
| `.env.example` | Local-only variables/placeholders; remove active Supabase/Vercel vars; do not disclose local env values |
| `package.json` | Add/rename local migration/admin/test scripts only when their side effects are documented; remove unused image dependency only if implementation no longer uses it and package change is separately reviewed |

The agent may adjust exact names to match code conventions, but should not collapse the boundaries in ways that reintroduce silent fallback, direct filesystem use in routes, or database access in UI components.

### 17.3 Data migration requirements

Existing local rows and JSON fixtures may contain catalog content and base64 image data. Treat them as user data, even in local development.

1. Before migration, inspect schema and data shape without printing image contents, secrets, or `.env.local` values. Determine which source has the newest valid catalog and report the planned source selection.
2. Do not automatically merge DB, JSON, and memory copies. Produce a deterministic migration/import command with a dry-run mode, counts, conflict report, and explicit source selection.
3. For data URLs, decode only recognized image data, validate bytes, write to a temporary media directory, verify checksum/size, then update metadata/reference. Never log base64.
4. Make the migration idempotent: rerun should detect already-migrated records by stable ID/checksum and avoid duplicate files/rows.
5. Back up the local DB and JSON/media source before executing against any non-disposable developer data. Do not overwrite existing `var/media`; use a new staging directory and switch only after verification.
6. Include rollback instructions. If a destructive cleanup is proposed, stop and request explicit authorization; do not delete old JSON/media as part of an ordinary migration.
7. Test migration against a disposable copy and compare record counts, IDs, important fields, file checksums, and broken references before touching the working local dataset.

### 17.4 Implementation order and gates

1. **Safe test harness:** create isolated local test DB/media directory strategy; inspect existing scripts and ensure no external/production connections. Gate: tests can prove they target disposable local resources.
2. **Migrations and DB primitives:** migration ledger, admin/media tables, transaction helper, typed errors. Gate: clean schema setup and migration repeatability against disposable DB.
3. **Auth:** remove source defaults/public reset; add CLI bootstrap/reset/session-version logic. Gate: auth regression tests pass before admin mutation migration.
4. **Catalog and schedule persistence:** fix SQL, remove fallback, use DB as sole local structured store. Gate: CRUD and restart tests pass; DB failure produces non-success API result.
5. **Media pipeline:** local store, upload/serve/cleanup routes, metadata references, safe data migration. Gate: file validation and partial-failure tests pass; public records contain no data URLs.
6. **API/UI validation and accessibility:** schemas, status semantics, accurate save states, semantic cards/dialog behavior. Gate: component/browser and keyboard tests pass.
7. **Local documentation cleanup:** reconcile README, DATABASE, API, RUNBOOK, SECURITY_PRIVACY, TESTING_QA, TRD, and this Architecture document. Gate: docs describe only implemented local behavior; historic deployment material is clearly marked future/out of scope or removed.
8. **Final report:** list changed files, migration steps, exact local test commands/results, remaining risks, and state plainly: **nothing was deployed**.

Do not advance past a gate when its disposable-data safety requirement is unmet. Do not run schema setup, seed, migration, or destructive test against an unverified database URL. Never print environment values while checking configuration.

### 17.5 API and UI completion criteria

- No anonymous route returns a password reset token/code or changes account credentials.
- No known default password/signing key exists in source, fixtures, or docs.
- Every admin mutation validates input server-side and authenticates/authorizes server-side.
- Every mutation response corresponds to a durable DB commit; missing rows, validation failures, and DB errors have distinct status codes.
- Plant and aquarium create/update/delete behavior is consistent; SQL parameter/value counts are covered by integration tests.
- Media bytes are files in local media root; DB/API/page props carry media IDs and URLs, not data URLs.
- Delete and replacement operations record cleanup failures and do not claim a file was removed when it was not.
- Schedule state persists in PostgreSQL and date parsing has explicit range/timezone policy.
- Card image/detail actions work from keyboard. Dialogs expose accessible names, contain and restore focus, support safe dismissal, and preserve scroll state.
- UI shows upload, save, error, and cleanup status clearly, and does not optimistically tell staff an uncommitted change succeeded.
- Local tests run only against disposable DB/media resources. No deployment, cloud provisioning, or production change occurs.

### 17.6 Explicit implementation checklist — all deliverables

This is the concrete change list for the coding agent. These are **not completed items**; the agent must implement and verify each applicable item. Follow the detailed contracts and API/file specifications in [Architecture.md](Architecture.md), especially Section 16. Do not omit a checklist item silently: mark it complete with evidence, deferred with a reason, or blocked by a specific local dependency.

#### A. Local foundation and persistence

- [ ] Use only the top-level Nature House application; leave `nature-house-app/` untouched as a scaffold.
- [ ] Keep Next.js on the Node runtime and bind to localhost/loopback by default.
- [ ] Make `.env.example` local-only; remove active Supabase/Vercel configuration. Validate required settings without printing values.
- [ ] Add ordered SQL migrations and a migration ledger; replace implicit schema-and-seed setup with explicit local commands.
- [ ] Add local PostgreSQL schema for persistent admins and media metadata; adjust catalog references and indexes; remove invalid `CREATE POLICY IF NOT EXISTS` usage from the local setup.
- [ ] Add an explicit optional demo seed with no credentials/default admin user.
- [ ] Add DB transaction/error helpers; release connections reliably; rollback failed transactions; do not convert query errors to `null` or success.
- [ ] Fix plant INSERT placeholder/value mismatch and verify create/update/delete affected-row results for both plants and aquariums.
- [ ] Make PostgreSQL authoritative for catalog, categories, store info, schedules, notices, broadcasts, and admin records.
- [ ] Remove normal-runtime JSON and `globalThis` persistence/fallbacks from `catalogService.ts` and `scheduleService.ts`; keep fixture usage explicit for tests/demo only.

#### B. Local admin identity and access

- [ ] Persist account identity, role, active state, password hash, and session version in PostgreSQL.
- [ ] Add hidden-input local CLI commands to create/bootstrap an admin and reset an existing admin password.
- [ ] Remove default admin emails/hash, fallback HMAC secret, and unused/misleading password environment contract.
- [ ] Require a generated `SESSION_SECRET`; fail closed when missing. Never reveal it in output.
- [ ] Implement versioned salted password hashing, constant-time compare, malformed-hash rejection, and explicit password policy.
- [ ] Implement signed, expiring sessions checked against the current DB account/session version; add explicit cookie options and revocation on password reset.
- [ ] Ensure every admin page and API operation authenticates and authorizes server-side; enforce role permissions or reduce roles to a single admin role.
- [ ] Add generic external login errors, bounded local login throttling, same-origin checks for cookie mutations, and safe non-secret auth audit records.
- [ ] Remove/disable the public reset page and reset endpoint. No anonymous caller may obtain a code/token or change a credential.
- [ ] Make logout POST-only and clear the cookie with matching cookie attributes.

#### C. Local image storage and migration

- [ ] Add a local `MediaStore` rooted at `var/media`/`NATURE_HOUSE_MEDIA_DIR`, excluded from Git and outside `public`, `src`, and `.next`.
- [ ] Implement authenticated multipart image upload with server-side byte, content-signature/MIME, dimension, and output-size validation.
- [ ] Write images atomically under generated UUID names; prevent path traversal; compensate file writes if metadata persistence fails.
- [ ] Store media metadata and references in PostgreSQL, not base64/data URLs. Add UUID-based safe media-serving route with MIME allowlist and `nosniff`.
- [ ] Change plant and aquarium forms to upload binary media then save the record; represent progress, failure, retry, and partial cleanup accurately.
- [ ] Implement media replacement/deletion with durable cleanup state and a retry/reconciliation command; never claim successful purge when the file remains.
- [ ] Migrate existing data URLs with dry-run, staged destination, checksums/counts/conflict report, idempotence, backup, and rollback. Preserve old data until verified; never log image bytes.

#### D. API, schedule, and product behavior

- [ ] Add server-side runtime schemas for all plant, aquarium, media, schedule, and broadcast inputs. Reject unknown update fields, invalid types/ranges, oversized data, and malformed dates.
- [ ] Add stable error mapping for validation, unauthorized, forbidden, not-found, conflict, media, and persistence failures; do not return stack traces/SQL errors.
- [ ] Make mutation responses contingent on successful durable DB commit; update UI only after confirmed persistence or revert optimistic state.
- [ ] Move schedule persistence into PostgreSQL; validate actions and date ranges; define one timezone policy and bound public calendar year/month input.
- [ ] Define canonical availability copy and behavior across both card types, item detail, admin stock controls, and WhatsApp inquiry. Keep existing two-state behavior unless product requirements explicitly add made-to-order.
- [ ] Remove/justify redundant focus polling and preserve fresh local catalog state without adding CDN/ISR services.

#### E. UI, accessibility, and local-only quality

- [ ] Replace clickable non-semantic card image `div`s with keyboard-operable controls and visible focus.
- [ ] Give all dialogs accessible semantics/labels, initial focus, Tab containment, Escape handling, focus restoration, and prior scroll-state restoration.
- [ ] Announce form validation, save progress/result, stock changes, and errors accessibly; prevent duplicate submissions.
- [ ] Respect reduced motion and remove runtime font network dependency by using local/bundled fonts or system fallbacks.
- [ ] Keep existing Nature House identity; verify public and admin screens at mobile, tablet, desktop, short viewport heights, and 200% zoom before visual refinements.
- [ ] Add sanitized local logs/health feedback; never log secrets, cookies, reset material, DB connection values, or image data.
- [ ] Update README, database/API/runbook/security/QA/TRD docs and `.env.example` to describe implemented local behavior, not Supabase/Vercel production claims.

#### F. Required verification and closeout

- [ ] Use a disposable local PostgreSQL database and temporary media directory for tests/migrations; prove test target isolation before running destructive setup.
- [ ] Add tests for auth/bootstrap/reset/session revocation, migrations, CRUD, DB failures, schema validation, media lifecycle/cleanup, schedule persistence, and admin authorization.
- [ ] Add UI/browser coverage for keyboard dialogs/cards, responsive forms, validation, upload failures, duplicate submits, and truthful save states.
- [ ] Record local query count, response/image sizes, and key interactions. Do not claim deployment readiness, cloud scale, or documented Lighthouse scores without measurement.
- [ ] Report each checklist item as done/deferred/blocked with evidence. Include changed files, migration/rollback details, tests and exact results, remaining uncertainty, and: **Nothing was deployed.**
