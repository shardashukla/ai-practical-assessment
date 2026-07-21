# Debugging Notes

## Issue 1: Database path resolution in ESM

**Symptom:** `db-init.ts` could not find `schema.sql` when run from different working directories.

**Cause:** `__dirname` not available in ES modules by default.

**Fix:** Used `fileURLToPath(import.meta.url)` to resolve paths relative to the source file, then navigate to project root.

```typescript
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
```

## Issue 2: Dashboard counts not updating

**Symptom:** After marking a task completed, dashboard still showed old count.

**Cause:** Frontend did not refetch summary after mutation on a different page.

**Fix:** Dashboard fetches fresh data on each mount via `useAsyncData`. Navigating back to dashboard triggers reload. Detail page calls `task.reload()` after status change.

## Issue 3: Overdue count includes completed tasks

**Symptom:** Overdue count was higher than expected.

**Cause:** Initial query did not exclude completed tasks.

**Fix:** Added `status != 'completed'` condition to overdue SQL query.

## Issue 4: Vite proxy in development

**Symptom:** Frontend fetch to `/api` returned 404 when only Vite dev server was running.

**Cause:** API requests need proxy to Express on port 3001.

**Fix:** Configured Vite proxy in `vite.config.ts`:
```typescript
proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } }
```

## Issue 5: Test database pollution

**Symptom:** Tests failed intermittently due to leftover data.

**Fix:** `resetDbForTests()` deletes and recreates test DB before test suite. `afterAll` cleans up `database/test.db`.

## Debugging Tools Used

- Browser DevTools Network tab for API inspection
- `console.log` in Express routes during development
- Vitest verbose output for test failures
- SQLite CLI: `sqlite3 database/app.db "SELECT * FROM project_tasks;"`
