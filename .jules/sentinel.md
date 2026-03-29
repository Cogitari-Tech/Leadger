## 2024-05-20 - [Global Security Headers]
**Vulnerability:** The Hono API was completely missing global security headers, despite memory stating otherwise.
**Learning:** This is a surprising security gap in the app's architecture given that it's an API meant to handle sensitive financial and AI data. We cannot trust memory to be accurately reflecting the current codebase state.
**Prevention:** Explicitly use `app.use("*", secureHeaders())` in `app.ts` to globally enforce headers like X-XSS-Protection, Strict-Transport-Security, and X-Content-Type-Options.
