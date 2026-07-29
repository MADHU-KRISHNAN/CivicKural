import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService, { User, IssueCategory } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import CategoryBadge from '../components/CategoryBadge';
import AudioRecorder from '../components/AudioRecorder';
import offlineStorage from '../services/offlineStorage';

const detectCategoryFromText = (titleText: string, descText: string): IssueCategory => {
  const combined = `${titleText} ${descText}`.toLowerCase();
  if (combined.includes('bribe') || combined.includes('extortion') || combined.includes('fraud') || combined.includes('corruption') || combined.includes('official')) {
    return 'Abuse of Power or Corruption';
  }
  if (combined.includes('water') || combined.includes('light') || combined.includes('power') || combined.includes('electricity') || combined.includes('outage') || combined.includes('bus') || combined.includes('transit')) {
    return 'Service Delivery Deficiencies';
  }
  if (combined.includes('delay') || combined.includes('pending') || combined.includes('certificate') || combined.includes('zonal') || combined.includes('noc') || combined.includes('file')) {
    return 'Administrative Delays and Maladministration';
  }
  if (combined.includes('road') || combined.includes('pothole') || combined.includes('traffic') || combined.includes('ramp') || combined.includes('accessibility') || combined.includes('intersection')) {
    return 'Systemic and Policy Issues';
  }
  return 'Sanitary & Public Hygiene';
};

export const ReportIssuePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<string | null>(null);

  const [isManualMode, setIsManualMode] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [statusNotification, setStatusNotification] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  const { location, loading: geoLoading, error: geoError, getLocation, setManualLocation } = useGeolocation();

  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    getLocation();
  }, [getLocation]);

  const loadUser = async () => {
    const currentUser = await apiService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPhoto(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualLocationSave = () => {
    if (!manualAddress.trim()) {
      alert('Please enter an address or landmark');
      return;
    }
    setManualLocation(28.6139, 77.2090, manualAddress.trim());
    setIsManualMode(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim()) {
      setStatusNotification({ type: 'error', text: 'Please enter a title for your grievance.' });
      return;
    }

    if (!description.trim() && !audioBlob) {
      setStatusNotification({ type: 'error', text: 'Please provide either a written description or a voice note explanation.' });
      return;
    }

    if (!user) {
      setStatusNotification({ type: 'error', text: 'User session not found. Please log in again.' });
      navigate('/login');
      return;
    }

    const finalLat = location ? location.latitude : 28.6139;
    const finalLng = location ? location.longitude : 77.2090;
    const finalAddress = location ? location.address : (manualAddress || 'New Delhi, India');

    setSubmitting(true);
    setStatusNotification(null);

    const isOffline = !navigator.onLine;

    const fullDescription = audioBlob
      ? `${description.trim()}\n\n[🎤 Voice Note Attached]`
      : description.trim();

    const autoCategory = detectCategoryFromText(title.trim(), description.trim());

    if (isOffline) {
      try {
        await offlineStorage.saveOfflineReport({
          title: title.trim(),
          description: fullDescription,
          category: autoCategory,
          latitude: finalLat,
          longitude: finalLng,
          address: finalAddress,
          citizenId: user.id,
          photoUrl: photoPreview || undefined,
          audioBlob: audioBlob || undefined,
        });

        setStatusNotification({
          type: 'warning',
          text: `📡 You are currently offline. Report auto-classified as "${autoCategory}" & saved locally!`,
        });

        setTimeout(() => {
          navigate('/issues');
        }, 2500);
      } catch (err) {
        setStatusNotification({ type: 'error', text: 'Failed to save report offline.' });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      const issueData = {
        title: title.trim(),
        description: fullDescription,
        category: autoCategory,
        latitude: finalLat,
        longitude: finalLng,
        address: finalAddress,
        citizenId: user.id,
        photoUrl: photoPreview || undefined,
      };

      const response = await apiService.createIssue(issueData);

      if (response.success) {
        setStatusNotification({
          type: 'success',
          text: `🎉 Grievance registered successfully! Assigned to: ${response.data?.assignedDepartment || 'Concerned Authority'}`,
        });
        setTimeout(() => {
          navigate('/issues');
        }, 1500);
      } else {
        setStatusNotification({ type: 'error', text: response.error || 'Failed to submit grievance' });
      }
    } catch (error) {
      await offlineStorage.saveOfflineReport({
        title: title.trim(),
        description: fullDescription,
        category: autoCategory,
        latitude: finalLat,
        longitude: finalLng,
        address: finalAddress,
        citizenId: user.id,
        photoUrl: photoPreview || undefined,
        audioBlob: audioBlob || undefined,
      });

      setStatusNotification({
        type: 'warning',
        text: 'Network error encountered. Report saved offline and queued for auto-sync.',
      });
      setTimeout(() => {
        navigate('/issues');
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper-narrow">
      <div className="section-header text-center">
        <h1 className="section-title">
          File a Civic Grievance
        </h1>
        <p className="section-subtitle">
          Multimodal intake: Text, Voice Notes, Photos & Precision GPS Tagging
        </p>
      </div>

      {statusNotification && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            backgroundColor:
              statusNotification.type === 'success' ? 'var(--color-success-light)' :
              statusNotification.type === 'warning' ? 'var(--color-warning-light)' : 'var(--color-danger-light)',
            color:
              statusNotification.type === 'success' ? 'var(--color-success-dark)' :
              statusNotification.type === 'warning' ? 'var(--color-warning-dark)' : 'var(--color-danger-dark)',
            border: `1px solid ${
              statusNotification.type === 'success' ? 'rgba(16,185,129,0.2)' :
              statusNotification.type === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'
            }`,
          }}
        >
          {statusNotification.text}
        </div>
      )}

      <div className="glass-card">
        <form onSubmit={handleSubmit} className="d-flex flex-col gap-4">
          
          <div className="form-group">
            <span className="badge badge-info">
              System Categorized via AI
            </span>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              2. Grievance Title *
            </label>
            <input
              id="title"
              type="text"
              placeholder="Concise summary of the civic problem..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
              className="form-input"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="desc">
              3. Detailed Explanation (Text and/or Voice Note) *
            </label>
            <textarea
              id="desc"
              placeholder="Type description of the issue or record a voice note below..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              className="form-textarea mb-4"
            />

            {/* Audio Voice Note Recorder */}
            <AudioRecorder onAudioRecorded={(data) => setAudioBlob(data)} />
          </div>

          {/* Geolocation Tagging */}
          <div className="form-group">
            <label className="form-label">
              4. Precision Browser GPS Geolocation Tag *
            </label>

            <div style={{ background: 'var(--color-slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)' }}>
              <div className="d-flex justify-between align-center mb-2">
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>
                  {location ? (location.isManual ? 'Manual Landmark Override' : 'High Accuracy GPS Tagged') : 'Location Status'}
                </span>
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={geoLoading || submitting}
                  className="btn-secondary"
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                >
                  {geoLoading ? 'Acquiring GPS...' : 'Re-capture Current Location'}
                </button>
              </div>

              {location && (
                <div className="mt-2">
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-900)' }}>{location.address}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', fontFamily: 'monospace' }}>
                    Latitude: {location.latitude.toFixed(6)}, Longitude: {location.longitude.toFixed(6)} {location.accuracy && `(±${location.accuracy}m accuracy)`}
                  </span>
                </div>
              )}

              {geoError && (
                <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{geoError}</p>
              )}

              {/* Manual Address Fallback */}
              <div className="mt-4">
                {!isManualMode ? (
                  <button type="button" onClick={() => setIsManualMode(true)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                    Override with manual street address
                  </button>
                ) : (
                  <div className="d-flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Enter street address or landmark..."
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      className="form-input"
                    />
                    <button type="button" onClick={handleManualLocationSave} className="btn-primary">Save</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Attachment */}
          <div className="form-group">
            <label className="form-label">
              5. Photo Evidence Attachment (Optional)
            </label>

            <label htmlFor="photo-upload" style={{ display: 'block', border: '1px dashed var(--color-slate-300)', padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer', background: 'var(--color-slate-50)' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>
                {selectedPhoto ? 'Change Selected Evidence Photo' : 'Upload Evidence Photo (Drag & Drop or Pick File)'}
              </span>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
                disabled={submitting}
              />
            </label>
            {photoPreview && (
              <div className="mt-4" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '300px', border: '1px solid var(--color-slate-300)' }}>
                <img src={photoPreview} alt="Preview" style={{ width: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center mt-4"
            style={{ padding: '1rem', fontSize: '1rem' }}
          >
            {submitting ? <span className="spinner" /> : 'Register Grievance Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssuePage;
