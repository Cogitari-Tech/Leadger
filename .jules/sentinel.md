## 2025-03-28 - Missing Security Headers Middleware
**Vulnerability:** Missing security headers on backend API.
**Learning:** Found that the Hono backend API did not have global security headers enabled.
**Prevention:** Always enable `hono/secure-headers` middleware on all API routes to protect against common web vulnerabilities.
