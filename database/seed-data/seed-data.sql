-- Seed users (seeded only — no user CRUD in core scope)
INSERT OR IGNORE INTO users (id, name, email, role) VALUES
  (1, 'Sharda Shukla', 'sharda.shukla@tothenew.com', 'admin'),
  (2, 'Jordan Kim', 'jordan.kim@example.com', 'member'),
  (3, 'Sam Patel', 'sam.patel@example.com', 'member'),
  (4, 'Casey Morgan', 'casey.morgan@example.com', 'viewer');

-- Seed project tasks with varied statuses, priorities, and due dates
INSERT OR IGNORE INTO project_tasks (id, title, description, category, priority, status, owner_id, due_date, created_at, updated_at) VALUES
  (1, 'Complete React Hooks deep-dive', 'Study useEffect, useMemo, useCallback, and custom hooks with practical exercises.', 'learning', 'high', 'in_progress', 1, '2026-07-15', '2026-06-20 10:00:00', '2026-07-01 14:30:00'),
  (2, 'Build dashboard summary cards', 'Implement responsive summary cards showing task counts from live API data.', 'project', 'high', 'completed', 2, '2026-07-05', '2026-06-25 09:00:00', '2026-07-04 16:00:00'),
  (3, 'TypeScript generics practice', 'Work through advanced generic patterns and utility types.', 'practice', 'medium', 'planned', 3, '2026-07-20', '2026-07-01 11:00:00', '2026-07-01 11:00:00'),
  (4, 'API contract documentation', 'Document all REST endpoints with request/response examples.', 'project', 'medium', 'in_progress', 2, '2026-07-10', '2026-06-28 08:00:00', '2026-07-03 10:15:00'),
  (5, 'Accessibility audit', 'Review keyboard navigation, ARIA labels, and color contrast.', 'research', 'low', 'planned', 4, '2026-07-25', '2026-07-02 13:00:00', '2026-07-02 13:00:00'),
  (6, 'Overdue: SQLite migration notes', 'Document database setup and migration strategy.', 'project', 'high', 'planned', 1, '2026-06-30', '2026-06-15 09:00:00', '2026-06-15 09:00:00'),
  (7, 'Vitest unit tests for API', 'Write tests for task CRUD and dashboard summary endpoints.', 'project', 'medium', 'in_progress', 3, '2026-07-12', '2026-07-01 15:00:00', '2026-07-05 09:30:00'),
  (8, 'CSS responsive polish', 'Improve mobile layout for task list and detail views.', 'project', 'low', 'completed', 2, '2026-07-03', '2026-06-30 10:00:00', '2026-07-03 17:00:00');

-- Seed activity logs (stretch: audit history)
INSERT OR IGNORE INTO activity_logs (id, task_id, action, details, created_at) VALUES
  (1, 1, 'created', 'Task created with status planned', '2026-06-20 10:00:00'),
  (2, 1, 'status_changed', 'Status changed from planned to in_progress', '2026-07-01 14:30:00'),
  (3, 2, 'created', 'Task created with status planned', '2026-06-25 09:00:00'),
  (4, 2, 'status_changed', 'Status changed from in_progress to completed', '2026-07-04 16:00:00'),
  (5, 6, 'created', 'Task created — now overdue', '2026-06-15 09:00:00');
