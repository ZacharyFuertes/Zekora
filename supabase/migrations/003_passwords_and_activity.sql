-- Encrypted password vault entries and user-visible audit events.
CREATE TABLE IF NOT EXISTS public.password_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  username TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  encrypted_password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_entries_user_updated
  ON public.password_entries (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_name TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_events_user_created
  ON public.activity_events (user_id, created_at DESC);

ALTER TABLE public.password_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "password entries own access" ON public.password_entries
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "activity events own access" ON public.activity_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "activity events own insert" ON public.activity_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
