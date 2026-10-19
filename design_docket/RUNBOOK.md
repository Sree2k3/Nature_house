# Operations & Local Deployment Runbook

**Project Name:** Nature House (Digital Catalog & Admin Portal)  
**Document Version:** 2.0 (Local Architecture)  
**Target Environment:** Local Node.js App Router + Local PostgreSQL + Local Content Store  
**Storage Path:** Local Filesystem (`var/media/`)  

---

## 1. System Prerequisites

- **Node.js:** v18.17.0+ or v20+
- **PostgreSQL:** v14+ running locally (e.g., `postgresql://postgres:postgres@localhost:5432/nature_house`)
- **Package Manager:** `npm`

---

## 2. Environment Configuration

Copy `.env.example` to `.env.local` and configure your credentials:

```bash
cp .env.example .env.local
```

### Essential Environment Variables
```env
# Database Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nature_house

# Cryptographic Session Secret (Required - must be >= 32 random characters)
SESSION_SECRET=a_very_secure_random_session_secret_change_in_production_32chars

# Authorized Admin Email List (Up to 3 staff members)
AUTHORIZED_ADMIN_EMAILS=admin@naturehouse.in,botanist@naturehouse.in,manager@naturehouse.in

# Public Store Meta
NEXT_PUBLIC_STORE_NAME="Nature House"
NEXT_PUBLIC_WHATSAPP_PHONE=919876543210
NEXT_PUBLIC_STORE_LOCATION="Nature House Studio, Green Avenue, Bangalore"
NEXT_PUBLIC_GOOGLE_MAPS_URL="https://maps.google.com/?q=Bangalore+Plant+Nursery"
```

---

## 3. Database Initialization & Migrations

Nature House uses deterministic SQL migration scripts located in `database/migrations/`.

Execute all pending migrations:
```bash
node scripts/db-migrate.mjs
```

This ensures the following tables are up to date:
- `categories`
- `plants`
- `aquariums`
- `site_settings`
- `admin_accounts`
- `media_assets`
- `media_cleanup_queue`

---

## 4. Administrative Account Operations (CLI Tools)

In accordance with security audit finding NH-SEC-01, public self-service password reset endpoints have been retired. All administrative provisioning and password recovery are performed securely via local CLI scripts.

### 4.1 Provisioning an Admin Account
```bash
node scripts/admin-create.mjs
```
The script interactively prompts for:
- Admin Email (must be one of the `AUTHORIZED_ADMIN_EMAILS`)
- Administrator Name
- Role (`owner`, `botanist`, `manager`)
- Initial Password (minimum 8 characters)

Password is hashed using Node.js native `crypto.scrypt` with a unique 16-byte random salt.

### 4.2 Resetting an Admin Password
```bash
node scripts/admin-reset.mjs
```
The script interactively prompts for:
- Admin Email
- New Password

Upon successful update, `token_version` in `admin_accounts` is automatically incremented, instantly revoking all active sessions across all devices for that administrator.

---

## 5. Development & Running the Application

### 5.1 Starting the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` for the public showcase, or `http://localhost:3000/admin` for the staff management portal.

### 5.2 Building for Production
```bash
npm run build
npm run start
```

---

## 6. Testing & System Verification

The test suite exercises end-to-end functionality, loading skeletons, error boundaries, data persistence, and security:

```bash
npm test
```

This runs:
1. `scripts/e2e-all-phases-test.js`: All 5 core phases, cryptographic operations, and admin APIs.
2. `scripts/verify-all-loading.js`: Biophilic skeleton animations and resilience boundaries.
3. `scripts/test-all-connectivity.js`: Database pool connectivity, persistence, and external link validation.

---

## 7. Media Asset Management (`var/media/`)

- Uploaded images are stored in `<project_root>/var/media/`.
- Temporary uploads are staged in `<project_root>/var/media/tmp/` and atomically renamed.
- Safe streaming endpoint: `GET /media/[mediaId]`.
- Cascade cleanup: Deleted inventory items enqueue the media storage key in `media_cleanup_queue`.
