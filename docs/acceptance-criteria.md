# Acceptance Criteria — AI Learning Dashboard / Project Tracker

Testable criteria mapped to the **current implementation**. Each criterion includes verification method and implementation reference.

---

## Core Features

### AC-1: Create Task

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 1.1 | "New Task" link accessible from Dashboard and Tasks page | ✅ | Manual: check header nav and page CTAs |
| 1.2 | Form includes title, description, category, priority, status, owner, due date | ✅ | `TaskForm.tsx` fields |
| 1.3 | Title, category, priority, and owner are required | ✅ | Zod `createTaskSchema` + HTML required |
| 1.4 | Validation errors display inline on failed submission | ✅ | `fieldError()` in `TaskForm` |
| 1.5 | Success message shown on create | ✅ | `SuccessBanner` in `CreateTaskPage` |
| 1.6 | User redirected to task detail after successful create | ✅ | `navigate(/tasks/${result.id})` after 800ms |
| 1.7 | Activity log entry created on task creation | ✅ | `logActivity(taskId, 'created', ...)` |

**API test:** `POST /api/tasks creates a task with validation`

---

### AC-2: Dashboard Summary

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 2.1 | Five cards: Total, Completed, In Progress, Overdue, High Priority | ✅ | `SummaryCards.tsx` |
| 2.2 | Counts match actual database records | ✅ | API test + manual cross-check |
| 2.3 | Overdue = non-completed tasks with `due_date < today` | ✅ | Dashboard route SQL query |
| 2.4 | High priority = all tasks with `priority = 'high'` | ✅ | Dashboard route SQL query |
| 2.5 | Counts update after task create or status change | ✅ | API test: `completed count increases` |

**API test:** `GET /api/dashboard/summary returns correct counts`

---

### AC-3: List Tasks

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 3.1 | Tasks displayed with title, status, priority, category, owner, due date | ✅ | `TaskList.tsx` |
| 3.2 | Overdue tasks visually distinguished (CSS class + badge) | ✅ | `isOverdue()` + `.overdue` class |
| 3.3 | Clicking a task navigates to detail view | ✅ | `<Link to={/tasks/${task.id}}>` |
| 3.4 | Description preview truncated at 120 characters | ✅ | `TaskList.tsx` slice logic |

**API test:** `GET /api/tasks returns paginated list`

---

### AC-4: View Task Detail

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 4.1 | Full task information displayed | ✅ | `TaskDetailView.tsx` |
| 4.2 | Owner name shown (joined from users table) | ✅ | API JOIN + `task.owner?.name` |
| 4.3 | Status, priority, category shown as badges | ✅ | Badge components in detail view |
| 4.4 | Created and updated timestamps displayed | ✅ | `toLocaleString()` formatting |
| 4.5 | Quick action buttons for status changes present | ✅ | Mark In Progress / Completed / Planned |
| 4.6 | Edit link navigates to edit page | ✅ | `/tasks/:id/edit` |

**API test:** `GET /api/tasks/:id returns task detail`

---

### AC-5: Update Task

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 5.1 | Edit form pre-populated with current values | ✅ | `TaskForm` `initial` prop + `useEffect` |
| 5.2 | All updatable fields can be changed | ✅ | PATCH accepts partial body |
| 5.3 | Success feedback on save | ✅ | `SuccessBanner` in `EditTaskPage` |
| 5.4 | Redirect to detail page after successful update | ✅ | `navigate(/tasks/${result.id})` |
| 5.5 | Activity logged on update | ✅ | `logActivity(id, 'updated', ...)` |

**API test:** `PATCH /api/tasks/:id updates task fields`

---

### AC-6: Status Changes

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 6.1 | "Mark In Progress" button when status ≠ in_progress | ✅ | Conditional render in `TaskDetailView` |
| 6.2 | "Mark Completed" button when status ≠ completed | ✅ | Conditional render |
| 6.3 | "Mark Planned" button when status ≠ planned | ✅ | Conditional render |
| 6.4 | Button disabled during API request | ✅ | `statusLoading` prop |
| 6.5 | Status change reflected in UI after success | ✅ | `task.reload()` in `TaskDetailPage` |
| 6.6 | Activity logged for status changes | ✅ | `logActivity(id, 'status_changed', ...)` |

**API test:** `POST /api/tasks/:id/status changes status`

---

### AC-7: Search / Filter

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 7.1 | Keyword search across title and description | ✅ | SQL `LIKE` on both fields |
| 7.2 | Status filter dropdown | ✅ | `TaskFiltersBar` status select |
| 7.3 | Results update when filters change | ✅ | `useAsyncData` re-fetches on filter change |
| 7.4 | Search debounced 300ms | ✅ | `useEffect` timer in `TasksPage` |
| 7.5 | Page resets to 1 when filters change | ✅ | `setPage(1)` on filter change |

**API tests:** `filters by status`, `searches by keyword`

---

### AC-8: Persistence

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 8.1 | Data stored in SQLite database file | ✅ | `database/app.db` |
| 8.2 | Data survives server restart | ✅ | Manual: restart `npm run dev` |
| 8.3 | Seed data loaded on first run | ✅ | `initializeDatabase()` in `db.ts` |
| 8.4 | WAL journal mode enabled | ✅ | `db.pragma('journal_mode = WAL')` |

---

### AC-9: Validation

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 9.1 | Server returns 400 with field errors for invalid input | ✅ | `validateBody` middleware |
| 9.2 | Empty title rejected | ✅ | Zod `min(1)` |
| 9.3 | Invalid owner ID rejected | ✅ | Route handler owner check |
| 9.4 | Invalid task ID returns 400 | ✅ | `isNaN(id)` check |
| 9.5 | Missing task returns 404 | ✅ | `GET /api/tasks/:id` 404 test |
| 9.6 | Invalid status value rejected | ✅ | Status endpoint enum check |

**API tests:** `rejects missing title`, `404 for missing task`

---

### AC-10: UI States

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 10.1 | Loading spinner during data fetch | ✅ | `LoadingState` on all pages |
| 10.2 | Empty state when no tasks match | ✅ | `EmptyState` with contextual message |
| 10.3 | Error state with retry on API failure | ✅ | `ErrorState` with `onRetry` |
| 10.4 | Success banner on create/update/status change | ✅ | `SuccessBanner` component |
| 10.5 | Results count displayed on task list | ✅ | "Showing X of Y tasks" |

**Component tests:** `LoadingState`, `EmptyState`, `ErrorState`

---

## Stretch Goals

### AC-11: Activity Log

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 11.1 | Activity history visible on task detail page | ✅ | Activity section in `TaskDetailView` |
| 11.2 | Create events logged | ✅ | `logActivity(..., 'created', ...)` |
| 11.3 | Update events logged | ✅ | `logActivity(..., 'updated', ...)` |
| 11.4 | Status change events logged with from/to | ✅ | Details include old and new status |
| 11.5 | Activity sorted newest first | ✅ | `ORDER BY created_at DESC` |

**API test:** `GET /api/tasks/:id/activity returns activity log`

---

### AC-12: Advanced Filtering

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 12.1 | Filter by priority | ✅ | `TaskFiltersBar` priority select |
| 12.2 | Filter by category | ✅ | `TaskFiltersBar` category select |
| 12.3 | Filter by owner | ✅ | `TaskFiltersBar` owner select |
| 12.4 | Sort by due date, priority, created date, title | ✅ | `sortBy` query param |
| 12.5 | Ascending/descending sort order | ✅ | `sortOrder` query param |
| 12.6 | Pagination with page controls | ✅ | Previous/Next buttons |
| 12.7 | Max 100 items per page enforced server-side | ✅ | `Math.min(100, ...)` in route |

---

### AC-13: Responsive & Accessible

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 13.1 | Layout adapts to mobile screens | ✅ | CSS media queries in `global.css` |
| 13.2 | Skip-to-content link present | ✅ | `Layout.tsx` skip link |
| 13.3 | ARIA labels on interactive elements | ✅ | `aria-label`, `aria-current`, `role` attrs |
| 13.4 | Form fields associated with labels | ✅ | `htmlFor` / `id` pairs in `TaskForm` |
| 13.5 | Invalid fields marked with `aria-invalid` | ✅ | Title and owner fields |

---

### AC-14: Tests

| # | Criterion | Status | Verification |
|---|-----------|--------|--------------|
| 14.1 | API integration tests for CRUD | ✅ | `tests/api/tasks.test.ts` |
| 14.2 | API tests for dashboard counts | ✅ | Dashboard + count sync tests |
| 14.3 | API tests for validation | ✅ | Missing title test |
| 14.4 | Component tests for summary cards | ✅ | `tests/client/components.test.tsx` |
| 14.5 | Component tests for state messages | ✅ | Loading, Empty, Error tests |

---

## Acceptance Summary

| Category | Total | Passed |
|----------|-------|--------|
| Core (AC-1 to AC-10) | 47 | 47 ✅ |
| Stretch (AC-11 to AC-14) | 22 | 22 ✅ |
| **Total** | **69** | **69 ✅** |

---

## Regression Checklist (Manual)

Run before each release or major change:

- [ ] `npm run lint` — no TypeScript errors
- [ ] `npm test` — all tests pass
- [ ] `npm run dev` — app loads at localhost:5173
- [ ] Create task → appears in list and dashboard
- [ ] Mark task completed → dashboard count increases
- [ ] Search and filter return correct results
- [ ] Restart server → data persists
- [ ] Mobile viewport → layout stacks correctly
