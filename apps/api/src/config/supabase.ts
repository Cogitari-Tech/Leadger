import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Helper to create a user-scoped client when needed
export const createScopedClient = (token: string) => {
  return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY || "", {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
};
