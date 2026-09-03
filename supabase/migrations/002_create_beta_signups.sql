-- Public beta waitlist submissions do not create Supabase Auth users.
CREATE TABLE IF NOT EXISTS public.beta_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.beta_signups ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.beta_signups TO anon, authenticated;

DROP POLICY IF EXISTS "beta signups insert anonymous" ON public.beta_signups;
CREATE POLICY "beta signups insert anonymous" ON public.beta_signups
  FOR INSERT TO anon, authenticated WITH CHECK (true);