import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import { useFinance } from "./useFinance";

export interface UnitEconomicsSnapshot {
  id: string;
  period_date: string;
  total_customers: number;
  new_customers: number;
  churned_customers: number;
  total_revenue: number;
  marketing_spend: number;
  sales_spend: number;
  cac: number;
  ltv: number;
  ltv_cac_ratio: number;
  payback_period_months: number;
  arpu: number;
  monthly_churn_rate: number;
}

export interface UnitEconomicsInput {
  totalCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  marketingSpend: number;
  salesSpend: number;
  ltv: number;
}

/**
 * Hook para cálculo automatizado de Unit Economics.
 * CAC, LTV, LTV/CAC, Payback Period auto-calculados.
 * Receita e despesas extraídas do módulo financeiro existente.
 */
export function useUnitEconomics() {
  const { user } = useAuth();
  const { getMonthSummary, formatCurrency } = useFinance();
  const summary = getMonthSummary();

  const [snapshots, setSnapshots] = useState<UnitEconomicsSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSnapshots = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("unit_economics_snapshots")
        .select("*")
        .order("period_date", { ascending: false })
        .limit(12);
      if (err) throw err;
      setSnapshots(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar snapshots",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /** Calcula métricas a partir de inputs do usuário + dados financeiros */
  const computeMetrics = useCallback(
    (input: UnitEconomicsInput) => {
      const totalRevenue = summary.revenue || 0;
      const cac =
        input.newCustomers > 0
          ? (input.marketingSpend + input.salesSpend) / input.newCustomers
          : 0;
      const arpu =
        input.totalCustomers > 0 ? totalRevenue / input.totalCustomers : 0;
      const monthlyChurnRate =
        input.totalCustomers > 0
          ? input.churnedCustomers / input.totalCustomers
          : 0;
      const ltv =
        input.ltv > 0
          ? input.ltv
          : monthlyChurnRate > 0
            ? arpu / monthlyChurnRate
            : arpu * 24;
      const ltvCacRatio = cac > 0 ? ltv / cac : 0;
      const paybackPeriodMonths = arpu > 0 ? cac / arpu : 0;

      return {
        cac,
        ltv,
        ltvCacRatio,
        paybackPeriodMonths,
        arpu,
        monthlyChurnRate,
        totalRevenue,
      };
    },
    [summary],
  );

  /** Salva snapshot do mês atual */
  const saveSnapshot = useCallback(
    async (input: UnitEconomicsInput) => {
      setLoading(true);
      try {
        const metrics = computeMetrics(input);
        const { data: memberData } = await supabase
          .from("tenant_members")
          .select("tenant_id")
          .eq("user_id", user?.id)
          .single();

        const now = new Date();
        const periodDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

        const { data, error: err } = await supabase
          .from("unit_economics_snapshots")
          .upsert(
            {
              tenant_id: memberData?.tenant_id,
              period_date: periodDate,
              total_customers: input.totalCustomers,
              new_customers: input.newCustomers,
              churned_customers: input.churnedCustomers,
              total_revenue: metrics.totalRevenue,
              marketing_spend: input.marketingSpend,
              sales_spend: input.salesSpend,
              ltv: metrics.ltv,
              ltv_cac_ratio: metrics.ltvCacRatio,
              payback_period_months: metrics.paybackPeriodMonths,
              created_by: user?.id,
            },
            { onConflict: "tenant_id,period_date" },
          )
          .select()
          .single();
        if (err) throw err;
        await loadSnapshots();
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao salvar snapshot",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, computeMetrics, loadSnapshots],
  );

  /** Métricas mais recentes (do último snapshot ou vazio) */
  const latestMetrics = useMemo(() => {
    if (snapshots.length === 0) return null;
    const latest = snapshots[0];
    return {
      cac: latest.cac,
      ltv: latest.ltv,
      ltvCacRatio: latest.ltv_cac_ratio,
      paybackPeriodMonths: latest.payback_period_months,
      arpu: latest.arpu,
      monthlyChurnRate: latest.monthly_churn_rate,
      totalCustomers: latest.total_customers,
      newCustomers: latest.new_customers,
    };
  }, [snapshots]);

  /** Dados de tendência para sparklines */
  const trendData = useMemo(
    () =>
      [...snapshots].reverse().map((s) => ({
        date: s.period_date,
        cac: s.cac,
        ltv: s.ltv,
        ratio: s.ltv_cac_ratio,
        payback: s.payback_period_months,
      })),
    [snapshots],
  );

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  return {
    snapshots,
    latestMetrics,
    trendData,
    loading,
    error,
    computeMetrics,
    saveSnapshot,
    formatCurrency,
  };
}
