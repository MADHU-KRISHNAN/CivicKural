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
  const [activeTab, setActiveTab] = useState<'nearby_feed' | 'my_grievances'>('nearby_feed');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const navigate = useNavigate();

  const [feedRadius, setFeedRadius] = useState<number | null>(null);

  useEffect(() => {
    apiService.getCurrentUser().then(u => {
      if (u) {
        setCurrentUserId(u.id);
        if (u.feedRadiusKm) {
          setFeedRadius(u.feedRadiusKm);
        }
      }
      loadIssues(u?.id);
    });
  }, [activeTab]);

  const loadIssues = async (userId?: string) => {
    setLoading(true);
    let res;
    if (activeTab === 'nearby_feed') {
      res = await apiService.getNearbyIssues();
    } else {
      res = await apiService.getIssues(userId || currentUserId || undefined, 'citizen');
    }
    
    if (res.success && res.data) {
      setIssues(res.data);
    } else {
      setIssues([]);
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
          Explorer
        </h1>
        <p className="section-subtitle">
          {activeTab === 'nearby_feed' 
            ? (feedRadius ? `Showing active complaints within ${feedRadius} km of your permanent address` : 'Showing community complaints near your location')
            : 'Track and manage your personally submitted civic issues'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('nearby_feed')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'nearby_feed' ? '2px solid #0284c7' : '2px solid transparent',
            color: activeTab === 'nearby_feed' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          📍 Nearby Community Feed
        </button>
        <button
          onClick={() => setActiveTab('my_grievances')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'my_grievances' ? '2px solid #0284c7' : '2px solid transparent',
            color: activeTab === 'my_grievances' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '16px',
            cursor: 'pointer',
            marginBottom: '-2px'
          }}
        >
          👤 My Grievances
        </button>
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
          <p className="mt-4" style={{ color: 'var(--color-slate-500)' }}>Loading your grievances...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="glass-card text-center mt-4">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No grievances found</h2>
          <p style={{ color: 'var(--color-slate-500)' }}>
            {activeTab === 'nearby_feed' 
              ? "There are no complaints matching your filters within your feed radius." 
              : "You haven't reported any issues matching these filters."}
          </p>
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

              <div className="issue-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusBadge priority={item.priority} type="priority" />
                <button 
                  onClick={(e) => handleUpvote(e, item.id)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '16px' }}>👍</span> {item.upvotes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityIssuesPage;
