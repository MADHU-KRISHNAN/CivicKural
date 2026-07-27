import React, { useState, useEffect } from 'react';
import apiService, { Issue, IssueStatus, PriorityLevel } from '../../services/api';
import CategoryBadge from '../../components/CategoryBadge';
import StatusBadge from '../../components/StatusBadge';

export const AdminIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Editing state for supervisory override modal
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [editStatus, setEditStatus] = useState<IssueStatus>('Reported');
  const [editPriority, setEditPriority] = useState<PriorityLevel>('Medium');
  const [editDepartment, setEditDepartment] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editProofPhoto, setEditProofPhoto] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    setLoading(true);
    const res = await apiService.getIssues();
    if (res.success && res.data) {
      // Sort automatically by priorityScore descending
      const sorted = [...res.data].sort((a, b) => {
        const scoreA = a.priorityScore || (a.priority === 'Critical' ? 85 : a.priority === 'High' ? 65 : 40);
        const scoreB = b.priorityScore || (b.priority === 'Critical' ? 85 : b.priority === 'High' ? 65 : 40);
        return scoreB - scoreA;
      });
      setIssues(sorted);
    }
    setLoading(false);
  };

  const openEditModal = (issue: Issue) => {
    setEditingIssue(issue);
    setEditStatus(issue.status);
    setEditPriority(issue.priority);
    setEditDepartment(issue.assignedDepartment || issue.tier2 || '');
    setEditNotes(issue.adminNotes || '');
    setEditProofPhoto(issue.photoUrl || null);
    setValidationError(null);
  };

  const handleProofPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProofPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveIssue = async () => {
    if (!editingIssue) return;
    setValidationError(null);

    // Mandate resolution proof details and photo before marking as Resolved
    if (editStatus === 'Resolved') {
      if (!editNotes.trim()) {
        setValidationError('Official resolution details/remarks are mandated before resolving a ticket.');
        return;
      }
      if (!editProofPhoto) {
        setValidationError('Resolution completion proof media/photo is mandated before marking as Resolved.');
        return;
      }
    }

    setSaveLoading(true);

    const res = await apiService.updateIssueStatus(
      editingIssue.id,
      editStatus,
      editNotes,
      editDepartment,
      editPriority
    );

    if (res.success && res.data) {
      setIssues((prev) =>
        prev.map((i) => (i.id === editingIssue.id ? { ...res.data!, adminNotes: editNotes, assignedDepartment: editDepartment } : i))
      );
      setEditingIssue(null);
    } else {
      setValidationError('Failed to update issue. Please try again.');
    }
    setSaveLoading(false);
  };

  // Filtered Issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = (issue.title + ' ' + issue.description + ' ' + (issue.citizenName || '') + ' ' + (issue.tier2 || ''))
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || issue.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || issue.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div style={{ backgroundColor: '#0b1329', minHeight: '100vh', padding: '30px 24px', width: '100%', boxSizing: 'border-box', color: '#ffffff' }}>
      <div style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ backgroundColor: '#0284c7', color: '#ffffff', fontSize: '11px', fontWeight: '900', padding: '4px 10px', borderRadius: '12px', letterSpacing: '1px' }}>
            TRIAGE & DISPATCH CONSOLE
          </span>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Dynamic Priority Score Ordering</span>
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#ffffff' }}>
          Administrative Issue Triage & supervisory Override Table 🛠️
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px' }}>
          Real-time priority score sorting, 3-tier taxonomy, trust score verification, and resolution proof management
        </p>
      </div>

      {/* Filter Toolbar */}
      <div style={{ backgroundColor: '#1e293b', borderRadius: '14px', border: '1px solid #334155', padding: '18px', marginBottom: '25px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', alignItems: 'center', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0 14px' }}>
            <span style={{ marginRight: '10px', color: '#94a3b8' }}>🔍</span>
            <input
              type="text"
              placeholder="Search title, department, 3-tier taxonomy, or citizen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '12px 0', fontSize: '14px', color: '#ffffff' }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '14px', outline: 'none', fontWeight: '600' }}
          >
            <option value="All">All 5 Civic Categories</option>
            <option value="Sanitary & Public Hygiene">Sanitary & Public Hygiene</option>
            <option value="Service Delivery Deficiencies">Service Delivery Deficiencies</option>
            <option value="Administrative Delays and Maladministration">Administrative Delays and Maladministration</option>
            <option value="Abuse of Power or Corruption">Abuse of Power or Corruption</option>
            <option value="Systemic and Policy Issues">Systemic and Policy Issues</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '14px', outline: 'none', fontWeight: '600' }}
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Admin Table */}
      {loading ? (
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <span className="spinner" style={{ borderColor: 'rgba(56, 189, 248, 0.2)', borderTopColor: '#38bdf8' }} />
        </div>
      ) : (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '16px 20px' }}>Priority Score</th>
                <th style={{ padding: '16px 20px' }}>Grievance &amp; 3-Tier Taxonomy</th>
                <th style={{ padding: '16px 20px' }}>Category</th>
                <th style={{ padding: '16px 20px' }}>Trust Score</th>
                <th style={{ padding: '16px 20px' }}>Status</th>
                <th style={{ padding: '16px 20px' }}>Assigned Dept</th>
                <th style={{ padding: '16px 20px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue) => {
                const pScore = issue.priorityScore || (issue.priority === 'Critical' ? 85 : issue.priority === 'High' ? 65 : 40);
                const tScore = ((issue.trustScore || 0.95) * 100).toFixed(0);

                return (
                  <tr key={issue.id} style={{ borderBottom: '1px solid #334155', transition: 'background-color 0.2s ease' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontWeight: '900',
                          fontSize: '13px',
                          backgroundColor: pScore >= 70 ? '#450a0a' : pScore >= 40 ? '#451a03' : '#0c4a6e',
                          color: pScore >= 70 ? '#f87171' : pScore >= 40 ? '#fbbf24' : '#38bdf8',
                          border: `1px solid ${pScore >= 70 ? '#991b1b' : pScore >= 40 ? '#78350f' : '#075985'}`,
                        }}
                      >
                        {pScore} / 100
                      </div>
                      {issue.isDuplicate && (
                        <span style={{ display: 'block', fontSize: '10px', color: '#f59e0b', fontWeight: '700', marginTop: '4px' }}>
                          🔗 Duplicate (Linked)
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '16px 20px', maxWidth: '300px' }}>
                      <div style={{ fontWeight: '700', color: '#ffffff', marginBottom: '4px', lineHeight: '1.4' }}>{issue.title}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {issue.tier1 ? `${issue.tier1} → ${issue.tier2}` : `Submitted by ${issue.citizenName || 'Citizen'}`}
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <CategoryBadge category={issue.category} size="small" />
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', backgroundColor: '#0f172a', color: '#38bdf8', border: '1px solid #334155' }}>
                        🛡️ {tScore}% Trust
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <StatusBadge status={issue.status} />
                    </td>

                    <td style={{ padding: '16px 20px', fontSize: '13px', fontWeight: '600', color: '#38bdf8' }}>
                      {issue.assignedDepartment || issue.tier2 || 'Unassigned'}
                    </td>

                    <td style={{ padding: '16px 20px' }}>
                      <button
                        onClick={() => openEditModal(issue)}
                        style={{
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        ✏️ Triage &amp; Override
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Inline Supervisory Override & Proof Modal */}
      {editingIssue && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', maxWidth: '580px', width: '100%', padding: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', color: '#ffffff' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
              Supervisory Override for Ticket #{editingIssue.id}
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
              Override department routing, update priority levels, and mandate resolution proof.
            </p>

            {validationError && (
              <div style={{ backgroundColor: '#450a0a', border: '1px solid #991b1b', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                ⚠️ {validationError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>Status Transition:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as IssueStatus)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                >
                  <option value="Reported">Reported</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved (Requires Proof Upload)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>Priority Level Override:</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '14px', outline: 'none' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>Reassign Target Department:</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  placeholder="e.g. Sanitation Board or Public Works Dept"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Official Resolution Details &amp; Action Taken {editStatus === 'Resolved' && '*'}
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Provide official inspection details, work completion remarks..."
                  rows={3}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>

              {/* Resolution Completion Proof Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                  Mandated Completion Proof Photo {editStatus === 'Resolved' && '*'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofPhotoUpload}
                  style={{ display: 'block', width: '100%', color: '#94a3b8', fontSize: '13px' }}
                />
                {editProofPhoto && (
                  <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', maxHeight: '120px', border: '1px solid #334155' }}>
                    <img src={editProofPhoto} alt="Resolution Proof" style={{ width: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setEditingIssue(null)}
                style={{ padding: '12px 20px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#94a3b8', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveIssue}
                disabled={saveLoading}
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: '14px' }}
              >
                {saveLoading ? <span className="spinner" /> : 'Save Triage &amp; Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminIssuesPage;
