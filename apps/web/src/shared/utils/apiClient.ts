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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

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

/** Backwards-compatible default export (function call) */
export async function apiClient<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  return request<T>(path, options);
}

/** Convenience methods */
apiClient.get = <T>(path: string) => request<T>(path, { method: "GET" });

apiClient.post = <T>(path: string, body?: unknown) =>
  request<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });

apiClient.patch = <T>(path: string, body?: unknown) =>
  request<T>(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });

apiClient.put = <T>(path: string, body?: unknown) =>
  request<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });

apiClient.delete = <T>(path: string) => request<T>(path, { method: "DELETE" });
