# Task: Fix Registration Flow

## Status
- [ ] Reproduce the issue
- [ ] Investigate `RegisterPage.tsx` and related auth logic
- [ ] Identify root cause of silent failure
- [ ] Implement fix
- [ ] Verify fix

## Analysis
The user reports that after clicking "register", no error appears, information is not saved, and they are redirected back to the registration page.

### Potential Causes:
1.  **Silent Redirect**: The auth state changes but the application doesn't recognize the user as "onboarded" or "active", redirecting them back to `/register`.
2.  **Supabase Auth Error**: Supabase might be returning an error that is being caught but not displayed.
3.  **Missing Profile Creation**: The user is created in Supabase Auth but the corresponding record in the `profiles` or `users` table (managed by Prisma) fails to create, and the app defaults back to registration.
4.  **Middleware/AuthGuard Conflict**: Middleware might be redirecting unauthenticated or partially authenticated users back to `/register`.

## Plan
1.  Read `apps/web/src/modules/auth/pages/RegisterPage.tsx`.
2.  Check `apps/web/src/modules/auth/context/AuthContext.tsx`.
3.  Check Supabase configuration and any database triggers or edge functions.
4.  Check browser console/logs if possible.
