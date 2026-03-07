import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Github,
  Loader2,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
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
    <div className="p-8 md:p-10 space-y-8 group/connector relative overflow-hidden transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover/connector:bg-primary/10 transition-colors duration-700" />

      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left flex-1">
          <div className="w-16 h-16 rounded-[2rem] bg-foreground flex items-center justify-center flex-shrink-0 shadow-2xl shadow-foreground/20 group-hover/connector:scale-105 transition-transform duration-500">
            <Github className="w-8 h-8 text-background" />
          </div>
          <div className="space-y-2 max-w-lg">
            <h3 className="text-2xl font-black text-foreground flex flex-wrap items-center justify-center md:justify-start gap-3">
              Ecossistema GitHub Enterprise
              {isConnected && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full animate-in zoom-in-50 duration-500">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Ativo e Monitorado
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Conecte sua organização para centralizar auditorias de código,
              monitorar o{" "}
              <span className="text-foreground font-bold italic">
                Advanced Security
              </span>{" "}
              e gerenciar permissões de repositórios dinamicamente através do
              Leadgers Governance.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full md:w-auto">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              disabled={connecting}
              className="w-full md:w-auto px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-destructive border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-all rounded-2xl disabled:opacity-50 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                {connecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {connecting
                  ? "Revogando Acesso..."
                  : "Desconectar Sincronização"}
              </span>
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
              className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-background bg-foreground hover:brightness-110 transition-all rounded-2xl disabled:opacity-50 shadow-2xl shadow-foreground/20 active:scale-95 group/btn"
            >
              {connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Github className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" />
              )}
              {connecting ? "Sincronizando..." : "Conectar Organização"}
            </button>
          )}

          <div className="flex items-center gap-2 opacity-40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
              OAuth 2.0 Secure Protocol
            </span>
          </div>
        </div>
      </div>

      {isConnected && (
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] text-muted-foreground font-medium">
              <strong className="text-foreground font-black">
                Fluxo Ativo:
              </strong>{" "}
              Use o painel de governança para visualizar KPIs de segurança em
              tempo real.
            </p>
          </div>
          <Link
            to="/dashboard/github"
            className="group/link flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:brightness-110 transition-all"
          >
            Acessar Painel Auditoria{" "}
            <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {!isConnected && (
        <div className="pt-6 border-t border-border/20 flex flex-wrap gap-x-8 gap-y-3 opacity-30">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">
              Vulnerabilidade CodeQL
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Dependabot Alerts</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Secret Scanning Logs</span>
          </div>
        </div>
      )}
    </div>
  );
}
