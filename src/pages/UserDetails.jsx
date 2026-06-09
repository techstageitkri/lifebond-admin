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

const additionalDetailFields = [
  { key: 'profile_code', label: 'Profile Code', type: 'input' },
  { key: 'revert_status', label: 'Revert Status', type: 'select', options: ['unknown', 'born_muslim', 'revert'] },
  { key: 'scholars', label: 'Scholars / Institutes', type: 'textarea' },
  { key: 'students_of_knowledge', label: 'Students of Knowledge', type: 'textarea' },
  { key: 'islamic_education_details', label: 'Islamic Education Details', type: 'textarea' },
  { key: 'hobbies_interests', label: 'Hobbies / Interests', type: 'textarea' },
  { key: 'family_details', label: 'Family Details', type: 'textarea' },
  { key: 'father_details', label: 'Father Details', type: 'textarea' },
  { key: 'mother_details', label: 'Mother Details', type: 'textarea' },
  { key: 'siblings_details', label: 'Siblings Details', type: 'textarea' },
  { key: 'medical_notes', label: 'Medical Notes', type: 'textarea' },
  { key: 'important_information', label: 'Important Information', type: 'textarea' },
  { key: 'preferred_age_text', label: 'Preferred Age', type: 'input' },
  { key: 'preferred_location_text', label: 'Preferred Locations', type: 'textarea' },
  { key: 'preferred_ethnicity', label: 'Preferred Ethnicity', type: 'textarea' },
  { key: 'preferred_languages', label: 'Preferred Languages', type: 'input' },
  { key: 'open_to_revert', label: 'Open to Revert', type: 'select', options: ['not_specified', 'yes', 'no', 'maybe'] },
  { key: 'open_to_divorcee_widow', label: 'Open to Divorcee / Widow', type: 'select', options: ['not_specified', 'yes', 'no', 'maybe'] },
  { key: 'accepting_polygamy', label: 'Accepting Polygamy', type: 'select', options: ['not_specified', 'yes', 'no', 'maybe', 'not_applicable'] },
  { key: 'expectations_from_spouse', label: 'Expectations from Spouse', type: 'textarea' },
  { key: 'additional_requirements', label: 'Additional Requirements', type: 'textarea' },
  { key: 'raw_source_text', label: 'Raw Source Text', type: 'textarea', wide: true },
];

const emptyAdditionalDetails = additionalDetailFields.reduce((form, field) => {
  form[field.key] = field.type === 'select' ? field.options[0] : '';
  return form;
}, {});

const formFromAdditionalDetails = (details = {}) => additionalDetailFields.reduce((form, field) => {
  const value = details?.[field.key];
  form[field.key] = Array.isArray(value)
    ? value.join(', ')
    : value || (field.type === 'select' ? field.options[0] : '');
  return form;
}, {});

const readField = (user, key) => {
  if (user.profile && key in user.profile) return user.profile[key];
  if (user.profile?.muslim_profile && key in user.profile.muslim_profile) return user.profile.muslim_profile[key];
  return undefined;
};

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [detailsForm, setDetailsForm] = useState(emptyAdditionalDetails);
  const [busy, setBusy] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [error, setError] = useState('');
  const [detailsMessage, setDetailsMessage] = useState('');

  const fetchUser = useCallback(async () => {
    setError('');
    try {
      const nextUser = dataOf(await api.get(`/admin/users/${id}`));
      setUser(nextUser);
      setDetailsForm(formFromAdditionalDetails(nextUser.profile?.additional_details));
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

  const updateDetailsField = (key, value) => {
    setDetailsForm((current) => ({ ...current, [key]: value }));
  };

  const saveAdditionalDetails = async (event) => {
    event.preventDefault();
    if (!user.profile) return;
    setSavingDetails(true);
    setError('');
    setDetailsMessage('');
    try {
      const saved = dataOf(await api.put(`/admin/users/${id}/additional-details`, detailsForm));
      setUser((current) => ({
        ...current,
        profile: {
          ...current.profile,
          additional_details: saved,
        },
      }));
      setDetailsForm(formFromAdditionalDetails(saved));
      setDetailsMessage('Imported profile details saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingDetails(false);
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

          <form className="form-panel additional-details-panel" onSubmit={saveAdditionalDetails}>
            <div className="section-heading">
              <div>
                <h4>Imported Profile Details</h4>
                <p>Long-form fields imported from the original profile text. Raw source stays admin-only.</p>
              </div>
              <button className="primary-button" disabled={savingDetails || !user.profile}>
                {savingDetails ? 'Saving...' : 'Save Details'}
              </button>
            </div>
            {detailsMessage && <div className="success-message">{detailsMessage}</div>}
            {!user.profile ? (
              <div className="empty-state">Create a profile before adding imported details.</div>
            ) : (
              <div className="additional-details-grid">
                {additionalDetailFields.map((field) => (
                  <label key={field.key} className={field.wide ? 'wide-field' : ''}>
                    {field.label}
                    {field.type === 'select' ? (
                      <select
                        value={detailsForm[field.key]}
                        onChange={(event) => updateDetailsField(field.key, event.target.value)}
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>{formatValue(option)}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={field.wide ? 10 : 4}
                        value={detailsForm[field.key]}
                        onChange={(event) => updateDetailsField(field.key, event.target.value)}
                      />
                    ) : (
                      <input
                        value={detailsForm[field.key]}
                        onChange={(event) => updateDetailsField(field.key, event.target.value)}
                      />
                    )}
                  </label>
                ))}
              </div>
            )}
          </form>

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
