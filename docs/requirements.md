# Requirements — AI Learning Dashboard / Project Tracker

## Project Goal

Build a full-stack **AI Learning Dashboard / Project Tracker** that allows users to create, view, update, and track learning goals and project tasks. The application provides a dashboard with real-time summary metrics, searchable and filterable task lists, task detail views with quick status actions, and persistent storage so data survives server restarts.

This is a **frontend-heavy** assessment project with a lightweight Express API and SQLite persistence. The primary audience is individuals or small teams tracking personal or project-based learning progress.

---

## Business Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| BR-1 | Users must be able to create tasks with title, category, priority, owner, and optional description/due date | Mandatory |
| BR-2 | Dashboard must display aggregate counts: total, completed, in-progress, overdue, and high-priority tasks | Mandatory |
| BR-3 | Users must be able to browse, search, and filter the full task list | Mandatory |
| BR-4 | Users must be able to view full task details including owner information | Mandatory |
| BR-5 | Users must be able to edit task fields and change status | Mandatory |
| BR-6 | Task data must persist across server restarts | Mandatory |
| BR-7 | Invalid input must be rejected with clear field-level error messages | Mandatory |
| BR-8 | The UI must handle loading, empty, error, and success states gracefully | Mandatory |
| BR-9 | Task changes must be recorded in an activity audit log | Stretch |
| BR-10 | Advanced filtering (priority, category, owner), sorting, and pagination must be supported | Stretch |
| BR-11 | The application must be responsive and accessible on mobile and desktop | Stretch |

---

## Functional Flow

### High-Level User Journey

```
Landing (Dashboard)
    ├── View summary cards (5 metrics)
    ├── View 5 most recent tasks
    ├── Navigate to full task list
    └── Create new task
            ├── Fill form → Submit → Redirect to task detail
            └── Validation errors shown inline

Task List
    ├── Search by keyword (debounced 300ms)
    ├── Filter by status, priority, category, owner
    ├── Sort by created date, due date, priority, or title
    ├── Paginate results (10 per page)
    └── Click task → Task Detail

Task Detail
    ├── View full task metadata and description
    ├── Quick status actions (Mark In Progress / Completed / Planned)
    ├── View activity history
    └── Edit task → Edit form → Save → Redirect to detail
```

### Data Flow

```
React UI (pages/components)
    ↓ fetch via api.ts
Express REST API (/api/*)
    ↓ Zod validation middleware
SQLite (users, project_tasks, activity_logs)
```

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Task with no due date | Not counted as overdue; displays "—" in UI |
| Completed task past due date | Not counted as overdue in dashboard or UI badge |
| Empty task list | Empty state with CTA to create first task |
| No tasks match filters | Empty state with hint to adjust filters |
| Invalid task ID in URL | Error state: "Invalid task ID" or 404 from API |
| Missing title on create | Server returns 400 with `{ error, details: { title: [...] } }` |
| Non-existent owner ID | Server returns 400 with owner validation error |
| PATCH with no fields | Server returns 400: "No fields to update" |
| Invalid status value | Server returns 400 with descriptive message |
| API unreachable | Error state with "Try again" retry button |
| First server start (no DB) | Schema and seed data auto-applied |
| Server restart | All data retained in SQLite file |

---

## Validation Rules

### Server-Side (Zod)

| Field | Create | Update | Rules |
|-------|--------|--------|-------|
| title | Required | Optional | 1–200 characters |
| description | Optional | Optional | Max 2000 characters, defaults to `""` |
| category | Required | Optional | Enum: `learning`, `project`, `research`, `practice` |
| priority | Required | Optional | Enum: `low`, `medium`, `high` |
| status | Optional | Optional | Enum: `planned`, `in_progress`, `completed`; default `planned` |
| ownerId | Required | Optional | Positive integer; must exist in `users` table |
| dueDate | Optional | Optional | ISO date string (`YYYY-MM-DD`) or null |

### Client-Side

- HTML5 `required` on title field
- Server validation errors displayed inline per field via `ApiRequestError.details`
- Owner dropdown populated from `GET /api/users`

### Business Rules

- **Overdue:** `due_date IS NOT NULL AND due_date < today AND status != 'completed'`
- **High priority count:** All tasks where `priority = 'high'` regardless of status
- **Dashboard counts:** Computed fresh from database on every request (not cached)

---

## Success Criteria

1. All 10 core acceptance criteria (AC-1 through AC-10) pass manual and automated verification
2. Dashboard counts match actual database records after any mutation
3. Created/updated tasks appear in list and detail views without page refresh (after navigation/reload)
4. API tests pass: `npm test` exits with code 0
5. TypeScript compiles without errors: `npm run lint`
6. Application runs locally via `npm run dev` (API :3001, frontend :5173)
7. Production build serves SPA + API from single port: `npm run build && npm start`

---

## Assumptions

1. **Single-user / trusted environment** — No authentication is required; all API endpoints are public
2. **Seeded users** — Task owners are pre-loaded; no user registration or CRUD
3. **Local deployment** — SQLite file storage is sufficient; no distributed database needed
4. **Browser support** — Modern evergreen browsers with ES2020+ support
5. **Date handling** — Due dates stored and compared as `YYYY-MM-DD` strings in UTC date context
6. **English UI** — All labels, messages, and date formatting use `en-US` locale
7. **No real-time sync** — Data refreshes on navigation or explicit reload; no WebSockets

---

## Constraints

| Constraint | Detail |
|------------|--------|
| Tech stack | React 18, TypeScript, Vite, Express 4, SQLite (better-sqlite3), Zod |
| No auth | JWT, sessions, and RBAC enforcement are out of scope |
| No schema changes | Database schema is fixed; migrations not required for assessment |
| API contract | REST JSON endpoints as defined in `api-contract.md` must not change |
| File persistence | Data stored in `database/app.db` (configurable via `DATABASE_PATH`) |
| Monorepo layout | Client, server, and shared types in single repository |
| Assessment scope | Focus on frontend quality, API correctness, and documentation |

---

## Out of Scope

- User registration, login, and session management
- Role-based access control enforcement (roles stored but not enforced)
- Real-time collaboration or WebSocket updates
- File attachments on tasks
- Email or push notifications
- End-to-end browser automation (Playwright/Cypress)
- Cloud deployment and container orchestration
- MongoDB or other NoSQL databases

---

## Related Documents

- [USER_STORIES.md](./USER_STORIES.md) — User stories with acceptance mapping
- [ACCEPTANCE_CRITERIA.md](./ACCEPTANCE_CRITERIA.md) — Testable acceptance checklist
- [FUNCTIONAL_REQUIREMENTS.md](./FUNCTIONAL_REQUIREMENTS.md) — Detailed feature specifications
- [NON_FUNCTIONAL_REQUIREMENTS.md](./NON_FUNCTIONAL_REQUIREMENTS.md) — Performance, security, and quality attributes
