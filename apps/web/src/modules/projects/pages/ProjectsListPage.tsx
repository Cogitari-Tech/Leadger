import { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  Users,
  Edit2,
  Trash2,
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
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "on_hold":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Em Andamento";
      case "completed":
        return "Concluído";
      case "on_hold":
        return "Pausado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Projetos</h1>
          <p className="text-slate-400">
            Gerencie os projetos e auditorias da sua organização.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditingProject(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all font-medium shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-5 h-5" />
            Novo Projeto
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        >
          <option value="all">Todos os status</option>
          <option value="active">Em Andamento</option>
          <option value="completed">Concluídos</option>
          <option value="on_hold">Pausados</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>

      {loading && projects.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Nenhum projeto encontrado
          </h3>
          <p className="text-slate-400 max-w-sm mb-6">
            Você ainda não tem projetos criados ou nenhum correspondeu aos
            filtros aplicados.
          </p>
          {canManage && (
            <button
              onClick={() => {
                setEditingProject(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Criar Primeiro Projeto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition-colors group flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(project.status)}`}
                >
                  {getStatusText(project.status)}
                </div>

                {canManage && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingProject(project);
                        setIsFormOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 bg-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(project.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <Link
                to={`/projects/${project.id}`}
                className="block flex-1 group-hover:opacity-80 transition-opacity"
              >
                <h3
                  className="text-lg font-bold text-white mb-2 line-clamp-1"
                  title={project.name}
                >
                  {project.name}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-6 min-h-[40px]">
                  {project.description || "Sem descrição disponível."}
                </p>
              </Link>

              <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between text-sm text-slate-500">
                <div
                  className="flex items-center gap-1.5"
                  title="Previsão de término"
                >
                  <Calendar className="w-4 h-4" />
                  {project.end_date
                    ? new Date(project.end_date).toLocaleDateString("pt-BR")
                    : "Sem prazo"}
                </div>

                <Link
                  to={`/projects/${project.id}?tab=equipe`}
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  Equipe
                </Link>
              </div>
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
    </div>
  );
}
