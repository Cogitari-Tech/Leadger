import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "CRITICAL: Supabase credentials missing. Check your .env file.",
  );
  console.error("Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
}

// Fallback to avoid crash, but client will fail on requests
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
);
