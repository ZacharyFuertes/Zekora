-- ============================================================
-- Zekora vault schema (Supabase Postgres)
-- ------------------------------------------------------------
-- Supabase handles AUTHENTICATION only. All app data (notes,
-- collections, tags, and linked Google Drive credentials) lives
-- in Postgres with row-level security scoped to auth.uid().
-- File bytes live in the user's Google Drive, not in storage.
-- ============================================================

-- ---------- collections ----------
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  mood TEXT NOT NULL DEFAULT 'calm',
  color TEXT NOT NULL DEFAULT '#a78bfa',
  icon TEXT NOT NULL DEFAULT 'folder',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS collections_user_created
  ON public.collections (user_id, created_at DESC);

-- ---------- notes ----------
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'standalone'
    CHECK (type IN ('standalone', 'file-attachment')),
  file_id TEXT, -- Google Drive file id when type = 'file-attachment'
  tags TEXT[] NOT NULL DEFAULT '{}',
  collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  mood TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notes_user_updated
  ON public.notes (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS notes_user_file
  ON public.notes (user_id, file_id);

-- ---------- tags ----------
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#a78bfa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

-- ---------- google_accounts ----------
-- Linked Google Drive credentials. Refresh tokens are AES-256-CBC
-- encrypted at rest (see src/lib/encryption.ts) before storage.
CREATE TABLE IF NOT EXISTS public.google_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_email TEXT NOT NULL,
  encrypted_refresh_token TEXT NOT NULL,
  access_token TEXT NOT NULL DEFAULT '',
  token_expiry TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_space BIGINT NOT NULL DEFAULT 16106127360, -- 15 GB per account
  used_space BIGINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  google_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, google_id)
);

CREATE INDEX IF NOT EXISTS google_accounts_user_created
  ON public.google_accounts (user_id, created_at);

CREATE INDEX IF NOT EXISTS google_accounts_user_email
  ON public.google_accounts (user_id, account_email);

-- ============================================================
-- Row Level Security — every table is private per user
-- ============================================================
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_accounts ENABLE ROW LEVEL SECURITY;

-- collections
DROP POLICY IF EXISTS "collections select own" ON public.collections;
DROP POLICY IF EXISTS "collections insert own" ON public.collections;
DROP POLICY IF EXISTS "collections update own" ON public.collections;
DROP POLICY IF EXISTS "collections delete own" ON public.collections;
CREATE POLICY "collections select own" ON public.collections
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "collections insert own" ON public.collections
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections update own" ON public.collections
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections delete own" ON public.collections
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- notes
DROP POLICY IF EXISTS "notes select own" ON public.notes;
DROP POLICY IF EXISTS "notes insert own" ON public.notes;
DROP POLICY IF EXISTS "notes update own" ON public.notes;
DROP POLICY IF EXISTS "notes delete own" ON public.notes;
CREATE POLICY "notes select own" ON public.notes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notes insert own" ON public.notes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes update own" ON public.notes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes delete own" ON public.notes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- tags
DROP POLICY IF EXISTS "tags select own" ON public.tags;
DROP POLICY IF EXISTS "tags insert own" ON public.tags;
DROP POLICY IF EXISTS "tags update own" ON public.tags;
DROP POLICY IF EXISTS "tags delete own" ON public.tags;
CREATE POLICY "tags select own" ON public.tags
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "tags insert own" ON public.tags
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tags update own" ON public.tags
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tags delete own" ON public.tags
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- google_accounts
DROP POLICY IF EXISTS "google_accounts select own" ON public.google_accounts;
DROP POLICY IF EXISTS "google_accounts insert own" ON public.google_accounts;
DROP POLICY IF EXISTS "google_accounts update own" ON public.google_accounts;
DROP POLICY IF EXISTS "google_accounts delete own" ON public.google_accounts;
CREATE POLICY "google_accounts select own" ON public.google_accounts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "google_accounts insert own" ON public.google_accounts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "google_accounts update own" ON public.google_accounts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "google_accounts delete own" ON public.google_accounts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);