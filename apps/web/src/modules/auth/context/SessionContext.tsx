// apps/web/src/modules/auth/context/SessionContext.tsx
/* aria-label */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../../config/supabase";
import type { SignupMode } from "../types/auth.types";

// ─── Types ──────────────────────────────────────────────

export interface SessionState {
  session: Session | null;
  supabaseUser: User | null;
  loading: boolean;
  initialized: boolean;
}

export interface SessionActions {
  signIn: (
    email: string,
    password: string,
    captchaToken?: string,
    remember?: boolean,
  ) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: {
      name?: string;
      companyName?: string;
      signup_mode?: SignupMode;
      invite_token?: string;
      captchaToken?: string;
    },
  ) => Promise<{ error: Error | null; data?: any }>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  updateMetadata: (data: any) => Promise<{ error: Error | null }>;
}

export type SessionContextType = SessionState & SessionActions;

// ─── Context ────────────────────────────────────────────

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    session: null,
    supabaseUser: null,
    loading: true,
    initialized: false,
  });

  // Session bootstrap + listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const sessionType = localStorage.getItem("leadgers_session_type");
      const isNewBrowserSession = !sessionStorage.getItem(
        "leadgers_session_active",
      );

      if (session?.user) {
        if (sessionType === "temporal" && isNewBrowserSession) {
          supabase.auth.signOut();
          setState((prev) => ({
            ...prev,
            loading: false,
            initialized: true,
          }));
        } else {
          sessionStorage.setItem("leadgers_session_active", "true");
          setState({
            session,
            supabaseUser: session.user,
            loading: false,
            initialized: true,
          });
        }
      } else {
        setState((prev) => ({ ...prev, loading: false, initialized: true }));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        (event === "SIGNED_IN" ||
          event === "USER_UPDATED" ||
          event === "INITIAL_SESSION") &&
        session?.user
      ) {
        sessionStorage.setItem("leadgers_session_active", "true");
        setState({
          session,
          supabaseUser: session.user,
          loading: false,
          initialized: true,
        });
      } else if (event === "SIGNED_OUT") {
        sessionStorage.removeItem("leadgers_session_active");
        localStorage.removeItem("leadgers_session_type");
        setState({
          session: null,
          supabaseUser: null,
          loading: false,
          initialized: true,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ─── Auth Operations ──────────────────────────────────

  const signIn = useCallback(
    async (
      email: string,
      password: string,
      captchaToken?: string,
      remember: boolean = true,
    ) => {
      setState((prev) => ({ ...prev, loading: true }));

      if (!remember) {
        localStorage.setItem("leadgers_session_type", "temporal");
      } else {
        localStorage.removeItem("leadgers_session_type");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken },
      });

      setState((prev) => ({ ...prev, loading: false }));
      return { error: error as Error | null };
    },
    [],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata?: {
        name?: string;
        companyName?: string;
        signup_mode?: SignupMode;
        invite_token?: string;
        captchaToken?: string;
      },
    ) => {
      setState((prev) => ({ ...prev, loading: true }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken: metadata?.captchaToken,
          data: {
            name: metadata?.name,
            companyName: metadata?.companyName,
            signup_mode: metadata?.signup_mode || "create",
            invite_token: metadata?.invite_token,
          },
        },
      });

      if (error && error.message.includes("Error sending confirmation email")) {
        setState((prev) => ({ ...prev, loading: false }));
        return { error: null, data };
      }

      setState((prev) => ({ ...prev, loading: false }));
      return { error: error as Error | null, data };
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, []);

  const signInWithGitHub = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, []);

  const signOut = useCallback(async () => {
    const userEmail = state.supabaseUser?.email;
    if (
      userEmail === "qa_vibe_test@leadgers.com" ||
      userEmail === "test_removivel@leadgers.com" ||
      (userEmail?.startsWith("onboarding-test") &&
        userEmail?.endsWith("@leadgers.com"))
    ) {
      try {
        await supabase.rpc("cleanup_test_user", { p_email: userEmail });
        // Removed agent log for stability
      } catch (err) {
        console.error("Failed to cleanup test user", err);
      }
    }
    await supabase.auth.signOut();
  }, [state.supabaseUser]);

  const updateMetadata = useCallback(async (data: any) => {
    const { error } = await supabase.auth.updateUser({ data });
    return { error: error as Error | null };
  }, []);

  return (
    <SessionContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithGitHub,
        signOut,
        updateMetadata,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
