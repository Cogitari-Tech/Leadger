-- ==========================================================
-- Migration: Multi-Tenant Onboarding System
-- Phase A: Conditional signup, access requests, invite links,
--          RBAC hierarchy enforcement, owner constraint
-- ==========================================================

-- ============================================================
-- 1. ALTER tenants — Add company profile columns
-- ============================================================
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS cnpj VARCHAR(18),
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Ensure all existing tenants have a slug
UPDATE public.tenants SET slug = 'tenant-' || LEFT(id::text, 8) WHERE slug IS NULL;
ALTER TABLE public.tenants ALTER COLUMN slug SET NOT NULL;

-- ============================================================
-- 2. CREATE access_requests — Join requests from users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ar_tenant ON public.access_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ar_user ON public.access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_status ON public.access_requests(status);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Users can insert their own requests
DROP POLICY IF EXISTS "ar_insert_own" ON public.access_requests;
CREATE POLICY "ar_insert_own" ON public.access_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can see their own requests
DROP POLICY IF EXISTS "ar_select_own" ON public.access_requests;
CREATE POLICY "ar_select_own" ON public.access_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Owner/Admin of the tenant can see and manage requests
DROP POLICY IF EXISTS "ar_manage_tenant" ON public.access_requests;
CREATE POLICY "ar_manage_tenant" ON public.access_requests
  FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      JOIN public.roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND r.name IN ('owner', 'admin')
    )
  );

-- Service role full access
DROP POLICY IF EXISTS "ar_service" ON public.access_requests;
CREATE POLICY "ar_service" ON public.access_requests
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- 3. CREATE invite_links — Secure invite links with hashed tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invite_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  max_uses INT DEFAULT 1,
  current_uses INT DEFAULT 0,
  revoked BOOLEAN DEFAULT false,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_il_tenant ON public.invite_links(tenant_id);
CREATE INDEX IF NOT EXISTS idx_il_token ON public.invite_links(token_hash);

ALTER TABLE public.invite_links ENABLE ROW LEVEL SECURITY;

-- Owner/Admin can manage invite links for their tenant
DROP POLICY IF EXISTS "il_manage" ON public.invite_links;
CREATE POLICY "il_manage" ON public.invite_links
  FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      JOIN public.roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND r.name IN ('owner', 'admin')
    )
  );

-- Manager can create invite links only for auditor/viewer roles
DROP POLICY IF EXISTS "il_manager_create" ON public.invite_links;
CREATE POLICY "il_manager_create" ON public.invite_links
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tm.tenant_id FROM public.tenant_members tm
      JOIN public.roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND r.name = 'manager'
    )
    AND role_id IN (
      SELECT id FROM public.roles WHERE name IN ('auditor', 'viewer') AND is_system = true
    )
  );

-- Service role full access
DROP POLICY IF EXISTS "il_service" ON public.invite_links;
CREATE POLICY "il_service" ON public.invite_links
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================
-- 4. ALTER invitations — Add token_hash column
-- ============================================================
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS token_hash TEXT;

-- Migrate existing plain tokens to hash (SHA-256)
UPDATE public.invitations
SET token_hash = encode(sha256(token::bytea), 'hex')
WHERE token_hash IS NULL AND token IS NOT NULL;

-- ============================================================
-- 5. Public tenant search policy (for join requests)
-- ============================================================
DROP POLICY IF EXISTS "tenants_public_search" ON public.tenants;
CREATE POLICY "tenants_public_search" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    is_private = false
    OR id IN (SELECT tm.tenant_id FROM public.tenant_members tm WHERE tm.user_id = auth.uid())
  );

-- ============================================================
-- 6. Rewrite handle_new_user_registration — Conditional
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_registration();

CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_owner_role_id UUID;
  v_company_name TEXT;
  v_signup_mode TEXT;
  v_invite_token TEXT;
  v_invite_record RECORD;
  v_slug TEXT;
BEGIN
  -- Extract signup mode from user metadata
  v_signup_mode := COALESCE(NEW.raw_user_meta_data->>'signup_mode', 'create');
  v_invite_token := NEW.raw_user_meta_data->>'invite_token';
  v_company_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'companyName'), '');

  -- ─── MODE 1: Create new company ───────────────────────
  IF v_signup_mode = 'create' THEN
    IF v_company_name IS NULL THEN
      v_company_name := INITCAP(SPLIT_PART(NEW.email, '@', 1)) || ' Workspace';
    END IF;

    SELECT id INTO v_owner_role_id
    FROM public.roles WHERE name = 'owner' AND is_system = true LIMIT 1;

    IF v_owner_role_id IS NULL THEN
      RAISE LOG 'Role "owner" not found for user %', NEW.id;
      RETURN NEW;
    END IF;

    -- Generate slug from company name
    v_slug := LOWER(REGEXP_REPLACE(TRIM(v_company_name), '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := TRIM(BOTH '-' FROM v_slug);

    -- Ensure slug uniqueness by appending random suffix if needed
    IF EXISTS (SELECT 1 FROM public.tenants WHERE slug = v_slug) THEN
      v_slug := v_slug || '-' || LEFT(gen_random_uuid()::text, 4);
    END IF;

    INSERT INTO public.tenants (name, slug, plan, plan_status)
    VALUES (v_company_name, v_slug, 'free', 'active')
    RETURNING id INTO v_tenant_id;

    INSERT INTO public.tenant_members (tenant_id, user_id, role_id, status)
    VALUES (v_tenant_id, NEW.id, v_owner_role_id, 'active');

    UPDATE auth.users
    SET raw_app_meta_data =
      COALESCE(raw_app_meta_data, '{}'::jsonb) ||
      jsonb_build_object('tenant_id', v_tenant_id)
    WHERE id = NEW.id;

  -- ─── MODE 2: Join existing company (access request) ───
  ELSIF v_signup_mode = 'join' THEN
    -- Do NOT create a tenant. User remains unassociated until approved.
    -- The access_request is created by the frontend after signup.
    NULL;

  -- ─── MODE 3: Invited via email token ──────────────────
  ELSIF v_signup_mode = 'invite' AND v_invite_token IS NOT NULL THEN
    SELECT * INTO v_invite_record
    FROM public.invitations
    WHERE token_hash = encode(sha256(v_invite_token::bytea), 'hex')
      AND status = 'pending'
      AND expires_at > NOW();

    IF v_invite_record IS NOT NULL THEN
      INSERT INTO public.tenant_members (tenant_id, user_id, role_id, status)
      VALUES (v_invite_record.tenant_id, NEW.id, v_invite_record.role_id, 'active');

      UPDATE public.invitations SET status = 'accepted', accepted_at = NOW()
      WHERE id = v_invite_record.id;

      UPDATE auth.users
      SET raw_app_meta_data =
        COALESCE(raw_app_meta_data, '{}'::jsonb) ||
        jsonb_build_object('tenant_id', v_invite_record.tenant_id)
      WHERE id = NEW.id;
    END IF;

  -- ─── MODE 4: Invited via invite link ──────────────────
  ELSIF v_signup_mode = 'invite_link' AND v_invite_token IS NOT NULL THEN
    SELECT * INTO v_invite_record
    FROM public.invite_links
    WHERE token_hash = encode(sha256(v_invite_token::bytea), 'hex')
      AND revoked = false
      AND expires_at > NOW()
      AND (max_uses IS NULL OR current_uses < max_uses);

    IF v_invite_record IS NOT NULL THEN
      INSERT INTO public.tenant_members (tenant_id, user_id, role_id, status)
      VALUES (v_invite_record.tenant_id, NEW.id, v_invite_record.role_id, 'active');

      UPDATE public.invite_links
      SET current_uses = current_uses + 1
      WHERE id = v_invite_record.id;

      UPDATE auth.users
      SET raw_app_meta_data =
        COALESCE(raw_app_meta_data, '{}'::jsonb) ||
        jsonb_build_object('tenant_id', v_invite_record.tenant_id)
      WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user_registration for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_registration();

-- ============================================================
-- 7. RBAC Hierarchy Enforcement Trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.validate_role_change()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_level INT;
  v_target_current_level INT;
  v_target_new_level INT;
BEGIN
  -- Skip if role_id hasn't changed
  IF OLD.role_id IS NOT DISTINCT FROM NEW.role_id THEN
    RETURN NEW;
  END IF;

  -- Get actor's hierarchy level
  SELECT r.hierarchy_level INTO v_actor_level
  FROM public.tenant_members tm
  JOIN public.roles r ON tm.role_id = r.id
  WHERE tm.user_id = auth.uid()
    AND tm.tenant_id = NEW.tenant_id
    AND tm.status = 'active';

  -- If actor not found (e.g. service_role), allow
  IF v_actor_level IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get target's current and new hierarchy levels
  SELECT hierarchy_level INTO v_target_current_level FROM public.roles WHERE id = OLD.role_id;
  SELECT hierarchy_level INTO v_target_new_level FROM public.roles WHERE id = NEW.role_id;

  -- Cannot change role of someone at same or higher level
  IF v_target_current_level >= v_actor_level THEN
    RAISE EXCEPTION 'Permissão negada: você não pode alterar o papel de um membro com hierarquia igual ou superior à sua.';
  END IF;

  -- Cannot promote someone to same or higher level than yourself
  IF v_target_new_level >= v_actor_level THEN
    RAISE EXCEPTION 'Permissão negada: você não pode promover alguém para um nível igual ou superior ao seu.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_validate_role_change ON public.tenant_members;
CREATE TRIGGER trg_validate_role_change
  BEFORE UPDATE ON public.tenant_members
  FOR EACH ROW EXECUTE FUNCTION public.validate_role_change();

-- ============================================================
-- 8. Owner Constraint — At least 1 Owner per tenant
-- ============================================================
CREATE OR REPLACE FUNCTION public.enforce_owner_constraint()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_count INT;
  v_owner_role_id UUID;
BEGIN
  SELECT id INTO v_owner_role_id
  FROM public.roles WHERE name = 'owner' AND is_system = true LIMIT 1;

  -- Only enforce when changing away from owner role or deleting an owner
  IF v_owner_role_id IS NOT NULL THEN
    IF (TG_OP = 'DELETE' AND OLD.role_id = v_owner_role_id AND OLD.status = 'active')
       OR (TG_OP = 'UPDATE' AND OLD.role_id = v_owner_role_id AND (NEW.role_id != v_owner_role_id OR NEW.status != 'active'))
    THEN
      SELECT COUNT(*) INTO v_owner_count
      FROM public.tenant_members
      WHERE tenant_id = OLD.tenant_id
        AND role_id = v_owner_role_id
        AND status = 'active'
        AND id != OLD.id;

      IF v_owner_count < 1 THEN
        RAISE EXCEPTION 'Operação bloqueada: a empresa deve ter pelo menos um Owner ativo.';
      END IF;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_owner ON public.tenant_members;
CREATE TRIGGER trg_enforce_owner
  BEFORE UPDATE OR DELETE ON public.tenant_members
  FOR EACH ROW EXECUTE FUNCTION public.enforce_owner_constraint();

-- ============================================================
-- 9. SQL Functions for invite link operations
-- ============================================================

-- Generate invite link hash (called from frontend with raw token)
CREATE OR REPLACE FUNCTION public.hash_invite_token(raw_token TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(sha256(raw_token::bytea), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validate and redeem an invite link
CREATE OR REPLACE FUNCTION public.redeem_invite_link(raw_token TEXT)
RETURNS TABLE(tenant_id UUID, role_id UUID, tenant_name TEXT, role_name TEXT) AS $$
DECLARE
  v_hash TEXT;
  v_link RECORD;
BEGIN
  v_hash := encode(sha256(raw_token::bytea), 'hex');

  SELECT il.*, t.name as t_name, r.name as r_name, r.display_name as r_display
  INTO v_link
  FROM public.invite_links il
  JOIN public.tenants t ON il.tenant_id = t.id
  JOIN public.roles r ON il.role_id = r.id
  WHERE il.token_hash = v_hash
    AND il.revoked = false
    AND il.expires_at > NOW()
    AND (il.max_uses IS NULL OR il.current_uses < il.max_uses);

  IF v_link IS NULL THEN
    RAISE EXCEPTION 'Link de convite inválido, expirado ou revogado.';
  END IF;

  -- Increment usage
  UPDATE public.invite_links SET current_uses = current_uses + 1 WHERE id = v_link.id;

  RETURN QUERY SELECT v_link.tenant_id, v_link.role_id, v_link.t_name, v_link.r_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Approve access request (creates tenant_member)
CREATE OR REPLACE FUNCTION public.approve_access_request(
  p_request_id UUID,
  p_role_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_request RECORD;
BEGIN
  SELECT * INTO v_request FROM public.access_requests WHERE id = p_request_id AND status = 'pending';

  IF v_request IS NULL THEN
    RAISE EXCEPTION 'Solicitação não encontrada ou já processada.';
  END IF;

  -- Create tenant member
  INSERT INTO public.tenant_members (tenant_id, user_id, role_id, status)
  VALUES (v_request.tenant_id, v_request.user_id, p_role_id, 'active')
  ON CONFLICT (tenant_id, user_id) DO UPDATE SET role_id = p_role_id, status = 'active';

  -- Update request status
  UPDATE public.access_requests
  SET status = 'approved', reviewed_by = auth.uid(), reviewed_at = NOW()
  WHERE id = p_request_id;

  -- Update user's app_metadata with tenant_id
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('tenant_id', v_request.tenant_id)
  WHERE id = v_request.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reject access request
CREATE OR REPLACE FUNCTION public.reject_access_request(p_request_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.access_requests
  SET status = 'rejected', reviewed_by = auth.uid(), reviewed_at = NOW()
  WHERE id = p_request_id AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
