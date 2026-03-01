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
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="text-brand-500" /> Configurações da Empresa
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerencie as informações da sua organização
          </p>
        </div>

        <form onSubmit={handleSave} className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="h-14 w-14 rounded-2xl bg-brand-500/10 flex items-center justify-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <Building2 className="h-7 w-7 text-brand-500" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                {name || "Sua Empresa"}
              </h2>
              <p className="text-xs text-slate-500">
                Plano:{" "}
                <span className="font-medium capitalize">
                  {tenant?.plan ?? "free"}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nome da empresa
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-slate-400">
                O slug não pode ser alterado
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Domínio corporativo
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="empresa.com.br"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                URL do Logo
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            {saved && (
              <span className="text-sm text-emerald-500 font-medium">
                ✓ Salvo com sucesso
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-600 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>

      {/* Security Settings Section */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="text-brand-500" /> Segurança Pessoal
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerencie as configurações de segurança da sua conta individual
          </p>
        </div>
        <TwoFactorSetup />
      </div>

      {/* GitHub Integration Section */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Github className="text-slate-900 dark:text-white" /> Integrações de
            Segurança
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Vincule plataformas externas para automação e rastreio.
          </p>
        </div>
        <GitHubConnect />
      </div>

      {/* Legal Documentation Section */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="text-slate-900 dark:text-white" /> Documentação
            Legal
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consulte nossos avisos legais, termos e políticas de governança
            ativas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/termos"
            target="_blank"
            className="group flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-brand-500/50 transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                Termos de Uso
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">
              Regras, restrições e condições de uso da plataforma Cogitari.
            </p>
          </Link>

          <Link
            to="/privacidade"
            target="_blank"
            className="group flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-brand-500/50 transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                Privacidade (LGPD)
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">
              Nossa política de proteção de dados, segurança cibernética e logs.
            </p>
          </Link>

          <Link
            to="/disclaimer"
            target="_blank"
            className="group flex flex-col p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-brand-500/50 transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                Aviso Legal
              </span>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">
              Limitações de responsabilidade e natureza preditiva dos
              algoritmos.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
