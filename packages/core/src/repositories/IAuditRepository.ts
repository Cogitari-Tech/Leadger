// packages/core/src/repositories/IAuditRepository.ts

import { IAuditProgramRepository } from "./audit/IAuditProgramRepository";
import { IAuditFindingRepository } from "./audit/IAuditFindingRepository";
import { IAuditActionPlanRepository } from "./audit/IAuditActionPlanRepository";
import { IAuditWorkflowService } from "./audit/IAuditWorkflowService";

/**
 * Port: Unified Audit Repository Interface
 *
 * Composes all audit sub-interfaces into one contract.
 * Existing consumers can keep using this.
 * New consumers should prefer the specific sub-interfaces.
 *
 * Migration path:
 *   import { IAuditRepository } from ".../IAuditRepository";             // ← legacy (still works)
 *   import { IAuditProgramRepository } from ".../audit/IAuditProgramRepository"; // ← new (preferred)
 */
export interface IAuditRepository
  extends
    IAuditProgramRepository,
    IAuditFindingRepository,
    IAuditActionPlanRepository,
    IAuditWorkflowService {}

// ─── DTOs (kept here for backward compatibility) ──────────

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
