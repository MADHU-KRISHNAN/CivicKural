import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService, { User, IssueCategory } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import CategoryBadge from '../components/CategoryBadge';
import AudioRecorder from '../components/AudioRecorder';
import offlineStorage from '../services/offlineStorage';

const MANDATED_CATEGORIES: { name: IssueCategory; desc: string }[] = [
  { name: 'Sanitary & Public Hygiene', desc: 'Garbage dump accumulation, sewage overflow, public toilet maintenance' },
  { name: 'Service Delivery Deficiencies', desc: 'Water supply disruptions, streetlight outages, transit flaws, power issues' },
  { name: 'Administrative Delays and Maladministration', desc: 'Stalled certificate clearance, unhandled NOCs, procedural delays' },
  { name: 'Abuse of Power or Corruption', desc: 'Bribery demands, illegal extortion, misuse of official authority' },
  { name: 'Systemic and Policy Issues', desc: 'Accessibility hazards, urban planning flaws, policy oversights' },
];

export const ReportIssuePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Sanitary & Public Hygiene');
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

    if (isOffline) {
      // Offline fallback saving via IndexedDB/offlineStorage
      try {
        await offlineStorage.saveOfflineReport({
          title: title.trim(),
          description: fullDescription,
          category,
          latitude: finalLat,
          longitude: finalLng,
          address: finalAddress,
          citizenId: user.id,
          photoUrl: photoPreview || undefined,
          audioBlob: audioBlob || undefined,
        });

        setStatusNotification({
          type: 'warning',
          text: '📡 You are currently offline. Report saved locally! It will automatically upload when your internet connection is restored.',
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

    // Online submission
    try {
      const issueData = {
        title: title.trim(),
        description: fullDescription,
        category: category,
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
      // Save offline on network error
      await offlineStorage.saveOfflineReport({
        title: title.trim(),
        description: fullDescription,
        category,
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
    <div style={{ padding: '30px 20px', maxWidth: '780px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>
          File a Civic Grievance 📢
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Multimodal intake: Text, Voice Notes, Photos & Precision GPS Tagging
        </p>
      </div>

      {statusNotification && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600',
            backgroundColor:
              statusNotification.type === 'success'
                ? '#dcfce7'
                : statusNotification.type === 'warning'
                ? '#fef3c7'
                : '#fee2e2',
            color:
              statusNotification.type === 'success'
                ? '#15803d'
                : statusNotification.type === 'warning'
                ? '#b45309'
                : '#b91c1c',
            border: `1px solid ${
              statusNotification.type === 'success'
                ? '#86efac'
                : statusNotification.type === 'warning'
                ? '#fde047'
                : '#fca5a5'
            }`,
          }}
        >
          {statusNotification.text}
        </div>
      )}

      <div className="glass-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Step 1: Standardized Category Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
              1. Select Mandatory Civic Category *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {MANDATED_CATEGORIES.map((catItem) => (
                <label
                  key={catItem.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: `2px solid ${category === catItem.name ? '#0284c7' : '#e2e8f0'}`,
                    backgroundColor: category === catItem.name ? '#f0f9ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="issueCategory"
                    value={catItem.name}
                    checked={category === catItem.name}
                    onChange={() => setCategory(catItem.name)}
                    style={{ width: '18px', height: '18px', accentColor: '#0284c7' }}
                  />
                  <div style={{ flex: 1 }}>
                    <CategoryBadge category={catItem.name} size="medium" />
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{catItem.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Step 2: Grievance Title */}
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }} htmlFor="title">
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
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
            />
          </div>

          {/* Step 3: Text & Voice Explanation */}
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }} htmlFor="desc">
              3. Detailed Explanation (Text and/or Voice Note) *
            </label>
            <textarea
              id="desc"
              placeholder="Type description of the issue or record a voice note below..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              rows={3}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', marginBottom: '12px' }}
            />

            {/* Audio Voice Note Recorder */}
            <AudioRecorder onAudioRecorded={(data) => setAudioBlob(data)} />
          </div>

          {/* Step 4: Geolocation Tagging */}
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              4. Precision Browser GPS Geolocation Tag *
            </label>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#16a34a' }}>
                  📍 {location ? (location.isManual ? 'Manual Landmark Override' : 'High Accuracy GPS Tagged') : 'Location Status'}
                </span>
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={geoLoading || submitting}
                  style={{ background: '#ffffff', border: '1px solid #16a34a', color: '#16a34a', padding: '5px 14px', borderRadius: '15px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {geoLoading ? 'Acquiring GPS...' : '🔄 Re-capture Current Location'}
                </button>
              </div>

              {location && (
                <div style={{ marginTop: '6px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{location.address}</p>
                  <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                    Latitude: {location.latitude.toFixed(6)}, Longitude: {location.longitude.toFixed(6)} {location.accuracy && `(±${location.accuracy}m accuracy)`}
                  </span>
                </div>
              )}

              {geoError && (
                <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '6px' }}>⚠️ {geoError}</p>
              )}

              {/* Manual Address Fallback */}
              <div style={{ marginTop: '10px' }}>
                {!isManualMode ? (
                  <button type="button" onClick={() => setIsManualMode(true)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                    ✏️ Override with manual street address
                  </button>
                ) : (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Enter street address or landmark..."
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                    <button type="button" onClick={handleManualLocationSave} className="btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }}>Save</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 5: Image Attachment */}
          <div>
            <label style={{ display: 'block', fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              5. Photo Evidence Attachment (Optional)
            </label>

            <label htmlFor="photo-upload" style={{ display: 'block', border: '2px dashed #0284c7', padding: '20px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: '#f0f9ff' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#0284c7' }}>
                📷 {selectedPhoto ? 'Change Selected Evidence Photo' : 'Upload Evidence Photo (Drag & Drop or Pick File)'}
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
              <div style={{ marginTop: '12px', borderRadius: '10px', overflow: 'hidden', maxHeight: '220px', border: '1px solid #cbd5e1' }}>
                <img src={photoPreview} alt="Preview" style={{ width: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '17px', justifyContent: 'center', marginTop: '10px' }}
          >
            {submitting ? <span className="spinner" /> : '🚀 Register Grievance Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssuePage;
