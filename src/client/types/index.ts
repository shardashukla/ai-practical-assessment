export type {
  User,
  UserRole,
  ProjectTask,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  DashboardSummary,
  ActivityLog,
  TaskFilters,
  PaginatedTasks,
  CreateTaskInput,
  UpdateTaskInput,
  ApiError,
} from '../../shared/types';

export const STATUS_LABELS: Record<string, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const CATEGORY_LABELS: Record<string, string> = {
  learning: 'Learning',
  project: 'Project',
  research: 'Research',
  practice: 'Practice',
};

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Overdue rule (mirrors dashboard SQL):
 * due_date < today AND status is not completed.
 */
export function isOverdue(task: { status: string; dueDate: string | null }): boolean {
  if (!task.dueDate || task.status === 'completed') return false;
  const today = new Date().toISOString().split('T')[0];
  return task.dueDate < today;
}
