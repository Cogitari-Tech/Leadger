import { useState, useCallback, useEffect } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

export interface NorthStarMetric {
  id: string;
  name: string;
  target_value: number;
  current_value: number;
  unit: string;
}

export function useNorthStar() {
  const [data, setData] = useState<NorthStarMetric | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetric = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient<NorthStarMetric>("/strategic/north-star");
      setData(res);
    } catch (err: any) {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveMetric = async (payload: Partial<NorthStarMetric>) => {
    const res = await apiClient<NorthStarMetric>("/strategic/north-star", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setData(res);
  };

  useEffect(() => {
    fetchMetric();
  }, [fetchMetric]);

  return { data, loading, fetchMetric, saveMetric };
}
