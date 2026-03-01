import { lazy } from "react";
import { ModuleConfig } from "../registry";

const ComplianceDashboard = lazy(() => import("./pages/ComplianceDashboard"));
const Frameworks = lazy(() => import("./pages/Frameworks"));
const SwotAnalysis = lazy(() => import("./pages/SwotAnalysis"));
const RiskAssessment = lazy(() => import("./pages/RiskAssessment"));

export const complianceModuleConfig: ModuleConfig = {
  id: "compliance",
  name: "Compliance & GRC",
  description:
    "Gestão de frameworks, matriz estratégica (SWOT) e mapeamento de riscos",
  icon: "ShieldCheck",
  version: "1.0.0",
  permissions: ["compliance.view", "compliance.manage"],
  routes: [
    {
      path: "compliance",
      element: <ComplianceDashboard />,
      handle: { title: "Dashboard Corporativo" },
    },
    {
      path: "compliance/frameworks",
      element: <Frameworks />,
      handle: { title: "Frameworks Normativos" },
    },
    {
      path: "compliance/swot",
      element: <SwotAnalysis />,
      handle: { title: "Matriz SWOT Estratégica" },
    },
    {
      path: "compliance/risks",
      element: <RiskAssessment />,
      handle: { title: "Risk Assessment & Heatmap" },
    },
  ],
  navigation: [
    {
      label: "Visão Geral",
      path: "compliance",
      icon: "LayoutDashboard",
    },
    {
      label: "Frameworks",
      path: "compliance/frameworks",
      icon: "ShieldAlert",
    },
    {
      label: "Matriz SWOT",
      path: "compliance/swot",
      icon: "Crosshair",
    },
    {
      label: "Risk Assessment",
      path: "compliance/risks",
      icon: "ActivitySquare",
    },
  ],
  settings: {},
};

export default complianceModuleConfig;
