import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAsyncData, useMutation } from '../hooks/useAsyncData';
import { TaskForm, type TaskFormData } from '../components/TaskForm';
import { LoadingState, ErrorState, SuccessBanner } from '../components/StateMessages';
import { SUCCESS_REDIRECT_DELAY_MS } from '../constants';
import { useState } from 'react';

export function CreateTaskPage() {
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const users = useAsyncData(() => api.getUsers(), []);

  const createMutation = useMutation((data: TaskFormData) =>
    api.createTask({
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
    const result = await createMutation.execute(data);
    if (result) {
      setSuccessMsg('Task created successfully!');
      setTimeout(() => navigate(`/tasks/${result.id}`), SUCCESS_REDIRECT_DELAY_MS);
    }
  };

  if (users.loading) return <LoadingState message="Loading form..." />;
  if (users.error) return <ErrorState message={users.error} onRetry={users.reload} />;

  return (
    <div className="page create-task-page">
      <h1>Create New Task</h1>
      {successMsg && <SuccessBanner message={successMsg} />}
      {createMutation.error && !createMutation.validationErrors && (
        <div className="error-inline" role="alert">{createMutation.error}</div>
      )}
      {users.data && (
        <TaskForm
          users={users.data}
          onSubmit={handleSubmit}
          loading={createMutation.loading}
          validationErrors={createMutation.validationErrors}
        />
      )}
    </div>
  );
}
