-- ==========================================================
-- FASE 2: Auto-provisionamento de Tenant no Registro
-- Este trigger é acionado via Supabase Auth sempre que
-- um novo usuário (auth.users) for criado.
-- ==========================================================

-- Remove functions/triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_registration();

CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_owner_role_id UUID;
  v_company_name TEXT;
  v_user_name TEXT;
BEGIN
  -- Extrair dados do metadata do usuário (caso preenchidos via SignUp)
  v_company_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'companyName'), '');
  v_user_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), '');
  
  -- Fallback se empresa vier vazia
  IF v_company_name IS NULL THEN
    -- Exemplo: "maria" de maria@empresa.com
    v_company_name := INITCAP(SPLIT_PART(NEW.email, '@', 1)) || ' Workspace';
  END IF;

  -- 1. Obter o ID da role 'owner' (role de sistema)
  SELECT id INTO v_owner_role_id 
  FROM public.roles 
  WHERE name = 'owner' AND is_system = true 
  LIMIT 1;

  -- Verifica se a role existe (sanity check)
  IF v_owner_role_id IS NULL THEN
    RAISE LOG 'Role "owner" not found. Cannot auto-provision user %', NEW.id;
    RETURN NEW;
  END IF;

  -- 2. Criar o novo Tenant vinculado a ele
  INSERT INTO public.tenants (name, plan, plan_status)
  VALUES (v_company_name, 'free', 'active')
  RETURNING id INTO v_tenant_id;

  -- 3. Vincular o usuário recém-criado a este tenant com a role de Owner
  INSERT INTO public.tenant_members (tenant_id, user_id, role_id, status)
  VALUES (v_tenant_id, NEW.id, v_owner_role_id, 'active');

  -- 4. Atualizar o app_metadata do usuário no gateway Auth para refletir o tenant_id
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('tenant_id', v_tenant_id)
  WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, apenas logamos para não bloquear a criação do auth.user
  RAISE LOG 'Error in handle_new_user_registration for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar o Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_registration();
