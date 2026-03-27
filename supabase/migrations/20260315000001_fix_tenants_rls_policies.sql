-- ==========================================================
-- FIX: Add missing UPDATE/INSERT RLS policies for tenants
-- and tenant_members tables.
--
-- ROOT CAUSE: The onboarding flow updates these tables from
-- the client side (authenticated user), but only SELECT and
-- service_role policies existed. Supabase silently returns
-- empty results for disallowed operations, causing the
-- onboarding_completed flag to never be set to true.
-- ==========================================================

-- ============================================================
-- 1. TENANTS — Allow owner/admin to update their own tenant
-- ============================================================
DROP POLICY IF EXISTS "tenants_update_owner_admin" ON public.tenants;
CREATE POLICY "tenants_update_owner_admin" ON public.tenants
  FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT tm.tenant_id
      FROM public.tenant_members tm
      JOIN public.roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND r.name IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    id IN (
      SELECT tm.tenant_id
      FROM public.tenant_members tm
      JOIN public.roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND r.name IN ('owner', 'admin')
    )
  );

-- ============================================================
-- 2. TENANT_MEMBERS — Allow users to update their own record
-- (e.g. user_onboarding_completed)
-- ============================================================
DROP POLICY IF EXISTS "tm_update_own" ON public.tenant_members;
CREATE POLICY "tm_update_own" ON public.tenant_members
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- ============================================================
-- 3. TENANT_MEMBERS — Allow owner/admin to update any member
-- in their tenant (for role changes, status changes, etc.)
-- ============================================================
DROP POLICY IF EXISTS "tm_update_owner_admin" ON public.tenant_members;
CREATE POLICY "tm_update_owner_admin" ON public.tenant_members
  FOR UPDATE TO authenticated
  USING (
    tenant_id IN (
      SELECT tm.tenant_id
      FROM public.tenant_members tm
      JOIN public.roles r ON tm.role_id = r.id
      WHERE tm.user_id = auth.uid()
        AND tm.status = 'active'
        AND r.name IN ('owner', 'admin')
    )
  );

-- ============================================================
-- 4. RPC: complete_onboarding — Atomic onboarding completion
-- Fallback server-side function with SECURITY DEFINER
-- ============================================================
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  p_tenant_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_member_exists BOOLEAN;
BEGIN
  -- Verify the user is actually a member of this tenant
  SELECT EXISTS(
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = p_tenant_id
      AND user_id = p_user_id
      AND status = 'active'
  ) INTO v_member_exists;

  IF NOT v_member_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is not an active member of this tenant');
  END IF;

  -- Update tenant onboarding flag
  UPDATE public.tenants
  SET onboarding_completed = true
  WHERE id = p_tenant_id;

  -- Update member onboarding flag
  UPDATE public.tenant_members
  SET user_onboarding_completed = true
  WHERE tenant_id = p_tenant_id
    AND user_id = p_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
