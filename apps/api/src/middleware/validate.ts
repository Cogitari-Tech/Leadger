import type { Context, Next } from "hono";
import { z, ZodSchema } from "zod";

/**
 * Middleware factory that validates the JSON request body against a Zod schema.
 * On success, sets the parsed (and coerced) body on `c.set("validatedBody", ...)`.
 * On failure, returns 400 with structured error details.
 *
 * @example
 * ```ts
 * import { z } from "zod";
 * import { validateBody } from "../../middleware/validate";
 *
 * const createDealSchema = z.object({
 *   title: z.string().min(1).max(200),
 *   value: z.number().nonnegative().optional(),
 * });
 *
 * route.post("/", validateBody(createDealSchema), async (c) => {
 *   const body = c.get("validatedBody");
 *   // body is fully typed and validated
 * });
 * ```
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return async (c: Context, next: Next) => {
    let rawBody: unknown;

    try {
      rawBody = await c.req.json();
    } catch {
      return c.json(
        {
          error: "Invalid JSON body",
          details: [
            { field: "body", message: "Could not parse request body as JSON" },
          ],
        },
        400,
      );
    }

    const result = schema.safeParse(rawBody);

    if (!result.success) {
      const details = result.error.issues.map((issue: z.ZodIssue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
        code: issue.code,
      }));

      return c.json(
        {
          error: "Validation failed",
          details,
        },
        400,
      );
    }

    c.set("validatedBody", result.data);
    await next();
  };
}

/**
 * Middleware factory that validates query parameters against a Zod schema.
 *
 * @example
 * ```ts
 * const querySchema = z.object({
 *   page: z.coerce.number().int().positive().default(1),
 *   limit: z.coerce.number().int().min(1).max(100).default(20),
 * });
 *
 * route.get("/", validateQuery(querySchema), async (c) => {
 *   const query = c.get("validatedQuery");
 * });
 * ```
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return async (c: Context, next: Next) => {
    const rawQuery = Object.fromEntries(
      new URL(c.req.url).searchParams.entries(),
    );

    const result = schema.safeParse(rawQuery);

    if (!result.success) {
      const details = result.error.issues.map((issue: z.ZodIssue) => ({
        field: issue.path.join(".") || "query",
        message: issue.message,
        code: issue.code,
      }));

      return c.json(
        {
          error: "Invalid query parameters",
          details,
        },
        400,
      );
    }

    c.set("validatedQuery", result.data);
    await next();
  };
}
