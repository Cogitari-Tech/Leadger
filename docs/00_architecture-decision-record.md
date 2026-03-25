# Architecture Decision Record (ADR)

## 001. Monorepo Structure

**Status:** Accepted
**Date:** 2026-02-17
**Context:** We need to separate business logic from UI to support future expansion (mobile app, API).
**Decision:** Use Turborepo with `apps/web` (Vite+React) and `packages/core` (TypeScript).
**Consequences:** Improved maintainability, clear separation of concerns.

## 002. Environment Management

**Status:** Accepted
**Date:** 2026-02-17
**Context:** Need to manage credentials for multiple environments securely.
**Decision:**

- Use `.env.beta` and `.env.production` as master templates.
- Local development (`.env`, `apps/web/.env`) always mirrors Beta.
- GitHub Actions handles secrets for CI/CD.

## 003. MVP Persistence & Export Strategy

**Status:** Accepted
**Date:** 2026-02-17
**Context:** Need a simple, robust way to save and export audits without external dependencies (Google Drive deferred).
**Decision:**

1.  **Persistence Layer 1 (Drafts):** Browser LocalStorage (Auto-save).
2.  **Persistence Layer 2 (Final):** Supabase Database (Manual save/Sync).
3.  **Export:** Client-side PDF generation (`html2pdf.js`) and JSON export for local backup.
    ** Consequences:**

- Removes dependency on Google Cloud for MVP.
- Simplifies authentication flow.
- "Phase 2" will re-evaluate Excel/CSV export and Cloud Drive integration.
