import { lazy } from "react";
import type { ModuleConfig } from "../registry";

const GitHubOverview = lazy(() => import("./pages/GitHubOverview"));
const GitHubOrganizations = lazy(() => import("./pages/GitHubOrganizations"));
const GitHubRepositories = lazy(() => import("./pages/GitHubRepositories"));
const GitHubIssuesPRs = lazy(() => import("./pages/GitHubIssuesPRs"));
const GitHubSecurity = lazy(() => import("./pages/GitHubSecurity"));
const GitHubMetrics = lazy(() => import("./pages/GitHubMetrics"));

export const githubModuleConfig: ModuleConfig = {
  id: "github",
  name: "Auditar Código",
  description:
    "Governança de código, segurança e métricas de repositórios GitHub",
  icon: "Github",
  version: "1.0.0",

  permissions: ["github.view", "github.manage", "github.admin"],

  routes: [
    {
      path: "github",
      element: <GitHubOverview />,
      handle: { title: "Visão Geral" },
    },
    {
      path: "github/organizations",
      element: <GitHubOrganizations />,
      handle: { title: "Gerir Organizações" },
    },
    {
      path: "github/repositories",
      element: <GitHubRepositories />,
      handle: { title: "Monitorar Repositórios" },
    },
    {
      path: "github/issues-prs",
      element: <GitHubIssuesPRs />,
      handle: { title: "Revisar Issues e PRs" },
    },
    {
      path: "github/security",
      element: <GitHubSecurity />,
      handle: { title: "Verificar Segurança" },
    },
    {
      path: "github/metrics",
      element: <GitHubMetrics />,
      handle: { title: "Analisar Métricas" },
    },
  ],

  navigation: [
    {
      label: "Visão Geral",
      path: "github",
      icon: "LayoutDashboard",
    },
    {
      label: "Gerir Organizações",
      path: "github/organizations",
      icon: "Building2",
    },
    {
      label: "Monitorar Repositórios",
      path: "github/repositories",
      icon: "GitBranch",
    },
    {
      label: "Revisar Issues e PRs",
      path: "github/issues-prs",
      icon: "GitPullRequest",
    },
    {
      label: "Verificar Segurança",
      path: "github/security",
      icon: "ShieldAlert",
    },
    {
      label: "Analisar Métricas",
      path: "github/metrics",
      icon: "BarChart3",
    },
  ],

  settings: {},

  onModuleLoad: async () => {
    console.log("✅ Módulo GitHub Governance carregado");
  },

  onModuleUnload: async () => {
    console.log("🔌 Módulo GitHub Governance descarregado");
  },
};

export default githubModuleConfig;
