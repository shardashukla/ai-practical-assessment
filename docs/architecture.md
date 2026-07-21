# Architecture — AI Learning Dashboard / Project Tracker

System architecture documentation reflecting the **current implementation**.

---

## High-Level Architecture

The application is a **monorepo full-stack SPA** with a React frontend, Express REST API, and SQLite persistence. In development, Vite serves the frontend with an API proxy; in production, Express serves both the built SPA and API from a single port.

```mermaid
flowchart TB
    subgraph Client["Browser"]
        SPA[React SPA<br/>Vite / Static]
    end

    subgraph Dev["Development (:5173 + :3001)"]
        Vite[Vite Dev Server<br/>:5173]
        ExpressDev[Express API<br/>:3001]
        Vite -->|proxy /api| ExpressDev
    end

    subgraph Prod["Production (:3001)"]
        ExpressProd[Express Server<br/>:3001]
        Static[dist/client<br/>Static Files]
        ExpressProd --> Static
        ExpressProd --> API[REST API<br/>/api/*]
    end

    subgraph Data["Persistence"]
        SQLite[(SQLite<br/>database/app.db)]
    end

    SPA -->|dev| Vite
    SPA -->|prod| ExpressProd
    ExpressDev --> SQLite
    API --> SQLite
```

### Architecture Characteristics

| Attribute | Value |
|-----------|-------|
| Pattern | Layered MVC (Model-View-Controller) |
| Communication | REST JSON over HTTP |
| Auth | None (public API) |
| State | Server: stateless; Client: local hooks per page |
| Deployment unit | Single Node.js process |

---

## System Layers

```mermaid
flowchart LR
    subgraph Presentation["Presentation Layer"]
        Pages[Pages]
        Components[Components]
        Hooks[Hooks]
    end

    subgraph Application["Application Layer"]
        ApiClient[api.ts]
        Routes[Express Routes]
        Middleware[Validation Middleware]
    end

    subgraph Domain["Domain Layer"]
        Types[Shared Types]
        Validators[Zod Schemas]
        BusinessRules[Business Rules<br/>overdue, counts, activity]
    end

    subgraph Data["Data Layer"]
        DbModule[db.ts]
        SQLite[(SQLite)]
    end

    Pages --> Hooks
    Hooks --> ApiClient
    ApiClient -->|HTTP| Routes
    Routes --> Middleware
    Middleware --> Validators
    Routes --> BusinessRules
    Routes --> DbModule
    DbModule --> SQLite
    ApiClient -.-> Types
    Routes -.-> Types
```

---

## Frontend Architecture

### Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| Language | TypeScript |
| Build | Vite 6 |
| Routing | React Router 6 |
| Styling | Global CSS (design tokens) |
| HTTP | Native `fetch` via `api.ts` |
| State | Custom hooks (`useAsyncData`, `useMutation`) |

### Frontend Layer Diagram

```mermaid
flowchart TB
    subgraph Entry
        Main[main.tsx]
        App[App.tsx]
    end

    subgraph Routing
        Router[BrowserRouter]
        Layout[Layout]
    end

    subgraph Pages
        Dashboard[DashboardPage]
        Tasks[TasksPage]
        Detail[TaskDetailPage]
        Create[CreateTaskPage]
        Edit[EditTaskPage]
    end

    subgraph Components
        SummaryCards[SummaryCards]
        TaskList[TaskList]
        TaskForm[TaskForm]
        TaskDetailView[TaskDetailView]
        TaskFiltersBar[TaskFiltersBar]
        StateMessages[StateMessages]
    end

    subgraph Infrastructure
        Hooks[useAsyncData / useMutation]
        ApiService[api.ts]
        Types[types/index.ts]
        CSS[global.css]
    end

    Main --> App
    App --> Router
    Router --> Layout
    Layout --> Dashboard & Tasks & Detail & Create & Edit

    Dashboard --> SummaryCards & TaskList
    Tasks --> TaskFiltersBar & TaskList
    Detail --> TaskDetailView
    Create & Edit --> TaskForm

    Dashboard & Tasks & Detail & Create & Edit --> Hooks
    Hooks --> ApiService
    ApiService --> Types
    Main --> CSS
```

### Component Hierarchy

```
App
└── BrowserRouter
    └── Routes
        └── Layout (header, nav, footer, Outlet)
            ├── DashboardPage (/)
            │   ├── SummaryCards
            │   ├── TaskList (recent, limit=5)
            │   └── StateMessages (Loading, Empty, Error)
            │
            ├── TasksPage (/tasks)
            │   ├── TaskFiltersBar
            │   ├── TaskList (paginated)
            │   ├── Pagination controls
            │   └── StateMessages
            │
            ├── TaskDetailPage (/tasks/:id)
            │   ├── TaskDetailView
            │   │   ├── Status badges
            │   │   ├── Quick action buttons
            │   │   └── Activity log
            │   └── StateMessages (Success, Error)
            │
            ├── CreateTaskPage (/tasks/new)
            │   ├── TaskForm
            │   └── StateMessages
            │
            └── EditTaskPage (/tasks/:id/edit)
                ├── TaskForm (pre-populated)
                └── StateMessages
```

### Page Responsibilities

| Page | Data Fetched | User Actions |
|------|-------------|--------------|
| `DashboardPage` | Summary + recent tasks (5) | Navigate to tasks, create task |
| `TasksPage` | Paginated tasks + users | Search, filter, sort, paginate |
| `TaskDetailPage` | Task + activity log | Quick status change, edit |
| `CreateTaskPage` | Users list | Submit new task form |
| `EditTaskPage` | Task + users list | Submit updated task form |

### State Management Pattern

No global state library. Each page manages its own data lifecycle:

```mermaid
sequenceDiagram
    participant Page
    participant Hook as useAsyncData
    participant API as api.ts
    participant Server as Express

    Page->>Hook: mount with fetcher
    Hook->>Hook: set loading=true
    Hook->>API: fetch(endpoint)
    API->>Server: HTTP GET/POST/PATCH
    Server-->>API: JSON response
    API-->>Hook: parsed data or ApiRequestError
    Hook->>Hook: set data/error, loading=false
    Hook-->>Page: { data, loading, error, reload }

    Note over Page,Hook: Mutation flow uses useMutation
    Page->>Hook: execute(args)
    Hook->>API: mutating request
    API-->>Hook: result or error
    Page->>Hook: reload() on success
```

**Key hooks:**

| Hook | Purpose | Returns |
|------|---------|---------|
| `useAsyncData(fetcher, deps)` | Read operations | `{ data, loading, error, validationErrors, reload }` |
| `useMutation(mutator)` | Write operations | `{ execute, loading, error, validationErrors, success, reset }` |

### Client Error Handling

```
fetch response
    ├── ok → parse JSON → return data
    └── !ok → parse error body → throw ApiRequestError(message, status, details)
                                              ↓
                              Hook catches → sets error / validationErrors
                                              ↓
                              UI renders ErrorState / field errors / error-inline
```

---

## Backend Architecture

### Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js (ES modules) |
| Framework | Express 4 |
| Database driver | better-sqlite3 (synchronous) |
| Validation | Zod 3 |
| CORS | cors middleware |

### Backend Layer Diagram

```mermaid
flowchart TB
    subgraph Server["src/server/"]
        Index[index.ts<br/>App bootstrap]
        
        subgraph Routes["routes/"]
            DashboardR[dashboard.ts<br/>GET /summary]
            TasksR[tasks.ts<br/>CRUD + status + activity]
            UsersR[users.ts<br/>GET /users]
        end

        subgraph Middleware["middleware/"]
            Validate[validate.ts<br/>validateBody]
        end

        Validators[validators.ts<br/>Zod schemas]
        Db[db.ts<br/>Connection + init]
        DbInit[db-init.ts<br/>CLI script]
    end

    Index --> DashboardR & TasksR & UsersR
    TasksR --> Validate
    Validate --> Validators
    DashboardR & TasksR & UsersR --> Db
    DbInit --> Db
```

### Request Processing Pipeline

```mermaid
flowchart LR
    A[HTTP Request] --> B[cors + express.json]
    B --> C{Route Match}
    C -->|/api/dashboard/*| D[Dashboard Router]
    C -->|/api/tasks/*| E[Tasks Router]
    C -->|/api/users/*| F[Users Router]
    C -->|/api/health| G[Health Handler]
    C -->|other /api| H[404 JSON]
    C -->|non-API| I[Static SPA / index.html]

    E --> J{Write operation?}
    J -->|POST/PATCH| K[validateBody Zod]
    K -->|fail| L[400 Validation Error]
    K -->|pass| M[Route Handler]
    J -->|GET| M
    M --> N[getDb + SQL]
    N --> O[JSON Response]
```

### Route Handler Responsibilities

| Router | Endpoints | Key Logic |
|--------|-----------|-----------|
| `dashboard.ts` | `GET /summary` | 5 COUNT queries for metrics |
| `tasks.ts` | CRUD + status + activity | Filtering, pagination, activity logging, owner join |
| `users.ts` | `GET /` | Read seeded users for dropdowns |

### Business Logic Location

Business rules are implemented directly in route handlers:

| Rule | Location | Implementation |
|------|----------|----------------|
| Overdue count | `dashboard.ts` | `status != 'completed' AND due_date < today` |
| Activity logging | `tasks.ts` | `logActivity()` on create/update/status |
| Owner validation | `tasks.ts` | `SELECT id FROM users WHERE id = ?` |
| Priority sort | `tasks.ts` | SQL `CASE` expression for high/medium/low |
| Pagination bounds | `tasks.ts` | `page >= 1`, `limit <= 100` |

---

## API Layer

### Endpoint Map

```mermaid
flowchart LR
    subgraph Dashboard
        D1[GET /api/dashboard/summary]
    end

    subgraph Tasks
        T1[GET /api/tasks]
        T2[GET /api/tasks/:id]
        T3[POST /api/tasks]
        T4[PATCH /api/tasks/:id]
        T5[POST /api/tasks/:id/status]
        T6[GET /api/tasks/:id/activity]
    end

    subgraph Users
        U1[GET /api/users]
    end

    subgraph System
        H1[GET /api/health]
    end
```

### API Design Principles

1. **JSON only** — All request/response bodies are `application/json`
2. **Consistent errors** — `{ error: string, details?: Record<string, string[]> }`
3. **Owner embedding** — Task responses include `owner` object (JOIN, not separate fetch)
4. **Pagination envelope** — List responses wrap items in `{ items, total, page, limit, totalPages }`
5. **Partial updates** — PATCH accepts only changed fields
6. **Intent-revealing endpoints** — `POST /tasks/:id/status` for quick status changes

### API Flow — Create Task

```mermaid
sequenceDiagram
    participant UI as CreateTaskPage
    participant API as api.ts
    participant MW as validateBody
    participant Route as tasks.ts
    participant DB as SQLite

    UI->>API: POST /api/tasks { title, category, ... }
    API->>Route: HTTP request
    Route->>MW: validateBody(createTaskSchema)
    MW->>MW: Zod safeParse
    alt validation fails
        MW-->>API: 400 { error, details }
    end
    Route->>DB: SELECT owner exists
    alt owner not found
        Route-->>API: 400 { error, details: { ownerId } }
    end
    Route->>DB: INSERT INTO project_tasks
    Route->>DB: INSERT INTO activity_logs (created)
    Route->>DB: SELECT task with owner JOIN
    Route-->>API: 201 ProjectTask
    API-->>UI: task object
    UI->>UI: SuccessBanner → navigate to detail
```

### API Flow — List with Filters

```mermaid
sequenceDiagram
    participant UI as TasksPage
    participant API as api.ts
    participant Route as tasks.ts
    participant DB as SQLite

    UI->>UI: debounce search 300ms
    UI->>API: GET /api/tasks?status=&search=&page=1&limit=10
    API->>Route: HTTP request
    Route->>Route: Build WHERE conditions
    Route->>Route: Map sortBy to SQL column
    Route->>DB: COUNT(*) with filters
    Route->>DB: SELECT with JOIN, ORDER BY, LIMIT, OFFSET
    Route->>Route: mapTaskRow() for each row
    Route-->>API: 200 PaginatedTasks
    API-->>UI: { items, total, page, limit, totalPages }
```

---

## Database Layer

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ project_tasks : "owns (owner_id)"
    project_tasks ||--o{ activity_logs : "has (task_id)"

    users {
        int id PK
        text name
        text email UK
        text role "admin|member|viewer"
    }

    project_tasks {
        int id PK
        text title
        text description
        text category "learning|project|research|practice"
        text priority "low|medium|high"
        text status "planned|in_progress|completed"
        int owner_id FK
        text due_date "YYYY-MM-DD nullable"
        text created_at
        text updated_at
    }

    activity_logs {
        int id PK
        int task_id FK
        text action "created|updated|status_changed"
        text details
        text created_at
    }
```

### Database Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| Engine | SQLite 3 | File-based persistence |
| Driver | better-sqlite3 | Synchronous Node.js binding |
| Journal mode | WAL | Concurrent reads during writes |
| Foreign keys | ON | Referential integrity |
| Default path | `database/app.db` | Overridable via `DATABASE_PATH` |
| Init strategy | Auto on first start | Schema + seed if `users` table missing |

### Initialization Flow

```mermaid
flowchart TD
    A[Server Start] --> B[initializeDatabase]
    B --> C[getDb - open/create file]
    C --> D{users table exists?}
    D -->|No| E[Execute schema.sql]
    E --> F[Execute seed-data.sql]
    D -->|Yes| G[Skip init]
    F --> G
    G --> H[Server ready]
```

### Indexes

| Index | Column | Purpose |
|-------|--------|---------|
| `idx_tasks_status` | `project_tasks.status` | Status filter |
| `idx_tasks_owner` | `project_tasks.owner_id` | Owner filter |
| `idx_tasks_priority` | `project_tasks.priority` | Priority filter |
| `idx_tasks_category` | `project_tasks.category` | Category filter |
| `idx_tasks_due_date` | `project_tasks.due_date` | Due date sort/filter |
| `idx_activity_task` | `activity_logs.task_id` | Activity lookup |

### Data Access Pattern

```typescript
// Synchronous pattern throughout
const db = getDb();
const row = db.prepare('SELECT ... WHERE id = ?').get(id);
const rows = db.prepare('SELECT ...').all(...params);
const result = db.prepare('INSERT ...').run(...values);
```

No ORM, no query builder — raw parameterized SQL for clarity and control.

---

## Shared Layer

`src/shared/types.ts` is the **contract between frontend and backend**:

```mermaid
flowchart LR
    Shared[src/shared/types.ts]
    Server[src/server/routes/*.ts]
    ClientApi[src/client/services/api.ts]
    ClientTypes[src/client/types/index.ts]

    Shared --> Server
    Shared --> ClientApi
    Shared --> ClientTypes
    ClientTypes -->|+ labels, helpers| Components[Components/Pages]
```

**Shared interfaces:** `User`, `ProjectTask`, `DashboardSummary`, `ActivityLog`, `TaskFilters`, `PaginatedTasks`, `CreateTaskInput`, `UpdateTaskInput`, `ApiError`

**Client-only additions** (`src/client/types/index.ts`): `STATUS_LABELS`, `PRIORITY_LABELS`, `CATEGORY_LABELS`, `formatDate()`, `isOverdue()`

---

## Folder Structure

```
ai-practical-assessment/
├── src/
│   ├── client/                      # React frontend (Vite root)
│   │   ├── index.html               # HTML entry point
│   │   ├── main.tsx                 # React bootstrap
│   │   ├── App.tsx                  # Router configuration
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Layout.tsx           # App shell (header, nav, footer)
│   │   │   ├── SummaryCards.tsx     # Dashboard metric cards
│   │   │   ├── TaskList.tsx         # Task list rendering
│   │   │   ├── TaskForm.tsx         # Create/edit form
│   │   │   ├── TaskDetailView.tsx   # Task detail + activity
│   │   │   ├── TaskFiltersBar.tsx   # Search and filter controls
│   │   │   └── StateMessages.tsx    # Loading, Empty, Error, Success
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TasksPage.tsx
│   │   │   ├── TaskDetailPage.tsx
│   │   │   ├── CreateTaskPage.tsx
│   │   │   └── EditTaskPage.tsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useAsyncData.ts      # useAsyncData + useMutation
│   │   ├── services/                # API client layer
│   │   │   └── api.ts               # fetch wrapper + endpoints
│   │   ├── types/                   # Client type re-exports + helpers
│   │   │   └── index.ts
│   │   └── styles/
│   │       └── global.css           # Design tokens + component styles
│   │
│   ├── server/                      # Express backend
│   │   ├── index.ts                 # App entry, middleware, static serve
│   │   ├── db.ts                    # SQLite connection + init + test reset
│   │   ├── db-init.ts               # CLI database initialization
│   │   ├── validators.ts            # Zod schemas + error formatter
│   │   ├── middleware/
│   │   │   └── validate.ts          # validateBody middleware
│   │   └── routes/
│   │       ├── dashboard.ts         # Dashboard summary endpoint
│   │       ├── tasks.ts             # Task CRUD + status + activity
│   │       └── users.ts             # Seeded users endpoint
│   │
│   └── shared/
│       └── types.ts                 # Shared TypeScript interfaces
│
├── database/
│   ├── schema-or-migrations/
│   │   └── schema.sql               # Table definitions + indexes
│   ├── seed-data/
│   │   └── seed-data.sql            # Sample users, tasks, activity
│   └── app.db                       # Runtime SQLite file (gitignored)
│
├── tests/
│   ├── setup.ts                     # Vitest setup
│   ├── api/
│   │   └── tasks.test.ts            # API integration tests
│   └── client/
│       └── components.test.tsx      # Component unit tests
│
├── docs/                            # Centralized documentation
├── ai-prompts/                      # AI workflow evidence
├── dist/                            # Production build output
│   ├── client/                      # Vite build (served by Express)
│   └── server/                      # Compiled TypeScript
│
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # Client TypeScript config
├── tsconfig.server.json             # Server TypeScript config
├── vite.config.ts                   # Vite dev server + proxy
└── vitest.config.ts                 # Test runner config
```

---

## Build & Runtime Architecture

### Development Mode

```mermaid
flowchart LR
    subgraph Terminal
        CMD[npm run dev]
    end

    subgraph Processes
        Vite[Vite :5173<br/>HMR + proxy]
        Express[Express :3001<br/>API only]
    end

    subgraph Browser
        App[React App]
    end

    CMD --> Vite & Express
    App -->|/api/*| Vite
    Vite -->|proxy| Express
    App -->|/* pages| Vite
```

### Production Mode

```mermaid
flowchart LR
    subgraph Build
        B1[npm run build:client<br/>Vite → dist/client]
        B2[npm run build:server<br/>tsc → dist/server]
    end

    subgraph Runtime
        Node[node dist/server/index.js<br/>:3001]
        Static[dist/client/*]
        API[/api/*]
    end

    B1 --> Static
    B2 --> Node
    Node --> Static
    Node --> API
```

| Script | Command | Output |
|--------|---------|--------|
| `dev` | `concurrently dev:server + dev:client` | Two processes |
| `build` | `build:client + build:server` | `dist/` |
| `start` | `node dist/server/index.js` | Single process |
| `test` | `vitest run --no-file-parallelism` | Test results |
| `db:init` | `tsx src/server/db-init.ts` | Fresh database |

---

## Cross-Cutting Concerns

### Validation Architecture

```mermaid
flowchart TB
    subgraph Client
        HTML5[HTML5 required]
        ServerErrors[Server error display]
    end

    subgraph Server
        Zod[Zod Schema]
        Middleware[validateBody]
        CustomCheck[Owner existence check]
    end

    HTML5 -->|first line| Form[TaskForm]
    Form -->|POST/PATCH| Middleware
    Middleware --> Zod
    Zod -->|fail| Error400[400 + details]
    Zod -->|pass| CustomCheck
    CustomCheck -->|fail| Error400
    CustomCheck -->|pass| Handler[Route Handler]
    Error400 --> ServerErrors
```

### Activity Audit Trail

```mermaid
flowchart LR
    Create[POST /tasks] -->|created| Log[(activity_logs)]
    Update[PATCH /tasks/:id] -->|updated or status_changed| Log
    Status[POST /tasks/:id/status] -->|status_changed| Log
    Log --> Display[TaskDetailView activity section]
```

### Accessibility Architecture

| Feature | Implementation |
|---------|----------------|
| Skip link | `Layout.tsx` → `#main-content` |
| Landmarks | `<header>`, `<nav>`, `<main>`, `<footer>` |
| Live regions | `aria-live="polite"` on loading/success |
| Alerts | `role="alert"` on errors |
| Forms | `<label htmlFor>` + `aria-invalid` |
| Navigation | `aria-current="page"` on active link |
| Lists | `role="list"` on task list |

---

## Security Architecture

| Concern | Mitigation | Status |
|---------|------------|--------|
| SQL injection | Parameterized queries (`?` placeholders) | ✅ |
| XSS | React JSX auto-escaping | ✅ |
| Input validation | Zod on write endpoints | ✅ |
| Secrets | None in codebase | ✅ |
| Authentication | Not implemented | ❌ Out of scope |
| CORS | Open in dev (`cors()`) | ⚠️ Tighten for production |
| Rate limiting | Not implemented | ❌ Out of scope |

---

## Scalability Considerations

| Component | Current Limit | Scale Path |
|-----------|--------------|------------|
| SQLite | Single writer, file-based | Migrate to PostgreSQL |
| Dashboard counts | 5 queries per request | Combine into single query |
| Client state | Per-page fetch, no cache | Add React Query |
| Static assets | Served by Express | CDN in front |
| API | Single Node process | Horizontal scale + shared DB |

---

## Related Documents

- [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) — Technology choices and rationale
- [DATABASE.md](./DATABASE.md) — Detailed database documentation (Step 7)
- [API.md](./API.md) — Full API reference (Step 6)
- [STATE_MACHINE.md](./STATE_MACHINE.md) — Task status transitions (Step 5)
- [PROJECT_FLOW.md](./PROJECT_FLOW.md) — User and system flows (Step 14)
