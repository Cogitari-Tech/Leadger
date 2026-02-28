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
  const { user, session, loading: authLoading, initialized } = useAuth();
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

  return <>{children}</>;
}
