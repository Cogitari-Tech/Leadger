-- Migration: Create a native database sliding-window rate limiter for public RPCs
-- Protects against brute-force attacks on unauthenticated endpoints

CREATE TABLE IF NOT EXISTS public.rpc_rate_limits (
  ip_address TEXT,
  endpoint TEXT,
  request_count INT DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (ip_address, endpoint)
);

-- Enable RLS but define no policies, so it's only accessible via SECURITY DEFINER functions
ALTER TABLE public.rpc_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_endpoint TEXT, p_max_requests INT, p_window_seconds INT)
RETURNS BOOLEAN AS $$
DECLARE
  v_ip TEXT;
  v_count INT;
BEGIN
  -- Extract IP from request headers (Supabase forwards it via Cloudflare/Kong)
  v_ip := COALESCE(
    current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
    current_setting('request.headers', true)::jsonb->>'x-real-ip',
    'unknown'
  );

  -- Handle multiple IPs in x-forwarded-for (take the first one)
  v_ip := trim(split_part(v_ip, ',', 1));

  IF v_ip = 'unknown' THEN
    -- If no IP is detected, we still want to avoid total bypass. We can fallback to a generic bucket or allow.
    -- For safety in dev, we will allow it, but in production Kong always provides x-forwarded-for.
    v_ip := '127.0.0.1';
  END IF;

  -- Upsert: Update count or reset if window has passed
  INSERT INTO public.rpc_rate_limits (ip_address, endpoint, request_count, window_start)
  VALUES (v_ip, p_endpoint, 1, NOW())
  ON CONFLICT (ip_address, endpoint) DO UPDATE
  SET 
    request_count = CASE 
      WHEN public.rpc_rate_limits.window_start < NOW() - (p_window_seconds || ' seconds')::interval 
      THEN 1 
      ELSE public.rpc_rate_limits.request_count + 1 
    END,
    window_start = CASE 
      WHEN public.rpc_rate_limits.window_start < NOW() - (p_window_seconds || ' seconds')::interval 
      THEN NOW() 
      ELSE public.rpc_rate_limits.window_start 
    END
  RETURNING request_count INTO v_count;

  IF v_count > p_max_requests THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
