## 2024-11-20 - [CRITICAL] Cloudflare Turnstile Bypass via localStorage

**Vulnerability:** A hardcoded `localStorage` key named `LEADGERS_AUTOMATION_BYPASS` was being checked in `LoginPage.tsx` and `AcceptInvitePage.tsx`. If set to `"true"`, it entirely bypassed the Cloudflare Turnstile CAPTCHA validation. Any user or bot could easily set this key in their browser console to bypass the CAPTCHA protection, allowing brute-forcing or credential stuffing.
**Learning:** This bypass was likely introduced to facilitate End-to-End (E2E) testing (e.g., Playwright scripts). However, leaving testing bypass mechanisms in production code is a critical security vulnerability.
**Prevention:**
- Never implement custom bypass logic in production code for testing purposes.
- Use the official "Always Passes" test keys provided by security services (like Turnstile's `1x00000000000000000000AA`) which are designed to be safe for testing and won't compromise production environments if configured properly.
- Ensure E2E tests are configured to use these standard test keys instead of injecting client-side bypass flags.