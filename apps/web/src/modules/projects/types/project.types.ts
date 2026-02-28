export interface Project {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  status: "active" | "completed" | "on_hold" | "cancelled";
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithResources extends Project {
  audit_programs: { id: string; name: string; status: string }[];
  github_repositories: { id: string; full_name: string; name: string }[];
}

export interface ProjectMember {
  id: string;
  project_id: string;
  member_id: string;
  project_role: string;
  assigned_at: string;
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
  start_date: string;
  end_date: string;
}
