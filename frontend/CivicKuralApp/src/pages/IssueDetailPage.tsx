import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService, { Issue } from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import StatusBadge from '../components/StatusBadge';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadIssue(id);
    }
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

      {/* Community Comments Section */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '1rem' }}>
          Discussion & Status Timeline ({issue.comments?.length || 0})
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
