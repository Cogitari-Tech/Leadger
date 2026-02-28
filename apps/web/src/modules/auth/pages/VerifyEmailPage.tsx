import { MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../../../shared/components/ui/ThemeToggle";

/**
 * Shown to users who registered but haven't confirmed their email yet,
 * or when AuthGuard detects an unconfirmed session.
 */
export function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Background decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto p-8">
        <div className="glass-card soft-shadow rounded-[2.5rem] p-10 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <MailCheck className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            Verifique seu E-mail
          </h1>

          <p className="text-muted-foreground leading-relaxed">
            Enviamos um link de confirmação para o seu e-mail institucional.
            <br />
            <strong className="text-foreground">
              Acesse sua caixa de entrada
            </strong>{" "}
            e clique no link para ativar sua conta.
          </p>

          <div className="pt-4 border-t border-border/20 space-y-3">
            <p className="text-xs text-muted-foreground">
              Não recebeu? Verifique a pasta de spam ou lixo eletrônico.
            </p>
            <Link
              to="/"
              className="w-full inline-flex justify-center items-center py-4 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Voltar para Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
