import { useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Presentation,
  Download,
  Save,
  Trash2,
  Settings,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useFinancialProjections } from "../hooks/useFinancialProjections";

export default function FinancialProjections() {
  const {
    projections,
    assumptions,
    yearsAhead,
    activeScenario,
    chartData,
    loading,
    setAssumptions,
    setYearsAhead,
    setActiveScenario,
    saveProjection,
    deleteProjection,
    formatCurrency,
  } = useFinancialProjections();

  const [showSettings, setShowSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const printRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Projeções Financeiras - Pitch Deck</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', system-ui, sans-serif; }
                body { padding: 40px; background: #0a0a0a; color: #fafafa; }
                .header { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
                .subtitle { color: #888; font-size: 14px; margin-bottom: 40px; }
                .scenario-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }
                .scenario-card { background: #1a1a1a; border: 1px solid #333; border-radius: 24px; padding: 24px; }
                .scenario-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #888; }
                .scenario-value { font-size: 24px; font-weight: 800; margin-top: 4px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #222; font-size: 12px; }
                th { font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #888; font-size: 10px; }
                .text-primary { color: #3b82f6; }
                .text-green { color: #10b981; }
                .text-red { color: #ef4444; }
                @media print { body { background: white; color: black; } .scenario-card { background: #f5f5f5; border-color: #ddd; } th { color: #666; } td { border-color: #eee; } }
              </style>
            </head>
            <body>
              <div class="header">Projeções Financeiras</div>
              <div class="subtitle">Projeção de ${yearsAhead} anos • Gerado em ${new Date().toLocaleDateString("pt-BR")}</div>
              ${printContent}
              <script>setTimeout(() => window.print(), 500);</script>
            </body>
          </html>
        `);
        win.document.close();
      }
    }
  };

  const scenarioColors = {
    pessimistic: "#ef4444",
    base: "#3b82f6",
    optimistic: "#10b981",
  };

  const scenarioLabels = {
    pessimistic: "Pessimista",
    base: "Base",
    optimistic: "Otimista",
  };

  return (
    <div className="space-y-8">
      {/* SEO Metadata */}
      <div className="hidden" aria-hidden="true">
        <title>Projeções Financeiras | Cogitari Governance</title>
        <meta
          name="description"
          content="Gere projeções financeiras detalhadas para o seu pitch deck com 3 cenários integrados."
        />
        <meta
          property="og:title"
          content="Projeções Financeiras - Cogitari Governance"
        />
        <meta
          property="og:description"
          content="Modele o futuro financeiro da sua startup."
        />
      </div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-1 bg-primary rounded-full" />
            <h1 className="text-4xl font-bold tracking-tight font-display">
              Projeções Financeiras
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Projeções de {yearsAhead} anos para pitch — 3 cenários.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="rounded-2xl px-6"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" /> Premissas
          </Button>
          <Button
            variant="secondary"
            className="rounded-2xl px-6"
            onClick={() => setShowSaveModal(true)}
          >
            <Save className="w-4 h-4 mr-2" /> Salvar
          </Button>
          <Button
            variant="primary"
            className="rounded-2xl px-6 shadow-lg shadow-primary/20"
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4 mr-2" /> Exportar Pitch
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="glass-card soft-shadow p-8 bg-muted/20 dark:bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-border">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">
            Premissas do Modelo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Crescimento Receita Base (%)
              </label>
              <input
                type="number"
                value={Math.round(assumptions.revenueGrowthBase * 100)}
                onChange={(e) =>
                  setAssumptions({
                    ...assumptions,
                    revenueGrowthBase: Number(e.target.value) / 100,
                  })
                }
                className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-sm outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Crescimento Despesa Base (%)
              </label>
              <input
                type="number"
                value={Math.round(assumptions.expenseGrowthBase * 100)}
                onChange={(e) =>
                  setAssumptions({
                    ...assumptions,
                    expenseGrowthBase: Number(e.target.value) / 100,
                  })
                }
                className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-sm outline-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Melhoria de Margem Anual (%)
              </label>
              <input
                type="number"
                value={Math.round(assumptions.marginImprovement * 100)}
                onChange={(e) =>
                  setAssumptions({
                    ...assumptions,
                    marginImprovement: Number(e.target.value) / 100,
                  })
                }
                className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-sm outline-none"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-4 items-center">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Anos de Projeção
            </label>
            <input
              type="range"
              min={3}
              max={10}
              value={yearsAhead}
              onChange={(e) => setYearsAhead(Number(e.target.value))}
              className="accent-primary flex-1"
            />
            <span className="text-sm font-bold w-8">{yearsAhead}</span>
          </div>
        </div>
      )}

      {/* Chart Controls */}
      <div className="flex gap-3 items-center">
        <div className="flex bg-muted/40 rounded-2xl p-1">
          {(["all", "pessimistic", "base", "optimistic"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveScenario(s)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeScenario === s ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
            >
              {s === "all" ? "Todos" : scenarioLabels[s]}
            </button>
          ))}
        </div>
        <div className="flex bg-muted/40 rounded-2xl p-1 ml-auto">
          <button
            onClick={() => setChartType("bar")}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${chartType === "bar" ? "bg-foreground/10" : ""}`}
          >
            Barras
          </button>
          <button
            onClick={() => setChartType("line")}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${chartType === "line" ? "bg-foreground/10" : ""}`}
          >
            Linhas
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card soft-shadow p-10 bg-muted/20 dark:bg-card/40 backdrop-blur-xl rounded-[3rem] border border-border">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">
              Receita Projetada
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
              Visão comparativa por cenário
            </p>
          </div>
          <Presentation className="w-5 h-5 text-primary opacity-40" />
        </div>

        <ResponsiveContainer width="100%" height={400}>
          {chartType === "bar" ? (
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                tick={{
                  fill: "rgba(255,255,255,0.4)",
                  fontSize: 12,
                  fontWeight: 700,
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fill: "rgba(255,255,255,0.4)",
                  fontSize: 10,
                  fontWeight: 700,
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  color: "#fff",
                }}
                formatter={(v: number) => [formatCurrency(v), ""]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{
                  paddingBottom: "24px",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                }}
              />
              {(activeScenario === "all" ||
                activeScenario === "pessimistic") && (
                <Bar
                  dataKey="pessimisticRevenue"
                  name="Pessimista"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                  opacity={0.85}
                />
              )}
              {(activeScenario === "all" || activeScenario === "base") && (
                <Bar
                  dataKey="baseRevenue"
                  name="Base"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  opacity={0.85}
                />
              )}
              {(activeScenario === "all" ||
                activeScenario === "optimistic") && (
                <Bar
                  dataKey="optimisticRevenue"
                  name="Otimista"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  opacity={0.85}
                />
              )}
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                tick={{
                  fill: "rgba(255,255,255,0.4)",
                  fontSize: 12,
                  fontWeight: 700,
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fill: "rgba(255,255,255,0.4)",
                  fontSize: 10,
                  fontWeight: 700,
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  color: "#fff",
                }}
                formatter={(v: number) => [formatCurrency(v), ""]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{
                  paddingBottom: "24px",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                }}
              />
              {(activeScenario === "all" ||
                activeScenario === "pessimistic") && (
                <Line
                  type="monotone"
                  dataKey="pessimisticRevenue"
                  name="Pessimista"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={false}
                />
              )}
              {(activeScenario === "all" || activeScenario === "base") && (
                <Line
                  type="monotone"
                  dataKey="baseRevenue"
                  name="Base"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                />
              )}
              {(activeScenario === "all" ||
                activeScenario === "optimistic") && (
                <Line
                  type="monotone"
                  dataKey="optimisticRevenue"
                  name="Otimista"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Profit Chart */}
      <div className="glass-card soft-shadow p-10 bg-muted/20 dark:bg-card/40 backdrop-blur-xl rounded-[3rem] border border-border">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground font-display tracking-tight">
              Lucro Projetado
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
              Receita - Despesas por ano
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              tick={{
                fill: "rgba(255,255,255,0.4)",
                fontSize: 12,
                fontWeight: 700,
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{
                fill: "rgba(255,255,255,0.4)",
                fontSize: 10,
                fontWeight: 700,
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                color: "#fff",
              }}
              formatter={(v: number) => [formatCurrency(v), ""]}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{
                paddingBottom: "24px",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase" as const,
              }}
            />
            {(activeScenario === "all" || activeScenario === "pessimistic") && (
              <Bar
                dataKey="pessimisticProfit"
                name="Pessimista"
                fill="#ef444480"
                radius={[8, 8, 0, 0]}
              />
            )}
            {(activeScenario === "all" || activeScenario === "base") && (
              <Bar
                dataKey="baseProfit"
                name="Base"
                fill="#3b82f680"
                radius={[8, 8, 0, 0]}
              />
            )}
            {(activeScenario === "all" || activeScenario === "optimistic") && (
              <Bar
                dataKey="optimisticProfit"
                name="Otimista"
                fill="#10b98180"
                radius={[8, 8, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hidden Print Content */}
      <div ref={printRef} className="hidden">
        <div className="scenario-grid">
          {(["pessimistic", "base", "optimistic"] as const).map((s) => (
            <div key={s} className="scenario-card">
              <p className="scenario-label">{scenarioLabels[s]}</p>
              <p
                className="scenario-value"
                style={{ color: scenarioColors[s] }}
              >
                {formatCurrency(
                  chartData[chartData.length - 1]?.[`${s}Revenue`] || 0,
                )}
              </p>
              <p className="scenario-label" style={{ marginTop: "8px" }}>
                Receita Ano {yearsAhead}
              </p>
            </div>
          ))}
        </div>
        <table>
          <thead>
            <tr>
              <th>Ano</th>
              <th>Receita (Pessim.)</th>
              <th>Receita (Base)</th>
              <th>Receita (Otim.)</th>
              <th>Lucro (Base)</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.year}>
                <td style={{ fontWeight: 700 }}>{row.year}</td>
                <td className="text-red">
                  {formatCurrency(row.pessimisticRevenue)}
                </td>
                <td className="text-primary">
                  {formatCurrency(row.baseRevenue)}
                </td>
                <td className="text-green">
                  {formatCurrency(row.optimisticRevenue)}
                </td>
                <td style={{ fontWeight: 700 }}>
                  {formatCurrency(row.baseProfit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Saved Projections */}
      {projections.length > 0 && (
        <div className="glass-card soft-shadow overflow-hidden bg-muted/20 dark:bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-border">
          <div className="p-8 border-b border-border/40">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Projeções Salvas
            </h3>
          </div>
          <div className="divide-y divide-border/10">
            {projections.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-8 py-6 hover:bg-muted/50 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className="p-3 rounded-2xl bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{p.name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                      {p.start_year} → {p.end_year} •{" "}
                      {new Date(p.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteProjection(p.id)}
                  className="p-2 rounded-full hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={() => setShowSaveModal(false)}
          />
          <div className="relative glass-panel soft-shadow bg-card dark:bg-card/40 p-10 w-full max-w-md z-10 rounded-[3rem] border border-border animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold font-display tracking-tight">
                Salvar Projeção
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-3 rounded-full bg-foreground/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveProjection(saveName);
                setShowSaveModal(false);
                setSaveName("");
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Nome
                </label>
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="glass-input w-full px-6 py-4 rounded-2xl bg-muted/40 border border-border/40 text-foreground text-sm outline-none"
                  placeholder="Ex: Pitch Series A"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                >
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
