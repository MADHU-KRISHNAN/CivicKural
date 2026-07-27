import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService, { Issue } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';

export const LandingPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiService.getIssues().then((res) => {
      if (res.success && res.data) {
        setIssues(res.data);
      }
    });
  }, []);

  const totalCount = issues.length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;
  const inProgressCount = issues.filter((i) => i.status === 'In Progress').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100%' }}>
      {/* Full Width Hero Section */}
      <section className="hero-banner">
        <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', background: 'rgba(255,255,255,0.15)', padding: '6px 18px', borderRadius: '20px', fontWeight: '700', marginBottom: '22px', display: 'inline-block' }}>
          🇮🇳 CivicKural Platform
        </span>
        <h1 className="hero-title">
          Empowering Citizens.<br />Accelerating Public Resolution.
        </h1>
        <p className="hero-subtitle">
          Direct civic engagement platform connecting citizens with municipal authorities for transparent, AI-categorized grievance tracking and real-time resolution.
        </p>

        <div className="hero-cta-group">
          <Link to="/report" className="btn-primary">
            <span>📢 Report an Issue</span>
          </Link>
          <Link to="/issues" className="btn-secondary">
            <span>🔍 Explore Community Reports</span>
          </Link>
        </div>
      </section>

      {/* Main Content Fluid Wrapper */}
      <div style={{ width: '100%', margin: '-40px 0 40px 0', padding: '0 45px', boxSizing: 'border-box', zIndex: 10 }}>
        {/* Metric Cards */}
        <div className="stats-grid">
          <div className="stat-card" style={{ borderTop: '4px solid #0284c7' }}>
            <div className="stat-card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              📊
            </div>
            <span className="stat-card-number">{totalCount || 15}</span>
            <span className="stat-card-label">Total Reported Grievances</span>
          </div>

          <div className="stat-card" style={{ borderTop: '4px solid #16a34a' }}>
            <div className="stat-card-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
              ✅
            </div>
            <span className="stat-card-number">{resolvedCount || 10}</span>
            <span className="stat-card-label">Successfully Resolved</span>
          </div>

          <div className="stat-card" style={{ borderTop: '4px solid #d97706' }}>
            <div className="stat-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              ⚡
            </div>
            <span className="stat-card-number">{inProgressCount || 4}</span>
            <span className="stat-card-label">Currently In Progress</span>
          </div>

          <div className="stat-card" style={{ borderTop: '4px solid #9333ea' }}>
            <div className="stat-card-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>
              ⏱️
            </div>
            <span className="stat-card-number">24 Hours</span>
            <span className="stat-card-label">Avg Response Time</span>
          </div>
        </div>
      </div>

      {/* Mandatory Standard Categories Section */}
      <section style={{ width: '100%', padding: '0 45px', marginBottom: '60px', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>
            Mandated Standardized Issue Categories
          </h2>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            Categorized grievances for targeted routing to specialized municipal departments
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            {
              cat: 'Sanitary & Public Hygiene' as const,
              desc: 'Garbage dump collection, sewage overflow, public toilet maintenance, street sweeping.',
            },
            {
              cat: 'Service Delivery Deficiencies' as const,
              desc: 'Water supply disruptions, streetlight outages, public transit issues, power fluctuations.',
            },
            {
              cat: 'Administrative Delays and Maladministration' as const,
              desc: 'Certificate issuance delays, pending NOCs, procedural stalls, unresponsive municipal desks.',
            },
            {
              cat: 'Abuse of Power or Corruption' as const,
              desc: 'Bribe demands, extortion, misuse of authority, unauthorized commercial verifications.',
            },
            {
              cat: 'Systemic and Policy Issues' as const,
              desc: 'Lack of accessibility ramps, urban planning flaws, policy loopholes, civic hazards.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '14px', cursor: 'pointer' }}
              onClick={() => navigate('/issues')}
            >
              <div>
                <CategoryBadge category={item.cat} size="large" />
              </div>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Citizen Call to Action */}
      <section style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', padding: '70px 45px', textAlign: 'center', marginTop: 'auto', width: '100%', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '34px', fontWeight: '900', marginBottom: '16px' }}>
          Ready to Make Your Community Better?
        </h2>
        <p style={{ color: '#cbd5e1', fontSize: '17px', maxWidth: '650px', margin: '0 auto 35px auto' }}>
          Submit your civic issue in under 30 seconds with automatic GPS tagging and live resolution updates.
        </p>
        <Link to="/report" className="btn-primary" style={{ fontSize: '18px', padding: '16px 42px' }}>
          <span>🚀 File a Grievance Now</span>
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;
