import { useEffect, useState } from 'react';
import { api, dataOf } from '../api/client.js';
import { ErrorMessage, Loading, PageHeader } from '../components/ui.jsx';

const emptyForm = {
  primary_logo_url: '',
  splash_logo_url: '',
  launcher_icon_variant: 'gradient',
};

const ICON_VARIANTS = [
  { value: 'gradient', label: 'Gradient App Icon' },
  { value: 'plain', label: 'Without Gradient App Icon' },
];

function normalize(payload) {
  return {
    primary_logo_url: payload.primary_logo_url || '',
    splash_logo_url: payload.splash_logo_url || '',
    launcher_icon_variant: payload.launcher_icon_variant || 'gradient',
  };
}

function LogoPreview({ title, url }) {
  return (
    <div className="branding-preview">
      <span>{title}</span>
      {url ? (
        <img src={url} alt={title} />
      ) : (
        <div className="branding-placeholder">Bundled mobile fallback</div>
      )}
    </div>
  );
}

export default function BrandingSettings() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/branding-settings')
      .then((response) => setForm(normalize(dataOf(response))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const uploadImage = async (target, file) => {
    if (!file) return;
    setUploading(target);
    setError('');
    setMessage('');
    try {
      const data = new FormData();
      data.append('target', target);
      data.append('image', file);
      const response = await api.post('/admin/branding-settings/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(normalize(dataOf(response).settings));
      setMessage('Branding image uploaded');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading('');
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await api.put('/admin/branding-settings', form);
      setForm(normalize(dataOf(response)));
      setMessage('Branding settings saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <section className="page-section"><Loading /></section>;

  return (
    <section className="page-section">
      <PageHeader
        title="Branding Settings"
        description="Manage login logo, splash logo, and the bundled launcher icon variant used by the mobile app."
      />

      <form className="settings-layout" onSubmit={submit}>
        <ErrorMessage error={error} />
        {message && <div className="success-message">{message}</div>}

        <section className="form-panel settings-panel">
          <h4>Login & Splash Logos</h4>
          <div className="settings-grid">
            <label>
              Login Logo URL
              <input
                type="url"
                placeholder="https://..."
                value={form.primary_logo_url}
                onChange={(event) => updateField('primary_logo_url', event.target.value)}
              />
              <span className="field-hint">Used on the mobile number login screen.</span>
            </label>
            <label>
              Upload Login Logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => uploadImage('primary_logo_url', event.target.files?.[0])}
              />
              {uploading === 'primary_logo_url' && <span className="field-hint">Uploading...</span>}
            </label>
            <label>
              Splash Logo URL
              <input
                type="url"
                placeholder="Leave blank to use login logo"
                value={form.splash_logo_url}
                onChange={(event) => updateField('splash_logo_url', event.target.value)}
              />
              <span className="field-hint">Leave blank to reuse the login logo.</span>
            </label>
            <label>
              Upload Splash Logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => uploadImage('splash_logo_url', event.target.files?.[0])}
              />
              {uploading === 'splash_logo_url' && <span className="field-hint">Uploading...</span>}
            </label>
          </div>

          <div className="branding-preview-grid">
            <LogoPreview title="Login Logo Preview" url={form.primary_logo_url} />
            <LogoPreview title="Splash Logo Preview" url={form.splash_logo_url || form.primary_logo_url} />
          </div>
        </section>

        <section className="form-panel settings-panel">
          <h4>Launcher Icon</h4>
          <fieldset className="radio-panel">
            <legend>Active App Icon</legend>
            {ICON_VARIANTS.map((option) => (
              <label className="radio-row" key={option.value}>
                <input
                  type="radio"
                  name="launcher_icon_variant"
                  value={option.value}
                  checked={form.launcher_icon_variant === option.value}
                  onChange={(event) => updateField('launcher_icon_variant', event.target.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>
          <span className="field-hint">
            The mobile app can switch only between icon variants bundled in the released APK/AAB.
          </span>
        </section>

        <div className="settings-actions">
          <button type="submit" disabled={saving || Boolean(uploading)}>
            {saving ? 'Saving...' : 'Save Branding Settings'}
          </button>
        </div>
      </form>
    </section>
  );
}
