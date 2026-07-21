# Reflection

## What Went Well

1. **Planning-first approach** — Defining the API contract and data model before coding prevented rework. The shared types file kept frontend and backend aligned.

2. **AI-assisted scaffolding** — Cursor accelerated boilerplate generation (Express routes, React components, documentation) while I focused on architecture decisions and review.

3. **UI state components** — Building reusable Loading/Empty/Error/Success components early made every page consistent and satisfied the "frontend judgment" requirement cleanly.

4. **SQLite simplicity** — For a small assessment project, SQLite provided zero-config persistence without Docker or external services.

## Challenges

1. **ESM module paths** — Node ESM requires `fileURLToPath` instead of `__dirname`. Took a debugging cycle to resolve database path issues.

2. **Dashboard count accuracy** — Getting the overdue definition right (exclude completed, compare dates correctly) required careful SQL and test verification.

3. **Scope management** — The assessment has many deliverables (code + 20+ markdown files). Balancing implementation depth with documentation completeness was the main time challenge.

## What I Would Do Differently

1. **Single COUNT query** for dashboard summary instead of five separate queries
2. **React Query or SWR** for cache invalidation after mutations instead of manual `reload()`
3. **Playwright E2E tests** for critical user flows
4. **Authentication** if this were a production app

## AI Tool Effectiveness

Cursor was most effective for:
- Generating initial project structure and config files
- Writing repetitive CRUD route handlers
- Drafting assessment documentation from the implemented codebase
- Generating test cases from API contract

Cursor required more human oversight for:
- Business logic (overdue calculation, dashboard counts)
- Type safety across shared modules
- UX decisions (which states to show when)
- Security review (SQL injection, input validation)

## Key Learnings

- Frontend-heavy assessments reward explicit UI state handling — investing in state components pays off across every page
- A clear API contract document prevents frontend/backend drift
- Seed data with edge cases (overdue task, varied statuses) makes manual testing and demos more convincing

## Time Breakdown

| Activity | % of Time |
|----------|-----------|
| Backend API + DB | 25% |
| Frontend UI | 40% |
| Documentation | 20% |
| Testing | 10% |
| Debugging | 5% |
