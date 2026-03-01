import { useState } from "react";
import { Link } from "react-router-dom";
import { Github, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";

export function GitHubConnect() {
  const { signInWithGitHub } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleDisconnect = async () => {
    setConnecting(true);
    // Simulate API disconnection process
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsConnected(false);
    setConnecting(false);
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
            <Github className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              GitHub Organization
              {isConnected && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Conectado
                </span>
              )}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Sincronize repositórios e alertas do GitHub Advanced Security.
            </p>
          </div>
        </div>
        {isConnected ? (
          <button
            onClick={handleDisconnect}
            disabled={connecting}
            className="px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors rounded-xl disabled:opacity-50"
          >
            {connecting ? "Desconectando..." : "Desconectar"}
          </button>
        ) : (
          <button
            onClick={async () => {
              setConnecting(true);
              try {
                await signInWithGitHub();
              } catch (err) {
                console.error(err);
                setConnecting(false);
              }
            }}
            disabled={connecting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors rounded-xl disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Github className="w-4 h-4" />
            )}
            {connecting ? "Conectando..." : "Conectar Organização"}
          </button>
        )}
      </div>

      {isConnected && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <strong className="text-foreground">Dica:</strong> Vá até o painel
            de Governança do GitHub para monitorar os KPIs de segurança.
          </p>
          <Link
            to="/dashboard/github"
            className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            Acessar Painel <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
