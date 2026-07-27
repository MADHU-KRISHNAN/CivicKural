import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService, { Issue, User } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import StatusBadge from '../components/StatusBadge';

export const UserDashboardPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const currentUser = await apiService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    const res = await apiService.getIssues(currentUser.id, 'citizen');
    if (res.success && res.data) {
      setIssues(res.data);
    }
    setLoading(false);
  };

  const reportedCount = issues.filter((i) => i.status === 'Reported').length;
  const inProgressCount = issues.filter((i) => i.status === 'In Progress').length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;

  return (
    <div style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
            Welcome back, {user?.name || 'Citizen'} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            Track your submitted civic complaints and municipal updates
          </p>
        </div>

        <Link to="/report" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
          <span>➕ Report New Issue</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: '4px solid #0284c7' }}>
          <span className="stat-card-number">{issues.length}</span>
          <span className="stat-card-label">Total Submissions</span>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #d97706' }}>
          <span className="stat-card-number">{inProgressCount}</span>
          <span className="stat-card-label">In Progress</span>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #16a34a' }}>
          <span className="stat-card-number">{resolvedCount}</span>
          <span className="stat-card-label">Resolved</span>
        </div>

        <div className="stat-card" style={{ borderTop: '4px solid #64748b' }}>
          <span className="stat-card-number">{reportedCount}</span>
          <span className="stat-card-label">Pending Review</span>
        </div>
      </div>

      {/* Recent Submissions Feed */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>My Submitted Grievances</h2>
          <Link to="/issues" style={{ color: '#0284c7', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
            View All →
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <span className="spinner" style={{ borderColor: 'rgba(2, 132, 199, 0.2)', borderTopColor: '#0284c7' }} />
            <p style={{ marginTop: '10px' }}>Loading your dashboard...</p>
          </div>
        ) : issues.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>No grievances reported yet</p>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>Notice a civic problem in your area? Report it to local authorities.</p>
            <Link to="/report" className="btn-primary">Report an Issue</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {issues.map((issue) => (
              <div
                key={issue.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '15px',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <CategoryBadge category={issue.category} size="small" />
                    <StatusBadge priority={issue.priority} type="priority" />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{issue.title}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>📍 {issue.location.address}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <StatusBadge status={issue.status} />
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;
