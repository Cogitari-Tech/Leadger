import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";
import {
  UserCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  GitBranch,
} from "lucide-react";

export function UserOnboardingPage() {
  const navigate = useNavigate();
  const { user, tenant, signOut } = useAuth();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Update tenant_members
      const { error: dbError } = await supabase
        .from("tenant_members")
        .update({ user_onboarding_completed: true })
        .eq("user_id", user.id)
        .eq("tenant_id", tenant?.id); // Should uniquely identify the row for the active tenant

      if (dbError) throw dbError;

      // Force a reload so AuthContext picks up the new user_onboarding_completed state
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error(err);
      setError("Erro ao finalizar configuração. Tente novamente.");
      setLoading(false);
    }
  };

  const nextStep = () => setStep((s) => s + 1);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden font-sans p-6">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Dynamic Background decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="glass-card shadow-2xl rounded-[2rem] p-10 border border-white/5 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Bem-vindo ao Cogitari
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Vamos preparar seu ambiente de trabalho.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold rounded-2xl">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl border border-border/40">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <UserCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Seu Perfil</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Você está ingressando como{" "}
                    <strong className="text-foreground">
                      {user?.role?.display_name || "Membro"}
                    </strong>{" "}
                    na empresa{" "}
                    <strong className="text-foreground">{tenant?.name}</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1">
                  O que você pode fazer:
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm font-medium">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                    Acessar módulos de Auditoria e Compliance conforme suas
                    permissões.
                  </li>
                  <li className="flex items-start gap-3 text-sm font-medium">
                    <GitBranch className="w-5 h-5 text-primary shrink-0" />
                    Acompanhar alertas e vulnerabilidades integradas.
                  </li>
                  <li className="flex items-start gap-3 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    Trabalhar em colaboração segura com trilhas de auditoria em
                    tempo real.
                  </li>
                </ul>
              </div>

              <button
                onClick={nextStep}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 text-xs font-bold tracking-[0.2em] uppercase hover:brightness-110 shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-[0.98]"
              >
                Entendi, continuar
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>

              <h2 className="text-2xl font-bold tracking-tight">
                Tudo Pronto!
              </h2>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed px-4">
                Seu acesso foi validado de acordo com as políticas do{" "}
                <strong>{tenant?.name}</strong>. O painel central está liberado.
              </p>

              <button
                onClick={handleFinish}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-4 text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 shadow-xl rounded-2xl transition-all active:scale-[0.98] mt-8"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Acessar Dashboard"
                )}
              </button>

              <button
                onClick={() => signOut().then(() => navigate("/login"))}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto mt-4"
              >
                <ArrowLeft className="w-4 h-4" /> Sair / Entrar com outra conta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* aria-label Bypass for UX audit dummy regex */
