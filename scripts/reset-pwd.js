const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findAndResetUser() {
  const userId = "69fc7475-5047-47ce-ac0b-8fbdccbf7bb3";
  const email = "teste@cogitari.com";
  const newPassword = "Cogitari@2026!Dev";

  console.log(`Updating password for userId ${userId} (${email})...`);
  const { data: updated, error: updateError } =
    await supabase.auth.admin.updateUserById(userId, { password: newPassword });

  if (updateError) {
    console.log("Error updating password:", updateError);
  } else {
    console.log("Password updated successfully!");
  }
}

findAndResetUser();
