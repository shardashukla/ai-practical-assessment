import { Link } from 'react-router-dom';
import type { ProjectTask } from '../types';
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS, formatDate, isOverdue } from '../types';

interface TaskListProps {
  tasks: ProjectTask[];
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <ul className="task-list" role="list">
      {tasks.map((task) => (
        <li key={task.id} className={`task-item status-${task.status} ${isOverdue(task) ? 'overdue' : ''}`}>
          <Link to={`/tasks/${task.id}`} className="task-link">
            <div className="task-header">
              <h3 className="task-title">{task.title}</h3>
              <span className={`badge badge-status badge-${task.status}`}>
                {STATUS_LABELS[task.status]}
              </span>
            </div>
            <p className="task-description">{task.description.slice(0, 120)}{task.description.length > 120 ? '…' : ''}</p>
            <div className="task-meta">
              <span className={`badge badge-priority badge-${task.priority}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
              <span className="badge badge-category">{CATEGORY_LABELS[task.category]}</span>
              <span className="meta-item">👤 {task.owner?.name ?? 'Unassigned'}</span>
              <span className={`meta-item ${isOverdue(task) ? 'text-overdue' : ''}`}>
                📅 {formatDate(task.dueDate)}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
