import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAsyncData } from '../hooks/useAsyncData';
import { SummaryCards } from '../components/SummaryCards';
import { TaskList } from '../components/TaskList';
import { LoadingState, ErrorState, EmptyState } from '../components/StateMessages';
import { DASHBOARD_RECENT_TASKS_LIMIT } from '../constants';

export function DashboardPage() {
  const summary = useAsyncData(() => api.getDashboardSummary(), []);
  const recentTasks = useAsyncData(
    () => api.getTasks({ limit: DASHBOARD_RECENT_TASKS_LIMIT, sortBy: 'createdAt', sortOrder: 'desc' }),
    []
  );

  if (summary.loading) return <LoadingState message="Loading dashboard..." />;
  if (summary.error) return <ErrorState message={summary.error} onRetry={summary.reload} />;

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <Link to="/tasks/new" className="btn btn-primary">+ New Task</Link>
      </div>

      {summary.data && <SummaryCards summary={summary.data} />}

      <section className="recent-tasks-section">
        <div className="section-header">
          <h2>Recently Updated</h2>
          <Link to="/tasks" className="link-view-all">View all tasks →</Link>
        </div>

        {recentTasks.loading && <LoadingState message="Loading recent tasks..." />}
        {recentTasks.error && <ErrorState message={recentTasks.error} onRetry={recentTasks.reload} />}
        {!recentTasks.loading && !recentTasks.error && recentTasks.data?.items.length === 0 && (
          <EmptyState
            title="No tasks yet"
            description="Create your first learning goal or project task to get started."
            action={<Link to="/tasks/new" className="btn btn-primary">Create Task</Link>}
          />
        )}
        {recentTasks.data && recentTasks.data.items.length > 0 && (
          <TaskList tasks={recentTasks.data.items} />
        )}
      </section>
    </div>
  );
}
