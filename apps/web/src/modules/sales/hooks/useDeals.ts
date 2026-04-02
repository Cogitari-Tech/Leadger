import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../../../shared/utils/apiClient";

export interface Deal {
  id: string;
  tenant_id: string;
  title: string;
  client_name: string;
  value: number;
  mrr_amount: number | null;
  stage: string;
  expected_close_date: string | null;
  probability: number;
  type: string;
  recurrence: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const PIPELINE_STAGES = [
  { key: "lead", label: "Lead", color: "bg-slate-500" },
  { key: "qualified", label: "Qualificado", color: "bg-blue-500" },
  { key: "proposal", label: "Proposta", color: "bg-amber-500" },
  { key: "negotiation", label: "Negociação", color: "bg-orange-500" },
  { key: "won", label: "Fechado ✓", color: "bg-emerald-500" },
  { key: "lost", label: "Perdido", color: "bg-red-500" },
];

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<Deal[]>("/sales/deals");
      setDeals(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch deals");
    } finally {
      setLoading(false);
    }
  }, []);

  const createDeal = async (deal: Partial<Deal>) => {
    const created = await apiClient.post<Deal>("/sales/deals", deal);
    setDeals((prev) => [created, ...prev]);
    return created;
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    const updated = await apiClient.patch<Deal>(`/sales/deals/${id}`, updates);
    setDeals((prev) => prev.map((d) => (d.id === id ? updated : d)));
    return updated;
  };

  const deleteDeal = async (id: string) => {
    await apiClient.delete(`/sales/deals/${id}`);
    setDeals((prev) => prev.filter((d) => d.id !== id));
  };

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    loading,
    error,
    fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal,
  };
}
