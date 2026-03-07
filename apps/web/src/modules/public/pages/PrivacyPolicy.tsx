import { Link } from "react-router-dom";
import { useAuth } from "../../../modules/auth/context/AuthContext";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";

export function PrivacyPolicy() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* SEO Metadata */}
      <div className="hidden" aria-hidden="true">
        <title>Política de Privacidade | Leadgers Governance</title>
        <meta
          name="description"
          content="Saiba como a Leadgers Governance processa e protege seus dados corporativos."
        />
        <meta
          property="og:title"
          content="Política de Privacidade - Leadgers Governance"
        />
        <meta
          property="og:description"
          content="Segurança e transparência no tratamento de dados."
        />
      </div>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to={user ? "/dashboard" : "/"}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm">Voltar</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <span className="font-black text-lg tracking-tighter uppercase">
                Leadgers
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-32">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground mb-6 uppercase italic">
            Política de Privacidade
          </h1>
          <p className="text-sm text-muted-foreground mb-12 font-medium">
            Última atualização: 07 de Março de 2026
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              1. Por que e como coletamos dados
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Leadgers Governance ("nós") tem o compromisso de proteger os
              dados e a privacidade dos nossos clientes ("você"). Tratamos
              informações com base na{" "}
              <a
                href="https://www.gov.br/esporte/pt-br/acesso-a-informacao/lgpd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-bold"
              >
                Lei Geral de Proteção de Dados (LGPD)
              </a>{" "}
              e regulações correspondentes como a{" "}
              <a
                href="https://gdpr-info.eu/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-bold"
              >
                GDPR
              </a>
              . Coletamos os dados inseridos por você na plataforma, nome,
              e-mail de acesso corporativo, IP e metadados de acesso (cookies
              essenciais).
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Esses dados são usados para: personalização da sua Dashboard de
              Governança corporativa, auditoria das ações (logs "Read-only"
              imutáveis) por questões legais e corporativas de conformidade da
              sua empresa, além de garantir a sua segurança no sistema (MFA,
              controles de IP).
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              2. Compartilhamento de Dados
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Seus dados nunca são vendidos a terceiros ou anunciantes. O
              compartilhamento ocorre de forma restrita a parceiros estratégicos
              de tecnologia e processamento estritos ao nosso business, como:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4 font-medium">
              <li>Infraestrutura em Nuvem sob criptografia total;</li>
              <li>Serviços de processamento de pagamentos;</li>
              <li>
                Integrações configuradas pelo usuário (GitHub, Stripe, etc).
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              3. Seu Direito à Retenção e Exclusão
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Mantemos seus dados apenas pelo tempo necessário para cumprir com
              nossas obrigações legais corporativas e contratuais. O usuário
              líder da organização detém a prerrogativa do "Direito ao
              esquecimento" ou retificação a qualquer momento, observadas as
              limitações de custódia de logs imutáveis.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              4. Criptografia de Dados
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nossa infraestrutura utiliza padrões avançados de proteção de
              dados "at rest" (em repouso, AES-256) e "in-transit" (TLS 1.3).
              Controles rigorosos previnem acessos não autorizados. Lembre-se de
              que a segurança também depende do uso de MFA forte.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              5. Fale com nosso DPO
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Para solicitações de DSR (Data Subject Requests) ou dúvidas sobre
              este documento, entre em contato com nosso Encarregado pelo
              Tratamento de Dados (DPO):{" "}
              <a
                href="mailto:privacy@leadgers.com"
                className="text-primary hover:underline font-bold"
              >
                privacy@leadgers.com
              </a>
              .
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4 font-medium">
              A Leadgers Governance é operada sob o{" "}
              <strong>CNPJ: 64.460.886/0001-39</strong>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border text-center">
        <p className="text-sm text-muted-foreground font-bold">
          © {new Date().getFullYear()} Leadgers Governance. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  );
}
