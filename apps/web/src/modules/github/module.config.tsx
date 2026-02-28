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
  name: "GitHub Governance",
  description:
    "Governança de código, segurança e métricas de repositórios GitHub",
  icon: "🔒",
  version: "1.0.0",

  permissions: ["github.view", "github.manage", "github.admin"],

  routes: [
    {
      path: "github",
      element: <GitHubOverview />,
      handle: { title: "GitHub Governance" },
    },
    {
      path: "github/organizations",
      element: <GitHubOrganizations />,
      handle: { title: "Organizações" },
    },
    {
      path: "github/repositories",
      element: <GitHubRepositories />,
      handle: { title: "Repositórios" },
    },
    {
      path: "github/issues-prs",
      element: <GitHubIssuesPRs />,
      handle: { title: "Issues & PRs" },
    },
    {
      path: "github/security",
      element: <GitHubSecurity />,
      handle: { title: "Segurança" },
    },
    {
      path: "github/metrics",
      element: <GitHubMetrics />,
      handle: { title: "Métricas de Governança" },
    },
  ],

  navigation: [
    {
      label: "Overview",
      path: "github",
      icon: "LayoutDashboard",
    },
    {
      label: "Organizações",
      path: "github/organizations",
      icon: "Building2",
    },
    {
      label: "Repositórios",
      path: "github/repositories",
      icon: "GitBranch",
    },
    {
      label: "Issues & PRs",
      path: "github/issues-prs",
      icon: "GitPullRequest",
    },
    {
      label: "Segurança",
      path: "github/security",
      icon: "ShieldAlert",
    },
    {
      label: "Métricas",
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
