import { useState, useCallback, useEffect, useMemo } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import type { RiskEntry } from "../types/compliance.types";
import type { CreateRiskInput } from "@leadgers/core/repositories/IComplianceRepository";
import { SupabaseComplianceRepository } from "../repositories/SupabaseComplianceRepository";

export function useRisks() {
  const { tenant } = useAuth();
  const [risks, setRisks] = useState<RiskEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const repository = useMemo(
    () => new SupabaseComplianceRepository(supabase),
    [],
  );

  const fetchRisks = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);

    try {
      const data = await repository.listRisks(tenant.id);
      setRisks(data as unknown as RiskEntry[]);
    } catch (error) {
      console.error("Error fetching risks:", error);
    } finally {
      setLoading(false);
    }
  }, [tenant, repository]);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  const addRisk = async (
    item: Omit<RiskEntry, "id" | "createdAt" | "tenant_id">,
  ) => {
    if (!tenant) return;

    try {
      const data = await repository.addRisk(
        tenant.id,
        item as unknown as CreateRiskInput,
      );
      setRisks((prev) => [...prev, data as unknown as RiskEntry]);
    } catch (error) {
      console.error("Error adding risk:", error);
    }
  };

  const removeRisk = async (id: string) => {
    try {
      await repository.removeRisk(id);
      setRisks((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      console.error("Error removing risk:", error);
    }
  };

  return { risks, loading, addRisk, removeRisk, fetchRisks };
}
