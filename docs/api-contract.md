# API Contract

Base URL: `http://localhost:3001/api` (dev) or `/api` (production via proxy)

All responses are JSON. Errors return `{ "error": string, "details"?: Record<string, string[]> }`.

---

## Dashboard

### GET /dashboard/summary

Returns aggregate counts for dashboard cards.

**Response 200:**
```json
{
  "total": 8,
  "completed": 2,
  "inProgress": 3,
  "overdue": 1,
  "highPriority": 3
}
```

**Count logic:**
- `overdue`: `status != 'completed' AND due_date < today`
- `highPriority`: `priority = 'high'` (all statuses)

---

## Tasks

### GET /tasks

List tasks with optional filters, search, sort, and pagination.

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| status | string | planned, in_progress, completed |
| priority | string | low, medium, high |
| category | string | learning, project, research, practice |
| ownerId | number | Filter by owner |
| search | string | Keyword search in title/description |
| sortBy | string | dueDate, priority, createdAt, title |
| sortOrder | string | asc, desc (default: desc) |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |

**Response 200:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Complete React Hooks deep-dive",
      "description": "Study useEffect...",
      "category": "learning",
      "priority": "high",
      "status": "in_progress",
      "ownerId": 1,
      "dueDate": "2026-07-15",
      "createdAt": "2026-06-20 10:00:00",
      "updatedAt": "2026-07-01 14:30:00",
      "owner": {
        "id": 1,
        "name": "Sharda Shukla",
        "email": "sharda.shukla@gmail.com",
        "role": "admin"
      }
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### GET /tasks/:id

**Response 200:** Single task object (same shape as items above)

**Response 404:** `{ "error": "Task not found" }`

### POST /tasks

Create a new task.

**Request body:**
```json
{
  "title": "New learning goal",
  "description": "Optional description",
  "category": "learning",
  "priority": "medium",
  "status": "planned",
  "ownerId": 1,
  "dueDate": "2026-08-01"
}
```

**Required:** title, category, priority, ownerId

**Response 201:** Created task object

**Response 400:** Validation error with field details

### PATCH /tasks/:id

Update task fields. Send only fields to change.

**Request body:** Partial of POST fields

**Response 200:** Updated task object

**Response 404:** Task not found

### POST /tasks/:id/status

Quick status change.

**Request body:**
```json
{ "status": "in_progress" }
```

**Response 200:** Updated task object

### GET /tasks/:id/activity

**Response 200:**
```json
[
  {
    "id": 1,
    "taskId": 1,
    "action": "created",
    "details": "Task \"...\" created",
    "createdAt": "2026-06-20 10:00:00"
  }
]
```

---

## Users

### GET /users

Returns seeded users for owner dropdown.

**Response 200:**
```json
[
  { "id": 1, "name": "Sharda Shukla", "email": "sharda.shukla@gmail.com", "role": "admin" }
]
```

---

## Health

### GET /health

**Response 200:** `{ "status": "ok", "timestamp": "..." }`
