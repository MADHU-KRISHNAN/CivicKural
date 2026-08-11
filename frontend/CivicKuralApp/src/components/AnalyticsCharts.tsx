import React from 'react';
import { Issue, IssueCategory } from '../services/api';

interface AnalyticsChartsProps {
  issues: Issue[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ issues }) => {
  // Category Breakdown Counts for the strict 5 categories
  const categoryCounts: Record<IssueCategory, number> = {
    'Sanitary & Public Hygiene': issues.filter((i) => i.category === 'Sanitary & Public Hygiene').length,
    'Service Delivery Deficiencies': issues.filter((i) => i.category === 'Service Delivery Deficiencies').length,
    'Administrative Delays and Maladministration': issues.filter((i) => i.category === 'Administrative Delays and Maladministration').length,
    'Abuse of Power or Corruption': issues.filter((i) => i.category === 'Abuse of Power or Corruption').length,
    'Systemic and Policy Issues': issues.filter((i) => i.category === 'Systemic and Policy Issues').length,
  };

  const total = issues.length || 1;

  const categoryColors: Record<IssueCategory, string> = {
    'Sanitary & Public Hygiene': '#0284c7',
    'Service Delivery Deficiencies': '#d97706',
    'Administrative Delays and Maladministration': '#9333ea',
    'Abuse of Power or Corruption': '#dc2626',
    'Systemic and Policy Issues': '#16a34a',
  };

  // Historic and projected surge trend data points (30 days)
  const surgeData = [
    { label: 'Wk 1', actual: 12, forecast: 14 },
    { label: 'Wk 2', actual: 19, forecast: 18 },
    { label: 'Wk 3', actual: 28, forecast: 25 },
    { label: 'Wk 4', actual: 35, forecast: 38 },
    { label: '+7 Days', actual: null, forecast: 48 },
    { label: '+14 Days', actual: null, forecast: 59 },
    { label: '+30 Days', actual: null, forecast: 72 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '30px' }}>
      {/* 1. Surge Forecast Line/Area Chart */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px', color: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#ffffff' }}>30-Day Surge Bottleneck Forecast</h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Predictive AI Volume Trajectory vs Capacity</span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: '700', backgroundColor: '#38bdf820', color: '#38bdf8', padding: '4px 10px', borderRadius: '12px', border: '1px solid #38bdf840' }}>
            +28% Projected Surge
          </span>
        </div>

        {/* SVG Area Chart */}
        <div style={{ height: '200px', width: '100%', position: 'relative' }}>
          <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="forecast-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="40" x2="100%" y2="40" stroke="#334155" strokeDasharray="3,3" />
            <line x1="0" y1="100" x2="100%" y2="100" stroke="#334155" strokeDasharray="3,3" />
            <line x1="0" y1="160" x2="100%" y2="160" stroke="#334155" strokeDasharray="3,3" />

            {/* Forecast Area Curve */}
            <path
              d="M 10 160 Q 60 140 120 110 T 230 70 T 340 30 L 340 180 L 10 180 Z"
              fill="url(#forecast-gradient)"
            />

            {/* Actual Area Curve */}
            <path
              d="M 10 165 Q 60 145 120 120 T 180 85 L 180 180 L 10 180 Z"
              fill="url(#area-gradient)"
            />

            {/* Forecast Stroke Line */}
            <path
              d="M 10 160 Q 60 140 120 110 T 230 70 T 340 30"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeDasharray="6,4"
            />

            {/* Actual Stroke Line */}
            <path
              d="M 10 165 Q 60 145 120 120 T 180 85"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3.5"
            />
          </svg>
        </div>

        {/* Chart Legend & X-Axis Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '12px' }}>
          {surgeData.map((d) => (
            <span key={d.label}>{d.label}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '12px', fontWeight: '600' }}>
          <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: '#38bdf8', borderRadius: '2px' }} />
            Historic Grievance Volume
          </span>
          <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: '#f59e0b', borderStyle: 'dashed' }} />
            30-Day Forecast Surges
          </span>
        </div>
      </div>

      {/* 2. Category Breakdown Donut Visual */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px', color: '#ffffff' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#ffffff' }}>Civic Category Distribution</h3>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Distribution across strict 5 civic categories</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(Object.keys(categoryCounts) as IssueCategory[]).map((cat) => {
            const count = categoryCounts[cat];
            const pct = Math.round((count / total) * 100);
            const color = categoryColors[cat];

            return (
              <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                  <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
                    {cat}
                  </span>
                  <span style={{ color: '#ffffff' }}>{count} ({pct}%)</span>
                </div>

                <div style={{ width: '100%', height: '8px', backgroundColor: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: color,
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
