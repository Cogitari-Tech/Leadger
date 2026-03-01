import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";

export function TermsOfUse() {
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
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              Cogitari <span className="font-light opacity-70">Governance</span>
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-32">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
            Termos de Uso
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-12">
            Última atualização: 28 de Fevereiro de 2026
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              1. Aceitação dos Termos
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Ao acessar e utilizar o Cogitari Governance ("aplicativo",
              "sistema", "nós"), você concorda com estes Termos de Uso. Caso não
              concorde com qualquer parte destes termos, você não deverá acessar
              ou usar o sistema.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              2. Uso do Sistema e Restrições
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              O Cogitari Governance é projetado para ser "A fonte da verdade
              para Auditoria e Compliance". O usuário compromete-se a:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mb-4">
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
            <h2 className="text-2xl font-bold mt-8 mb-4">
              3. Conteúdo Gerado pelo Usuário
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Você retém a propriedade de todos os dados, documentos e
              relatórios inseridos na plataforma. No entanto, concede à Cogitari
              licença estritamente necessária para processar, armazenar e
              gerenciar tais dados com o objetivo exclusivo de prestar o serviço
              de governança, auditoria e compliance corporativos, incluindo
              análises de "IA".
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              4. Planos, Assinaturas e Pagamentos
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              O acesso aos recursos "Pro" ou corporativos ("Enterprise") está
              condicionado ao pagamento das assinaturas acordadas. Caso ocorra
              inadimplência, a Cogitari reserva-se o direito de suspender ou
              limitar o acesso à plataforma após aviso prévio. A política de
              cancelamento prevê o não reembolso para ciclos já iniciados,
              exceto quando imposto por lei.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              5. Propriedade Intelectual
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              A interface visual, logotipos, documentações técnicas, algoritmos
              de "Triagem Automática" e códigos compilados são propriedade
              exclusiva da Cogitari. O uso autorizado do sistema não transfere a
              você quaisquer direitos de propriedade intelectual sobre o nosso
              software.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              6. Modificações dos Termos
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              A Cogitari pode revisar estes Termos de Uso periodicamente.
              Notificaremos sobre mudanças significativas através do sistema ou
              por e-mail. Continuar a usar o sistema após tais modificações
              constitui sua aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              7. Legislação Aplicável e Foro
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Estes Termos serão regidos e interpretados de acordo com a
              legislação brasileira, incluindo o{" "}
              <a
                href="https://www.jusbrasil.com.br/legislacao/91585/codigo-de-defesa-do-consumidor-lei-8078-90"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline"
              >
                Código de Defesa do Consumidor (CDC)
              </a>
              . Quaisquer disputas deverão ser submetidas ao foro da comarca
              sede da Cogitari, renunciando as partes a qualquer outro, por mais
              privilegiado que seja.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              8. Informações Corporativas e Contato
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              A Cogitari Governance é operada sob o{" "}
              <strong>CNPJ: 64.460.886/0001-39</strong>.
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2 mb-4">
              <li>
                <strong>Suporte Técnico / DevOps:</strong>{" "}
                <a
                  href="mailto:devops@cogitari.com.br"
                  className="text-brand-600 hover:underline"
                >
                  devops@cogitari.com.br
                </a>
              </li>
              <li>
                <strong>Suporte ao Cliente:</strong>{" "}
                <a
                  href="mailto:support@cogitari.com.br"
                  className="text-brand-600 hover:underline"
                >
                  support@cogitari.com.br
                </a>
              </li>
              <li>
                <strong>Documentação e Tutoriais:</strong>{" "}
                <a
                  href="mailto:docs@cogitari.com.br"
                  className="text-brand-600 hover:underline"
                >
                  docs@cogitari.com.br
                </a>
              </li>
              <li>
                <strong>Usuário de Teste / Dúvidas:</strong>{" "}
                <a
                  href="mailto:teste@cogitari.com.br"
                  className="text-brand-600 hover:underline"
                >
                  teste@cogitari.com.br
                </a>
              </li>
            </ul>
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
