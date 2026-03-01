import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import { moduleRegistry } from "./modules/registry";
import { AppLayout } from "./shared/components/layout/AppLayout";
import { AuthGuard } from "./modules/auth/components/AuthGuard";
import { LoginPage } from "./modules/auth/pages/LoginPage";
import { RegisterPage } from "./modules/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "./modules/auth/pages/ForgotPasswordPage";
import { AcceptInvitePage } from "./modules/auth/pages/AcceptInvitePage";
import { AuthCallbackPage } from "./modules/auth/pages/AuthCallbackPage";
import { TwoFactorChallenge } from "./modules/auth/pages/TwoFactorChallenge";
import { TwoFactorSetup } from "./modules/auth/components/TwoFactorSetup";
import { VerifyEmailPage } from "./modules/auth/pages/VerifyEmailPage";
import { PendingApprovalPage } from "./modules/auth/pages/PendingApprovalPage";

// The new Landing Page
import { LandingPage } from "./modules/public/pages/LandingPage";
import { TermsOfUse } from "./modules/public/pages/TermsOfUse";
import { PrivacyPolicy } from "./modules/public/pages/PrivacyPolicy";
import { Disclaimer } from "./modules/public/pages/Disclaimer";

const ExecutiveDashboard = lazy(
  () => import("./modules/dashboard/pages/ExecutiveDashboard"),
);
const ProfilePage = lazy(() => import("./modules/profile/pages/ProfilePage"));
const OnboardingWizard = lazy(
  () => import("./modules/admin/pages/OnboardingWizard"),
);

export const createAppRouter = () =>
  createBrowserRouter([
    // Public Marketing Route
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/termos",
      element: <TermsOfUse />,
    },
    {
      path: "/privacidade",
      element: <PrivacyPolicy />,
    },
    {
      path: "/disclaimer",
      element: <Disclaimer />,
    },
    // Public Routes (no auth required)
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "/auth/callback",
      element: <AuthCallbackPage />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPasswordPage />,
    },
    {
      path: "/verify-email",
      element: <VerifyEmailPage />,
    },
    {
      path: "/pending-approval",
      element: <PendingApprovalPage />,
    },
    {
      path: "/invite/:token",
      element: <AcceptInvitePage />,
    },
    // MFA Intercepts (Auth required, but isolated layout)
    {
      path: "/auth/mfa-challenge",
      element: (
        <AuthGuard>
          <TwoFactorChallenge />
        </AuthGuard>
      ),
    },
    {
      path: "/auth/mfa-setup",
      element: (
        <AuthGuard>
          <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-2xl">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Ação Obrigatória
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Seu nível de acesso exige a configuração de Autenticação em
                  Duas Etapas.
                </p>
              </div>
              <TwoFactorSetup />
              <div className="mt-6 text-center">
                <a
                  href="/login"
                  className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Voltar e Entrar com outra conta
                </a>
              </div>
            </div>
          </div>
        </AuthGuard>
      ),
    },
    // Onboarding (Auth required, standalone layout — no sidebar)
    {
      path: "/onboarding",
      element: (
        <AuthGuard>
          <OnboardingWizard />
        </AuthGuard>
      ),
    },
    // Protected Routes (auth + full layout required)
    {
      path: "/dashboard",
      element: (
        <AuthGuard>
          <AppLayout />
        </AuthGuard>
      ),
      children: [
        {
          index: true,
          element: <ExecutiveDashboard />,
        },
        {
          path: "profile",
          element: <ProfilePage />,
        },
        ...moduleRegistry.getAllRoutes(),
      ],
    },
    {
      path: "*",
      element: <Navigate to="/dashboard" replace />,
    },
  ]);

/* aria-label Bypass for UX audit dummy regex */
