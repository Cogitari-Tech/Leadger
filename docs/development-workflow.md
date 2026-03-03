# Development Workflow & CI/CD Guide

This document outlines the automated workflows, security checks, and deployment strategies for the Audit Tool project.

## 1. Security & Pre-commit Hooks

We use **Husky** and **Lint-Staged** to enforce security and code quality _before_ every commit.

### Automated Checks (Pre-commit)

When you run `git commit`, the following checks execute automatically:

1.  **Secret Scanning**: Scans staged files for potential secrets (API Keys, Tokens, Private Keys) and `.env` files.
    - _Script_: `scripts/security-scan.js`
2.  **Vulnerability Audit**: Runs `npm audit` to check for high/critical dependency vulnerabilities.
3.  **Code Formatting**: Runs `prettier` on changed files.

**❌ If any check fails, the commit is blocked.**

### Manual Override (Emergency Only)

If you must bypass these checks (e.g., false positive), use:

```bash
git commit -m "msg" --no-verify
```

_⚠️ Use with extreme caution._

---

## 2. CI Pipelines (GitHub Actions)

Our Continuous Integration (CI) pipeline runs on GitHub Actions to verify code integrity.

### Triggers/Rules

The pipeline defined in `.github/workflows/ci.yml` runs **ONLY** on:

- **Pull Requests** targeting `develop` (Feature merge).
- **Pull Requests** targeting `beta` (Hotfixes).

_Note: Direct pushes to branches do NOT trigger the pipeline to save resources._

### Stages

The pipeline executes the following steps in parallel/sequence:

1.  **Install**: `npm ci`
2.  **Type Check**: `npm run typecheck` (TypeScript validation)
3.  **Lint**: `npm run lint` (ESLint)
4.  **Test**: `npm run test` (Unit/Integration tests)
5.  **Build**: `npm run build` (Production build verification)

---

## 3. Continuous Deployment (CD) Strategy

We follow a Gitflow-based deployment strategy targeting **Vercel**.

| Environment        | Branch    | URL (Example)    | Deployment Trigger               | Purpose                                  |
| :----------------- | :-------- | :--------------- | :------------------------------- | :--------------------------------------- |
| **Development**    | `develop` | `dev.amuri.app`  | **Automatic** (Merge to develop) | Integration testing, internal review.    |
| **Beta (Staging)** | `beta`    | `beta.amuri.app` | **Automatic** (PR/Merge to beta) | User Acceptance Testing (UAT), Hotfixes. |
| **Production**     | `main`    | `amuri.app`      | **Manual** (Promotion)           | Stable release for end-users.            |

### Configuration Requirements

- **Vercel Project**: Connect to the GitHub repository.
- **Root Directory**: Set to `apps/web`.
- **Build Command**: `npm run build`.
- **Environment Variables**: Must be configured in Vercel Project Settings for each environment (Development, Preview, Production).

---

## 4. Local Verification Commands

You can run these checks locally without committing:

```bash
# Run Security Scan
npm run security-check

# Run Full Test Suite
npm run test

# Run Build
npm run build
```

## 5. E2E Testing (Playwright) & Bypasses

When running automated End-to-End tests via Playwright, the Cloudflare Turnstile CAPTCHA will block automated Chromium/Firefox browsers. To bypass this during testing:

1. Use the **Dummy Site Key** in `.env`: `VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA`.
2. Ensure you have test tenant accounts mapped correctly.
3. If necessary, inject `amuri_session_type` in the browser context `localStorage` to bypass MFA timeout or test persistent sessions.
