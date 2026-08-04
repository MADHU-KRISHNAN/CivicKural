import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService, { Issue, IssueCategory, IssueStatus } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import StatusBadge from '../components/StatusBadge';

export const CommunityIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'upvotes' | 'priority'>('newest');

  const navigate = useNavigate();

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    const res = await apiService.getIssues();
    if (res.success && res.data) {
      setIssues(res.data);
    }
    setLoading(false);
  };

  const handleUpvote = async (e: React.MouseEvent, issueId: string) => {
    e.stopPropagation();
    const res = await apiService.upvoteIssue(issueId);
    if (res.success && res.data) {
      setIssues(prev => prev.map(i => i.id === issueId ? res.data! : i));
    }
  };

  // Filter & Sort Logic
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = (issue.title + ' ' + issue.description + ' ' + (issue.location.address || '')).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || issue.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || issue.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes;
    }
    if (sortBy === 'priority') {
      const pMap = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const categoriesList: (IssueCategory | 'All')[] = [
    'All',
    'Sanitary & Public Hygiene',
    'Service Delivery Deficiencies',
    'Administrative Delays and Maladministration',
    'Abuse of Power or Corruption',
    'Systemic and Policy Issues',
  ];

  return (
    <div className="page-wrapper">
      {/* Header Title */}
      <div className="section-header">
        <h1 className="section-title">
          My Grievances
        </h1>
        <p className="section-subtitle">
          Track and manage your submitted civic issues
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-toolbar">
        {/* Search Input */}
        <div className="filter-search">
          <span style={{ fontSize: '0.875rem', color: 'var(--color-slate-400)' }}>Search:</span>
          <input
            type="text"
            placeholder="Search by keyword, address, or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Dropdown */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
          >
            <option value="All">All Categories</option>
            {categoriesList.filter(c => c !== 'All').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div style={{ flex: '1', minWidth: '150px' }}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-select"
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div style={{ flex: '1', minWidth: '180px' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="form-select"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="upvotes">Sort: Most Upvoted</option>
            <option value="priority">Sort: Highest Priority</option>
          </select>
        </div>
      </div>

      {/* Grid of Issues */}
      {loading ? (
        <div className="text-center mt-4">
          <span className="spinner spinner-dark" />
          <p className="mt-4" style={{ color: 'var(--color-slate-500)' }}>Loading public grievances...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="glass-card text-center mt-4">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No grievances found</h2>
          <p style={{ color: 'var(--color-slate-500)' }}>You haven't reported any issues matching these filters.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {filteredIssues.map((item) => (
            <div
              key={item.id}
              className="glass-card d-flex flex-col"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/issues/${item.id}`)}
            >
              <div className="d-flex justify-between align-center mb-4 gap-2">
                <CategoryBadge category={item.category} size="small" />
                <StatusBadge status={item.status} />
              </div>

              <h3 className="issue-card-title">
                {item.title}
              </h3>

              <p className="issue-card-desc">
                {item.description}
              </p>

              {item.location && item.location.address && (
                <p className="issue-card-meta" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📍 {item.location.address}
                </p>
              )}

              <div className="issue-card-footer">
                <StatusBadge priority={item.priority} type="priority" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityIssuesPage;
