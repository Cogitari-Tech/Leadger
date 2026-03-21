import type { Context, Next } from "hono";
import { createScopedClient } from "../config/supabase";

export type User = {
  id: string;
  email?: string;
};

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createScopedClient(token);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("Auth error:", error?.message);
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Set user in the Hono context
  c.set("user", { id: user.id, email: user.email });
  c.set("accessToken", token);

  await next();
}
