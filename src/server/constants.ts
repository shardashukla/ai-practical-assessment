/** Maximum tasks returned per page (API clamp). */
export const MAX_PAGE_LIMIT = 100;

/** Default page size when the client omits the limit query param. */
export const DEFAULT_PAGE_LIMIT = 20;

/**
 * Maps API sortBy values to SQL ORDER BY expressions.
 * Priority uses a CASE expression so high sorts before medium before low.
 */
export const TASK_SORT_COLUMNS: Record<string, string> = {
  dueDate: 't.due_date',
  priority: "CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END",
  createdAt: 't.created_at',
  title: 't.title',
};

export const DEFAULT_TASK_SORT_COLUMN = 't.created_at';

/** Shared SELECT used whenever a task is returned with embedded owner data. */
export const TASK_WITH_OWNER_SELECT = `
  SELECT t.*, u.name as owner_name, u.email as owner_email, u.role as owner_role
  FROM project_tasks t
  JOIN users u ON t.owner_id = u.id
`;
