// apps/web/src/modules/audit/hooks/useAuditPrograms.ts

import { useState, useCallback } from "react";
import { useAuditStore } from "../../../store/auditStore";
import { supabase } from "../../../config/supabase";
import type { AuditProgram, CreateProgramInput } from "../types/audit.types";

/**
 * Atomic hook: Audit Programs CRUD
 * Follows SRP — only handles program-level operations.
 */
export function useAuditPrograms() {
  const store = useAuditStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTenantId = useCallback(async (): Promise<string> => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data } = await supabase
      .from("tenant_members")
      .select("tenant_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!data?.tenant_id)
      throw new Error("Usuário não associado a nenhuma empresa");
    return data.tenant_id;
  }, []);

  const loadFrameworks = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("audit_frameworks")
      .select("*")
      .order("name");
    if (err) throw err;
    useAuditStore.getState().setFrameworks(data ?? []);
  }, []);

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("audit_programs")
        .select("*, framework:audit_frameworks(id, name)")
        .order("created_at", { ascending: false });
      if (err) throw err;
      useAuditStore.getState().setPrograms(data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar programas",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createProgram = useCallback(
    async (input: CreateProgramInput) => {
      setLoading(true);
      setError(null);
      try {
        const tenantId = await getTenantId();
        const { data, error: err } = await supabase
          .from("audit_programs")
          .insert({ ...input, tenant_id: tenantId })
          .select("*, framework:audit_frameworks(id, name)")
          .single();
        if (err) throw err;
        useAuditStore.getState().addProgram(data as AuditProgram);
        return data;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao criar programa";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getTenantId],
  );

  const updateProgram = useCallback(
    async (id: string, updates: Partial<AuditProgram>) => {
      setLoading(true);
      try {
        const { error: err } = await supabase
          .from("audit_programs")
          .update(updates)
          .eq("id", id);
        if (err) throw err;
        useAuditStore.getState().updateProgram(id, updates);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao atualizar");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteProgram = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error: err } = await supabase
        .from("audit_programs")
        .delete()
        .eq("id", id);
      if (err) throw err;
      useAuditStore.getState().removeProgram(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    programs: store.programs,
    frameworks: store.frameworks,
    loading,
    error,
    loadFrameworks,
    loadPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
  };
}
