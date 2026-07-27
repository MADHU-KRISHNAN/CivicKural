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
    <div style={{ padding: '30px 20px', maxWidth: '1280px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header Title */}
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
          Community Grievance Explorer 🌐
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Browse, track, and support civic issues reported across the municipality
        </p>
      </div>

      {/* Filter Toolbar Card */}
      <div className="glass-card" style={{ marginBottom: '30px', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 12px' }}>
            <span style={{ fontSize: '16px', marginRight: '8px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by keyword, address, or issue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px', color: '#0f172a' }}
            />
          </div>

          {/* Category Dropdown */}
          <div style={{ flex: '0 1 240px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '14px', outline: 'none', color: '#0f172a', fontWeight: '600' }}
            >
              <option value="All">All Categories</option>
              {categoriesList.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div style={{ flex: '0 1 180px' }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '14px', outline: 'none', color: '#0f172a', fontWeight: '600' }}
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div style={{ flex: '0 1 180px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '14px', outline: 'none', color: '#0f172a', fontWeight: '600' }}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="upvotes">Sort: Most Upvoted</option>
              <option value="priority">Sort: Highest Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Issues */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <span className="spinner" style={{ borderColor: 'rgba(2, 132, 199, 0.2)', borderTopColor: '#0284c7' }} />
          <p style={{ marginTop: '12px', fontSize: '15px' }}>Loading public grievances...</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>No grievances found</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="issues-grid">
          {filteredIssues.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
              onClick={() => navigate(`/issues/${item.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <CategoryBadge category={item.category} size="small" />
                <StatusBadge status={item.status} />
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', lineHeight: '1.3' }}>
                {item.title}
              </h3>

              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '16px', lineHeight: '1.5', flex: 1 }}>
                {item.description.length > 120 ? item.description.slice(0, 120) + '...' : item.description}
              </p>

              {item.location && item.location.address && (
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px' }}>
                  📍 {item.location.address}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={(e) => handleUpvote(e, item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    border: '1px solid #bae6fd',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  <span>👍 Upvote</span>
                  <span>({item.upvotes})</span>
                </button>

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
