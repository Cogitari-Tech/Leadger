import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { createAppRouter } from "./router";
import { AuthProvider } from "./modules/auth/context/AuthContext";
import { initializeModules } from "./modules/registry";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";

export default function App() {
  const [router, setRouter] = useState<any>(null);

  useEffect(() => {
    initializeModules()
      .then(() => {
        setRouter(createAppRouter());
      })
      .catch((err) => {
        console.error("Falha ao inicializar os módulos:", err);
      });
  }, []);

  if (!router) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Iniciando plataforma...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
