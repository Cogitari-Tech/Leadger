import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { ArrowRight, Loader2, Eye, EyeOff, Activity } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/30 selection:text-primary overflow-x-hidden text-foreground flex flex-col items-center justify-center relative">
      {/* ─── NAV HEADER ────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-5 bg-background/40 backdrop-blur-sm transition-all duration-300 flex items-center justify-between border-transparent">
        <div className="flex items-center gap-3">
          <Link to="/">
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
                (e.target as HTMLImageElement).src =
                  "/images/logo-cogitari.png";
              }}
              aria-hidden="true"
            />
          </Link>
          <span
            className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-50 px-2 py-0.5 border-l border-border ml-2"
            aria-label="Governance"
          >
            Governance
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Unified Background Layer (Synced with LandingPage) */}
      <div
        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay dark:opacity-10 pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 pointer-events-none z-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary via-transparent to-transparent blur-3xl" />
      </div>

      {/* Login Card */}
      <main className="w-full max-w-md relative z-10 px-6 py-24 sm:py-32">
        <div className="w-full bg-background text-foreground rounded-[2rem] shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 dark:border-white/5 overflow-hidden p-8 md:p-10">
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl md:text-3xl font-bold tracking-tight text-foreground">
              Acesso
            </h1>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-3">
              Identificação Exclusiva
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
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
                  htmlFor="email"
                  className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest ml-1 cursor-pointer w-fit"
                >
                  E-mail Institucional
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 text-sm bg-muted/40 border border-border/60 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm rounded-2xl font-medium placeholder:opacity-40"
                  placeholder="nome@empresa.com"
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <div className="flex items-center justify-between ml-1">
                  <label
                    htmlFor="password"
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
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-4 text-sm bg-muted/40 border border-border/60 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300 shadow-sm rounded-2xl font-medium tracking-widest placeholder:opacity-40"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
                    title={showPassword ? "Ocultar senha" : "Exibir senha"}
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
                loading ||
                (!!import.meta.env.VITE_TURNSTILE_SITE_KEY && !turnstileToken)
              }
              className="group w-full bg-primary text-primary-foreground py-4 text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 shadow-xl shadow-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 transition-all duration-300 rounded-2xl active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
            >
              {submitting || loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Iniciar Sessão"
              )}
              {!submitting && !loading && (
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>

          {/* SSO */}
          <div className="mt-8 pt-6 border-t border-border/30 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4">
              <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.3em]">
                Ou entre com
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={signInWithGoogle}
                type="button"
                className="flex items-center justify-center gap-2 border border-border/60 py-3 rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-muted/50 transition-all active:scale-95"
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
                className="flex items-center justify-center gap-2 border border-border/60 py-3 rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-muted/50 transition-all active:scale-95"
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
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-[13px] font-medium">
              Ainda não possui acesso?{" "}
              <Link
                to="/register"
                className="text-foreground font-bold hover:text-primary focus:outline-none focus:underline rounded transition-colors"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
