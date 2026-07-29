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
  const getBadgeClass = (cat: IssueCategory) => {
    switch (cat) {
      case 'Sanitary & Public Hygiene': return 'badge-success';
      case 'Service Delivery Deficiencies': return 'badge-info';
      case 'Administrative Delays and Maladministration': return 'badge-warning';
      case 'Abuse of Power or Corruption': return 'badge-danger';
      case 'Systemic and Policy Issues': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  };

  const baseClass = `badge ${getBadgeClass(category)} ${size === 'large' ? 'badge-lg' : ''}`;

  return (
    <span className={baseClass}>
      {showIcon && <span>•</span>}
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;
