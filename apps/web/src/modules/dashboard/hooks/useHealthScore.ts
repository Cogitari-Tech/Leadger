import { useState, useCallback, useEffect } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

export interface HealthScoreAlert {
  type: "red" | "yellow" | "green";
  message: string;
  component: string;
}

export interface HealthScoreData {
  id: string;
  tenant_id: string;
  date: string;
  total_score: number;
  financial: number;
  product: number;
  compliance: number;
  team: number;
  commercial: number;
  alerts: HealthScoreAlert[];
  created_at: string;
}

export function useHealthScore() {
  const [data, setData] = useState<HealthScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchScore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient<HealthScoreData>("/strategic/health-score");
      setData(res || null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return { data, loading, error, refetch: fetchScore };
}
