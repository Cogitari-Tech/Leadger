-- ==========================================================
-- Migration: Device Trusts for MFA Security
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.device_trusts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_info JSONB DEFAULT '{}'::jsonb,
  trusted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT false,
  UNIQUE(user_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_device_trusts_user ON public.device_trusts(user_id);
CREATE INDEX IF NOT EXISTS idx_device_trusts_device ON public.device_trusts(device_id);

ALTER TABLE public.device_trusts ENABLE ROW LEVEL SECURITY;

-- Users can see their own trusted devices
CREATE POLICY "device_trusts_select" ON public.device_trusts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own device trusts
CREATE POLICY "device_trusts_insert" ON public.device_trusts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update (e.g., revoke) their own device trusts
CREATE POLICY "device_trusts_update" ON public.device_trusts
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Service role full access
CREATE POLICY "device_trusts_service" ON public.device_trusts
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
