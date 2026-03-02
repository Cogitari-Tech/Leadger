
-- ==========================================================
-- FIX: Update handle_new_user_registration to include 'slug'
-- The 'slug' column was made NOT NULL in a later migration,
-- breaking the auto-provisioning trigger.
-- ==========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
  v_tenant_id UUID;
  v_owner_role_id UUID;
  v_company_name TEXT;
  v_user_name TEXT;
  v_slug TEXT;
BEGIN
  -- Extrair dados do metadata do usuário
  v_company_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'companyName'), '');
  v_user_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), '');
  
  -- Fallback se empresa vier vazia
  IF v_company_name IS NULL THEN
    v_company_name := INITCAP(SPLIT_PART(NEW.email, '@', 1)) || ' Workspace';
  END IF;

  -- Gerar slug único inicial
  v_slug := LOWER(REGEXP_REPLACE(v_company_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || LEFT(NEW.id::text, 4);

  -- 1. Obter o ID da role 'owner' (role de sistema)
  SELECT id INTO v_owner_role_id 
  FROM public.roles 
  WHERE name = 'owner' AND is_system = true 
  LIMIT 1;

  -- 2. Criar o novo Tenant vinculado a ele (incluindo o slug obrigatório)
  INSERT INTO public.tenants (name, slug, plan, plan_status)
  VALUES (v_company_name, v_slug, 'free', 'active')
  RETURNING id INTO v_tenant_id;

  -- 3. Vincular o usuário recém-criado a este tenant com a role de Owner
  INSERT INTO public.tenant_members (tenant_id, user_id, role_id, status)
  VALUES (v_tenant_id, NEW.id, v_owner_role_id, 'active');

  -- 4. Atualizar o app_metadata do usuário
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('tenant_id', v_tenant_id)
  WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, logamos para não bloquear o auth.user
  -- NOTA: Como a transação do auth.user é a mesma, se disparar um erro REAL, o usuário não é criado.
  -- Usamos RAISE WARNING para logar sem abortar se possível, mas aqui estamos em AFTER INSERT.
  RAISE WARNING 'Error in handle_new_user_registration for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
