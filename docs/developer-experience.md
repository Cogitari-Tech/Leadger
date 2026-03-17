# Developer Experience (DX) & Testing Handbook

This document outlines the specialized tools and shortcuts designed to optimize the experience of developers and AI agents (Vibe Coding) within the Leadgers Platform.

---

## 🧪 Dedicated Test Accounts

To facilitate rapid iteration and validation of complex flows (Auth, Onboarding, Governance), we maintain three primary tiers of test accounts.

| Account                      | Role                | Type                     | Purpose                                     |
| :--------------------------- | :------------------ | :----------------------- | :------------------------------------------ |
| `teste@leadgers.com`         | Admin (Auditor)     | **Persistent**           | System-wide validation of features.         |
| `qa_vibe_test@leadgers.com`  | New Organization    | **Auto-Removable**       | Full registration & onboarding flow tests.  |
| `test_removivel@leadgers.com`| Standard User       | **Auto-Removable**       | Testing invites and basic user interactions.|
| `onboarding-test-*`          | Various             | **Auto-Removable**       | Pattern-based accounts for CI/CD.           |

### ♻️ Automatic Data Cleanup
The **Auto-Removable** accounts are programmed to trigger a database cleanup ritual upon logout. 
- **Mechanism**: The `signOut` function in `SessionContext.tsx` detects these emails and calls the `cleanup_test_user` RPC.
- **Effect**: Deletes all data associated with the user and their created organizations, preventing "DB pollution" during repeated tests.

---

## ⚡ Productivity Bypasses
To prevent friction during "Vibe Coding" sessions, the system automatically detects these test accounts and applies the following bypasses:

### 1. Captcha Bypass (Cloudflare Turnstile)
- **Documented in**: `apps/web/src/modules/auth/pages/LoginPage.tsx`
- **Logic**: If the email is a recognized test account, the Turnstile component is not rendered, and the security check is ignored.

### 2. Email Verification Bypass
- **Documented in**: `apps/web/src/modules/auth/components/AuthGuard.tsx`
- **Logic**: Test accounts are not redirected to `/verify-email`, even if their `email_confirmed_at` is null in Supabase.

### 3. CNPJ Validation Skip
- **Documented in**: `apps/web/src/modules/admin/pages/OnboardingWizard.tsx` (Step 1)
- **Logic**: Test accounts can input any string or "DUMMY" instead of a valid Brazilian CNPJ during organization setup.

---

## 🛠️ Automated Testing Tools

### Playwright E2E Integration
- **Site Key Bypass**: Setting `VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA` in `.env` triggers the "Testing Mode" of Cloudflare Turnstile.
- **MFA Bypass**: Injecting `leadgers_session_type: "temporal"` into the browser's `localStorage` allows bypassing MFA challenges during automated test runs.

### Local Cleanup Script
A manual cleanup script is available for emergency resets:
```bash
# Removes all test users except teste@leadgers.com
npx ts-node scripts/clean-users.ts
```

---

*Last Updated: March 16, 2026*
