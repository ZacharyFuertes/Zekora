-- Explicit grants and policies for password CRUD.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.password_entries TO authenticated;

ALTER TABLE public.password_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "password entries own access" ON public.password_entries;
DROP POLICY IF EXISTS "password entries select own" ON public.password_entries;
DROP POLICY IF EXISTS "password entries insert own" ON public.password_entries;
DROP POLICY IF EXISTS "password entries update own" ON public.password_entries;
DROP POLICY IF EXISTS "password entries delete own" ON public.password_entries;

CREATE POLICY "password entries select own" ON public.password_entries
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "password entries insert own" ON public.password_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "password entries update own" ON public.password_entries
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "password entries delete own" ON public.password_entries
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
