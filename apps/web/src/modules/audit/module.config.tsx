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
  name: "Auditoria",
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
      handle: { title: "Dashboard de Auditoria" },
    },
    {
      path: "audit/programs",
      element: <AuditPrograms />,
      handle: { title: "Programas de Auditoria" },
    },
    {
      path: "audit/programs/:programId/execute",
      element: <AuditExecution />,
      handle: { title: "Execução de Auditoria" },
    },
    {
      path: "audit/programs/:programId/approve",
      element: <AuditApprovalView />,
      handle: { title: "Aprovação de Auditoria" },
    },
    {
      path: "audit/findings",
      element: <AuditFindings />,
      handle: { title: "Achados de Auditoria" },
    },
    {
      path: "audit/action-plans",
      element: <AuditActionPlans />,
      handle: { title: "Planos de Ação" },
    },
    {
      path: "audit/report",
      element: <ReportBuilder />,
      handle: { title: "Gerar Relatório" },
    },
    {
      path: "audit/report/:programId",
      element: <ReportBuilder />,
      handle: { title: "Relatório de Auditoria" },
    },
    {
      path: "audit/reports",
      element: <AuditReports />,
      handle: { title: "Relatórios Emitidos" },
    },
    {
      path: "audit/analytics",
      element: <AuditAnalytics />,
      handle: { title: "Analytics" },
    },
  ],

  navigation: [
    {
      label: "Dashboard",
      path: "audit",
      icon: "LayoutDashboard",
    },
    {
      label: "Programas",
      path: "audit/programs",
      icon: "FileText",
    },
    {
      label: "Achados",
      path: "audit/findings",
      icon: "AlertTriangle",
    },
    {
      label: "Planos de Ação",
      path: "audit/action-plans",
      icon: "ClipboardCheck",
    },
    {
      label: "Relatório",
      path: "audit/report",
      icon: "FileOutput",
    },
    {
      label: "Relatórios Emitidos",
      path: "audit/reports",
      icon: "FileDown",
    },
    {
      label: "Analytics",
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
