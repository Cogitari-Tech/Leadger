import {
  Trophy,
  ArrowUpRight,
  ShieldAlert,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";
import { useHealthScore } from "../hooks/useHealthScore";

export default function HealthScoreDashboard() {
  const { data, loading, error } = useHealthScore();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        Ocorreu um erro ao carregar o Health Score.
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
            Health Score
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Métrica consolidadadora da saúde estratégica da sua empresa baseada
            em IA e dados unificados.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Atualizado em:</span>
          <span className="px-3 py-1 bg-muted rounded-full text-xs font-semibold">
            {new Date(data.date || new Date()).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Score Card */}
        <div className="lg:col-span-1 glass-card soft-shadow rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10 text-primary" />
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Score Geral
          </h3>
          <div className="text-8xl flex items-baseline justify-center font-bold pb-2">
            <span className={getScoreColor(data.total_score)}>
              {data.total_score}
            </span>
            <span className="text-3xl text-muted-foreground/40 font-normal">
              /100
            </span>
          </div>

          <p className="text-sm mt-4 text-muted-foreground max-w-[250px]">
            {data.total_score >= 80
              ? "Sua startup está com indicadores excepcionais!"
              : data.total_score >= 60
                ? "Métricas aceitáveis, mas com pontos de atenção."
                : "Risco alto identificado. É necessário ação imediata."}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {[
            {
              name: "Financeiro",
              score: data.financial,
              icon: ArrowUpRight,
              desc: "Runway e Burn Rate",
            },
            {
              name: "Produto / Tech",
              score: data.product,
              icon: ArrowUpRight,
              desc: "Tech Debt & Entregas",
            },
            {
              name: "Riscos & Compliance",
              score: data.compliance,
              icon: ShieldAlert,
              desc: "SWOT & Normas",
            },
            {
              name: "Comercial / Vendas",
              score: data.commercial,
              icon: ArrowUpRight,
              desc: "MRR & Aquisição",
            },
          ].map((pillar) => (
            <div
              key={pillar.name}
              className="glass-card soft-shadow rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-foreground">
                    {pillar.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pillar.desc}
                  </p>
                </div>
                <div className={`p-2 rounded-xl bg-muted`}>
                  <pillar.icon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <span
                  className={`text-4xl font-bold ${getScoreColor(pillar.score)}`}
                >
                  {pillar.score}
                </span>
                <span className="text-sm text-muted-foreground font-medium mb-1">
                  %
                </span>
              </div>

              <div className="mt-4 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getScoreBg(pillar.score)} transition-all duration-1000 ease-out`}
                  style={{ width: `${pillar.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights / Alerts */}
      <div className="glass-card soft-shadow rounded-3xl p-8">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
          <BadgeCheck className="w-5 h-5 text-primary" />
          Alertas Preditivos do Motor de IA
        </h3>

        {data.alerts && data.alerts.length > 0 ? (
          <div className="space-y-4">
            {data.alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex gap-4 p-4 rounded-2xl border ${
                  alert.type === "red"
                    ? "bg-red-500/5 border-red-500/20"
                    : alert.type === "yellow"
                      ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-emerald-500/5 border-emerald-500/20"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {alert.type === "red" && (
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  )}
                  {alert.type === "yellow" && (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                  {alert.type === "green" && (
                    <BadgeCheck className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
                <div>
                  <h5
                    className={`font-semibold text-sm ${
                      alert.type === "red"
                        ? "text-red-500"
                        : alert.type === "yellow"
                          ? "text-amber-500"
                          : "text-emerald-500"
                    }`}
                  >
                    Pilar: {alert.component}
                  </h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground p-6 text-center border rounded-2xl bg-muted/20 border-border">
            Nenhum alerta preditivo crítico para a sua empresa neste momento. O
            motor de IA irá monitorar.
          </div>
        )}
      </div>
    </div>
  );
}
