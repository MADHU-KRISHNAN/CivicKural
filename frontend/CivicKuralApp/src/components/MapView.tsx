import React, { useState } from 'react';
import { Issue } from '../services/api';

interface MapViewProps {
  issues: Issue[];
  onSelectIssue?: (issue: Issue) => void;
}

export const MapView: React.FC<MapViewProps> = ({ issues, onSelectIssue }) => {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filterPriority, setFilterPriority] = useState<'All' | 'High' | 'Medium' | 'Resolved'>('All');

  // Map coordinates (centered around New Delhi default 28.6139, 77.2090)
  const baseLat = 28.6139;
  const baseLng = 77.2090;

  // Filter issues for map
  const displayIssues = issues.filter((i) => {
    const pScore = i.priorityScore || (i.priority === 'Critical' ? 85 : i.priority === 'High' ? 65 : 40);
    if (filterPriority === 'High') return pScore >= 70 && i.status !== 'Resolved';
    if (filterPriority === 'Medium') return pScore >= 40 && pScore < 70 && i.status !== 'Resolved';
    if (filterPriority === 'Resolved') return i.status === 'Resolved';
    return true;
  });

  const getMarkerColor = (issue: Issue) => {
    if (issue.status === 'Resolved') return '#16a34a'; // Green
    const score = issue.priorityScore || (issue.priority === 'Critical' ? 85 : issue.priority === 'High' ? 65 : 40);
    if (score >= 70) return '#dc2626'; // Red Critical
    if (score >= 40) return '#d97706'; // Orange Medium
    return '#0284c7'; // Blue Low
  };

  // Convert lat/lng to SVG map relative coordinates (0 - 100%)
  const getPositionStyle = (lat: number, lng: number, index: number) => {
    const latDiff = (lat - baseLat) * 800;
    const lngDiff = (lng - baseLng) * 800;
    // Distribute pins across canvas cleanly if coordinates are close
    const x = Math.min(92, Math.max(8, 50 + lngDiff + (index % 5) * 8 - 15));
    const y = Math.min(88, Math.max(12, 50 - latDiff + (index % 4) * 9 - 12));
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden', color: '#ffffff' }}>
      {/* Map Control Bar */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🗺️</span>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#ffffff' }}>Interactive Municipal Heatmap</h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Leaflet Geospatial Heat Clusters & GPS Pins</span>
          </div>
        </div>

        {/* Priority Filter Toggles */}
        <div style={{ display: 'flex', gap: '6px', background: '#1e293b', padding: '4px', borderRadius: '8px' }}>
          {(['All', 'High', 'Medium', 'Resolved'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPriority(p)}
              style={{
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                backgroundColor: filterPriority === p ? '#0284c7' : 'transparent',
                color: filterPriority === p ? '#ffffff' : '#94a3b8',
                transition: 'all 0.2s ease',
              }}
            >
              {p === 'High' ? '🔴 High Risk' : p === 'Medium' ? '🟠 Medium' : p === 'Resolved' ? '🟢 Resolved' : '🌐 All Pins'}
            </button>
          ))}
        </div>
      </div>

      {/* Map Visual Canvas */}
      <div style={{ position: 'relative', height: '420px', width: '100%', backgroundColor: '#0b1329', backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        {/* Heat Map Overlay SVG */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <radialGradient id="heat-red" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heat-orange" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid lines simulating GIS sectors */}
          <line x1="0" y1="210" x2="100%" y2="210" stroke="#1e293b" strokeDasharray="4,4" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#1e293b" strokeDasharray="4,4" />

          {/* Heat map glow rings around critical clusters */}
          {displayIssues.map((issue, idx) => {
            const pos = getPositionStyle(issue.location.latitude, issue.location.longitude, idx);
            const score = issue.priorityScore || 50;
            if (score >= 65 && issue.status !== 'Resolved') {
              return (
                <circle
                  key={`heat-${issue.id}`}
                  cx={pos.left}
                  cy={pos.top}
                  r="60"
                  fill="url(#heat-red)"
                />
              );
            }
            return null;
          })}
        </svg>

        {/* Map Legend Banner */}
        <div style={{ position: 'absolute', bottom: '14px', left: '16px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', gap: '14px', fontSize: '11px', fontWeight: '700', zIndex: 5 }}>
          <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>● Critical Alert (&gt;70)</span>
          <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>● Medium Priority</span>
          <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>● Resolved</span>
        </div>

        {/* Interactive Map Pins */}
        {displayIssues.map((issue, idx) => {
          const pos = getPositionStyle(issue.location.latitude, issue.location.longitude, idx);
          const color = getMarkerColor(issue);
          const isSelected = selectedIssue?.id === issue.id;

          return (
            <div
              key={issue.id}
              onClick={() => {
                setSelectedIssue(issue);
                if (onSelectIssue) onSelectIssue(issue);
              }}
              style={{
                position: 'absolute',
                ...pos,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: isSelected ? 20 : 10,
                transition: 'transform 0.2s ease',
              }}
            >
              {/* Pin Icon */}
              <div
                style={{
                  width: isSelected ? '34px' : '26px',
                  height: isSelected ? '34px' : '26px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: `3px solid ${isSelected ? '#ffffff' : '#0f172a'}`,
                  boxShadow: `0 0 12px ${color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isSelected ? '14px' : '11px',
                  fontWeight: '900',
                  color: '#ffffff',
                }}
              >
                {issue.status === 'Resolved' ? '✓' : issue.priorityScore || (issue.priority === 'Critical' ? '!' : '•')}
              </div>
            </div>
          );
        })}

        {/* Interactive Tooltip Popup */}
        {selectedIssue && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              maxWidth: '320px',
              width: '100%',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
              zIndex: 30,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  backgroundColor: getMarkerColor(selectedIssue),
                  color: '#ffffff',
                  textTransform: 'uppercase',
                }}
              >
                Score: {selectedIssue.priorityScore || 50}/100
              </span>
              <button
                type="button"
                onClick={() => setSelectedIssue(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', margin: '0 0 6px 0', lineHeight: '1.4' }}>
              {selectedIssue.title}
            </h4>

            <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '8px', lineHeight: '1.4' }}>
              📍 {selectedIssue.location.address || 'New Delhi Sector'}
            </p>

            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span>Dept: {selectedIssue.tier2 || selectedIssue.assignedDepartment || 'Sanitation Board'}</span>
              <span>Trust: {((selectedIssue.trustScore || 0.95) * 100).toFixed(0)}%</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSelectIssue) onSelectIssue(selectedIssue);
              }}
              style={{
                width: '100%',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Open Triage & Reassign →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
