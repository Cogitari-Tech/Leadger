// packages/core/src/repositories/IAuditRepository.ts

import { AuditProgram } from "../entities/AuditProgram";
import { AuditFinding } from "../entities/AuditFinding";
import { AuditActionPlan } from "../entities/AuditActionPlan";

/**
 * Port: Audit Repository Interface
 *
 * Defines the contract for audit data persistence.
 * Concrete implementations (Adapters) can use Supabase,
 * REST APIs, or any other storage mechanism.
 */
export interface IAuditRepository {
  // === PROGRAMS ===

  saveProgram(program: AuditProgram): Promise<void>;
  getProgramById(id: string): Promise<AuditProgram | null>;
  listPrograms(tenantId: string): Promise<AuditProgram[]>;
  updateProgram(program: AuditProgram): Promise<void>;
  deleteProgram(id: string): Promise<void>;

  // === FINDINGS ===

  saveFinding(finding: AuditFinding): Promise<void>;
  getFindingById(id: string): Promise<AuditFinding | null>;
  listFindingsByProgram(programId: string): Promise<AuditFinding[]>;
  listFindings(tenantId: string): Promise<AuditFinding[]>;
  updateFinding(finding: AuditFinding): Promise<void>;

  // === ACTION PLANS ===

  saveActionPlan(plan: AuditActionPlan): Promise<void>;
  getActionPlanById(id: string): Promise<AuditActionPlan | null>;
  listActionPlansByFinding(findingId: string): Promise<AuditActionPlan[]>;
  listActionPlans(tenantId: string): Promise<AuditActionPlan[]>;
  updateActionPlan(plan: AuditActionPlan): Promise<void>;

  // === WORKFLOW ===

  submitForReview(programId: string): Promise<void>;
  approveAudit(
    programId: string,
    versionData: AuditVersionInput,
  ): Promise<void>;
  rejectAudit(programId: string, feedback: string): Promise<void>;

  // === STATS ===

  countFindingsByStatus(tenantId: string): Promise<FindingStatusCount>;
}

// ─── DTOs ─────────────────────────────────────────────────

export interface AuditVersionInput {
  docHash: string;
  pdfPath: string | null;
  approvedBy: string;
  tenantId: string;
}

export interface FindingStatusCount {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  critical: number;
  high: number;
}
