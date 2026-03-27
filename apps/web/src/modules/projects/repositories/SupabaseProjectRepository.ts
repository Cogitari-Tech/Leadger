// apps/web/src/modules/projects/repositories/SupabaseProjectRepository.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IProjectRepository,
  ProjectDTO,
  CreateProjectInput,
  ProjectMemberDTO,
} from "@leadgers/core/repositories/IProjectRepository";

/**
 * Adapter: Supabase implementation of IProjectRepository
 */
export class SupabaseProjectRepository implements IProjectRepository {
  constructor(private supabase: SupabaseClient) {}

  async listProjects(tenantId: string): Promise<ProjectDTO[]> {
    const { data, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapProject);
  }

  async getProjectById(id: string): Promise<ProjectDTO | null> {
    const { data, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return this.mapProject(data);
  }

  async createProject(
    tenantId: string,
    input: CreateProjectInput,
  ): Promise<ProjectDTO> {
    const persistence = {
      ...this.mapToPersistence(input),
      tenant_id: tenantId,
    };
    const { data, error } = await this.supabase
      .from("projects")
      .insert([persistence])
      .select()
      .single();
    if (error) throw error;
    return this.mapProject(data);
  }

  async updateProject(
    id: string,
    input: Partial<CreateProjectInput>,
  ): Promise<ProjectDTO> {
    const persistence = this.mapToPersistence(input);
    const { data, error } = await this.supabase
      .from("projects")
      .update(persistence)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return this.mapProject(data);
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("projects")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  async listProjectMembers(projectId: string): Promise<ProjectMemberDTO[]> {
    const { data, error } = await this.supabase
      .from("project_members")
      .select("*")
      .eq("project_id", projectId);
    if (error) throw error;
    return (data ?? []).map(this.mapMember);
  }

  async listProjectMembersWithDetails(projectId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("project_members")
      .select(
        `
        id,
        project_id,
        member_id,
        project_role,
        assigned_at,
        member:tenant_members!inner(
          id,
          role:roles(name, display_name),
          user:users!tenant_members_user_id_fkey(
            email,
            raw_user_meta_data
          )
        )
      `,
      )
      .eq("project_id", projectId);

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      projectId: row.project_id,
      memberId: row.member_id,
      projectRole: row.project_role,
      assignedAt: row.assigned_at,
      member: row.member,
    }));
  }

  async assignMember(
    projectId: string,
    memberId: string,
    role: string,
  ): Promise<void> {
    const { error } = await this.supabase.from("project_members").insert([
      {
        project_id: projectId,
        member_id: memberId,
        project_role: role,
      },
    ]);
    if (error) throw error;
  }

  async removeMember(projectId: string, memberId: string): Promise<void> {
    const { error } = await this.supabase
      .from("project_members")
      .delete()
      .eq("project_id", projectId)
      .eq("member_id", memberId);
    if (error) throw error;
  }

  // ─── Mappers ──────────────────────────────────────────

  private mapToPersistence(input: any) {
    const mapped: any = {};
    if (input.name !== undefined) mapped.name = input.name;
    if (input.description !== undefined) mapped.description = input.description;
    if (input.status !== undefined) mapped.status = input.status;
    if (input.startDate !== undefined) mapped.start_date = input.startDate;
    if (input.endDate !== undefined) mapped.end_date = input.endDate;
    return mapped;
  }

  private mapProject = (row: any): ProjectDTO => ({
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
  });

  private mapMember = (row: any): ProjectMemberDTO => ({
    id: row.id,
    projectId: row.project_id,
    memberId: row.member_id,
    projectRole: row.project_role,
    assignedAt: row.assigned_at,
  });
}
