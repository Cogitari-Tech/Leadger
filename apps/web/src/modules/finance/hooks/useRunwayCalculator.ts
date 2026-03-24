import { useState, useCallback, useEffect } from "react";
import { useFinance } from "./useFinance";
import { apiClient } from "../../../shared/utils/apiClient";

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

export function useRunwayCalculator() {
  const { getMonthSummary, formatCurrency } = useFinance();
  const summary = getMonthSummary();

  const [scenarios, setScenarios] =
    useState<ScenarioParams[]>(DEFAULT_SCENARIOS);
  const [cashBalance, setCashBalance] = useState<number>(
    summary.netIncome > 0 ? summary.netIncome * 6 : 100000,
  );
  const [projectionMonths, setProjectionMonths] = useState(24);
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRunway = async () => {
      setLoading(true);
      try {
        const response = await apiClient<{ results: ScenarioResult[] }>(
          "/api/finance/runway",
          {
            method: "POST",
            body: JSON.stringify({ cashBalance, projectionMonths, scenarios }),
          },
        );
        setResults(response.results);
      } catch (error) {
        console.error("Failed to fetch runway projection:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRunway, 300); // debounce API calls
    return () => clearTimeout(timer);
  }, [cashBalance, projectionMonths, scenarios]);

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
    loading,
    setCashBalance,
    setProjectionMonths,
    updateScenario,
    setScenarios,
    formatCurrency,
  };
}
