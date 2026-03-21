import { useState, useCallback, useEffect } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

export interface KeyResult {
  id: string;
  title: string;
  current_val: number;
  target_val: number;
  unit: string;
  weight: number;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "at_risk";
  progress: number;
  target_date: string;
  key_results: KeyResult[];
}

export function useOkrs() {
  const [data, setData] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOkrs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient<Objective[]>("/strategic/okrs");
      setData(res || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOkr = async (payload: Partial<Objective>) => {
    await apiClient("/strategic/okrs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await fetchOkrs();
  };

  const updateKrProgress = async (
    objectiveId: string,
    krId: string,
    currentVal: number,
  ) => {
    await apiClient(`/strategic/okrs/${objectiveId}/kr/${krId}`, {
      method: "PUT",
      body: JSON.stringify({ current_val: currentVal }),
    });
    await fetchOkrs();
  };

  useEffect(() => {
    fetchOkrs();
  }, [fetchOkrs]);

  return { data, loading, fetchOkrs, createOkr, updateKrProgress };
}
