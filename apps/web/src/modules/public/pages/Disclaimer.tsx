import { Link } from "react-router-dom";
import { useAuth } from "../../../modules/auth/context/AuthContext";
import { ArrowLeft, AlertTriangle, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";

export function Disclaimer() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* SEO Metadata */}
      <div className="hidden" aria-hidden="true">
        <title>Disclaimer Legal | Leadgers Governance</title>
        <meta
          name="description"
          content="Avisos legais e limitações de responsabilidade da plataforma Leadgers Governance."
        />
        <meta property="og:title" content="Disclaimer - Leadgers Governance" />
        <meta
          property="og:description"
          content="Avisos legais importantes sobre o uso da plataforma."
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
            Avisos Legais
          </h1>
          <p className="text-sm text-muted-foreground mb-12 font-medium">
            Última atualização: 07 de Março de 2026
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              1. Informações "No Estado em que se Encontram"
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Leadgers Governance fornece painéis com métricas, "matrizes de
              risco" e "alertas de compliance" gerados a partir da integração
              com seus sistemas (ex. GitHub, Stripe) e avaliações algorítmicas
              próprias. Contudo, esses dados são informativos e refletem "o
              estado em que se encontram", sendo as "Triagens Automáticas"
              passíveis de falso-positivos.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              2. Ausência de Orientação Financeira e/ou Legal
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Os relatórios e dashboards contábeis, preditivos ou de governança
              expostos em nosso software são arquitetados para maximizar a
              assertividade das decisões dos gestores da sua organização.
              Todavia,{" "}
              <strong>
                a plataforma não substitui consultorias especializadas
              </strong>{" "}
              (escritórios de advocacia, auditores contábeis ou especialistas
              regulatórios).
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4 font-medium">
              As decisões estratégicas originadas das percepções do software
              continuam sendo estritamente de caráter organizacional; nos
              isentamos da assunção do risco e impacto direto de escolhas de
              negócios.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              3. Links para Terceiros
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Links a plataformas terceiras integradoras indicadas na nossa
              aplicação servem apenas de via orgânica produtiva; nós não
              endossamos e nos eximimos de garantir a conduta daqueles
              prestadores. Recomendamos revisar as políticas de cada integrador
              individualmente.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black tracking-tight mt-8 mb-4 uppercase">
              4. Informações Corporativas
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Leadgers Governance é operada sob o{" "}
              <strong>CNPJ: 64.460.886/0001-39</strong>. Diante de qualquer
              dúvida sobre o escopo da plataforma ou necessidade de revisão
              técnica, entre em contato via{" "}
              <a
                href="mailto:support@leadgers.com"
                className="text-primary hover:underline font-bold"
              >
                support@leadgers.com
              </a>
              .
            </p>
          </section>

          <div className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-6">
            <AlertTriangle className="w-12 h-12 text-primary shrink-0 animate-pulse" />
            <p className="text-sm font-black text-primary uppercase leading-tight italic">
              AO UTILIZAR NOSSA APLICAÇÃO B2B, VOCÊ E SUA COMPANHIA RECONHECEM A
              ADESÃO INTEGRAL ÀS LIMITAÇÕES DESCRITAS NESTE AVISO LEGAL.
            </p>
          </div>
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
