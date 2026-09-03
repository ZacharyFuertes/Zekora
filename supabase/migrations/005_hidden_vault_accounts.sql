-- One separate Hidden Vault credential set per Zekora user.
CREATE TABLE IF NOT EXISTS public.hidden_vault_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  session_token_hash TEXT,
  session_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS hidden_vault_accounts_email
  ON public.hidden_vault_accounts (lower(email));

ALTER TABLE public.hidden_vault_accounts ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.hidden_vault_accounts TO authenticated;

CREATE POLICY "hidden vault accounts own access" ON public.hidden_vault_accounts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
