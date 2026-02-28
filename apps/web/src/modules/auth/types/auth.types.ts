// Auth module type definitions

export type SignupMode = "create" | "join" | "invite" | "invite_link";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  plan: string;
  logo_url: string | null;
  settings: Record<string, unknown>;
  cnpj: string | null;
  is_private: boolean;
  onboarding_completed: boolean;
  industry: string | null;
  address: Record<string, unknown>;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  tenant_id: string | null;
  name: string;
  display_name: string;
  description: string | null;
  hierarchy_level: number;
  is_system: boolean;
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  action: string;
  description: string | null;
}

export interface TenantMember {
  id: string;
  tenant_id: string;
  user_id: string;
  role_id: string;
  status: "active" | "suspended" | "pending";
  joined_at: string;
  role?: Role;
}

export interface Invitation {
  id: string;
  tenant_id: string;
  email: string;
  role_id: string;
  invited_by: string;
  token: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
  role?: Role;
  tenant?: Tenant;
}

export interface AccessRequest {
  id: string;
  tenant_id: string;
  user_id: string;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  tenant?: Tenant;
  user_email?: string;
  user_name?: string;
}

export interface InviteLink {
  id: string;
  tenant_id: string;
  role_id: string;
  created_by: string;
  token_hash: string;
  expires_at: string;
  max_uses: number;
  current_uses: number;
  revoked: boolean;
  label: string | null;
  created_at: string;
  role?: Role;
}

export type AccountType =
  | "corrente"
  | "poupanca"
  | "pagamento"
  | "investimento";

export interface BankAccount {
  id: string;
  tenant_id: string;
  bank_name: string;
  bank_code: string | null;
  agency: string;
  account_number: string;
  account_type: AccountType;
  holder_name: string;
  holder_document: string | null;
  pix_key: string | null;
  is_primary: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  tenant_id: string | null;
  role: Role | null;
  permissions: string[];
}

export interface AuthState {
  user: AuthUser | null;
  session: import("@supabase/supabase-js").Session | null;
  tenant: Tenant | null;
  permissions: string[];
  loading: boolean;
  initialized: boolean;
}
