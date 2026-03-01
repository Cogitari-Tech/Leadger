import { lazy } from "react";
import type { ModuleConfig } from "../registry";

const TeamManagement = lazy(() =>
  import("./pages/TeamManagement").then((m) => ({ default: m.TeamManagement })),
);
const RoleManagement = lazy(() =>
  import("./pages/RoleManagement").then((m) => ({ default: m.RoleManagement })),
);
const TenantSettings = lazy(() =>
  import("./pages/TenantSettings").then((m) => ({ default: m.TenantSettings })),
);

const adminModule: ModuleConfig = {
  id: "admin",
  name: "Administração",
  description: "Gestão de equipe, funções e configurações da empresa",
  icon: "Settings",
  version: "1.0.0",
  permissions: ["admin.manage", "team.manage"],
  routes: [
    {
      path: "admin/team",
      element: <TeamManagement />,
    },
    {
      path: "admin/roles",
      element: <RoleManagement />,
    },
    {
      path: "admin/settings",
      element: <TenantSettings />,
    },
  ],
  navigation: [
    { label: "Equipe", path: "admin/team", icon: "Users" },
    { label: "Funções", path: "admin/roles", icon: "Shield" },
    { label: "Configurações", path: "admin/settings", icon: "Settings" },
  ],
  settings: {},
};

export default adminModule;
