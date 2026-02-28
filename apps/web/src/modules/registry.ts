// apps/web/src/modules/registry.ts
import { RouteObject } from "react-router-dom";

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  version: string;
  permissions: string[];
  routes: RouteObject[];
  navigation: NavigationItem[];
  settings: Record<string, unknown>;
  onModuleLoad?: () => Promise<void>;
  onModuleUnload?: () => Promise<void>;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  badge?: string | number;
}

class ModuleRegistry {
  private modules = new Map<string, ModuleConfig>();
  private loadedModules = new Set<string>();

  /**
   * Registra um novo módulo no sistema
   */
  register(config: ModuleConfig): void {
    if (this.modules.has(config.id)) {
      console.warn(`Módulo ${config.id} já está registrado. Substituindo...`);
    }

    this.modules.set(config.id, config);
    console.log(`📦 Módulo registrado: ${config.name} (v${config.version})`);
  }

  /**
   * Remove um módulo do registro
   */
  unregister(moduleId: string): void {
    const module = this.modules.get(moduleId);
    if (module && this.loadedModules.has(moduleId)) {
      module.onModuleUnload?.();
      this.loadedModules.delete(moduleId);
    }
    this.modules.delete(moduleId);
  }

  /**
   * Carrega um módulo (executa lifecycle hook)
   */
  async load(moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Módulo ${moduleId} não encontrado`);
    }

    if (this.loadedModules.has(moduleId)) {
      console.log(`⏭️ Módulo ${moduleId} já está carregado`);
      return;
    }

    await module.onModuleLoad?.();
    this.loadedModules.add(moduleId);
  }

  /**
   * Retorna todos os módulos registrados
   */
  getAll(): ModuleConfig[] {
    return Array.from(this.modules.values());
  }

  /**
   * Retorna um módulo específico
   */
  get(moduleId: string): ModuleConfig | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Retorna todas as rotas de todos os módulos
   */
  getAllRoutes(): RouteObject[] {
    return Array.from(this.modules.values()).flatMap((module) => module.routes);
  }

  /**
   * Retorna a navegação de todos os módulos
   */
  getAllNavigation(): Array<{ module: string; items: NavigationItem[] }> {
    return Array.from(this.modules.values()).map((module) => ({
      module: module.name,
      items: module.navigation,
    }));
  }

  /**
   * Verifica se um usuário tem permissão para acessar um módulo
   */
  hasPermission(moduleId: string, userPermissions: string[]): boolean {
    const module = this.modules.get(moduleId);
    if (!module) return false;

    return module.permissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }

  /**
   * Retorna módulos aos quais o usuário tem acesso
   */
  getAccessibleModules(userPermissions: string[]): ModuleConfig[] {
    return Array.from(this.modules.values()).filter((module) =>
      this.hasPermission(module.id, userPermissions),
    );
  }
}

// Singleton
export const moduleRegistry = new ModuleRegistry();

// Auto-registro de módulos na inicialização
export async function initializeModules(): Promise<void> {
  // Importação dinâmica dos módulos
  const auditModule = await import("./audit/module.config");
  const financeModule = await import("./finance/module.config");
  const complianceModule = await import("./compliance/module.config");
  const adminModule = await import("./admin/module.config");
  const githubModule = await import("./github/module.config");
  const projectsModule = await import("./projects/module.config");

  // Registro
  moduleRegistry.register(auditModule.default);
  moduleRegistry.register(financeModule.default);
  moduleRegistry.register(complianceModule.default);
  moduleRegistry.register(adminModule.default);
  moduleRegistry.register(githubModule.default);
  moduleRegistry.register(projectsModule.default);

  // Carregamento
  await moduleRegistry.load("audit");
  await moduleRegistry.load("finance");
  await moduleRegistry.load("compliance");
  await moduleRegistry.load("admin");
  await moduleRegistry.load("github");
  await moduleRegistry.load("projects");

  console.log("✅ Todos os módulos foram inicializados");
}
