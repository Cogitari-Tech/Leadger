import { lazy } from "react";
import type { ModuleConfig } from "../registry";

const AuditDashboard = lazy(() => import("./pages/AuditDashboard"));
const AuditPrograms = lazy(() => import("./pages/AuditPrograms"));
const AuditFindings = lazy(() => import("./pages/AuditFindings"));
const AuditActionPlans = lazy(() => import("./pages/AuditActionPlans"));
const AuditExecution = lazy(() => import("./pages/AuditExecution"));
const AuditApprovalView = lazy(() => import("./pages/AuditApprovalView"));
const ReportBuilder = lazy(() => import("./pages/ReportBuilder"));
const AuditReports = lazy(() => import("./pages/AuditReports"));
const AuditAnalytics = lazy(() => import("./pages/AuditAnalytics"));

export const auditModuleConfig: ModuleConfig = {
  id: "audit",
  name: "Gerir Auditorias",
  description: "Gestão de auditorias internas, conformidade e planos de ação",
  icon: "ClipboardCheck",
  version: "1.0.0",

  permissions: [
    "audit.view",
    "audit.create",
    "audit.edit",
    "audit.delete",
    "audit.export",
  ],

  routes: [
    {
      path: "audit",
      element: <AuditDashboard />,
      handle: { title: "Visão Geral" },
    },
    {
      path: "audit/programs",
      element: <AuditPrograms />,
      handle: { title: "Planejar Programas" },
    },
    {
      path: "audit/programs/:programId/execute",
      element: <AuditExecution />,
      handle: { title: "Executar Auditoria" },
    },
    {
      path: "audit/programs/:programId/approve",
      element: <AuditApprovalView />,
      handle: { title: "Aprovar Auditoria" },
    },
    {
      path: "audit/findings",
      element: <AuditFindings />,
      handle: { title: "Analisar Achados" },
    },
    {
      path: "audit/action-plans",
      element: <AuditActionPlans />,
      handle: { title: "Acompanhar Planos" },
    },
    {
      path: "audit/report",
      element: <ReportBuilder />,
      handle: { title: "Criar Relatório" },
    },
    {
      path: "audit/report/:programId",
      element: <ReportBuilder />,
      handle: { title: "Criar Relatório" },
    },
    {
      path: "audit/reports",
      element: <AuditReports />,
      handle: { title: "Consultar Relatórios" },
    },
    {
      path: "audit/analytics",
      element: <AuditAnalytics />,
      handle: { title: "Analisar Métricas" },
    },
  ],

  navigation: [
    {
      label: "Visão Geral",
      path: "audit",
      icon: "LayoutDashboard",
    },
    {
      label: "Planejar Programas",
      path: "audit/programs",
      icon: "FileText",
    },
    {
      label: "Analisar Achados",
      path: "audit/findings",
      icon: "AlertTriangle",
    },
    {
      label: "Acompanhar Planos",
      path: "audit/action-plans",
      icon: "ClipboardCheck",
    },
    {
      label: "Criar Relatório",
      path: "audit/report",
      icon: "FileOutput",
    },
    {
      label: "Consultar Relatórios",
      path: "audit/reports",
      icon: "FileDown",
    },
    {
      label: "Analisar Métricas",
      path: "audit/analytics",
      icon: "BarChart3",
    },
  ],

  settings: {},

  onModuleLoad: async () => {
    console.log("✅ Módulo de Auditoria carregado");
  },

  onModuleUnload: async () => {
    console.log("🔌 Módulo de Auditoria descarregado");
  },
};

export default auditModuleConfig;
