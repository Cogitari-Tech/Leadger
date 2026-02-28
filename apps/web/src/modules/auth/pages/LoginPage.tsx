import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { ArrowRight, Loader2, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";

export function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : "Erro ao fazer login. Tente novamente.",
      );
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative font-sans selection:bg-brand-500 selection:text-white p-6">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[-10%] w-[120%] h-[1px] bg-white/30 rotate-[-12deg]"></div>
        <div className="absolute top-[60%] right-[-10%] w-[120%] h-[1px] bg-brand-500/50 rotate-[15deg]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10 w-full flex flex-col items-center">
          <Link to="/">
            <img
              src="/images/logo-cogitari-dark.png"
              alt="Cogitari"
              className="h-8 w-auto mb-4 hover:opacity-80 transition-opacity"
            />
          </Link>
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-70 border border-white/20 px-2 py-0.5 rounded-sm text-white">
            Autosserviço Restrito
          </span>
        </div>

        {/* Main Auth Frame */}
        <div className="w-full bg-slate-900 border border-slate-700 shadow-clay-dark p-8 md:p-12">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tighter uppercase mb-2">
              Login Direct
            </h2>
            <p className="text-slate-400 text-sm">
              Acesso direto ao seu painel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {error && (
              <div className="p-4 bg-red-500/10 border-l-2 border-red-500 text-red-500 text-sm font-medium flex items-center gap-3">
                <ShieldAlert className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  E-mail Organizacional
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors rounded-none placeholder:text-slate-600"
                  placeholder="nome@empresa.com"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Senha de Acesso
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-brand-500 hover:text-brand-400 font-medium"
                  >
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/50 border border-slate-700 text-white px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors rounded-none placeholder:text-slate-600 font-mono tracking-widest"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-4 font-bold tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]"
            >
              {submitting || loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Acessar Sistema"
              )}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
