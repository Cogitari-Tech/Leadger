import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  Database,
  Building2,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Search,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";
import type { Tenant, SignupMode } from "../types/auth.types";

type WizardStep = "personal" | "choice" | "create" | "join";

export function RegisterPage() {
  const {
    signUp,
    signInWithGoogle,
    signInWithGitHub,
    user,
    loading,
    searchTenants,
    requestAccess,
  } = useAuth();

  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite_token");
  const inviteMode = searchParams.get("mode") as SignupMode | null;

  // Wizard state
  const [step, setStep] = useState<WizardStep>("personal");

  // Personal info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Create company
  const [companyName, setCompanyName] = useState("");

  // Join company
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [joinMessage, setJoinMessage] = useState("");
  const [searching, setSearching] = useState(false);

  // Common
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMode, setSuccessMode] = useState<SignupMode>("create");
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect
  if (user) return <Navigate to="/" replace />;

  // If registration succeeded
  if (success) {
    if (successMode === "join")
      return <Navigate to="/pending-approval" replace />;
    return <Navigate to="/verify-email" replace />;
  }

  // ─── Search tenants with debounce ────────────────────────
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchTenants(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, searchTenants]);

  // ─── Handlers ────────────────────────────────────────────
  const handlePersonalNext = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    // If coming from invite link, skip the choice step
    if (inviteToken && inviteMode) {
      handleInviteSignup();
      return;
    }
    setStep("choice");
  };

  const handleInviteSignup = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { error: authError } = await signUp(email, password, {
        name,
        signup_mode: inviteMode || "invite",
        invite_token: inviteToken || undefined,
      });
      if (authError) throw authError;
      setSuccessMode("invite");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCompany = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { error: authError } = await signUp(email, password, {
        name,
        companyName,
        signup_mode: "create",
      });
      if (authError) throw authError;
      setSuccessMode("create");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinCompany = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) {
      setError("Selecione uma empresa para solicitar acesso.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { error: authError } = await signUp(email, password, {
        name,
        signup_mode: "join",
      });
      if (authError) throw authError;

      // After signup, send the access request
      const { error: reqError } = await requestAccess(
        selectedTenant.id,
        joinMessage || undefined,
      );
      if (reqError) throw reqError;

      setSuccessMode("join");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Input field classes ─────────────────────────────────
  const inputClass =
    "w-full px-5 py-3 text-sm bg-background/50 border border-border/40 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all rounded-xl font-medium placeholder:opacity-50";
  const labelClass =
    "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1";
  const btnPrimary =
    "w-full bg-primary text-primary-foreground py-4 text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 shadow-lg shadow-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-50 transition-all rounded-xl active:scale-95";

  // ─── Wizard Steps ────────────────────────────────────────

  const renderPersonalStep = () => (
    <form onSubmit={handlePersonalNext} className="space-y-5">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className={labelClass}>
            Nome Completo
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className={labelClass}>
            E-mail institucional
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.nome@empresa.com"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className={labelClass}>
            Senha de segurança
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${inputClass} tracking-widest`}
            minLength={6}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || loading}
        className={btnPrimary}
      >
        <span className="flex items-center justify-center gap-2">
          Continuar <ArrowRight className="w-4 h-4" />
        </span>
      </button>

      <p className="text-center text-sm text-muted-foreground/80 font-medium">
        Já tem uma conta?{" "}
        <Link to="/login" className="text-primary hover:underline font-bold">
          Fazer login
        </Link>
      </p>

      {/* SSO */}
      <div className="relative pt-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/20" />
        </div>
        <div className="relative flex justify-center text-[10px]">
          <span className="bg-transparent backdrop-blur-md px-4 font-bold text-muted-foreground/40 uppercase tracking-widest">
            Single Sign-On
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={signInWithGoogle}
          type="button"
          className="flex items-center justify-center gap-2 border border-border/40 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-muted/50 transition-all active:scale-95"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32l3.56 2.76c2.07-1.9 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>
        <button
          onClick={signInWithGitHub}
          type="button"
          className="flex items-center justify-center gap-2 border border-border/40 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-muted/50 transition-all active:scale-95"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          GitHub
        </button>
      </div>
    </form>
  );

  const renderChoiceStep = () => (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          Olá, <strong>{name}</strong>! Como deseja continuar?
        </p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => setStep("create")}
          className="group flex items-center gap-4 p-5 border border-border/40 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
        >
          <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">Criar Nova Empresa</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure sua organização e convide a equipe
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={() => setStep("join")}
          className="group flex items-center gap-4 p-5 border border-border/40 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
        >
          <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">
              Ingressar em Empresa Existente
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Busque sua empresa e solicite acesso
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </button>
      </div>

      <button
        onClick={() => setStep("personal")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
    </div>
  );

  const renderCreateStep = () => (
    <form onSubmit={handleCreateCompany} className="space-y-5">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl">
        <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Você será o <strong className="text-foreground">Owner</strong> da
          empresa e poderá convidar membros após a configuração.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="companyName" className={labelClass}>
            Nome da Empresa
          </label>
          <input
            id="companyName"
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Ex: Cogitari Tech"
            className={inputClass}
          />
        </div>

        {companyName && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-4 py-2.5 rounded-lg">
            <span className="opacity-60">Slug:</span>
            <code className="font-mono text-primary font-semibold">
              {companyName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")}
            </code>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting || loading}
        className={btnPrimary}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Criando...
          </span>
        ) : (
          "Criar Empresa e Continuar"
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          setStep("choice");
          setError(null);
        }}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
    </form>
  );

  const renderJoinStep = () => (
    <form onSubmit={handleJoinCompany} className="space-y-5">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
        <UserPlus className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Sua solicitação será enviada ao administrador da empresa para
          aprovação.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="search" className={labelClass}>
            Buscar Empresa
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedTenant(null);
              }}
              placeholder="Nome ou slug da empresa"
              className={`${inputClass} pl-11`}
            />
            {searching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && !selectedTenant && (
          <div className="border border-border/30 rounded-xl overflow-hidden divide-y divide-border/20 max-h-48 overflow-y-auto">
            {searchResults.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelectedTenant(t);
                  setSearchQuery(t.name);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {t.slug}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {searchQuery.length >= 2 &&
          searchResults.length === 0 &&
          !searching && (
            <p className="text-xs text-muted-foreground text-center py-3">
              Nenhuma empresa encontrada. Verifique o nome ou slug.
            </p>
          )}

        {/* Selected tenant */}
        {selectedTenant && (
          <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold">{selectedTenant.name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {selectedTenant.slug}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedTenant(null);
                setSearchQuery("");
              }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Alterar
            </button>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="joinMessage" className={labelClass}>
            Mensagem (opcional)
          </label>
          <textarea
            id="joinMessage"
            value={joinMessage}
            onChange={(e) => setJoinMessage(e.target.value)}
            placeholder="Ex: Sou o novo auditor da equipe de compliance..."
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || loading || !selectedTenant}
        className={btnPrimary}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
          </span>
        ) : (
          "Criar Conta e Solicitar Acesso"
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          setStep("choice");
          setError(null);
        }}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>
    </form>
  );

  // ─── Step titles ─────────────────────────────────────────
  const stepConfig: Record<WizardStep, { title: string; subtitle: string }> = {
    personal: {
      title: "Criar Conta",
      subtitle: "Inicie seu período de testes",
    },
    choice: { title: "Sua Empresa", subtitle: "Como deseja começar?" },
    create: { title: "Nova Empresa", subtitle: "Configure sua organização" },
    join: { title: "Ingressar", subtitle: "Solicite acesso a uma empresa" },
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative overflow-hidden font-sans">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      {/* Dynamic Background decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
      </div>

      {/* Left side: Hero / Branding */}
      <div className="hidden md:flex flex-col justify-between w-[50%] lg:w-[60%] p-16 lg:p-24 relative z-10 overflow-hidden">
        <div className="flex items-center justify-between">
          <img
            src="/images/logo-cogitari.png"
            alt="Cogitari"
            className="h-9 w-auto block dark:hidden transition-all opacity-90 hover:opacity-100"
          />
          <img
            src="/images/logo-cogitari-dark.png"
            alt="Cogitari"
            className="h-9 w-auto hidden dark:block transition-all opacity-90 hover:opacity-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/logo-cogitari.png";
            }}
          />
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase opacity-40 px-3 py-1 bg-foreground/5 rounded-full">
            Enterprise Security
          </span>
        </div>

        <div className="space-y-10 mt-12 flex-grow flex flex-col justify-center">
          <h1 className="text-5xl lg:text-[4.5rem] font-bold tracking-tight text-foreground leading-[1.05]">
            Relatórios com <br />
            <span className="text-primary">Precisão Absoluta.</span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground font-medium leading-relaxed">
            Plataforma avançada de auditoria e compliance corporativo. Crie sua
            conta e comece a gerenciar seus dados estratégicos.
          </p>

          <div className="flex gap-10 pt-10 border-t border-border/10 w-fit">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldCheck className="text-primary w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest leading-tight">
                Privacidade
                <br />
                Garantida
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="text-primary w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest leading-tight">
                Dados
                <br />
                Estruturados
              </span>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-semibold text-muted-foreground/30 uppercase tracking-[0.4em]">
          © 2026 Cogitari Governance · Cogitari Tech
        </div>
      </div>

      {/* Right side: Register Wizard */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-16 relative z-20 h-full overflow-y-auto">
        <div className="glass-panel p-8 sm:p-10 rounded-[2rem] soft-shadow w-full max-w-md mx-auto space-y-8 border border-white/10 dark:border-white/5 my-auto">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-6">
            <img
              src="/images/logo-cogitari.png"
              alt="Cogitari"
              className="h-8 w-auto block dark:hidden transition-all opacity-90 hover:opacity-100"
            />
            <img
              src="/images/logo-cogitari-dark.png"
              alt="Cogitari"
              className="h-8 w-auto hidden dark:block transition-all opacity-90 hover:opacity-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/images/logo-cogitari.png";
              }}
            />
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {(
              [
                "personal",
                "choice",
                step === "create" ? "create" : "join",
              ] as WizardStep[]
            ).map((s, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-8 bg-primary"
                    : i < ["personal", "choice", step].indexOf(step)
                      ? "w-4 bg-primary/40"
                      : "w-4 bg-border/40"
                }`}
              />
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {stepConfig[step].title}
            </h2>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">
              {stepConfig[step].subtitle}
            </p>
          </div>

          {step === "personal" && renderPersonalStep()}
          {step === "choice" && renderChoiceStep()}
          {step === "create" && renderCreateStep()}
          {step === "join" && renderJoinStep()}
        </div>
      </div>
    </div>
  );
}
