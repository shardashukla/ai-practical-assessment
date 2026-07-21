# UI Flow

## Navigation Map

```
┌─────────────┐
│  Dashboard  │ ← Home (/)
└──────┬──────┘
       │
   ┌───┴───┬──────────┬────────────┐
   ▼       ▼          ▼            ▼
 Tasks   New Task  Task Detail  Edit Task
(/tasks) (/tasks/new) (/tasks/:id) (/tasks/:id/edit)
```

## Flow 1: View Dashboard

1. User lands on `/` (Dashboard)
2. **Loading**: Spinner while fetching summary + recent tasks
3. **Success**: Five summary cards + list of 5 most recent tasks
4. **Empty**: "No tasks yet" with CTA to create
5. **Error**: Error message with "Try again" button

## Flow 2: Create Task

1. User clicks "+ New Task" from dashboard or tasks page
2. Navigates to `/tasks/new`
3. Form loads with owner dropdown (from seeded users)
4. User fills required fields (title, category, priority, owner)
5. User clicks "Create Task"
6. **Validation error**: Inline field errors from server
7. **Success**: Green banner → redirect to task detail after 800ms
8. **API error**: Error message displayed above form

## Flow 3: Browse & Filter Tasks

1. User navigates to `/tasks`
2. Filter bar: search, status, priority, category, owner, sort
3. Search debounced 300ms before API call
4. **Loading**: Spinner
5. **Results**: Task list with count ("Showing X of Y tasks")
6. **Empty**: "No tasks found" with filter hint or create CTA
7. **Pagination**: Previous/Next if more than 10 items

## Flow 4: View Task Detail

1. User clicks task from list → `/tasks/:id`
2. **Loading**: Spinner
3. **Success**: Full task info, badges, meta, quick actions, activity log
4. **Not found**: Error state with back link

## Flow 5: Quick Status Change

1. On task detail, user clicks "Mark In Progress" or "Mark Completed"
2. Button disabled during request
3. **Success**: Banner + refreshed task data + activity log updated
4. **Error**: Inline error message

## Flow 6: Edit Task

1. User clicks "Edit" on detail page → `/tasks/:id/edit`
2. Form pre-populated with current values
3. User modifies fields and clicks "Update Task"
4. **Validation error**: Inline field errors
5. **Success**: Banner → redirect to detail page

## UI State Matrix

| Page | Loading | Empty | Error | Success |
|------|---------|-------|-------|---------|
| Dashboard | Spinner | "No tasks yet" | Retry button | Cards + list |
| Tasks | Spinner | "No tasks found" | Retry button | Filtered list |
| Task Detail | Spinner | N/A | Retry + back link | Full detail |
| Create Task | Form loading | N/A | Error banner | Success banner |
| Edit Task | Form loading | N/A | Error banner | Success banner |

## Wireframe Descriptions

### Dashboard
```
[Header: Logo | Dashboard | Tasks | New Task]
[Total: 8] [Completed: 2] [In Progress: 3] [Overdue: 1] [High Priority: 3]
Recently Updated                    View all →
┌──────────────────────────────────────────────┐
│ Task title                    [In Progress] │
│ Description preview...                        │
│ [High] [Learning] 👤 Alex  📅 Jul 15         │
└──────────────────────────────────────────────┘
```

### Tasks List
```
[Search...] [Status ▼] [Priority ▼] [Category ▼] [Owner ▼] [Sort ▼]
Showing 8 of 8 tasks
┌── Task cards (same as dashboard) ──┐
[← Previous]  Page 1 of 1  [Next →]
```
