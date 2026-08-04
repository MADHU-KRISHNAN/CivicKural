import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService, { Issue } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export const StaffTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedTask, setSelectedTask] = useState<Issue | null>(null);
  const [proofNotes, setProofNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const res = await apiService.getIssues();
    if (res.success && res.data) {
      setTasks(res.data);
    }
    setLoading(false);
  };

  const handleOpenModal = (task: Issue) => {
    setSelectedTask(task);
    setProofNotes('');
    setProofFile(null);
    setErrorMsg('');
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    if (!proofNotes && !proofFile) {
        setErrorMsg('Please provide notes or a photo proof.');
        return;
    }

    setSubmitting(true);
    const res = await apiService.submitResolutionProof(selectedTask.id, {
      photo: proofFile || undefined,
      notes: proofNotes
    });

    if (res.success && res.data) {
      // Update task list
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? res.data! : t));
      handleCloseModal();
    } else {
      setErrorMsg(res.error || 'Failed to submit proof. Please try again.');
    }
    setSubmitting(false);
  };

  // Only show tasks that need attention or are pending verification
  const activeTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'Reported');
  const pendingTasks = tasks.filter(t => t.status === 'Pending Verification');

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-slate-900)', margin: '0 0 4px 0' }}>
          My Task Queue
        </h1>
        <p style={{ margin: 0, color: 'var(--color-slate-500)', fontSize: '14px' }}>
          Field Operations Portal
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span className="spinner spinner-dark" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-slate-700)', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '8px', margin: '8px 0 0 0' }}>
            Action Required ({activeTasks.length})
          </h2>
          
          {activeTasks.length === 0 ? (
            <p style={{ color: 'var(--color-slate-400)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
              No pending tasks in your queue.
            </p>
          ) : (
            activeTasks.map(task => (
              <div 
                key={task.id} 
                style={{ background: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid var(--color-slate-200)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <StatusBadge status={task.status} />
                  <span style={{ fontSize: '12px', color: 'var(--color-slate-400)' }}>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', color: 'var(--color-slate-900)' }}>
                  {task.title}
                </h3>
                
                <p style={{ fontSize: '14px', color: 'var(--color-slate-600)', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {task.description}
                </p>
                
                <div style={{ fontSize: '13px', color: 'var(--color-slate-500)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  📍 {task.location.address}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn-outline" 
                    style={{ flex: 1, padding: '10px', fontSize: '14px', justifyContent: 'center' }}
                    onClick={() => navigate(`/issues/${task.id}`)}
                  >
                    Details
                  </button>
                  <button 
                    className="btn-primary" 
                    style={{ flex: 2, padding: '10px', fontSize: '14px', justifyContent: 'center' }}
                    onClick={() => handleOpenModal(task)}
                  >
                    Submit Proof
                  </button>
                </div>
              </div>
            ))
          )}

          {pendingTasks.length > 0 && (
            <>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-slate-700)', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '8px', margin: '24px 0 0 0' }}>
                Pending Verification ({pendingTasks.length})
              </h2>
              {pendingTasks.map(task => (
                <div 
                  key={task.id} 
                  style={{ background: 'var(--color-slate-50)', borderRadius: '12px', padding: '12px 16px', border: '1px dashed var(--color-slate-300)', opacity: 0.8 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: 'var(--color-slate-700)' }}>
                      {task.title}
                    </h3>
                    <StatusBadge status={task.status} />
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-slate-500)' }}>
                    Awaiting Admin/Citizen review.
                  </p>
                </div>
              ))}
            </>
          )}

        </div>
      )}

      {/* Proof Submission Modal */}
      {selectedTask && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '600px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', boxSizing: 'border-box', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Submit Resolution Proof</h3>
              <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--color-slate-400)' }}>&times;</button>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--color-slate-500)', marginBottom: '16px' }}>
              Task: <strong>{selectedTask.title}</strong>
            </p>

            {errorMsg && (
              <div style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger-dark)', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitProof} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-slate-700)' }}>Completion Notes *</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  placeholder="Describe the work done to resolve this issue..."
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--color-slate-700)' }}>Photo Evidence (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="form-input"
                  onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={handleCloseModal} className="btn-outline" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 2, padding: '12px', justifyContent: 'center' }}>
                  {submitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default StaffTasksPage;
