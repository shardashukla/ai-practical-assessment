import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';

process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = path.join(process.cwd(), 'database', 'test.db');

import { resetDbForTests, closeDb } from '../../src/server/db';
import app from '../../src/server/index';

beforeAll(() => {
  resetDbForTests();
});

afterAll(() => {
  closeDb();
  const testDb = process.env.DATABASE_PATH!;
  if (fs.existsSync(testDb)) fs.unlinkSync(testDb);
});

describe('Dashboard API', () => {
  it('GET /api/dashboard/summary returns correct counts', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('completed');
    expect(res.body).toHaveProperty('inProgress');
    expect(res.body).toHaveProperty('overdue');
    expect(res.body).toHaveProperty('highPriority');
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.completed + res.body.inProgress).toBeLessThanOrEqual(res.body.total);
  });
});

describe('Tasks API', () => {
  it('GET /api/tasks returns paginated list', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('GET /api/tasks filters by status', async () => {
    const res = await request(app).get('/api/tasks?status=completed');
    expect(res.status).toBe(200);
    res.body.items.forEach((task: { status: string }) => {
      expect(task.status).toBe('completed');
    });
  });

  it('GET /api/tasks searches by keyword', async () => {
    const res = await request(app).get('/api/tasks?search=React');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('POST /api/tasks creates a task with validation', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Test Task',
        description: 'A test task',
        category: 'learning',
        priority: 'medium',
        ownerId: 1,
        dueDate: '2026-08-01',
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Task');
    expect(res.body.id).toBeDefined();
  });

  it('POST /api/tasks rejects missing title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ category: 'learning', priority: 'medium', ownerId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('GET /api/tasks/:id returns task detail', async () => {
    const res = await request(app).get('/api/tasks/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.owner).toBeDefined();
  });

  it('GET /api/tasks/:id returns 404 for missing task', async () => {
    const res = await request(app).get('/api/tasks/99999');
    expect(res.status).toBe(404);
  });

  it('PATCH /api/tasks/:id updates task fields', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .send({ title: 'Update Me', category: 'project', priority: 'low', ownerId: 2 });
    const id = createRes.body.id;

    const res = await request(app)
      .patch(`/api/tasks/${id}`)
      .send({ title: 'Updated Title', priority: 'high' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
    expect(res.body.priority).toBe('high');
  });

  it('POST /api/tasks/:id/status changes status', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .send({ title: 'Status Test', category: 'practice', priority: 'medium', ownerId: 1 });
    const id = createRes.body.id;

    const res = await request(app)
      .post(`/api/tasks/${id}/status`)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in_progress');
  });

  it('GET /api/tasks/:id/activity returns activity log', async () => {
    const res = await request(app).get('/api/tasks/1/activity');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Users API', () => {
  it('GET /api/users returns seeded users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('email');
  });
});

describe('Dashboard counts update after task changes', () => {
  it('completed count increases when task is marked completed', async () => {
    const before = await request(app).get('/api/dashboard/summary');
    const completedBefore = before.body.completed;

    const createRes = await request(app)
      .post('/api/tasks')
      .send({ title: 'Complete Me', category: 'learning', priority: 'low', ownerId: 1, status: 'in_progress' });
    const id = createRes.body.id;

    await request(app).post(`/api/tasks/${id}/status`).send({ status: 'completed' });

    const after = await request(app).get('/api/dashboard/summary');
    expect(after.body.completed).toBe(completedBefore + 1);
  });
});
