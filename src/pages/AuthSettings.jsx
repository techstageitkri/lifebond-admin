import { useEffect, useState } from 'react';
import { api, dataOf } from '../api/client.js';
import { ErrorMessage, Loading, PageHeader, SuccessMessage } from '../components/ui.jsx';

const PROVIDERS = [
  { value: 'firebase', label: 'Firebase Phone Auth' },
  { value: 'msg91_sms', label: 'MSG91 SMS OTP' },
  { value: 'msg91_whatsapp', label: 'MSG91 WhatsApp OTP' },
];

const emptyForm = {
  settings: {
    primary_otp_provider: 'msg91_sms',
    fallback_otp_provider: 'none',
    otp_expiry_minutes: 5,
    resend_otp_delay_seconds: 60,
    max_otp_attempts: 3,
    max_otp_per_mobile_per_day: 10,
    max_otp_per_ip_per_hour: 20,
  },
  providers: {
    firebase: { enabled: false, project_id: '', web_api_key: '', web_api_key_configured: false },
    msg91_sms: { enabled: true, auth_key: '', auth_key_configured: false, template_id: '', sender_id: '' },
    msg91_whatsapp: { enabled: false, auth_key: '', auth_key_configured: false, template_id: '', whatsapp_number: '' },
  },
};

const toNumber = (v) => Number.parseInt(v, 10) || 0;

function providerFromServer(key, provider) {
  const cfg = provider?.config || {};
  if (key === 'firebase') return { enabled: provider?.enabled || false, project_id: cfg.project_id || '', web_api_key: '', web_api_key_configured: provider?.web_api_key_configured || false };
  if (key === 'msg91_whatsapp') return { enabled: provider?.enabled || false, auth_key: '', auth_key_configured: provider?.auth_key_configured || false, template_id: cfg.template_id || '', whatsapp_number: cfg.whatsapp_number || '' };
  return { enabled: provider?.enabled ?? true, auth_key: '', auth_key_configured: provider?.auth_key_configured || false, template_id: cfg.template_id || '', sender_id: cfg.sender_id || '' };
}

function mapServerResponse(payload) {
  const settings = payload.settings || {};
  return {
    settings: { ...emptyForm.settings, ...settings, fallback_otp_provider: settings.fallback_otp_provider || 'none' },
    providers: {
      firebase: providerFromServer('firebase', payload.providers?.firebase),
      msg91_sms: providerFromServer('msg91_sms', payload.providers?.msg91_sms),
      msg91_whatsapp: providerFromServer('msg91_whatsapp', payload.providers?.msg91_whatsapp),
    },
  };
}

function RadioGroup({ title, name, value, options, onChange }) {
  return (
    <fieldset className="radio-panel">
      <legend>{title}</legend>
      {options.map((opt) => (
        <label className="radio-row" key={opt.value}>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={(e) => onChange(e.target.value)}
          />
          {opt.label}
        </label>
      ))}
    </fieldset>
  );
}

function SecretHint({ configured }) {
  if (!configured) return null;
  return <span className="field-hint">Already configured — leave blank to keep existing value.</span>;
}

export default function AuthSettings() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/auth-settings/otp')
      .then((r) => setForm(mapServerResponse(dataOf(r))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = (key, value) =>
    setForm((cur) => ({ ...cur, settings: { ...cur.settings, [key]: value } }));

  const updateProvider = (provider, key, value) =>
    setForm((cur) => ({
      ...cur,
      providers: { ...cur.providers, [provider]: { ...cur.providers[provider], [key]: value } },
    }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    const { settings: s, providers: p } = form;
    const payload = {
      settings: {
        primary_otp_provider: s.primary_otp_provider,
        fallback_otp_provider: s.fallback_otp_provider === 'none' ? null : s.fallback_otp_provider,
        otp_expiry_minutes: toNumber(s.otp_expiry_minutes),
        resend_otp_delay_seconds: toNumber(s.resend_otp_delay_seconds),
        max_otp_attempts: toNumber(s.max_otp_attempts),
        max_otp_per_mobile_per_day: toNumber(s.max_otp_per_mobile_per_day),
        max_otp_per_ip_per_hour: toNumber(s.max_otp_per_ip_per_hour),
      },
      providers: {
        firebase: { enabled: p.firebase.enabled, project_id: p.firebase.project_id, ...(p.firebase.web_api_key ? { web_api_key: p.firebase.web_api_key } : {}) },
        msg91_sms: { enabled: p.msg91_sms.enabled, template_id: p.msg91_sms.template_id, sender_id: p.msg91_sms.sender_id, ...(p.msg91_sms.auth_key ? { auth_key: p.msg91_sms.auth_key } : {}) },
        msg91_whatsapp: { enabled: p.msg91_whatsapp.enabled, template_id: p.msg91_whatsapp.template_id, whatsapp_number: p.msg91_whatsapp.whatsapp_number, ...(p.msg91_whatsapp.auth_key ? { auth_key: p.msg91_whatsapp.auth_key } : {}) },
      },
    };
    try {
      const r = await api.put('/admin/auth-settings/otp', payload);
      setForm(mapServerResponse(dataOf(r)));
      setMessage('OTP settings saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <section className="page-section"><Loading /></section>;

  const { settings, providers } = form;

  return (
    <section className="page-section">
      <PageHeader
        title="Authentication Settings"
        description="Configure OTP provider routing, fallback behavior, rate limits, and credentials."
      />

      <form className="settings-layout" onSubmit={submit}>
        <ErrorMessage error={error} />
        <SuccessMessage message={message} />

        <div className="settings-panel card">
          <div className="section-heading">
            <div>
              <h4>Provider Routing</h4>
              <p>Set the primary and fallback OTP delivery channel.</p>
            </div>
          </div>
          <div className="settings-grid">
            <RadioGroup
              title="Primary OTP Provider"
              name="primary_otp_provider"
              value={settings.primary_otp_provider}
              options={PROVIDERS}
              onChange={(v) => updateSettings('primary_otp_provider', v)}
            />
            <RadioGroup
              title="Fallback OTP Provider"
              name="fallback_otp_provider"
              value={settings.fallback_otp_provider}
              options={[{ value: 'none', label: 'None' }, ...PROVIDERS]}
              onChange={(v) => updateSettings('fallback_otp_provider', v)}
            />
          </div>
        </div>

        <div className="settings-panel card">
          <div className="section-heading">
            <div>
              <h4>Rate Limits &amp; Expiry</h4>
              <p>Tune OTP throttling and expiry controls.</p>
            </div>
          </div>
          <div className="settings-grid">
            {[
              { key: 'otp_expiry_minutes', label: 'OTP Expiry (minutes)', min: 1, max: 30 },
              { key: 'resend_otp_delay_seconds', label: 'Resend Delay (seconds)', min: 0, max: 3600 },
              { key: 'max_otp_attempts', label: 'Max OTP Attempts', min: 1, max: 20 },
              { key: 'max_otp_per_mobile_per_day', label: 'Max OTP / Mobile / Day', min: 1, max: 1000 },
              { key: 'max_otp_per_ip_per_hour', label: 'Max OTP / IP / Hour', min: 1, max: 1000 },
            ].map(({ key, label, min, max }) => (
              <label key={key}>
                {label}
                <input
                  type="number"
                  min={min}
                  max={max}
                  value={settings[key]}
                  onChange={(e) => updateSettings(key, e.target.value)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="provider-grid">
          {/* Firebase */}
          <div className="settings-panel card" style={{ display: 'grid', gap: 'var(--sp-4)' }}>
            <h4>Firebase</h4>
            <label className="checkbox-row">
              <input type="checkbox" checked={providers.firebase.enabled} onChange={(e) => updateProvider('firebase', 'enabled', e.target.checked)} />
              Enabled
            </label>
            <label>
              Project ID
              <input value={providers.firebase.project_id} onChange={(e) => updateProvider('firebase', 'project_id', e.target.value)} />
            </label>
            <label>
              Web API Key
              <input type="password" value={providers.firebase.web_api_key} placeholder={providers.firebase.web_api_key_configured ? 'Configured' : ''} onChange={(e) => updateProvider('firebase', 'web_api_key', e.target.value)} />
              <SecretHint configured={providers.firebase.web_api_key_configured} />
            </label>
          </div>

          {/* MSG91 SMS */}
          <div className="settings-panel card" style={{ display: 'grid', gap: 'var(--sp-4)' }}>
            <h4>MSG91 SMS</h4>
            <label className="checkbox-row">
              <input type="checkbox" checked={providers.msg91_sms.enabled} onChange={(e) => updateProvider('msg91_sms', 'enabled', e.target.checked)} />
              Enabled
            </label>
            <label>
              Auth Key
              <input type="password" value={providers.msg91_sms.auth_key} placeholder={providers.msg91_sms.auth_key_configured ? 'Configured' : ''} onChange={(e) => updateProvider('msg91_sms', 'auth_key', e.target.value)} />
              <SecretHint configured={providers.msg91_sms.auth_key_configured} />
            </label>
            <label>
              Template ID
              <input value={providers.msg91_sms.template_id} onChange={(e) => updateProvider('msg91_sms', 'template_id', e.target.value)} />
            </label>
            <label>
              Sender ID
              <input value={providers.msg91_sms.sender_id} onChange={(e) => updateProvider('msg91_sms', 'sender_id', e.target.value)} />
            </label>
          </div>

          {/* MSG91 WhatsApp */}
          <div className="settings-panel card" style={{ display: 'grid', gap: 'var(--sp-4)' }}>
            <h4>MSG91 WhatsApp</h4>
            <label className="checkbox-row">
              <input type="checkbox" checked={providers.msg91_whatsapp.enabled} onChange={(e) => updateProvider('msg91_whatsapp', 'enabled', e.target.checked)} />
              Enabled
            </label>
            <label>
              Auth Key
              <input type="password" value={providers.msg91_whatsapp.auth_key} placeholder={providers.msg91_whatsapp.auth_key_configured ? 'Configured' : ''} onChange={(e) => updateProvider('msg91_whatsapp', 'auth_key', e.target.value)} />
              <SecretHint configured={providers.msg91_whatsapp.auth_key_configured} />
            </label>
            <label>
              Template ID
              <input value={providers.msg91_whatsapp.template_id} onChange={(e) => updateProvider('msg91_whatsapp', 'template_id', e.target.value)} />
            </label>
            <label>
              WhatsApp Number
              <input value={providers.msg91_whatsapp.whatsapp_number} onChange={(e) => updateProvider('msg91_whatsapp', 'whatsapp_number', e.target.value)} />
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Saving…' : 'Save OTP Settings'}
          </button>
        </div>
      </form>
    </section>
  );
}
