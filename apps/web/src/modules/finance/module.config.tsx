// apps/web/src/modules/finance/module.config.ts
import { lazy } from "react";
import type { ModuleConfig } from "../registry";

const CashFlow = lazy(() => import("./pages/CashFlow"));
const BalanceSheet = lazy(() => import("./pages/BalanceSheet"));
const FinanceDashboard = lazy(() => import("./pages/FinanceDashboard"));
const IncomeStatement = lazy(() => import("./pages/IncomeStatement"));

export const financeModuleConfig: ModuleConfig = {
  id: "finance",
  name: "Módulo Financeiro",
  description: "Controle de caixa, balanço patrimonial e DRE",
  icon: "Banknote",
  version: "1.0.0",

  // Permissões necessárias
  permissions: [
    "finance.view",
    "finance.create",
    "finance.edit",
    "finance.delete",
    "finance.export",
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
  ],

  // Configurações específicas do módulo
  settings: {
    currency: "BRL",
    fiscalYearStart: "01-01",
    taxRegime: "lucro_real", // ou 'simples_nacional', 'lucro_presumido'
  },

  // Lifecycle hooks
  onModuleLoad: async () => {
    console.log("✅ Módulo Financeiro carregado");
  },

  onModuleUnload: async () => {
    console.log("🔌 Módulo Financeiro descarregado");
  },
};

export default financeModuleConfig;
