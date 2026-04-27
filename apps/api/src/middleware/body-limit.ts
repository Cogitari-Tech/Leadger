import type { Context, Next } from "hono";

const DEFAULT_MAX_BODY_SIZE = 1_048_576; // 1MB
const UPLOAD_MAX_BODY_SIZE = 10_485_760; // 10MB

interface BodyLimitConfig {
  maxSize?: number;
}

export function bodyLimit(config: BodyLimitConfig = {}) {
  const maxSize = config.maxSize ?? DEFAULT_MAX_BODY_SIZE;

  return async (c: Context, next: Next) => {
    const contentLength = c.req.header("content-length");

    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (isNaN(size) || size > maxSize) {
        return c.json(
          {
            error: "Payload too large",
            maxSize,
            received: size || "unknown",
          },
          413,
        );
      }
    }

    // For chunked/streaming requests, we check the actual body
    if (
      c.req.method === "POST" ||
      c.req.method === "PUT" ||
      c.req.method === "PATCH"
    ) {
      try {
        const body = await c.req.raw.clone().arrayBuffer();
        if (body.byteLength > maxSize) {
          return c.json(
            {
              error: "Payload too large",
              maxSize,
              received: body.byteLength,
            },
            413,
          );
        }
      } catch {
        // If we can't read the body (e.g. no body), that's fine
      }
    }

    await next();
  };
}

export function uploadBodyLimit() {
  return bodyLimit({ maxSize: UPLOAD_MAX_BODY_SIZE });
}
