import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { moduleRegistry } from "../../../modules/registry";
import { useAuth } from "../../../modules/auth/context/AuthContext";
import { ThemeToggle } from "../ui/ThemeToggle";
import { NotificationBell } from "../../../modules/notifications/components/NotificationBell";
import {
  Menu,
  X,
  PanelLeftClose,
  LogOut,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  User,
  Home,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

export const AppLayout: React.FC = () => {
  const { permissions, user, signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role?.name === "admin" || user?.role?.name === "owner";
  const navigation = isAdmin
    ? moduleRegistry.getAllNavigation()
    : moduleRegistry
        .getAccessibleModules(permissions)
        .map((m) => ({ module: m.name, icon: m.icon, items: m.navigation }));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const tooltipDescriptions: Record<string, string> = {
    "Gerir Auditorias":
      "Crie programas, responda checklists e acompanhe não-conformidades.",
    "Gerir Finanças": "Acompanhe fluxo de caixa, burn rate e contas bancárias.",
    "Garantir Conformidade":
      "Mapeie frameworks estruturados e controle matrizes de riscos.",
    "Auditar Código":
      "Integre repositórios para auditoria contínua de segurança.",
    "Administrar Sistema":
      "Gerencie a equipe, cargos, faturas e configurações do sistema.",
  };

  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >(() => {
    const initial: Record<string, boolean> = {};
    navigation.forEach((nav) => {
      initial[nav.module] = true;
    });
    return initial;
  });

  const toggleModule = (moduleName: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  const location = useLocation();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans relative">
      {/* Background Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      {/* Mobile Mask */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 h-full flex-shrink-0 border-r border-border/40 bg-background/80 backdrop-blur-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-72"
        } ${isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"}`}
      >
        <div
          className={`relative z-10 flex ${isCollapsed ? "flex-col gap-4 py-4 px-2 justify-center" : "p-4 justify-between"} items-center border-b border-border/20`}
        >
          {isCollapsed ? (
            <Link to="/dashboard" className="flex justify-center flex-shrink-0">
              <img
                src="/images/favicon.webp"
                alt="Leadgers"
                className="w-8 h-8 rounded-lg"
              />
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 group w-full mr-2"
            >
              <img
                src="/images/logo-light.webp"
                alt="Leadgers"
                className="h-6 w-auto hidden dark:block"
              />
              <img
                src="/images/logo-dark.webp"
                alt="Leadgers"
                className="h-6 w-auto block dark:hidden"
              />
            </Link>
          )}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="relative z-10 flex-1 mt-4 overflow-y-auto custom-scrollbar px-2">
          {/* Dashboard Home */}
          <div className="mb-4">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group flex items-center px-3 py-2 text-[13px] font-medium transition-all rounded-lg ${
                location.pathname === "/dashboard"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 truncate">Painel de Governança</span>
              )}
            </Link>
          </div>

          {navigation.map((section) => {
            const isExpanded = expandedModules[section.module];
            const checkIsActive = (path: string) =>
              location.pathname.includes(path);
            const isSectionActive = section.items.some((item) =>
              checkIsActive(item.path),
            );
            const CategoryIcon = (LucideIcons as any)[section.icon] || BookOpen;

            return (
              <div key={section.module} className="mb-6">
                <div
                  className={`flex items-center px-3 mb-2 ${isCollapsed ? "justify-center" : "justify-between"}`}
                >
                  {!isCollapsed ? (
                    <>
                      <button
                        onClick={() => toggleModule(section.module)}
                        className={`flex-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest ${
                          isSectionActive
                            ? "text-primary"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {section.module}
                        <PanelLeftClose
                          className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : "-rotate-90"}`}
                        />
                      </button>
                      <button
                        data-tooltip={section.module}
                        onClick={() =>
                          setActiveTooltip(
                            activeTooltip === section.module
                              ? null
                              : section.module,
                          )
                        }
                        className="ml-2 text-muted-foreground/40 hover:text-primary transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                      {activeTooltip === section.module && (
                        <>
                          {(() => {
                            const btn = document.querySelector(
                              `[data-tooltip="${section.module}"]`,
                            );
                            const rect = btn?.getBoundingClientRect();
                            if (!rect) return null;
                            return createPortal(
                              <>
                                <div
                                  className="fixed inset-0 z-[9998]"
                                  onClick={() => setActiveTooltip(null)}
                                />
                                <div
                                  className="fixed z-[9999] w-56 p-3 text-xs bg-popover border border-border rounded-xl shadow-xl"
                                  style={{
                                    top: rect.top,
                                    left: rect.right + 8,
                                  }}
                                >
                                  {tooltipDescriptions[section.module]}
                                </div>
                              </>,
                              document.body,
                            );
                          })()}
                        </>
                      )}
                    </>
                  ) : (
                    <CategoryIcon
                      className={`w-5 h-5 ${isSectionActive ? "text-primary" : "text-muted-foreground/40"}`}
                    />
                  )}
                </div>

                {(!isCollapsed || isSectionActive) &&
                  (isExpanded || isCollapsed) && (
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = checkIsActive(item.path);
                        const Icon =
                          (LucideIcons as any)[item.icon] || BookOpen;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center px-3 py-2 text-[13px] font-medium transition-all rounded-lg ${
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted/50"
                            } ${isCollapsed ? "justify-center" : ""}`}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && (
                              <span className="ml-3 truncate">
                                {item.label}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
              </div>
            );
          })}
        </nav>

        <div className="relative z-10 p-3 border-t border-border/20 flex flex-col gap-2">
          {/* Manual de Uso */}
          <Link
            to="/dashboard/manual-uso"
            className={`flex items-center px-3 py-2 text-[13px] font-medium transition-all rounded-lg ${
              location.pathname === "/dashboard/manual-uso"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50"
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <BookOpen className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="ml-3 truncate">Manual de Uso</span>
            )}
          </Link>

          <Link
            to="/dashboard/profile"
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">
                  {user?.name || "Perfil"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.role?.display_name || user?.role?.name}
                </p>
              </div>
            )}
          </Link>

          <button
            onClick={async () => {
              await signOut();
              navigate("/", { replace: true });
            }}
            className={`flex items-center gap-3 p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            {!isCollapsed && <span className="text-xs font-medium">Sair</span>}
          </button>

          <div className="flex justify-center py-2">
            <ThemeToggle />
          </div>

          <div
            className={`flex items-center justify-between px-2 mt-1 ${isCollapsed ? "hidden" : ""}`}
          >
            <span className="text-[10px] font-bold text-muted-foreground/30">
              Leadgers © 2026
            </span>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="flex justify-center p-2 hover:text-primary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-1">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src="/images/logo-light.webp"
              alt="Leadgers"
              className="h-5 w-auto hidden dark:block"
            />
            <img
              src="/images/logo-dark.webp"
              alt="Leadgers"
              className="h-5 w-auto block dark:hidden"
            />
          </div>
          <div className="w-6" />
        </div>

        <div className="hidden md:flex flex-shrink-0 items-center justify-end px-6 py-3 border-b border-border/20 bg-background/50 backdrop-blur-xl">
          <NotificationBell />
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <React.Suspense
            fallback={
              <div className="flex h-full items-center justify-center p-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-10 w-10 animate-spin border-4 border-primary border-t-transparent rounded-full" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Iniciando...
                  </p>
                </div>
              </div>
            }
          >
            <div className="p-6 md:p-10 lg:p-12 h-full">
              <Outlet />
            </div>
          </React.Suspense>
        </div>
      </main>
    </div>
  );
};
