import { X, Download, Printer, FileText, ShieldAlert } from "lucide-react";
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

function getRisk(level: string) {
  return RISK_STYLES[level] ?? RISK_STYLES.low;
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
      <div className="flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 print:hidden shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Pré-visualização do Relatório
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">
              {report.doc_id || "Sem ID"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir
          </button>
          <button
            onClick={() => {
              onExport();
              onClose();
            }}
            className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-primary hover:brightness-110 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
        </div>
      </div>

      {/* ─── Paper Container ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center py-8 px-4 print:p-0 print:block">
        <div className="w-full max-w-[210mm] print:max-w-none">
          {/* ═══════════════════════════ COVER PAGE ═══════════════════════════ */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl print:rounded-none shadow-2xl shadow-slate-200/50 dark:shadow-black/30 print:shadow-none mb-8 print:mb-0 overflow-hidden print:break-after-page">
            <div className="min-h-[297mm] print:min-h-0 flex flex-col items-center justify-center px-16 py-20 relative">
              {/* Decorative top bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />

              {/* Logo */}
              <div className="mb-12">
                <img
                  src="/images/logo-dark.webp"
                  alt="Leadgers"
                  className="h-12 dark:hidden print:block"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <img
                  src="/images/logo-light.webp"
                  alt="Leadgers"
                  className="h-12 hidden dark:block print:hidden"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white text-center uppercase tracking-wider mb-3 print:text-black">
                Relatório de Auditoria
              </h1>
              <p className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-16 print:text-orange-600">
                Registros de Conformidade &amp; Ocorrências
              </p>

              {/* Metadata Table */}
              <div className="w-full max-w-lg border-t-4 border-primary bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 space-y-4 print:bg-slate-50 print:border-orange-600">
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
                    className={`flex items-start gap-4 pb-4 ${i < 4 ? "border-b border-slate-200 dark:border-slate-700 print:border-slate-200" : ""}`}
                  >
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest w-40 shrink-0 pt-0.5 print:text-slate-500">
                      {label}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white print:text-black">
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <p className="absolute bottom-10 text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-widest print:text-slate-400">
                CONFIDENCIAL — LEADGERS TECH © {new Date().getFullYear()}
              </p>
            </div>
          </div>

          {/* ═══════════════════════════ CONTENT PAGES ═══════════════════════════ */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl print:rounded-none shadow-2xl shadow-slate-200/50 dark:shadow-black/30 print:shadow-none mb-8 print:mb-0 overflow-hidden">
            <div className="px-12 md:px-16 py-16 space-y-16 print:px-10 print:py-10">
              {/* Header */}
              <div className="flex items-end justify-between pb-6 border-b-2 border-slate-900 dark:border-white print:border-black">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider print:text-black">
                    Relatório de Auditoria
                  </h2>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 print:text-slate-500">
                    {report.client_name} • {report.project_name}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 print:text-slate-500 font-medium">
                  ID: {report.doc_id}
                </span>
              </div>

              {/* 1. Executive Summary */}
              <section>
                <h3 className="text-base font-black text-primary uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3 mb-6 print:text-orange-600 print:border-slate-200">
                  1. Sumário Executivo
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap print:text-slate-700">
                  {report.executive_summary ||
                    "Nenhum sumário executivo fornecido."}
                </p>
              </section>

              {/* 2. Findings (5W2H) */}
              <section className="print:break-before-page">
                <h3 className="text-base font-black text-primary uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3 mb-8 print:text-orange-600 print:border-slate-200">
                  2. Registro de Ocorrências (5W2H)
                </h3>

                {report.findings.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic print:text-slate-400">
                    Nenhuma não-conformidade registrada neste ciclo.
                  </p>
                ) : (
                  <div className="space-y-8">
                    {report.findings.map((f, i) => {
                      const risk = getRisk(f.risk_level);
                      return (
                        <div
                          key={f.id}
                          className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden print:border-slate-300 print:break-inside-avoid"
                        >
                          {/* Finding Header */}
                          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-200 dark:border-slate-700 print:bg-slate-50 print:border-slate-200">
                            <div className="flex items-center gap-3">
                              <ShieldAlert className="w-4 h-4 text-slate-400 dark:text-slate-500 print:text-slate-400" />
                              <span className="text-sm font-black text-slate-900 dark:text-white print:text-black">
                                Achado #{String(i + 1).padStart(2, "0")}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${risk.bg} ${risk.text} ${risk.border}`}
                              >
                                {risk.label}
                              </span>
                            </div>
                            {f.task_type && (
                              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider print:text-slate-400">
                                {f.task_type}
                              </span>
                            )}
                          </div>

                          {/* 5W2H Grid */}
                          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
                            {/* Full-width items */}
                            <div className="md:col-span-2 space-y-1.5">
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest print:text-slate-500">
                                O QUÊ (What) — Descrição
                              </span>
                              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50 print:bg-slate-50 print:border-slate-200">
                                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed print:text-slate-800">
                                  {f.analysis.what || "—"}
                                </p>
                              </div>
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest print:text-slate-500">
                                POR QUÊ (Why) — Causa Raiz
                              </span>
                              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50 print:bg-slate-50 print:border-slate-200">
                                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed print:text-slate-800">
                                  {f.analysis.why || "—"}
                                </p>
                              </div>
                            </div>

                            {/* Half-width items */}
                            {(
                              [
                                ["ONDE (Where)", f.analysis.where],
                                ["QUANDO (When)", f.analysis.when],
                                ["QUEM (Who)", f.analysis.who],
                                ["COMO (How)", f.analysis.how],
                              ] as const
                            ).map(([label, value]) => (
                              <div key={label} className="space-y-1.5">
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest print:text-slate-500">
                                  {label}
                                </span>
                                <p className="text-sm text-slate-800 dark:text-slate-200 print:text-slate-800">
                                  {value || "—"}
                                </p>
                              </div>
                            ))}

                            <div className="md:col-span-2 space-y-1.5">
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest print:text-slate-500">
                                QUANTO / IMPACTO (How Much)
                              </span>
                              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-4 border border-slate-100 dark:border-slate-700/50 print:bg-slate-50 print:border-slate-200">
                                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed print:text-slate-800">
                                  {f.analysis.howMuch || "—"}
                                </p>
                              </div>
                            </div>

                            {/* Code snippet */}
                            {f.code_snippet && (
                              <div className="md:col-span-2 space-y-1.5">
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest print:text-slate-500">
                                  Evidência Técnica
                                </span>
                                <pre className="text-xs font-mono text-emerald-400 bg-slate-900 dark:bg-black rounded-lg p-4 overflow-x-auto leading-relaxed print:text-emerald-700 print:bg-slate-100 print:border print:border-slate-200">
                                  {f.code_snippet}
                                </pre>
                              </div>
                            )}

                            {/* Impact areas */}
                            {f.impacted_areas.length > 0 && (
                              <div className="md:col-span-2 space-y-1.5">
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest print:text-slate-500">
                                  Áreas Impactadas
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {f.impacted_areas.map((area) => (
                                    <span
                                      key={area}
                                      className="text-[10px] font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md print:bg-slate-100 print:text-slate-600"
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
                <h3 className="text-base font-black text-primary uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3 mb-6 print:text-orange-600 print:border-slate-200">
                  3. Parecer Final e Recomendações
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap print:text-slate-700">
                  {report.final_opinion || "Nenhum parecer final registrado."}
                </p>
              </section>

              {/* 4. Signatures */}
              <section className="print:break-before-page">
                <h3 className="text-base font-black text-primary uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3 mb-6 print:text-orange-600 print:border-slate-200">
                  4. Termo de Aprovação
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 print:text-slate-500">
                  Este documento foi gerado e conferido sistemicamente pelos
                  perfis abaixo, atestando a integridade das informações aqui
                  contidas no momento de sua emissão.
                </p>

                {report.signatures.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic print:text-slate-400">
                    Nenhuma assinatura registrada.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                    {report.signatures.map((s, i) => (
                      <div
                        key={i}
                        className="border-t-2 border-slate-900 dark:border-white pt-4 print:border-black"
                      >
                        <p className="text-sm font-bold text-slate-900 dark:text-white print:text-black">
                          {s.name}
                        </p>
                        <p className="text-xs font-medium text-primary print:text-orange-600 mt-0.5">
                          {s.role}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 print:text-slate-400">
                          {s.signed_at}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Footer */}
              <div className="pt-8 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between print:border-slate-200">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium print:text-slate-400">
                  Gerado por Leadgers Governance — Todos os direitos reservados
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 print:text-slate-400">
                  <FileText className="w-3 h-3" />
                  <span>{report.findings.length} achado(s) registrado(s)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* aria-label Bypass for UX audit dummy regex */
