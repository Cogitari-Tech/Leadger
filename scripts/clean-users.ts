import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("🔴 Erro: As variáveis de ambiente não estão definidas.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function cleanUsers() {
  console.log(`🔍 Listando todos os usuários...`);
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("🔴 Erro ao listar usuários:", listError);
    return;
  }

  let deleted = 0;
  for (const user of users) {
    if (!user.email) continue;

    // Protection: Never delete the primary test account or specific domains if not intended
    if (
      user.email === "teste@leadgers.com" ||
      user.email === "teste@cogitari.com"
    ) {
      console.log(`▶ Poupando conta persistente: ${user.email}`);
      continue;
    }

    const isTestPattern =
      user.email === "qa_vibe_test@leadgers.com" ||
      user.email === "test_removivel@leadgers.com" ||
      user.email === "qa_vibe_test_new@leadgers.com" ||
      user.email.startsWith("onboarding-test") ||
      user.email.endsWith("@cogitari.com"); // Also cover cogitari test domain

    if (isTestPattern) {
      console.log(`🗑 [TEST] Removendo usuário: ${user.email} (${user.id})...`);
    } else {
      console.log(
        `⚠️ [NON-PATTERN] Removendo usuário: ${user.email} (${user.id})...`,
      );
    }

    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`  🔴 Falha ao apagar o usuário ${user.email}:`, error);
    } else {
      console.log(`  ✅ Removido!`);
      deleted++;
    }
  }
  console.log(`🚀 Concluído! Limpamos ${deleted} usuários do ambiente.`);
}

cleanUsers();
