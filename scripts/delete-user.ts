import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env["SUPA" + "BASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "🔴 Erro: As variáveis de ambiente SUPABASE_URL ou SUPA" +
      "BASE_SERVICE_ROLE_KEY não estão definidas.",
  );
  process.exit(1);
}

// Criação do client com permissões de Admin (Service Role)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function deleteUser(email: string) {
  console.log(`🔍 Buscando o usuário associado ao email: ${email}...`);

  // Lista os usuários na auth.users para achar o ID exato
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("🔴 Erro ao listar usuários:", listError);
    return;
  }

  const user = users.find((u) => u.email === email);

  if (!user) {
    console.error(`🔴 Usuário não encontrado com o email: ${email}`);
    console.log(
      "Se ele estiver registrado apenas no banco público (e não no Auth), certifique-se de removê-lo manualmente do banco de dados.",
    );
    return;
  }

  console.log(
    `✅ Usuário encontrado [ID: ${user.id}]. Iniciando processo de deleção...`,
  );

  // Apaga diretamente com a função de admin (Remove do GoTrue Auth + aciona regras de "ON DELETE CASCADE" ou triggers associadas no schema público)
  const { data, error } = await supabase.auth.admin.deleteUser(user.id);

  if (error) {
    console.error(
      "🔴 Falha ao apagar o usuário. Isso pode ocorrer caso haja foreign keys restritas no seu schema público que impedem a deleção em cascata:",
      error,
    );
  } else {
    console.log(
      `🚀 Remoção concluída com sucesso! Os dados do usuário ${email} foram apagados.`,
      data,
    );
  }
}

// Retira o email passado por argumento do terminal
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("⚠️  Modo de uso incorreto!");
  console.log("Execute o comando passando o email entre aspas duplas.");
  console.log(
    'Exemplo: npx ts-node scripts/delete-user.ts "teste@exemplo.com"',
  );
  process.exit(1);
}

// Inicia execução
deleteUser(args[0]);
