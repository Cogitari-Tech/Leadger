# Task: Fix Registration Flow & Tenant Provisioning

## Problem
Users are experiencing a silent failure during registration.
1. **Trigger Failure**: If the `handle_new_user_registration` trigger fails during `INSERT`, the user is created but the tenant is not.
2. **SSO / Retry Loop**: Subsequent attempts to create a company while logged in only update `user_metadata`, which does NOT trigger the current `AFTER INSERT` logic.
3. **UI Dead End**: `RegisterPage` falls through if `success` is true but `tenant_id` is null, leaving the user on the form with no feedback.

## Plan

### Stage 1: Database (Supabase)
1. **Robust Trigger Migration**: Update `handle_new_user_registration` trigger to run on `AFTER INSERT OR UPDATE`.
2. **Safety Check**: Add logic to the function to exit immediately if `tenant_id` already exists in `app_metadata`.
3. **SSO Support**: Ensure the trigger handles the case where metadata is updated via SSO completion.

### Stage 2: Frontend (Web App)
1. **RegisterPage.tsx Improvements**:
   - Add a "Provisioning" state when `success` is true but `user.tenant_id` is pending.
   - Fix the fall-through logic that keeps users stuck on the form.
   - Improve the "Try Again" logic for logged-in users.
2. **SessionContext/AuthContext**:
   - Ensure `refreshProfile` is called and handled correctly after `updateMetadata`.

## Verification
1. Test standard email/password registration.
2. Test registration retry (sign up once, trigger fail, try again while logged in).
3. Test SSO registration flow (Login via Google -> Finish setup).
