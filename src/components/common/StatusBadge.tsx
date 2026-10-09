import React from 'react';
import { TreatmentStatus } from '../../types';
import { Clock, Play, CheckCircle, Eye, ShieldCheck, Zap } from 'lucide-react';

interface StatusBadgeProps {
  status: TreatmentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getDetails = () => {
    const s = String(status || '').toUpperCase().replace(/\s+/g, '_');
    switch (s) {
      case 'WAITING':
      case 'WAITING_FOR_TREATMENT':
      case 'OPEN':
        return { label: 'Waiting for Treatment', icon: <Clock size={13} />, className: 'status-waiting' };
      case 'STARTING':
        return { label: 'Treatment Starting', icon: <Zap size={13} />, className: 'status-starting' };
      case 'IN_PROGRESS':
      case 'IN_TREATMENT':
        return { label: 'Treatment In Progress', icon: <Play size={13} />, className: 'status-progress' };
      case 'COMPLETED':
        return { label: 'Treatment Completed', icon: <CheckCircle size={13} />, className: 'status-completed' };
      case 'OBSERVATION':
        return { label: 'Under Observation', icon: <Eye size={13} />, className: 'status-observation' };
      case 'ROUTINE':
        return { label: 'Routine Monitoring', icon: <ShieldCheck size={13} />, className: 'status-routine' };
      default:
        return { label: status, icon: null, className: '' };
    }
  };

  const details = getDetails();

  return (
    <span className={`status-badge-pill ${details.className}`}>
      {details.icon}
      <span>{details.label}</span>
      <style>{`
        .status-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.625rem;
          border-radius: var(--radius-full);
          font-size: 0.78125rem;
          font-weight: 600;
        }
        .status-waiting {
          background-color: #f1f5f9;
          color: #475569;
          border: 1px solid #cbd5e1;
        }
        .status-starting {
          background-color: #fef3c7;
          color: #b45309;
          border: 1px solid #fde68a;
        }
        .status-progress {
          background-color: #e0f2fe;
          color: #0369a1;
          border: 1px solid #7dd3fc;
        }
        .status-completed {
          background-color: #dcfce7;
          color: #15803d;
          border: 1px solid #86efac;
        }
        .status-observation {
          background-color: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
        }
        .status-routine {
          background-color: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
      `}</style>
    </span>
  );
};
