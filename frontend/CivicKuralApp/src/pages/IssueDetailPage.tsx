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
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
        <span className="spinner" style={{ borderColor: 'rgba(2, 132, 199, 0.2)', borderTopColor: '#0284c7' }} />
        <p style={{ marginTop: '12px' }}>Loading grievance details...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h2>Grievance Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>The requested issue does not exist or has been removed.</p>
        <Link to="/issues" className="btn-primary">Back to Issues</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px 20px', maxWidth: '900px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}
      >
        ← Back to Explorer
      </button>

      {/* Main Issue Card */}
      <div className="glass-card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
          <CategoryBadge category={issue.category} size="large" />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <StatusBadge priority={issue.priority} type="priority" />
            <StatusBadge status={issue.status} />
          </div>
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginBottom: '15px', lineHeight: '1.3' }}>
          {issue.title}
        </h1>

        <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.7', marginBottom: '25px', whiteSpace: 'pre-line' }}>
          {issue.description}
        </p>

        {issue.photoUrl && (
          <div style={{ marginBottom: '25px', borderRadius: '12px', overflow: 'hidden', maxHeight: '350px' }}>
            <img src={issue.photoUrl} alt="Grievance Attachment" style={{ width: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Location Box */}
        <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>📍 Geolocation Tag</h4>
          <p style={{ fontSize: '15px', color: '#475569', marginBottom: '6px' }}>{issue.location.address || 'New Delhi, India'}</p>
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#64748b' }}>
            Lat: {issue.location.latitude.toFixed(6)}, Lng: {issue.location.longitude.toFixed(6)}
          </span>
        </div>

        {/* Resolution Details & Upvote */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', paddingTop: '18px', borderTop: '1px solid #e2e8f0' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>
              Department: <strong style={{ color: '#0284c7' }}>{issue.assignedDepartment || 'Pending'}</strong>
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              Reported on: {new Date(issue.createdAt).toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={handleUpvote}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2,132,199,0.3)',
            }}
          >
            <span>👍 Support / Upvote</span>
            <span>({issue.upvotes})</span>
          </button>
        </div>

        {/* Admin Notes */}
        {issue.adminNotes && (
          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '10px', borderLeft: '4px solid #d97706' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#92400e', marginBottom: '4px' }}>Authority Resolution Update:</h4>
            <p style={{ fontSize: '14px', color: '#78350f' }}>{issue.adminNotes}</p>
          </div>
        )}
      </div>

      {/* Community Comments Section */}
      <div className="glass-card">
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
          Discussion & Status Timeline ({issue.comments?.length || 0})
        </h3>

        {/* Comments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
          {(!issue.comments || issue.comments.length === 0) ? (
            <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '14px' }}>No comments yet. Start the conversation below.</p>
          ) : (
            issue.comments.map((c) => (
              <div key={c.id} style={{ padding: '14px 18px', borderRadius: '10px', background: c.authorType === 'admin' ? '#f0f9ff' : '#f8fafc', border: `1px solid ${c.authorType === 'admin' ? '#bae6fd' : '#e2e8f0'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: c.authorType === 'admin' ? '#0284c7' : '#0f172a' }}>
                    {c.authorName} {c.authorType === 'admin' && '🛡️ (Official)'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#334155' }}>{c.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Add a comment or community update..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={commentSubmitting}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
          />
          <button
            type="submit"
            disabled={commentSubmitting}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '14px' }}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueDetailPage;
