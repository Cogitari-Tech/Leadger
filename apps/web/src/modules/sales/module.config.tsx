import { lazy } from "react";
import type { ModuleConfig } from "../registry";

const SalesPipeline = lazy(() => import("./pages/SalesPipeline"));
const MrrDashboard = lazy(() => import("./pages/MrrDashboard"));

export const salesModuleConfig: ModuleConfig = {
  id: "sales",
  name: "Comercial",
  description: "Pipeline de vendas e métricas de receita recorrente (MRR/ARR)",
  icon: "TrendingUp",
  version: "1.0.0",

  permissions: ["sales.view", "sales.create", "sales.edit", "sales.delete"],

  routes: [
    {
      path: "sales",
      element: <SalesPipeline />,
      handle: { title: "Pipeline de Vendas" },
    },
    {
      path: "sales/mrr",
      element: <MrrDashboard />,
      handle: { title: "MRR / ARR" },
    },
  ],

  navigation: [
    {
      label: "Pipeline",
      path: "/sales",
      icon: "TrendingUp",
    },
    {
      label: "MRR / ARR",
      path: "/sales/mrr",
      icon: "BarChart3",
    },
  ],

  settings: {},

  onModuleLoad: async () => {
    console.log("📦 Sales module loaded");
  },
};

export default salesModuleConfig;
