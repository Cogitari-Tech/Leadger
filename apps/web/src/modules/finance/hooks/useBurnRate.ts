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
  const {
    getMonthSummary,
    formatCurrency,
    getHistoricalMetrics,
    getAccountBalances,
  } = useFinance();
  const summary = getMonthSummary();

  const [alerts, setAlerts] = useState<BurnRateAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<
    Array<{
      month: string;
      revenue: number;
      expenses: number;
      netIncome: number;
    }>
  >([]);
  const [cashBalance, setCashBalance] = useState(0);

  const loadAlerts = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("burn_rate_alerts")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setAlerts(data || []);
    } catch (err) {
      console.error("Error loading alerts:", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [historyData, balances] = await Promise.all([
        getHistoricalMetrics(),
        getAccountBalances(new Date(1900, 0, 1), new Date()),
      ]);

      setHistory(historyData);

      // Cash remaining = Sum of "Ativo" liquid accounts (simplified as all Ativo analytical accounts for now)
      const totalCash = balances
        .filter((b: any) => b.accountType === "Ativo" && b.isAnalytical)
        .reduce((sum: number, b: any) => sum + b.balance, 0);

      setCashBalance(totalCash);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar dados de burn",
      );
    } finally {
      setLoading(false);
    }
  }, [getHistoricalMetrics, getAccountBalances]);

  useEffect(() => {
    loadData();
    loadAlerts();
  }, [loadData, loadAlerts]);

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
    const cashRemaining = cashBalance;

    // Calculate averages from history
    const last3m = history.slice(-3);
    const last6m = history.slice(-6);

    const avg3m =
      last3m.length > 0
        ? last3m.reduce(
            (sum, h) => sum + Math.max(h.expenses - h.revenue, 0),
            0,
          ) / last3m.length
        : currentBurn;

    const avg6m =
      last6m.length > 0
        ? last6m.reduce(
            (sum, h) => sum + Math.max(h.expenses - h.revenue, 0),
            0,
          ) / last6m.length
        : currentBurn;

    const avg12m =
      history.length > 0
        ? history.reduce(
            (sum, h) => sum + Math.max(h.expenses - h.revenue, 0),
            0,
          ) / history.length
        : currentBurn;

    const runwayMonths = avg3m > 0 ? Math.floor(cashRemaining / avg3m) : 999;

    // Detect trend
    let trend: BurnRateMetrics["trend"] = "stable";
    if (history.length >= 2) {
      const lastMonthBurn = Math.max(
        history[history.length - 1].expenses -
          history[history.length - 1].revenue,
        0,
      );
      const prevMonthBurn = Math.max(
        history[history.length - 2].expenses -
          history[history.length - 2].revenue,
        0,
      );
      if (lastMonthBurn > prevMonthBurn * 1.05) trend = "increasing";
      else if (lastMonthBurn < prevMonthBurn * 0.95) trend = "decreasing";
    }

    return {
      currentMonthlyBurn: currentBurn,
      avgBurn3m: avg3m,
      avgBurn6m: avg6m,
      avgBurn12m: avg12m,
      cashRemaining,
      runwayMonths,
      trend,
      burnHistory: history.map((h) => ({
        month: h.month,
        burn: Math.max(h.expenses - h.revenue, 0),
      })),
    };
  }, [summary, history, cashBalance]);

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
