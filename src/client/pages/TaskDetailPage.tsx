import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAsyncData, useMutation } from '../hooks/useAsyncData';
import { TaskDetailView } from '../components/TaskDetailView';
import { LoadingState, ErrorState, SuccessBanner } from '../components/StateMessages';
import { useState } from 'react';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const taskId = parseInt(id ?? '', 10);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const task = useAsyncData(
    () => (isNaN(taskId) ? Promise.reject(new Error('Invalid task ID')) : api.getTask(taskId)),
    [taskId]
  );
  const activity = useAsyncData(
    () => (isNaN(taskId) ? Promise.resolve([]) : api.getTaskActivity(taskId)),
    [taskId]
  );

  const statusMutation = useMutation((status: string) =>
    api.updateTaskStatus(taskId, status as 'planned' | 'in_progress' | 'completed')
  );

  const handleStatusChange = async (status: 'planned' | 'in_progress' | 'completed') => {
    const result = await statusMutation.execute(status);
    if (result) {
      setSuccessMsg(`Task marked as ${status.replace('_', ' ')}`);
      task.reload();
      activity.reload();
    }
  };

  if (isNaN(taskId)) {
    return <ErrorState message="Invalid task ID" />;
  }

  if (task.loading) return <LoadingState message="Loading task..." />;
  if (task.error) {
    return (
      <div className="page">
        <ErrorState message={task.error} onRetry={task.reload} />
        <Link to="/tasks" className="btn btn-secondary back-link">← Back to tasks</Link>
      </div>
    );
  }

  return (
    <div className="page task-detail-page">
      <Link to="/tasks" className="back-link">← Back to tasks</Link>
      {successMsg && (
        <SuccessBanner message={successMsg} onDismiss={() => setSuccessMsg(null)} />
      )}
      {statusMutation.error && (
        <div className="error-inline" role="alert">{statusMutation.error}</div>
      )}
      {task.data && (
        <TaskDetailView
          task={task.data}
          activity={activity.data ?? []}
          onStatusChange={handleStatusChange}
          statusLoading={statusMutation.loading}
        />
      )}
    </div>
  );
}
