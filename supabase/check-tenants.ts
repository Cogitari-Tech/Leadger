import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.join(process.cwd(), "apps/web/.env.local") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTenants() {
  console.log("Checking recent tenant_members and tenants...");

  // Need service_role key to bypass RLS for administrative queries, or we can use admin API
  // Since we only have anon key in .env.local usually, let's see if we can do an RPC or just try a basic query.
  // Wait, RLS prevents fetching other tenants.

  const { data, error } = await supabase
    .from("tenants")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error(
      "Error fetching (expected if RLS blocks anon):",
      error.message,
    );
  } else {
    console.log("Recent Tenants:", data);
  }
}

checkTenants();
