// packages/core/src/repositories/audit/IAuditActionPlanRepository.ts

import { AuditActionPlan } from "../../entities/AuditActionPlan";

/**
 * Port: Audit Action Plan Repository
 *
 * Handles persistence for corrective action plans.
 */
export interface IAuditActionPlanRepository {
  saveActionPlan(plan: AuditActionPlan): Promise<void>;
  getActionPlanById(id: string): Promise<AuditActionPlan | null>;
  listActionPlansByFinding(findingId: string): Promise<AuditActionPlan[]>;
  listActionPlans(tenantId: string): Promise<AuditActionPlan[]>;
  updateActionPlan(plan: AuditActionPlan): Promise<void>;
}
