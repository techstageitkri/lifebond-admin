import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, dataOf } from '../api/client.js';
import {
  ConfirmDialog,
  ErrorMessage,
  Loading,
  PageHeader,
  StatusBadge,
  SuccessMessage,
} from '../components/ui.jsx';
import { formatValue } from '../utils/format.js';

// ─── Profile group field definitions ────────────────────────────────────────
// type: 'text' | 'number' | 'date' | 'select' | 'boolean'
const profileGroups = [
  {
    title: 'Basic Details',
    fields: [
      { key: 'name',           label: 'Name',           type: 'text' },
      { key: 'gender',         label: 'Gender',         type: 'select', options: ['male','female'] },
      { key: 'date_of_birth',  label: 'Date of Birth',  type: 'date' },
      { key: 'managed_by',     label: 'Managed By',     type: 'select', options: ['self','parent','sibling'] },
      { key: 'city',           label: 'City',           type: 'text' },
      { key: 'district',       label: 'District',       type: 'text' },
      { key: 'state',          label: 'State',          type: 'text' },
      { key: 'mother_tongue',  label: 'Mother Tongue',  type: 'text' },
      { key: 'nationality',    label: 'Nationality',    type: 'text' },
    ],
  },
  {
    title: 'Physical Details',
    fields: [
      { key: 'marital_status',     label: 'Marital Status',     type: 'select', options: ['never_married','divorced','widowed'] },
      { key: 'height_cm',          label: 'Height (cm)',        type: 'number' },
      { key: 'weight_kg',          label: 'Weight (kg)',        type: 'number' },
      { key: 'body_type',          label: 'Body Type',          type: 'select', options: ['slim','average','athletic','heavy'] },
      { key: 'skin_tone',          label: 'Skin Tone',          type: 'select', options: ['very_fair','fair','wheatish','dark_wheatish','dark'] },
      { key: 'has_disability',     label: 'Has Disability',     type: 'boolean' },
      { key: 'disability_details', label: 'Disability Details', type: 'text' },
    ],
  },
  {
    title: 'Education & Career',
    fields: [
      { key: 'education_level',    label: 'Education Level',    type: 'select', options: ['below_10th','10th','12th','diploma','graduate','post_graduate','doctorate'] },
      { key: 'education_field',    label: 'Education Field',    type: 'text' },
      { key: 'occupation',         label: 'Occupation',         type: 'text' },
      { key: 'employer',           label: 'Employer',           type: 'text' },
      { key: 'annual_income_min',  label: 'Annual Income Min',  type: 'number' },
      { key: 'annual_income_max',  label: 'Annual Income Max',  type: 'number' },
    ],
  },
  {
    title: 'Family',
    fields: [
      { key: 'family_type',             label: 'Family Type',             type: 'select', options: ['nuclear','joint'] },
      { key: 'father_occupation',       label: 'Father Occupation',       type: 'text' },
      { key: 'mother_occupation',       label: 'Mother Occupation',       type: 'text' },
      { key: 'brothers_count',          label: 'Brothers Count',          type: 'number' },
      { key: 'sisters_count',           label: 'Sisters Count',           type: 'number' },
      { key: 'family_financial_status', label: 'Family Financial Status', type: 'select', options: ['lower_middle','middle_class','upper_middle','wealthy'] },
      { key: 'family_values',           label: 'Family Values',           type: 'select', options: ['traditional','moderate','modern'] },
    ],
  },
  {
    title: 'Religious',
    fields: [
      { key: 'sect',               label: 'Sect',               type: 'select', options: ['sunni','shia','sufi','other'] },
      { key: 'sunni_madhab',       label: 'Sunni Madhab',       type: 'select', options: ['shafi','hanafi','maliki','hanbali','other'] },
      { key: 'sub_community',      label: 'Sub Community',      type: 'select', options: ['rowther','labbai','marakkar','deccan','mapilla','other'] },
      { key: 'religious_level',    label: 'Religious Level',    type: 'select', options: ['very_practicing','practicing','moderate','learning'] },
      { key: 'prays_regularly',    label: 'Prays Regularly',    type: 'select', options: ['5_times','sometimes','rarely'] },
      { key: 'quran_reading_level',label: 'Quran Reading Level',type: 'select', options: ['fluent','basic','learning','cannot_read'] },
      { key: 'halal_lifestyle',    label: 'Halal Lifestyle',    type: 'select', options: ['strict','moderate','flexible'] },
      { key: 'wears_hijab',        label: 'Wears Hijab',        type: 'select', options: ['yes','no','sometimes'] },
      { key: 'wears_niqab',        label: 'Wears Niqab',        type: 'select', options: ['yes','no','sometimes'] },
      { key: 'beard_style',        label: 'Beard Style',        type: 'select', options: ['full','trimmed','clean_shaven'] },
    ],
  },
];

// ─── Additional detail fields ────────────────────────────────────────────────
const additionalDetailFields = [
  { key: 'profile_code',             label: 'Profile Code',             type: 'input' },
  { key: 'revert_status',            label: 'Revert Status',            type: 'select', options: ['unknown','born_muslim','revert'] },
  { key: 'scholars',                 label: 'Scholars / Institutes',    type: 'textarea' },
  { key: 'students_of_knowledge',    label: 'Students of Knowledge',    type: 'textarea' },
  { key: 'islamic_education_details',label: 'Islamic Education Details',type: 'textarea' },
  { key: 'hobbies_interests',        label: 'Hobbies / Interests',      type: 'textarea' },
  { key: 'family_details',           label: 'Family Details',           type: 'textarea' },
  { key: 'father_details',           label: 'Father Details',           type: 'textarea' },
  { key: 'mother_details',           label: 'Mother Details',           type: 'textarea' },
  { key: 'siblings_details',         label: 'Siblings Details',         type: 'textarea' },
  { key: 'medical_notes',            label: 'Medical Notes',            type: 'textarea' },
  { key: 'important_information',    label: 'Important Information',    type: 'textarea' },
  { key: 'preferred_age_text',       label: 'Preferred Age',            type: 'input' },
  { key: 'preferred_location_text',  label: 'Preferred Locations',      type: 'textarea' },
  { key: 'preferred_ethnicity',      label: 'Preferred Ethnicity',      type: 'textarea' },
  { key: 'preferred_languages',      label: 'Preferred Languages',      type: 'input' },
  { key: 'open_to_revert',           label: 'Open to Revert',           type: 'select', options: ['not_specified','yes','no','maybe'] },
  { key: 'open_to_divorcee_widow',   label: 'Open to Divorcee / Widow', type: 'select', options: ['not_specified','yes','no','maybe'] },
  { key: 'accepting_polygamy',       label: 'Accepting Polygamy',       type: 'select', options: ['not_specified','yes','no','maybe','not_applicable'] },
  { key: 'expectations_from_spouse', label: 'Expectations from Spouse', type: 'textarea' },
  { key: 'additional_requirements',  label: 'Additional Requirements',  type: 'textarea' },
  { key: 'raw_source_text',          label: 'Raw Source Text',          type: 'textarea', wide: true },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const readProfileField = (user, key) => {
  if (user.profile && key in user.profile) return user.profile[key];
  if (user.profile?.muslim_profile && key in user.profile.muslim_profile) return user.profile.muslim_profile[key];
  return '';
};

const buildProfileForm = (user) => {
  const form = {};
  for (const { fields } of profileGroups) {
    for (const field of fields) {
      const val = readProfileField(user, field.key);
      form[field.key] = val === null || val === undefined ? '' : String(val);
    }
  }
  return form;
};

const buildAdditionalForm = (details = {}) =>
  additionalDetailFields.reduce((form, field) => {
    const value = details?.[field.key];
    form[field.key] = Array.isArray(value)
      ? value.join(', ')
      : value || (field.type === 'select' ? field.options[0] : '');
    return form;
  }, {});

// ─── Sub-components ───────────────────────────────────────────────────────────
function ReadValue({ value }) {
  const display = formatValue(value);
  return (
    <span style={{ fontSize: 13.5, fontWeight: 500, color: display === '-' ? 'var(--text-3)' : 'var(--text)', wordBreak: 'break-word' }}>
      {display === '-' ? '—' : display}
    </span>
  );
}

function EditField({ field, value, onChange }) {
  if (field.type === 'boolean') {
    return (
      <label className="checkbox-row" style={{ fontWeight: 400 }}>
        <input
          type="checkbox"
          checked={value === 'true' || value === true}
          onChange={(e) => onChange(field.key, String(e.target.checked))}
        />
        Yes
      </label>
    );
  }
  if (field.type === 'select') {
    return (
      <select value={value || ''} onChange={(e) => onChange(field.key, e.target.value)}>
        <option value="">— select —</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>{formatValue(opt)}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
      value={value || ''}
      onChange={(e) => onChange(field.key, e.target.value)}
    />
  );
}

function ProfileGroupPanel({ group, isEditing, profileForm, onFieldChange }) {
  return (
    <div className="details-panel card">
      <h4>{group.title}</h4>
      {isEditing ? (
        <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
          {group.fields.map((field) => (
            <label key={field.key} style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
              {field.label}
              <EditField field={field} value={profileForm[field.key]} onChange={onFieldChange} />
            </label>
          ))}
        </div>
      ) : (
        <dl>
          {group.fields.map((field) => (
            <div key={field.key}>
              <dt>{field.label}</dt>
              <dd><ReadValue value={profileForm[field.key]} /></dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser]                     = useState(null);
  const [profileForm, setProfileForm]       = useState({});
  const [savedProfileForm, setSavedProfileForm] = useState({});
  const [additionalForm, setAdditionalForm] = useState({});
  const [savedAdditionalForm, setSavedAdditionalForm] = useState({});
  const [isEditing, setIsEditing]           = useState(false);
  const [busy, setBusy]                     = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError]                   = useState('');
  const [successMsg, setSuccessMsg]         = useState('');

  const fetchUser = useCallback(async () => {
    setError('');
    try {
      const next = dataOf(await api.get(`/admin/users/${id}`));
      setUser(next);
      const pf = buildProfileForm(next);
      const af = buildAdditionalForm(next.profile?.additional_details);
      setProfileForm(pf);
      setSavedProfileForm(pf);
      setAdditionalForm(af);
      setSavedAdditionalForm(af);
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const enterEdit = () => {
    setSuccessMsg('');
    setError('');
    setSavedProfileForm(profileForm);
    setSavedAdditionalForm(additionalForm);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setProfileForm(savedProfileForm);
    setAdditionalForm(savedAdditionalForm);
    setIsEditing(false);
    setError('');
  };

  const onProfileFieldChange = (key, value) =>
    setProfileForm((cur) => ({ ...cur, [key]: value }));

  const onAdditionalFieldChange = (key, value) =>
    setAdditionalForm((cur) => ({ ...cur, [key]: value }));

  const saveAll = async () => {
    if (!user.profile) return;
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      // Save profile group fields
      await api.put(`/admin/users/${id}/profile`, profileForm);
      // Save additional details fields
      await api.put(`/admin/users/${id}/additional-details`, additionalForm);
      await fetchUser();
      setSuccessMsg('Profile saved successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (action) => {
    if (action === 'delete') { setDeleteConfirmOpen(true); return; }
    setBusy(true);
    setError('');
    try {
      await api.put(`/admin/users/${id}/${action}`);
      await fetchUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    setError('');
    setDeleteConfirmOpen(false);
    try {
      await api.delete(`/admin/users/${id}`);
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
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Link className="ghost-button small-button" to="/users">← Back</Link>
            {user && (
              isEditing ? (
                <>
                  <button type="button" className="ghost-button small-button" onClick={cancelEdit}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="primary-button small-button"
                    disabled={saving || !user.profile}
                    onClick={saveAll}
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </>
              ) : (
                <button type="button" className="primary-button small-button" onClick={enterEdit}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </button>
              )
            )}
          </div>
        }
      />

      {/* Edit mode banner */}
      {isEditing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--sp-3)',
          padding: '10px var(--sp-4)', background: '#eff6ff',
          border: '1px solid #bfdbfe', borderRadius: 'var(--r-md)',
          fontSize: 13, fontWeight: 600, color: '#1d4ed8',
        }}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" style={{ flexShrink: 0 }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Edit mode — all profile fields are now editable. Click "Save changes" when done.
        </div>
      )}

      <ErrorMessage error={error} />
      {successMsg && !isEditing && <SuccessMessage message={successMsg} />}

      {!user ? (
        <Loading />
      ) : (
        <>
          {/* ── Identity header (always read-only) ── */}
          <div className="detail-header">
            <div>
              <p className="eyebrow">Profile · {user.public_id || `ID ${user.id}`}</p>
              <p className="detail-header-name">{user.profile?.name || `User ${user.id}`}</p>
              <p className="detail-header-sub">
                {formatValue(user.mobile_number)} · {formatValue(user.profile?.city)}
              </p>
            </div>
            <StatusBadge value={user.status} />
            <div className="row-actions">
              {user.status !== 'active' && (
                <button className="small-button" disabled={busy} onClick={() => runAction('approve')}>Approve</button>
              )}
              {user.status !== 'suspended' && user.status !== 'deleted' && (
                <button className="small-button ghost-button" disabled={busy} onClick={() => runAction('suspend')}>Suspend</button>
              )}
              {user.status !== 'deleted' && (
                <button className="small-button danger-button" disabled={busy} onClick={() => runAction('delete')}>Delete</button>
              )}
            </div>
          </div>

          {/* ── Account panel (always read-only) ── */}
          <div className="detail-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="details-panel card">
              <h4>Account <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', marginLeft: 6 }}>— read only</span></h4>
              <dl>
                <div><dt>Public ID</dt><dd>{formatValue(user.public_id)}</dd></div>
                <div><dt>Mobile Number</dt><dd>{formatValue(user.mobile_number)}</dd></div>
                <div><dt>Community</dt><dd>{formatValue(user.community)}</dd></div>
                <div><dt>Verified</dt><dd>{formatValue(user.is_verified)}</dd></div>
                <div><dt>Status</dt><dd><StatusBadge value={user.status} /></dd></div>
                <div>
                  <dt>Last Active</dt>
                  <dd>{user.last_active_at ? new Date(user.last_active_at).toLocaleString() : '-'}</dd>
                </div>
                <div>
                  <dt>Joined</dt>
                  <dd>{new Date(user.created_at).toLocaleDateString()}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* ── Editable profile group panels ── */}
          <div className="detail-grid">
            {profileGroups.map((group) => (
              <ProfileGroupPanel
                key={group.title}
                group={group}
                isEditing={isEditing}
                profileForm={profileForm}
                onFieldChange={onProfileFieldChange}
              />
            ))}
          </div>

          {/* ── Imported Profile Details ── */}
          <div className="form-panel" style={{ display: 'grid', gap: 'var(--sp-4)' }}>
            <div className="section-heading" style={{ marginBottom: 0 }}>
              <div>
                <h4>Imported Profile Details</h4>
                <p>Long-form fields imported from original profile text. Raw source is admin-only.</p>
              </div>
            </div>

            {!user.profile ? (
              <p className="muted">No profile created yet.</p>
            ) : isEditing ? (
              <div className="additional-details-grid">
                {additionalDetailFields.map((field) => (
                  <label key={field.key} className={field.wide ? 'wide-field' : ''} style={{ display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
                    {field.label}
                    {field.type === 'select' ? (
                      <select
                        value={additionalForm[field.key]}
                        onChange={(e) => onAdditionalFieldChange(field.key, e.target.value)}
                      >
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>{formatValue(opt)}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={field.wide ? 10 : 4}
                        value={additionalForm[field.key]}
                        onChange={(e) => onAdditionalFieldChange(field.key, e.target.value)}
                      />
                    ) : (
                      <input
                        value={additionalForm[field.key]}
                        onChange={(e) => onAdditionalFieldChange(field.key, e.target.value)}
                      />
                    )}
                  </label>
                ))}
              </div>
            ) : (
              <div className="additional-details-grid">
                {additionalDetailFields.map((field) => (
                  <div key={field.key} className={field.wide ? 'wide-field' : ''} style={{ display: 'grid', gap: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)' }}>{field.label}</span>
                    <ReadValue value={additionalForm[field.key]} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Profile Photos (always read-only) ── */}
          <div>
            <div className="section-heading" style={{ marginBottom: 'var(--sp-3)' }}>
              <div>
                <h4>Profile Photos</h4>
                <p>Moderation status for uploaded photos.</p>
              </div>
            </div>
            <div className="photos-grid">
              {(user.profile?.photos || []).map((photo) => (
                <figure key={photo.id} className="photo-card" style={{ margin: 0 }}>
                  <img src={photo.photo_url} alt="" loading="lazy" />
                  <div className="photo-card-body">
                    <StatusBadge value={photo.moderation_status} />
                    {photo.is_primary && <span className="muted" style={{ fontSize: 12 }}>Primary photo</span>}
                  </div>
                </figure>
              ))}
              {(!user.profile?.photos || user.profile.photos.length === 0) && (
                <p className="muted">No photos uploaded yet.</p>
              )}
            </div>
          </div>

          {/* ── Sticky save bar shown at bottom when editing ── */}
          {isEditing && (
            <div style={{
              position: 'sticky', bottom: 0,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(12px)',
              borderTop: '1px solid var(--line)',
              padding: 'var(--sp-4) var(--sp-5)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--sp-3)',
              borderRadius: '0 0 var(--r-lg) var(--r-lg)',
              zIndex: 10,
              boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                Unsaved changes — review and save or cancel.
              </span>
              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                <button type="button" className="ghost-button" onClick={cancelEdit}>Cancel</button>
                <button
                  type="button"
                  className="primary-button"
                  disabled={saving || !user.profile}
                  onClick={saveAll}
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          <ConfirmDialog
            open={deleteConfirmOpen}
            title="Delete user account"
            description="This removes the user's account and access immediately. This action cannot be undone."
            confirmLabel="Delete user"
            tone="danger"
            onConfirm={confirmDelete}
            onCancel={() => setDeleteConfirmOpen(false)}
          />
        </>
      )}
    </section>
  );
}
