// apps/web/src/modules/finance/module.config.ts
import { lazy } from "react";
import type { ModuleConfig } from "../registry";

const CashFlow = lazy(() => import("./pages/CashFlow"));
const BalanceSheet = lazy(() => import("./pages/BalanceSheet"));
const FinanceDashboard = lazy(() => import("./pages/FinanceDashboard"));
const IncomeStatement = lazy(() => import("./pages/IncomeStatement"));
const RunwayCalculator = lazy(() => import("./pages/RunwayCalculator"));
const CapTable = lazy(() => import("./pages/CapTable"));
const UnitEconomics = lazy(() => import("./pages/UnitEconomics"));
const BurnRate = lazy(() => import("./pages/BurnRate"));
const FinancialProjections = lazy(() => import("./pages/FinancialProjections"));

export const financeModuleConfig: ModuleConfig = {
  id: "finance",
  name: "Controle Financeiro",
  description:
    "Gestão financeira completa: caixa, balanço, DRE, runway, cap table, unit economics, burn rate e projeções",
  icon: "Banknote",
  version: "2.0.0",

  // Permissões necessárias
  permissions: [
    "finance.view",
    "finance.create",
    "finance.edit",
    "finance.delete",
    "finance.export",
    "finance.cap_table",
    "finance.projections",
  ],

  // Rotas do módulo (lazy loaded)
  routes: [
    {
      path: "finance",
      element: <FinanceDashboard />,
      handle: { title: "Dashboard Financeiro" },
    },
    {
      path: "finance/cash-flow",
      element: <CashFlow />,
      handle: { title: "Fluxo de Caixa" },
    },
    {
      path: "finance/balance-sheet",
      element: <BalanceSheet />,
      handle: { title: "Balanço Patrimonial" },
    },
    {
      path: "finance/income-statement",
      element: <IncomeStatement />,
      handle: { title: "DRE" },
    },
    {
      path: "finance/runway",
      element: <RunwayCalculator />,
      handle: { title: "Runway Calculator" },
    },
    {
      path: "finance/cap-table",
      element: <CapTable />,
      handle: { title: "Cap Table" },
    },
    {
      path: "finance/unit-economics",
      element: <UnitEconomics />,
      handle: { title: "Unit Economics" },
    },
    {
      path: "finance/burn-rate",
      element: <BurnRate />,
      handle: { title: "Burn Rate" },
    },
    {
      path: "finance/projections",
      element: <FinancialProjections />,
      handle: { title: "Projeções Financeiras" },
    },
  ],

  // Links da sidebar
  navigation: [
    {
      label: "Visão Geral",
      path: "finance",
      icon: "LayoutDashboard",
    },
    {
      label: "Fluxo de Caixa",
      path: "finance/cash-flow",
      icon: "TrendingUp",
    },
    {
      label: "Balanço Patrimonial",
      path: "finance/balance-sheet",
      icon: "BarChart3",
    },
    {
      label: "DRE",
      path: "finance/income-statement",
      icon: "FileText",
    },
    {
      label: "Runway Calculator",
      path: "finance/runway",
      icon: "Fuel",
    },
    {
      label: "Cap Table",
      path: "finance/cap-table",
      icon: "Users",
    },
    {
      label: "Unit Economics",
      path: "finance/unit-economics",
      icon: "Target",
    },
    {
      label: "Burn Rate",
      path: "finance/burn-rate",
      icon: "Flame",
    },
    {
      label: "Projeções",
      path: "finance/projections",
      icon: "Presentation",
    },
  ],

  // Configurações específicas do módulo
  settings: {
    currency: "BRL",
    fiscalYearStart: "01-01",
    taxRegime: "lucro_real", // ou 'simples_nacional', 'lucro_presumido'
  },

  // Lifecycle hooks
  onModuleLoad: async () => {
    console.log("✅ Controle Financeiro carregado");
  },

  onModuleUnload: async () => {
    console.log("🔌 Controle Financeiro descarregado");
  },
};

export default financeModuleConfig;
