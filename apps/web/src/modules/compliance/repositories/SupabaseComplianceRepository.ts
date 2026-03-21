// apps/web/src/modules/compliance/repositories/SupabaseComplianceRepository.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IComplianceRepository,
  FrameworkDTO,
  ControlDTO,
  RiskDTO,
  CreateRiskInput,
  SwotDTO,
  CreateSwotInput,
} from "@leadgers/core/repositories/IComplianceRepository";

/**
 * Adapter: Supabase implementation of IComplianceRepository
 */
export class SupabaseComplianceRepository implements IComplianceRepository {
  constructor(private supabase: SupabaseClient) {}

  // ─── Frameworks ─────────────────────────────────────────

  async listFrameworks(tenantId: string): Promise<FrameworkDTO[]> {
    const { data: fwData, error: fwError } = await this.supabase
      .from("audit_frameworks")
      .select("*")
      .eq("tenant_id", tenantId);

    if (fwError || !fwData) return [];

    const { data: programsData } = await this.supabase
      .from("audit_programs")
      .select("id, framework_id")
      .eq("tenant_id", tenantId)
      .in(
        "framework_id",
        fwData.map((f: Record<string, unknown>) => f.id),
      );

    const programIds =
      programsData?.map((p: Record<string, unknown>) => p.id) || [];
    let checklistData: Record<string, unknown>[] = [];

    if (programIds.length > 0) {
      const { data } = await this.supabase
        .from("audit_program_checklists")
        .select("status, program_id, control_id")
        .in("program_id", programIds);
      if (data) checklistData = data;
    }

    return fwData.map((f: Record<string, unknown>) => {
      const fwPrograms =
        programsData?.filter(
          (p: Record<string, unknown>) => p.framework_id === f.id,
        ) || [];
      const fProgramIds = fwPrograms.map((p: Record<string, unknown>) => p.id);

      const fwChecklists =
        checklistData?.filter((c: Record<string, unknown>) =>
          fProgramIds.includes(c.program_id),
        ) || [];
      const total = fwChecklists.length;
      const compliant = fwChecklists.filter(
        (c: Record<string, unknown>) => c.status === "compliant",
      ).length;
      const progress = total > 0 ? Math.round((compliant / total) * 100) : 0;
      let status = "pending";
      if (progress >= 100) status = "compliant";
      else if (progress > 0) status = "partial";

      if (total > 0 && status === "pending") status = "active";

      return {
        id: f.id,
        name: f.name,
        description: f.description || "",
        version: f.version || "1.0",
        status,
        progress,
        controlsCount: total as number,
        compliantCount: compliant as number,
        lastUpdated: new Date(f.created_at as string).toLocaleDateString(),
      };
    });
  }

  async listControls(frameworkIds: string[]): Promise<ControlDTO[]> {
    const { data, error } = await this.supabase
      .from("audit_framework_controls")
      .select("*")
      .in("framework_id", frameworkIds);
    if (error) throw error;
    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      framework_id: row.framework_id as string,
      code: row.code as string,
      title: row.title as string,
      description: (row.description as string) || "",
    }));
  }

  // Helper method to fetch checklists for computation in hook
  async listChecklistsForPrograms(
    programIds: string[],
  ): Promise<{ status: string; program_id: string; control_id: string }[]> {
    if (programIds.length === 0) return [];
    const { data, error } = await this.supabase
      .from("audit_program_checklists")
      .select("status, program_id, control_id")
      .in("program_id", programIds);
    if (error) throw error;
    return data || [];
  }

  async listProgramsForFrameworks(
    tenantId: string,
    frameworkIds: string[],
  ): Promise<{ id: string; framework_id: string }[]> {
    const { data, error } = await this.supabase
      .from("audit_programs")
      .select("id, framework_id")
      .eq("tenant_id", tenantId)
      .in("framework_id", frameworkIds);
    if (error) throw error;
    return data || [];
  }

  // ─── Risks ──────────────────────────────────────────────

  async listRisks(tenantId: string): Promise<RiskDTO[]> {
    const { data, error } = await this.supabase
      .from("risks")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("score", { ascending: false });

    if (error || !data) return [];

    return data.map((item: Record<string, unknown>) => ({
      ...item,
      createdAt: item.created_at,
    }));
  }

  async addRisk(tenantId: string, input: CreateRiskInput): Promise<RiskDTO> {
    const { data, error } = await this.supabase
      .from("risks")
      .insert({
        tenant_id: tenantId,
        ...input,
      })
      .select()
      .single();

    if (error) throw error;
    return { ...data, createdAt: data.created_at } as RiskDTO;
  }

  async removeRisk(id: string): Promise<void> {
    const { error } = await this.supabase.from("risks").delete().eq("id", id);
    if (error) throw error;
  }

  // ─── SWOT ───────────────────────────────────────────────

  async listItems(tenantId: string): Promise<SwotDTO[]> {
    const { data, error } = await this.supabase
      .from("swot_items")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("impact", { ascending: false });

    if (error || !data) return [];

    return data.map((item: Record<string, unknown>) => ({
      ...item,
      createdAt: item.created_at,
    }));
  }

  async addItem(tenantId: string, input: CreateSwotInput): Promise<SwotDTO> {
    const { data, error } = await this.supabase
      .from("swot_items")
      .insert({
        tenant_id: tenantId,
        ...input,
      })
      .select()
      .single();

    if (error) throw error;
    return { ...data, createdAt: data.created_at } as SwotDTO;
  }

  async removeItem(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("swot_items")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
}
