import { useState, useEffect } from "react";
import { Project, ProjectFormData } from "../types/project.types";
import { X } from "lucide-react";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  initialData?: Project;
}

export function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ProjectFormModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    status: "active",
    start_date: "",
    end_date: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || "",
        status: initialData.status,
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        status: "active",
        start_date: "",
        end_date: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(formData);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border/40 rounded-xl p-6 w-full max-w-lg shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-6">
          {initialData ? "Editar Projeto" : "Novo Projeto"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Nome do Projeto
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-muted/40 border border-border/60 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="Ex: Auditoria Q3 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Project["status"],
                })
              }
              className="w-full bg-muted/40 border border-border/60 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            >
              <option value="active">Em Andamento</option>
              <option value="on_hold">Pausado</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Data de Início
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full bg-muted/40 border border-border/60 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:[color-scheme:dark] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Data de Término (Prevista)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="w-full bg-muted/40 border border-border/60 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:[color-scheme:dark] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full bg-muted/40 border border-border/60 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none transition-colors"
              placeholder="Descreva o escopo e os objetivos do projeto..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium border border-transparent hover:bg-muted rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.name.trim()}
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Salvando..."
                : initialData
                  ? "Atualizar"
                  : "Criar Projeto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
