import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

export interface HeadcountPlan {
  id: string;
  role_title: string;
  department: string;
  monthly_salary: number;
  expected_start_date: string;
  status: "planned" | "hired" | "cancelled";
  notes?: string;
}

export function useHeadcount() {
  const [plans, setPlans] = useState<HeadcountPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.get<{ plans: HeadcountPlan[] }>(
        "/people/headcount",
      );
      setPlans(result.plans);
    } catch (err) {
      console.error("Failed to load headcount plans:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = async (data: Omit<HeadcountPlan, "id">) => {
    try {
      await apiClient.post("/people/headcount", data);
      await fetchPlans();
    } catch (err) {
      throw err;
    }
  };

  const updatePlan = async (id: string, data: Partial<HeadcountPlan>) => {
    try {
      await apiClient.patch(`/people/headcount/${id}`, data);
      await fetchPlans();
    } catch (err) {
      throw err;
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await apiClient.delete(`/people/headcount/${id}`);
      await fetchPlans();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refresh: fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
  };
}
