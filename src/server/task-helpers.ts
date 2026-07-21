import type { Response } from 'express';
import type Database from 'better-sqlite3';
import type { ProjectTask, ActivityLog, TaskStatus, TaskPriority, TaskCategory, UserRole } from '../shared/types';
import { TASK_WITH_OWNER_SELECT, MAX_PAGE_LIMIT, DEFAULT_PAGE_LIMIT } from './constants';
import { TASK_STATUSES } from './validators';

/** Raw SQLite row shape before camelCase mapping (includes optional JOIN columns). */
export interface TaskRow {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  owner_id: number;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  owner_email?: string;
  owner_role?: string;
}

interface ActivityRow {
  id: number;
  task_id: number;
  action: string;
  details: string | null;
  created_at: string;
}

/** Parses :id route param; sends 400 and returns null when the value is not an integer. */
export function parseTaskId(rawId: string | string[], res: Response): number | null {
  const idStr = Array.isArray(rawId) ? rawId[0] : rawId;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid task ID' });
    return null;
  }
  return id;
}

/** Converts a joined SQLite row into the API-facing ProjectTask shape. */
export function mapTaskRow(row: TaskRow): ProjectTask {
  const task: ProjectTask = {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as TaskCategory,
    priority: row.priority as TaskPriority,
    status: row.status as TaskStatus,
    ownerId: row.owner_id,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.owner_name) {
    task.owner = {
      id: row.owner_id,
      name: row.owner_name,
      email: row.owner_email ?? '',
      role: (row.owner_role ?? 'member') as UserRole,
    };
  }

  return task;
}

export function mapActivityRows(rows: ActivityRow[]): ActivityLog[] {
  return rows.map((row) => ({
    id: row.id,
    taskId: row.task_id,
    action: row.action,
    details: row.details,
    createdAt: row.created_at,
  }));
}

export function fetchTaskWithOwner(db: Database.Database, id: number): TaskRow | undefined {
  return db
    .prepare(`${TASK_WITH_OWNER_SELECT} WHERE t.id = ?`)
    .get(id) as TaskRow | undefined;
}

export function taskExists(db: Database.Database, id: number): boolean {
  return Boolean(db.prepare('SELECT id FROM project_tasks WHERE id = ?').get(id));
}

export function ownerExists(db: Database.Database, ownerId: number): boolean {
  return Boolean(db.prepare('SELECT id FROM users WHERE id = ?').get(ownerId));
}

export function sendOwnerNotFound(res: Response): void {
  res.status(400).json({
    error: 'Validation failed',
    details: { ownerId: ['Owner does not exist'] },
  });
}

/** Records an audit event; called after every create, update, or status change. */
export function logActivity(db: Database.Database, taskId: number, action: string, details?: string): void {
  db.prepare('INSERT INTO activity_logs (task_id, action, details) VALUES (?, ?, ?)').run(
    taskId,
    action,
    details ?? null
  );
}

/** Type guard for POST /tasks/:id/status — Zod is not applied on that route. */
export function isValidTaskStatus(status: unknown): status is TaskStatus {
  return typeof status === 'string' && (TASK_STATUSES as readonly string[]).includes(status);
}

/** UTC date string (YYYY-MM-DD) used for overdue comparisons in SQL and UI. */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/** Normalizes page/limit query params and enforces server-side bounds. */
export function clampPagination(page: string | undefined, limit: string | undefined): {
  pageNum: number;
  limitNum: number;
  offset: number;
} {
  const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
  const limitNum = Math.min(MAX_PAGE_LIMIT, Math.max(1, parseInt(limit ?? String(DEFAULT_PAGE_LIMIT), 10) || DEFAULT_PAGE_LIMIT));
  return { pageNum, limitNum, offset: (pageNum - 1) * limitNum };
}
