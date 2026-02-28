import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";

export interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  roleName: string;
  tenantName: string;
  tenantId: string;
  secondaryEmail: string;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    role: string;
  }>;
  mfaEnabled: boolean;
  emailConfirmedAt: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get Supabase auth user data
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      // Get tenant info
      const { data: memberData } = await supabase
        .from("tenant_members")
        .select(
          `
          id,
          tenant_id,
          role,
          tenants ( name ),
          roles ( display_name )
        `,
        )
        .eq("user_id", user.id)
        .single();

      // Get projects from project_members
      const { data: projectMemberships } = await supabase
        .from("project_members")
        .select(
          `
          project_role,
          projects ( id, name, status )
        `,
        )
        .eq("member_id", memberData?.id || "");

      // Check MFA status
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const mfaEnabled =
        (factors?.totp?.length ?? 0) > 0 &&
        factors?.totp?.some((f: { status: string }) => f.status === "verified");

      const tenantInfo = memberData?.tenants as unknown as {
        name: string;
      } | null;
      const roleInfo = memberData?.roles as unknown as {
        display_name: string;
      } | null;

      setProfile({
        id: user.id,
        email: authUser?.email || "",
        fullName:
          authUser?.user_metadata?.full_name ||
          authUser?.user_metadata?.name ||
          "",
        avatarUrl: authUser?.user_metadata?.avatar_url || null,
        secondaryEmail: authUser?.user_metadata?.secondary_email || "",
        role: memberData?.role || "",
        roleName: roleInfo?.display_name || memberData?.role || "",
        tenantName: tenantInfo?.name || "",
        tenantId: memberData?.tenant_id || "",
        projects: (projectMemberships || []).map((pm: any) => ({
          id: pm.projects?.id || "",
          name: pm.projects?.name || "",
          status: pm.projects?.status || "",
          role: pm.project_role || "member",
        })),
        mfaEnabled: mfaEnabled || false,
        emailConfirmedAt: authUser?.email_confirmed_at || null,
      });
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateName = useCallback(async (fullName: string) => {
    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      if (updateError) throw updateError;
      setProfile((prev) => (prev ? { ...prev, fullName } : null));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateAvatar = useCallback(
    async (file: File) => {
      if (!user) return;
      setSaving(true);
      try {
        const ext = file.name.split(".").pop();
        const path = `avatars/${user.id}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("audit-evidences")
          .upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("audit-evidences").getPublicUrl(path);

        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl },
        });
        if (updateError) throw updateError;

        setProfile((prev) => (prev ? { ...prev, avatarUrl: publicUrl } : null));
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [user],
  );

  const requestPasswordReset = useCallback(async () => {
    if (!profile?.email) return;
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        profile.email,
      );
      if (resetError) throw resetError;
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [profile?.email]);

  const updateSecondaryEmail = useCallback(async (secondaryEmail: string) => {
    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { secondary_email: secondaryEmail },
      });
      if (updateError) throw updateError;
      setProfile((prev) => (prev ? { ...prev, secondaryEmail } : null));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    profile,
    loading,
    saving,
    error,
    updateName,
    updateAvatar,
    updateSecondaryEmail,
    requestPasswordReset,
    refresh: fetchProfile,
  };
}
