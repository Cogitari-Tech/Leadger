import { useState, useEffect, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";
import {
  ShieldCheck,
  Database,
  Activity,
  ArrowRight,
  Loader2,
  KeyRound,
  CheckCircle2,
  Target,
  Zap,
  Lock,
  FileSearch,
  CheckSquare,
  Eye,
  EyeOff,
} from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

export function LandingPage() {
  const { user, signIn, signUp, loading: authLoading } = useAuth();

  // Auth Form State
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For register only
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Password strength calculation
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    // Maximum score is 5
    return Math.min(score, 5);
  };
  const strengthScore = calculateStrength(password);
  const strengthColors = [
    "bg-muted",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];
  const strengthLabels = [
    "Muito fraca",
    "Muito fraca",
    "Fraca",
    "Razoável",
    "Forte",
    "Muito forte",
  ];

  // Scroll Animation Observer
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

  // If already logged in, redirect to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Captcha validation
      const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
      if (siteKey && !turnstileToken) {
        setError("Por favor, confirme que você não é um robô.");
        setSubmitting(false);
        return;
      }

      if (authMode === "login") {
        const { error: authError } = await signIn(
          email,
          password,
          turnstileToken || undefined,
        );
        if (authError) {
          setError(
            authError.message === "Invalid login credentials"
              ? "E-mail ou senha incorretos."
              : authError.message.includes("captcha")
                ? "Falha na verificação de segurança (Captcha)."
                : "Erro ao fazer login. Tente novamente.",
          );
        }
      } else {
        if (password.length < 6) {
          setError("A senha deve ter pelo menos 6 caracteres.");
          setSubmitting(false);
          return;
        }
        const { error: signUpError } = await signUp(email, password, {
          name,
          captchaToken: turnstileToken || undefined,
        });
        if (signUpError) throw signUpError;
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro na autenticação.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === "login" ? "register" : "login"));
    setError(null);
    setEmail("");
    setPassword("");
    setName("");
    setTurnstileToken(null);
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-primary overflow-x-hidden text-foreground">
      {/* ─── NAV HEADER ────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 px-6 transition-all duration-300 flex items-center justify-between border-b ${
          isScrolled
            ? "py-3 bg-background/95 backdrop-blur-md shadow-sm border-border/40"
            : "py-5 bg-background/40 backdrop-blur-sm border-transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src="/images/logo-cogitari.png"
            alt="Cogitari Governance"
            className="h-7 w-auto mix-blend-screen hidden dark:block"
            aria-hidden="true"
          />
          <img
            src="/images/logo-cogitari-dark.png"
            alt="Cogitari Governance"
            className="h-7 w-auto block dark:hidden"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/logo-cogitari.png";
            }}
            aria-hidden="true"
          />
          <span
            className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-50 px-2 py-0.5 border-l border-border ml-2"
            aria-label="Governance"
          >
            Governance
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* ─── MAIN CONTENT ─────────────────────────────────────── */}
      <main>
        {/* ─── HERO SECTION (Unified Background) ────────────────────── */}
        <section
          className="relative min-h-screen flex flex-col md:flex-row pt-16 bg-background overflow-hidden"
          aria-labelledby="hero-heading"
        >
          {/* Unified Background Layer */}
          <div
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay dark:opacity-10 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 pointer-events-none"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary via-transparent to-transparent blur-3xl" />
          </div>

          {/* LEFT COMPONENT: Text & Branding */}
          <article className="hidden md:flex w-[55%] relative items-center justify-center p-12 z-10 text-foreground">
            <div className="relative z-10 w-full max-w-2xl reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out">
              <h1
                id="hero-heading"
                className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter leading-[1.1] mb-8"
              >
                A única fonte da verdade{" "}
                <span className="text-primary block mt-2">
                  para a sua startup
                </span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-prose">
                Plataforma corporativa all-in-one para controle financeiro,
                gestão contábil, compliance e governança de startups em
                early-stage e founders ambiciosos.
              </p>

              <div className="mt-16 grid grid-cols-2 gap-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <ShieldCheck
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      aria-hidden="true"
                    />
                    <span className="font-bold tracking-widest uppercase text-xs">
                      Gestão Integrada
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium max-w-xs leading-relaxed">
                    Centralize seu financeiro, contabilidade e time em um único
                    ecossistema auditável.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Database
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      aria-hidden="true"
                    />
                    <span className="font-bold tracking-widest uppercase text-xs">
                      Pronto para M&A
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium max-w-xs leading-relaxed">
                    Dados históricos estruturados e portal de stakeholders para
                    due diligence fluida.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* RIGHT COMPONENT: SLIDING AUTH CONTAINER */}
          <aside className="w-full md:w-[45%] flex items-center justify-center p-6 md:p-12 relative z-10 py-12 md:py-0">
            <div className="w-full max-w-md relative min-h-[620px] bg-background text-foreground rounded-[2rem] shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 dark:border-white/5 overflow-hidden reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out delay-200">
              {/* === LOGIN CARD (Base Layer) === */}
              <div
                className="absolute inset-0 w-full h-full bg-background transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) z-0"
                style={{
                  transform:
                    authMode === "login"
                      ? "translateX(0) scale(1)"
                      : "translateX(-10%) scale(0.95)",
                  opacity: authMode === "login" ? 1 : 0,
                }}
                aria-hidden={authMode !== "login"}
              >
                <div className="p-8 md:p-10 h-full flex flex-col justify-center overflow-y-auto custom-scrollbar">
                  <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                      Acesso
                    </h2>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-3">
                      Identificação Exclusiva
                    </p>
                  </div>

                  <form
                    onSubmit={handleAuthSubmit}
                    className="space-y-6"
                    noValidate
                  >
                    {error && authMode === "login" && (
                      <div
                        className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2"
                        aria-live="polite"
                      >
                        <Activity className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    <div className="space-y-5">
                      <div className="space-y-1.5 flex flex-col">
                        <label
                          htmlFor="login-email"
                          className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest ml-1 cursor-pointer w-fit"
                        >
                          E-mail Institucional
                        </label>
                        <input
                          id="login-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-6 py-4 text-base bg-muted/40 border border-border/60 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm rounded-2xl font-medium placeholder:opacity-40"
                          placeholder="nome@empresa.com"
                        />
                      </div>
                      <div className="space-y-1.5 flex flex-col">
                        <div className="flex items-center justify-between ml-1">
                          <label
                            htmlFor="login-password"
                            className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest cursor-pointer w-fit"
                          >
                            Senha de Segurança
                          </label>
                          <Link
                            to="/forgot-password"
                            className="text-[11px] font-bold text-primary hover:text-primary/80 transition-all uppercase tracking-widest focus:outline-none focus:underline rounded"
                          >
                            Esqueci minha senha
                          </Link>
                        </div>
                        <div className="relative">
                          <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 text-base bg-muted/40 border border-border/60 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm rounded-2xl font-medium tracking-widest placeholder:opacity-40"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
                            title={
                              showPassword ? "Ocultar senha" : "Exibir senha"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Turnstile */}
                      {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                        <div className="flex justify-center mt-2 h-[65px]">
                          <Turnstile
                            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                            onSuccess={(token) => {
                              setTurnstileToken(token);
                              setError(null);
                            }}
                            options={{ theme: "auto", size: "normal" }}
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        authLoading ||
                        (!!import.meta.env.VITE_TURNSTILE_SITE_KEY &&
                          !turnstileToken)
                      }
                      className="group w-full bg-primary text-primary-foreground py-4 text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 shadow-xl shadow-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 transition-all duration-300 rounded-2xl active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                    >
                      {submitting || authLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Iniciar Sessão"
                      )}
                      {!submitting && !authLoading && (
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      )}
                    </button>
                  </form>

                  <div className="mt-8 pt-6 border-t border-border/30 text-center">
                    <p className="text-muted-foreground text-sm font-medium">
                      Ainda não possui acesso?{" "}
                      <button
                        onClick={toggleAuthMode}
                        type="button"
                        className="text-foreground font-bold hover:text-primary focus:outline-none focus:underline rounded transition-colors"
                      >
                        Cadastre-se
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {/* === REGISTER CARD (Top Layer, slides over) === */}
              <div
                className={`absolute inset-0 w-full h-full bg-background border-l border-border/40 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) z-10 ${authMode === "register" ? "shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.3)] shadow-black/30" : "shadow-none"}`}
                style={{
                  transform:
                    authMode === "register"
                      ? "translateX(0)"
                      : "translateX(100%)",
                }}
                aria-hidden={authMode !== "register"}
              >
                <div className="p-8 md:p-10 h-full flex flex-col justify-center overflow-y-auto custom-scrollbar">
                  <div className="mb-6">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                      Criar Conta
                    </h2>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-3">
                      Inicie sua jornada
                    </p>
                  </div>

                  <form
                    onSubmit={handleAuthSubmit}
                    className="space-y-5"
                    noValidate
                  >
                    {error && authMode === "register" && (
                      <div
                        className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2"
                        aria-live="polite"
                      >
                        <Activity className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    <div className="space-y-4">
                      <div className="space-y-1.5 flex flex-col">
                        <label
                          htmlFor="register-name"
                          className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest ml-1 cursor-pointer w-fit"
                        >
                          Nome Completo
                        </label>
                        <input
                          id="register-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-5 py-3.5 text-sm bg-muted/40 border border-border/60 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300 rounded-2xl font-medium placeholder:opacity-40"
                          placeholder="Seu nome"
                        />
                      </div>
                      <div className="space-y-1.5 flex flex-col">
                        <label
                          htmlFor="register-email"
                          className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest ml-1 cursor-pointer w-fit"
                        >
                          E-mail Profissional
                        </label>
                        <input
                          id="register-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-5 py-3.5 text-sm bg-muted/40 border border-border/60 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300 rounded-2xl font-medium placeholder:opacity-40"
                          placeholder="nome@empresa.com"
                        />
                      </div>
                      <div className="space-y-1.5 flex flex-col">
                        <label
                          htmlFor="register-password"
                          className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest ml-1 cursor-pointer w-fit"
                        >
                          Definir Senha
                        </label>
                        <div className="relative">
                          <input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3.5 text-sm bg-muted/40 border border-border/60 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300 rounded-2xl font-medium tracking-widest placeholder:opacity-40"
                            placeholder="Min 8 caract., Letras, Nums e Símbolos"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
                            title={
                              showPassword ? "Ocultar senha" : "Exibir senha"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {password.length > 0 && (
                          <div className="mt-2 space-y-1 ml-1 animate-in fade-in slide-in-from-top-1">
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest">
                              <span
                                className={
                                  strengthScore >= 3
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }
                              >
                                {strengthLabels[strengthScore]}
                              </span>
                            </div>
                            <div className="flex gap-1 h-1.5 w-full">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                  key={level}
                                  className={`h-full flex-1 rounded-full transition-colors duration-300 ${strengthScore >= level ? strengthColors[strengthScore] : "bg-muted relative overflow-hidden"}`}
                                />
                              ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium mt-1">
                              Requisitos: Min 8, Maiús., Minús., Núm., Símb.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Turnstile */}
                      {import.meta.env.VITE_TURNSTILE_SITE_KEY &&
                        authMode === "register" && (
                          <div className="flex justify-center h-[65px]">
                            <Turnstile
                              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                              onSuccess={(token) => {
                                setTurnstileToken(token);
                                setError(null);
                              }}
                              options={{ theme: "auto", size: "normal" }}
                            />
                          </div>
                        )}
                    </div>

                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        authLoading ||
                        (!!import.meta.env.VITE_TURNSTILE_SITE_KEY &&
                          !turnstileToken)
                      }
                      className="group w-full bg-foreground text-background py-4 text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 shadow-xl focus:outline-none focus:ring-4 focus:ring-muted-foreground/30 disabled:opacity-50 transition-all duration-300 rounded-2xl active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                    >
                      {submitting || authLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Criar Ambiente Seguro"
                      )}
                      {!submitting && !authLoading && (
                        <KeyRound className="w-4 h-4 ml-1 group-hover:scale-110 transition-transform" />
                      )}
                    </button>
                  </form>

                  <div className="mt-6 pt-5 border-t border-border/30 text-center">
                    <p className="text-muted-foreground text-sm font-medium">
                      Já possui uma conta?{" "}
                      <button
                        onClick={toggleAuthMode}
                        type="button"
                        className="text-foreground font-bold hover:text-primary focus:outline-none focus:underline rounded transition-colors"
                      >
                        Voltar ao Login
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* ─── TRUST BANNER (SOCIAL PROOF) ─────────────────────── */}
        <section className="bg-background py-10 border-b border-border/40 overflow-hidden reveal-on-scroll translate-y-12 opacity-0 transition-all duration-1000 ease-out">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {[
              { icon: Database, label: "Gestão Financeira Integrada" },
              { icon: ShieldCheck, label: "Controle Contábil" },
              { icon: CheckCircle2, label: "Compliance 360º" },
              { icon: Lock, label: "Portal de Stakeholders" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 font-bold tracking-widest text-xs md:text-sm uppercase text-foreground"
              >
                <item.icon
                  className="w-5 h-5 text-primary"
                  aria-hidden="true"
                />{" "}
                {item.label}
              </div>
            ))}
          </div>
        </section>

        {/* ─── STORYTELLING SECTIONS ───────────────────────────── */}

        {/* PAIN POINT: O Caos Dói */}
        <section
          className="py-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16"
          aria-labelledby="problem-heading"
        >
          <article className="w-full md:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-bold tracking-widest uppercase">
              <Activity className="w-4 h-4" aria-hidden="true" />O Problema
            </div>
            <h2
              id="problem-heading"
              className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-[1.1]"
            >
              O caos custa caro.
              <br />
              <span className="text-muted-foreground">
                Desordem financeira mata o crescimento.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-prose">
              Muitos fundadores de startups sofrem tentando conciliar finanças,
              times e documentação em dezenas de ferramentas isoladas e
              planilhas. A ausência de processos claros prejudica o valuation e
              afasta investidores sérios.
            </p>
            <ul className="space-y-4 pt-4">
              {[
                "Riscos escondidos na operação diária descentralizada",
                "Falta de clareza tecnológica no fechamento contábil mensal",
                "Perda irreversível do histórico de decisões estratégicas",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 text-foreground font-medium text-lg"
                >
                  <CheckCircle2
                    className="w-6 h-6 text-destructive shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <div className="w-full md:w-1/2 relative">
            <div className="aspect-[4/3] rounded-[2rem] overflow-hidden border border-border/50 bg-slate-900 shadow-2xl relative flex items-center justify-center p-8">
              <div
                className="absolute inset-0 bg-[url('/images/chaos-pattern.svg')] opacity-10 bg-center"
                aria-hidden="true"
              />
              <div className="w-full max-w-sm p-8 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl rotate-[-2deg] transform transition-transform hover:rotate-0 duration-500">
                <div className="flex items-center gap-3 mb-6 opacity-60 text-white font-medium">
                  <Database className="w-5 h-5" />
                  <span className="truncate">
                    Excel_Financeiro_Final_V4_real.xlsx
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-destructive/20 text-sm font-mono text-red-400 border border-destructive/20 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />{" "}
                    ERRO: Múltiplas versões detectadas.
                  </div>
                  <div className="p-3 rounded-xl bg-orange-500/20 text-sm font-mono text-orange-400 border border-orange-500/20 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />{" "}
                    AVISO: Trilha de auditoria corrompida.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS (WORKFLOW) ────────────────────────── */}
        <section
          className="py-32 px-6 md:px-12 bg-muted/20 border-y border-border/40 reveal-on-scroll translate-y-12 opacity-0 transition-all duration-1000 ease-out"
          aria-labelledby="workflow-heading"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
                <Zap className="w-4 h-4" aria-hidden="true" />
                Workflow Otimizado
              </div>
              <h2
                id="workflow-heading"
                className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-[1.1]"
              >
                Do caos à auditoria perfeita em 3 passos.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div
                className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-px bg-gradient-to-r from-border/0 via-border to-border/0"
                aria-hidden="true"
              />

              {[
                {
                  icon: Database,
                  title: "1. Organização",
                  desc: "Conecte seus dados operacionais e financeiros em um único painel inteligente e protegido.",
                },
                {
                  icon: FileSearch,
                  title: "2. Consistência",
                  desc: "Mapeie indicadores, acompanhe o burn rate e valide suas métricas contábeis com praticidade.",
                },
                {
                  icon: CheckSquare,
                  title: "3. Transparência",
                  desc: "Exporte relatórios precisos formatados nos padrões exigidos para fundos de Venture Capital.",
                },
              ].map((step, i) => (
                <article
                  key={i}
                  className="relative p-8 rounded-[2rem] bg-background border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="w-20 h-20 mx-auto rounded-[1.5rem] bg-slate-950 border border-white/10 flex items-center justify-center mb-8 shadow-xl relative z-10 group-hover:scale-110 transition-transform">
                    <step.icon
                      className="w-8 h-8 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mb-3 text-foreground text-center">
                    {step.title}
                  </h3>
                  <p className="text-base text-muted-foreground font-medium leading-relaxed text-center">
                    {step.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTION: A Fonte da Verdade */}
        <section
          className="py-32 px-6 md:px-12 bg-background reveal-on-scroll translate-y-12 opacity-0 transition-all duration-1000 ease-out delay-100"
          aria-labelledby="solution-heading"
        >
          <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: ShieldCheck,
                    title: "Histórico Confiável",
                    desc: "Cada ação estratégica de finanças é registrada numa base centralizada e protegida.",
                  },
                  {
                    icon: Zap,
                    title: "Gestão Unificada",
                    desc: "Fluxos de aprovação claros sem depender de dezenas de threads de e-mail.",
                  },
                  {
                    icon: Target,
                    title: "Foco Estratégico",
                    desc: "A papelada burocrática fica com a plataforma. A equipe de fundadores foca em crescer.",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Governança Sólida",
                    desc: "Processos escaláveis e trilhas de documentação para embasar relatórios gerenciais.",
                  },
                ].map((feature, i) => (
                  <article
                    key={i}
                    className="p-8 rounded-[2rem] bg-muted/40 border border-border/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <feature.icon
                        className="w-6 h-6 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed font-medium">
                      {feature.desc}
                    </p>
                  </article>
                ))}
              </div>
            </div>
            <article className="w-full md:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
                <KeyRound className="w-4 h-4" aria-hidden="true" />A Solução
              </div>
              <h2
                id="solution-heading"
                className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-[1.1]"
              >
                A base profissional que investidores procuram.
              </h2>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-prose">
                O Cogitari Governance é o hub arquitetural de que sua empresa
                precisa para se tornar governável, transparente e atrativa e
                madura para alavancagem de capital. Construa processos
                confiáveis desde o Dia 1.
              </p>
            </article>
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          className="py-40 px-6 text-center max-w-4xl mx-auto space-y-10"
          aria-label="Call to action"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground leading-tight">
            Preparado para organizar a casa?
          </h2>
          <p className="text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Assuma o controle financeiro hoje mesmo e garanta o valuation
            elevado que a sua startup merece na próxima rodada.
          </p>
          <div className="pt-4">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setAuthMode("register");
              }}
              className="group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-[2rem] text-sm font-bold tracking-[0.2em] uppercase shadow-2xl hover:shadow-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/40 transition-all duration-300 active:scale-95"
            >
              Estruturar A Minha Empresa Agora
              <ArrowRight
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-10 text-center text-sm font-medium text-muted-foreground border-t border-border/30 flex flex-col items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center items-center gap-6">
            <Link
              to="/termos"
              className="hover:text-foreground transition-colors"
            >
              Termos de Uso
            </Link>
            <Link
              to="/privacidade"
              className="hover:text-foreground transition-colors"
            >
              Política de Privacidade
            </Link>
            <Link
              to="/disclaimer"
              className="hover:text-foreground transition-colors"
            >
              Isenção de Responsabilidade
            </Link>
          </div>

          {/* Social / External Links */}
          <div className="flex flex-wrap justify-center items-center gap-6 border-l-0 md:border-l border-border/30 pl-0 md:pl-12">
            <a
              href="https://cogitari.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Blog
            </a>
            <a
              href="https://www.linkedin.com/company/cogitari-tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/Cogitari-Tech"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        <p className="mt-4">
          &copy; {new Date().getFullYear()} Cogitari Governance. CNPJ:
          64.460.886/0001-39. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
