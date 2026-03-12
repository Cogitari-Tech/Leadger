import { useState, useCallback, useMemo } from "react";
import { supabase } from "../../../config/supabase";
import {
  Project,
  ProjectFormData,
  ProjectMemberDetails,
} from "../types/project.types";
import { useAuth } from "../../auth/context/AuthContext";
import { SupabaseProjectRepository } from "../repositories/SupabaseProjectRepository";

export function useProjects() {
  const { tenant } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => new SupabaseProjectRepository(supabase), []);

  const fetchProjects = useCallback(async () => {
    if (!tenant) return;
    setLoading(true);
    setError(null);
    try {
      const data = await repository.listProjects(tenant.id);
      setProjects(data as unknown as Project[]);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar projetos.");
    } finally {
      setLoading(false);
    }
  }, [tenant, repository]);

  const createProject = async (data: ProjectFormData) => {
    if (!tenant) return null;
    setLoading(true);
    setError(null);
    try {
      const newProject = await repository.createProject(tenant.id, data as any);
      setProjects((prev) => [newProject as unknown as Project, ...prev]);
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
      const updatedProject = await repository.updateProject(id, data as any);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? (updatedProject as unknown as Project) : p,
        ),
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
      await repository.deleteProject(id);
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

  const repository = useMemo(() => new SupabaseProjectRepository(supabase), []);

  const fetchMembers = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await repository.listProjectMembersWithDetails(projectId);
      setMembers((data as unknown as ProjectMemberDetails[]) || []);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar membros do projeto.");
    } finally {
      setLoading(false);
    }
  }, [projectId, repository]);

  const assignMember = async (memberId: string, role: string = "member") => {
    setLoading(true);
    setError(null);
    try {
      await repository.assignMember(projectId, memberId, role);
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
      await repository.removeMember(projectId, memberId);
      setMembers((prev) => prev.filter((m) => m.memberId !== memberId));
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
