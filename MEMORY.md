# Zekora — System Memory

> Complete reference for the Zekora codebase: architecture, components, logic, database, API, auth, deployment.

---

## 1. Project Overview

**Zekora** (package name: `polyglot-vault`) is a personal cloud storage vault with:
- Multi-account Google Drive file management (browse, upload, preview, rename, delete, folder upload)
- Password manager (AES-256-CBC encrypted storage)
- Notes, Collections, Tags (organizational metadata)
- Hidden Vault (second-factor encrypted compartment with its own password)
- AI chat assistant (Groq-powered, vault-context-aware)
- Activity audit log

**Stack:** Next.js 16.2.11 (App Router + Turbopack) · React 19.2.4 · Supabase (Postgres + Auth) · Google Drive API v3 · Groq AI · Framer Motion · Tailwind CSS v4 · Lucide React icons

**Design:** Dark retro/pixel-art aesthetic (Gengar-themed). Two visual systems coexist — newer pixel-art components (sidebar, header, FileExplorer, DrivesManager, StoragePoolMeter, DashboardOverview, AuthCard, PasswordManager, ActivityList, AssistantContent) and older rounded components (tags-content, collections-content, notes-content, recent-content, file-card, file-upload, file-grid).

**Deployed at:** `https://zekora.vercel.app`

---

## 2. File Structure

```
D:\PROJECTS\Zekora\
├── .env.local                    # Live secrets (Supabase, Google OAuth, ENCRYPTION_KEY, Groq)
├── .env.example                  # Template with all vars
├── .env.local.example            # Template for local dev (supabase start)
├── next.config.ts                # Next.js config (remote image patterns only)
├── vercel.json                   # Empty {}
├── package.json                  # polyglot-vault@0.1.0
│
├── scripts/
│   └── create-demo-user.mjs      # Creates zach@gmail.com / 123456789 demo user
│
├── supabase/
│   └── migrations/
│       ├── 001_init.sql          # collections, notes, tags, google_accounts, beta_signups
│       ├── 002_beta_fix.sql      # beta_signups IF NOT EXISTS
│       ├── 003_passwords.sql     # password_entries, activity_events
│       ├── 004_passwords_rls.sql # Rewrites password_entries RLS (per-operation policies)
│       └── 005_hidden_vault.sql  # hidden_vault_accounts
│
└── src/
    ├── proxy.ts                  # Next.js middleware (auth guard, redirect logic)
    │
    ├── lib/
    │   ├── utils.ts              # cn(), formatFileSize(), formatDate(), getFileIcon()
    │   ├── encryption.ts         # AES-256-CBC encrypt/decrypt (ENCRYPTION_KEY)
    │   ├── google-oauth.ts       # OAuth config, URL builder, VERCEL_URL fallback
    │   │
    │   ├── supabase/
    │   │   ├── server.ts         # SSR Supabase client (cookies-based)
    │   │   ├── client.ts         # Browser Supabase client
    │   │   ├── middleware.ts     # DEAD CODE (unused, superseded by proxy.ts)
    │   │   └── models.ts         # All DB query functions (data access layer, ~480 lines)
    │   │
    │   ├── google-drive/
    │   │   ├── client.ts         # Drive API wrapper (token refresh, upload, search, CRUD)
    │   │   └── pool.ts           # Multi-account storage pool (smart drive selection)
    │   │
    │   └── ai/
    │       ├── groq.ts           # Groq API client
    │       ├── vault-context.ts  # Builds vault context JSON for AI system prompt
    │       └── types.ts          # ChatCompletionMessageParam, ChatMessage
    │
    ├── types/
    │   └── index.ts              # Shared types (FileMetadata, Note, Collection, Tag, GoogleAccount, StoragePool, etc.)
    │
    ├── app/
    │   ├── globals.css           # Theme tokens, pixel-art overlays, animations
    │   │
    │   ├── (auth)/
    │   │   ├── login/page.tsx    # Login (email/password + Gengar mascot + BetaSignupForm)
    │   │   └── signup/page.tsx   # Signup (email confirmation via Supabase)
    │   │
    │   ├── auth/
    │   │   └── callback/route.ts # Supabase auth callback (code exchange → session)
    │   │
    │   ├── dashboard/
    │   │   ├── layout.tsx        # Sidebar + Header wrapper
    │   │   ├── page.tsx          # DashboardOverview (server component, fetches accounts)
    │   │   │
    │   │   ├── files/            # DashboardOverview shows drive stats (via page.tsx)
    │   │   ├── settings/
    │   │   │   ├── page.tsx      # ConnectedDrivesManager
    │   │   │   └── connected-drives-manager.tsx  # DEAD CODE (old design)
    │   │   │
    │   │   ├── passwords/        # Password manager
    │   │   ├── notes/            # Notes list + editor
    │   │   ├── collections/      # Collections management
    │   │   ├── tags/             # Tag management
    │   │   ├── recent/           # Recent files view
    │   │   ├── activity/         # Activity log
    │   │   ├── access-logs/      # Hidden vault access logs
    │   │   ├── assistant/        # AI chat assistant
    │   │   │
    │   │   ├── dashboard-content.tsx    # DEAD CODE (old file upload/grid)
    │   │   └── dashboard-overview.tsx   # DEAD CODE? (actual component lives in components/)
    │   │
    │   └── api/
    │       ├── ai/chat/route.ts         # POST - AI chat with vault context
    │       ├── auth/google/
    │       │   ├── connect/route.ts      # GET - Generate OAuth URL
    │       │   └── callback/route.ts     # GET - OAuth callback, exchange tokens, store account
    │       ├── beta-signups/route.ts     # POST - Public beta signup (no auth)
    │       ├── collections/route.ts      # GET, POST
    │       ├── collections/[id]/route.ts # DELETE
    │       ├── drive/
    │       │   ├── files/route.ts        # GET - List files (all accounts or one, with search)
    │       │   ├── files/[fileId]/route.ts # GET (download/stream), PATCH (rename), DELETE
    │       │   └── folders/route.ts      # POST - Create Drive folder
    │       ├── hidden-vault/route.ts     # GET (status), POST (signup/login/logout)
    │       ├── notes/route.ts            # GET, POST
    │       ├── notes/[id]/route.ts       # GET, PATCH, DELETE
    │       ├── passwords/route.ts        # GET, POST (encrypted)
    │       ├── passwords/[id]/route.ts   # GET (decrypt), PATCH (re-encrypt), DELETE
    │       ├── storage/
    │       │   ├── accounts/route.ts     # GET (list), DELETE (disconnect)
    │       │   ├── pool/route.ts         # GET (aggregate quota)
    │       │   └── upload/route.ts       # POST (multipart upload to Drive)
    │       └── tags/route.ts             # GET, POST
    │           tags/[id]/route.ts        # DELETE
    │
    └── components/
        ├── layout/
        │   ├── sidebar.tsx               # Navigation sidebar (desktop fixed + mobile drawer)
        │   └── header.tsx                # Top bar with user email + dropdown
        │
        ├── auth/
        │   ├── auth-card.tsx             # Login/signup wrapper card
        │   ├── auth-form.tsx             # Email/password form
        │   └── beta-signup-form.tsx      # Early access signup
        │
        ├── dashboard/
        │   ├── dashboard-overview.tsx    # Main dashboard (storage stats, drive cards)
        │   ├── activity-list.tsx         # Recent activity feed
        │   ├── hidden-vault-scene.tsx    # Hidden vault animated scene
        │   └── hidden-vault-gate.tsx     # Hidden vault auth gate
        │
        ├── drives/
        │   ├── DrivesManager.tsx         # Connected Google accounts (connect/unlink)
        │   └── StoragePoolMeter.tsx      # Aggregate storage visualization
        │
        ├── vault/
        │   └── FileExplorer.tsx          # Main file browser (~1300 lines, 4 components)
        │
        ├── files/
        │   ├── file-card.tsx             # OLD design file card (used by recent-content)
        │   ├── file-grid.tsx             # DEAD CODE (old design)
        │   └── file-upload.tsx           # DEAD CODE (old upload component)
        │
        ├── storage/
        │   └── storage-pool-meter.tsx    # DEAD CODE (old design)
        │
        └── (other pixel-art components in subdirectories)
```

---

## 3. Database Schema

7 tables in Supabase Postgres. All use UUID PKs (`gen_random_uuid()`), `user_id` FKs to `auth.users(id)` with `ON DELETE CASCADE`, and RLS policies scoped to `auth.uid() = user_id` for the `authenticated` role.

### `beta_signups`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| email | TEXT UNIQUE NOT NULL | |
| created_at | TIMESTAMPTZ | `now()` |

RLS: Anyone can INSERT (public waitlist). No auth required.

### `collections`
| Column | Type | Default |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK→auth.users | |
| name | TEXT NOT NULL | |
| description | TEXT | `''` |
| mood | TEXT | `'calm'` |
| color | TEXT | `'#a78bfa'` |
| icon | TEXT | `'folder'` |
| created_at | TIMESTAMPTZ | `now()` |

Index: `(user_id, created_at DESC)`

### `notes`
| Column | Type | Default |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK→auth.users | |
| title | TEXT NOT NULL | |
| content | TEXT | `''` |
| type | TEXT CHECK | `'standalone'` or `'file-attachment'` |
| file_id | TEXT (nullable) | Links to Drive file |
| tags | TEXT[] | `'{}'` |
| collection_id | UUID FK→collections (nullable) | ON DELETE SET NULL |
| mood | TEXT (nullable) | |
| created_at | TIMESTAMPTZ | `now()` |
| updated_at | TIMESTAMPTZ | `now()` |

Indexes: `(user_id, updated_at DESC)`, `(user_id, file_id)`

### `tags`
| Column | Type | Default |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK→auth.users | |
| name | TEXT NOT NULL | |
| color | TEXT | `'#a78bfa'` |
| created_at | TIMESTAMPTZ | `now()` |

Unique constraint: `(user_id, name)`. Index: `(user_id, created_at DESC)`.

### `google_accounts`
| Column | Type | Default |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK→auth.users | |
| account_email | TEXT NOT NULL | |
| encrypted_refresh_token | TEXT NOT NULL | AES-256-CBC encrypted |
| access_token | TEXT | Stored in plaintext (short-lived) |
| token_expiry | TIMESTAMPTZ | `now()` |
| total_space | BIGINT | `16106127360` (15 GB) |
| used_space | BIGINT | `0` |
| is_active | BOOLEAN | `true` |
| google_id | TEXT NOT NULL | Google's unique user ID |
| created_at | TIMESTAMPTZ | `now()` |
| updated_at | TIMESTAMPTZ | `now()` |

Unique constraint: `(user_id, google_id)`. Indexes: `(user_id, created_at)`, `(user_id, account_email)`.

### `password_entries`
| Column | Type | Default |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK→auth.users | |
| title | TEXT NOT NULL | |
| username | TEXT | `''` |
| url | TEXT | `''` |
| encrypted_password | TEXT NOT NULL | AES-256-CBC encrypted |
| created_at | TIMESTAMPTZ | `now()` |
| updated_at | TIMESTAMPTZ | `now()` |

Index: `(user_id, updated_at DESC)`. RLS: Separate SELECT/INSERT/UPDATE/DELETE policies.

### `activity_events`
| Column | Type | Default |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK→auth.users | |
| event_type | TEXT NOT NULL | e.g. `password_revealed`, `file_uploaded` |
| resource_type | TEXT NOT NULL | e.g. `password`, `drive_file` |
| resource_name | TEXT | `''` |
| metadata | JSONB | `'{}'` |
| created_at | TIMESTAMPTZ | `now()` |

Index: `(user_id, created_at DESC)`. RLS: SELECT + INSERT only (append-only audit log).

### `hidden_vault_accounts`
| Column | Type | Default |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK→auth.users UNIQUE | One per user |
| email | TEXT NOT NULL | |
| password_hash | TEXT NOT NULL | `scrypt` with per-user random salt |
| session_token_hash | TEXT (nullable) | Scrypt hash with hardcoded salt |
| session_expires_at | TIMESTAMPTZ (nullable) | 8-hour TTL |
| created_at | TIMESTAMPTZ | `now()` |
| updated_at | TIMESTAMPTZ | `now()` |

Unique index: `lower(email)`. **No TypeScript interface defined** — accessed via raw Supabase queries.

---

## 4. Data Layer — `src/lib/supabase/models.ts`

Every function creates a new Supabase client via `db()` → `createClient()`. RLS scopes all queries.

**Password functions** (explicitly filter by `user_id`):
- `getPasswordEntries(userId)` — returns all except `encrypted_password`
- `getPasswordEntry(userId, id)` — single entry with password
- `createPasswordEntry(data)` — insert
- `updatePasswordEntry(id, userId, data)` — auto-sets `updated_at`
- `deletePasswordEntry(id, userId)` — explicit user_id check

**Note functions:**
- `getNotes(userId)`, `getNote(id)`, `getNotesByFile(userId, fileId)`
- `createNote(data)`, `updateNote(id, data)`, `deleteNote(id)` — delete has NO user_id check (RLS only)

**Collection functions:**
- `getCollections(userId)`, `getCollection(id)`, `createCollection(data)`, `deleteCollection(id)` — no user_id check on delete

**Tag functions:**
- `getTags(userId)`, `createTag(data)` (with race-condition dedup), `deleteTag(id)` — no user_id check on delete

**Google Account functions:**
- `getGoogleAccounts(userId)`, `getActiveGoogleAccounts(userId)`, `getGoogleAccountDocumentById(userId, id)`
- `getGoogleAccountByGoogleId(googleId)` — **no user_id filter** (used during OAuth callback)
- `createGoogleAccount(data)`, `updateGoogleAccount(id, data)`, `updateToken(id, accessToken, tokenExpiry)`, `deleteGoogleAccount(id)` — no user_id check

**Activity functions:**
- `createActivityEvent(data)`, `getActivityEvents(userId, limit?)` — gracefully returns `[]` on missing table errors

---

## 5. Encryption — `src/lib/encryption.ts`

- **Algorithm:** AES-256-CBC (no HMAC/MAC)
- **Key:** 32-byte from `ENCRYPTION_KEY` env var (64 hex chars → raw bytes, or passphrase → SHA-256 hash)
- **Format:** `iv_base64:ciphertext_base64`
- **Used for:** Google refresh tokens, passwords
- **`ENCRYPTION_KEY` must be identical across environments** or existing encrypted data is irrecoverable

---

## 6. Authentication Flow

### Supabase Auth (Email/Password)
1. User enters email/password on login or signup page
2. `supabase.auth.signInWithPassword()` (login) or `supabase.auth.signUp()` (signup)
3. Signup sends confirmation email → user clicks link → `/auth/callback` route exchanges code for session
4. Session stored as Supabase cookies (`sb-*-auth-token`)
5. All API routes verify via `createClient().auth.getUser()`

### Google OAuth (Drive Connection)
1. User clicks "Connect Drive" → `GET /api/auth/google/connect`
2. Server builds OAuth URL with state (`base64url({ uid, ts })`) + `getGoogleRedirectUri()`
3. Redirect to Google → user authorizes → Google redirects to `/api/auth/google/callback`
4. Server exchanges code for tokens (access + refresh + expiry)
5. Stores encrypted refresh token, plaintext access token, profile info in `google_accounts` table
6. **Redirect URI auto-derives** from `VERCEL_URL` if `GOOGLE_REDIRECT_URI` not set

### Middleware (`src/proxy.ts`)
- Exports `proxy()` function + `config.matcher`
- Checks `supabase.auth.getUser()` on every request
- Redirects unauthenticated users to `/login` (except `/api/*`, `/login`, `/signup`, `/auth`, static files)
- Redirects authenticated users away from auth pages to `/dashboard`

### Hidden Vault (Second-Factor)
- Separate password system using `scrypt` hashing
- Session stored as `hidden_vault_session` cookie (httpOnly, 8hr TTL)
- Signup/login/logout via `POST /api/hidden-vault`
- Session validation: `scrypt(session, "hidden-vault-session", 32)` compared to stored hash

---

## 7. Google Drive Integration

### Client — `src/lib/google-drive/client.ts`
- Wraps Google Drive REST API v3
- **Base URLs:** `DRIVE_BASE = "https://www.googleapis.com/drive/v3"`, `DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3"`
- **Token refresh:** On 401, decrypts refresh token, gets new access token, updates DB, retries
- **`driveFetch`/`driveFetchRaw`:** Always sends Authorization header on first call
- **Upload:** Multipart with explicit `Content-Length` (Next.js server fetch drops the `Location` header from resumable uploads)
- **`listFiles(folderId)`:** Queries `'FOLDER_ID' in parents and trashed=false`
- **`search(query)`:** Searches `'me' in owners and fullText contains 'QUERY'`
- **`about()`:** Returns `{ usage, limit }` storage quota

### Pool — `src/lib/google-drive/pool.ts`
- **`getStoragePool(userId)`:** Aggregates quota across all active accounts
- **`pickSmartDrive(userId)`:** Returns account with most free space
- **`pickDriveForUpload(userId, mode, accountId)`:** Smart (auto) or Manual (user-specified)
- **`listRootFiles(userId)`:** Lists root-level files across all accounts, sorted by modified date
- **`listRecentFiles(userId, limit)`:** Truncates `listRootFiles`

---

## 8. API Routes Summary

All API routes require Supabase auth (`getUser()`) unless noted.

| Route | Methods | Purpose |
|---|---|---|
| `/api/auth/google/connect` | GET | Generate Google OAuth URL |
| `/api/auth/google/callback` | GET | OAuth callback, exchange + store tokens |
| `/api/beta-signups` | POST | **Public** — email waitlist signup |
| `/api/ai/chat` | POST | Chat with Gengar (Groq AI) with vault context |
| `/api/drive/files` | GET | List files (all accounts or one, with optional search) |
| `/api/drive/files/[fileId]` | GET, PATCH, DELETE | Download stream, rename, delete |
| `/api/drive/folders` | POST | Create Drive folder (accepts JSON or FormData) |
| `/api/storage/accounts` | GET, DELETE | List/disconnect Drive accounts |
| `/api/storage/pool` | GET | Aggregate storage quota |
| `/api/storage/upload` | POST | Upload file to Drive (smart/manual routing, multipart) |
| `/api/passwords` | GET, POST | List/create password entries |
| `/api/passwords/[id]` | GET, PATCH, DELETE | Read (decrypt)/update (re-encrypt)/delete password |
| `/api/notes` | GET, POST | List/create notes |
| `/api/notes/[id]` | GET, PATCH, DELETE | Read/update/delete note |
| `/api/collections` | GET, POST | List/create collections |
| `/api/collections/[id]` | DELETE | Delete collection |
| `/api/tags` | GET, POST | List/create tags |
| `/api/tags/[id]` | DELETE | Delete tag |
| `/api/hidden-vault` | GET, POST | Status check, signup/login/logout |

---

## 9. Frontend Architecture

### Page Pattern
All dashboard pages follow: **Server Component** (auth + data fetch) → **Client Component** (UI).

```
page.tsx (server) → createClient() → getUser() → fetch data → pass as props →
  <ClientComponent data={...} />
```

### Client Components (with state management)

**`DashboardOverview`** — Main dashboard. Shows storage stats, per-drive cards, quick links. Receives accounts from server page.

**`FileExplorer`** (~1300 lines) — The largest component. Contains:
- `FileExplorer` (main) — Account filter, sort dropdown, search, breadcrumbs, grid, upload/preview modals
- `FileCard` (memo) — Individual item card with icon, name, meta, action buttons
- `UploadModal` — File/folder upload with smart/manual routing, drag-and-drop
- `PreviewModal` — Image/video/audio/PDF preview

State: `useState` only (no global state). Key states: `items`, `sortedItems` (useMemo), `currentFolderId`, `currentAccountId`, `breadcrumbs`, `sortKey`, `searchQuery`, `uploadOpen`, `previewItem`, `renamingId`.

**`DrivesManager`** — Lists connected accounts, connect/unlink buttons, per-account usage bars.

**`StoragePoolMeter`** — Aggregate storage visualization with color-coded thresholds.

**`Sidebar`** — Navigation with desktop fixed + mobile animated drawer. Items: Storage (`/dashboard`), Drives (`/dashboard/settings`).

**`Header`** — User email display, dropdown with settings/drives links.

**Password Manager, Notes, Collections, Tags, Activity, Assistant** — Feature-specific client components.

### Design Tokens (`globals.css`)

```
bg:         #0c0c12       surface:    #16161f
surface-h:  #1e1e2c       border:     #2a2a3a
neon:       #ff2d78       neon-h:     #ff5c95
crimson:    #a73248       crimson-h:  #c64860
secondary:  #f59e0b       text:       #e4e4e7
text-muted: #7c7c8a       danger:     #f87171
```

Pixel-art overrides: All `--radius-*` tokens set to 2-6px (square corners). Grid background pattern on body. Grain + scanline overlays. Custom pixel shadows (`.pixel-shadow-neon`, `.pixel-shadow-crimson`, `.pixel-shadow-dark`).

### FileExplorer Category Icons

10 file categories with distinct colors:
| Category | Icon | Color |
|---|---|---|
| folder | FolderOpen | crimson glow |
| image | Image | emerald-400 |
| video | Video | sky-400 |
| audio | Music | violet-400 |
| pdf | FileText | red-400 |
| document | FileText | blue-400 |
| spreadsheet | FileSpreadsheet | lime-400 |
| presentation | Presentation | orange-400 |
| code | FileCode | fuchsia-400 |
| archive | Archive | amber-400 |
| file | File | neon |

### Sort Options (9 modes)
- Name A–Z, Name Z–A
- Modified Newest, Modified Oldest
- Size Largest, Size Smallest
- File Type (categories A–Z)
- Drive / Account (email A–Z)
- Folders / Files (groups by type)

Folders always sort first regardless of sort key.

---

## 10. AI Assistant

- **Model:** Groq API, defaults to `openai/gpt-oss-20b` (configurable via `GROQ_MODEL`)
- **Context:** `buildVaultContext()` assembles notes, collections, tags, and Drive file inventory (up to 80K chars, 8s timeout for Drive)
- **System prompt:** Gengar persona — "sharp friend from the neighborhood", vault-aware, read-only
- **Profile names:** Used for greeting/addressing user
- **Limits:** 12 messages max, 8K chars per message, 30s timeout, temperature 0.2, max_tokens 1200

---

## 11. Environment Variables

| Variable | Required | Scope | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public | `https://*.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Conditional | Server | Only for demo-user script |
| `GOOGLE_CLIENT_ID` | Yes (for Drive) | Server | Google Cloud Console OAuth |
| `GOOGLE_CLIENT_SECRET` | Yes (for Drive) | Server | Google Cloud Console OAuth |
| `GOOGLE_REDIRECT_URI` | No (auto) | Server | Falls back to `VERCEL_URL` or localhost |
| `ENCRYPTION_KEY` | Yes | Server | 64-char hex. **Must be identical across envs** |
| `GROQ_API_KEY` | Yes (for AI) | Server | Groq API key |
| `GROQ_MODEL` | No | Server | Default: `openai/gpt-oss-20b` |

---

## 12. Deployment — Vercel

### What to set in Vercel (Settings → Environment Variables):
All variables from `.env.local`. **Critical:** `ENCRYPTION_KEY` must match local exactly.

### Google Cloud Console — Authorized redirect URIs:
- `http://localhost:3000/api/auth/google/callback` (local)
- `https://zekora.vercel.app/api/auth/google/callback` (production)

### Supabase — Allowed Redirect URLs:
- `http://localhost:3000/auth/callback` (local)
- `https://zekora.vercel.app/auth/callback` (production)

### Build:
- `npm run build` passes clean (Next.js 16 + Turbopack)
- TypeScript: 0 errors
- ESLint: 2 errors (set-state-in-effect, prefer-const), 19 warnings (unused imports, `<img>` elements)

---

## 13. Known Issues & Technical Debt

### Critical
1. **Middleware may not be wired** — `src/proxy.ts` exports `proxy()` but Next.js expects `src/middleware.ts`. The build output shows `ƒ Proxy (Middleware)` suggesting it may work in Next.js 16, but should be verified.
2. **Google OAuth redirect URI wrong on Vercel** — Currently set to `/dashboard` instead of `/api/auth/google/callback`.

### Security
3. AES-CBC without MAC (no authenticated encryption) — vulnerable to padding oracle
4. Access tokens stored in plaintext in DB
5. No rate limiting on any endpoint
6. Hidden Vault session hash uses hardcoded salt
7. No `timingSafeEqual` for session token comparison
8. `getGoogleAccountByGoogleId` has no user_id filter

### Code Quality
9. Dead code: 6+ files (`connected-drives-manager.tsx`, `storage-pool-meter.tsx` old, `dashboard-content.tsx`, `file-upload.tsx` old, `file-grid.tsx`, `supabase/middleware.ts`)
10. Duplicate types: `FileExplorer.DriveItem` vs `types/index.ts.DriveNavItem`
11. `FileExplorer.tsx` is a 1300-line monolith (4 components in one file)
12. Supabase client re-created per render in `header.tsx`
13. `formatFileSize` only handles up to GB (undefined for TB+)
14. Incomplete design system migration (pixel-art vs old rounded components)
15. No error feedback UI in FileExplorer for search/rename/delete failures
16. `formatDate` shows "just now" for future dates

### Data Layer
17. `deleteNote`, `deleteTag`, `deleteCollection`, `deleteGoogleAccount` don't filter by user_id (RLS only)
18. Every DB query in `models.ts` creates a new Supabase client
19. `hidden_vault_accounts` has no TypeScript interface
20. `vault-context.ts` truncation may cut JSON mid-string (produces invalid JSON)

---

## 14. Scripts

### `npm run db:demo-user`
Runs `scripts/create-demo-user.mjs` which creates `zach@gmail.com` / `123456789` via Supabase Admin API. Requires remote Supabase URL (validates `https://*.supabase.co` pattern). Handles 409 "already registered" gracefully.

---

## 15. Key Design Decisions

1. **No global state** — All state is component-local `useState`. No React Context, Redux, or Zustand.
2. **Server components for auth** — Every page authenticates server-side before rendering client components.
3. **API routes for mutations** — All data changes go through `/api/*` routes. No React Server Actions.
4. **Multi-account Drive pooling** — Files across multiple Google accounts are presented as a single virtual drive.
5. **Smart routing** — Uploads automatically go to the drive with the most free space.
6. **Multipart uploads** — Abandoned resumable uploads because Next.js server fetch lost the `Location` header. Uses multipart with explicit `Content-Length`.
7. **Encryption at rest** — Passwords and refresh tokens encrypted with AES-256-CBC using a single `ENCRYPTION_KEY`.
8. **Pixel-art aesthetic** — Dark retro theme with square corners, scanlines, grain overlays, and neon/crimson accents.
