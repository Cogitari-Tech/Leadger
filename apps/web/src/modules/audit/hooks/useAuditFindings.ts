// apps/web/src/modules/audit/hooks/useAuditFindings.ts

import { useState, useCallback } from "react";
import { useAuditStore } from "../../../store/auditStore";
import { supabase } from "../../../config/supabase";
import type { AuditFinding, CreateFindingInput } from "../types/audit.types";

/**
 * Atomic hook: Audit Findings CRUD
 * Follows SRP — only handles finding-level operations.
 */
export function useAuditFindings() {
  const store = useAuditStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFindings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("audit_findings")
        .select("*, program:audit_programs(id, name)")
        .order("created_at", { ascending: false });
      if (err) throw err;
      useAuditStore.getState().setFindings(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar achados");
    } finally {
      setLoading(false);
    }
  }, []);

  const createFinding = useCallback(async (input: CreateFindingInput) => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("audit_findings")
        .insert(input)
        .select("*, program:audit_programs(id, name)")
        .single();
      if (err) throw err;
      useAuditStore.getState().addFinding(data as AuditFinding);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar achado");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFinding = useCallback(
    async (id: string, updates: Partial<AuditFinding>) => {
      const { error: err } = await supabase
        .from("audit_findings")
        .update(updates)
        .eq("id", id);
      if (err) throw err;
      useAuditStore.getState().updateFinding(id, updates);
    },
    [],
  );

  return {
    findings: store.findings,
    loading,
    error,
    loadFindings,
    createFinding,
    updateFinding,
  };
}
