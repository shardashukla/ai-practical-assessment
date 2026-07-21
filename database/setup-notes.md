# Database Setup Notes

## Overview

The application uses **SQLite** via `better-sqlite3` for persistence. Data is stored in `database/app.db` and survives server restarts.

## Prerequisites

- Node.js 18+
- npm dependencies installed (`npm install`)

## Initialization

From the project root:

```bash
npm run db:init
```

This command:
1. Creates `database/app.db` if it does not exist
2. Applies `database/schema-or-migrations/schema.sql`
3. Loads `database/seed-data/seed-data.sql`

The server also auto-initializes the database on first startup if `app.db` is missing.

## Schema

| Table | Purpose |
|-------|---------|
| `users` | Seeded users for task ownership (no CRUD in core) |
| `project_tasks` | Learning goals and project tasks |
| `activity_logs` | Audit trail for task changes (stretch) |

## Resetting Data

To reset to seed state:

```bash
rm database/app.db
npm run db:init
```

## Environment

- Default DB path: `database/app.db` (relative to project root)
- Override with `DATABASE_PATH` environment variable

## Production Notes

For production, consider:
- Regular backups of `app.db`
- WAL mode for concurrent reads (already enabled in code)
- Migration tooling if schema evolves
