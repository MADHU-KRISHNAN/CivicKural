import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService, { Issue, User } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import StatusBadge from '../components/StatusBadge';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Proof of resolution state
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofNotes, setProofNotes] = useState('');
  const [proofSubmitting, setProofSubmitting] = useState(false);

  // Verification state
  const [verificationComments, setVerificationComments] = useState('');
  const [verificationSubmitting, setVerificationSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const user = await apiService.getCurrentUser();
      setCurrentUser(user);
      if (id) {
        await loadIssue(id);
      }
    };
    init();
  }, [id]);

  const loadIssue = async (issueId: string) => {
    setLoading(true);
    const res = await apiService.getIssueById(issueId);
    if (res.success && res.data) {
      setIssue(res.data);
    }
    setLoading(false);
  };

  const handleUpvote = async () => {
    if (!issue) return;
    const res = await apiService.upvoteIssue(issue.id);
    if (res.success && res.data) {
      setIssue(res.data);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !issue) return;

    setCommentSubmitting(true);
    const res = await apiService.addComment(issue.id, newComment.trim());
    if (res.success && res.data) {
      setIssue(res.data);
      setNewComment('');
    }
    setCommentSubmitting(false);
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || (!proofFile && !proofNotes)) return;

    setProofSubmitting(true);
    const res = await apiService.submitResolutionProof(issue.id, {
      photo: proofFile || undefined,
      notes: proofNotes
    });
    if (res.success && res.data) {
      setIssue(res.data);
      setProofFile(null);
      setProofNotes('');
    } else {
      alert(res.error || 'Failed to submit proof');
    }
    setProofSubmitting(false);
  };

  const handleVerification = async (status: 'Verified' | 'Rejected') => {
    if (!issue) return;
    setVerificationSubmitting(true);
    const res = await apiService.verifyResolution(issue.id, status, verificationComments);
    if (res.success && res.data) {
      setIssue(res.data);
    } else {
      alert(res.error || 'Verification failed');
    }
    setVerificationSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-slate-500)' }}>
        <span className="spinner spinner-dark" />
        <p style={{ marginTop: '12px' }}>Loading grievance details...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="page-wrapper-narrow text-center">
        <h2 className="section-title">Grievance Not Found</h2>
        <p className="section-subtitle mb-4">The requested issue does not exist or has been removed.</p>
        <Link to="/issues" className="btn-primary">Back to Issues</Link>
      </div>
    );
  }

  const isStaff = currentUser?.role === 'staff' || currentUser?.role === 'admin';
  const isAdminOrOwner = currentUser?.role === 'admin' || currentUser?.id === issue.citizenId;

  return (
    <div className="page-wrapper-narrow">
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem' }}
      >
        &larr; Back to Explorer
      </button>

      {/* Main Issue Card */}
      <div className="glass-card mb-4">
        <div className="d-flex justify-between align-center flex-wrap gap-2 mb-4">
          <CategoryBadge category={issue.category} size="large" />
          <div className="d-flex gap-2 align-center">
            {issue.trustScore !== undefined && (
              <span style={{ 
                background: issue.trustScore >= 0.8 ? 'var(--color-success-light)' : 'var(--color-slate-100)', 
                color: issue.trustScore >= 0.8 ? 'var(--color-success-dark)' : 'var(--color-slate-700)',
                padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid'
              }}>
                Trust Score: {(issue.trustScore * 100).toFixed(0)}%
              </span>
            )}
            {issue.multiCitizenConfirmations !== undefined && issue.multiCitizenConfirmations > 0 && (
              <span style={{ 
                background: 'var(--color-primary-light)', 
                color: 'var(--color-primary-dark)',
                padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(37,99,235,0.2)'
              }}>
                {issue.multiCitizenConfirmations} Confirmations
              </span>
            )}
            <StatusBadge priority={issue.priority} type="priority" />
            <StatusBadge status={issue.status} />
          </div>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '1rem', lineHeight: 1.2 }}>
          {issue.title}
        </h1>

        <p style={{ fontSize: '1rem', color: 'var(--color-slate-700)', lineHeight: 1.6, marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
          {issue.description}
        </p>

        {issue.photoUrl && (
          <div style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '320px', border: '1px solid var(--color-slate-200)' }}>
            <img src={issue.photoUrl} alt="Grievance Attachment" style={{ width: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Location Box */}
        <div style={{ background: 'var(--color-slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '0.25rem' }}>Geolocation Tag</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-700)', marginBottom: '0.25rem' }}>{issue.location.address || 'New Delhi, India'}</p>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-slate-500)' }}>
            Lat: {issue.location.latitude.toFixed(6)}, Lng: {issue.location.longitude.toFixed(6)}
          </span>
        </div>

        {/* Resolution Proof Section */}
        {issue.resolutionProof && (issue.status === 'Pending Verification' || issue.status === 'Resolved') && (
          <div style={{ background: 'var(--color-success-light)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-success)', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-success-dark)', marginBottom: '0.5rem' }}>Proof of Resolution</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-800)', marginBottom: '1rem' }}>{issue.resolutionProof.notes}</p>
            {issue.resolutionProof.photoUrl && (
              <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', maxHeight: '200px', border: '1px solid var(--color-success)' }}>
                <img src={issue.resolutionProof.photoUrl} alt="Resolution Proof" style={{ width: '100%', objectFit: 'cover' }} />
              </div>
            )}
            
            {/* Verification Actions for Admin/Owner */}
            {issue.status === 'Pending Verification' && isAdminOrOwner && (
               <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-success)' }}>
                  <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '0.5rem' }}>Verify Resolution</h5>
                  <input
                    type="text"
                    placeholder="Add verification comments (optional)..."
                    value={verificationComments}
                    onChange={(e) => setVerificationComments(e.target.value)}
                    className="form-input mb-2"
                  />
                  <div className="d-flex gap-2">
                    <button 
                      className="btn-primary" 
                      style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                      onClick={() => handleVerification('Verified')}
                      disabled={verificationSubmitting}
                    >
                      Approve & Resolve
                    </button>
                    <button 
                      className="btn-primary" 
                      style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                      onClick={() => handleVerification('Rejected')}
                      disabled={verificationSubmitting}
                    >
                      Reject & Reopen
                    </button>
                  </div>
               </div>
            )}
          </div>
        )}

        {/* Staff Proof Submission Form */}
        {isStaff && (issue.status === 'In Progress' || issue.status === 'Reported') && (
          <form onSubmit={handleProofSubmit} style={{ background: 'var(--color-slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-primary)', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>Submit Resolution Proof</h4>
            <div className="form-group mb-2">
              <textarea
                placeholder="Describe how the issue was resolved..."
                value={proofNotes}
                onChange={(e) => setProofNotes(e.target.value)}
                className="form-input"
                rows={3}
                required
              />
            </div>
            <div className="form-group mb-2">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)}
                className="form-input"
              />
            </div>
            <button type="submit" disabled={proofSubmitting} className="btn-primary w-full">
              {proofSubmitting ? 'Submitting...' : 'Submit Proof for Verification'}
            </button>
          </form>
        )}

        {/* Resolution Details & Upvote */}
        <div className="d-flex justify-between align-center flex-wrap gap-4" style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-slate-200)' }}>
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-slate-500)', display: 'block' }}>
              Department: <strong style={{ color: 'var(--color-primary)' }}>{issue.assignedDepartment || 'Pending'}</strong>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
              Reported on: {new Date(issue.createdAt).toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={handleUpvote}
            className="btn-primary"
          >
            <span>Support / Upvote</span>
            <span>({issue.upvotes})</span>
          </button>
        </div>

        {/* Admin Notes */}
        {issue.adminNotes && (
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--color-warning-light)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-warning-dark)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-warning-dark)', marginBottom: '0.25rem' }}>Authority Resolution Update:</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-800)' }}>{issue.adminNotes}</p>
          </div>
        )}
      </div>

      {/* Audit Timeline */}
      <div className="glass-card mb-4">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '1.25rem' }}>
          Audit Timeline
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '16px' }}>
          {/* Vertical line connecting timeline items */}
          <div style={{ position: 'absolute', left: '21px', top: '10px', bottom: '10px', width: '2px', background: 'var(--color-slate-200)', zIndex: 0 }}></div>
          
          {/* Step 1: Reported */}
          <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-primary)', border: '2px solid #fff', marginTop: '4px', flexShrink: 0, boxShadow: '0 0 0 2px var(--color-primary)' }}></div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-900)', margin: 0 }}>Issue Reported</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', margin: '2px 0 0 0' }}>{new Date(issue.createdAt).toLocaleString()}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-700)', margin: '4px 0 0 0' }}>Reported by {issue.citizenName || 'Citizen'}</p>
            </div>
          </div>

          {/* Step 2: Assigned */}
          {issue.assignedAt && (
            <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-warning-dark)', border: '2px solid #fff', marginTop: '4px', flexShrink: 0, boxShadow: '0 0 0 2px var(--color-warning-dark)' }}></div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-900)', margin: 0 }}>Assigned to Department</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', margin: '2px 0 0 0' }}>{new Date(issue.assignedAt).toLocaleString()}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-700)', margin: '4px 0 0 0' }}>Assigned to {issue.assignedDepartment}</p>
              </div>
            </div>
          )}

          {/* Step 3: Work Done (Proof Submitted) */}
          {issue.resolutionProof?.submittedAt && (
            <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-success)', border: '2px solid #fff', marginTop: '4px', flexShrink: 0, boxShadow: '0 0 0 2px var(--color-success)' }}></div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-900)', margin: 0 }}>Field Work Completed</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', margin: '2px 0 0 0' }}>{new Date(issue.resolutionProof.submittedAt).toLocaleString()}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-700)', margin: '4px 0 0 0' }}>Proof submitted by staff</p>
              </div>
            </div>
          )}

          {/* Step 4: Verified and Closed */}
          {issue.resolvedAt && (
            <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 1 }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-slate-900)', border: '2px solid #fff', marginTop: '4px', flexShrink: 0, boxShadow: '0 0 0 2px var(--color-slate-900)' }}></div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-900)', margin: 0 }}>Verified & Closed</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', margin: '2px 0 0 0' }}>{new Date(issue.resolvedAt).toLocaleString()}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-700)', margin: '4px 0 0 0' }}>Issue resolved successfully</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '1rem' }}>
          Discussion & Comments ({issue.comments?.length || 0})
        </h3>

        {/* Comments List */}
        <div className="d-flex flex-col gap-2 mb-4">
          {(!issue.comments || issue.comments.length === 0) ? (
            <p style={{ color: 'var(--color-slate-400)', fontStyle: 'italic', fontSize: '0.875rem' }}>No comments yet. Start the conversation below.</p>
          ) : (
            issue.comments.map((c) => (
              <div key={c.id} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid', backgroundColor: c.authorType === 'admin' ? 'var(--color-primary-light)' : 'var(--color-slate-50)', borderColor: c.authorType === 'admin' ? 'rgba(37,99,235,0.2)' : 'var(--color-slate-200)' }}>
                <div className="d-flex justify-between" style={{ marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: c.authorType === 'admin' ? 'var(--color-primary-hover)' : 'var(--color-slate-900)' }}>
                    {c.authorName} {c.authorType === 'admin' && '(Official)'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-700)' }}>{c.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="d-flex gap-2">
          <input
            type="text"
            placeholder="Add a comment or community update..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={commentSubmitting}
            className="form-input"
          />
          <button
            type="submit"
            disabled={commentSubmitting}
            className="btn-primary"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueDetailPage;

