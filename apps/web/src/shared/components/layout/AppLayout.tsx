import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { moduleRegistry } from "../../../modules/registry";
import { useAuth } from "../../../modules/auth/context/AuthContext";
import { ThemeToggle } from "../ui/ThemeToggle";
import { NotificationBell } from "../../../modules/notifications/components/NotificationBell";
import {
  Menu,
  X,
  ChevronDown,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Circle,
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
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >(() => {
    // By default, all modules are expanded
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
      {/* Absolute Background Layer for depth */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Glassmorphic macOS style */}
      <aside
        className={`
        fixed md:relative z-50 h-full flex-shrink-0 border-r border-border/40 bg-background/80 backdrop-blur-2xl flex flex-col overflow-hidden transition-all duration-300
        ${isCollapsed ? "w-16" : "w-72"}
        ${isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div
          className={`relative z-10 flex ${isCollapsed ? "flex-col gap-4 py-4 px-2 justify-center" : "p-4 justify-between"} items-center border-b border-border/20`}
        >
          {isCollapsed ? (
            <Link
              to="/dashboard"
              className="flex justify-center w-8 h-8 overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
              title="Ir para o Início"
            >
              <img
                src="/images/logo-cogitari.png"
                alt="C"
                className="h-8 w-full object-cover object-left mix-blend-screen hidden dark:block"
              />
              <img
                src="/images/logo-cogitari-dark.png"
                alt="C"
                className="h-8 w-full object-cover object-left block dark:hidden"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/images/logo-cogitari.png";
                }}
              />
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 group w-full mr-2"
            >
              <div className="w-7 h-7 flex-shrink-0 relative">
                <img
                  src="/images/logo-cogitari.png"
                  alt="Cogitari"
                  className="h-full w-full object-cover mix-blend-screen hidden dark:block transition-all group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                />
                <img
                  src="/images/logo-cogitari-dark.png"
                  alt="Cogitari"
                  className="h-full w-full object-cover block dark:hidden transition-all group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.15)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/images/logo-cogitari.png";
                  }}
                />
              </div>
              <span className="font-bold text-base tracking-tight leading-none text-foreground truncate">
                Cogitari{" "}
                <span className="font-light opacity-70">Governance</span>
              </span>
            </Link>
          )}
          {/* Desktop collapse toggle */}
          <button
            className={`hidden md:flex p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 ${isCollapsed ? "mb-1" : ""}`}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expandir menu" : "Minimizar menu"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
          {/* Mobile close button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="relative z-10 flex-1 mt-4 overflow-y-auto custom-scrollbar px-2">
          {/* Static Home / Painel Menu Item */}
          <div className="mb-4">
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              title="Painel de Governança"
              className={`group flex items-center justify-between px-3 py-2 text-[13px] font-medium transition-all rounded-lg ${
                location.pathname === "/dashboard"
                  ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0 w-full">
                <div
                  className={`flex items-center justify-center flex-shrink-0 transition-colors ${location.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                >
                  <LucideIcons.Home className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <span className="truncate">Painel de Governança</span>
                )}
              </div>
            </Link>
          </div>

          {navigation.map((section) => {
            const isExpanded = expandedModules[section.module];

            // Helper precise path matcher
            // example: location /dashboard/admin/team vs /admin/team
            const checkIsActive = (targetPath: string) => {
              // Normaliza para ter a barra
              const current = location.pathname.endsWith("/")
                ? location.pathname
                : location.pathname + "/";
              // A URL pode vir tanto como '/dashboard/X' ou '/X', ou 'X' no map.
              const target = targetPath.startsWith("/")
                ? targetPath
                : `/${targetPath}`;

              // Casos comuns:
              // Se o current é /dashboard/admin/roles/ e o target é /admin/roles/
              return current.includes(
                target.endsWith("/") ? target : target + "/",
              );
            };

            // Determine if any item in this section is currently active
            const isSectionActive = section.items.some((item) =>
              checkIsActive(item.path),
            );

            // Get the category icon
            const CategoryIcon =
              ((section as any).icon &&
                (LucideIcons as any)[(section as any).icon]) ||
              LucideIcons.Folder;

            return (
              <div
                key={section.module}
                className={`mb-6 ${isCollapsed && !isSectionActive ? "opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all" : ""}`}
              >
                {isCollapsed ? (
                  <div
                    className="flex justify-center mb-2 mt-2"
                    title={section.module}
                  >
                    <div
                      className={`flex items-center justify-center flex-shrink-0 transition-colors ${isSectionActive ? "text-primary shadow-sm drop-shadow-md" : "text-muted-foreground/60"}`}
                    >
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => toggleModule(section.module)}
                    className="w-full flex items-center justify-between px-3 mb-2 group cursor-pointer"
                  >
                    <h3
                      className={`text-[11px] font-semibold uppercase tracking-widest transition-colors ${isSectionActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground/80"}`}
                    >
                      {section.module}
                    </h3>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isSectionActive ? "text-primary" : "text-muted-foreground/40"} ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                )}

                <div
                  className={`space-y-1 overflow-visible transition-all duration-300 ${!isCollapsed && !isExpanded ? "max-h-0 opacity-0 hidden" : isCollapsed && !isSectionActive ? "hidden" : "max-h-[1000px] opacity-100"}`}
                >
                  {section.items.map((item) => {
                    // Check if route matches to ensure proper highlighting for sub-paths
                    const isActive = checkIsActive(item.path);

                    // Get the icon component dynamically from lucide-react, or default to Circle
                    const Icon =
                      (item.icon && (LucideIcons as any)[item.icon]) || Circle;

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        title={item.label}
                        className={`group flex items-center justify-between px-3 py-2 text-[13px] font-medium transition-all rounded-lg
                          ${
                            isActive
                              ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          } ${isCollapsed ? "justify-center" : ""}`}
                      >
                        <div className="flex items-center gap-3 min-w-0 w-full">
                          <div
                            className={`flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          {!isCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="relative z-10 p-3 border-t border-border/20 flex flex-col items-center gap-2">
          <Link
            to="/dashboard/profile"
            title="Meu Perfil"
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors w-full ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.name || "Meu Perfil"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.role?.display_name || user?.role?.name || ""}
                </p>
              </div>
            )}
          </Link>
          {/* Logout Button */}
          <button
            onClick={async () => {
              await signOut();
              navigate("/", { replace: true });
            }}
            title="Sair da conta"
            className={`flex items-center gap-3 p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full ${isCollapsed ? "justify-center" : ""}`}
          >
            <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <span className="text-xs font-medium">Sair da conta</span>
            )}
          </button>
          <div
            className={`flex items-center w-full mt-1 ${isCollapsed ? "justify-center" : "justify-between px-2"}`}
          >
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-tighter">
                  Versão
                </span>
                <span className="text-xs font-semibold text-foreground/80">
                  2.5.0
                </span>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full bg-transparent flex flex-col relative overflow-hidden z-10">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="md:hidden flex-shrink-0 flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-xl z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-foreground p-1"
          >
            <Menu className="w-6 h-6" />
          </button>
          <img
            src="/images/logo-cogitari.png"
            alt="Cogitari"
            className="h-6 w-auto mix-blend-screen"
          />
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>

        {/* Topbar with notifications */}
        <div className="hidden md:flex flex-shrink-0 items-center justify-end gap-3 px-6 py-3 border-b border-border/20 bg-background/50 backdrop-blur-xl z-30">
          <NotificationBell />
        </div>

        <div className="flex-1 overflow-auto relative custom-scrollbar">
          <React.Suspense
            fallback={
              <div className="flex h-full items-center justify-center bg-transparent">
                <div className="flex flex-col items-center gap-6">
                  <div className="h-12 w-12 animate-spin border-4 border-primary border-t-transparent rounded-full shadow-lg shadow-primary/20" />
                  <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    Preparando ambiente...
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
