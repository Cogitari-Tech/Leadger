// apps/web/src/modules/auth/context/TenantContext.tsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "../../../config/supabase";
import type { AuthUser, Tenant, Role } from "../types/auth.types";
import { useSession } from "./SessionContext";

// ─── Types ──────────────────────────────────────────────

export interface TenantState {
  user: AuthUser | null;
  tenant: Tenant | null;
  permissions: string[];
  tenantLoading: boolean;
}

export interface TenantActions {
  searchTenants: (query: string) => Promise<Tenant[]>;
  requestAccess: (
    tenantId: string,
    message?: string,
  ) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

export type TenantContextType = TenantState & TenantActions;

type RolePermissionJoinRow = {
  permission?: { code: string }[];
};

function extractPermissionCodes(
  rolePerms: RolePermissionJoinRow[] | null,
): string[] {
  if (!rolePerms) return [];

  return rolePerms
    .flatMap((rp) => (rp.permission ?? []).map((permission) => permission.code))
    .filter((code): code is string => Boolean(code));
}

// ─── Context ────────────────────────────────────────────

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────

export function TenantProvider({ children }: { children: ReactNode }) {
  const { supabaseUser, session, initialized } = useSession();

  const [state, setState] = useState<TenantState>({
    user: null,
    tenant: null,
    permissions: [],
    tenantLoading: true,
  });

  // Load user profile + tenant + permissions
  const loadUserProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, tenantLoading: true }));
    if (!supabaseUser || !session) {
      setState({
        user: null,
        tenant: null,
        permissions: [],
        tenantLoading: false,
      });
      return;
    }

    try {
      let actualTenantId = supabaseUser.app_metadata?.tenant_id;

      let tenant: Tenant | null = null;
      let role: Role | null = null;
      let permissions: string[] = [];
      let userOnboardingCompleted = false;

      // Fallback: look up tenant_id from tenant_members with retry
      if (!actualTenantId) {
        let retries = 3;
        while (retries > 0) {
          const { data: memberLookup } = await supabase
            .from("tenant_members")
            .select("tenant_id")
            .eq("user_id", supabaseUser.id)
            .eq("status", "active")
            .limit(1)
            .maybeSingle();

          if (memberLookup) {
            actualTenantId = memberLookup.tenant_id;
            break;
          }

          retries--;
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        }
      }

      if (actualTenantId) {
        // Parallel batch 1: Fetch tenant + member simultaneously
        const [tenantRes, memberRes] = await Promise.all([
          supabase
            .from("tenants")
            .select("*")
            .eq("id", actualTenantId)
            .single(),
          supabase
            .from("tenant_members")
            .select("*")
            .eq("tenant_id", actualTenantId)
            .eq("user_id", supabaseUser.id)
            .eq("status", "active")
            .single(),
        ]);

        tenant = tenantRes.data;
        const memberData = memberRes.data;

        if (memberData) {
          userOnboardingCompleted =
            memberData.user_onboarding_completed ?? false;
        }

        if (memberData?.role_id) {
          // Parallel batch 2: Fetch role + all permissions
          const [roleRes, allPermsRes] = await Promise.all([
            supabase
              .from("roles")
              .select("*")
              .eq("id", memberData.role_id)
              .single(),
            supabase.from("permissions").select("code"),
          ]);

          if (roleRes.data) {
            role = roleRes.data as Role;
          }

          if (role && (role.name === "admin" || role.name === "owner")) {
            permissions =
              allPermsRes.data?.map((p: { code: string }) => p.code) ?? [];
          } else if (role) {
            const { data: rolePerms } = await supabase
              .from("role_permissions")
              .select("permission:permissions(code)")
              .eq("role_id", role.id);
            permissions = extractPermissionCodes(
              (rolePerms as RolePermissionJoinRow[] | null) ?? null,
            );
          }
        }
      }

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email ?? "",
        name:
          supabaseUser.user_metadata?.name ??
          supabaseUser.email?.split("@")[0] ??
          "",
        avatar_url: supabaseUser.user_metadata?.avatar_url ?? null,
        tenant_id: actualTenantId ?? null,
        role,
        permissions,
        user_onboarding_completed: userOnboardingCompleted,
      };

      setState({
        user: authUser,
        tenant,
        permissions,
        tenantLoading: false,
      });

      // Removed agent log for stability
    } catch (error) {
      console.error("Failed to load user profile:", error);
      setState((prev) => ({ ...prev, tenantLoading: false }));
    }
  }, [supabaseUser, session]);

  // Reload profile whenever session user changes
  useEffect(() => {
    if (initialized) {
      loadUserProfile();
    }
  }, [initialized, loadUserProfile]);

  // ─── Tenant Operations ────────────────────────────────

  const searchTenants = useCallback(
    async (query: string): Promise<Tenant[]> => {
      const { data } = await supabase
        .from("tenants")
        .select("*")
        .or(`slug.ilike.%${query}%,name.ilike.%${query}%`)
        .eq("is_private", false)
        .limit(10);
      return (data ?? []) as Tenant[];
    },
    [],
  );

  const requestAccess = useCallback(
    async (tenantId: string, message?: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: new Error("Não autenticado") };
      const { error } = await supabase.from("access_requests").insert({
        tenant_id: tenantId,
        user_id: user.id,
        message: message || null,
      });
      return { error: error as Error | null };
    },
    [],
  );

  return (
    <TenantContext.Provider
      value={{
        ...state,
        searchTenants,
        requestAccess,
        refreshProfile: loadUserProfile,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
