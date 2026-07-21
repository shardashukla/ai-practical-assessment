# Test Strategy

## Goals

1. Verify all core API endpoints work correctly
2. Ensure dashboard counts reflect real data
3. Validate input rejection for required fields
4. Confirm UI components render correct states
5. Catch regressions in summary card values and task CRUD

## Test Levels

### Unit / Integration Tests (API)

**Tool:** Vitest + Supertest  
**Location:** `tests/api/`  
**Database:** Isolated `database/test.db` (created/destroyed per test run)

| Test Suite | Coverage |
|------------|----------|
| Dashboard API | Summary endpoint returns all five counts |
| Tasks CRUD | List, create, read, update, status change |
| Validation | Missing title returns 400 |
| Filtering | Status filter, keyword search |
| Activity | Activity log endpoint |
| Users | Seeded users returned |
| Count sync | Completed count increases after status change |

### Component Tests (Frontend)

**Tool:** Vitest + Testing Library + jsdom  
**Location:** `tests/client/`

| Component | Tests |
|-----------|-------|
| SummaryCards | Renders all five cards with correct values |
| LoadingState | Shows spinner and message |
| EmptyState | Shows title and description |
| ErrorState | Shows error and retry callback |

### Manual Testing Checklist

- [ ] Create task with all fields → appears in list and dashboard
- [ ] Create task without title → validation error shown
- [ ] Search for keyword → filtered results
- [ ] Filter by status → only matching tasks shown
- [ ] Mark task completed → dashboard completed count increases
- [ ] Overdue task shows red indicator
- [ ] Restart server → data persists
- [ ] Mobile viewport → layout stacks correctly
- [ ] Keyboard navigation → skip link, tab through form

## Not Tested (Deferred)

- End-to-end browser tests (Playwright/Cypress)
- Authentication flows (not implemented)
- Load/performance testing
- Cross-browser compatibility matrix

## Running Tests

```bash
npm test           # Run all tests once
npm run test:watch # Watch mode
```

## CI Recommendation

```yaml
- run: npm install
- run: npm run lint
- run: npm test
```

## Test Data

API tests use the same seed data loaded by `resetDbForTests()`. Each test run starts with a fresh database to ensure isolation.
