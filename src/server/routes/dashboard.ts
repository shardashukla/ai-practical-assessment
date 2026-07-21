import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { getTodayDateString } from '../task-helpers';
import type { DashboardSummary } from '../../shared/types';

const router = Router();

/** Aggregate dashboard counts. Overdue excludes completed tasks with a past due_date. */
router.get('/summary', (_req: Request, res: Response) => {
  const db = getDb();
  const today = getTodayDateString();

  const total = (db.prepare('SELECT COUNT(*) as count FROM project_tasks').get() as { count: number }).count;
  const completed = (db.prepare("SELECT COUNT(*) as count FROM project_tasks WHERE status = 'completed'").get() as { count: number }).count;
  const inProgress = (db.prepare("SELECT COUNT(*) as count FROM project_tasks WHERE status = 'in_progress'").get() as { count: number }).count;
  // Business rule: overdue = not completed AND due_date < today (null due dates are excluded).
  const overdue = (db.prepare(
    "SELECT COUNT(*) as count FROM project_tasks WHERE status != 'completed' AND due_date IS NOT NULL AND due_date < ?"
  ).get(today) as { count: number }).count;
  const highPriority = (db.prepare("SELECT COUNT(*) as count FROM project_tasks WHERE priority = 'high'").get() as { count: number }).count;

  const summary: DashboardSummary = {
    total,
    completed,
    inProgress,
    overdue,
    highPriority,
  };

  res.json(summary);
});

export default router;
