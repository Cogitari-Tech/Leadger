import { useState, useEffect, type FormEvent } from "react";
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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    setName(tenant.name);
    setSlug(tenant.slug);
    setDomain(tenant.domain ?? "");
    setLogoUrl(tenant.logo_url ?? "");
  }, [tenant]);

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
            <h1 className="text-3xl font-black tracking-tight text-foreground font-display flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              Configurações da Organização
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Gerencie a identidade visual, domínio e preferências globais da
              sua conta corporativa.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="glass-panel rounded-[2.5rem] p-8 md:p-10 space-y-10 border border-border/20 shadow-2xl relative overflow-hidden group/form transition-all"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 opacity-40" />

          <div className="flex flex-col md:flex-row items-center gap-6 pb-10 border-b border-border/40">
            <div className="h-24 w-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner group transition-transform hover:scale-105 duration-500 relative">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={name}
                  className="h-20 w-20 rounded-2xl object-cover shadow-2xl"
                />
              ) : (
                <Building2 className="h-10 w-10 text-primary" />
              )}
              <div className="absolute -bottom-1 -right-1 bg-background border border-border/40 rounded-full p-1.5 shadow-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black text-foreground">
                {name || "Sua Empresa"}
              </h2>
              <div className="flex items-center gap-3 mt-1 justify-center md:justify-start">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  Sincronizado
                </span>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  Plano:{" "}
                  <span className="text-foreground">
                    {tenant?.plan ?? "free"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">
                Nome de Exibição
              </label>
              <div className="relative group/input">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nome Fantasia"
                  className="w-full rounded-2xl border border-border/40 bg-background/50 px-5 py-4 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2 opacity-80">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">
                Identificador (Slug)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={slug}
                  disabled
                  className="w-full rounded-2xl border border-border/20 bg-muted/20 px-5 py-4 text-sm font-bold text-muted-foreground cursor-not-allowed italic"
                />
                <Link2 className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
              </div>
              <p className="px-2 text-[10px] text-muted-foreground font-medium">
                O identificador é imutável para segurança das rotas.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">
                Domínio Corporativo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="empresa.com.br"
                  className="w-full rounded-2xl border border-border/40 bg-background/50 px-5 py-4 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
                <Globe className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-2">
                Logotipo Externo (URL)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://sua-cdn.com/logo.png"
                  className="w-full rounded-2xl border border-border/40 bg-background/50 px-5 py-4 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                />
                <FileText className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/40">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                Acesso de administrador detectado
              </p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              {saved && (
                <span className="text-sm text-emerald-500 font-black animate-in fade-in slide-in-from-right-2">
                  ✓ Alterações Aplicadas
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 w-full md:w-auto"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Processando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Security Settings Section */}
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
        <div className="space-y-1 px-4">
          <h2 className="text-2xl font-black text-foreground font-display flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" /> Segurança de Acesso
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Reforce o controle de acesso com autenticação multifator (MFA).
          </p>
        </div>
        <div className="glass-panel rounded-[2.5rem] border border-border/20 shadow-xl overflow-hidden">
          <TwoFactorSetup />
        </div>
      </div>

      {/* GitHub Integration Section */}
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
        <div className="space-y-1 px-4">
          <h2 className="text-2xl font-black text-foreground font-display flex items-center gap-3">
            <Github className="w-7 h-7" /> Integração com Ecossistema
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Sincronize repositórios e registros de atividades externas.
          </p>
        </div>
        <div className="glass-panel rounded-[2.5rem] border border-border/20 shadow-xl overflow-hidden">
          <GitHubConnect />
        </div>
      </div>

      {/* Legal Documentation Section */}
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
        <div className="space-y-1 px-4">
          <h2 className="text-2xl font-black text-foreground font-display flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" /> Governança e
            Transparência
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Termos de uso, privacidade e avisos legais da plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
          {[
            {
              to: "/termos",
              label: "Termos de Uso",
              desc: "Condições e permissões de uso do sistema.",
              color: "primary",
            },
            {
              to: "/privacidade",
              label: "Proteção de Dados (LGPD)",
              desc: "Políticas de privacidade e logs seguros.",
              color: "emerald",
            },
            {
              to: "/disclaimer",
              label: "Limitação de Uso",
              desc: "Isenções legais e avisos preditivos.",
              color: "amber",
            },
          ].map((doc) => (
            <Link
              key={doc.to}
              to={doc.to}
              target="_blank"
              className="group relative flex flex-col p-8 rounded-[2rem] border border-border/40 bg-background/50 hover:bg-background hover:border-primary/40 hover:shadow-2xl transition-all duration-500 glass-panel"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-lg font-black text-foreground group-hover:text-primary transition-colors pr-4 leading-tight">
                  {doc.label}
                </span>
                <ExternalLink className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-all group-hover:translate-x-1 group-hover:-translate-y-1 duration-300" />
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {doc.desc}
              </p>
              <div className="mt-8 flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Acessar agora
                </span>
                <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 duration-500" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="py-12 flex flex-col items-center gap-4 opacity-40">
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          Cogitari Security Protocol 2026
        </p>
      </div>
    </div>
  );
}
