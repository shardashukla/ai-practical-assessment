import type { TaskStatus, TaskPriority, TaskCategory } from '../types';
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from '../types';
import type { User } from '../types';

export interface FilterState {
  search: string;
  status: TaskStatus | '';
  priority: TaskPriority | '';
  category: TaskCategory | '';
  ownerId: number | '';
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface TaskFiltersBarProps {
  filters: FilterState;
  users: User[];
  onChange: (filters: FilterState) => void;
}

export function TaskFiltersBar({ filters, users, onChange }: TaskFiltersBarProps) {
  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="filters-bar" role="search" aria-label="Filter tasks">
      <div className="filter-group search-group">
        <label htmlFor="search" className="sr-only">Search tasks</label>
        <input
          id="search"
          type="search"
          placeholder="Search by title or description..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="filter-status">Status</label>
        <select id="filter-status" value={filters.status} onChange={(e) => update('status', e.target.value as TaskStatus | '')}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-priority">Priority</label>
        <select id="filter-priority" value={filters.priority} onChange={(e) => update('priority', e.target.value as TaskPriority | '')}>
          <option value="">All priorities</option>
          {Object.entries(PRIORITY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-category">Category</label>
        <select id="filter-category" value={filters.category} onChange={(e) => update('category', e.target.value as TaskCategory | '')}>
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-owner">Owner</label>
        <select id="filter-owner" value={filters.ownerId} onChange={(e) => update('ownerId', e.target.value ? parseInt(e.target.value, 10) : '')}>
          <option value="">All owners</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-sort">Sort by</label>
        <select id="filter-sort" value={filters.sortBy} onChange={(e) => update('sortBy', e.target.value as FilterState['sortBy'])}>
          <option value="createdAt">Created</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="filter-order">Order</label>
        <select id="filter-order" value={filters.sortOrder} onChange={(e) => update('sortOrder', e.target.value as 'asc' | 'desc')}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
    </div>
  );
}
