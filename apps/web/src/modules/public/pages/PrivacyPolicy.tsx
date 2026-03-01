import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Voltar para a Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-500" /> Cogitari{" "}
              <span className="font-light opacity-70">Governance</span>
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-32">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
            Política de Privacidade
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-12">
            Última atualização: 28 de Fevereiro de 2026
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              1. Por que e como coletamos dados
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              A Cogitari Governance ("nós") tem o compromisso de proteger os
              dados e a privacidade dos nossos clientes ("você"). Tratamos
              informações com base na{" "}
              <a
                href="https://www.gov.br/esporte/pt-br/acesso-a-informacao/lgpd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline"
              >
                Lei Geral de Proteção de Dados (LGPD)
              </a>{" "}
              e regulações correspondentes como a{" "}
              <a
                href="https://gdpr-info.eu/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline"
              >
                GDPR
              </a>
              . Coletamos os dados inseridos por você na plataforma, nome,
              e-mail de acesso corporativo, IP e metadados de acesso (cookies
              essenciais).
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Esses dados são usados para: personalização da sua Dashboard de
              Governança corporativa, auditoria das ações (logs "Read-only"
              imutáveis) por questões legais e corporativas de conformidade da
              sua empresa, além de garantir a sua segurança no sistema (MFA,
              controles de IP).
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              2. Compartilhamento de Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Seus dados nunca são vendidos a terceiros ou anunciantes. O
              compartilhamento ocorre de forma restrita a parceiros estratégicos
              de tecnologia e processamento estritos ao nosso business, como:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mb-4">
              <li>
                Infraestrutura em Nuvem (AWS/Azure) sob criptografia total;
              </li>
              <li>Serviços de pagamentos corporativos;</li>
              <li>
                Outras integrações por *você* configuradas (como GitHub, Slack,
                etc).
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              3. Seu Direito à Retenção e Exclusão
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Mantemos seus dados apenas pelo tempo necessário para cumprir com
              nossas obrigações legais corporativas e contratuais. O usuário
              líder do "Tenant" (organização) detém a prerrogativa do "Direito
              ao esquecimento" ou retificação a qualquer momento. Em
              conformidade legal à preservação de cadeia de custódia, logs
              imutáveis essenciais não poderão ser exauridos.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              4. Criptografia "Grau Militar"
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Nossa infraestrutura está aderente à norma de mercado, protegendo
              dados "at rest" (em repouso, AES-256) e "in-transit" (TLS 1.3).
              Controles rígorosos previnem acessos não autorizados. No entanto,
              lembre-se de que a segurança também depende da higiene de seus
              dispositivos limitadores (MFA forte).
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              5. Fale com nosso DPO
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Para solicitação de DSR (Data Subject Requests) ou relatar dúvidas
              abrangentes a este documento, por favor contacte o nosso
              Encarregado pelo Tratamento de Dados (DPO) pelo e-mail:{" "}
              <a
                href="mailto:privacy@cogitari.com.br"
                className="text-brand-600 hover:underline"
              >
                privacy@cogitari.com.br
              </a>
              .
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              A Cogitari Governance é operada sob o{" "}
              <strong>CNPJ: 64.460.886/0001-39</strong>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} Cogitari Governance. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  );
}
