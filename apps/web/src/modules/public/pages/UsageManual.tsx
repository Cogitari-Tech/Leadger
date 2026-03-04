import {
  BookOpen,
  ShieldCheck,
  FileSearch,
  Wallet,
  GitBranch,
  Settings,
  ArrowRight,
  HelpCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function UsageManual() {
  const sections = [
    {
      title: "Painel de Governança",
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/5",
      content:
        "Sua central de comando. Visualize indicadores críticos de risco, conformidade e saúde financeira em tempo real. Use os KPICards para navegar rapidamente para as áreas de atenção.",
      tips: [
        "Clique nos cartões para detalhes",
        "Acompanhe o ranking de risco dos projetos",
      ],
    },
    {
      title: "Gerir Auditorias",
      icon: FileSearch,
      color: "text-amber-500",
      bg: "bg-amber-500/5",
      content:
        "Módulo para criação e execução de ciclos de auditoria. Você pode usar frameworks pré-definidos (ISO, LGPD) ou criar checklists personalizados.",
      tips: [
        "Vincule evidências a cada item",
        "Gere achados (findings) para não-conformidades",
      ],
    },
    {
      title: "Garantir Conformidade",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/5",
      content:
        "Estruture sua matriz de conformidade. Mapeie controles, avalie a eficácia e garanta que sua organização atenda aos padrões regulatórios exigidos.",
      tips: [
        "Mantenha o status atualizado sempre",
        "Revise a matriz de riscos periodicamente",
      ],
    },
    {
      title: "Gestão Financeira",
      icon: Wallet,
      color: "text-sky-500",
      bg: "bg-sky-500/5",
      content:
        "Controle absoluto sobre o caixa. Monitore o Burn Rate de projetos, visualize movimentações mensais e gerencie contas bancárias integradas.",
      tips: [
        "Cadastre todas as contas da organização",
        "Acompanhe o fluxo de caixa projetado",
      ],
    },
    {
      title: "Automação GitHub",
      icon: GitBranch,
      color: "text-zinc-500",
      bg: "bg-zinc-500/5",
      content:
        "Segurança contínua no código. Integre seus repositórios para monitorar vulnerabilidades, gerenciar organizações e vincular issues a achados de auditoria.",
      tips: [
        "Sincronize com o GitHub periodicamente",
        "Crie issues diretamente de achados críticos",
      ],
    },
    {
      title: "Administração",
      icon: Settings,
      color: "text-muted-foreground",
      bg: "bg-muted/10",
      content:
        "Configurações de equipe e sistema. Gerencie usuários, cargos (roles), faturamente via Stripe e informações da tenant/empresa.",
      tips: [
        "Use convites por e-mail para novos membros",
        "Verifique o status do plano na aba Faturas",
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-foreground/5 p-12 lg:p-16 border border-border/40">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            Guia do Sistema
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground font-display">
            Manual de Uso <br />
            <span className="text-primary">Cogitari Governance</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            Bem-vindo ao centro de conhecimento. Aqui você entende como cada
            engrenagem do sistema funciona para garantir a excelência da sua
            governança corporativa.
          </p>
        </div>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="glass-card soft-shadow rounded-3xl p-8 border border-border/40 hover:scale-[1.02] transition-all group"
          >
            <div
              className={`w-14 h-14 rounded-2xl ${section.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
            >
              <section.icon className={`w-7 h-7 ${section.color}`} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 font-display">
              {section.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
              {section.content}
            </p>
            <div className="space-y-3 pt-4 border-t border-border/20">
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest block">
                Dicas Pro
              </span>
              {section.tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs font-semibold text-foreground/80"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between p-8 rounded-2xl bg-primary/5 border border-primary/10">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="p-3 bg-primary/20 rounded-xl">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              Ainda com dúvida?
            </p>
            <p className="text-xs text-muted-foreground">
              Consulte nosso suporte técnico a qualquer momento.
            </p>
          </div>
        </div>
        <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm flex items-center gap-2">
          Contatar Suporte
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
