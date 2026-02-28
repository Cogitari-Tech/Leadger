import { ModuleConfig } from "../registry";

import { ProjectsListPage } from "./pages/ProjectsListPage";
import { ProjectDetailsPage } from "./pages/ProjectDetailsPage";

const projectsModule: ModuleConfig = {
  id: "projects",
  name: "Projetos",
  icon: "Briefcase",
  version: "1.0.0",
  description: "Gerenciamento de projetos e auditorias",
  settings: {},
  permissions: [
    "projects.view",
    "projects.create",
    "projects.edit",
    "projects.delete",
    "projects.manage",
  ],
  navigation: [
    {
      path: "projects",
      label: "Projetos",
      icon: "Briefcase",
    },
  ],
  routes: [
    {
      path: "projects",
      element: <ProjectsListPage />,
    },
    {
      path: "projects/:id",
      element: <ProjectDetailsPage />,
    },
  ],
};

export default projectsModule;
