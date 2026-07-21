import { z } from 'zod';

/** Allowed task lifecycle states — shared by Zod schemas and the status endpoint guard. */
export const TASK_STATUSES = ['planned', 'in_progress', 'completed'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export const TASK_CATEGORIES = ['learning', 'project', 'research', 'practice'] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(2000).optional().default(''),
  category: z.enum(TASK_CATEGORIES),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES).optional().default('planned'),
  ownerId: z.number().int().positive('Owner is required'),
  dueDate: z.string().nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  category: z.enum(TASK_CATEGORIES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  ownerId: z.number().int().positive().optional(),
  dueDate: z.string().nullable().optional(),
});

export type CreateTaskBody = z.infer<typeof createTaskSchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskSchema>;

export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'field';
    if (!details[key]) details[key] = [];
    details[key].push(issue.message);
  }
  return details;
}
