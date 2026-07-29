import React from 'react';
import { IssueStatus, PriorityLevel } from '../services/api';

interface StatusBadgeProps {
  status?: IssueStatus;
  priority?: PriorityLevel;
  type?: 'status' | 'priority';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  priority,
  type = 'status',
}) => {
  if (type === 'priority' && priority) {
    const priorityConfig: Record<PriorityLevel, string> = {
      Low: 'badge-neutral',
      Medium: 'badge-info',
      High: 'badge-warning',
      Critical: 'badge-danger',
    };

    return (
      <span className={`badge ${priorityConfig[priority]}`}>
        {priority} Priority
      </span>
    );
  }

  if (status) {
    const statusConfig: Record<IssueStatus, string> = {
      Reported: 'badge-neutral',
      'In Progress': 'badge-warning',
      Resolved: 'badge-success',
      Rejected: 'badge-danger',
    };

    return (
      <span className={`badge ${statusConfig[status]}`}>
        • {status}
      </span>
    );
  }

  return null;
};

export default StatusBadge;
