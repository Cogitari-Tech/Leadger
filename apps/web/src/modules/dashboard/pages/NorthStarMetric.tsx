import { useState } from "react";
import { useNorthStar } from "../hooks/useNorthStar";
import { Target, Sparkles } from "lucide-react";

export default function NorthStarMetric() {
  const { data, loading, saveMetric } = useNorthStar();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    target: "",
    current: "",
    unit: "",
  });

  const handleEdit = () => {
    if (data) {
      setForm({
        name: data.name,
        target: data.target_value.toString(),
        current: data.current_value.toString(),
        unit: data.unit,
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    await saveMetric({
      name: form.name,
      target_value: parseFloat(form.target),
      current_value: parseFloat(form.current),
      unit: form.unit,
    });
    setIsEditing(false);
  };

  if (loading)
    return (
      <div className="p-12 text-center text-muted-foreground animate-pulse">
        Carregando North Star...
      </div>
    );

  const hasData = !!data && data.name;
  const progress = hasData
    ? Math.min((data!.current_value / data!.target_value) * 100, 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            North Star Metric
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            A métrica principal de tração e impacto da empresa.
          </p>
        </div>
      </div>

      {!hasData || isEditing ? (
        <div className="glass-card soft-shadow p-8 rounded-3xl space-y-6">
          <h2 className="text-xl font-bold">
            {isEditing ? "Atualizar Métrica" : "Defina sua North Star"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-foreground">Nome da Métrica</label>
              <input
                type="text"
                className="w-full btn-ghost p-3 rounded-xl border border-border"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Usuários Diários, MRR"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground">Unidade</label>
              <input
                type="text"
                className="w-full btn-ghost p-3 rounded-xl border border-border"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="Ex: R$, usuários"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground">Valor Atual</label>
              <input
                type="number"
                className="w-full btn-ghost p-3 rounded-xl border border-border"
                value={form.current}
                onChange={(e) => setForm({ ...form, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground">
                Meta Alvo (Target)
              </label>
              <input
                type="number"
                className="w-full btn-ghost p-3 rounded-xl border border-border"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-opacity"
          >
            Salvar Métrica
          </button>
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 ml-2 hover:bg-muted text-muted-foreground rounded-2xl font-bold transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card soft-shadow p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

          <button
            onClick={handleEdit}
            className="absolute top-6 right-6 px-4 py-2 hover:bg-muted rounded-xl text-xs font-semibold"
          >
            Atualizar
          </button>

          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {data!.name}
          </h2>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-6xl font-bold text-foreground">
              {data!.current_value.toLocaleString()} {data!.unit}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            Meta atual: {data!.target_value.toLocaleString()} {data!.unit}
          </p>

          <div className="mt-8 border-t border-border/20 pt-8">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Progresso até o alvo
              </h4>
              <span className="text-xs font-bold text-primary">
                {progress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
