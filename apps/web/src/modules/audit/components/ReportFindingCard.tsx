import React, { useRef, useEffect, useCallback } from "react";
import {
  Trash2,
  ChevronDown,
  Code2,
  Link,
  Mail,
  AlertTriangle,
  Search,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type {
  ReportFinding,
  Finding5W2H,
  FindingRiskLevel,
  FindingStatus,
  TaskCategory,
  ImpactArea,
} from "../types/audit.types";

interface ReportFindingCardProps {
  finding: ReportFinding;
  index: number;
  onUpdate: (id: string, updates: Partial<ReportFinding>) => void;
  onUpdate5W2H: (id: string, field: keyof Finding5W2H, value: string) => void;
  onRemove: (id: string) => void;
}

const RISK_LEVELS: { value: FindingRiskLevel; label: string; color: string }[] =
  [
    {
      value: "critical",
      label: "Crítico",
      color:
        "peer-checked:bg-destructive peer-checked:text-destructive-foreground peer-checked:border-destructive",
    },
    {
      value: "high",
      label: "Alto",
      color:
        "peer-checked:bg-orange-500 peer-checked:text-white peer-checked:border-orange-500",
    },
    {
      value: "medium",
      label: "Médio",
      color:
        "peer-checked:bg-amber-500 peer-checked:text-white peer-checked:border-amber-500",
    },
    {
      value: "low",
      label: "Baixo",
      color:
        "peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:border-emerald-500",
    },
  ];

const STATUS_OPTIONS: { value: FindingStatus; label: string; color: string }[] =
  [
    {
      value: "open",
      label: "Aberto",
      color:
        "peer-checked:bg-muted-foreground/20 peer-checked:text-foreground peer-checked:border-muted-foreground/40",
    },
    {
      value: "in_progress",
      label: "Em Tratamento",
      color:
        "peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary",
    },
    {
      value: "resolved",
      label: "Resolvido",
      color:
        "peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:border-emerald-500",
    },
    {
      value: "accepted",
      label: "Aceito",
      color:
        "peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500",
    },
  ];

const TASK_TYPES: { value: TaskCategory; label: string }[] = [
  { value: "Frontend Bug", label: "Interface (Frontend)" },
  { value: "Backend Logic", label: "Lógica de Processamento" },
  { value: "Security Vuln", label: "Risco de Segurança" },
  { value: "Database", label: "Dados e Persistência" },
  { value: "DevOps/CI-CD", label: "Pipeline e Operações" },
  { value: "Code Quality", label: "Débito Técnico / Código" },
  { value: "Performance", label: "Performance / Escala" },
  { value: "Documentation", label: "Falta de Documentação" },
  { value: "Compliance", label: "Não Conformidade Legal" },
  { value: "Infrastructure", label: "Arquitetura / Infra" },
  { value: "Dependency", label: "Gestão de Dependências" },
  { value: "Architecture", label: "Arquitetura e Design" },
  { value: "Product UI/UX", label: "Produto / UI-UX" },
  { value: "Growth/Marketing", label: "Growth / Marketing" },
  { value: "Sales/CRM", label: "Vendas / CRM" },
  { value: "Customer Success", label: "Customer Success" },
  { value: "HR/Recruitment", label: "RH / Recrutamento" },
  { value: "Finance/Billing", label: "Financeiro / Billing" },
  { value: "Legal/Privacy", label: "Jurídico / Privacidade" },
  { value: "Data Science/AI", label: "Data Science / AI" },
];

const IMPACT_AREAS: ImpactArea[] = [
  "Segurança",
  "Operacional",
  "Jurídico",
  "Privacidade",
  "Financeiro",
  "Reputacional",
  "Estratégico",
  "Experiência do Usuário",
  "Conformidade Regulatória",
  "Recursos Humanos",
];

const W2H_FIELDS: {
  key: keyof Finding5W2H;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "what",
    label: "Objeto (O que foi identificado)",
    placeholder: "Descreva detalhadamente o achado ou não conformidade...",
  },
  {
    key: "why",
    label: "Causa (Por que ocorreu)",
    placeholder: "Identifique a causa raiz ou justificativa técnica...",
  },
  {
    key: "where",
    label: "Local (Onde foi detectado)",
    placeholder: "Módulo, repositório, endpoint ou infraestrutura afetada...",
  },
  {
    key: "when",
    label: "Cronograma (Quando ocorreu/Prazo)",
    placeholder: "Data da detecção e estimativa para resolução...",
  },
  {
    key: "who",
    label: "Responsabilidade (Quem deve agir)",
    placeholder: "Defina o responsável direto pela remediação...",
  },
  {
    key: "how",
    label: "Plano de Ação (Como resolver)",
    placeholder: "Passos detalhados para a correção do problema...",
  },
  {
    key: "howMuch",
    label: "Impacto (Custo/Risco)",
    placeholder:
      "Estimativa de esforço, custo financeiro ou nível de criticidade...",
  },
];

export default function ReportFindingCard({
  finding,
  index,
  onUpdate,
  onUpdate5W2H,
  onRemove,
}: ReportFindingCardProps) {
  const [search, setSearch] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearch("");
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeDropdown]);

  const filteredTasks = TASK_TYPES.filter(
    (t) =>
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.value.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedTask = TASK_TYPES.find((t) => t.value === finding.task_type);

  const riskColor =
    finding.risk_level === "critical"
      ? "border-l-red-600"
      : finding.risk_level === "high"
        ? "border-l-orange-500"
        : finding.risk_level === "medium"
          ? "border-l-amber-500"
          : "border-l-green-600";

  return (
    <div
      className={`bg-card dark:bg-card/40 rounded-xl border border-border transition-all duration-200 hover:shadow-md border-l-4 ${riskColor}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 pb-0">
        <div className="flex items-center gap-3">
          <span className="bg-foreground/10 text-foreground px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Achado #{String(index + 1).padStart(2, "0")}
          </span>
          {finding.risk_level === "critical" && (
            <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
          )}
        </div>
        <Button variant="ghost" onClick={() => onRemove(finding.id)}>
          <Trash2 className="w-4 h-4 text-red-400" />
        </Button>
      </div>

      <div className="p-4 space-y-5">
        {/* 5W2H Fields */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
            <ChevronDown className="w-3 h-3" /> Análise 5W2H
          </p>
          {W2H_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1">
                {field.label}
              </label>
              <textarea
                rows={2}
                className="text-sm p-3 border border-border rounded-lg bg-muted/40 w-full focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none text-foreground placeholder-muted-foreground/30"
                placeholder={field.placeholder}
                value={finding.analysis[field.key]}
                onChange={(e) =>
                  onUpdate5W2H(finding.id, field.key, e.target.value)
                }
              />
            </div>
          ))}
        </div>

        {/* Risk + Status + Task Type row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Task Type Searchable Selection */}
          <div className="relative" ref={dropdownRef}>
            <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1">
              Tipo de Tarefa
            </label>
            <div className="relative">
              <div
                className="w-full text-xs font-medium text-foreground bg-muted/40 p-2.5 rounded-lg border border-border focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all cursor-pointer flex justify-between items-center group"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span
                  className={
                    selectedTask
                      ? "text-foreground"
                      : "text-muted-foreground/40"
                  }
                >
                  {selectedTask ? selectedTask.label : "Buscar setor..."}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </div>

              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in duration-200">
                  <div className="p-2 border-b border-border bg-muted/20 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-muted-foreground/40" />
                    <input
                      autoFocus
                      className="bg-transparent border-none outline-none text-xs w-full py-1 placeholder:text-muted-foreground/30"
                      placeholder="Filtrar setores..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((t) => (
                        <div
                          key={t.value}
                          className={`p-2.5 text-xs rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                            finding.task_type === t.value
                              ? "bg-primary text-white"
                              : "hover:bg-muted text-foreground"
                          }`}
                          onClick={() => {
                            onUpdate(finding.id, { task_type: t.value });
                            closeDropdown();
                          }}
                        >
                          {t.label}
                          {finding.task_type === t.value && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground/40 text-[10px] uppercase font-bold italic">
                        Nenhum resultado encontrado
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Risk Level */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1">
              Risco
            </label>
            <div className="flex gap-1.5">
              {RISK_LEVELS.map((r) => (
                <label key={r.value} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name={`risk-${finding.id}`}
                    className="peer sr-only"
                    checked={finding.risk_level === r.value}
                    onChange={() =>
                      onUpdate(finding.id, { risk_level: r.value })
                    }
                  />
                  <span
                    className={`block text-center text-[10px] font-bold py-1.5 rounded-lg border border-border text-muted-foreground transition-all hover:bg-foreground/5 ${r.color}`}
                  >
                    {r.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1">
              Status
            </label>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <label key={s.value} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name={`status-${finding.id}`}
                    className="peer sr-only"
                    checked={finding.status === s.value}
                    onChange={() => onUpdate(finding.id, { status: s.value })}
                  />
                  <span
                    className={`block text-center text-[10px] font-bold py-1.5 rounded-lg border border-border text-muted-foreground transition-all hover:bg-foreground/5 ${s.color}`}
                  >
                    {s.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Areas */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1">
            Áreas Impactadas
          </label>
          <div className="flex flex-wrap gap-2">
            {IMPACT_AREAS.map((area) => (
              <label key={area} className="cursor-pointer">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={finding.impacted_areas.includes(area)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...finding.impacted_areas, area]
                      : finding.impacted_areas.filter((a) => a !== area);
                    onUpdate(finding.id, { impacted_areas: next });
                  }}
                />
                <span className="block text-center text-[10px] font-bold py-1.5 px-3 rounded-lg border border-border text-muted-foreground transition-all peer-checked:bg-primary/20 peer-checked:text-primary peer-checked:border-primary/50 hover:bg-foreground/5">
                  {area}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Code Snippet */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1 flex items-center gap-1">
            <Code2 className="w-3 h-3" /> Trecho de Código / Log
          </label>
          <textarea
            rows={3}
            className="text-xs font-mono p-3 border border-border rounded-lg bg-black text-emerald-400 w-full resize-none placeholder:text-muted-foreground/30 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            placeholder="// Cole seu código ou log aqui..."
            value={finding.code_snippet ?? ""}
            onChange={(e) =>
              onUpdate(finding.id, { code_snippet: e.target.value })
            }
          />
        </div>

        {/* Evidence Links */}
        <div>
          <label className="text-[10px] font-bold text-muted-foreground/80 uppercase block mb-1 flex items-center gap-1">
            <Link className="w-3 h-3" /> Evidências (Links)
          </label>
          <div className="space-y-1.5">
            {finding.evidence_links.map((link, li) => (
              <div key={li} className="flex gap-1.5 items-center">
                <input
                  type="url"
                  className="text-xs flex-1 border border-border px-2 py-1.5 rounded bg-muted/40 text-foreground placeholder:text-muted-foreground/30 focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="https://..."
                  value={link}
                  onChange={(e) => {
                    const links = [...finding.evidence_links];
                    links[li] = e.target.value;
                    onUpdate(finding.id, { evidence_links: links });
                  }}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (/^(javascript|data|vbscript):/i.test(val)) {
                      const links = [...finding.evidence_links];
                      links[li] = "";
                      onUpdate(finding.id, { evidence_links: links });
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const links = finding.evidence_links.filter(
                      (_, idx) => idx !== li,
                    );
                    onUpdate(finding.id, { evidence_links: links });
                  }}
                  className="text-red-400 hover:text-red-600 text-xs font-bold"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                onUpdate(finding.id, {
                  evidence_links: [...finding.evidence_links, ""],
                })
              }
              className="text-primary text-[10px] font-bold uppercase hover:underline"
            >
              + Adicionar Link
            </button>
          </div>
        </div>

        {/* Email Notification */}
        <div className="border-t border-border pt-4 mt-4">
          <label className="text-[10px] font-bold text-muted-foreground/80 uppercase flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              className="accent-primary"
              checked={finding.should_notify}
              onChange={(e) =>
                onUpdate(finding.id, {
                  should_notify: e.target.checked,
                  notify_email: e.target.checked ? finding.notify_email : "",
                })
              }
            />
            <Mail className="w-3 h-3" /> Automação de E-mail
          </label>
          {finding.should_notify && (
            <input
              type="email"
              className="mt-2 text-sm p-2 border border-border rounded w-full bg-muted/40 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="E-mail do responsável"
              value={finding.notify_email ?? ""}
              onChange={(e) =>
                onUpdate(finding.id, { notify_email: e.target.value })
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
