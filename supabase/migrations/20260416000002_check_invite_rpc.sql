-- Migration: Create RPC to validate invite tokens without redeeming them
-- Fixes RLS blocking anonymous users from viewing invite data

CREATE OR REPLACE FUNCTION public.check_invite_token(raw_token TEXT)
RETURNS jsonb AS $$
DECLARE
  v_hash TEXT;
  v_result jsonb;
BEGIN
  -- Rate limit: Max 20 requests per minute per IP
  IF NOT public.check_rate_limit('check_invite_token', 20, 60) THEN
    RAISE EXCEPTION 'Muitas tentativas. Por favor, aguarde alguns minutos e tente novamente.';
  END IF;

  v_hash := encode(sha256(raw_token::bytea), 'hex');

  -- First check invite_links
  SELECT jsonb_build_object(
    'type', 'link',
    'id', il.id,
    'tenant_id', il.tenant_id,
    'role_id', il.role_id,
    'created_by', il.created_by,
    'expires_at', il.expires_at,
    'tenant', jsonb_build_object('name', t.name, 'slug', t.slug),
    'role', jsonb_build_object('name', r.name, 'display_name', r.display_name)
  ) INTO v_result
  FROM public.invite_links il
  JOIN public.tenants t ON il.tenant_id = t.id
  JOIN public.roles r ON il.role_id = r.id
  WHERE il.token_hash = v_hash
    AND il.revoked = false
    AND il.expires_at > NOW()
    AND (il.max_uses IS NULL OR il.current_uses < il.max_uses);

  IF v_result IS NOT NULL THEN
    RETURN v_result;
  END IF;

  -- Then check invitations table
  SELECT jsonb_build_object(
    'type', 'email',
    'id', i.id,
    'tenant_id', i.tenant_id,
    'email', i.email,
    'role_id', i.role_id,
    'invited_by', i.invited_by,
    'expires_at', i.expires_at,
    'tenant', jsonb_build_object('name', t.name, 'slug', t.slug),
    'role', jsonb_build_object('name', r.name, 'display_name', r.display_name)
  ) INTO v_result
  FROM public.invitations i
  JOIN public.tenants t ON i.tenant_id = t.id
  JOIN public.roles r ON i.role_id = r.id
  WHERE i.token_hash = v_hash
    AND i.status = 'pending'
    AND i.expires_at > NOW();

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
