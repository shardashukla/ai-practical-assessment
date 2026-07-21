import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryCards } from '../../src/client/components/SummaryCards';
import { LoadingState, EmptyState, ErrorState } from '../../src/client/components/StateMessages';

describe('SummaryCards', () => {
  const summary = { total: 8, completed: 2, inProgress: 3, overdue: 1, highPriority: 3 };

  it('renders all five summary cards with correct values', () => {
    render(<SummaryCards summary={summary} />);
    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
    const values = screen.getAllByText(/^[0-9]+$/);
    expect(values).toHaveLength(5);
    expect(values.map((el) => el.textContent)).toEqual(['8', '2', '3', '1', '3']);
  });
});

describe('StateMessages', () => {
  it('LoadingState shows spinner and message', () => {
    render(<LoadingState message="Loading tasks..." />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading tasks...');
  });

  it('EmptyState shows title and description', () => {
    render(<EmptyState title="No tasks" description="Create one to start." />);
    expect(screen.getByText('No tasks')).toBeInTheDocument();
    expect(screen.getByText('Create one to start.')).toBeInTheDocument();
  });

  it('ErrorState shows error and retry button', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Network error" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    screen.getByText('Try again').click();
    expect(onRetry).toHaveBeenCalled();
  });
});
