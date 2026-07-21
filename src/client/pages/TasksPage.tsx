import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAsyncData } from '../hooks/useAsyncData';
import { TaskList } from '../components/TaskList';
import { TaskFiltersBar, type FilterState } from '../components/TaskFiltersBar';
import { LoadingState, ErrorState, EmptyState } from '../components/StateMessages';
import { SEARCH_DEBOUNCE_MS, TASKS_PAGE_SIZE } from '../constants';

const defaultFilters: FilterState = {
  search: '',
  status: '',
  priority: '',
  category: '',
  ownerId: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function TasksPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    // Debounce search to avoid firing an API request on every keystroke.
    const timer = setTimeout(() => setDebouncedSearch(filters.search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    // Reset to page 1 when filters change so users don't land on an empty page.
    setPage(1);
  }, [debouncedSearch, filters.status, filters.priority, filters.category, filters.ownerId, filters.sortBy, filters.sortOrder]);

  const fetchTasks = useCallback(
    () =>
      api.getTasks({
        search: debouncedSearch || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        category: filters.category || undefined,
        ownerId: filters.ownerId || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page,
        limit: TASKS_PAGE_SIZE,
      }),
    [debouncedSearch, filters, page]
  );

  const tasks = useAsyncData(fetchTasks, [fetchTasks]);
  const users = useAsyncData(() => api.getUsers(), []);

  return (
    <div className="page tasks-page">
      <div className="page-header">
        <h1>Tasks</h1>
        <Link to="/tasks/new" className="btn btn-primary">+ New Task</Link>
      </div>

      {users.data && <TaskFiltersBar filters={filters} users={users.data} onChange={setFilters} />}

      {tasks.loading && <LoadingState message="Loading tasks..." />}
      {tasks.error && <ErrorState message={tasks.error} onRetry={tasks.reload} />}
      {!tasks.loading && !tasks.error && tasks.data?.items.length === 0 && (
        <EmptyState
          title="No tasks found"
          description={debouncedSearch || filters.status ? 'Try adjusting your search or filters.' : 'Create a task to start tracking your learning goals.'}
          action={<Link to="/tasks/new" className="btn btn-primary">Create Task</Link>}
        />
      )}
      {tasks.data && tasks.data.items.length > 0 && (
        <>
          <p className="results-count" role="status">
            Showing {tasks.data.items.length} of {tasks.data.total} tasks
          </p>
          <TaskList tasks={tasks.data.items} />
          {tasks.data.totalPages > 1 && (
            <nav className="pagination" aria-label="Task pagination">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="page-info">Page {page} of {tasks.data.totalPages}</span>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page >= tasks.data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
