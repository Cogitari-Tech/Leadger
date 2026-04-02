import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("[STARTUP] SUPABASE_URL is required but not set.");
}
if (!supabaseServiceKey) {
  throw new Error(
    "[STARTUP] SUPABASE_SERVICE_ROLE_KEY is required but not set.",
  );
}
if (!supabaseAnonKey) {
  throw new Error("[STARTUP] SUPABASE_ANON_KEY is required but not set.");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Creates a user-scoped client using the provided JWT token */
export const createScopedClient = (token: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
};
