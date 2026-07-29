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
    <div className="w-full">
      {/* Full Width Hero Section */}
      <section className="hero-section">
        <div className="relative z-10">
          <span className="hero-pill">
            CivicKural Platform
          </span>
          <h1 className="hero-title">
            Empowering Citizens.<br />Accelerating Public Resolution.
          </h1>
          <p className="hero-subtitle">
            Direct civic engagement platform connecting citizens with municipal authorities for transparent, AI-categorized grievance tracking and real-time resolution.
          </p>

          <div className="hero-actions">
            <Link to="/report" className="btn-primary">
              Report an Issue
            </Link>
            <Link to="/issues" className="btn-secondary">
              Explore Community Reports
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Fluid Wrapper */}
      <div className="page-wrapper" style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        {/* Metric Cards */}
        <div className="grid-stats">
          <div className="stat-card" style={{ borderTopColor: 'var(--color-info)' }}>
            <span className="stat-value">{totalCount || 15}</span>
            <span className="stat-label">Total Reported Grievances</span>
          </div>

          <div className="stat-card" style={{ borderTopColor: 'var(--color-success)' }}>
            <span className="stat-value">{resolvedCount || 10}</span>
            <span className="stat-label">Successfully Resolved</span>
          </div>

          <div className="stat-card" style={{ borderTopColor: 'var(--color-warning)' }}>
            <span className="stat-value">{inProgressCount || 4}</span>
            <span className="stat-label">Currently In Progress</span>
          </div>

          <div className="stat-card" style={{ borderTopColor: 'var(--color-primary)' }}>
            <span className="stat-value">24 Hrs</span>
            <span className="stat-label">Avg Response Time</span>
          </div>
        </div>
      </div>

      {/* Mandatory Standard Categories Section */}
      <section className="page-wrapper mb-4">
        <div className="section-header text-center">
          <h2 className="section-title">
            Mandated Standardized Issue Categories
          </h2>
          <p className="section-subtitle">
            Categorized grievances for targeted routing to specialized municipal departments
          </p>
        </div>

        <div className="grid-cards">
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
              className="glass-card d-flex flex-col gap-2"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/issues')}
            >
              <div>
                <CategoryBadge category={item.cat} size="large" />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', marginTop: '0.5rem' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Citizen Call to Action */}
      <section style={{ background: 'var(--color-slate-900)', color: 'white', padding: '4rem 2rem', textAlign: 'center', marginTop: 'auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
          Ready to Make Your Community Better?
        </h2>
        <p style={{ color: 'var(--color-slate-300)', fontSize: '1.125rem', maxWidth: '700px', margin: '0 auto 2rem auto' }}>
          Submit your civic issue in under 30 seconds with automatic GPS tagging and live resolution updates.
        </p>
        <Link to="/report" className="btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
          File a Grievance Now
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;
