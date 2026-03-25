export interface Project {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: "active" | "completed" | "on_hold" | "cancelled";
  startDate: string | null;
  endDate: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithResources extends Project {
  audit_programs: { id: string; name: string; status: string }[];
  github_repositories: { id: string; full_name: string; name: string }[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  memberId: string;
  projectRole: string;
  assignedAt: string;
}

// Extends ProjectMember with details from tenant_members and auth.users
export interface ProjectMemberDetails extends ProjectMember {
  member: {
    id: string;
    role: {
      name: string;
      display_name: string;
    } | null;
    user: {
      email: string;
      raw_user_meta_data?: {
        name?: string;
      };
    } | null;
  };
}

export interface ProjectFormData {
  name: string;
  description: string;
  status: "active" | "completed" | "on_hold" | "cancelled";
  startDate: string;
  endDate: string;
}
