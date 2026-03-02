import { useState, useCallback, useMemo } from "react";
import { useFinance } from "./useFinance";

export interface ScenarioParams {
  label: string;
  revenueGrowthRate: number; // monthly growth pct, e.g. 0.05 = +5%
  costReductionRate: number; // monthly cost reduction, e.g. 0.02 = -2%
  color: string;
}

export interface RunwayDataPoint {
  month: number;
  label: string;
  cashBalance: number;
  monthlyBurn: number;
  monthlyRevenue: number;
}

export interface ScenarioResult {
  params: ScenarioParams;
  data: RunwayDataPoint[];
  runwayMonths: number;
  monthlyBurn: number;
  zeroDate: string | null;
}

const DEFAULT_SCENARIOS: ScenarioParams[] = [
  {
    label: "Pessimista",
    revenueGrowthRate: -0.05,
    costReductionRate: 0,
    color: "#ef4444",
  },
  {
    label: "Base",
    revenueGrowthRate: 0.03,
    costReductionRate: 0.01,
    color: "#3b82f6",
  },
  {
    label: "Otimista",
    revenueGrowthRate: 0.1,
    costReductionRate: 0.03,
    color: "#10b981",
  },
];

/**
 * Hook para cálculo de runway com cenários múltiplos.
 * Calcula automaticamente a partir dos dados financeiros existentes.
 */
export function useRunwayCalculator() {
  const { getMonthSummary, formatCurrency } = useFinance();
  const summary = getMonthSummary();

  const [scenarios, setScenarios] =
    useState<ScenarioParams[]>(DEFAULT_SCENARIOS);
  const [cashBalance, setCashBalance] = useState<number>(
    summary.netIncome > 0 ? summary.netIncome * 6 : 100000,
  );
  const [projectionMonths, setProjectionMonths] = useState(24);

  const calculateScenario = useCallback(
    (params: ScenarioParams): ScenarioResult => {
      const currentRevenue = summary.revenue || 0;
      const currentExpenses = summary.expenses || 0;
      const data: RunwayDataPoint[] = [];
      let balance = cashBalance;
      let runwayMonths = projectionMonths;
      let zeroDate: string | null = null;
      let revenue = currentRevenue;
      let expenses = currentExpenses;

      for (let m = 0; m <= projectionMonths; m++) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() + m);
        const label = monthDate.toLocaleDateString("pt-BR", {
          month: "short",
          year: "2-digit",
        });

        const burn = expenses - revenue;

        data.push({
          month: m,
          label,
          cashBalance: Math.max(balance, 0),
          monthlyBurn: burn,
          monthlyRevenue: revenue,
        });

        if (balance <= 0 && !zeroDate) {
          runwayMonths = m;
          zeroDate = monthDate.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          });
        }

        balance -= burn;
        revenue *= 1 + params.revenueGrowthRate;
        expenses *= 1 - params.costReductionRate;
      }

      return {
        params,
        data,
        runwayMonths,
        monthlyBurn: currentExpenses - currentRevenue,
        zeroDate,
      };
    },
    [cashBalance, projectionMonths, summary],
  );

  const results = useMemo(
    () => scenarios.map(calculateScenario),
    [scenarios, calculateScenario],
  );

  const updateScenario = useCallback(
    (index: number, updates: Partial<ScenarioParams>) => {
      setScenarios((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...updates } : s)),
      );
    },
    [],
  );

  return {
    scenarios,
    results,
    cashBalance,
    projectionMonths,
    setCashBalance,
    setProjectionMonths,
    updateScenario,
    setScenarios,
    formatCurrency,
  };
}
