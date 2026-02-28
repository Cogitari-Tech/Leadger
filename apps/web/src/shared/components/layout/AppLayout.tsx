import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { moduleRegistry } from "../../../modules/registry";
import { useAuth } from "../../../modules/auth/context/AuthContext";
import { ThemeToggle } from "../ui/ThemeToggle";
import { NotificationBell } from "../../../modules/notifications/components/NotificationBell";
import {
  Menu,
  X,
  ChevronRight,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";

export const AppLayout: React.FC = () => {
  const { permissions, user, signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role?.name === "admin" || user?.role?.name === "owner";
  const navigation = isAdmin
    ? moduleRegistry.getAllNavigation()
    : moduleRegistry
        .getAccessibleModules(permissions)
        .map((m) => ({ module: m.name, items: m.navigation }));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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
        <div className="relative z-10 p-4 flex justify-between items-center border-b border-border/20">
          {isCollapsed ? (
            <div
              className="flex justify-center w-full overflow-hidden"
              title="Cogitari Governance"
            >
              <img
                src="/images/logo-cogitari.png"
                alt="C"
                className="h-6 w-6 object-cover object-left mix-blend-screen hidden dark:block"
              />
              <img
                src="/images/logo-cogitari-dark.png"
                alt="C"
                className="h-6 w-6 object-cover object-left block dark:hidden"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/images/logo-cogitari.png";
                }}
              />
            </div>
          ) : (
            <>
              <img
                src="/images/logo-cogitari.png"
                alt="Cogitari Governance"
                className="h-7 w-auto mix-blend-screen hidden dark:block transition-all opacity-90 hover:opacity-100"
              />
              <img
                src="/images/logo-cogitari-dark.png"
                alt="Cogitari Governance"
                className="h-7 w-auto block dark:hidden transition-all opacity-90 hover:opacity-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/images/logo-cogitari.png";
                }}
              />
            </>
          )}
          {/* Desktop collapse toggle */}
          <button
            className="hidden md:flex p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expandir menu" : "Minimizar menu"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
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
          {navigation.map((section) => (
            <div key={section.module} className="mb-6">
              {isCollapsed ? (
                <div
                  className="flex justify-center mb-2"
                  title={section.module}
                >
                  <div className="h-px w-6 bg-border/50 rounded-full" />
                </div>
              ) : (
                <h3 className="px-3 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-2">
                  {section.module}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      title={isCollapsed ? item.label : undefined}
                      className={`group flex items-center justify-between px-3 py-2 text-[13px] font-medium transition-all rounded-lg
                        ${
                          isActive
                            ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Dot indicator for active */}
                        <div
                          className={`w-1.5 h-1.5 rounded-full transition-all flex-shrink-0 ${isActive ? "bg-primary scale-100" : "bg-transparent scale-0"}`}
                        />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {isActive && !isCollapsed && (
                        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="relative z-10 p-3 border-t border-border/20 space-y-2">
          <Link
            to="/profile"
            title={isCollapsed ? "Meu Perfil" : undefined}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors"
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
            title={isCollapsed ? "Sair" : undefined}
            className="flex items-center gap-3 w-full p-2 rounded-xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <span className="text-xs font-medium">Sair da conta</span>
            )}
          </button>
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-2`}
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
