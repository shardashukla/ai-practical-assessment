import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import type { User } from '../../shared/types';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT id, name, email, role FROM users ORDER BY name').all() as Array<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>;

  const users: User[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as User['role'],
  }));

  res.json(users);
});

export default router;
