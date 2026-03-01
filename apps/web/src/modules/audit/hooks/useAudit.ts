// apps/web/src/modules/audit/hooks/useAudit.ts

/**
 * BACKWARD-COMPATIBLE FACADE
 *
 * This hook composes 5 atomic hooks into a single API surface
 * identical to the original useAudit() interface.
 *
 * Existing consumers can continue importing from here with zero changes.
 * New consumers should import from the specific atomic hooks directly.
 *
 * Migration path:
 *   import { useAudit } from "../hooks/useAudit";   // ← old (still works)
 *   import { useAuditPrograms } from "../hooks/useAuditPrograms"; // ← new
 *
 * Once all consumers are migrated, this file can be deleted.
 */

import { useEffect, useMemo } from "react";
import { useAuditStore } from "../../../store/auditStore";
import { useAuditPrograms } from "./useAuditPrograms";
import { useAuditFindings } from "./useAuditFindings";
import { useAuditActionPlans } from "./useAuditActionPlans";
import { useAuditExecution } from "./useAuditExecution";
import { useAuditApproval } from "./useAuditApproval";
import type { AuditDashboardStats } from "../types/audit.types";

export function useAudit() {
  const programs = useAuditPrograms();
  const findings = useAuditFindings();
  const actionPlans = useAuditActionPlans();
  const execution = useAuditExecution();
  const approval = useAuditApproval();

  const store = useAuditStore();

  // ─── Dashboard Stats (computed) ────────────────────────
  const stats = useMemo((): AuditDashboardStats => {
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

  // ─── Bootstrap ─────────────────────────────────────────
  useEffect(() => {
    programs.loadFrameworks();
    programs.loadPrograms();
    findings.loadFindings();
    actionPlans.loadActionPlans();
  }, [
    programs.loadFrameworks,
    programs.loadPrograms,
    findings.loadFindings,
    actionPlans.loadActionPlans,
  ]);

  // ─── Merged loading / error ────────────────────────────
  const loading =
    programs.loading ||
    findings.loading ||
    actionPlans.loading ||
    execution.loading ||
    approval.loading;

  const error =
    programs.error ||
    findings.error ||
    actionPlans.error ||
    execution.error ||
    approval.error;

  return {
    // State
    programs: programs.programs,
    frameworks: programs.frameworks,
    findings: findings.findings,
    actionPlans: actionPlans.actionPlans,
    loading,
    error,
    stats,

    // Programs
    loadPrograms: programs.loadPrograms,
    createProgram: programs.createProgram,
    updateProgram: programs.updateProgram,
    deleteProgram: programs.deleteProgram,

    // Checklists
    getChecklists: execution.getChecklists,
    updateChecklistItem: execution.updateChecklistItem,
    populateChecklistFromFramework: execution.populateChecklistFromFramework,

    // Findings
    loadFindings: findings.loadFindings,
    createFinding: findings.createFinding,
    updateFinding: findings.updateFinding,

    // Execution Core
    loadItemResponses: execution.loadItemResponses,
    saveItemResponse: execution.saveItemResponse,
    loadItemEvidences: execution.loadItemEvidences,
    uploadEvidence: execution.uploadEvidence,
    deleteEvidence: execution.deleteEvidence,
    submitAuditForReview: approval.submitAuditForReview,
    approveAudit: approval.approveAudit,
    rejectAudit: approval.rejectAudit,

    // Action Plans
    loadActionPlans: actionPlans.loadActionPlans,
    createActionPlan: actionPlans.createActionPlan,
    updateActionPlan: actionPlans.updateActionPlan,

    // Frameworks
    loadFrameworks: programs.loadFrameworks,
  };
}
