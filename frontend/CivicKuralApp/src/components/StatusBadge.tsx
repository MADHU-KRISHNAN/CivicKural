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
    const priorityConfig: Record<PriorityLevel, { bg: string; color: string; label: string }> = {
      Low: { bg: '#e9ecef', color: '#495057', label: 'Low Priority' },
      Medium: { bg: '#e3f2fd', color: '#1976d2', label: 'Medium Priority' },
      High: { bg: '#fff3e0', color: '#e65100', label: 'High Priority' },
      Critical: { bg: '#ffebee', color: '#c62828', label: '🚨 Critical Priority' },
    };

    const conf = priorityConfig[priority];
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '700',
          backgroundColor: conf.bg,
          color: conf.color,
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
        }}
      >
        {conf.label}
      </span>
    );
  }

  if (status) {
    const statusConfig: Record<IssueStatus, { bg: string; color: string; icon: string }> = {
      Reported: { bg: '#3498db', color: '#ffffff', icon: '📥' },
      'In Progress': { bg: '#f39c12', color: '#ffffff', icon: '⏳' },
      Resolved: { bg: '#27ae60', color: '#ffffff', icon: '✅' },
      Rejected: { bg: '#e74c3c', color: '#ffffff', icon: '❌' },
    };

    const conf = statusConfig[status];
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 12px',
          borderRadius: '15px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: conf.bg,
          color: conf.color,
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{conf.icon}</span>
        <span>{status}</span>
      </span>
    );
  }

  return null;
};

export default StatusBadge;
