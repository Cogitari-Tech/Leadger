import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../../config/supabase";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Protects routes from unauthenticated access.
 * Redirects to /login if no session is found.
 * Redirects to /verify-email if user email is not confirmed.
 * Enforces Two-Factor Authentication (AAL2) based on role or enrollment.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const {
    user,
    session,
    tenant,
    loading: authLoading,
    initialized,
  } = useAuth();
  const location = useLocation();
  const [checkingMfa, setCheckingMfa] = useState(true);
  const [mfaStatus, setMfaStatus] = useState<
    "ok" | "needs_challenge" | "needs_setup"
  >("ok");

  useEffect(() => {
    async function verifyMfaStatus() {
      if (!user) {
        setCheckingMfa(false);
        return;
      }

      try {
        const { data, error } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (error) throw error;

        const { currentLevel, nextLevel } = data;

        // If current level is AAL1 but the user has registered factors (nextLevel = AAL2),
        // they must complete the MFA challenge.
        if (currentLevel === "aal1" && nextLevel === "aal2") {
          // CHECK FOR TRUSTED DEVICE
          const trustUntil = localStorage.getItem(`mfa_trust_${user.id}`);
          if (trustUntil && parseInt(trustUntil) > Date.now()) {
            setMfaStatus("ok");
            setCheckingMfa(false);
            return;
          }

          setMfaStatus("needs_challenge");
          setCheckingMfa(false);
          return;
        }

        // Roles that require strict 2FA
        const strictRoles = ["admin", "cfo", "auditor"];
        const isStrictRole = user.role && strictRoles.includes(user.role.name);

        // If the role requires 2FA but the user hasn't enrolled (nextLevel = AAL1),
        // force them to setup screen.
        if (isStrictRole && nextLevel === "aal1") {
          setMfaStatus("needs_setup");
          setCheckingMfa(false);
          return;
        }

        setMfaStatus("ok");
      } catch (err) {
        console.error("Failed to verify MFA level", err);
        setMfaStatus("ok"); // fallback to let them pass or handle error later
      } finally {
        setCheckingMfa(false);
      }
    }

    if (initialized && !authLoading) {
      verifyMfaStatus();
    }
  }, [user, initialized, authLoading]);

  // Handle loading states
  if (!initialized || authLoading || checkingMfa) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Autenticando...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -> public landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Email not confirmed -> verify-email screen
  // The Supabase session user object contains email_confirmed_at
  const supabaseUser = session?.user;
  if (
    supabaseUser &&
    !supabaseUser.email_confirmed_at &&
    location.pathname !== "/verify-email"
  ) {
    return <Navigate to="/verify-email" replace />;
  }

  // Needs validation -> challenge screen
  if (
    mfaStatus === "needs_challenge" &&
    location.pathname !== "/auth/mfa-challenge"
  ) {
    return (
      <Navigate to="/auth/mfa-challenge" state={{ from: location }} replace />
    );
  }

  // Needs to create factor -> setup screen
  if (mfaStatus === "needs_setup" && location.pathname !== "/auth/mfa-setup") {
    return <Navigate to="/auth/mfa-setup" state={{ from: location }} replace />;
  }

  // --- Onboarding Flows ---

  if (tenant && user) {
    const isOwnerOrAdmin =
      user.role?.name === "owner" || user.role?.name === "admin";

    // 1. Company Setup (Tenant Onboarding)
    if (!tenant.onboarding_completed) {
      if (isOwnerOrAdmin) {
        if (location.pathname !== "/onboarding") {
          return <Navigate to="/onboarding" replace />;
        }
      } else {
        // Not owner/admin but tenant is pending setup
        if (location.pathname !== "/pending-setup") {
          return <Navigate to="/pending-setup" replace />;
        }
      }
    } else {
      // --- Special case for Test User: always see onboarding once per session ---
      const isTestUser = user.email === "teste@leadgers.com";
      const hasSeenTour = sessionStorage.getItem("has_seen_tour");

      if (
        isTestUser &&
        !hasSeenTour &&
        location.pathname !== "/user-onboarding"
      ) {
        return <Navigate to="/user-onboarding" replace />;
      }

      // Tenant is set up. Now check user onboarding.
      // E.g. /user-onboarding is the route for individual user setup
      if (
        !user.user_onboarding_completed &&
        location.pathname !== "/user-onboarding"
      ) {
        // Owner/Admin doesn't need to do user-onboarding, as their wizard serves both purposes
        // However, if we want them to do it as well, remove the isOwnerOrAdmin check
        if (!isOwnerOrAdmin) {
          return <Navigate to="/user-onboarding" replace />;
        }
      }
    }
  } else if (user && !tenant) {
    // Edge case: User is authenticated but has no tenant associated (trigger failed or orphaned account)
    // We should not let them into the dashboard directly as it will crash.
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background text-center px-4">
        <div className="max-w-md space-y-4">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-destructive font-bold text-xl">!</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Sua conta não possui uma empresa vinculada
          </h2>
          <p className="text-sm text-muted-foreground">
            Ocorreu um problema durante a criação ou associação da sua conta.
            Por favor, entre em contato com o suporte ou solicite um novo
            convite.
          </p>
          <button
            onClick={() =>
              supabase.auth.signOut().then(() => (window.location.href = "/"))
            }
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:brightness-110"
          >
            Sair e Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
