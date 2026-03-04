import { useState } from "react";
import {
  FileOutput,
  Plus,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { useReportGenerator } from "../hooks/useReportGenerator";
import { useAudit } from "../hooks/useAudit";
import ReportFindingCard from "../components/ReportFindingCard";
import ReportSignatures from "../components/ReportSignatures";
import ExportModal from "../components/ExportModal";

export default function ReportBuilder() {
  const {
    report,
    unsavedChanges,
    updateField,
    addFinding,
    updateFinding,
    updateFinding5W2H,
    removeFinding,
    addSignature,
    removeSignature,
    validate,
    exportReport,
    resetReport,
  } = useReportGenerator();

  const { programs } = useAudit();
  const [showExport, setShowExport] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const validation = validate();

  return (
    <div className="min-h-screen bg-transparent transition-colors">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-40 bg-background/50 backdrop-blur-2xl border-b border-white/5 px-4 md:px-8 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/5">
              <FileOutput className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-base tracking-tight font-display">
                Gerador de Relatórios de Auditoria
              </h1>
              <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.2em]">
                {report.doc_id}
              </p>
            </div>
            {unsavedChanges ? (
              <span
                key="status-saving"
                className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold uppercase tracking-widest bg-amber-500/5 border border-amber-500/20 px-3 py-1 rounded-full animate-pulse"
              >
                <AlertCircle className="w-3 h-3" /> Salvando...
              </span>
            ) : (
              <span
                key="status-synced"
                className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/5 border border-emerald-500/20 px-3 py-1 rounded-full"
              >
                <CheckCircle2 className="w-3 h-3" /> Sincronizado
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowReset(true)}
              className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-destructive/5 hover:text-destructive rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              Resetar
            </Button>
            <Button
              onClick={() => setShowExport(true)}
              className="text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-12">
        {/* ─── Header Fields ─── */}
        <section className="glass-card soft-shadow bg-muted/20 dark:bg-card/40 backdrop-blur-xl rounded-[3rem] border border-border p-10 space-y-8">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
              Cabeçalho do Relatório
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                Doc ID
              </label>
              <Input
                value={report.doc_id}
                onChange={(e) => updateField("doc_id", e.target.value)}
                className="bg-card/60 border border-border rounded-2xl px-6 py-4 focus:bg-card transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                Projeto
              </label>
              <div className="relative">
                <Select
                  value={report.program_id}
                  onChange={(e) => updateField("program_id", e.target.value)}
                  className="bg-card/60 border-border h-[54px] rounded-2xl pr-10"
                >
                  <option value="" className="bg-background text-foreground">
                    Selecione o projeto...
                  </option>
                  {programs.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      className="bg-background text-foreground"
                    >
                      {p.name}
                    </option>
                  ))}
                </Select>
                <Plus className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 pointer-events-none rotate-45" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">
                Empresa
              </label>
              <Input
                placeholder="Nome completo"
                value={report.lead_auditor}
                onChange={(e) => updateField("lead_auditor", e.target.value)}
                className="bg-card/60 border border-border rounded-2xl px-6 py-4"
              />
            </div>
          </div>
        </section>

        {/* ─── Executive Summary ─── */}
        <section className="glass-card soft-shadow bg-muted/20 dark:bg-card/40 backdrop-blur-xl rounded-[3rem] border border-border p-10 space-y-6">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
            Sumário Executivo
          </h2>
          <textarea
            rows={5}
            className="w-full text-sm p-8 bg-card/60 border border-border rounded-[2rem] focus:bg-card outline-none transition-all resize-none text-foreground placeholder-muted-foreground/20 font-medium leading-relaxed"
            placeholder="Descreva o contexto, os objetivos e as principais conclusões da auditoria..."
            value={report.executive_summary}
            onChange={(e) => updateField("executive_summary", e.target.value)}
          />
        </section>

        {/* ─── Findings (5W2H) ─── */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground font-display tracking-tight">
                Achados de Auditoria
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
                Registro de não conformidades (5W2H)
              </p>
            </div>
            <Button
              onClick={() => addFinding()}
              className="bg-card/40 hover:bg-card text-muted-foreground rounded-2xl px-6 py-3 transition-all flex items-center gap-2 group border border-border"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>Novo Registro</span>
            </Button>
          </div>

          <div className="space-y-8" key="findings-content">
            {report.findings.length === 0 ? (
              <div
                key="empty-findings"
                className="text-center py-24 glass-card bg-muted/20 dark:bg-card/40 backdrop-blur-sm rounded-[3rem] border border-border soft-shadow"
              >
                <div className="w-20 h-20 rounded-[2rem] bg-muted/40 flex items-center justify-center mx-auto mb-6 shadow-xl border border-border">
                  <AlertCircle className="w-10 h-10 text-muted-foreground/20" />
                </div>
                <p className="text-sm font-medium text-muted-foreground/60 mb-8">
                  Nenhum achado registrado nesta auditoria
                </p>
                <div className="flex justify-center">
                  <Button
                    variant="primary"
                    className="rounded-2xl px-10 py-6 text-base font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all duration-300"
                    onClick={() => addFinding()}
                  >
                    <Plus className="w-5 h-5 mr-3" /> Começar Agora
                  </Button>
                </div>
              </div>
            ) : (
              <div key="findings-list" className="space-y-8">
                {report.findings.map((finding, i) => (
                  <ReportFindingCard
                    key={finding.id}
                    finding={finding}
                    index={i}
                    onUpdate={updateFinding}
                    onUpdate5W2H={updateFinding5W2H}
                    onRemove={removeFinding}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── Final Opinion ─── */}
        <section className="glass-card soft-shadow bg-muted/20 dark:bg-card/40 backdrop-blur-xl rounded-[3rem] border border-border p-10 space-y-6">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
            Parecer Final
          </h2>
          <textarea
            rows={5}
            className="w-full text-sm p-8 bg-card/60 border border-border rounded-[2rem] focus:bg-card outline-none transition-all resize-none text-foreground placeholder-muted-foreground/20 font-medium leading-relaxed"
            placeholder="Parecer final do auditor sobre o estado geral e as recomendações..."
            value={report.final_opinion}
            onChange={(e) => updateField("final_opinion", e.target.value)}
          />
        </section>

        {/* ─── Signatures ─── */}
        <ReportSignatures
          signatures={report.signatures}
          onAdd={addSignature}
          onRemove={removeSignature}
        />

        {/* Validation Summary */}
        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <div className="glass-card bg-card dark:bg-card/40 rounded-[2.5rem] border border-border p-10 space-y-6 soft-shadow backdrop-blur-md">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
              Checklist de Validação do Relatório
            </h3>
            <div className="space-y-4">
              {validation.errors.map((e, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-destructive/5 rounded-2xl border border-destructive/10 text-xs text-destructive font-medium"
                >
                  <AlertCircle className="w-4 h-4" /> {e}
                </div>
              ))}
              {validation.warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-xs text-amber-500 font-medium"
                >
                  <span className="text-base leading-none">⚠</span> {w}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        report={report}
        onExport={exportReport}
        validationErrors={validation.errors}
        validationWarnings={validation.warnings}
      />

      {/* Reset Confirmation */}
      {showReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            onClick={() => setShowReset(false)}
          />
          <div className="glass-card bg-card border border-border rounded-[3rem] p-12 max-w-md w-full shadow-2xl space-y-8 relative z-10 text-center scale-up">
            <div className="w-20 h-20 rounded-[2rem] bg-destructive/10 flex items-center justify-center mx-auto mb-6 shadow-xl border border-destructive/20 group">
              <RotateCcw className="w-10 h-10 text-destructive group-hover:rotate-[-120deg] transition-all duration-700" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-foreground font-display tracking-tight">
                Resetar Relatório?
              </h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Todos os dados do relatório atual serão permanentemente
                removidos. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowReset(false)}
                className="flex-1 py-4 rounded-2xl bg-foreground/5 text-muted-foreground hover:bg-white hover:text-black transition-all font-bold uppercase tracking-widest text-[10px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  resetReport();
                  setShowReset(false);
                }}
                className="flex-1 py-4 rounded-2xl bg-destructive text-white shadow-xl shadow-destructive/20 hover:scale-105 active:scale-95 transition-all font-bold uppercase tracking-widest text-[10px]"
              >
                Limpar Tudo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
