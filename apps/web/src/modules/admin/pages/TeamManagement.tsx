import { useState } from "react";
import { useTeamManagement } from "../hooks/useTeamManagement";
import { useAuth } from "../../auth/context/AuthContext";
import {
  UserPlus,
  Shield,
  Search,
  X,
  Users,
  Link2,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Loader2,
  MoreVertical,
  Trash2,
  Ban,
  RotateCcw,
} from "lucide-react";

type ActiveTab = "members" | "requests" | "links";

export function TeamManagement() {
  const { user } = useAuth();
  const {
    members,
    roles,
    accessRequests,
    inviteLinks,
    loading,
    error,
    approveRequest,
    rejectRequest,
    generateInviteLink,
    revokeInviteLink,
    changeMemberRole,
    removeMember,
    suspendMember,
    reactivateMember,
  } = useTeamManagement();

  const [activeTab, setActiveTab] = useState<ActiveTab>("members");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMemberId, setActionMemberId] = useState<string | null>(null);

  // Invite link creation
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [linkRoleId, setLinkRoleId] = useState("");
  const [linkMaxUses, setLinkMaxUses] = useState(1);
  const [linkExpiresDays, setLinkExpiresDays] = useState(7);
  const [linkLabel, setLinkLabel] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Approve request
  const [approveRoleId, setApproveRoleId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const currentUserRole = user?.role;
  const canManageTeam =
    currentUserRole?.name === "owner" || currentUserRole?.name === "admin";

  const getRoleBadgeColor = (roleName: string) => {
    const map: Record<string, string> = {
      owner: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
      admin: "bg-rose-500/20 text-rose-600 dark:text-rose-400",
      manager: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
      auditor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      analyst: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
      viewer: "bg-zinc-500/20 text-zinc-600 dark:text-zinc-400",
    };
    return map[roleName] ?? "bg-muted text-muted-foreground";
  };

  const handleGenerateLink = async () => {
    if (!linkRoleId) return;
    setGenerating(true);
    const url = await generateInviteLink(
      linkRoleId,
      linkMaxUses,
      linkExpiresDays,
      linkLabel || undefined,
    );
    if (url) setGeneratedLink(url);
    setGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleApprove = async (requestId: string, roleId: string) => {
    setApprovingId(requestId);
    await approveRequest(requestId, roleId);
    setApprovingId(null);
    setApproveRoleId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const tabs: {
    key: ActiveTab;
    label: string;
    icon: typeof Users;
    count?: number;
  }[] = [
    { key: "members", label: "Membros", icon: Users, count: members.length },
    {
      key: "requests",
      label: "Solicitações",
      icon: Clock,
      count: accessRequests.length,
    },
    {
      key: "links",
      label: "Links de Convite",
      icon: Link2,
      count: inviteLinks.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display">
            Equipe
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie membros, solicitações de acesso e links de convite.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-xl text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
              activeTab === tab.key
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "bg-foreground/5 text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════ TAB: Members ═══════════ */}
      {activeTab === "members" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar membro..."
              className="w-full pl-11 pr-4 py-3 text-sm bg-background/50 border border-border/40 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none rounded-xl"
            />
          </div>

          <div className="space-y-2">
            {members
              .filter(
                (m) =>
                  !searchTerm ||
                  m.user_id.includes(searchTerm.toLowerCase()) ||
                  m.role?.display_name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()),
              )
              .map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-background/50 border border-border/20 rounded-xl hover:border-border/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {member.user_id.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {member.user_id.slice(0, 8)}...
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getRoleBadgeColor(
                            member.role?.name || "",
                          )}`}
                        >
                          {member.role?.display_name || "Sem cargo"}
                        </span>
                        {member.status === "suspended" && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                            Suspenso
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {canManageTeam && member.user_id !== user?.id && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMemberId(
                            actionMemberId === member.id ? null : member.id,
                          )
                        }
                        className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {actionMemberId === member.id && (
                        <div className="absolute right-0 top-full mt-1 w-56 bg-background border border-border/40 rounded-xl shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-1">
                          {/* Role change */}
                          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                            Alterar Cargo
                          </div>
                          {roles
                            .filter(
                              (r) =>
                                r.name !== "owner" && r.id !== member.role_id,
                            )
                            .map((role) => (
                              <button
                                key={role.id}
                                onClick={async () => {
                                  await changeMemberRole(member.id, role.id);
                                  setActionMemberId(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2"
                              >
                                <Shield className="w-3.5 h-3.5" />
                                {role.display_name}
                              </button>
                            ))}
                          <div className="h-px bg-border/20 my-1" />
                          {member.status === "active" ? (
                            <button
                              onClick={async () => {
                                await suspendMember(member.id);
                                setActionMemberId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 text-amber-500"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Suspender
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                await reactivateMember(member.id);
                                setActionMemberId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 text-emerald-500"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Reativar
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (
                                confirm(
                                  "Tem certeza que deseja remover este membro?",
                                )
                              ) {
                                await removeMember(member.id);
                              }
                              setActionMemberId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2 text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remover
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

            {members.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Nenhum membro encontrado.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ TAB: Access Requests ═══════════ */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {accessRequests.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">
                Nenhuma solicitação pendente.
              </p>
            </div>
          ) : (
            accessRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 bg-background/50 border border-border/20 rounded-xl space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      {req.user_email || req.user_id.slice(0, 12) + "..."}
                    </p>
                    {req.message && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        "{req.message}"
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(req.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                    Pendente
                  </span>
                </div>

                {canManageTeam && (
                  <div className="flex items-center gap-3">
                    <select
                      value={approveRoleId || ""}
                      onChange={(e) => setApproveRoleId(e.target.value)}
                      className="flex-1 text-sm bg-background/50 border border-border/40 rounded-lg px-3 py-2 outline-none focus:border-primary"
                    >
                      <option value="">Selecione o cargo</option>
                      {roles
                        .filter((r) => r.name !== "owner")
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.display_name}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() =>
                        approveRoleId && handleApprove(req.id, approveRoleId)
                      }
                      disabled={!approveRoleId || approvingId === req.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                    >
                      {approvingId === req.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Aprovar
                    </button>
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══════════ TAB: Invite Links ═══════════ */}
      {activeTab === "links" && (
        <div className="space-y-4">
          {canManageTeam && (
            <>
              {!showCreateLink ? (
                <button
                  onClick={() => {
                    setShowCreateLink(true);
                    setGeneratedLink(null);
                    setLinkRoleId(
                      roles.find((r) => r.name === "auditor")?.id || "",
                    );
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:brightness-110 transition-all"
                >
                  <UserPlus className="w-4 h-4" /> Gerar Link de Convite
                </button>
              ) : (
                <div className="p-5 bg-background/50 border border-primary/20 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Novo Link de Convite</h3>
                    <button
                      onClick={() => {
                        setShowCreateLink(false);
                        setGeneratedLink(null);
                      }}
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Cargo
                      </label>
                      <select
                        value={linkRoleId}
                        onChange={(e) => setLinkRoleId(e.target.value)}
                        className="w-full text-sm bg-background/50 border border-border/40 rounded-lg px-3 py-2 outline-none focus:border-primary"
                      >
                        {roles
                          .filter((r) => r.name !== "owner")
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.display_name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Máximo de usos
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={linkMaxUses}
                        onChange={(e) => setLinkMaxUses(Number(e.target.value))}
                        className="w-full text-sm bg-background/50 border border-border/40 rounded-lg px-3 py-2 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Expira em (dias)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={linkExpiresDays}
                        onChange={(e) =>
                          setLinkExpiresDays(Number(e.target.value))
                        }
                        className="w-full text-sm bg-background/50 border border-border/40 rounded-lg px-3 py-2 outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Rótulo (opcional)
                      </label>
                      <input
                        type="text"
                        value={linkLabel}
                        onChange={(e) => setLinkLabel(e.target.value)}
                        placeholder="Ex: Novos auditores Q1"
                        className="w-full text-sm bg-background/50 border border-border/40 rounded-lg px-3 py-2 outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateLink}
                    disabled={generating || !linkRoleId}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    {generating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Link2 className="w-4 h-4" />
                    )}
                    Gerar Link
                  </button>

                  {generatedLink && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="flex-1 text-xs bg-transparent outline-none font-mono"
                      />
                      <button
                        onClick={() => copyToClipboard(generatedLink)}
                        className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                        title="Copiar link"
                      >
                        <Copy className="w-4 h-4 text-emerald-500" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Existing links */}
          {inviteLinks.length > 0 ? (
            <div className="space-y-2">
              {inviteLinks.map((link) => {
                const isExpired = new Date(link.expires_at) < new Date();
                const isUsedUp =
                  link.max_uses > 0 && link.current_uses >= link.max_uses;
                return (
                  <div
                    key={link.id}
                    className={`flex items-center justify-between p-4 border rounded-xl ${
                      isExpired || isUsedUp
                        ? "bg-muted/20 border-border/10 opacity-60"
                        : "bg-background/50 border-border/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Link2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {link.label || "Link sem rótulo"}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getRoleBadgeColor(
                              link.role?.name || "",
                            )}`}
                          >
                            {link.role?.display_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {link.current_uses}/{link.max_uses} usos
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Expira:{" "}
                            {new Date(link.expires_at).toLocaleDateString(
                              "pt-BR",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    {canManageTeam && !isExpired && !isUsedUp && (
                      <button
                        onClick={() => revokeInviteLink(link.id)}
                        className="text-sm text-destructive hover:text-destructive/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-destructive/10"
                      >
                        Revogar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            !showCreateLink && (
              <div className="text-center py-16 space-y-3">
                <Link2 className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Nenhum link de convite ativo.
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
