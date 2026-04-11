import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "http://localhost:54321";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QtcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzEzNDg0MDAwLCJleHAiOjE4Njk2NDM5OTB9...replace with real token for local testing";

async function run() {
  // Use anon key, we'll try to login with a test user
  const sb = createClient("http://localhost:54321", process.env.VITE_SUPABASE_ANON_KEY || "");
  
  console.log("Signing up...");
  const { data: authData, error: authError } = await sb.auth.signUp({
    email: "test-bot-" + Date.now() + "@leadgers.com",
    password: "Password@123",
    options: {
      data: {
        name: "Test User",
        companyName: "Bot Corp",
        signup_mode: "create",
      }
    }
  });

  if (authError) {
    console.error("SignUp error:", authError);
    return;
  }
  
  console.log("Signed up user:", authData.user?.id);
  
  // Wait 1 second for triggers
  await new Promise(r => setTimeout(r, 1000));
  
  const { data: userRefreshed } = await sb.auth.getUser();
  console.log("App Metadata:", userRefreshed.user?.app_metadata);
  
  const tenantId = userRefreshed.user?.app_metadata?.tenant_id;
  
  console.log("Tenant ID from metadata:", tenantId);
  
  console.log("Fetching tenant_members...");
  const memberRes = await sb
    .from("tenant_members")
    .select("*")
    .eq("user_id", authData.user?.id)
    .single();
    
  console.log("Member Result:", memberRes);
  
  console.log("Fetching tenants...");
  const tenantRes = await sb
    .from("tenants")
    .select("*");
    
  console.log("Tenants Result (all visible):", tenantRes);
}

run().catch(console.error);
