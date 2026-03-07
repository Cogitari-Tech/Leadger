import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";
import {
  ShieldCheck,
  Database,
  ArrowRight,
  CheckCircle2,
  Zap,
  Lock,
  FileSearch,
  Activity,
  BarChart3,
  GitBranch,
  CheckSquare,
  Menu,
  X,
} from "lucide-react";

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroEmail, setHeroEmail] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("translate-y-12", "opacity-0");
            entry.target.classList.add("translate-y-0", "opacity-100");
          }
        });
      },
      { threshold: 0.1 },
    );

    const hiddenElements = document.querySelectorAll(".reveal-on-scroll");
    hiddenElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleStartFree = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroEmail) {
      navigate(`/register?email=${encodeURIComponent(heroEmail)}`);
    } else {
      navigate("/register");
    }
  };

  const navTo = (hashOrRoute: string) => {
    setMobileMenuOpen(false);
    if (hashOrRoute.startsWith("#")) {
      const el = document.querySelector(hashOrRoute);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (hashOrRoute.startsWith("http")) {
      window.open(hashOrRoute, "_blank");
    } else {
      navigate(hashOrRoute);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-primary overflow-x-hidden text-foreground">
      <div className="hidden" aria-hidden="true">
        <title>Cogitari Governance | Plataforma Corporativa All-in-One</title>
        <meta
          name="description"
          content="A infraestrutura de compliance da sua startup. Controle o fluxo de caixa, valide a contabilidade."
        />
      </div>

      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
          isScrolled
            ? "py-3 bg-background/80 backdrop-blur-md shadow-sm border-border/40"
            : "py-5 bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navTo("/")}
              className="flex items-center gap-3"
              aria-label="Cogitari Governance Home"
            >
              <img
                src="/images/logo-cogitari.png"
                alt="Cogitari Governance"
                className="h-7 w-auto mix-blend-screen hidden dark:block"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <img
                src="/images/logo-cogitari-dark.png"
                alt="Cogitari Governance"
                className="h-7 w-auto block dark:hidden"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-50 px-2 py-0.5 border-l border-border ml-2">
                Governance
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <button
                onClick={() => navTo("#produto")}
                className="hover:text-foreground transition-colors"
              >
                Produto
              </button>
              <button
                onClick={() => navTo("#solucoes")}
                className="hover:text-foreground transition-colors"
              >
                Soluções
              </button>
              <button
                onClick={() => navTo("#seguranca")}
                className="hover:text-foreground transition-colors"
              >
                Segurança
              </button>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => navTo("/login")}
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => navTo("/register")}
              className="text-sm font-bold bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Começar Grátis
            </button>
          </div>

          <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground p-2 focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border/50 shadow-lg px-6 py-4 flex flex-col gap-4">
            <button
              onClick={() => navTo("#produto")}
              className="text-sm font-medium text-left"
            >
              Produto
            </button>
            <button
              onClick={() => navTo("#solucoes")}
              className="text-sm font-medium text-left"
            >
              Soluções
            </button>
            <button
              onClick={() => navTo("#seguranca")}
              className="text-sm font-medium text-left"
            >
              Segurança
            </button>
            <hr className="border-border/30" />
            <button
              onClick={() => navTo("/login")}
              className="text-sm font-bold text-center py-3 bg-muted rounded-xl"
            >
              Entrar
            </button>
            <button
              onClick={() => navTo("/register")}
              className="text-sm font-bold text-center py-3 bg-foreground text-background rounded-xl"
            >
              Começar Grátis
            </button>
          </div>
        )}
      </header>

      <main>
        <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background rounded-[100%] opacity-50 blur-[100px] pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10 reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000">
            <button
              onClick={() => navTo("#seguranca")}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-background border border-border text-muted-foreground rounded-full text-xs font-semibold hover:bg-muted/50 transition-colors mb-8 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Auditoria Nível Empresarial (Enterprise-Grade){" "}
              <ArrowRight className="w-3 h-3" />
            </button>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[1.05] text-foreground mb-6 font-display">
              A infraestrutura de compliance <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
                da sua startup.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              Substitua planilhas caóticas por uma única fonte da verdade.
              Controle seu fluxo de caixa, valide a contabilidade e esteja
              sempre pronto para <strong>due diligence</strong>.
            </p>

            <form
              onSubmit={handleStartFree}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="nome@empresa.com"
                value={heroEmail}
                onChange={(e) => setHeroEmail(e.target.value)}
                className="w-full sm:w-auto flex-1 px-5 py-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all shadow-sm"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 bg-foreground text-background font-bold rounded-xl text-sm hover:opacity-90 transition-opacity shadow-lg whitespace-nowrap active:scale-95"
              >
                Começar Grátis
              </button>
            </form>
            <p className="text-xs text-muted-foreground mt-4 font-medium flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 14 dias grátis
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> S/ cartão de crédito
              </span>
            </p>
          </div>

          <div className="w-full max-w-5xl mx-auto mt-20 relative z-10 reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 delay-200">
            <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md shadow-2xl overflow-hidden shadow-black/20 dark:shadow-white/5 transition-transform duration-700 ease-out hover:scale-[1.02]">
              <div className="h-10 bg-muted/40 border-b border-border/50 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <div className="mx-auto text-[10px] font-medium text-muted-foreground px-6 py-1 bg-background rounded border border-border/50">
                  app.cogitari.com.br
                </div>
              </div>
              <div className="flex h-[350px] md:h-[550px] bg-background">
                <div className="w-16 md:w-56 border-r border-border/50 p-4 flex flex-col gap-4">
                  <div className="h-6 w-full max-w-[120px] bg-muted animate-pulse rounded md:hidden block" />
                  <div className="h-8 w-3/4 bg-muted animate-pulse rounded hidden md:block mb-6" />
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted/50 shrink-0" />
                      <div className="h-4 bg-muted/40 rounded w-full hidden md:block" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">
                  <div className="flex justify-between items-center bg-muted/20 p-4 rounded-xl border border-border/40">
                    <div className="space-y-2">
                      <div className="h-5 w-32 md:w-48 bg-foreground/80 rounded" />
                      <div className="h-3 w-20 md:w-32 bg-muted-foreground/50 rounded" />
                    </div>
                    <div className="h-9 w-24 bg-primary rounded-lg shadow-sm shadow-primary/20" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-background border border-border/50 rounded-xl p-4 flex flex-col justify-between shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="w-4 h-4 rounded-sm bg-primary/50" />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            +12%
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 w-16 bg-muted rounded" />
                          <div className="h-5 w-24 bg-foreground/80 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 bg-background border border-border/50 rounded-xl p-6 shadow-sm flex gap-6">
                    <div className="flex-1 border-b-2 border-l-2 border-border/30 relative flex items-end">
                      <div className="absolute bottom-0 left-[10%] w-[10%] h-[30%] bg-blue-500/20 rounded-t-sm" />
                      <div className="absolute bottom-0 left-[30%] w-[10%] h-[60%] bg-blue-500/40 rounded-t-sm" />
                      <div className="absolute bottom-0 left-[50%] w-[10%] h-[45%] bg-blue-500/60 rounded-t-sm" />
                      <div className="absolute bottom-0 left-[70%] w-[10%] h-[80%] bg-primary rounded-t-sm" />
                    </div>
                    <div className="w-1/3 flex flex-col gap-4 hidden lg:flex">
                      <div className="flex-1 bg-muted/20 border border-border/30 rounded-lg" />
                      <div className="flex-1 bg-muted/20 border border-border/30 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 inset-x-10 h-20 bg-primary/10 blur-[80px] rounded-full -z-10" />
          </div>
        </section>

        <section className="py-12 border-y border-border/40 bg-muted/10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-8">
              Auditado e aprovado por startups em early e growth stage
            </p>
            <div className="flex justify-center gap-10 md:gap-20 opacity-40 grayscale flex-wrap">
              <div className="flex items-center gap-2 font-bold text-xl font-display">
                <Database className="w-6 h-6" /> DataCorp
              </div>
              <div className="flex items-center gap-2 font-bold text-xl font-display">
                <Activity className="w-6 h-6" /> HealthIn
              </div>
              <div className="flex items-center gap-2 font-bold text-xl font-display">
                <Zap className="w-6 h-6" /> SaaSify
              </div>
              <div className="flex items-center gap-2 font-bold text-xl font-display">
                <Lock className="w-6 h-6" /> SecurEdge
              </div>
            </div>
          </div>
        </section>

        <section id="produto" className="py-32 px-6 max-w-7xl mx-auto relative">
          <div className="text-center mb-20 reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground font-display mb-4">
              Construído para escalar sem caos.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Sua equipe foca em construir o produto. Nós cuidamos de garantir
              que sua startup esteja sempre auditável e organizada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Due Diligence em Minutos",
                desc: "Gere relatórios complexos e painéis de dados organizados instantaneamente para investidores e fundos de VC.",
                icon: FileSearch,
              },
              {
                title: "Caixa Sob Comando",
                desc: "Acompanhe seu Burn Rate, Runway e histórico de despesas sem depender de fluxos complexos das contabilidades.",
                icon: BarChart3,
              },
              {
                title: "Governança Automática",
                desc: "Trilhas de auditoria imutáveis e mapeamento de riscos atualizado em tempo real sincronizado ao GitHub.",
                icon: ShieldCheck,
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl bg-background border border-border hover:border-border/80 transition-all hover:shadow-lg reveal-on-scroll opacity-0 translate-y-12"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                  <feature.icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="solucoes"
          className="py-24 overflow-hidden bg-muted/20 border-t border-border/40"
        >
          <div className="max-w-7xl mx-auto px-6 space-y-32">
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20 reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700">
              <div className="w-full md:w-1/2 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-500 rounded-full text-xs font-bold uppercase tracking-widest">
                  <Database className="w-4 h-4" /> Finanças Integradas
                </div>
                <h3 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-foreground leading-[1.1]">
                  Diga adeus ao caos <br className="hidden md:block" /> das
                  planilhas.
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Conecte suas contas, monitore gastos indiretos e categorize
                  despesas automaticamente. Tudo o que você precisa para
                  garantir a saúde financeira da sua operação, sem surpresas no
                  fim do mês.
                </p>
                <ul className="space-y-4 pt-4">
                  {[
                    "Acompanhamento inteligente de Burn Rate",
                    "Conciliação bancária simplificada",
                    "Exportações flexíveis para a contabilidade",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm font-semibold text-foreground"
                    >
                      <CheckCircle2 className="w-5 h-5 text-cyan-500 shrink-0" />{" "}
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full md:w-1/2 relative">
                <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-full" />
                <div className="relative rounded-2xl border border-border bg-background shadow-xl overflow-hidden aspect-[4/3] flex items-center justify-center">
                  <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="h-1/2 border-b border-border/30 bg-muted/5 flex items-end p-6 gap-2">
                      <div className="w-8 h-1/3 bg-cyan-500/20 rounded-t-sm" />
                      <div className="w-8 h-2/3 bg-cyan-500/40 rounded-t-sm" />
                      <div className="w-8 h-full bg-cyan-500/60 rounded-t-sm" />
                      <div className="w-8 h-[120%] bg-cyan-500 rounded-t-sm" />
                    </div>
                    <div className="p-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <BarChart3 className="w-5 h-5 opacity-40" />
                      </div>
                      <div className="space-y-2 w-full">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-2 bg-muted rounded w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20 reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700">
              <div className="w-full md:w-1/2 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold uppercase tracking-widest hidden">
                  {/* Banned color removed, using Indigo/Blue instead */}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold uppercase tracking-widest">
                  <GitBranch className="w-4 h-4" /> Conformidade Contínua
                </div>
                <h3 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-foreground leading-[1.1]">
                  Matriz de Riscos <br className="hidden md:block" />{" "}
                  Autodiagnóstica.
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Identifique gargalos e vulnerabilidades antes que se tornem
                  problemas operacionais ou jurídicos. A plataforma vincula
                  achados de auditoria diretamente aos repositórios no GitHub,
                  fechando a lacuna entre códice e compliance.
                </p>
                <ul className="space-y-4 pt-4">
                  {[
                    "Integração nativa de Segurança com GitHub",
                    "Mapeamento de Frameworks (ISO 27001, SOC2)",
                    "Sistema de issues para resolução guiada",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm font-semibold text-foreground"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />{" "}
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full md:w-1/2 relative">
                <div className="absolute inset-0 bg-emerald-500/5 blur-[80px] rounded-full" />
                <div className="relative rounded-2xl border border-border bg-background shadow-xl overflow-hidden aspect-[4/3] flex items-center justify-center p-8 flex-col gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-full p-4 border border-border/50 rounded-lg flex items-center justify-between bg-muted/10 opacity-70"
                    >
                      <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-emerald-500/60" />
                        <div className="h-3 w-32 bg-foreground/20 rounded" />
                      </div>
                      <div className="h-6 w-16 bg-muted rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="seguranca"
          className="py-32 bg-background border-y border-border/40 relative overflow-hidden"
        >
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="max-w-5xl mx-auto px-6 text-center space-y-8 reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700">
            <div className="w-16 h-16 bg-muted border border-border rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Lock className="w-7 h-7 text-foreground" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-foreground">
              Segurança nível enterprise <br className="hidden md:block" /> para
              fundadores sérios.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Nós entendemos que os dados de equity e financeiros da sua empresa
              são extremamente sensíveis. Nossa infraestrutura foi desenhada
              priorizando as melhores práticas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
              {[
                {
                  title: "Criptografia Avançada",
                  desc: "Dados sensíveis criptografados via protocolo AES-256 no trânsito e em repouso.",
                },
                {
                  title: "MFA Nativo (2FA)",
                  desc: "Autenticação em múltiplas etapas obrigatória e auditada via aplicativos TOTP (Google Authenticator).",
                },
                {
                  title: "Trilhas de Auditoria",
                  desc: "Eventos chaves do sistema são roteados para um banco de dados imutável protegido contra adulterações (tampering).",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-8 rounded-2xl border border-border bg-muted/10 hover:bg-muted/30 transition-colors"
                >
                  <h4 className="text-lg font-bold text-foreground mb-3">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-40 px-6 relative overflow-hidden bg-foreground text-background text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted-foreground/10 via-background to-background rounded-[100%] opacity-20 pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10 reveal-on-scroll opacity-0 translate-y-12 transition-all duration-700">
            <h2 className="text-5xl md:text-6xl font-bold font-display tracking-tight mb-8 leading-[1.1]">
              Pronto para construir a <br className="hidden md:block" />
              sua governança corporativa?
            </h2>
            <p className="text-xl text-background/70 mb-12 font-medium max-w-xl mx-auto leading-relaxed">
              Comece sem cartão de crédito. Estruture os setores primários da
              sua empresa de ponta a ponta em menos de 5 minutos.
            </p>
            <button
              onClick={() => navTo("/register")}
              className="inline-flex items-center justify-center gap-3 bg-background text-foreground px-12 py-5 rounded-xl text-sm font-bold tracking-widest uppercase shadow-lg hover:scale-[1.02] active:scale-95 transition-all outline-none focus:ring-4 focus:ring-background/30"
            >
              Começar Grátis Agora
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-10 opacity-60 text-sm font-bold tracking-wide">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Sem cartão required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Configuração rápida
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 bg-background border-t border-border/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-4">
            <button
              onClick={() => navTo("/")}
              aria-label="Cogitari Governance Home"
            >
              <img
                src="/images/logo-cogitari.png"
                alt="Cogitari"
                className="h-6 opacity-60 dark:block hidden hover:opacity-100 transition-opacity"
              />
              <img
                src="/images/logo-cogitari-dark.png"
                alt="Cogitari"
                className="h-6 opacity-60 dark:hidden block hover:opacity-100 transition-opacity"
              />
            </button>
            <span className="text-muted-foreground text-[11px] uppercase tracking-widest font-bold">
              © {new Date().getFullYear()} Cogitari Governance. CNPJ
              64.460.886/0001-39.
            </span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-semibold text-muted-foreground">
            <button
              onClick={() => navTo("/termos")}
              className="hover:text-foreground transition-colors"
            >
              Termos de Uso
            </button>
            <button
              onClick={() => navTo("/privacidade")}
              className="hover:text-foreground transition-colors"
            >
              Privacidade
            </button>
            <button
              onClick={() => navTo("/disclaimer")}
              className="hover:text-foreground transition-colors"
            >
              Disclaimer
            </button>
            <button
              onClick={() => navTo("https://github.com/Cogitari-Tech")}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              GitHub
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
