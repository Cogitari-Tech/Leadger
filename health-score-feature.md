# Health Score Implementation

## Goal
Implement the Health Score feature (Database, Backend Jobs, and Frontend Dashboard) to provide the primary "aha moment" for the onboarding flow.

## Tasks
- [x] Task 1: Create Supabase migration for `health_scores` table → Verify: `supabase migration up` runs without errors and table exists in local DB.
- [x] Task 2: Implement actual calculation logic in `apps/api/src/jobs/health-score.ts` → Verify: Trigger job via Inngest dev server and check DB records.
- [x] Task 3: Sync Prisma schema types → Verify: `npx prisma generate` runs cleanly.
- [x] Task 4: Create `HealthScoreDashboard.tsx` UI component → Verify: UI renders correctly with data from the endpoint.
- [x] Task 5: Integrate new dashboard route into the app navigation and `ExecutiveDashboard.tsx` → Verify: Can navigate to the new page successfully.

## Done When
- [x] The `health_scores` table is deployed and secured with RLS.
- [x] The Inngest cron job successfully calculates real scores based on tenant data.
- [x] The user can view their detailed Health Score dashboard accurately in the web app UI.
