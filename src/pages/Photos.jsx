import { useCallback, useEffect, useState } from 'react';
import { api, dataOf } from '../api/client.js';
import { EmptyState, ErrorMessage, Loading, PageHeader, StatusBadge } from '../components/ui.jsx';
import { formatValue } from '../utils/format.js';

export default function Photos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const moderate = async (photo, action) => {
    const payload = {};
    if (action === 'reject') {
      const reason = window.prompt('Rejection reason');
      if (reason === null) return;
      payload.reason = reason.trim();
    }
    setBusyId(photo.id);
    setError('');
    try {
      await api.put(`/admin/photos/${photo.id}/${action}`, payload);
      await fetchPhotos();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="page-section">
      <PageHeader title="Photo Moderation" description="Approve or reject profile photos waiting for review." />
      <ErrorMessage error={error} />
      {loading ? (
        <Loading />
      ) : photos.length === 0 ? (
        <EmptyState title="No pending photos" description="New uploads that need review will appear here." />
      ) : (
        <div className="moderation-grid">
          {photos.map((photo) => (
            <article className="photo-card" key={photo.id}>
              <img src={photo.photo_url} alt="" />
              <div>
                <h4>{photo.profile?.name || 'Profile photo'}</h4>
                <p>{formatValue(photo.profile?.city)} · {formatValue(photo.profile?.gender)}</p>
                <StatusBadge value={photo.moderation_status} />
              </div>
              <div className="row-actions">
                <button disabled={busyId === photo.id} onClick={() => moderate(photo, 'approve')}>Approve</button>
                <button disabled={busyId === photo.id} className="danger-button" onClick={() => moderate(photo, 'reject')}>Reject</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
