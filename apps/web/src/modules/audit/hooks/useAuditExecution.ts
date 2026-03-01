// apps/web/src/modules/audit/hooks/useAuditExecution.ts

import { useState, useCallback } from "react";
import { supabase } from "../../../config/supabase";
import type {
  AuditProgramChecklist,
  AuditItemResponse,
  AuditItemEvidence,
  AuditResponseStatus,
} from "../types/audit.types";

/**
 * Atomic hook: Audit Execution
 * Handles checklist management, item responses, and evidence operations.
 * Follows SRP — only handles execution-phase operations.
 */
export function useAuditExecution() {
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

  // ─── Checklists ────────────────────────────────────────

  const getChecklists = useCallback(async (programId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("audit_program_checklists")
        .select("*, control:audit_framework_controls(id, code, title)")
        .eq("program_id", programId)
        .order("sort_order");
      if (err) throw err;
      return (data ?? []) as AuditProgramChecklist[];
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar checklist",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateChecklistItem = useCallback(
    async (id: string, updates: Partial<AuditProgramChecklist>) => {
      setError(null);
      try {
        const { error: err } = await supabase
          .from("audit_program_checklists")
          .update(updates)
          .eq("id", id);
        if (err) throw err;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao atualizar item");
        throw err;
      }
    },
    [],
  );

  const populateChecklistFromFramework = useCallback(
    async (programId: string, frameworkId: string) => {
      setLoading(true);
      setError(null);
      try {
        const { data: controls } = await supabase
          .from("audit_framework_controls")
          .select("id, code, title, description, sort_order")
          .eq("framework_id", frameworkId)
          .order("sort_order");

        if (!controls?.length) return;

        const items = controls.map((c) => ({
          program_id: programId,
          control_id: c.id,
          title: `${c.code} — ${c.title}`,
          description: c.description,
          sort_order: c.sort_order,
        }));

        const { error: err } = await supabase
          .from("audit_program_checklists")
          .insert(items);
        if (err) throw err;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao popular checklist",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ─── Item Responses ────────────────────────────────────

  const loadItemResponses = useCallback(async (auditId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("audit_item_responses")
        .select("*")
        .eq("audit_id", auditId);
      if (err) throw err;
      return (data ?? []) as AuditItemResponse[];
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar respostas",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveItemResponse = useCallback(
    async (
      auditId: string,
      checklistItemId: string,
      status: AuditResponseStatus,
      justification: string | null = null,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const tenantId = await getTenantId();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error: err } = await supabase
          .from("audit_item_responses")
          .upsert(
            {
              audit_id: auditId,
              checklist_item_id: checklistItemId,
              status,
              justification,
              responded_by: user.id,
              tenant_id: tenantId,
            },
            { onConflict: "audit_id, checklist_item_id" },
          )
          .select("*")
          .single();
        if (err) throw err;
        return data as AuditItemResponse;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao salvar resposta",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getTenantId],
  );

  // ─── Evidence ──────────────────────────────────────────

  const loadItemEvidences = useCallback(async (auditId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("audit_item_evidences")
        .select(`*, response:audit_item_responses!inner(audit_id)`)
        .eq("audit_item_responses.audit_id", auditId);
      if (err) throw err;
      return (data ?? []) as AuditItemEvidence[];
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar evidências",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadEvidence = useCallback(
    async (responseId: string, file: File) => {
      setLoading(true);
      setError(null);
      try {
        const tenantId = await getTenantId();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Autenticação necessária");

        const ext = file.name.split(".").pop();
        const filePath = `${tenantId}/${responseId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("audit-evidences")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data, error: insertError } = await supabase
          .from("audit_item_evidences")
          .insert({
            audit_item_response_id: responseId,
            file_path: filePath,
            file_name: file.name,
            uploaded_by: user.id,
            tenant_id: tenantId,
          })
          .select("*")
          .single();
        if (insertError) throw insertError;
        return data as AuditItemEvidence;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao enviar arquivo");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getTenantId],
  );

  const deleteEvidence = useCallback(
    async (evidenceId: string, filePath: string) => {
      setLoading(true);
      setError(null);
      try {
        await supabase.storage.from("audit-evidences").remove([filePath]);
        const { error: err } = await supabase
          .from("audit_item_evidences")
          .delete()
          .eq("id", evidenceId);
        if (err) throw err;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao excluir arquivo",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    getChecklists,
    updateChecklistItem,
    populateChecklistFromFramework,
    loadItemResponses,
    saveItemResponse,
    loadItemEvidences,
    uploadEvidence,
    deleteEvidence,
  };
}
