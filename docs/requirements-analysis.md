# Requirements Analysis

## Project: AI Learning Dashboard / Project Tracker (Option 2 — Frontend-Heavy)

### Business Context

A small dashboard for tracking learning goals, project tasks, ownership, due dates, and progress — covering what is planned, in progress, completed, and overdue.

---

## Core Entities

### User (seeded only)
| Field | Type | Notes |
|-------|------|-------|
| id | integer | Primary key |
| name | string | Display name |
| email | string | Unique |
| role | enum | admin, member, viewer |

No user CRUD in core scope — users are pre-seeded for task ownership.

### ProjectTask
| Field | Type | Notes |
|-------|------|-------|
| id | integer | Primary key |
| title | string | Required |
| description | string | Optional text |
| category | enum | learning, project, research, practice |
| priority | enum | low, medium, high |
| status | enum | planned, in_progress, completed |
| ownerId | integer | FK to User |
| dueDate | date | Optional |
| createdAt | datetime | Auto-set |
| updatedAt | datetime | Auto-updated |

---

## Core Features (Mandatory)

| # | Feature | Implementation |
|---|---------|----------------|
| 1 | Create a task | POST `/api/tasks` + Create Task form |
| 2 | Dashboard summary cards | GET `/api/dashboard/summary` + SummaryCards component |
| 3 | List tasks | GET `/api/tasks` + TasksPage with TaskList |
| 4 | View task detail | GET `/api/tasks/:id` + TaskDetailPage |
| 5 | Update task fields | PATCH `/api/tasks/:id` + Edit form |
| 6 | Mark in-progress / completed | POST `/api/tasks/:id/status` + quick action buttons |
| 7 | Keyword search or status filter | Query params on GET `/api/tasks` |
| 8 | Persist all data | SQLite database |
| 9 | Validate required fields | Zod schemas server-side, form validation client-side |
| 10 | UI states | LoadingState, EmptyState, ErrorState, SuccessBanner components |

### Dashboard Summary Cards
- Total items
- Completed items
- In-progress items
- Overdue items (due date passed, status ≠ completed)
- High-priority items

Counts must derive from real database data and update after mutations.

---

## Stretch Goals (Optional)

| Feature | Status |
|---------|--------|
| ActivityLog / audit history | ✅ Implemented |
| Multiple filters + sorting + pagination | ✅ Implemented |
| Responsive polish + accessibility | ✅ Implemented |
| Authentication + RBAC | ❌ Deferred |
| Advanced test coverage | ✅ Partial (API + component tests) |
| Reusable AI prompt templates | ✅ In `ai-prompts/` |

---

## Non-Functional Requirements

- Data survives server restart (SQLite file persistence)
- RESTful API with JSON responses
- Responsive UI (mobile-friendly)
- Accessible markup (ARIA labels, skip link, keyboard navigation)
- TypeScript for type safety

---

## Out of Scope

- User registration/login
- Real-time collaboration
- File attachments
- Email notifications
