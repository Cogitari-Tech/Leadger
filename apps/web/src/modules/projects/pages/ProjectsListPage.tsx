import { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  Users,
  Edit2,
  Trash2,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProjects } from "../services/projects.service";
import { ProjectFormModal } from "../components/ProjectFormModal";
import { useAuth } from "../../auth/context/AuthContext";

export function ProjectsListPage() {
  const {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();
  const { permissions } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const canManage = permissions.some(
    (p: any) =>
      p.module === "projects" &&
      (p.action === "manage" || p.action === "create" || p.action === "edit"),
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (data: any) => {
    await createProject(data);
  };

  const handleUpdate = async (data: any) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
      setEditingProject(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Tem certeza que deseja excluir este projeto? Tudo associado a ele será perdido.",
      )
    ) {
      await deleteProject(id);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "completed":
        return "bg-primary/10 text-primary border-primary/20";
      case "on_hold":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border/40";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Em Execução";
      case "completed":
        return "Concluído";
      case "on_hold":
        return "Em Pausa";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-10 p-6 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground font-display">
            Projetos & Auditorias
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Gerencie o ciclo de vida dos projetos e o progresso das auditorias
            organizacionais.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditingProject(null);
              setIsFormOpen(true);
            }}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:brightness-110 active:scale-95 group"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            Novo Projeto
          </button>
        )}
      </div>

      <div className="glass-panel border border-border/20 rounded-[2rem] p-5 flex flex-col lg:flex-row gap-5 shadow-2xl items-center">
        <div className="flex-1 relative w-full group">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Pesquisar por nome do projeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background/50 border border-border/40 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-64 group">
            <Filter className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-background/50 border border-border/40 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm appearance-none"
            >
              <option value="all">Filtro: Todos</option>
              <option value="active">Status: Em Execução</option>
              <option value="completed">Status: Concluído</option>
              <option value="on_hold">Status: Em Pausa</option>
              <option value="cancelled">Status: Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {loading && projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="w-12 h-12 rounded-2xl border-4 border-primary/20 border-t-primary animate-spin shadow-xl"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
            Carregando Projetos
          </p>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-8 text-center animate-in zoom-in-95">
          <p className="text-destructive font-bold">{error}</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-panel border border-border/20 border-dashed rounded-[3rem] p-24 text-center flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8">
          <div className="w-24 h-24 bg-muted/40 rounded-full flex items-center justify-center shadow-inner">
            <Briefcase className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-foreground">
              Vazio estratégico detectado
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm font-medium">
              Sua organização ainda não iniciou ciclos de auditoria ou nenhum
              projeto corresponde aos filtros atuais.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => {
                setEditingProject(null);
                setIsFormOpen(true);
              }}
              className="mt-4 flex items-center gap-3 px-8 py-3.5 bg-muted hover:bg-muted/80 text-foreground rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest border border-border/40 shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Inicializar Primeiro Projeto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProjects.map((project, idx) => (
            <div
              key={project.id}
              className="group relative flex flex-col bg-background/40 glass-panel border border-border/20 rounded-[2.5rem] p-7 hover:border-primary/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-8">
                <div
                  className={`px-4 py-1.5 rounded-xl border text-[10px] font-black tracking-[0.1em] uppercase shadow-sm ${getStatusColor(project.status)}`}
                >
                  {getStatusText(project.status)}
                </div>

                {canManage && (
                  <div className="flex items-center gap-2 lg:opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingProject(project);
                        setIsFormOpen(true);
                      }}
                      className="p-2.5 text-muted-foreground hover:text-primary bg-muted/20 rounded-xl hover:bg-background transition-all border border-border/20 shadow-sm"
                      title="Editar Configurações"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(project.id);
                      }}
                      className="p-2.5 text-muted-foreground hover:text-destructive bg-muted/20 rounded-xl hover:bg-background transition-all border border-border/20 shadow-sm"
                      title="Arquivar Projeto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <Link
                to={`/projects/${project.id}`}
                className="flex-1 flex flex-col group/link"
              >
                <div className="flex items-center justify-between group/title mb-3">
                  <h3
                    className="text-2xl font-black text-foreground tracking-tight leading-tight group-hover/link:text-primary transition-colors"
                    title={project.name}
                  >
                    {project.name}
                  </h3>
                  <ArrowUpRight className="w-6 h-6 text-primary opacity-0 group-hover/link:opacity-100 transition-all group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
                </div>

                <p className="text-muted-foreground text-sm font-medium leading-relaxed line-clamp-3 mb-8">
                  {project.description ||
                    "Este projeto ainda não possui uma descrição estratégica definida."}
                </p>

                <div className="mt-auto space-y-4 pt-6 border-t border-border/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-[11px] uppercase tracking-wider">
                      <Calendar className="w-4 h-4 text-primary/40" />
                      {project.end_date
                        ? new Date(project.end_date).toLocaleDateString(
                            "pt-BR",
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : "Sem Prazo"}
                    </div>

                    <Link
                      to={`/projects/${project.id}?tab=equipe`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-[11px] uppercase tracking-wider transition-all"
                    >
                      <Users className="w-4 h-4 text-primary/40" />
                      Gestão Equipe
                    </Link>
                  </div>

                  {/* Progress visualization (mocking a bit since the schema might vary, but for aesthetics) */}
                  <div className="relative w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-primary rounded-full"
                      style={{
                        width: project.status === "completed" ? "100%" : "45%",
                      }}
                    />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <ProjectFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProject(null);
        }}
        onSubmit={editingProject ? handleUpdate : handleCreate}
        initialData={editingProject}
      />

      <div className="py-12 flex flex-col items-center gap-4 opacity-30 mt-12">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          Portfolio de Governança 2026
        </p>
      </div>
    </div>
  );
}
