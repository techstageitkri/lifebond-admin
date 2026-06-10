import { useCallback, useEffect, useState } from 'react';
import { api, dataOf } from '../api/client.js';
import {
  EmptyState,
  ErrorMessage,
  Loading,
  PageHeader,
  PromptDialog,
  StatusBadge,
} from '../components/ui.jsx';
import { formatValue } from '../utils/format.js';

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [rejectPhotoId, setRejectPhotoId] = useState(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPhotos(dataOf(await api.get('/admin/photos/pending')));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const moderate = async (photo, action) => {
    if (action === 'reject') { setRejectPhotoId(photo.id); return; }
    setBusyId(photo.id);
    setError('');
    try {
      await api.put(`/admin/photos/${photo.id}/${action}`, {});
      await fetchPhotos();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const submitRejectReason = async (reason) => {
    if (!rejectPhotoId) return;
    setBusyId(rejectPhotoId);
    setRejectPhotoId(null);
    setError('');
    try {
      await api.put(`/admin/photos/${rejectPhotoId}/reject`, { reason: reason.trim() });
      await fetchPhotos();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="page-section">
      <PageHeader
        title="Photo Moderation"
        description="Approve or reject profile photos awaiting review."
        action={
          photos.length > 0 && !loading
            ? <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>{photos.length} pending</span>
            : null
        }
      />

      <ErrorMessage error={error} />

      {loading ? (
        <Loading />
      ) : photos.length === 0 ? (
        <EmptyState
          title="Queue is clear"
          description="New uploads waiting for review will appear here."
        />
      ) : (
        <div className="moderation-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <img src={photo.photo_url} alt="" loading="lazy" />
              <div className="photo-card-body">
                <h4 style={{ fontSize: 13.5 }}>{photo.profile?.name || 'Unknown'}</h4>
                <p style={{ fontSize: 12.5, color: 'var(--text-3)' }}>
                  {formatValue(photo.profile?.city)} · {formatValue(photo.profile?.gender)}
                </p>
                <StatusBadge value={photo.moderation_status} />
                <div className="row-actions" style={{ marginTop: 4 }}>
                  <button
                    className="small-button primary-button"
                    disabled={busyId === photo.id}
                    onClick={() => moderate(photo, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    className="small-button danger-button"
                    disabled={busyId === photo.id}
                    onClick={() => moderate(photo, 'reject')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PromptDialog
        open={Boolean(rejectPhotoId)}
        title="Rejection reason"
        description="Add a short moderation note shared with the user."
        confirmLabel="Submit rejection"
        onSubmit={submitRejectReason}
        onCancel={() => setRejectPhotoId(null)}
      />
    </section>
  );
}
