import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle2,
  Circle,
  Clock,
  Users,
  Plus,
  Trash2,
  FolderGit2,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "../../../config/supabase";
import { Project } from "../types/project.types";
import { useProjectMembers } from "../services/projects.service";
import { AssignMemberModal } from "../components/AssignMemberModal";
import { ProjectFormModal } from "../components/ProjectFormModal";
import { useAuth } from "../../auth/context/AuthContext";

export function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { permissions } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [programs, setPrograms] = useState<any[]>([]);
  const [repos, setRepos] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Tabs: 'geral' | 'equipe' | 'recursos'
  const currentTab = searchParams.get("tab") || "geral";

  // Hook for team members
  const {
    members,
    loading: loadingMembers,
    fetchMembers,
    assignMember,
    removeMember,
  } = useProjectMembers(id || "");

  const canManage = permissions.some(
    (p: any) =>
      p.module === "projects" && (p.action === "manage" || p.action === "edit"),
  );

  const canManageTeam =
    permissions.some(
      (p: any) => p.module === "projects" && p.action === "manager", // or implicit from edit
    ) || canManage;

  useEffect(() => {
    if (id) {
      loadProject();
      fetchMembers();
      fetchResources();
    }
  }, [id]);

  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const { data: pData, error: pError } = await supabase
        .from("audit_programs")
        .select("id, name, status, start_date")
        .eq("project_id", id);
      const { data: rData, error: rError } = await supabase
        .from("github_repositories")
        .select("id, full_name, name, open_vulnerabilities_count")
        .eq("project_id", id);
      if (!pError) setPrograms(pData || []);
      if (!rError) setRepos(rData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingResources(false);
    }
  };

  const loadProject = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (err: any) {
      console.error("Error loading project:", err);
      setError("Não foi possível carregar os detalhes do projeto.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (data: any) => {
    try {
      const { error } = await supabase
        .from("projects")
        .update(data)
        .eq("id", id);

      if (error) throw error;
      await loadProject();
    } catch (err) {
      console.error("Erro ao atualizar projeto:", err);
      alert("Erro ao atualizar o projeto.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <Link
          to="/projects"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Projetos
        </Link>
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
          <p className="text-destructive font-medium">
            {error || "Projeto não encontrado."}
          </p>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "active":
        return {
          text: "Em Andamento",
          color: "text-cyan-600 dark:text-cyan-400",
          icon: Clock,
        };
      case "completed":
        return {
          text: "Concluído",
          color: "text-emerald-600 dark:text-emerald-400",
          icon: CheckCircle2,
        };
      case "on_hold":
        return {
          text: "Pausado",
          color: "text-yellow-600 dark:text-yellow-400",
          icon: Circle,
        };
      case "cancelled":
        return {
          text: "Cancelado",
          color: "text-red-600 dark:text-red-400",
          icon: Circle,
        };
      default:
        return { text: status, color: "text-muted-foreground", icon: Circle };
    }
  };

  const StatusIcon = getStatusDisplay(project.status).icon;
  const statusColor = getStatusDisplay(project.status).color;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/projects"
          className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-colors border border-border/40"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            {project.name}
            <span
              className={`flex items-center gap-1.5 text-sm font-medium px-2.5 py-1rounded border border-current bg-current/10 ${statusColor} rounded-full`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {getStatusDisplay(project.status).text}
            </span>
          </h1>
        </div>
      </div>

      <div className="bg-card border border-border/40 shadow-sm rounded-xl overflow-hidden">
        <div className="flex border-b border-border/40">
          <button
            onClick={() => setSearchParams({ tab: "geral" })}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              currentTab === "geral"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            Visão Geral
          </button>
          <button
            onClick={() => setSearchParams({ tab: "equipe" })}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              currentTab === "equipe"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="w-4 h-4" />
            Equipe ({members.length})
          </button>
          <button
            onClick={() => setSearchParams({ tab: "recursos" })}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              currentTab === "recursos"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            Recursos ({programs.length + repos.length})
          </button>
        </div>

        <div className="p-6">
          {currentTab === "geral" && (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-4 max-w-3xl">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Descrição
                    </h3>
                    <div className="bg-muted/40 p-4 rounded-lg border border-border/40">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {project.description ||
                          "Nenhuma descrição fornecida para este projeto."}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/40 p-4 rounded-lg border border-border/40 flex items-start gap-3">
                      <div className="p-2 bg-background border border-border/60 rounded-lg text-cyan-600 dark:text-cyan-400 shadow-sm">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">
                          Data de Início
                        </p>
                        <p className="text-foreground font-medium">
                          {project.start_date
                            ? new Date(project.start_date).toLocaleDateString(
                                "pt-BR",
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-muted/40 p-4 rounded-lg border border-border/40 flex items-start gap-3">
                      <div className="p-2 bg-background border border-border/60 rounded-lg text-cyan-600 dark:text-cyan-400 shadow-sm">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">
                          Término Previsto
                        </p>
                        <p className="text-foreground font-medium">
                          {project.end_date
                            ? new Date(project.end_date).toLocaleDateString(
                                "pt-BR",
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {canManage && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors font-medium border border-border/40"
                  >
                    Editar Informações
                  </button>
                )}
              </div>
            </div>
          )}

          {currentTab === "equipe" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">
                  Membros do Projeto
                </h3>
                {canManageTeam && (
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition-all font-medium text-sm shadow-lg shadow-cyan-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Membro
                  </button>
                )}
              </div>

              {loadingMembers ? (
                <div className="py-8 text-center text-muted-foreground">
                  Carregando equipe...
                </div>
              ) : members.length === 0 ? (
                <div className="bg-muted/40 border border-border/50 rounded-lg p-12 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-background border border-border/40 rounded-full flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h4 className="text-foreground font-medium mb-1">
                    Nenhum membro atribuído
                  </h4>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Este projeto ainda não possui membros. Adicione pessoas da
                    equipe do tenant para colaborarem.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-muted/40 border border-border/50 rounded-lg p-4 flex items-center justify-between group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold uppercase">
                          {(
                            member.member.user?.raw_user_meta_data?.name ||
                            member.member.user?.email ||
                            "?"
                          ).charAt(0)}
                        </div>
                        <div>
                          <p className="text-foreground font-medium text-sm">
                            {member.member.user?.raw_user_meta_data?.name ||
                              "Sem Nome"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-xs text-muted-foreground truncate max-w-[120px]"
                              title={member.member.user?.email}
                            >
                              {member.member.user?.email}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-background border border-border/60 text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                              {member.project_role.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {canManageTeam && (
                        <button
                          onClick={async () => {
                            if (confirm("Remover este membro do projeto?")) {
                              await removeMember(member.member_id);
                            }
                          }}
                          className="p-2 text-muted-foreground hover:text-destructive bg-background rounded-md opacity-0 group-hover:opacity-100 transition-all border border-border/40 hover:border-destructive/20"
                          title="Remover do Projeto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === "recursos" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">
                  Recursos Associados
                </h3>
              </div>

              {loadingResources ? (
                <div className="py-8 text-center text-muted-foreground">
                  Carregando recursos...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Audit Programs */}
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4 text-primary" />{" "}
                      Auditorias ({programs.length})
                    </h4>
                    {programs.length === 0 ? (
                      <div className="bg-muted/30 border border-border/40 p-6 rounded-lg text-center text-sm text-muted-foreground">
                        Nenhuma auditoria vinculada.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {programs.map((p) => (
                          <Link
                            key={p.id}
                            to={`/audit/programs`}
                            className="block p-4 bg-card border border-border/60 shadow-sm rounded-lg hover:border-primary/50 hover:shadow-md transition-all"
                          >
                            <p className="font-medium text-card-foreground text-sm">
                              {p.name}
                            </p>
                            <div className="flex justify-between mt-2">
                              <span className="text-xs font-semibold text-muted-foreground">
                                {p.status.toUpperCase()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {p.start_date
                                  ? new Date(p.start_date).toLocaleDateString(
                                      "pt-BR",
                                    )
                                  : "-"}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* GitHub Repositories */}
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      <FolderGit2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />{" "}
                      Repositórios ({repos.length})
                    </h4>
                    {repos.length === 0 ? (
                      <div className="bg-muted/30 border border-border/40 p-6 rounded-lg text-center text-sm text-muted-foreground">
                        Nenhum repositório vinculado.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {repos.map((r) => (
                          <Link
                            key={r.id}
                            to={`/github/repos`}
                            className="block p-4 bg-card border border-border/60 shadow-sm rounded-lg hover:border-cyan-500/50 hover:shadow-md transition-all"
                          >
                            <p className="font-medium text-card-foreground text-sm truncate">
                              {r.full_name}
                            </p>
                            <div className="flex justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                Vulns Abertas:{" "}
                                <strong className="text-foreground">
                                  {r.open_vulnerabilities_count || 0}
                                </strong>
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProject}
        initialData={project}
      />

      <AssignMemberModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={async (memberId, role) => {
          await assignMember(memberId, role);
        }}
        currentMemberIds={members.map((m) => m.member_id)}
      />
    </div>
  );
}
