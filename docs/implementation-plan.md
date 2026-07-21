# Implementation Plan

## Phase 1: Foundation (Day 1 — Morning)

1. **Project scaffolding**
   - Initialize npm project with TypeScript
   - Configure Vite (frontend) and tsx (backend)
   - Set up folder structure per assessment requirements

2. **Database layer**
   - Write `database/schema-or-migrations/schema.sql` for users, project_tasks, activity_logs
   - Write `database/seed-data/seed-data.sql` with sample users and tasks
   - Implement `db.ts` with auto-initialization

3. **Shared types**
   - Define TypeScript interfaces in `src/shared/types.ts`
   - Used by both client and server

## Phase 2: Backend API (Day 1 — Afternoon)

4. **Validation**
   - Zod schemas for create/update task
   - Validation middleware

5. **Routes**
   - `GET /api/dashboard/summary` — aggregate counts
   - `GET/POST/PATCH /api/tasks` — CRUD
   - `POST /api/tasks/:id/status` — quick status
   - `GET /api/tasks/:id/activity` — audit log
   - `GET /api/users` — owner dropdown data

6. **Activity logging**
   - Log create, update, status_change events

## Phase 3: Frontend Core (Day 2 — Morning)

7. **App shell**
   - React Router setup with Layout (header, nav, footer)
   - Global CSS with design tokens

8. **State management hooks**
   - `useAsyncData` for fetch + loading/error
   - `useMutation` for create/update with validation errors

9. **Reusable components**
   - SummaryCards, TaskList, TaskForm, TaskDetailView
   - StateMessages (Loading, Empty, Error, Success)

## Phase 4: Frontend Pages (Day 2 — Afternoon)

10. **Pages**
    - DashboardPage — summary + recent tasks
    - TasksPage — filtered list with pagination
    - TaskDetailPage — view + quick actions
    - CreateTaskPage / EditTaskPage — forms

11. **Filters (stretch)**
    - TaskFiltersBar with search, status, priority, category, owner, sort

## Phase 5: Polish & Testing (Day 3)

12. **Responsive & a11y**
    - Mobile breakpoints in CSS
    - Skip link, ARIA attributes, focus styles

13. **Tests**
    - API tests with Supertest (CRUD, validation, dashboard counts)
    - Component tests with Testing Library

14. **Documentation**
    - All assessment markdown deliverables
    - AI prompt history

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Dashboard counts out of sync | Compute from DB on every request, not cached |
| Overdue logic incorrect | Compare due_date < today AND status ≠ completed |
| Form validation mismatch | Shared field names, server is source of truth |
| Data loss on restart | SQLite file persistence, WAL mode |

## Dependencies

No heavy frameworks beyond React, Express, and better-sqlite3. All dependencies pinned in `package.json`.
