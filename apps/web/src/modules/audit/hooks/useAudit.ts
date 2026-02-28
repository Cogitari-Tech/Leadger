import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuditStore } from "../../../store/auditStore";
import { supabase } from "../../../config/supabase";
import type {
  AuditProgram,
  AuditFinding,
  AuditActionPlan,
  AuditDashboardStats,
  CreateProgramInput,
  CreateFindingInput,
  CreateActionPlanInput,
  AuditProgramChecklist,
  AuditItemResponse,
  AuditItemEvidence,
  AuditResponseStatus,
} from "../types/audit.types";

/**
 * Facade hook for the Audit module.
 * Encapsulates all Supabase queries and state updates.
 */
export function useAudit() {
  const store = useAuditStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Tenant helper ─────────────────────────────────────
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

  // ─── Frameworks ────────────────────────────────────────
  const loadFrameworks = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("audit_frameworks")
      .select("*")
      .order("name");

    if (err) throw err;
    useAuditStore.getState().setFrameworks(data ?? []);
  }, []);

  // ─── Programs ──────────────────────────────────────────
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
    [store, getTenantId],
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
    [store],
  );

  const deleteProgram = useCallback(
    async (id: string) => {
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
    },
    [store],
  );

  // ─── Checklists ────────────────────────────────────────
  const getChecklists = useCallback(async (programId: string) => {
    const { data, error: err } = await supabase
      .from("audit_program_checklists")
      .select("*, control:audit_framework_controls(id, code, title)")
      .eq("program_id", programId)
      .order("sort_order");

    if (err) throw err;
    return (data ?? []) as AuditProgramChecklist[];
  }, []);

  const updateChecklistItem = useCallback(
    async (id: string, updates: Partial<AuditProgramChecklist>) => {
      const { error: err } = await supabase
        .from("audit_program_checklists")
        .update(updates)
        .eq("id", id);

      if (err) throw err;
    },
    [],
  );

  const populateChecklistFromFramework = useCallback(
    async (programId: string, frameworkId: string) => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ─── Checklist Execution (Phase 5) ─────────────────────
  const loadItemResponses = useCallback(async (auditId: string) => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("audit_item_responses")
        .select("*")
        .eq("audit_id", auditId);

      if (err) throw err;
      return (data ?? []) as AuditItemResponse[];
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
      try {
        const tenantId = await getTenantId();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Upsert based on unique constraint (audit_id, checklist_item_id)
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
      } finally {
        setLoading(false);
      }
    },
    [getTenantId],
  );

  const loadItemEvidences = useCallback(async (auditId: string) => {
    // Load all evidences for an audit via joining responses
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("audit_item_evidences")
        .select(`*, response:audit_item_responses!inner(audit_id)`)
        .eq("audit_item_responses.audit_id", auditId);

      if (err) throw err;
      return (data ?? []) as AuditItemEvidence[];
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadEvidence = useCallback(
    async (responseId: string, file: File) => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    },
    [getTenantId],
  );

  const deleteEvidence = useCallback(
    async (evidenceId: string, filePath: string) => {
      setLoading(true);
      try {
        await supabase.storage.from("audit-evidences").remove([filePath]);
        const { error: err } = await supabase
          .from("audit_item_evidences")
          .delete()
          .eq("id", evidenceId);
        if (err) throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ─── Findings ──────────────────────────────────────────
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

  const createFinding = useCallback(
    async (input: CreateFindingInput) => {
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
    },
    [store],
  );

  const updateFinding = useCallback(
    async (id: string, updates: Partial<AuditFinding>) => {
      const { error: err } = await supabase
        .from("audit_findings")
        .update(updates)
        .eq("id", id);

      if (err) throw err;
      useAuditStore.getState().updateFinding(id, updates);
    },
    [store],
  );

  // ─── Action Plans ──────────────────────────────────────
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

  const createActionPlan = useCallback(
    async (input: CreateActionPlanInput) => {
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
    },
    [store],
  );

  const updateActionPlan = useCallback(
    async (id: string, updates: Partial<AuditActionPlan>) => {
      const { error: err } = await supabase
        .from("audit_action_plans")
        .update(updates)
        .eq("id", id);

      if (err) throw err;
      useAuditStore.getState().updateActionPlan(id, updates);
    },
    [store],
  );

  // ─── Dashboard stats ──────────────────────────────────
  const getDashboardStats = useMemo((): AuditDashboardStats => {
    const activePrograms = store.programs.filter(
      (p) => p.status === "in_progress" || p.status === "draft",
    ).length;

    const highRiskFindings = store.findings.filter(
      (f) =>
        (f.risk_level === "critical" || f.risk_level === "high") &&
        f.status !== "resolved",
    ).length;

    const totalFindings = store.findings.length;
    const resolvedFindings = store.findings.filter(
      (f) => f.status === "resolved" || f.status === "accepted",
    ).length;
    const complianceRate =
      totalFindings > 0
        ? Math.round((resolvedFindings / totalFindings) * 100)
        : 100;

    const pendingActionPlans = store.actionPlans.filter(
      (ap) => ap.status === "pending" || ap.status === "in_progress",
    ).length;

    return {
      activePrograms,
      highRiskFindings,
      complianceRate,
      pendingActionPlans,
    };
  }, [store.programs, store.findings, store.actionPlans]);

  // ─── Approval Workflow (Phase 5) ───────────────────────
  const submitAuditForReview = useCallback(
    async (auditId: string) => {
      setLoading(true);
      try {
        // Find if there are incomplete findings (draft or missing 5W2H)
        const { data: findings, error: fErr } = await supabase
          .from("audit_findings")
          .select("id, status, description")
          .eq("program_id", auditId);

        if (fErr) throw fErr;

        if (findings) {
          const incomplete = findings.find(
            (f) =>
              f.status === "draft" ||
              !f.description ||
              f.description.trim() === "",
          );
          if (incomplete) {
            throw new Error(
              "Existem achados pendentes ou incompletos. Finalize a consolidação dos achados antes de enviar para revisão.",
            );
          }
        }

        // Use RPC to submit and log activity
        const { error: pErr } = await supabase.rpc("submit_audit_for_review", {
          p_audit_id: auditId,
        });

        if (pErr) throw pErr;

        useAuditStore
          .getState()
          .updateProgram(auditId, { status: "under_review" });
      } finally {
        setLoading(false);
      }
    },
    [store],
  );

  const approveAudit = useCallback(
    async (auditId: string, docHash: string, pdfBlob?: Blob) => {
      setLoading(true);
      try {
        const tenantId = await getTenantId();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Determine next version number
        const { data: versions } = await supabase
          .from("audit_versions")
          .select("version_number")
          .eq("audit_id", auditId)
          .order("version_number", { ascending: false })
          .limit(1);

        const nextVersion =
          versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

        let pdfPath = null;
        if (pdfBlob) {
          const filePath = `${tenantId}/${auditId}/audit_v${nextVersion}.pdf`;
          const { error: uploadErr } = await supabase.storage
            .from("audit-reports")
            .upload(filePath, pdfBlob, {
              contentType: "application/pdf",
              upsert: true,
            });

          if (!uploadErr) {
            pdfPath = filePath;
          } else {
            console.error("Failed to upload PDF report", uploadErr);
          }
        }

        // Insert version
        const { error: vErr } = await supabase.from("audit_versions").insert({
          audit_id: auditId,
          version_number: nextVersion,
          doc_hash: docHash,
          pdf_path: pdfPath,
          approved_by: user.id,
          tenant_id: tenantId,
        });

        if (vErr) throw vErr;

        // Change status to approved using RPC
        const { error: pErr } = await supabase.rpc("approve_audit", {
          p_audit_id: auditId,
        });

        if (pErr) throw pErr;

        useAuditStore.getState().updateProgram(auditId, { status: "approved" });
      } finally {
        setLoading(false);
      }
    },
    [getTenantId, store],
  );

  const rejectAudit = useCallback(async (auditId: string, feedback: string) => {
    setLoading(true);
    try {
      const { error: err } = await supabase.rpc("reject_audit_with_feedback", {
        p_audit_id: auditId,
        p_feedback: feedback,
      });
      if (err) throw err;
      useAuditStore
        .getState()
        .updateProgram(auditId, { status: "in_progress" });
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Bootstrap ─────────────────────────────────────────
  useEffect(() => {
    loadFrameworks();
    loadPrograms();
    loadFindings();
    loadActionPlans();
  }, [loadFrameworks, loadPrograms, loadFindings, loadActionPlans]);

  return {
    // State
    programs: store.programs,
    frameworks: store.frameworks,
    findings: store.findings,
    actionPlans: store.actionPlans,
    loading,
    error,
    stats: getDashboardStats,

    // Programs
    loadPrograms,
    createProgram,
    updateProgram,
    deleteProgram,

    // Checklists
    getChecklists,
    updateChecklistItem,
    populateChecklistFromFramework,

    // Findings
    loadFindings,
    createFinding,
    updateFinding,

    // Execution Core
    loadItemResponses,
    saveItemResponse,
    loadItemEvidences,
    uploadEvidence,
    deleteEvidence,
    submitAuditForReview,
    approveAudit,
    rejectAudit,

    // Action Plans
    loadActionPlans,
    createActionPlan,
    updateActionPlan,

    // Frameworks
    loadFrameworks,
  };
}
