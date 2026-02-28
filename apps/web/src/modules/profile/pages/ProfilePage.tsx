import { useState, useRef } from "react";
import {
  User,
  Mail,
  Shield,
  Building2,
  FolderOpen,
  Camera,
  KeyRound,
  Smartphone,
  CheckCircle2,
  Save,
  MailPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    profile,
    loading,
    saving,
    updateName,
    updateAvatar,
    updateSecondaryEmail,
    requestPasswordReset,
  } = useProfile();

  const [nameInput, setNameInput] = useState("");
  const [nameEditing, setNameEditing] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [secondaryEmailInput, setSecondaryEmailInput] = useState("");
  const [secondaryEmailEditing, setSecondaryEmailEditing] = useState(false);
  const [secondaryEmailSaved, setSecondaryEmailSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar os dados do perfil.
        </p>
      </div>
    );
  }

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await updateName(nameInput.trim());
    setNameEditing(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await updateAvatar(file);
  };

  const handlePasswordReset = async () => {
    await requestPasswordReset();
    setPasswordResetSent(true);
    setTimeout(() => setPasswordResetSent(false), 5000);
  };

  const handleSaveSecondaryEmail = async () => {
    if (!secondaryEmailInput.trim()) return;
    await updateSecondaryEmail(secondaryEmailInput.trim());
    setSecondaryEmailEditing(false);
    setSecondaryEmailSaved(true);
    setTimeout(() => setSecondaryEmailSaved(false), 3000);
  };

  const activeProjects = profile.projects.filter((p) => p.status === "active");
  const inactiveProjects = profile.projects.filter(
    (p) => p.status !== "active",
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie suas informações pessoais e segurança
        </p>
      </div>

      {/* Avatar & Name Card */}
      <div className="glass-card soft-shadow rounded-2xl p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-primary/40" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Name & Email */}
          <div className="flex-1">
            {nameEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm bg-muted/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setNameEditing(false);
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setNameInput(profile.fullName);
                  setNameEditing(true);
                }}
                className="text-lg font-bold text-foreground hover:text-primary transition-colors text-left"
              >
                {profile.fullName || "Sem nome definido"}
              </button>
            )}
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" />
              {profile.email}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <Shield className="w-3 h-3" />
                {profile.roleName}
              </span>
              {profile.emailConfirmedAt && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500">
                  <CheckCircle2 className="w-3 h-3" />
                  E-mail verificado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Info */}
      <div className="glass-card soft-shadow rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Organização
          </h2>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">{profile.tenantName}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Tenant ativo
          </span>
        </div>
      </div>

      {/* Connected Projects */}
      <div className="glass-card soft-shadow rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Projetos Conectados
          </h2>
        </div>

        {profile.projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum projeto conectado.
          </p>
        ) : (
          <div className="space-y-4">
            {activeProjects.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Ativos
                </p>
                <div className="space-y-2">
                  {activeProjects.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <span className="text-sm text-foreground">{p.name}</span>
                      <span className="text-[10px] text-emerald-500 font-medium capitalize">
                        {p.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {inactiveProjects.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Inativos
                </p>
                <div className="space-y-2">
                  {inactiveProjects.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/20 opacity-60"
                    >
                      <span className="text-sm text-foreground">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="glass-card soft-shadow rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Segurança
          </h2>
        </div>
        <div className="space-y-4">
          {/* Password */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Alterar Senha</p>
              <p className="text-[10px] text-muted-foreground">
                Enviar link de redefinição por e-mail
              </p>
            </div>
            <button
              onClick={handlePasswordReset}
              disabled={passwordResetSent}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
                passwordResetSent
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-muted/50 text-foreground hover:bg-muted"
              }`}
            >
              {passwordResetSent ? "Link enviado ✓" : "Enviar link"}
            </button>
          </div>

          {/* MFA */}
          <div className="flex items-center justify-between border-t border-border/20 pt-4">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-foreground">
                  Autenticação em Duas Etapas
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {profile.mfaEnabled
                    ? "Ativo — protegido com autenticador"
                    : "Inativo — recomendado ativar"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile.mfaEnabled ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Ativado
                </span>
              ) : (
                <button
                  onClick={() => navigate("/auth/mfa-setup")}
                  className="px-4 py-2 text-xs font-medium rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Configurar
                </button>
              )}
            </div>
          </div>

          {/* Secondary Recovery Email */}
          <div className="flex items-center justify-between border-t border-border/20 pt-4">
            <div className="flex items-center gap-3">
              <MailPlus className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  E-mail de Recuperação Secundário
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {profile.secondaryEmail || "Não configurado"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {secondaryEmailEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="email"
                    value={secondaryEmailInput}
                    onChange={(e) => setSecondaryEmailInput(e.target.value)}
                    placeholder="backup@email.com"
                    className="w-48 px-2 py-1.5 text-xs bg-muted/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveSecondaryEmail();
                      if (e.key === "Escape") setSecondaryEmailEditing(false);
                    }}
                  />
                  <button
                    onClick={handleSaveSecondaryEmail}
                    disabled={saving}
                    className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : secondaryEmailSaved ? (
                <span className="text-[10px] text-emerald-500 font-medium">
                  Salvo ✓
                </span>
              ) : (
                <button
                  onClick={() => {
                    setSecondaryEmailInput(profile.secondaryEmail || "");
                    setSecondaryEmailEditing(true);
                  }}
                  className="px-4 py-2 text-xs font-medium rounded-xl bg-muted/50 text-foreground hover:bg-muted transition-colors"
                >
                  {profile.secondaryEmail ? "Alterar" : "Adicionar"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
