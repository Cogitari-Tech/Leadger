import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";

type ResourceType = "audit" | "github";

interface LinkResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (resourceId: string, type: ResourceType) => Promise<void>;
  type: ResourceType;
}

interface AvailableResource {
  id: string;
  name: string;
  details?: string;
}

export function LinkResourceModal({
  isOpen,
  onClose,
  onLink,
  type,
}: LinkResourceModalProps) {
  const { tenant } = useAuth();
  const [availableResources, setAvailableResources] = useState<
    AvailableResource[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string>("");

  useEffect(() => {
    if (isOpen && tenant) {
      loadAvailableResources();
      setSelectedResourceId(""); // reset
    }
  }, [isOpen, tenant, type]);

  const loadAvailableResources = async () => {
    setLoading(true);
    try {
      if (type === "audit") {
        const { data, error } = await supabase
          .from("audit_programs")
          .select("id, name, status")
          .eq("tenant_id", tenant?.id)
          .is("project_id", null); // fetch only unlinked ones

        if (error) throw error;
        setAvailableResources(
          data.map((d) => ({
            id: d.id,
            name: d.name,
            details: d.status,
          })),
        );
      } else if (type === "github") {
        const { data, error } = await supabase
          .from("github_repositories")
          .select("id, full_name, name")
          .eq("tenant_id", tenant?.id)
          .is("project_id", null);

        if (error) throw error;
        setAvailableResources(
          data.map((d) => ({
            id: d.id,
            name: d.full_name,
          })),
        );
      }
    } catch (err) {
      console.error("Error loading resources to link:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResourceId) return;

    setSubmitting(true);
    await onLink(selectedResourceId, type);
    setSubmitting(false);
    onClose();
  };

  const filteredList = availableResources.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const title =
    type === "audit" ? "Vincular Auditoria" : "Vincular Repositório";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border/40 rounded-xl p-6 w-full max-w-lg shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-foreground mb-6">{title}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Buscar{" "}
              {type === "audit" ? "Programa de Auditoria" : "Repositório"}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-muted/40 border border-border/60 rounded-lg pl-9 pr-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="border border-border/60 rounded-lg max-h-48 overflow-y-auto bg-muted/40 shadow-inner">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Carregando...
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Nenhum recurso disponível.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {filteredList.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center p-3 cursor-pointer hover:bg-muted/60 transition-colors ${
                      selectedResourceId === r.id ? "bg-cyan-500/10" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="resource"
                      value={r.id}
                      checked={selectedResourceId === r.id}
                      onChange={() => setSelectedResourceId(r.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${
                        selectedResourceId === r.id
                          ? "border-cyan-500"
                          : "border-border/60"
                      }`}
                    >
                      {selectedResourceId === r.id && (
                        <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {r.name}
                      </div>
                      {r.details && (
                        <div className="text-xs text-muted-foreground uppercase">
                          {r.details}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-medium rounded-lg hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedResourceId}
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Vinculando..." : "Vincular"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
