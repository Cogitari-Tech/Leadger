// packages/core/src/repositories/audit/IAuditWorkflowService.ts

import { AuditVersionInput, FindingStatusCount } from "../IAuditRepository";

/**
 * Port: Audit Workflow Service
 *
 * Handles audit lifecycle operations: submission, approval, rejection,
 * and aggregate statistics.
 */
export interface IAuditWorkflowService {
  submitForReview(programId: string): Promise<void>;
  approveAudit(
    programId: string,
    versionData: AuditVersionInput,
  ): Promise<void>;
  rejectAudit(programId: string, feedback: string): Promise<void>;
  countFindingsByStatus(tenantId: string): Promise<FindingStatusCount>;
}
