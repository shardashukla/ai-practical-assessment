# Design Notes

## Visual Design

### Color System
- **Primary**: Indigo (`#4f46e5`) — actions, links, active nav
- **Status colors**: Planned (indigo), In Progress (sky blue), Completed (emerald)
- **Priority colors**: High (red), Medium (amber), Low (slate)
- **Semantic**: Success (green), Warning (amber), Danger (red)

### Typography
- **Font**: Inter (Google Fonts) with system fallback
- **Scale**: 1.75rem page titles, 1rem task titles, 0.875rem body/meta

### Layout
- Max content width: 1200px, centered
- Sticky header with horizontal navigation
- Card-based UI for summary metrics and task items
- Grid layout for summary cards (auto-fit, min 180px)

## Component Architecture

```
App
└── Layout (header, nav, footer)
    ├── DashboardPage
    │   ├── SummaryCards
    │   └── TaskList (recent)
    ├── TasksPage
    │   ├── TaskFiltersBar
    │   ├── TaskList
    │   └── Pagination
    ├── TaskDetailPage
    │   └── TaskDetailView
    │       └── Activity log
    ├── CreateTaskPage
    │   └── TaskForm
    └── EditTaskPage
        └── TaskForm
```

## UX Decisions

1. **Dashboard as home** — Summary cards give immediate overview; recent tasks below for quick access
2. **Inline status actions** — Detail page has one-click "Mark In Progress" / "Mark Completed" without opening edit form
3. **Debounced search** — 300ms debounce prevents excessive API calls while typing
4. **Success banners** — Non-blocking feedback with auto-dismiss; create/edit redirect after brief delay
5. **Overdue highlighting** — Red left border on list items + "Overdue" badge on detail

## Accessibility

- Skip-to-content link for keyboard users
- `role="status"`, `role="alert"`, `aria-live` on dynamic messages
- All form inputs have associated `<label>` elements
- `aria-current="page"` on active nav link
- `prefers-reduced-motion` respected for spinner animation
- Sufficient color contrast on badges and text

## Responsive Breakpoints

| Breakpoint | Changes |
|------------|---------|
| ≤768px | Stacked header, single-column forms, full-width filters |
| ≤480px | Single-column summary cards, stacked page headers |

## Data Flow

```
User Action → React Component → api.ts (fetch) → Express Route → SQLite → JSON Response → UI Update
```

No global state library — each page fetches its own data via `useAsyncData` hook. Mutations trigger `reload()` on affected queries.

## Deferred Design Decisions

- **Authentication**: No login screen; all users share access (stretch deferred)
- **Dark mode**: Not implemented; light theme only
- **Drag-and-drop**: Status changes via buttons, not kanban board
