import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService, { User, Issue } from '../services/api';

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiService.getCurrentUser().then(u => {
      if (!u) {
        navigate('/login');
        return;
      }
      setUser(u);
      apiService.getIssues().then(res => {
        if (res.success && res.data) {
          setIssues(res.data);
        }
      });
    });
  }, [navigate]);

  let metricLabel = "Past Reports";
  let metricCount = issues.length;
  let metricDesc = "Grievances submitted by you";
  let sectionTitle = "Platform Engagement & Citizen Level";
  let trustLabel = "Trust Rating";
  let trustDesc = "Verified platform contributor";
  let trustScoreText = "98% Genuine Score";

  const role = user?.role || user?.userType || 'citizen';
  
  if (role === 'staff') {
     metricLabel = "Past Reports Cleared";
     metricCount = issues.filter(i => i.status === 'Resolved' || i.status === 'Pending Verification').length;
     metricDesc = "Grievances cleared in your ward queue";
     sectionTitle = "Field Operations History";
     trustLabel = "Service Rating";
     trustDesc = "SLA compliance metric";
     trustScoreText = "94% On-Time Resolution";
  } else if (role === 'admin' || role === 'moderator') {
     metricLabel = "Previously Verified Complaints";
     metricCount = issues.filter(i => i.status === 'Resolved').length;
     metricDesc = "Complaints successfully verified and closed";
     sectionTitle = "Command Center Analytics";
     trustLabel = "System Health";
     trustDesc = "Overall platform reliability";
     trustScoreText = "99.9% Uptime";
  }

  const handleLogout = async () => {
    await apiService.logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '30px 20px', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginBottom: '25px' }}>
        User Profile & Preferences 👤
      </h1>

      {/* User Card */}
      <div className="glass-card" style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #2563eb)', color: '#fff', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
          {user?.name ? user.name[0].toUpperCase() : 'C'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{user?.name || 'Citizen User'}</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>{user?.email}</p>
          <span style={{ display: 'inline-block', marginTop: '6px', background: '#e0f2fe', color: '#0284c7', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
            Role: {user?.userType ? user.userType.toUpperCase() : 'CITIZEN'}
          </span>
        </div>
        <button onClick={handleLogout} className="logout-btn" style={{ background: '#ef4444', borderColor: '#ef4444' }}>
          Sign Out
        </button>
      </div>

      {/* Platform Badges & Trust Level */}
      <div className="glass-card" style={{ marginBottom: '25px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '15px' }}>
          {sectionTitle}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '32px', fontWeight: '900', color: '#0284c7' }}>{metricCount}</span>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginTop: '6px' }}>{metricLabel}</h4>
            <p style={{ fontSize: '12px', color: '#64748b' }}>{metricDesc}</p>
          </div>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <span style={{ fontSize: '24px' }}>🛡️</span>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginTop: '6px' }}>{trustLabel}</h4>
            <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>{trustScoreText}</p>
            <p style={{ fontSize: '12px', color: '#64748b' }}>{trustDesc}</p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="glass-card">
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '15px' }}>
          Notification Settings
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
            <div>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>Real-time Status Updates</strong>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Receive alerts when municipal officers update your grievance</p>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#0284c7' }}
            />
          </label>

          <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
            <div>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>Email Summary Digests</strong>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Weekly reports of resolved civic issues in your zone</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#0284c7' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
