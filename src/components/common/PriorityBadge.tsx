import React from 'react';
import { PriorityLevel } from '../../types';
import { AlertCircle, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true,
}) => {
  const getIcon = () => {
    switch (priority) {
      case 'CRITICAL':
        return <ShieldAlert size={size === 'sm' ? 12 : 14} />;
      case 'HIGH':
        return <AlertTriangle size={size === 'sm' ? 12 : 14} />;
      case 'MODERATE':
        return <AlertCircle size={size === 'sm' ? 12 : 14} />;
      case 'STABLE':
        return <CheckCircle2 size={size === 'sm' ? 12 : 14} />;
      default:
        return null;
    }
  };

  return (
    <span className={`priority-badge ${priority} size-${size}`}>
      {showIcon && getIcon()}
      <span>{priority}</span>
    </span>
  );
};
