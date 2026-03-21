-- ==========================================================
-- FIX: Resilient Registration & Tenant Provisioning
-- Handles AFTER INSERT (new users) and AFTER UPDATE (SSO/Retries)
-- ==========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_owner_role_id UUID;
  v_company_name TEXT;
  v_slug TEXT;
  v_signup_mode TEXT;
BEGIN
  -- 1. Pre-flight check: If tenant_id already exists in app_metadata, EXIT.
  -- This prevents recursive loops or double-provisioning.
  IF (NEW.raw_app_meta_data->>'tenant_id') IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- 2. Extract metadata
  v_signup_mode := NEW.raw_user_meta_data->>'signup_mode';
  v_company_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'companyName'), '');

  -- 3. Filter modes that don't need auto-provisioning here
  IF v_signup_mode IN ('join', 'invite') THEN
    RETURN NEW;
  END IF;

  -- 4. Default company name if missing
  IF v_company_name IS NULL THEN
    v_company_name := INITCAP(SPLIT_PART(NEW.email, '@', 1)) || ' Workspace';
  END IF;

  -- 5. Prepare Role and Slug
  SELECT id INTO v_owner_role_id 
  FROM public.roles 
  WHERE name = 'owner' AND is_system = true 
  LIMIT 1;

  IF v_owner_role_id IS NULL THEN
    RAISE WARNING 'CRITICAL: Role "owner" not found. Tenant provisioning skipped for user %', NEW.id;
    RETURN NEW;
  END IF;

  v_slug := LOWER(REGEXP_REPLACE(v_company_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || LEFT(NEW.id::text, 4);

  -- 6. Provision Tenant & Member
  -- We wrap this in a sub-block to handle potential unique constraint violations on slug gracefully
  BEGIN
    INSERT INTO public.tenants (name, slug, plan, plan_status, onboarding_completed)
    VALUES (v_company_name, v_slug, 'free', 'active', false)
    RETURNING id INTO v_tenant_id;

    INSERT INTO public.tenant_members (tenant_id, user_id, role_id, status, user_onboarding_completed)
    VALUES (v_tenant_id, NEW.id, v_owner_role_id, 'active', false);

    -- 7. Update app_metadata with the new tenant_id
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('tenant_id', v_tenant_id)
    WHERE id = NEW.id;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error during tenant provisioning for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger to catch both INSERT and UPDATE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_registration();
