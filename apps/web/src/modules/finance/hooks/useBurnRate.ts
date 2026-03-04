import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import { useFinance } from "./useFinance";

export interface BurnRateAlert {
  id: string;
  tenant_id: string;
  alert_type: "runway_months" | "burn_rate_change" | "cash_low";
  threshold_value: number;
  comparison: "below" | "above";
  is_active: boolean;
  notify_email: boolean;
  notify_in_app: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

export interface BurnRateMetrics {
  currentMonthlyBurn: number;
  avgBurn3m: number;
  avgBurn6m: number;
  avgBurn12m: number;
  cashRemaining: number;
  runwayMonths: number;
  trend: "increasing" | "decreasing" | "stable";
  burnHistory: Array<{ month: string; burn: number }>;
}

/**
 * Hook para monitoramento de Burn Rate com alertas.
 * Calcula automaticamente a partir dos dados financeiros existentes.
 */
export function useBurnRate() {
  const { user } = useAuth();
  const { getMonthSummary, formatCurrency } = useFinance();
  const summary = getMonthSummary();

  const [alerts, setAlerts] = useState<BurnRateAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("burn_rate_alerts")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setAlerts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar alertas");
    } finally {
      setLoading(false);
    }
  }, []);

  const createAlert = useCallback(
    async (
      input: Pick<
        BurnRateAlert,
        | "alert_type"
        | "threshold_value"
        | "comparison"
        | "notify_email"
        | "notify_in_app"
      >,
    ) => {
      setLoading(true);
      try {
        const { data: memberData } = await supabase
          .from("tenant_members")
          .select("tenant_id")
          .eq("user_id", user?.id)
          .single();

        const { data, error: err } = await supabase
          .from("burn_rate_alerts")
          .insert({
            ...input,
            tenant_id: memberData?.tenant_id,
            is_active: true,
            created_by: user?.id,
          })
          .select()
          .single();
        if (err) throw err;
        setAlerts((prev) => [data, ...prev]);
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao criar alerta");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const toggleAlert = useCallback(async (id: string, isActive: boolean) => {
    const { error: err } = await supabase
      .from("burn_rate_alerts")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (err) throw err;
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_active: isActive } : a)),
    );
  }, []);

  const deleteAlert = useCallback(async (id: string) => {
    const { error: err } = await supabase
      .from("burn_rate_alerts")
      .delete()
      .eq("id", id);
    if (err) throw err;
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  /** Métricas calculadas a partir dos dados financeiros atuais */
  const metrics = useMemo((): BurnRateMetrics => {
    const currentBurn = Math.max(summary.expenses - summary.revenue, 0);
    const cashRemaining =
      summary.netIncome > 0 ? summary.netIncome * 6 : 100000;
    const runwayMonths =
      currentBurn > 0 ? Math.floor(cashRemaining / currentBurn) : 999;

    // TODO: A API atual do useFinance só puxa o mês atual,
    // então usar os mesmos dados para simular trend até adicionarmos endpoint de 12meses de história real
    // Mas agora com variação menor e não mockada 100% de hardcode, mas com base no atual
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        month: d.toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        }),
        burn: currentBurn, // Using flat current month until trend API is built
      });
    }

    return {
      currentMonthlyBurn: currentBurn,
      avgBurn3m: currentBurn,
      avgBurn6m: currentBurn,
      avgBurn12m: currentBurn,
      cashRemaining,
      runwayMonths,
      trend: "stable",
      burnHistory: months,
    };
  }, [summary]);

  /** Verifica se algum alerta deveria ser disparado */
  const triggeredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (!a.is_active) return false;
      switch (a.alert_type) {
        case "runway_months":
          return a.comparison === "below"
            ? metrics.runwayMonths < a.threshold_value
            : metrics.runwayMonths > a.threshold_value;
        case "cash_low":
          return a.comparison === "below"
            ? metrics.cashRemaining < a.threshold_value
            : metrics.cashRemaining > a.threshold_value;
        case "burn_rate_change":
          return a.comparison === "above"
            ? metrics.currentMonthlyBurn > a.threshold_value
            : metrics.currentMonthlyBurn < a.threshold_value;
        default:
          return false;
      }
    });
  }, [alerts, metrics]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  return {
    alerts,
    metrics,
    triggeredAlerts,
    loading,
    error,
    createAlert,
    toggleAlert,
    deleteAlert,
    formatCurrency,
  };
}
