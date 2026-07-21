export type UserRole = 'admin' | 'member' | 'viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export type TaskCategory = 'learning' | 'project' | 'research' | 'practice';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'planned' | 'in_progress' | 'completed';

export interface ProjectTask {
  id: number;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  ownerId: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: User;
}

export interface DashboardSummary {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  highPriority: number;
}

export interface ActivityLog {
  id: number;
  taskId: number;
  action: string;
  details: string | null;
  createdAt: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  ownerId?: number;
  search?: string;
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedTasks {
  items: ProjectTask[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status?: TaskStatus;
  ownerId: number;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  status?: TaskStatus;
  ownerId?: number;
  dueDate?: string | null;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
