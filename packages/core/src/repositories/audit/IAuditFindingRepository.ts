// packages/core/src/repositories/audit/IAuditFindingRepository.ts

import { AuditFinding } from "../../entities/AuditFinding";

/**
 * Port: Audit Finding Repository
 *
 * Handles persistence for audit findings.
 */
export interface IAuditFindingRepository {
  saveFinding(finding: AuditFinding): Promise<void>;
  getFindingById(id: string): Promise<AuditFinding | null>;
  listFindingsByProgram(programId: string): Promise<AuditFinding[]>;
  listFindings(tenantId: string): Promise<AuditFinding[]>;
  updateFinding(finding: AuditFinding): Promise<void>;
}
