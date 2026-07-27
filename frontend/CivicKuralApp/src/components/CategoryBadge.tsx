import React from 'react';
import { IssueCategory } from '../services/api';

interface CategoryBadgeProps {
  category: IssueCategory;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  showIcon = true,
  size = 'medium',
}) => {
  const getCategoryConfig = (cat: IssueCategory) => {
    switch (cat) {
      case 'Sanitary & Public Hygiene':
        return {
          icon: '🧹',
          bg: '#e6f4ea',
          color: '#137333',
          border: '#ceead6',
        };
      case 'Service Delivery Deficiencies':
        return {
          icon: '⚙️',
          bg: '#e8f0fe',
          color: '#1a73e8',
          border: '#d2e3fc',
        };
      case 'Administrative Delays and Maladministration':
        return {
          icon: '⏳',
          bg: '#fef7e0',
          color: '#b06000',
          border: '#feefc3',
        };
      case 'Abuse of Power or Corruption':
        return {
          icon: '⚖️',
          bg: '#fce8e6',
          color: '#c5221f',
          border: '#fad2cf',
        };
      case 'Systemic and Policy Issues':
        return {
          icon: '📜',
          bg: '#f3e8fd',
          color: '#7b1fa2',
          border: '#e9d2fd',
        };
      default:
        return {
          icon: '⚠️',
          bg: '#f1f3f4',
          color: '#5f6368',
          border: '#e0e0e0',
        };
    }
  };

  const config = getCategoryConfig(category);

  const sizeStyles: Record<string, React.CSSProperties> = {
    small: { fontSize: '11px', padding: '2px 8px' },
    medium: { fontSize: '12px', padding: '4px 12px' },
    large: { fontSize: '14px', padding: '6px 16px' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '16px',
        fontWeight: '600',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
        ...sizeStyles[size],
      }}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;
