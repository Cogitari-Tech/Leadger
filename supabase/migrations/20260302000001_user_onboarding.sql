-- ==========================================================
-- ADD user_onboarding_completed TO tenant_members
-- ==========================================================

ALTER TABLE public.tenant_members
  ADD COLUMN IF NOT EXISTS user_onboarding_completed BOOLEAN DEFAULT false;
