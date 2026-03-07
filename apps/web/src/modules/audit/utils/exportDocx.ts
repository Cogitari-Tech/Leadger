import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  Packer,
} from "docx";
import { saveAs } from "file-saver";
import type { AuditReport } from "../types/audit.types";

const BRAND_COLOR = "EA580C"; // orange-600

function label(text: string): TextRun {
  return new TextRun({
    text,
    bold: true,
    size: 18,
    font: "Arial",
    color: "666666",
  });
}

function value(text: string): TextRun {
  return new TextRun({ text, size: 22, font: "Arial" });
}

function heading(
  text: string,
  level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_2,
) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        font: "Arial",
        color: BRAND_COLOR,
      }),
    ],
  });
}

function infoRow(labelText: string, valueText: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [new Paragraph({ children: [label(labelText)] })],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [new Paragraph({ children: [value(valueText || "—")] })],
      }),
    ],
  });
}

export async function exportDocx(report: AuditReport): Promise<void> {
  const findingSections = report.findings.flatMap((f, i) => {
    const num = String(i + 1).padStart(2, "0");
    const riskLabels: Record<string, string> = {
      critical: "Crítico",
      high: "Alto",
      medium: "Médio",
      low: "Baixo",
    };

    return [
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: `Achado #${num}`,
            bold: true,
            size: 24,
            font: "Arial",
          }),
          new TextRun({
            text: `  [${riskLabels[f.risk_level] ?? f.risk_level}]`,
            bold: true,
            size: 20,
            font: "Arial",
            color:
              f.risk_level === "critical" || f.risk_level === "high"
                ? "CC0000"
                : "996600",
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          infoRow("O QUÊ (What):", f.analysis.what),
          infoRow("POR QUÊ (Why):", f.analysis.why),
          infoRow("ONDE (Where):", f.analysis.where),
          infoRow("QUANDO (When):", f.analysis.when),
          infoRow("QUEM (Who):", f.analysis.who),
          infoRow("COMO (How):", f.analysis.how),
          infoRow("QUANTO (How Much):", f.analysis.howMuch),
        ],
      }),
      ...(f.code_snippet
        ? [
            new Paragraph({
              spacing: { before: 100 },
              children: [label("Trecho de Código / Log:")],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: f.code_snippet,
                  font: "Consolas",
                  size: 18,
                  color: "333333",
                }),
              ],
            }),
          ]
        : []),
    ];
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } },
        },
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "RELATÓRIO DE AUDITORIA",
                bold: true,
                size: 36,
                font: "Arial",
                color: BRAND_COLOR,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "Leadgers Tech",
                size: 22,
                font: "Arial",
                color: "888888",
              }),
              new TextRun({
                text: `  •  ${report.doc_id}`,
                size: 20,
                font: "Arial",
                color: "888888",
              }),
            ],
          }),

          // Info table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              infoRow("Empresa Cliente:", report.client_name),
              infoRow("Projeto / Módulo:", report.project_name),
              infoRow("Ambiente:", report.environment),
              infoRow("Período:", `${report.start_date} a ${report.end_date}`),
              infoRow("Auditor Líder:", report.lead_auditor),
            ],
          }),

          // Executive Summary
          heading("1. Sumário Executivo"),
          new Paragraph({
            spacing: { after: 200 },
            children: [value(report.executive_summary || "Não informado.")],
          }),

          // Findings
          heading("2. Registro de Ocorrências (5W2H)"),
          ...findingSections,

          // Final Opinion
          heading("3. Parecer Final"),
          new Paragraph({
            spacing: { after: 200 },
            children: [value(report.final_opinion || "Não informado.")],
          }),

          // Signatures
          heading("4. Assinaturas e Responsabilidade"),
          ...report.signatures.map(
            (s) =>
              new Paragraph({
                spacing: { before: 100 },
                children: [
                  new TextRun({
                    text: s.name,
                    bold: true,
                    size: 22,
                    font: "Arial",
                  }),
                  new TextRun({
                    text: ` — ${s.role}`,
                    size: 20,
                    font: "Arial",
                    color: "666666",
                  }),
                  new TextRun({
                    text: `  (${s.signed_at})`,
                    size: 18,
                    font: "Arial",
                    color: "999999",
                  }),
                ],
              }),
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const clientSlug = (report.client_name || "Cliente").replace(/\s+/g, "_");
  const dateStr = new Date().toISOString().split("T")[0];
  saveAs(blob, `Auditoria_${clientSlug}_${dateStr}.docx`);
}
