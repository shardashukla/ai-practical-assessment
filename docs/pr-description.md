# Pull Request Description

## Title

feat: AI Learning Dashboard — full-stack project tracker (Option 2)

## Summary

- Implements a full-stack AI Learning Dashboard / Project Tracker with React frontend, Express API, and SQLite persistence
- Delivers all core mandatory features: task CRUD, dashboard summary cards, search/filter, validation, and UI states (loading, empty, error, success)
- Includes stretch goals: activity log, multi-filter with sorting/pagination, responsive layout, accessibility improvements, and test coverage

## Changes

### Backend
- SQLite schema with users, project_tasks, and activity_logs tables
- REST API for dashboard summary, task CRUD, status changes, activity log, and users
- Zod validation for create/update payloads

### Frontend
- React + TypeScript + Vite SPA with React Router
- Dashboard with five live summary cards
- Task list with search, filters, sorting, and pagination
- Task detail with quick status actions and activity history
- Create/edit forms with validation error display

### Tests
- 12 API integration tests (Supertest)
- 4 component tests (Testing Library)

### Documentation
- Full assessment deliverable set per required repository structure
- AI prompt history in `ai-prompts/`

## Test Plan

- [x] `npm install` succeeds
- [x] `npm run db:init` creates and seeds database
- [x] `npm run dev` starts API (:3001) and frontend (:5173)
- [x] Dashboard shows correct summary counts from seed data
- [x] Create task → appears in list and updates counts
- [x] Search and status filter work on tasks page
- [x] Mark task completed → dashboard count updates
- [x] Data persists after server restart
- [x] `npm test` passes all tests
- [x] Mobile layout renders correctly at 375px width

## Screenshots

_Add screenshots of dashboard, task list, and task detail after running locally._

## Notes

- Authentication/RBAC deferred (optional stretch)
- Candidate should fill in `candidate-info.md` with personal details
