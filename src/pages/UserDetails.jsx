import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, dataOf } from '../api/client.js';
import { ErrorMessage, Loading, PageHeader, StatusBadge } from '../components/ui.jsx';
import { formatValue } from '../utils/format.js';

const profileGroups = [
  ['Basic Details', ['name', 'gender', 'date_of_birth', 'managed_by', 'city', 'district', 'state', 'mother_tongue', 'nationality']],
  ['Physical Details', ['marital_status', 'height_cm', 'weight_kg', 'body_type', 'skin_tone', 'has_disability', 'disability_details']],
  ['Education and Career', ['education_level', 'education_field', 'occupation', 'employer', 'annual_income_min', 'annual_income_max']],
  ['Family', ['family_type', 'father_occupation', 'mother_occupation', 'brothers_count', 'sisters_count', 'family_financial_status', 'family_values']],
  ['Religious', ['sect', 'sunni_madhab', 'sub_community', 'religious_level', 'prays_regularly', 'quran_reading_level', 'halal_lifestyle', 'wears_hijab', 'wears_niqab', 'beard_style']],
];

const readField = (user, key) => {
  if (user.profile && key in user.profile) return user.profile[key];
  if (user.profile?.muslim_profile && key in user.profile.muslim_profile) return user.profile.muslim_profile[key];
  return undefined;
};

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchUser = useCallback(async () => {
    setError('');
    try {
      setUser(dataOf(await api.get(`/admin/users/${id}`)));
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const runAction = async (action) => {
    if (action === 'delete' && !window.confirm('Delete this user?')) return;
    setBusy(true);
    setError('');
    try {
      if (action === 'delete') await api.delete(`/admin/users/${id}`);
      else await api.put(`/admin/users/${id}/${action}`);
      await fetchUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page-section">
      <PageHeader
        title="User Details"
        description="Review profile information, photos, and account status."
        action={<Link className="small-button" to="/users">Back to users</Link>}
      />
      <ErrorMessage error={error} />
      {!user ? (
        <Loading />
      ) : (
        <>
          <div className="detail-header">
            <div>
              <h3>{user.profile?.name || `User ${user.id}`}</h3>
              <p>{formatValue(user.mobile_number)} · {formatValue(user.profile?.city)}</p>
            </div>
            <StatusBadge value={user.status} />
            <div className="row-actions">
              {user.status !== 'active' && <button disabled={busy} onClick={() => runAction('approve')}>Approve</button>}
              {user.status !== 'suspended' && user.status !== 'deleted' && <button disabled={busy} onClick={() => runAction('suspend')}>Suspend</button>}
              {user.status !== 'deleted' && <button disabled={busy} className="danger-button" onClick={() => runAction('delete')}>Delete</button>}
            </div>
          </div>

          <div className="detail-grid">
            <div className="details-panel">
              <h4>Account</h4>
              <dl>
                <dt>Public ID</dt><dd>{formatValue(user.public_id)}</dd>
                <dt>Community</dt><dd>{formatValue(user.community)}</dd>
                <dt>Verified</dt><dd>{formatValue(user.is_verified)}</dd>
                <dt>Last Active</dt><dd>{user.last_active_at ? new Date(user.last_active_at).toLocaleString() : '-'}</dd>
              </dl>
            </div>
            {profileGroups.map(([title, keys]) => (
              <div className="details-panel" key={title}>
                <h4>{title}</h4>
                <dl>
                  {keys.map((key) => (
                    <div key={key}>
                      <dt>{formatValue(key)}</dt>
                      <dd>{formatValue(readField(user, key))}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          <div className="photos-grid">
            {(user.profile?.photos || []).map((photo) => (
              <figure key={photo.id}>
                <img src={photo.photo_url} alt="" />
                <figcaption>
                  <StatusBadge value={photo.moderation_status} />
                  {photo.is_primary && <span className="muted">Primary</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
