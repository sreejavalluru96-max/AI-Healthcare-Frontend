import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Try adjusting your search criteria or filters.',
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="empty-state-box">
      <div className="empty-state-icon">
        {icon || <FolderOpen size={40} className="icon-muted" />}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionLabel}
        </button>
      )}

      <style>{`
        .empty-state-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3.5rem 1.5rem;
          text-align: center;
          background-color: var(--bg-surface);
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-md);
        }
        .empty-state-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .icon-muted {
          color: var(--text-muted);
        }
        .empty-state-title {
          font-size: 1.125rem;
          color: var(--text-primary);
          margin-bottom: 0.375rem;
        }
        .empty-state-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          max-width: 360px;
          margin-bottom: 1.25rem;
        }
      `}</style>
    </div>
  );
};
