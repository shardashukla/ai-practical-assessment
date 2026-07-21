import type { DashboardSummary } from '../types';

interface SummaryCardsProps {
  summary: DashboardSummary;
}

const cards = [
  { key: 'total' as const, label: 'Total Items', icon: '📋', className: 'card-total' },
  { key: 'completed' as const, label: 'Completed', icon: '✅', className: 'card-completed' },
  { key: 'inProgress' as const, label: 'In Progress', icon: '🔄', className: 'card-in-progress' },
  { key: 'overdue' as const, label: 'Overdue', icon: '⚠️', className: 'card-overdue' },
  { key: 'highPriority' as const, label: 'High Priority', icon: '🔥', className: 'card-high-priority' },
];

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <section className="summary-cards" aria-label="Dashboard summary">
      {cards.map(({ key, label, icon, className }) => (
        <article key={key} className={`summary-card ${className}`}>
          <span className="card-icon" aria-hidden="true">{icon}</span>
          <div className="card-content">
            <p className="card-value">{summary[key]}</p>
            <p className="card-label">{label}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
