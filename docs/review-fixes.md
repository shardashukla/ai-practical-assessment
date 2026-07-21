# Review Fixes

Fixes applied based on code review findings.

## Fix 1: Overdue query excludes completed tasks

**File:** `src/server/routes/dashboard.ts`  
**Change:** Added `status != 'completed'` to overdue COUNT query.

## Fix 2: Owner role type safety

**File:** `src/server/routes/tasks.ts`  
**Change:** Replaced complex conditional type with explicit `UserRole` cast.

## Fix 3: ESM path resolution

**File:** `src/server/db.ts`, `src/server/index.ts`  
**Change:** Used `fileURLToPath` for reliable path resolution in ES modules.

## Fix 4: Test database isolation

**File:** `tests/api/tasks.test.ts`  
**Change:** Set `DATABASE_PATH` to `database/test.db` and clean up in `afterAll`.

## Fix 5: Debounced search resets pagination

**File:** `src/client/pages/TasksPage.tsx`  
**Change:** Reset page to 1 when filters change to avoid empty pages.

## Fix 6: Accessibility improvements

**Files:** Multiple components  
**Changes:**
- Added `aria-live` on loading states
- Added `aria-invalid` on form fields with errors
- Added skip-to-content link in Layout

## Not Fixed (Deferred)

| Item | Reason |
|------|--------|
| Authentication | Out of scope |
| Combined COUNT query | Premature optimization |
| Rate limiting | Out of scope |
| E2E tests | Time constraint |
