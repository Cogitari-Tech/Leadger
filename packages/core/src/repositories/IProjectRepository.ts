// packages/core/src/repositories/IProjectRepository.ts

/**
 * Port: Project Repository Interface
 *
 * Defines the contract for project data access.
 */
export interface IProjectRepository {
  listProjects(tenantId: string): Promise<ProjectDTO[]>;
  getProjectById(id: string): Promise<ProjectDTO | null>;
  createProject(
    tenantId: string,
    data: CreateProjectInput,
  ): Promise<ProjectDTO>;
  updateProject(
    id: string,
    data: Partial<CreateProjectInput>,
  ): Promise<ProjectDTO>;
  deleteProject(id: string): Promise<void>;

  // Members
  listProjectMembers(projectId: string): Promise<ProjectMemberDTO[]>;
  assignMember(
    projectId: string,
    memberId: string,
    role: string,
  ): Promise<void>;
  removeMember(projectId: string, memberId: string): Promise<void>;
}

// ─── DTOs ─────────────────────────────────────────────────

export interface ProjectDTO {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectMemberDTO {
  id: string;
  projectId: string;
  memberId: string;
  projectRole: string;
  assignedAt: string;
}
