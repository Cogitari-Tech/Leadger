// apps/web/src/modules/audit/repositories/SupabaseAuditRepository.ts

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  IAuditRepository,
  AuditVersionInput,
  FindingStatusCount,
} from "@cogitari-platform/core/repositories/IAuditRepository";
import { AuditProgram } from "@cogitari-platform/core/entities/AuditProgram";
import { AuditFinding } from "@cogitari-platform/core/entities/AuditFinding";
import { AuditActionPlan } from "@cogitari-platform/core/entities/AuditActionPlan";

/**
 * Adapter: Supabase implementation of IAuditRepository
 *
 * Converts between rich domain entities and Supabase table rows.
 */
export class SupabaseAuditRepository implements IAuditRepository {
  constructor(private supabase: SupabaseClient) {}

  // === PROGRAMS ===

  async saveProgram(program: AuditProgram): Promise<void> {
    const { error } = await this.supabase
      .from("audit_programs")
      .insert(program.toPersistence());
    if (error) throw new Error(`Failed to save program: ${error.message}`);
  }

  async getProgramById(id: string): Promise<AuditProgram | null> {
    const { data, error } = await this.supabase
      .from("audit_programs")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get program: ${error.message}`);
    }
    return AuditProgram.fromPersistence(data);
  }

  async listPrograms(_tenantId: string): Promise<AuditProgram[]> {
    const { data, error } = await this.supabase
      .from("audit_programs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list programs: ${error.message}`);
    return (data ?? []).map((row) => AuditProgram.fromPersistence(row));
  }

  async updateProgram(program: AuditProgram): Promise<void> {
    const persistence = program.toPersistence();
    const { error } = await this.supabase
      .from("audit_programs")
      .update(persistence)
      .eq("id", program.id);
    if (error) throw new Error(`Failed to update program: ${error.message}`);
  }

  async deleteProgram(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("audit_programs")
      .delete()
      .eq("id", id);
    if (error) throw new Error(`Failed to delete program: ${error.message}`);
  }

  // === FINDINGS ===

  async saveFinding(finding: AuditFinding): Promise<void> {
    const { error } = await this.supabase
      .from("audit_findings")
      .insert(finding.toPersistence());
    if (error) throw new Error(`Failed to save finding: ${error.message}`);
  }

  async getFindingById(id: string): Promise<AuditFinding | null> {
    const { data, error } = await this.supabase
      .from("audit_findings")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get finding: ${error.message}`);
    }
    return AuditFinding.fromPersistence(data);
  }

  async listFindingsByProgram(programId: string): Promise<AuditFinding[]> {
    const { data, error } = await this.supabase
      .from("audit_findings")
      .select("*")
      .eq("program_id", programId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list findings: ${error.message}`);
    return (data ?? []).map((row) => AuditFinding.fromPersistence(row));
  }

  async listFindings(_tenantId: string): Promise<AuditFinding[]> {
    const { data, error } = await this.supabase
      .from("audit_findings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list findings: ${error.message}`);
    return (data ?? []).map((row) => AuditFinding.fromPersistence(row));
  }

  async updateFinding(finding: AuditFinding): Promise<void> {
    const { error } = await this.supabase
      .from("audit_findings")
      .update(finding.toPersistence())
      .eq("id", finding.id);
    if (error) throw new Error(`Failed to update finding: ${error.message}`);
  }

  // === ACTION PLANS ===

  async saveActionPlan(plan: AuditActionPlan): Promise<void> {
    const { error } = await this.supabase
      .from("audit_action_plans")
      .insert(plan.toPersistence());
    if (error) throw new Error(`Failed to save action plan: ${error.message}`);
  }

  async getActionPlanById(id: string): Promise<AuditActionPlan | null> {
    const { data, error } = await this.supabase
      .from("audit_action_plans")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get action plan: ${error.message}`);
    }
    return AuditActionPlan.fromPersistence(data);
  }

  async listActionPlansByFinding(
    findingId: string,
  ): Promise<AuditActionPlan[]> {
    const { data, error } = await this.supabase
      .from("audit_action_plans")
      .select("*")
      .eq("finding_id", findingId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list action plans: ${error.message}`);
    return (data ?? []).map((row) => AuditActionPlan.fromPersistence(row));
  }

  async listActionPlans(_tenantId: string): Promise<AuditActionPlan[]> {
    const { data, error } = await this.supabase
      .from("audit_action_plans")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list action plans: ${error.message}`);
    return (data ?? []).map((row) => AuditActionPlan.fromPersistence(row));
  }

  async updateActionPlan(plan: AuditActionPlan): Promise<void> {
    const { error } = await this.supabase
      .from("audit_action_plans")
      .update(plan.toPersistence())
      .eq("id", plan.id);
    if (error)
      throw new Error(`Failed to update action plan: ${error.message}`);
  }

  // === WORKFLOW ===

  async submitForReview(programId: string): Promise<void> {
    const { error } = await this.supabase.rpc("submit_audit_for_review", {
      p_audit_id: programId,
    });
    if (error) throw new Error(`Failed to submit for review: ${error.message}`);
  }

  async approveAudit(
    programId: string,
    versionData: AuditVersionInput,
  ): Promise<void> {
    // Insert version record
    const { error: vErr } = await this.supabase.from("audit_versions").insert({
      audit_id: programId,
      doc_hash: versionData.docHash,
      pdf_path: versionData.pdfPath,
      approved_by: versionData.approvedBy,
      tenant_id: versionData.tenantId,
    });
    if (vErr) throw new Error(`Failed to create version: ${vErr.message}`);

    // Change status via RPC
    const { error: pErr } = await this.supabase.rpc("approve_audit", {
      p_audit_id: programId,
    });
    if (pErr) throw new Error(`Failed to approve audit: ${pErr.message}`);
  }

  async rejectAudit(programId: string, feedback: string): Promise<void> {
    const { error } = await this.supabase.rpc("reject_audit_with_feedback", {
      p_audit_id: programId,
      p_feedback: feedback,
    });
    if (error) throw new Error(`Failed to reject audit: ${error.message}`);
  }

  // === STATS ===

  async countFindingsByStatus(_tenantId: string): Promise<FindingStatusCount> {
    const { data, error } = await this.supabase
      .from("audit_findings")
      .select("status, risk_level");
    if (error) throw new Error(`Failed to count findings: ${error.message}`);

    const findings = data ?? [];
    return {
      total: findings.length,
      open: findings.filter((f) => f.status === "open").length,
      inProgress: findings.filter((f) => f.status === "in_progress").length,
      resolved: findings.filter((f) => f.status === "resolved").length,
      critical: findings.filter((f) => f.risk_level === "critical").length,
      high: findings.filter((f) => f.risk_level === "high").length,
    };
  }
}
