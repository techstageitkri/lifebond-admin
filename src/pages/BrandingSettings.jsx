import { useEffect, useState } from 'react';
import { api, dataOf } from '../api/client.js';
import { ErrorMessage, Loading, PageHeader, SuccessMessage } from '../components/ui.jsx';

const emptyForm = {
  primary_logo_url: '',
  splash_logo_url: '',
  launcher_icon_variant: 'gradient',
};

const ICON_VARIANTS = [
  { value: 'gradient', label: 'Gradient App Icon' },
  { value: 'plain', label: 'Plain App Icon' },
];

const normalize = (payload) => ({
  primary_logo_url: payload.primary_logo_url || '',
  splash_logo_url: payload.splash_logo_url || '',
  launcher_icon_variant: payload.launcher_icon_variant || 'gradient',
});

function LogoPreview({ title, url }) {
  return (
    <div className="branding-preview">
      <span>{title}</span>
      {url ? (
        <img src={url} alt={title} />
      ) : (
        <div className="branding-placeholder">Mobile bundled fallback</div>
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
      .then((r) => setForm(normalize(dataOf(r))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key, value) => setForm((cur) => ({ ...cur, [key]: value }));

  const uploadImage = async (target, file) => {
    if (!file) return;
    setUploading(target);
    setError('');
    setMessage('');
    try {
      const data = new FormData();
      data.append('target', target);
      data.append('image', file);
      const r = await api.post('/admin/branding-settings/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(normalize(dataOf(r).settings));
      setMessage('Branding image uploaded successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading('');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const r = await api.put('/admin/branding-settings', form);
      setForm(normalize(dataOf(r)));
      setMessage('Branding settings saved.');
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
        description="Manage login logo, splash logo, and launcher icon variant for the mobile app."
      />

      <form className="settings-layout" onSubmit={submit}>
        <ErrorMessage error={error} />
        <SuccessMessage message={message} />

        <div className="settings-panel card">
          <div className="section-heading">
            <div>
              <h4>Login &amp; Splash Logos</h4>
              <p>Upload or provide URLs for logos displayed in the mobile app.</p>
            </div>
          </div>
          <div className="settings-grid">
            <label>
              Login Logo URL
              <input
                type="url"
                placeholder="https://…"
                value={form.primary_logo_url}
                onChange={(e) => updateField('primary_logo_url', e.target.value)}
              />
              <span className="field-hint">Shown on the mobile login screen.</span>
            </label>
            <label>
              Upload Login Logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => uploadImage('primary_logo_url', e.target.files?.[0])}
              />
              {uploading === 'primary_logo_url' && <span className="field-hint">Uploading…</span>}
            </label>
            <label>
              Splash Logo URL
              <input
                type="url"
                placeholder="Leave blank to reuse login logo"
                value={form.splash_logo_url}
                onChange={(e) => updateField('splash_logo_url', e.target.value)}
              />
              <span className="field-hint">Leave blank to reuse the login logo on splash.</span>
            </label>
            <label>
              Upload Splash Logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => uploadImage('splash_logo_url', e.target.files?.[0])}
              />
              {uploading === 'splash_logo_url' && <span className="field-hint">Uploading…</span>}
            </label>
          </div>
          <div className="branding-preview-grid">
            <LogoPreview title="Login Logo Preview" url={form.primary_logo_url} />
            <LogoPreview title="Splash Logo Preview" url={form.splash_logo_url || form.primary_logo_url} />
          </div>
        </div>

        <div className="settings-panel card">
          <div className="section-heading">
            <div>
              <h4>Launcher Icon Variant</h4>
              <p>Switches between icon variants bundled in the released APK/AAB.</p>
            </div>
          </div>
          <fieldset className="radio-panel">
            <legend>Active App Icon</legend>
            {ICON_VARIANTS.map((opt) => (
              <label className="radio-row" key={opt.value}>
                <input
                  type="radio"
                  name="launcher_icon_variant"
                  value={opt.value}
                  checked={form.launcher_icon_variant === opt.value}
                  onChange={(e) => updateField('launcher_icon_variant', e.target.value)}
                />
                {opt.label}
              </label>
            ))}
          </fieldset>
        </div>

        <div className="settings-actions">
          <button type="submit" className="primary-button" disabled={saving || Boolean(uploading)}>
            {saving ? 'Saving…' : 'Save Branding Settings'}
          </button>
        </div>
      </form>
    </section>
  );
}
