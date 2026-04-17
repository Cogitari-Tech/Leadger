-- Fix tenant search for unauthenticated users (anon)
-- Allow anyone to search public tenants by name or slug
DROP POLICY IF EXISTS "tenants_public_search" ON public.tenants;

CREATE POLICY "tenants_public_search" ON public.tenants
  FOR SELECT TO public
  USING (
    is_private = false
    OR id IN (SELECT tm.tenant_id FROM public.tenant_members tm WHERE tm.user_id = auth.uid())
  );

-- Also fix access_requests insert trigger to intercept join requests when user is not confirmed
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_owner_role_id UUID;
  v_company_name TEXT;
  v_signup_mode TEXT;
  v_invite_token TEXT;
  v_join_tenant_id UUID;
  v_join_message TEXT;
  v_invite_record RECORD;
  v_slug TEXT;
BEGIN
  -- Extract from user metadata
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

    v_slug := LOWER(REGEXP_REPLACE(TRIM(v_company_name), '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := TRIM(BOTH '-' FROM v_slug);

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
    v_join_tenant_id := (NEW.raw_user_meta_data->>'join_tenant_id')::uuid;
    v_join_message := NEW.raw_user_meta_data->>'join_message';

    IF v_join_tenant_id IS NOT NULL THEN
      INSERT INTO public.access_requests (tenant_id, user_id, message)
      VALUES (v_join_tenant_id, NEW.id, v_join_message)
      ON CONFLICT DO NOTHING;
    END IF;

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
