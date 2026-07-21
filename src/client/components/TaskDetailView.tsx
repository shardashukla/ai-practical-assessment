import { Link } from 'react-router-dom';
import type { ProjectTask, ActivityLog } from '../types';
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS, formatDate, isOverdue } from '../types';

interface TaskDetailViewProps {
  task: ProjectTask;
  activity: ActivityLog[];
  onStatusChange: (status: ProjectTask['status']) => void;
  statusLoading?: boolean;
}

export function TaskDetailView({ task, activity, onStatusChange, statusLoading }: TaskDetailViewProps) {
  return (
    <article className="task-detail">
      <header className="task-detail-header">
        <div>
          <h1>{task.title}</h1>
          <div className="task-detail-badges">
            <span className={`badge badge-status badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
            <span className={`badge badge-priority badge-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
            <span className="badge badge-category">{CATEGORY_LABELS[task.category]}</span>
            {isOverdue(task) && <span className="badge badge-overdue">Overdue</span>}
          </div>
        </div>
        <Link to={`/tasks/${task.id}/edit`} className="btn btn-secondary">Edit</Link>
      </header>

      <section className="task-detail-body">
        <h2>Description</h2>
        <p>{task.description || 'No description provided.'}</p>
      </section>

      <section className="task-detail-meta">
        <dl className="meta-grid">
          <div><dt>Owner</dt><dd>{task.owner?.name ?? '—'}</dd></div>
          <div><dt>Due Date</dt><dd className={isOverdue(task) ? 'text-overdue' : ''}>{formatDate(task.dueDate)}</dd></div>
          <div><dt>Created</dt><dd>{new Date(task.createdAt).toLocaleString()}</dd></div>
          <div><dt>Updated</dt><dd>{new Date(task.updatedAt).toLocaleString()}</dd></div>
        </dl>
      </section>

      <section className="task-status-actions" aria-label="Quick status actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          {/* Only show transitions to states other than the current one. */}
          {task.status !== 'in_progress' && (
            <button
              type="button"
              className="btn btn-action"
              onClick={() => onStatusChange('in_progress')}
              disabled={statusLoading}
            >
              Mark In Progress
            </button>
          )}
          {task.status !== 'completed' && (
            <button
              type="button"
              className="btn btn-success"
              onClick={() => onStatusChange('completed')}
              disabled={statusLoading}
            >
              Mark Completed
            </button>
          )}
          {task.status !== 'planned' && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onStatusChange('planned')}
              disabled={statusLoading}
            >
              Mark Planned
            </button>
          )}
        </div>
      </section>

      {activity.length > 0 && (
        <section className="activity-log" aria-label="Activity history">
          <h2>Activity History</h2>
          <ol className="activity-list">
            {activity.map((log) => (
              <li key={log.id}>
                <span className="activity-action">{log.action.replace(/_/g, ' ')}</span>
                {log.details && <span className="activity-details"> — {log.details}</span>}
                <time className="activity-time" dateTime={log.createdAt}>
                  {new Date(log.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
