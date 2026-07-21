import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAsyncData, useMutation } from '../hooks/useAsyncData';
import { TaskForm, type TaskFormData } from '../components/TaskForm';
import { LoadingState, ErrorState, SuccessBanner } from '../components/StateMessages';
import { SUCCESS_REDIRECT_DELAY_MS } from '../constants';
import { useState } from 'react';

export function EditTaskPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const taskId = parseInt(id ?? '', 10);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const task = useAsyncData(
    () => (isNaN(taskId) ? Promise.reject(new Error('Invalid task ID')) : api.getTask(taskId)),
    [taskId]
  );
  const users = useAsyncData(() => api.getUsers(), []);

  const updateMutation = useMutation((data: TaskFormData) =>
    api.updateTask(taskId, {
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: data.status,
      ownerId: data.ownerId,
      dueDate: data.dueDate || null,
    })
  );

  const handleSubmit = async (data: TaskFormData) => {
    const result = await updateMutation.execute(data);
    if (result) {
      setSuccessMsg('Task updated successfully!');
      setTimeout(() => navigate(`/tasks/${result.id}`), SUCCESS_REDIRECT_DELAY_MS);
    }
  };

  if (isNaN(taskId)) return <ErrorState message="Invalid task ID" />;
  if (task.loading || users.loading) return <LoadingState message="Loading task..." />;
  if (task.error) return <ErrorState message={task.error} onRetry={task.reload} />;
  if (users.error) return <ErrorState message={users.error} onRetry={users.reload} />;

  return (
    <div className="page edit-task-page">
      <Link to={`/tasks/${taskId}`} className="back-link">← Back to task</Link>
      <h1>Edit Task</h1>
      {successMsg && <SuccessBanner message={successMsg} />}
      {updateMutation.error && !updateMutation.validationErrors && (
        <div className="error-inline" role="alert">{updateMutation.error}</div>
      )}
      {task.data && users.data && (
        <TaskForm
          users={users.data}
          initial={task.data}
          onSubmit={handleSubmit}
          loading={updateMutation.loading}
          validationErrors={updateMutation.validationErrors}
        />
      )}
    </div>
  );
}
