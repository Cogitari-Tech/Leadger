import { supabase } from "../../config/supabase";
import { API_URL } from "../../config/supabase";

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: any,
  ) {
    super(data?.error || `API Error: ${status}`);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // TODO: We need to get the tenant_id. For now, we will assume it's set or passed explicitly.
  // Actually, the backend's tenancyMiddleware fetches it using the generic user id, or accepts x-tenant-id.

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as any),
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(res.status, errorData);
  }

  return res.json();
}
