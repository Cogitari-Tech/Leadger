import { useState, useEffect, useRef, type FormEvent } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import {
  Building2,
  Save,
  Loader2,
  Shield,
  Github,
  FileText,
  ExternalLink,
  ChevronRight,
  Globe,
  Link2,
  Camera,
} from "lucide-react";

import { Link } from "react-router-dom";
import { TwoFactorSetup } from "../../auth/components/TwoFactorSetup";
import { GitHubConnect } from "../../github/components/GitHubConnect";

export function TenantSettings() {
  const { tenant } = useAuth();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [domain, setDomain] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!tenant) return;
    setName(tenant.name);
    setSlug(tenant.slug);
    setDomain(tenant.domain ?? "");
    setLogoUrl(tenant.logo_url ?? "");
  }, [tenant]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tenant) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `tenant-logos/${tenant.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("audit-evidences")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("audit-evidences").getPublicUrl(path);

      setLogoUrl(publicUrl);
    } catch (err: any) {
      console.error("Logo upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setSaving(true);
    setSaved(false);

    await supabase
      .from("tenants")
      .update({
        name,
        domain: domain || null,
        logo_url: logoUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenant.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-foreground font-display flex items-center gap-4">
              <Building2 className="w-10 h-10 text-primary" />
              Gestão Organizacional
            </h1>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">
              Identidade visual, governança e parâmetros globais
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="glass-panel rounded-[3rem] p-8 md:p-12 space-y-12 border border-border/40 shadow-2xl relative overflow-hidden group/form transition-all"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 opacity-40 group-hover/form:opacity-100 transition-opacity" />

          <div className="flex flex-col md:flex-row items-center gap-8 pb-12 border-b border-border/40">
            <div className="relative group/logo">
              <div className="h-32 w-32 rounded-[2.5rem] bg-background/50 border border-border/60 flex items-center justify-center shadow-inner overflow-hidden group-hover/logo:scale-105 transition-all duration-500 relative ring-8 ring-primary/5">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={name}
                    className="h-28 w-28 rounded-3xl object-cover shadow-2xl"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-primary/40" />
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-all duration-300 disabled:cursor-not-allowed backdrop-blur-sm"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div className="absolute -bottom-2 -right-2 bg-background border border-border/40 rounded-full p-2 shadow-xl ring-4 ring-background">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              </div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tight">
                {name || "Sua Empresa"}
              </h2>
              <div className="flex items-center gap-4 mt-2 justify-center md:justify-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                  Ambiente Seguro
                </span>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">
                  Business Plan:{" "}
                  <span className="text-foreground opacity-100">
                    {tenant?.plan ?? "Enterprise"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-2">
                Razão Social / Nome Fantasia
              </label>
              <div className="relative group/input">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nome da Organização"
                  className="w-full rounded-2xl border border-border/40 bg-background/50 px-6 py-5 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm group-hover/input:border-primary/40"
                />
              </div>
            </div>

            <div className="space-y-3 opacity-60 focus-within:opacity-100 transition-opacity">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-2">
                Identificador da Instância (Slug)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={slug}
                  disabled
                  className="w-full rounded-2xl border border-border/20 bg-muted/20 px-6 py-5 text-sm font-bold text-muted-foreground cursor-not-allowed italic"
                />
                <Link2 className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20" />
              </div>
              <p className="px-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">
                Imutável para integridade de dados.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-2">
                Domínio Autorizado
              </label>
              <div className="relative group/input">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="empresa.com.br"
                  className="w-full rounded-2xl border border-border/40 bg-background/50 px-6 py-5 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm group-hover/input:border-primary/40"
                />
                <Globe className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20 group-hover/input:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-2">
                Logotipo Remoto (CDN)
              </label>
              <div className="relative group/input">
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://cdn.empresa.com/logo.png"
                  className="w-full rounded-2xl border border-border/40 bg-background/50 px-6 py-5 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm group-hover/input:border-primary/40"
                />
                <FileText className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20 group-hover/input:text-primary transition-colors" />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-pulse ring-4 ring-primary/5" />
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">
                Privilégios de Administrador Master
              </p>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto">
              {saved && (
                <span className="text-[10px] text-primary font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
                  ✓ Sincronizado com Sucesso
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-4 rounded-2xl bg-primary px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 w-full md:w-auto ring-4 ring-primary/5"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {saving ? "Salvando..." : "Aplicar Alterações"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Security & System Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security Settings Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="space-y-1 px-4">
            <h2 className="text-3xl font-black text-foreground font-display flex items-center gap-4">
              <Shield className="w-8 h-8 text-primary" /> Multi-fator
            </h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
              Controle de acesso e redundância de proteção
            </p>
          </div>
          <div className="glass-panel rounded-[2.5rem] border border-border/40 shadow-xl overflow-hidden min-h-[400px]">
            <TwoFactorSetup />
          </div>
        </div>

        {/* GitHub Integration Section */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
          <div className="space-y-1 px-4">
            <h2 className="text-3xl font-black text-foreground font-display flex items-center gap-4">
              <Github className="w-9 h-9" /> Ecossistema
            </h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
              Integração nativa com Cloud Provider e Repos
            </p>
          </div>
          <div className="glass-panel rounded-[2.5rem] border border-border/40 shadow-xl overflow-hidden min-h-[400px]">
            <GitHubConnect />
          </div>
        </div>
      </div>

      {/* Legal Documentation Section */}
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-600">
        <div className="space-y-1 px-4 text-center">
          <h2 className="text-3xl font-black text-foreground font-display flex items-center justify-center gap-4">
            <FileText className="w-8 h-8 text-primary" /> Conformidade e
            Governança
          </h2>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
            Base legal e diretrizes de privacidade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
          {[
            {
              to: "/termos",
              label: "Termos de Uso",
              desc: "Parâmetros e permissões de utilização da licença corporativa.",
              color: "primary",
            },
            {
              to: "/privacidade",
              label: "Proteção LGPD",
              desc: "Tratamento de dados sensíveis e auditoria de logs criptografados.",
              color: "emerald",
            },
            {
              to: "/disclaimer",
              label: "Limites Legais",
              desc: "Isenções, responsabilidades e avisos de segurança preditiva.",
              color: "amber",
            },
          ].map((doc) => (
            <Link
              key={doc.to}
              to={doc.to}
              target="_blank"
              className="group relative flex flex-col p-10 rounded-[2.5rem] border border-border/40 bg-background/30 hover:bg-background/50 hover:border-primary/40 hover:shadow-2xl transition-all duration-500 glass-panel"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-xl font-black text-foreground group-hover:text-primary transition-colors pr-6 leading-tight">
                  {doc.label}
                </span>
                <ExternalLink className="w-6 h-6 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1 group-hover:-translate-y-1 duration-300" />
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed opacity-80">
                {doc.desc}
              </p>
              <div className="mt-10 flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-0 group-hover:opacity-100 transition-all duration-500">
                  Visualizar Documento
                </span>
                <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 duration-500" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="py-16 flex flex-col items-center gap-6 opacity-30">
        <div className="h-px w-48 bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="text-[11px] font-black uppercase tracking-[0.6em] text-muted-foreground">
          Leadgers Cyber-Intelligence Protocol 2026
        </p>
      </div>
    </div>
  );
}
