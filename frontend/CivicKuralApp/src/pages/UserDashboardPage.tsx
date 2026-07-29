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
    <div className="page-wrapper">
      {/* Header Banner */}
      <div className="section-header d-flex justify-between align-center flex-wrap gap-4">
        <div>
          <h1 className="section-title">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="section-subtitle">
            Track your submitted civic complaints and municipal updates
          </p>
        </div>

        <Link to="/report" className="btn-primary">
          Report New Issue
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid-stats">
        <div className="stat-card" style={{ borderTopColor: 'var(--color-primary)' }}>
          <span className="stat-value">{issues.length}</span>
          <span className="stat-label">Total Submissions</span>
        </div>

        <div className="stat-card" style={{ borderTopColor: 'var(--color-warning)' }}>
          <span className="stat-value">{inProgressCount}</span>
          <span className="stat-label">In Progress</span>
        </div>

        <div className="stat-card" style={{ borderTopColor: 'var(--color-success)' }}>
          <span className="stat-value">{resolvedCount}</span>
          <span className="stat-label">Resolved</span>
        </div>

        <div className="stat-card" style={{ borderTopColor: 'var(--color-slate-400)' }}>
          <span className="stat-value">{reportedCount}</span>
          <span className="stat-label">Pending Review</span>
        </div>
      </div>

      {/* Recent Submissions Feed */}
      <div className="glass-card mt-4">
        <div className="d-flex justify-between align-center mb-4">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>My Submitted Grievances</h2>
          <Link to="/issues" style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600 }}>
            View All &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center mt-4">
            <span className="spinner spinner-dark" />
            <p className="mt-4" style={{ color: 'var(--color-slate-500)' }}>Loading your dashboard...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center" style={{ padding: '2rem 1rem' }}>
            <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-slate-900)', marginBottom: '0.5rem' }}>No grievances reported yet</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', marginBottom: '1.5rem' }}>Notice a civic problem in your area? Report it to local authorities.</p>
            <Link to="/report" className="btn-primary">Report an Issue</Link>
          </div>
        ) : (
          <div className="d-flex flex-col gap-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="d-flex justify-between align-center flex-wrap gap-4"
                style={{ padding: '1rem', background: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', cursor: 'pointer', transition: 'background-color var(--transition-fast)' }}
                onClick={() => navigate(`/issues/${issue.id}`)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-slate-100)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-slate-50)')}
              >
                <div className="d-flex flex-col gap-2" style={{ flex: '1' }}>
                  <div className="d-flex align-center flex-wrap gap-2">
                    <CategoryBadge category={issue.category} size="small" />
                    <StatusBadge priority={issue.priority} type="priority" />
                  </div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-slate-900)' }}>{issue.title}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>{issue.location.address}</p>
                </div>

                <div className="d-flex align-center gap-4">
                  <StatusBadge status={issue.status} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
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
