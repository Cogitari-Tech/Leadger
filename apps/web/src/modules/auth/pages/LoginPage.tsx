import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  ShieldCheck,
  Database,
  Eye,
  EyeOff,
} from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";
import { Turnstile } from "@marsidev/react-turnstile";

export function LoginPage() {
  const { signIn, signInWithGoogle, signInWithGitHub, user, loading } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // If already logged in, redirect
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Captcha validation
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (siteKey && !turnstileToken) {
      setError("Por favor, confirme que você não é um robô.");
      return;
    }

    setSubmitting(true);

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
    setSubmitting(false);
  };

  // ─── Input field classes ─────────────────────────────────
  const inputClass =
    "w-full px-5 py-3 text-sm bg-background/50 border border-border/40 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all rounded-xl font-medium placeholder:opacity-50";
  const labelClass =
    "text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1";
  const btnPrimary =
    "w-full bg-primary text-primary-foreground py-4 text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 shadow-lg shadow-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:opacity-50 transition-all rounded-xl active:scale-95";

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
      <div className="hidden md:flex flex-col justify-between w-[50%] lg:w-[60%] p-16 lg:p-24 relative z-10 overflow-hidden border-r border-border/10 bg-background/50 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <Link to="/">
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
                (e.target as HTMLImageElement).src =
                  "/images/logo-cogitari.png";
              }}
            />
          </Link>
          <span className="text-[10px] font-semibold tracking-[0.3em] uppercase opacity-40 px-3 py-1 bg-foreground/5 rounded-full">
            Autosserviço Restrito
          </span>
        </div>

        <div className="space-y-10 mt-12 flex-grow flex flex-col justify-center">
          <h1 className="text-5xl lg:text-[4.5rem] font-bold tracking-tight text-foreground leading-[1.05]">
            Relatórios com <br />
            <span className="text-primary">Precisão Absoluta.</span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground font-medium leading-relaxed">
            Acesse seu painel corporativo e gerencie seus dados de auditoria
            estratégica e compliance em tempo real.
          </p>

          <div className="flex gap-10 pt-10 border-t border-border/10 w-fit">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldCheck className="text-primary w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest leading-tight">
                Acesso Seguro
                <br />
                Monitorado
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="text-primary w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest leading-tight">
                Dados
                <br />
                Isolados
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground/60 font-medium">
          &copy; {new Date().getFullYear()} Cogitari Tech. Todos os direitos
          reservados.
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full md:w-[50%] lg:w-[40%] flex flex-col items-center justify-center p-8 sm:p-12 relative z-10">
        <div className="w-full max-w-[400px]">
          {/* Mobile Logo Header */}
          <div className="md:hidden flex flex-col items-center mb-10">
            <Link to="/">
              <img
                src="/images/logo-cogitari.png"
                alt="Cogitari"
                className="h-8 w-auto block dark:hidden mb-4"
              />
              <img
                src="/images/logo-cogitari-dark.png"
                alt="Cogitari"
                className="h-8 w-auto hidden dark:block mb-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/images/logo-cogitari.png";
                }}
              />
            </Link>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-70 border border-border/40 px-2 py-0.5 rounded-sm">
              Autosserviço Restrito
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Bem-vindo(a)
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Acesso corporativo ao Amuri Audit
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="space-y-4">
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
                  placeholder="nome@empresa.com"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className={labelClass}>
                    Senha
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:text-primary/80 font-semibold uppercase tracking-widest transition-colors"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} tracking-widest`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
                    title={showPassword ? "Ocultar senha" : "Exibir senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Turnstile */}
              {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                <div className="flex justify-center mt-2">
                  <Turnstile
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      setError(null);
                    }}
                    onError={() => setError("Falha ao carregar o CAPTCHA.")}
                    options={{
                      theme: "auto",
                      size: "normal",
                    }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={
                submitting ||
                loading ||
                (!!import.meta.env.VITE_TURNSTILE_SITE_KEY && !turnstileToken)
              }
              className={btnPrimary}
            >
              {submitting || loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Acessando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Acessar Sistema <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>

            <p className="text-center text-sm text-muted-foreground/80 font-medium">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-bold"
              >
                Criar conta
              </Link>
            </p>

            {/* SSO */}
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/20" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-background px-4 font-bold text-muted-foreground/40 uppercase tracking-widest">
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
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
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
        </div>
      </div>
    </div>
  );
}
