import { useState, useCallback } from "react";
import { supabase } from "../../../config/supabase";
import {
  Project,
  ProjectFormData,
  ProjectMemberDetails,
} from "../types/project.types";
import { useAuth } from "../../auth/context/AuthContext";

export function useProjects() {
  const { tenant } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "active") // or allow filtering
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar projetos.");
    } finally {
      setLoading(false);
    }
  }, [tenant]);

  const createProject = async (data: ProjectFormData) => {
    if (!tenant) return null;
    setLoading(true);
    setError(null);
    try {
      const { data: newProject, error } = await supabase
        .from("projects")
        .insert([{ ...data, tenant_id: tenant.id }])
        .select()
        .single();

      if (error) throw error;
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    } catch (err: any) {
      setError(err.message || "Erro ao criar projeto.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, data: Partial<ProjectFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const { data: updatedProject, error } = await supabase
        .from("projects")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p)),
      );
      return updatedProject;
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar projeto.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || "Erro ao excluir projeto.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}

export function useProjectMembers(projectId: string) {
  const [members, setMembers] = useState<ProjectMemberDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      // Note: member details comes from tenant_members and auth.users.
      // Relying on RLS for access control.
      const { data, error } = await supabase
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
      setMembers((data as unknown as ProjectMemberDetails[]) || []);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar membros do projeto.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const assignMember = async (memberId: string, role: string = "member") => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("project_members")
        .insert([
          { project_id: projectId, member_id: memberId, project_role: role },
        ]);

      if (error) throw error;
      await fetchMembers(); // Refresh to get relations
      return true;
    } catch (err: any) {
      setError(err.message || "Erro ao atribuir membro.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("project_id", projectId)
        .eq("member_id", memberId);

      if (error) throw error;
      setMembers((prev) => prev.filter((m) => m.member_id !== memberId));
      return true;
    } catch (err: any) {
      setError(err.message || "Erro ao remover membro.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    members,
    loading,
    error,
    fetchMembers,
    assignMember,
    removeMember,
  };
}
