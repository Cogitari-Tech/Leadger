import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import { BankAccountForm } from "../../admin/components/BankAccountForm";
import type { BankAccount } from "../../auth/types/auth.types";
import {
  Building2,
  Users,
  Landmark,
  GitBranch,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  SkipForward,
} from "lucide-react";

type OnboardingStep = "company" | "invite" | "bank" | "integrations" | "done";

interface StepConfig {
  key: OnboardingStep;
  title: string;
  subtitle: string;
  icon: typeof Building2;
}

const STEPS: StepConfig[] = [
  {
    key: "company",
    title: "Dados da Empresa",
    subtitle: "Configure as informações básicas",
    icon: Building2,
  },
  {
    key: "invite",
    title: "Convidar Equipe",
    subtitle: "Adicione membros à organização",
    icon: Users,
  },
  {
    key: "bank",
    title: "Contas Bancárias",
    subtitle: "Cadastre contas para controle financeiro",
    icon: Landmark,
  },
  {
    key: "integrations",
    title: "Integrações",
    subtitle: "Conecte GitHub, Google e mais",
    icon: GitBranch,
  },
  {
    key: "done",
    title: "Pronto!",
    subtitle: "Sua empresa está configurada",
    icon: CheckCircle2,
  },
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { tenant } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Company data
  const [industry, setIndustry] = useState(tenant?.industry || "");
  const [phone, setPhone] = useState(tenant?.phone || "");
  const [companyEmail, setCompanyEmail] = useState(tenant?.email || "");
  const [cnpj, setCnpj] = useState((tenant?.cnpj as string) || "");

  // Bank accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const loadBankAccounts = useCallback(async () => {
    if (!tenant) return;
    const { data } = await supabase
      .from("bank_accounts")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("is_primary", { ascending: false });
    setBankAccounts((data as BankAccount[]) ?? []);
  }, [tenant]);

  useEffect(() => {
    loadBankAccounts();
  }, [loadBankAccounts]);

  const step = STEPS[currentStep];

  const inputClass =
    "w-full px-5 py-3 text-sm bg-background/50 border border-border/40 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all rounded-xl font-medium placeholder:opacity-40";
  const labelClass =
    "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 ml-1";

  const handleSaveCompany = async () => {
    if (!tenant) return;
    setSaving(true);
    await supabase
      .from("tenants")
      .update({
        industry: industry || null,
        phone: phone || null,
        email: companyEmail || null,
        cnpj: cnpj || null,
      })
      .eq("id", tenant.id);
    setSaving(false);
    setCurrentStep((s) => s + 1);
  };

  const handleFinish = async () => {
    if (!tenant) return;
    setSaving(true);
    await supabase
      .from("tenants")
      .update({ onboarding_completed: true })
      .eq("id", tenant.id);
    setSaving(false);
    navigate("/", { replace: true });
  };

  const canGoNext = () => {
    switch (step.key) {
      case "company":
        return true; // Fields are optional
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background decor */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
      </div>

      <div className="w-full max-w-2xl relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src="/images/logo-cogitari.png"
            alt="Cogitari"
            className="h-8 w-auto mx-auto block dark:hidden opacity-90"
          />
          <img
            src="/images/logo-cogitari-dark.png"
            alt="Cogitari"
            className="h-8 w-auto mx-auto hidden dark:block opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/logo-cogitari.png";
            }}
          />
          <p className="text-xs text-muted-foreground mt-4 uppercase tracking-widest font-bold">
            Configuração da Empresa
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex-1 flex items-center gap-2">
              <div
                className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                  i <= currentStep ? "bg-primary" : "bg-border/30"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step info */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <step.icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{step.title}</h2>
            <p className="text-sm text-muted-foreground">{step.subtitle}</p>
          </div>
          <div className="ml-auto text-xs text-muted-foreground font-mono">
            {currentStep + 1}/{STEPS.length}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-panel p-8 rounded-2xl soft-shadow border border-white/10 dark:border-white/5 min-h-[300px]">
          {/* ── Company ────────────────────── */}
          {step.key === "company" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Empresa:{" "}
                  <strong className="text-foreground">{tenant?.name}</strong>
                  {tenant?.slug && (
                    <span className="ml-2 font-mono text-primary">
                      ({tenant.slug})
                    </span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Setor / Indústria</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Ex: Tecnologia, Financeiro..."
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>CNPJ (opcional)</label>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Telefone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>E-mail da Empresa</label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Invite ─────────────────────── */}
          {step.key === "invite" && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Convide membros da equipe enviando links de convite. Você pode
                pular esta etapa e fazer isso depois em{" "}
                <strong>Administração → Equipe</strong>.
              </p>

              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-3">
                  <Users className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Gerencie convites em{" "}
                    <button
                      onClick={() => navigate("/admin/team")}
                      className="text-primary hover:underline font-medium"
                    >
                      Equipe
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Bank Accounts ──────────────── */}
          {step.key === "bank" && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Cadastre as contas bancárias da empresa para controle
                financeiro. Você pode pular e adicionar depois.
              </p>
              <BankAccountForm
                accounts={bankAccounts}
                onUpdate={loadBankAccounts}
              />
            </div>
          )}

          {/* ── Integrations ───────────────── */}
          {step.key === "integrations" && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Conecte serviços externos para automação. Você pode configurar
                isso depois em <strong>Configurações → Integrações</strong>.
              </p>

              <div className="grid gap-3">
                {[
                  {
                    name: "GitHub",
                    desc: "Repos, segurança, issues",
                    icon: "🐙",
                    path: "/github",
                  },
                  {
                    name: "Google Workspace",
                    desc: "Drive, Sheets, relatórios",
                    icon: "📊",
                    path: null,
                  },
                  {
                    name: "Open Banking",
                    desc: "Em breve",
                    icon: "🏦",
                    path: null,
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between p-4 border border-border/20 rounded-xl ${
                      item.path
                        ? "hover:border-primary/30 cursor-pointer"
                        : "opacity-50"
                    }`}
                    onClick={() => item.path && navigate(item.path)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    {item.path ? (
                      <span className="text-xs text-primary font-medium">
                        Configurar →
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">
                        Em breve
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Done ───────────────────────── */}
          {step.key === "done" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="p-5 bg-emerald-500/10 rounded-2xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold">Tudo pronto!</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Sua empresa <strong>{tenant?.name}</strong> está configurada.
                  Você pode alterar qualquer configuração a qualquer momento em{" "}
                  <strong>Configurações</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Anterior
          </button>

          <div className="flex items-center gap-3">
            {step.key !== "done" && step.key !== "company" && (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <SkipForward className="w-4 h-4" /> Pular
              </button>
            )}

            {step.key === "done" ? (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all active:scale-95"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Acessar Plataforma <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : step.key === "company" ? (
              <button
                onClick={handleSaveCompany}
                disabled={saving || !canGoNext()}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all active:scale-95"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Salvar e Continuar <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-95"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
