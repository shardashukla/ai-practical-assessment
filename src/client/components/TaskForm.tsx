import { useState, useEffect, FormEvent } from 'react';
import type { User, ProjectTask, TaskCategory, TaskPriority, TaskStatus } from '../types';
import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS } from '../types';

interface TaskFormProps {
  users: User[];
  initial?: ProjectTask;
  onSubmit: (data: TaskFormData) => Promise<void>;
  loading?: boolean;
  validationErrors?: Record<string, string[]> | null;
}

export interface TaskFormData {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  ownerId: number;
  dueDate: string;
}

export function TaskForm({ users, initial, onSubmit, loading, validationErrors }: TaskFormProps) {
  const [form, setForm] = useState<TaskFormData>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? 'learning',
    priority: initial?.priority ?? 'medium',
    status: initial?.status ?? 'planned',
    ownerId: initial?.ownerId ?? users[0]?.id ?? 0,
    dueDate: initial?.dueDate ?? '',
  });

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description,
        category: initial.category,
        priority: initial.priority,
        status: initial.status,
        ownerId: initial.ownerId,
        dueDate: initial.dueDate ?? '',
      });
    }
  }, [initial]);

  const fieldError = (field: string) => validationErrors?.[field]?.[0];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  const update = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="title">Title <span className="required">*</span></label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          required
          aria-invalid={!!fieldError('title')}
          aria-describedby={fieldError('title') ? 'title-error' : undefined}
        />
        {fieldError('title') && <span id="title-error" className="field-error" role="alert">{fieldError('title')}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={4}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category <span className="required">*</span></label>
          <select id="category" value={form.category} onChange={(e) => update('category', e.target.value as TaskCategory)}>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority <span className="required">*</span></label>
          <select id="priority" value={form.priority} onChange={(e) => update('priority', e.target.value as TaskPriority)}>
            {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" value={form.status} onChange={(e) => update('status', e.target.value as TaskStatus)}>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="ownerId">Owner <span className="required">*</span></label>
          <select
            id="ownerId"
            value={form.ownerId}
            onChange={(e) => update('ownerId', parseInt(e.target.value, 10))}
            aria-invalid={!!fieldError('ownerId')}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          {fieldError('ownerId') && <span className="field-error" role="alert">{fieldError('ownerId')}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="dueDate">Due Date</label>
        <input
          id="dueDate"
          type="date"
          value={form.dueDate}
          onChange={(e) => update('dueDate', e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : initial ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
