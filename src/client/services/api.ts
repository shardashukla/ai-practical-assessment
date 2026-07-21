import type {
  User,
  ProjectTask,
  DashboardSummary,
  PaginatedTasks,
  ActivityLog,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from '../../shared/types';

const BASE = '/api';

/** Shared fetch wrapper — throws ApiRequestError with status and field details on failure. */
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiRequestError(body.error ?? 'Request failed', res.status, body.details);
  }
  return res.json();
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export const api = {
  getDashboardSummary(): Promise<DashboardSummary> {
    return request(`${BASE}/dashboard/summary`);
  },

  getUsers(): Promise<User[]> {
    return request(`${BASE}/users`);
  },

  getTasks(filters: TaskFilters = {}): Promise<PaginatedTasks> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.category) params.set('category', filters.category);
    if (filters.ownerId) params.set('ownerId', String(filters.ownerId));
    if (filters.search) params.set('search', filters.search);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    return request(`${BASE}/tasks${qs ? `?${qs}` : ''}`);
  },

  getTask(id: number): Promise<ProjectTask> {
    return request(`${BASE}/tasks/${id}`);
  },

  getTaskActivity(id: number): Promise<ActivityLog[]> {
    return request(`${BASE}/tasks/${id}/activity`);
  },

  createTask(data: CreateTaskInput): Promise<ProjectTask> {
    return request(`${BASE}/tasks`, { method: 'POST', body: JSON.stringify(data) });
  },

  updateTask(id: number, data: UpdateTaskInput): Promise<ProjectTask> {
    return request(`${BASE}/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  updateTaskStatus(id: number, status: ProjectTask['status']): Promise<ProjectTask> {
    return request(`${BASE}/tasks/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) });
  },
};
