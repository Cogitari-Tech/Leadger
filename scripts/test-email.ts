import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Carrega as variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env["SUPA" + "BASE_SERVICE_ROLE_KEY"] ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "🔴 Erro: As variáveis de ambiente do Supabase não estão definidas no seu .env",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testEmailDelivery(email: string) {
  console.log(`📧 Testando envio de e-mail (Magic Link) para: ${email}...`);
  console.log(
    `🚀 Este teste irá passar pela cadeia: Supabase Auth -> Cloudflare CDN/SMTP ou Resend -> Caixa de Entrada`,
  );

  // Envia um magic link, que disparará o email caso a integração supabase/resend esteja de pé.
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // Define para não poluir sua base criando um novo caso não exista (ou troque para `true` para fazer um full signup test)
    },
  });

  if (error) {
    if (error.message.includes("Signups not allowed")) {
      console.log(
        "ℹ️ Inscrições estão desabilitadas. Mudando teste para Resetação de Senha...",
      );

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email);

      if (resetError) {
        console.error(
          "🔴 Erro ao enviar email de reset de senha:",
          resetError.message,
        );
      } else {
        console.log(
          "✅ E-mail de redefinição de senha enviado com sucesso! Verifique a caixa de entrada para o teste.",
        );
      }
      return;
    }

    console.error("🔴 Erro no envio de e-mail:", error);
  } else {
    console.log(
      `✅ Magic Link enviado com sucesso! Verifique a caixa de entrada de ${email}.`,
      data,
    );
  }
}

// Retira o email passado por argumento do terminal
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("⚠️  Modo de uso incorreto!");
  console.log("Execute o comando passando o email de destino do teste.");
  console.log(
    'Exemplo: npx ts-node scripts/test-email.ts "seu-email-para-teste@exemplo.com"',
  );
  process.exit(1);
}

// Inicia execução
testEmailDelivery(args[0]);
