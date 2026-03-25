import { useState } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

interface WeeklyDigestResponse {
  digest: string;
  metrics: {
    period: string;
    transactionsCount: number;
    revenue: number;
    expenses: number;
    netIncome: number;
  };
}

export function useWeeklyDigest() {
  const [data, setData] = useState<WeeklyDigestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDigest = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient<WeeklyDigestResponse>(
        "/api/ai/weekly-digest",
        {
          method: "POST",
        },
      );
      setData(res);
    } catch (err: any) {
      setError(
        err instanceof Error
          ? err
          : new Error(err?.message || "Erro ao gerar análise"),
      );
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchDigest };
}
