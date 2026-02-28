import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";

interface AssignMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (memberId: string, role: string) => Promise<void>;
  currentMemberIds: string[];
}

interface AvailableMember {
  id: string; // tenant_member id
  user: {
    email: string;
    raw_user_meta_data?: { name?: string };
  };
  role: {
    name: string;
    display_name: string;
  };
}

export function AssignMemberModal({
  isOpen,
  onClose,
  onAssign,
  currentMemberIds,
}: AssignMemberModalProps) {
  const { tenant } = useAuth();
  const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Selected state
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [selectedProjectRole, setSelectedProjectRole] =
    useState<string>("member");

  useEffect(() => {
    if (isOpen && tenant) {
      loadAvailableMembers();
    }
  }, [isOpen, tenant]);

  const loadAvailableMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tenant_members")
        .select(
          `
          id,
          role:roles(name, display_name),
          user:users!tenant_members_user_id_fkey(
            email,
            raw_user_meta_data
          )
        `,
        )
        .eq("tenant_id", tenant?.id)
        .eq("status", "active");

      if (error) throw error;

      // Filter out members already in the project
      const filtered = (data as unknown as AvailableMember[]).filter(
        (m) => !currentMemberIds.includes(m.id),
      );

      setAvailableMembers(filtered);
    } catch (err) {
      console.error("Error loading members to assign:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    setSubmitting(true);
    await onAssign(selectedMemberId, selectedProjectRole);
    setSubmitting(false);
    onClose();
  };

  const filteredList = availableMembers.filter((m) => {
    const name = m.user?.raw_user_meta_data?.name || m.user?.email || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
          Atribuir Membro
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Buscar Membro
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Nome ou e-mail..."
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
                Nenhum membro disponível encontrado.
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {filteredList.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center p-3 cursor-pointer hover:bg-muted/60 transition-colors ${
                      selectedMemberId === m.id ? "bg-cyan-500/10" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="member"
                      value={m.id}
                      checked={selectedMemberId === m.id}
                      onChange={() => setSelectedMemberId(m.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${
                        selectedMemberId === m.id
                          ? "border-cyan-500"
                          : "border-border/60"
                      }`}
                    >
                      {selectedMemberId === m.id && (
                        <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {m.user?.raw_user_meta_data?.name || "Sem Nome"}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {m.user?.email}
                        <span className="px-1.5 py-0.5 rounded bg-background border border-border/40 text-[10px]">
                          {m.role?.display_name || "Membro"}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Papel no Projeto
            </label>
            <select
              value={selectedProjectRole}
              onChange={(e) => setSelectedProjectRole(e.target.value)}
              className="w-full bg-muted/40 border border-border/60 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            >
              <option value="lead">Líder do Projeto</option>
              <option value="member">Membro</option>
              <option value="reviewer">Revisor</option>
              <option value="observer">Observador</option>
            </select>
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
              disabled={submitting || !selectedMemberId}
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Atribuindo..." : "Atribuir"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
