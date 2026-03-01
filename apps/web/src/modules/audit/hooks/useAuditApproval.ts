// apps/web/src/modules/audit/hooks/useAuditApproval.ts

import { useState, useCallback } from "react";
import { useAuditStore } from "../../../store/auditStore";
import { supabase } from "../../../config/supabase";

/**
 * Atomic hook: Audit Approval Workflow
 * Handles submit for review, approve, and reject operations.
 * Follows SRP — only handles approval-phase operations.
 */
export function useAuditApproval() {
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

  const submitAuditForReview = useCallback(async (auditId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Validate no incomplete findings
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

      const { error: pErr } = await supabase.rpc("submit_audit_for_review", {
        p_audit_id: auditId,
      });
      if (pErr) throw pErr;

      useAuditStore
        .getState()
        .updateProgram(auditId, { status: "under_review" });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao enviar para revisão";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveAudit = useCallback(
    async (auditId: string, docHash: string, pdfBlob?: Blob) => {
      setLoading(true);
      setError(null);
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

        // Change status via RPC
        const { error: pErr } = await supabase.rpc("approve_audit", {
          p_audit_id: auditId,
        });
        if (pErr) throw pErr;

        useAuditStore.getState().updateProgram(auditId, { status: "approved" });
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Erro ao aprovar auditoria";
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getTenantId],
  );

  const rejectAudit = useCallback(async (auditId: string, feedback: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.rpc("reject_audit_with_feedback", {
        p_audit_id: auditId,
        p_feedback: feedback,
      });
      if (err) throw err;
      useAuditStore
        .getState()
        .updateProgram(auditId, { status: "in_progress" });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao rejeitar auditoria";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    submitAuditForReview,
    approveAudit,
    rejectAudit,
  };
}
