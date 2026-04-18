import {
  X,
  Download,
  Printer,
  ShieldAlert,
  Mail,
  Link as LinkIcon,
} from "lucide-react";
import type { AuditReport } from "../types/audit.types";

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: AuditReport;
  onExport: () => void;
}

const RISK_STYLES: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  critical: {
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    label: "Risco Crítico",
  },
  high: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    label: "Risco Alto",
  },
  medium: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    label: "Risco Médio",
  },
  low: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    label: "Risco Baixo",
  },
};

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  open: {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    label: "Aberto",
  },
  in_progress: {
    bg: "bg-primary/10 dark:bg-primary/20",
    text: "text-primary dark:text-primary",
    border: "border-primary/20 dark:border-primary/30",
    label: "Em Tratamento",
  },
  resolved: {
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    label: "Resolvido",
  },
  accepted: {
    bg: "bg-blue-50 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    label: "Aceito",
  },
};

const TASK_TYPES_MAP: Record<string, string> = {
  "Frontend Bug": "Interface (Frontend)",
  "Backend Logic": "Lógica de Processamento",
  "Security Vuln": "Risco de Segurança",
  Database: "Dados e Persistência",
  "DevOps/CI-CD": "Pipeline e Operações",
  "Code Quality": "Débito Técnico / Código",
  Performance: "Performance / Escala",
  Documentation: "Falta de Documentação",
  Compliance: "Não Conformidade Legal",
  Infrastructure: "Arquitetura / Infra",
  Dependency: "Gestão de Dependências",
  Architecture: "Arquitetura e Design",
  "Product UI/UX": "Produto / UI-UX",
  "Growth/Marketing": "Growth / Marketing",
  "Sales/CRM": "Vendas / CRM",
  "Customer Success": "Customer Success",
  "HR/Recruitment": "RH / Recrutamento",
  "Finance/Billing": "Financeiro / Billing",
  "Legal/Privacy": "Jurídico / Privacidade",
  "Data Science/AI": "Data Science / AI",
};

function getRisk(level: string) {
  return RISK_STYLES[level] ?? RISK_STYLES.low;
}

function getStatus(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.open;
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  report,
  onExport,
}: ReportPreviewModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-slate-100 dark:bg-slate-950 print:bg-white">
      {/* ─── Toolbar ─── */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 print:hidden shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Pré-visualização do Relatório
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              ID: {report.doc_id || "Não definido"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button
            onClick={() => {
              onExport();
              onClose();
            }}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-primary hover:brightness-110 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* ─── Paper Container ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center py-10 px-4 print:p-0 print:block bg-slate-100/50 dark:bg-slate-950/50">
        <div className="w-full max-w-[210mm] print:max-w-none space-y-8 print:space-y-0">
          {/* ═══════════════════════════ COVER PAGE ═══════════════════════════ */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] print:rounded-none shadow-2xl shadow-slate-200 dark:shadow-black/60 print:shadow-none overflow-hidden print:break-after-page relative ring-1 ring-slate-200 dark:ring-slate-800 print:ring-0">
            <div className="min-h-[297mm] print:min-h-0 flex flex-col items-center justify-center px-16 py-24 relative">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />

              <div className="mb-16">
                <img
                  src="/images/logo-dark.webp"
                  alt="Leadgers"
                  className="h-16 dark:hidden print:block"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <img
                  src="/images/logo-light.webp"
                  alt="Leadgers"
                  className="h-16 hidden dark:block print:hidden"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white text-center tracking-tight mb-4 print:text-black">
                Relatório de Auditoria
              </h1>
              <p className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-20 print:text-orange-600">
                Registros de Conformidade & Ocorrências
              </p>

              <div className="w-full max-w-lg bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-8 space-y-5 border border-slate-100 dark:border-slate-700/50 print:bg-slate-50 print:border-slate-300">
                {[
                  { label: "Empresa Cliente", value: report.client_name },
                  { label: "Projeto / Escopo", value: report.project_name },
                  { label: "Auditor Líder", value: report.lead_auditor },
                  { label: "Referência ID", value: report.doc_id },
                  {
                    label: "Período",
                    value: `${report.start_date || "—"} até ${report.end_date || "—"}`,
                  },
                ].map(({ label, value }, i) => (
                  <div
                    key={label}
                    className={`flex items-start gap-4 pb-5 ${i < 4 ? "border-b border-slate-200 dark:border-slate-700/60 print:border-slate-300" : "pb-0"}`}
                  >
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest w-40 shrink-0 pt-0.5 print:text-slate-600">
                      {label}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white print:text-black leading-tight">
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>

              <p className="absolute bottom-12 text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest print:text-slate-500">
                CONFIDENCIAL — LEADGERS TECH © {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* ═══════════════════════════ CONTENT PAGES ═══════════════════════════ */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] print:rounded-none shadow-2xl shadow-slate-200 dark:shadow-black/60 print:shadow-none overflow-hidden print:break-inside-auto ring-1 ring-slate-200 dark:ring-slate-800 print:ring-0">
            <div className="px-10 md:px-16 py-16 space-y-16 print:px-10 print:py-10">
              {/* Header */}
              <div className="flex items-end justify-between pb-6 border-b-2 border-slate-900 dark:border-white print:border-black">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight print:text-black">
                    Detalhes da Auditoria
                  </h2>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mt-1 print:text-slate-600">
                    {report.client_name} • {report.project_name}
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full print:bg-slate-100 print:text-slate-700">
                  ID: {report.doc_id}
                </span>
              </div>

              {/* 1. Executive Summary */}
              <section>
                <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4 print:border-slate-300">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    1
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight print:text-black">
                    Sumário Executivo
                  </h3>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 print:border-slate-200">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap print:text-slate-800">
                    {report.executive_summary ||
                      "Nenhum sumário executivo fornecido."}
                  </p>
                </div>
              </section>

              {/* 2. Findings (5W2H) */}
              <section className="print:break-before-page">
                <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4 print:border-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      2
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight print:text-black">
                      Registro de Ocorrências (5W2H)
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full print:bg-slate-100 print:text-slate-600">
                    {report.findings.length} Achados
                  </span>
                </div>

                {report.findings.length === 0 ? (
                  <p className="text-sm text-slate-500 italic print:text-slate-600 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl">
                    Nenhuma não-conformidade registrada neste ciclo.
                  </p>
                ) : (
                  <div className="space-y-10">
                    {report.findings.map((f, i) => {
                      const risk = getRisk(f.risk_level);
                      const status = getStatus(f.status);
                      const taskLabel =
                        TASK_TYPES_MAP[f.task_type] || f.task_type;

                      return (
                        <div
                          key={f.id}
                          className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden print:border-slate-300 print:break-inside-avoid bg-white dark:bg-slate-900 shadow-sm"
                        >
                          <div className="bg-slate-50 dark:bg-slate-800/40 px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 print:bg-slate-50 print:border-slate-300">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${risk.bg} ${risk.border}`}
                              >
                                <ShieldAlert
                                  className={`w-5 h-5 ${risk.text}`}
                                />
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-slate-900 dark:text-white print:text-black">
                                  Achado #{String(i + 1).padStart(2, "0")}{" "}
                                  <span className="text-slate-400 font-normal ml-2">
                                    ({taskLabel || "Não Categorizado"})
                                  </span>
                                </h4>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${risk.bg} ${risk.text} ${risk.border}`}
                                  >
                                    {risk.label}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${status.bg} ${status.text} ${status.border}`}
                                  >
                                    {status.label}
                                  </span>
                                  {f.should_notify && f.notify_email && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 flex items-center gap-1">
                                      <Mail className="w-3 h-3" /> Notificado
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 print:grid-cols-2">
                            <div className="md:col-span-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 print:text-slate-600">
                                O QUÊ (What) — Descrição do Achado
                              </span>
                              <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-xl p-5 border border-slate-100 dark:border-slate-800/50 print:bg-slate-50 print:border-slate-200">
                                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed print:text-slate-900 font-medium">
                                  {f.analysis.what || "—"}
                                </p>
                              </div>
                            </div>

                            <div className="md:col-span-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 print:text-slate-600">
                                POR QUÊ (Why) — Causa Raiz Identificada
                              </span>
                              <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-xl p-5 border border-slate-100 dark:border-slate-800/50 print:bg-slate-50 print:border-slate-200">
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed print:text-slate-800">
                                  {f.analysis.why || "—"}
                                </p>
                              </div>
                            </div>

                            {(
                              [
                                ["ONDE (Where)", f.analysis.where],
                                ["QUANDO (When)", f.analysis.when],
                                ["QUEM (Who)", f.analysis.who],
                                ["COMO (How)", f.analysis.how],
                              ] as const
                            ).map(([label, value]) => (
                              <div key={label} className="space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest print:text-slate-500">
                                  {label}
                                </span>
                                <div className="border-l-2 border-slate-200 dark:border-slate-700 pl-4 py-1 print:border-slate-300">
                                  <p className="text-sm text-slate-800 dark:text-slate-200 print:text-slate-900 leading-relaxed">
                                    {value || "—"}
                                  </p>
                                </div>
                              </div>
                            ))}

                            <div className="md:col-span-2 mt-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 print:text-slate-600">
                                QUANTO / IMPACTO (How Much)
                              </span>
                              <div className="bg-red-50/50 dark:bg-red-950/20 rounded-xl p-5 border border-red-100 dark:border-red-900/30 print:bg-red-50 print:border-red-200">
                                <p className="text-sm text-red-900 dark:text-red-200 leading-relaxed print:text-red-900 font-medium">
                                  {f.analysis.howMuch || "—"}
                                </p>
                              </div>
                            </div>

                            {f.code_snippet && (
                              <div className="md:col-span-2 mt-4">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 print:text-slate-600">
                                  Evidência Técnica / Snippet Restrito
                                </span>
                                <pre className="text-[11px] font-mono text-emerald-400 bg-slate-950 dark:bg-black rounded-xl p-5 overflow-x-auto leading-relaxed border border-slate-800 print:text-slate-800 print:bg-slate-50 print:border-slate-300 shadow-inner">
                                  {f.code_snippet}
                                </pre>
                              </div>
                            )}

                            {f.evidence_links &&
                              f.evidence_links.filter(Boolean).length > 0 && (
                                <div className="md:col-span-2 mt-2">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 print:text-slate-600">
                                    Referências Externas
                                  </span>
                                  <div className="flex flex-col gap-2">
                                    {f.evidence_links.map((link, idx) => {
                                      let isValid = false;
                                      try {
                                        const parsed = new URL(link);
                                        isValid =
                                          parsed.protocol === "http:" ||
                                          parsed.protocol === "https:";
                                      } catch {
                                        isValid = false;
                                      }
                                      if (!link || !isValid) return null;
                                      return (
                                        <a
                                          key={idx}
                                          href={link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-primary hover:text-primary/80 transition-colors truncate flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-lg border border-primary/10 w-fit max-w-full"
                                        >
                                          <LinkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                          <span className="truncate">
                                            {link}
                                          </span>
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                            {f.impacted_areas.length > 0 && (
                              <div className="md:col-span-2 mt-2 pt-6 border-t border-slate-100 dark:border-slate-800 print:border-slate-200">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 print:text-slate-600">
                                  Áreas Afetadas
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {f.impacted_areas.map((area) => (
                                    <span
                                      key={area}
                                      className="text-[11px] font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg print:bg-slate-100 print:text-slate-800 border border-slate-200 dark:border-slate-700/50"
                                    >
                                      {area}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* 3. Final Opinion */}
              <section className="print:break-before-page">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4 print:border-slate-300">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    3
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight print:text-black">
                    Parecer Final e Recomendações
                  </h3>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 print:border-slate-200">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap print:text-slate-800">
                    {report.final_opinion || "Nenhum parecer final registrado."}
                  </p>
                </div>
              </section>

              {/* 4. Signatures */}
              <section className="print:break-before-page">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4 print:border-slate-300">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    4
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight print:text-black">
                    Termo de Aprovação
                  </h3>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 print:text-slate-500">
                  Este documento foi gerado e conferido sistemicamente pelos
                  perfis abaixo, atestando a integridade das informações aqui
                  contidas no momento de sua emissão.
                </p>

                {report.signatures.length === 0 ? (
                  <p className="text-sm text-slate-400 italic print:text-slate-500 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl">
                    Nenhuma assinatura registrada.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-12 mt-8">
                    {report.signatures.map((s, i) => (
                      <div key={i} className="relative pt-6">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-300 dark:bg-slate-600 print:bg-slate-400" />
                        <p className="text-sm font-bold text-slate-900 dark:text-white print:text-black mb-0.5">
                          {s.name}
                        </p>
                        <p className="text-xs font-semibold text-primary print:text-orange-600">
                          {s.role}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 print:text-slate-500 uppercase tracking-widest font-medium">
                          Data: {s.signed_at}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
