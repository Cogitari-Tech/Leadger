// apps/web/src/modules/compliance/repositories/SupabaseComplianceRepository.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IComplianceRepository,
  FrameworkDTO,
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
      .eq("tenant_id", tenantId);

    const { data: checklistData } = await this.supabase
      .from("audit_program_checklists")
      .select("status, audit_program_id")
      .eq("tenant_id", tenantId);

    return fwData.map((f: any) => {
      const fwPrograms =
        programsData?.filter((p) => p.framework_id === f.id) || [];
      const programIds = fwPrograms.map((p) => p.id);

      const fwChecklists =
        checklistData?.filter((c) => programIds.includes(c.audit_program_id)) ||
        [];
      const total = fwChecklists.length;
      const compliant = fwChecklists.filter(
        (c) => c.status === "compliant",
      ).length;
      const progress = total > 0 ? Math.round((compliant / total) * 100) : 0;
      let status = "pending";
      if (progress >= 100) status = "compliant";
      else if (progress > 0) status = "partial";

      return {
        id: f.id,
        name: f.name,
        description: f.description || "",
        version: f.version || "1.0",
        status,
        progress,
        controlsCount: total,
        compliantCount: compliant,
        lastUpdated: new Date(f.created_at).toLocaleDateString(),
      };
    });
  }

  // ─── Risks ──────────────────────────────────────────────

  async listRisks(_tenantId: string): Promise<RiskDTO[]> {
    const { data, error } = await this.supabase
      .from("risks")
      .select("*")
      .order("score", { ascending: false });

    if (error || !data) return [];

    return data.map((item: any) => ({
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

  async listItems(_tenantId: string): Promise<SwotDTO[]> {
    const { data, error } = await this.supabase
      .from("swot_items")
      .select("*")
      .order("impact", { ascending: false });

    if (error || !data) return [];

    return data.map((item: any) => ({
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
