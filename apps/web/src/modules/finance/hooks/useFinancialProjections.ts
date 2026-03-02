import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import { useFinance } from "./useFinance";

export interface ProjectionScenario {
  growthRate: number;
  data: Array<{
    year: number;
    revenue: number;
    expense: number;
    profit: number;
  }>;
}

export interface FinancialProjection {
  id: string;
  tenant_id: string;
  name: string;
  projection_type: "revenue" | "expense" | "combined";
  start_year: number;
  end_year: number;
  scenarios: {
    pessimistic: ProjectionScenario;
    base: ProjectionScenario;
    optimistic: ProjectionScenario;
  };
  assumptions: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface ProjectionAssumptions {
  revenueGrowthBase: number;
  expenseGrowthBase: number;
  marginImprovement: number;
  headcountGrowth: number;
  avgSalary: number;
}

const DEFAULT_ASSUMPTIONS: ProjectionAssumptions = {
  revenueGrowthBase: 0.3,
  expenseGrowthBase: 0.15,
  marginImprovement: 0.02,
  headcountGrowth: 0.2,
  avgSalary: 8000,
};

/**
 * Hook para projeções financeiras de pitch (3-5 anos).
 * Gera 3 cenários automaticamente a partir dos dados existentes + assumptions.
 */
export function useFinancialProjections() {
  const { user } = useAuth();
  const { getMonthSummary, formatCurrency } = useFinance();
  const summary = getMonthSummary();

  const [projections, setProjections] = useState<FinancialProjection[]>([]);
  const [assumptions, setAssumptions] =
    useState<ProjectionAssumptions>(DEFAULT_ASSUMPTIONS);
  const [yearsAhead, setYearsAhead] = useState(5);
  const [activeScenario, setActiveScenario] = useState<
    "pessimistic" | "base" | "optimistic" | "all"
  >("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjections = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("financial_projections")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setProjections(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar projeções",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /** Gera cenários a partir dos dados atuais + assumptions */
  const generateScenarios = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const annualRevenue = (summary.revenue || 0) * 12;
    const annualExpense = (summary.expenses || 0) * 12;

    const buildScenario = (modifier: number): ProjectionScenario => {
      const growthRate = assumptions.revenueGrowthBase * (1 + modifier);
      const expGrowth = assumptions.expenseGrowthBase * (1 + modifier * 0.5);
      const data = [];
      let rev = annualRevenue;
      let exp = annualExpense;

      for (let y = 0; y < yearsAhead; y++) {
        rev *= 1 + growthRate;
        exp *= 1 + expGrowth;
        exp *= 1 - assumptions.marginImprovement;
        data.push({
          year: currentYear + y + 1,
          revenue: Math.round(rev),
          expense: Math.round(exp),
          profit: Math.round(rev - exp),
        });
      }

      return { growthRate, data };
    };

    return {
      pessimistic: buildScenario(-0.4),
      base: buildScenario(0),
      optimistic: buildScenario(0.5),
    };
  }, [summary, assumptions, yearsAhead]);

  /** Salva projeção nomeada no banco */
  const saveProjection = useCallback(
    async (name: string) => {
      setLoading(true);
      try {
        const { data: memberData } = await supabase
          .from("tenant_members")
          .select("tenant_id")
          .eq("user_id", user?.id)
          .single();

        const currentYear = new Date().getFullYear();
        const { data, error: err } = await supabase
          .from("financial_projections")
          .insert({
            tenant_id: memberData?.tenant_id,
            name,
            projection_type: "combined",
            start_year: currentYear,
            end_year: currentYear + yearsAhead,
            scenarios: generateScenarios,
            assumptions: assumptions as unknown as Record<string, number>,
            created_by: user?.id,
          })
          .select()
          .single();
        if (err) throw err;
        setProjections((prev) => [data, ...prev]);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao salvar projeção",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, yearsAhead, generateScenarios, assumptions],
  );

  const deleteProjection = useCallback(async (id: string) => {
    const { error: err } = await supabase
      .from("financial_projections")
      .delete()
      .eq("id", id);
    if (err) throw err;
    setProjections((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /** Chart data para Recharts */
  const chartData = useMemo(() => {
    const years = generateScenarios.base.data.map((d) => d.year);
    return years.map((year, i) => ({
      year: year.toString(),
      pessimisticRevenue: generateScenarios.pessimistic.data[i]?.revenue || 0,
      pessimisticProfit: generateScenarios.pessimistic.data[i]?.profit || 0,
      baseRevenue: generateScenarios.base.data[i]?.revenue || 0,
      baseProfit: generateScenarios.base.data[i]?.profit || 0,
      optimisticRevenue: generateScenarios.optimistic.data[i]?.revenue || 0,
      optimisticProfit: generateScenarios.optimistic.data[i]?.profit || 0,
    }));
  }, [generateScenarios]);

  useEffect(() => {
    loadProjections();
  }, [loadProjections]);

  return {
    projections,
    assumptions,
    yearsAhead,
    activeScenario,
    generateScenarios,
    chartData,
    loading,
    error,
    setAssumptions,
    setYearsAhead,
    setActiveScenario,
    saveProjection,
    deleteProjection,
    formatCurrency,
  };
}
