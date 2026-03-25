import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../shared/utils/apiClient";
import { useAuth } from "../../auth/context/AuthContext";

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  completed_at?: string;
  status: "planned" | "in_progress" | "completed" | "delayed";
  category: "product" | "financial" | "team" | "fundraising" | "legal";
  linked_okr_id?: string;
}

export function useMilestones() {
  const { tenant } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMilestones = useCallback(async () => {
    if (!tenant) return;
    try {
      setLoading(true);
      const data = await apiClient.get<Milestone[]>("/strategic/milestones");
      setMilestones(data);
      setError(null);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching milestones:", err);
    } finally {
      setLoading(false);
    }
  }, [tenant]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const addMilestone = async (data: Partial<Milestone>) => {
    try {
      const newMilestone = await apiClient.post<Milestone>(
        "/strategic/milestones",
        data,
      );
      setMilestones((prev) => [...prev, newMilestone]);
      return newMilestone;
    } catch (err: any) {
      console.error("Error adding milestone:", err);
      throw err;
    }
  };

  const updateMilestone = async (id: string, data: Partial<Milestone>) => {
    try {
      const updated = await apiClient.patch<Milestone>(
        `/strategic/milestones/${id}`,
        data,
      );
      setMilestones((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    } catch (err: any) {
      console.error("Error updating milestone:", err);
      throw err;
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      await apiClient.delete(`/strategic/milestones/${id}`);
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      console.error("Error deleting milestone:", err);
      throw err;
    }
  };

  return {
    milestones,
    loading,
    error,
    refresh: fetchMilestones,
    addMilestone,
    updateMilestone,
    deleteMilestone,
  };
}
