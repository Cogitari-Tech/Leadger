import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import type {
  TenantMember,
  Role,
  AccessRequest,
  InviteLink,
} from "../../auth/types/auth.types";

export function useTeamManagement() {
  const { user, tenant } = useAuth();

  const [members, setMembers] = useState<TenantMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tenantId = tenant?.id;

  // ─── Load All Data ─────────────────────────────────────
  const loadMembers = useCallback(async () => {
    if (!tenantId) return;
    const { data } = await supabase
      .from("tenant_members")
      .select("*, role:roles(*)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });
    setMembers((data as TenantMember[]) ?? []);
  }, [tenantId]);

  const loadRoles = useCallback(async () => {
    const { data } = await supabase
      .from("roles")
      .select("*")
      .eq("is_system", true)
      .order("hierarchy_level", { ascending: false });
    setRoles((data as Role[]) ?? []);
  }, []);

  const loadAccessRequests = useCallback(async () => {
    if (!tenantId) return;
    const { data } = await supabase
      .from("access_requests")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    setAccessRequests((data as AccessRequest[]) ?? []);
  }, [tenantId]);

  const loadInviteLinks = useCallback(async () => {
    if (!tenantId) return;
    const { data } = await supabase
      .from("invite_links")
      .select("*, role:roles(*)")
      .eq("tenant_id", tenantId)
      .eq("revoked", false)
      .order("created_at", { ascending: false });
    setInviteLinks((data as InviteLink[]) ?? []);
  }, [tenantId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadMembers(),
        loadRoles(),
        loadAccessRequests(),
        loadInviteLinks(),
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadMembers, loadRoles, loadAccessRequests, loadInviteLinks]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ─── Access Requests ───────────────────────────────────
  const approveRequest = useCallback(
    async (requestId: string, roleId: string) => {
      setError(null);
      const { error: err } = await supabase.rpc("approve_access_request", {
        p_request_id: requestId,
        p_role_id: roleId,
      });
      if (err) {
        setError(err.message);
        return false;
      }
      await Promise.all([loadAccessRequests(), loadMembers()]);
      return true;
    },
    [loadAccessRequests, loadMembers],
  );

  const rejectRequest = useCallback(
    async (requestId: string) => {
      setError(null);
      const { error: err } = await supabase.rpc("reject_access_request", {
        p_request_id: requestId,
      });
      if (err) {
        setError(err.message);
        return false;
      }
      await loadAccessRequests();
      return true;
    },
    [loadAccessRequests],
  );

  // ─── Invite Links ──────────────────────────────────────
  const generateInviteLink = useCallback(
    async (
      roleId: string,
      maxUses: number = 1,
      expiresDays: number = 7,
      label?: string,
    ) => {
      if (!tenantId || !user) return null;
      setError(null);

      // Generate a secure random token
      const rawToken = crypto.randomUUID() + "-" + crypto.randomUUID();

      // Hash the token for storage
      const encoder = new TextEncoder();
      const data = encoder.encode(rawToken);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const tokenHash = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresDays);

      const { error: err } = await supabase.from("invite_links").insert({
        tenant_id: tenantId,
        role_id: roleId,
        created_by: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        max_uses: maxUses,
        label: label || null,
      });

      if (err) {
        setError(err.message);
        return null;
      }

      await loadInviteLinks();

      // Return the raw token (NOT the hash) so it can be shared as a URL
      const baseUrl = window.location.origin;
      return `${baseUrl}/invite/${rawToken}`;
    },
    [tenantId, user, loadInviteLinks],
  );

  const revokeInviteLink = useCallback(
    async (linkId: string) => {
      setError(null);
      const { error: err } = await supabase
        .from("invite_links")
        .update({ revoked: true })
        .eq("id", linkId);
      if (err) {
        setError(err.message);
        return false;
      }
      await loadInviteLinks();
      return true;
    },
    [loadInviteLinks],
  );

  // ─── Member Management ─────────────────────────────────
  const changeMemberRole = useCallback(
    async (memberId: string, newRoleId: string) => {
      setError(null);
      const { error: err } = await supabase
        .from("tenant_members")
        .update({ role_id: newRoleId })
        .eq("id", memberId);
      if (err) {
        setError(err.message);
        return false;
      }
      await loadMembers();
      return true;
    },
    [loadMembers],
  );

  const removeMember = useCallback(
    async (memberId: string) => {
      setError(null);
      const { error: err } = await supabase
        .from("tenant_members")
        .delete()
        .eq("id", memberId);
      if (err) {
        setError(err.message);
        return false;
      }
      await loadMembers();
      return true;
    },
    [loadMembers],
  );

  const suspendMember = useCallback(
    async (memberId: string) => {
      setError(null);
      const { error: err } = await supabase
        .from("tenant_members")
        .update({ status: "suspended" })
        .eq("id", memberId);
      if (err) {
        setError(err.message);
        return false;
      }
      await loadMembers();
      return true;
    },
    [loadMembers],
  );

  const reactivateMember = useCallback(
    async (memberId: string) => {
      setError(null);
      const { error: err } = await supabase
        .from("tenant_members")
        .update({ status: "active" })
        .eq("id", memberId);
      if (err) {
        setError(err.message);
        return false;
      }
      await loadMembers();
      return true;
    },
    [loadMembers],
  );

  return {
    // Data
    members,
    roles,
    accessRequests,
    inviteLinks,
    loading,
    error,

    // Actions
    loadAll,
    approveRequest,
    rejectRequest,
    generateInviteLink,
    revokeInviteLink,
    changeMemberRole,
    removeMember,
    suspendMember,
    reactivateMember,
  };
}
