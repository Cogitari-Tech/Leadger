// packages/core/src/repositories/audit/IAuditProgramRepository.ts

import { AuditProgram } from "../../entities/AuditProgram";

/**
 * Port: Audit Program Repository
 *
 * Handles persistence for the AuditProgram aggregate root.
 */
export interface IAuditProgramRepository {
  saveProgram(program: AuditProgram): Promise<void>;
  getProgramById(id: string): Promise<AuditProgram | null>;
  listPrograms(tenantId: string): Promise<AuditProgram[]>;
  updateProgram(program: AuditProgram): Promise<void>;
  deleteProgram(id: string): Promise<void>;
}
