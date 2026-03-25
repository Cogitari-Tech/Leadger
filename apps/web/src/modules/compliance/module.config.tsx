import { lazy } from "react";
import { ModuleConfig } from "../registry";

const ComplianceDashboard = lazy(() => import("./pages/ComplianceDashboard"));
const Frameworks = lazy(() => import("./pages/Frameworks"));
const SwotAnalysis = lazy(() => import("./pages/SwotAnalysis"));
const RiskAssessment = lazy(() => import("./pages/RiskAssessment"));

export const complianceModuleConfig: ModuleConfig = {
  id: "compliance",
  name: "Garantir Conformidade",
  description:
    "Gestão de frameworks, matriz estratégica (SWOT) e mapeamento de riscos",
  icon: "ShieldCheck",
  version: "1.0.0",
  permissions: ["compliance.view", "compliance.manage"],
  routes: [
    {
      path: "compliance",
      element: <ComplianceDashboard />,
      handle: { title: "Visão Geral" },
    },
    {
      path: "compliance/frameworks",
      element: <Frameworks />,
      handle: { title: "Aplicar Frameworks" },
    },
    {
      path: "compliance/swot",
      element: <SwotAnalysis />,
      handle: { title: "Mapear SWOT" },
    },
    {
      path: "compliance/risks",
      element: <RiskAssessment />,
      handle: { title: "Avaliar Riscos" },
    },
  ],
  navigation: [
    {
      label: "Visão Geral",
      path: "compliance",
      icon: "LayoutDashboard",
    },
    {
      label: "Aplicar Frameworks",
      path: "compliance/frameworks",
      icon: "ShieldAlert",
    },
    {
      label: "Mapear SWOT",
      path: "compliance/swot",
      icon: "Crosshair",
    },
    {
      label: "Avaliar Riscos",
      path: "compliance/risks",
      icon: "ActivitySquare",
    },
  ],
  settings: {},
};

export default complianceModuleConfig;
