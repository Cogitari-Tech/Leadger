import { useState, useCallback, useEffect, useRef } from "react";
import type {
  AuditReport,
  ReportFinding,
  ReportSignature,
  ExportFormat,
  Finding5W2H,
  FindingRiskLevel,
  FindingStatus,
} from "../types/audit.types";

const STORAGE_KEY = "cogitari_audit_report";
const SAVE_DEBOUNCE_MS = 800;

function createEmptyFinding(findingId: string = ""): ReportFinding {
  return {
    id: crypto.randomUUID(),
    finding_id: findingId,
    analysis: {
      what: "",
      why: "",
      where: "",
      when: "",
      who: "",
      how: "",
      howMuch: "",
    },
    code_snippet: "",
    task_type: "",
    risk_level: "medium" as FindingRiskLevel,
    status: "open" as FindingStatus,
    impacted_areas: [],
    evidence_links: [],
    evidence_image_url: undefined,
    notify_email: "",
    should_notify: false,
  };
}

function createEmptyReport(): AuditReport {
  return {
    program_id: "",
    doc_id: "",
    client_name: "",
    project_name: "",
    environment: "",
    start_date: "",
    end_date: "",
    lead_auditor: "",
    executive_summary: "",
    final_opinion: "",
    findings: [createEmptyFinding()],
    signatures: [],
    status: "draft",
  };
}

// ─── Validation helpers ──────────────────────────────────

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateReport(report: AuditReport): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!report.client_name.trim()) errors.push("Empresa Cliente é obrigatório");
  if (!report.project_name.trim()) errors.push("Projeto/Módulo é obrigatório");
  if (!report.start_date) errors.push("Data Início é obrigatória");
  if (!report.end_date) errors.push("Data Fim é obrigatória");
  if (!report.lead_auditor.trim()) errors.push("Auditor Líder é obrigatório");
  if (!report.executive_summary.trim())
    warnings.push("Sumário Executivo está vazio");
  if (!report.final_opinion.trim()) warnings.push("Parecer Final está vazio");

  if (report.signatures.length === 0) {
    errors.push("Pelo menos uma assinatura é obrigatória para exportar");
  }

  const emptyFindings = report.findings.filter(
    (f) => !f.analysis.what.trim() && !f.analysis.how.trim(),
  );
  if (emptyFindings.length > 0) {
    warnings.push(`${emptyFindings.length} achado(s) com campos 5W2H vazios`);
  }

  const todayStr = new Date().toISOString().split("T")[0];
  if (report.end_date && report.end_date !== todayStr) {
    warnings.push(
      `Data Fim (${report.end_date}) difere da data de hoje (${todayStr})`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─── Export: TXT ──────────────────────────────────────────

function generateTxt(report: AuditReport): string {
  let txt = `RELATÓRIO DE AUDITORIA - COGITARI TECH\n\n`;
  txt += `DOCUMENTO: ${report.doc_id}\n`;
  txt += `CLIENTE: ${report.client_name}\n`;
  txt += `PROJETO: ${report.project_name}\n`;
  txt += `AMBIENTE: ${report.environment}\n`;
  txt += `PERÍODO: ${report.start_date} a ${report.end_date}\n`;
  txt += `AUDITOR LÍDER: ${report.lead_auditor}\n\n`;
  txt += `=== SUMÁRIO EXECUTIVO ===\n${report.executive_summary}\n\n`;
  txt += `=== ACHADOS (5W2H) ===\n`;

  report.findings.forEach((f, i) => {
    txt += `\n--- Achado #${String(i + 1).padStart(2, "0")} ---\n`;
    txt += `O QUÊ: ${f.analysis.what}\n`;
    txt += `POR QUÊ: ${f.analysis.why}\n`;
    txt += `ONDE: ${f.analysis.where}\n`;
    txt += `QUANDO: ${f.analysis.when}\n`;
    txt += `QUEM: ${f.analysis.who}\n`;
    txt += `COMO: ${f.analysis.how}\n`;
    txt += `QUANTO: ${f.analysis.howMuch}\n`;
    txt += `RISCO: ${f.risk_level.toUpperCase()}\n`;
    txt += `STATUS: ${f.status}\n`;
    if (f.code_snippet) txt += `CÓDIGO:\n${f.code_snippet}\n`;
  });

  txt += `\n=== PARECER FINAL ===\n${report.final_opinion}\n\n`;
  txt += `=== ASSINATURAS ===\n`;
  report.signatures.forEach((s) => {
    txt += `${s.name} | ${s.role} | ${s.signed_at}\n`;
  });

  return txt;
}

// ─── Export: JSON ─────────────────────────────────────────

function generateJson(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}

// ─── Hook ────────────────────────────────────────────────

export function useReportGenerator() {
  const [report, setReport] = useState<AuditReport>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...createEmptyReport(),
          ...parsed,
          findings: parsed.findings || [createEmptyFinding()],
          signatures: parsed.signatures || [],
        };
      }
    } catch {
      /* ignore corrupt data */
    }
    return createEmptyReport();
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save with debounce
  const persistReport = useCallback((updatedReport: AuditReport) => {
    setUnsavedChanges(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReport));
      setUnsavedChanges(false);
    }, SAVE_DEBOUNCE_MS);
  }, []);

  // Update a top-level field
  const updateField = useCallback(
    <K extends keyof AuditReport>(field: K, value: AuditReport[K]) => {
      setReport((prev) => {
        const next = { ...prev, [field]: value };
        persistReport(next);
        return next;
      });
    },
    [persistReport],
  );

  // Finding CRUD
  const addFinding = useCallback(
    (findingId = "") => {
      setReport((prev) => {
        const next = {
          ...prev,
          findings: [...prev.findings, createEmptyFinding(findingId)],
        };
        persistReport(next);
        return next;
      });
    },
    [persistReport],
  );

  const updateFinding = useCallback(
    (id: string, updates: Partial<ReportFinding>) => {
      setReport((prev) => {
        const next = {
          ...prev,
          findings: prev.findings.map((f) =>
            f.id === id ? { ...f, ...updates } : f,
          ),
        };
        persistReport(next);
        return next;
      });
    },
    [persistReport],
  );

  const updateFinding5W2H = useCallback(
    (findingId: string, field: keyof Finding5W2H, value: string) => {
      setReport((prev) => {
        const next = {
          ...prev,
          findings: prev.findings.map((f) =>
            f.id === findingId
              ? { ...f, analysis: { ...f.analysis, [field]: value } }
              : f,
          ),
        };
        persistReport(next);
        return next;
      });
    },
    [persistReport],
  );

  const removeFinding = useCallback(
    (id: string) => {
      setReport((prev) => {
        const next = {
          ...prev,
          findings: prev.findings.filter((f) => f.id !== id),
        };
        persistReport(next);
        return next;
      });
    },
    [persistReport],
  );

  // Signatures
  const addSignature = useCallback(
    (name: string, role: string) => {
      const sig: ReportSignature = {
        name,
        role,
        signed_at: new Date().toLocaleString("pt-BR"),
      };
      setReport((prev) => {
        const existing = prev.signatures.findIndex((s) => s.name === name);
        let sigs: ReportSignature[];
        if (existing >= 0) {
          sigs = [...prev.signatures];
          sigs[existing] = sig;
        } else {
          sigs = [...prev.signatures, sig];
        }
        const next = { ...prev, signatures: sigs, status: "signed" as const };
        persistReport(next);
        return next;
      });
    },
    [persistReport],
  );

  const removeSignature = useCallback(
    (name: string) => {
      setReport((prev) => {
        const next = {
          ...prev,
          signatures: prev.signatures.filter((s) => s.name !== name),
        };
        persistReport(next);
        return next;
      });
    },
    [persistReport],
  );

  // Validation
  const validate = useCallback((): ValidationResult => {
    return validateReport(report);
  }, [report]);

  // Export dispatcher
  const exportReport = useCallback(
    async (format: ExportFormat) => {
      const clientSlug = (report.client_name || "Cliente").replace(/\s+/g, "_");
      const dateStr = new Date().toISOString().split("T")[0];
      const baseName = `Auditoria_${clientSlug}_${dateStr}`;

      if (format === "txt") {
        const { saveAs } = await import("file-saver");
        const blob = new Blob([generateTxt(report)], {
          type: "text/plain;charset=utf-8",
        });
        saveAs(blob, `${baseName}.txt`);
      } else if (format === "json") {
        const { saveAs } = await import("file-saver");
        const blob = new Blob([generateJson(report)], {
          type: "application/json;charset=utf-8",
        });
        saveAs(blob, `${baseName}.json`);
      } else if (format === "pdf") {
        // PDF generation delegated to ReportPdfDocument component
        // The caller should use @react-pdf/renderer's pdf() function
        throw new Error("Use exportPdf() from the PDF component instead.");
      } else if (format === "docx") {
        // DOCX generation delegated to generateDocx utility
        throw new Error("Use exportDocx() from the DOCX utility instead.");
      }

      updateField("status", "exported");
    },
    [report, updateField],
  );

  // Reset
  const resetReport = useCallback(() => {
    const fresh = createEmptyReport();
    setReport(fresh);
    localStorage.removeItem(STORAGE_KEY);
    setUnsavedChanges(false);
  }, []);

  // Warn before closing with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = "Você tem alterações não salvas.";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [unsavedChanges]);

  return {
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
  };
}
