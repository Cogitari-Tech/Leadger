// apps/web/src/modules/audit/hooks/useAuditActionPlans.ts

import { useState, useCallback } from "react";
import { useAuditStore } from "../../../store/auditStore";
import { supabase } from "../../../config/supabase";
import type {
  AuditActionPlan,
  CreateActionPlanInput,
} from "../types/audit.types";

/**
 * Atomic hook: Audit Action Plans CRUD
 * Follows SRP — only handles action plan operations.
 */
export function useAuditActionPlans() {
  const store = useAuditStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActionPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("audit_action_plans")
        .select(
          "*, finding:audit_findings(id, title, source_type, source_ref, program:audit_programs(id, name))",
        )
        .order("created_at", { ascending: false });
      if (err) throw err;
      useAuditStore.getState().setActionPlans(data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar planos de ação",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createActionPlan = useCallback(async (input: CreateActionPlanInput) => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("audit_action_plans")
        .insert(input)
        .select("*, finding:audit_findings(id, title)")
        .single();
      if (err) throw err;
      useAuditStore.getState().addActionPlan(data as AuditActionPlan);
      return data;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar plano de ação",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateActionPlan = useCallback(
    async (id: string, updates: Partial<AuditActionPlan>) => {
      const { error: err } = await supabase
        .from("audit_action_plans")
        .update(updates)
        .eq("id", id);
      if (err) throw err;
      useAuditStore.getState().updateActionPlan(id, updates);
    },
    [],
  );

  return {
    actionPlans: store.actionPlans,
    loading,
    error,
    loadActionPlans,
    createActionPlan,
    updateActionPlan,
  };
}
