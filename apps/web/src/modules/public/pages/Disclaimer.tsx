import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";

export function Disclaimer() {
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
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Cogitari{" "}
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
            Isenção de Responsabilidade
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-12">
            Última atualização: 28 de Fevereiro de 2026
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              1. Informações "No Estado em que se Encontram"
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              A Cogitari Governance fornece painéis com métricas, "matrizes de
              risco" e "alertas de compliance" gerados a partir da integração
              com seus sistemas (ex. GitHub, Vercel) e avaliações algorítmicas
              próprias. Contudo, esses dados são informativos e refletem "o
              estado em que se encontram", sendo as "Triagens Automáticas por
              IA" passíveis de falso-positivos ou "alucinações algorítmicas".
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              2. Ausência de Orientação Financeira e/ou Legal
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Os relatórios e dashboards contábeis, preditivos ou de governança
              expostos em nosso software são arquitetados para maximizar a
              assertividade das decisões dos CTOs, CFOs e gestores da sua
              organização. Todavia,{" "}
              <strong>
                a plataforma não substitui consultorias especializadas
              </strong>{" "}
              (escritórios de advocacia, auditores contábeis com representação
              em órgãos fiscais, ou médicos especialistas para compliance de
              saúde).
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              As decisões estratégicas originadas das percepções do software
              continuam sendo estritamente de caráter organizacional; nos
              isentamos da assunção do risco e impacto direto de escolhas de
              negócios mal sucedidas lastreadas em interpretação do usuário
              sobre o sistema.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              3. Links para Terceiros
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Links a plataformas terceiras integradoras indicadas na nossa
              aplicação servem apenas de via orgânica produtiva; nós não
              endossamos e nos eximimos de garantir que aqueles prestadores de
              serviços aturem conduta moral e sem acidentes perante os seus
              dados por eles tratados. Reveja as políticas deles
              independentemente.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mt-8 mb-4">
              4. Informações Corporativas
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              A Cogitari Governance é operada sob o{" "}
              <strong>CNPJ: 64.460.886/0001-39</strong>. Diante de qualquer
              dúvida sobre o escopo da plataforma ou necessidade de revisão
              técnica, entre em contato via{" "}
              <a
                href="mailto:support@cogitari.com.br"
                className="text-brand-600 hover:underline"
              >
                support@cogitari.com.br
              </a>
              .
            </p>
          </section>

          <section className="mt-16 p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 text-center">
              AO PROCEDER O USO REGULAR DE NOSSA APLICAÇÃO B2B (E O NOSSO PAINEL
              DE CONTROLE), VOCÊ E SUA COMPANHIA RECONHECEM A ADESÃO INTEGRAL
              (BEM COMO AS LIMITAÇÕES DESCRITAS) NESTE AVISO LEGAL.
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
