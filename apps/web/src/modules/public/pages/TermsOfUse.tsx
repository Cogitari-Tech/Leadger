import { Link } from "react-router-dom";
import { useAuth } from "../../../modules/auth/context/AuthContext";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";

export function TermsOfUse() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* SEO Metadata */}
      <div className="hidden" aria-hidden="true">
        <title>Termos de Uso | Leadgers Governance</title>
        <meta
          name="description"
          content="Leia os Termos de Uso do Leadgers Governance. Diretrizes para utilização do nosso ecossistema de governança."
        />
        <meta
          property="og:title"
          content="Termos de Uso - Leadgers Governance"
        />
        <meta
          property="og:description"
          content="A fonte da verdade para Auditoria e Compliance."
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
            Termos de Uso
          </h1>
          <p className="text-sm text-muted-foreground mb-12 font-medium">
            Última atualização: 07 de Março de 2026
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              1. Aceitação dos Termos
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ao acessar e utilizar o Leadgers Governance ("aplicativo",
              "sistema", "nós"), você concorda com estes Termos de Uso. Caso não
              concorde com qualquer parte destes termos, você não deverá acessar
              ou usar o sistema.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              2. Uso do Sistema e Restrições
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O Leadgers Governance é projetado para ser "A fonte da verdade
              para Auditoria e Compliance". O usuário compromete-se a:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4 font-medium">
              <li>
                Fornecer informações precisas durante o cadastro e operação;
              </li>
              <li>
                Não utilizar a plataforma para propósitos ilegais ou não
                autorizados;
              </li>
              <li>
                Não realizar engenharia reversa, tentar acessar o código-fonte,
                ou comprometer a segurança da infraestrutura ("Cloud Imutável");
              </li>
              <li>
                Manter o sigilo das suas credenciais de acesso, sendo
                inteiramente responsável por todas as atividades que ocorram sob
                a sua conta.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              3. Conteúdo Gerado pelo Usuário
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Você retém a propriedade de todos os dados, documentos e
              relatórios inseridos na plataforma. No entanto, concede à Leadgers
              licença estritamente necessária para processar, armazenar e
              gerenciar tais dados com o objetivo exclusivo de prestar o serviço
              de governança, auditoria e compliance corporativos, incluindo
              análises de "IA".
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              4. Planos, Assinaturas e Pagamentos
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O acesso aos recursos "Pro" ou corporativos ("Enterprise") está
              condicionado ao pagamento das assinaturas acordadas. Caso ocorra
              inadimplência, a Leadgers reserva-se o direito de suspender ou
              limitar o acesso à plataforma após aviso prévio. A política de
              cancelamento prevê o não reembolso para ciclos já iniciados,
              exceto quando imposto por lei.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              5. Propriedade Intelectual
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A interface visual, logotipos, documentações técnicas, algoritmos
              de "Triagem Automática" e códigos compilados são propriedade
              exclusiva da Leadgers. O uso autorizado do sistema não transfere a
              você quaisquer direitos de propriedade intelectual sobre o nosso
              software.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              6. Modificações dos Termos
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Leadgers pode revisar estes Termos de Uso periodicamente.
              Notificaremos sobre mudanças significativas através do sistema ou
              por e-mail. Continuar a usar o sistema após tais modificações
              constitui sua aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              7. Legislação Aplicável e Foro
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Estes Termos serão regidos e interpretados de acordo com a
              legislação brasileira, incluindo o{" "}
              <a
                href="https://www.jusbrasil.com.br/legislacao/91585/codigo-de-defesa-do-consumidor-lei-8078-90"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-bold"
              >
                Código de Defesa do Consumidor (CDC)
              </a>
              . Quaisquer disputas deverão ser submetidas ao foro da comarca
              sede da Leadgers, renunciando as partes a qualquer outro, por mais
              privilegiado que seja.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              8. Informações Corporativas e Contato
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Leadgers Governance é operada sob o{" "}
              <strong>CNPJ: 64.460.886/0001-39</strong>.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4 font-medium">
              <li>
                <strong>Suporte Técnico / DevOps:</strong>{" "}
                <a
                  href="mailto:devops@leadgers.com"
                  className="text-primary hover:underline"
                >
                  devops@leadgers.com
                </a>
              </li>
              <li>
                <strong>Suporte ao Cliente:</strong>{" "}
                <a
                  href="mailto:support@leadgers.com"
                  className="text-primary hover:underline"
                >
                  support@leadgers.com
                </a>
              </li>
              <li>
                <strong>Privacidade e Dados:</strong>{" "}
                <a
                  href="mailto:privacy@leadgers.com"
                  className="text-primary hover:underline"
                >
                  privacy@leadgers.com
                </a>
              </li>
            </ul>
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
