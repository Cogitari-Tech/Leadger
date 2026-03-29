import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

export interface TechDebtItem {
  id: string;
  repo: string;
  type: "vulnerability" | "stale_issue" | "unreviewed_pr";
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  age_days: number;
  metadata?: Record<string, any>;
}

export interface TechDebtData {
  healthScore: number;
  totals: {
    securityAlerts: number;
    staleIssues: number;
    unreviewedPrs: number;
  };
  items: TechDebtItem[];
}

export function useTechDebt() {
  const [data, setData] = useState<TechDebtData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTechDebt = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<TechDebtData>(
        "/api/product/tech-debt",
      );
      setData(result);
    } catch (err) {
      console.error("Failed to load tech debt:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTechDebt();
  }, [fetchTechDebt]);

  return {
    data,
    loading,
    error,
    refresh: fetchTechDebt,
  };
}
