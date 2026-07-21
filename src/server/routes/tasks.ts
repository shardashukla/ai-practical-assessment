import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { validateBody } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema } from '../validators';
import {
  DEFAULT_TASK_SORT_COLUMN,
  TASK_SORT_COLUMNS,
  TASK_WITH_OWNER_SELECT,
} from '../constants';
import {
  type TaskRow,
  parseTaskId,
  mapTaskRow,
  mapActivityRows,
  fetchTaskWithOwner,
  taskExists,
  ownerExists,
  sendOwnerNotFound,
  logActivity,
  isValidTaskStatus,
  clampPagination,
} from '../task-helpers';
import type { PaginatedTasks } from '../../shared/types';

const router = Router();

/** List tasks with optional filters, search, sort, and pagination. */
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const {
    status,
    priority,
    category,
    ownerId,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page,
    limit,
  } = req.query;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (status && typeof status === 'string') {
    conditions.push('t.status = ?');
    params.push(status);
  }
  if (priority && typeof priority === 'string') {
    conditions.push('t.priority = ?');
    params.push(priority);
  }
  if (category && typeof category === 'string') {
    conditions.push('t.category = ?');
    params.push(category);
  }
  if (ownerId && typeof ownerId === 'string') {
    conditions.push('t.owner_id = ?');
    params.push(parseInt(ownerId, 10));
  }
  if (search && typeof search === 'string' && search.trim()) {
    conditions.push('(t.title LIKE ? OR t.description LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortCol = TASK_SORT_COLUMNS[sortBy as string] ?? DEFAULT_TASK_SORT_COLUMN;
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
  const { pageNum, limitNum, offset } = clampPagination(page as string, limit as string);

  const countRow = db
    .prepare(`SELECT COUNT(*) as count FROM project_tasks t ${whereClause}`)
    .get(...params) as { count: number };

  const rows = db
    .prepare(`
      ${TASK_WITH_OWNER_SELECT}
      ${whereClause}
      ORDER BY ${sortCol} ${order}
      LIMIT ? OFFSET ?
    `)
    .all(...params, limitNum, offset) as TaskRow[];

  const result: PaginatedTasks = {
    items: rows.map(mapTaskRow),
    total: countRow.count,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(countRow.count / limitNum) || 1,
  };

  res.json(result);
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseTaskId(req.params.id, res);
  if (id === null) return;

  const row = fetchTaskWithOwner(getDb(), id);
  if (!row) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  res.json(mapTaskRow(row));
});

router.get('/:id/activity', (req: Request, res: Response) => {
  const db = getDb();
  const id = parseTaskId(req.params.id, res);
  if (id === null) return;

  if (!taskExists(db, id)) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const rows = db
    .prepare(
      'SELECT id, task_id, action, details, created_at FROM activity_logs WHERE task_id = ? ORDER BY created_at DESC'
    )
    .all(id) as Array<{
      id: number;
      task_id: number;
      action: string;
      details: string | null;
      created_at: string;
    }>;

  res.json(mapActivityRows(rows));
});

router.post('/', validateBody(createTaskSchema), (req: Request, res: Response) => {
  const db = getDb();
  const { title, description, category, priority, status, ownerId, dueDate } = req.body;

  if (!ownerExists(db, ownerId)) {
    sendOwnerNotFound(res);
    return;
  }

  const result = db
    .prepare(`
      INSERT INTO project_tasks (title, description, category, priority, status, owner_id, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(title, description ?? '', category, priority, status ?? 'planned', ownerId, dueDate ?? null);

  const taskId = result.lastInsertRowid as number;
  logActivity(db, taskId, 'created', `Task "${title}" created`);

  const row = fetchTaskWithOwner(db, taskId)!;
  res.status(201).json(mapTaskRow(row));
});

router.patch('/:id', validateBody(updateTaskSchema), (req: Request, res: Response) => {
  const db = getDb();
  const id = parseTaskId(req.params.id, res);
  if (id === null) return;

  const existing = db.prepare('SELECT * FROM project_tasks WHERE id = ?').get(id) as TaskRow | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const updates = req.body;
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  if (updates.ownerId !== undefined && !ownerExists(db, updates.ownerId)) {
    sendOwnerNotFound(res);
    return;
  }

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
  if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.ownerId !== undefined) { fields.push('owner_id = ?'); values.push(updates.ownerId); }
  if (updates.dueDate !== undefined) { fields.push('due_date = ?'); values.push(updates.dueDate); }

  fields.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE project_tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  // Distinguish status transitions from generic field updates in the audit log.
  if (updates.status && updates.status !== existing.status) {
    logActivity(db, id, 'status_changed', `Status changed from ${existing.status} to ${updates.status}`);
  } else {
    logActivity(db, id, 'updated', 'Task fields updated');
  }

  const row = fetchTaskWithOwner(db, id)!;
  res.json(mapTaskRow(row));
});

/**
 * Quick status transition endpoint.
 * All transitions between planned / in_progress / completed are allowed (no guards).
 */
router.post('/:id/status', (req: Request, res: Response) => {
  const db = getDb();
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!isValidTaskStatus(status)) {
    res.status(400).json({ error: 'Invalid status. Must be planned, in_progress, or completed.' });
    return;
  }

  const existing = db.prepare('SELECT * FROM project_tasks WHERE id = ?').get(id) as TaskRow | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  db.prepare("UPDATE project_tasks SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
  logActivity(db, id, 'status_changed', `Status changed from ${existing.status} to ${status}`);

  const row = fetchTaskWithOwner(db, id)!;
  res.json(mapTaskRow(row));
});

export default router;
