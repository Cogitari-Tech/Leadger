import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import type { RiskEntry } from "../types/compliance.types";

export function useRisks() {
  const { tenant } = useAuth();
  const [risks, setRisks] = useState<RiskEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRisks = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("risks")
      .select("*")
      .order("score", { ascending: false });

    if (!error && data) {
      setRisks(
        data.map((item: any) => ({
          ...item,
          createdAt: item.created_at,
        })) as RiskEntry[],
      );
    }
    setLoading(false);
  }, [tenant]);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  const addRisk = async (
    item: Omit<RiskEntry, "id" | "createdAt" | "tenant_id">,
  ) => {
    if (!tenant) return;
    const { data, error } = await supabase
      .from("risks")
      .insert({
        tenant_id: tenant.id,
        title: item.title,
        description: item.description,
        category: item.category,
        likelihood: item.likelihood,
        impact: item.impact,
        score: item.score,
        status: item.status,
        owner: item.owner,
      })
      .select()
      .single();

    if (!error && data) {
      setRisks((prev) => [
        ...prev,
        { ...data, createdAt: data.created_at } as unknown as RiskEntry,
      ]);
    }
  };

  const removeRisk = async (id: string) => {
    const { error } = await supabase.from("risks").delete().eq("id", id);
    if (!error) {
      setRisks((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return { risks, loading, addRisk, removeRisk, fetchRisks };
}
