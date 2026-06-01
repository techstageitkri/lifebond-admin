import { useEffect, useState } from 'react';
import { api, dataOf } from '../api/client.js';
import { ErrorMessage, Loading, PageHeader } from '../components/ui.jsx';

const PROVIDERS = [
  { value: 'firebase', label: 'Firebase Phone Authentication' },
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
    firebase: {
      enabled: false,
      project_id: '',
      web_api_key: '',
      web_api_key_configured: false,
    },
    msg91_sms: {
      enabled: true,
      auth_key: '',
      auth_key_configured: false,
      template_id: '',
      sender_id: '',
    },
    msg91_whatsapp: {
      enabled: false,
      auth_key: '',
      auth_key_configured: false,
      template_id: '',
      whatsapp_number: '',
    },
  },
};

const toNumber = (value) => Number.parseInt(value, 10) || 0;

function providerFromServer(providerKey, provider) {
  const config = provider?.config || {};
  if (providerKey === 'firebase') {
    return {
      enabled: provider?.enabled || false,
      project_id: config.project_id || '',
      web_api_key: '',
      web_api_key_configured: provider?.web_api_key_configured || false,
    };
  }

  if (providerKey === 'msg91_whatsapp') {
    return {
      enabled: provider?.enabled || false,
      auth_key: '',
      auth_key_configured: provider?.auth_key_configured || false,
      template_id: config.template_id || '',
      whatsapp_number: config.whatsapp_number || '',
    };
  }

  return {
    enabled: provider?.enabled ?? true,
    auth_key: '',
    auth_key_configured: provider?.auth_key_configured || false,
    template_id: config.template_id || '',
    sender_id: config.sender_id || '',
  };
}

function mapServerResponse(payload) {
  const settings = payload.settings || {};
  const providers = payload.providers || {};
  return {
    settings: {
      ...emptyForm.settings,
      ...settings,
      fallback_otp_provider: settings.fallback_otp_provider || 'none',
    },
    providers: {
      firebase: providerFromServer('firebase', providers.firebase),
      msg91_sms: providerFromServer('msg91_sms', providers.msg91_sms),
      msg91_whatsapp: providerFromServer('msg91_whatsapp', providers.msg91_whatsapp),
    },
  };
}

function RadioGroup({ title, name, value, options, onChange }) {
  return (
    <fieldset className="radio-panel">
      <legend>{title}</legend>
      {options.map((option) => (
        <label className="radio-row" key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(event) => onChange(event.target.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

function SecretHint({ configured }) {
  if (!configured) return null;
  return <span className="field-hint">Configured. Leave blank to keep existing value.</span>;
}

export default function AuthSettings() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/auth-settings/otp')
      .then((response) => setForm(mapServerResponse(dataOf(response))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = (key, value) => {
    setForm((current) => ({
      ...current,
      settings: { ...current.settings, [key]: value },
    }));
  };

  const updateProvider = (provider, key, value) => {
    setForm((current) => ({
      ...current,
      providers: {
        ...current.providers,
        [provider]: {
          ...current.providers[provider],
          [key]: value,
        },
      },
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const payload = {
      settings: {
        primary_otp_provider: form.settings.primary_otp_provider,
        fallback_otp_provider: form.settings.fallback_otp_provider === 'none'
          ? null
          : form.settings.fallback_otp_provider,
        otp_expiry_minutes: toNumber(form.settings.otp_expiry_minutes),
        resend_otp_delay_seconds: toNumber(form.settings.resend_otp_delay_seconds),
        max_otp_attempts: toNumber(form.settings.max_otp_attempts),
        max_otp_per_mobile_per_day: toNumber(form.settings.max_otp_per_mobile_per_day),
        max_otp_per_ip_per_hour: toNumber(form.settings.max_otp_per_ip_per_hour),
      },
      providers: {
        firebase: {
          enabled: form.providers.firebase.enabled,
          project_id: form.providers.firebase.project_id,
          ...(form.providers.firebase.web_api_key ? { web_api_key: form.providers.firebase.web_api_key } : {}),
        },
        msg91_sms: {
          enabled: form.providers.msg91_sms.enabled,
          template_id: form.providers.msg91_sms.template_id,
          sender_id: form.providers.msg91_sms.sender_id,
          ...(form.providers.msg91_sms.auth_key ? { auth_key: form.providers.msg91_sms.auth_key } : {}),
        },
        msg91_whatsapp: {
          enabled: form.providers.msg91_whatsapp.enabled,
          template_id: form.providers.msg91_whatsapp.template_id,
          whatsapp_number: form.providers.msg91_whatsapp.whatsapp_number,
          ...(form.providers.msg91_whatsapp.auth_key ? { auth_key: form.providers.msg91_whatsapp.auth_key } : {}),
        },
      },
    };

    try {
      const response = await api.put('/admin/auth-settings/otp', payload);
      setForm(mapServerResponse(dataOf(response)));
      setMessage('OTP provider settings saved');
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
        title="Authentication Settings"
        description="Manage OTP provider selection, fallback behavior, limits, and provider credentials."
      />
      <form className="settings-layout" onSubmit={submit}>
        <div>
          <ErrorMessage error={error} />
          {message && <div className="success-message">{message}</div>}

          <div className="settings-grid">
            <RadioGroup
              title="Primary OTP Provider"
              name="primary_otp_provider"
              value={form.settings.primary_otp_provider}
              options={PROVIDERS}
              onChange={(value) => updateSettings('primary_otp_provider', value)}
            />
            <RadioGroup
              title="Fallback OTP Provider"
              name="fallback_otp_provider"
              value={form.settings.fallback_otp_provider}
              options={[{ value: 'none', label: 'None' }, ...PROVIDERS]}
              onChange={(value) => updateSettings('fallback_otp_provider', value)}
            />
          </div>

          <div className="form-panel settings-panel">
            <h4>Additional Settings</h4>
            <div className="settings-grid">
              <label>
                OTP Expiry (minutes)
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={form.settings.otp_expiry_minutes}
                  onChange={(event) => updateSettings('otp_expiry_minutes', event.target.value)}
                />
              </label>
              <label>
                Resend OTP Delay (seconds)
                <input
                  type="number"
                  min="0"
                  max="3600"
                  value={form.settings.resend_otp_delay_seconds}
                  onChange={(event) => updateSettings('resend_otp_delay_seconds', event.target.value)}
                />
              </label>
              <label>
                Maximum OTP Attempts
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.settings.max_otp_attempts}
                  onChange={(event) => updateSettings('max_otp_attempts', event.target.value)}
                />
              </label>
              <label>
                Maximum OTP Per Mobile Per Day
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={form.settings.max_otp_per_mobile_per_day}
                  onChange={(event) => updateSettings('max_otp_per_mobile_per_day', event.target.value)}
                />
              </label>
              <label>
                Maximum OTP Per IP Per Hour
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={form.settings.max_otp_per_ip_per_hour}
                  onChange={(event) => updateSettings('max_otp_per_ip_per_hour', event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="provider-grid">
            <section className="form-panel settings-panel">
              <h4>Firebase</h4>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.providers.firebase.enabled}
                  onChange={(event) => updateProvider('firebase', 'enabled', event.target.checked)}
                />
                Enabled
              </label>
              <label>
                Firebase Project ID
                <input
                  value={form.providers.firebase.project_id}
                  onChange={(event) => updateProvider('firebase', 'project_id', event.target.value)}
                />
              </label>
              <label>
                Firebase Web API Key
                <input
                  type="password"
                  value={form.providers.firebase.web_api_key}
                  placeholder={form.providers.firebase.web_api_key_configured ? 'Configured' : ''}
                  onChange={(event) => updateProvider('firebase', 'web_api_key', event.target.value)}
                />
                <SecretHint configured={form.providers.firebase.web_api_key_configured} />
              </label>
            </section>

            <section className="form-panel settings-panel">
              <h4>MSG91 SMS</h4>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.providers.msg91_sms.enabled}
                  onChange={(event) => updateProvider('msg91_sms', 'enabled', event.target.checked)}
                />
                Enabled
              </label>
              <label>
                Auth Key
                <input
                  type="password"
                  value={form.providers.msg91_sms.auth_key}
                  placeholder={form.providers.msg91_sms.auth_key_configured ? 'Configured' : ''}
                  onChange={(event) => updateProvider('msg91_sms', 'auth_key', event.target.value)}
                />
                <SecretHint configured={form.providers.msg91_sms.auth_key_configured} />
              </label>
              <label>
                Template ID
                <input
                  value={form.providers.msg91_sms.template_id}
                  onChange={(event) => updateProvider('msg91_sms', 'template_id', event.target.value)}
                />
              </label>
              <label>
                Sender ID
                <input
                  value={form.providers.msg91_sms.sender_id}
                  onChange={(event) => updateProvider('msg91_sms', 'sender_id', event.target.value)}
                />
              </label>
            </section>

            <section className="form-panel settings-panel">
              <h4>MSG91 WhatsApp</h4>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.providers.msg91_whatsapp.enabled}
                  onChange={(event) => updateProvider('msg91_whatsapp', 'enabled', event.target.checked)}
                />
                Enabled
              </label>
              <label>
                Auth Key
                <input
                  type="password"
                  value={form.providers.msg91_whatsapp.auth_key}
                  placeholder={form.providers.msg91_whatsapp.auth_key_configured ? 'Configured' : ''}
                  onChange={(event) => updateProvider('msg91_whatsapp', 'auth_key', event.target.value)}
                />
                <SecretHint configured={form.providers.msg91_whatsapp.auth_key_configured} />
              </label>
              <label>
                Template ID
                <input
                  value={form.providers.msg91_whatsapp.template_id}
                  onChange={(event) => updateProvider('msg91_whatsapp', 'template_id', event.target.value)}
                />
              </label>
              <label>
                WhatsApp Number
                <input
                  value={form.providers.msg91_whatsapp.whatsapp_number}
                  onChange={(event) => updateProvider('msg91_whatsapp', 'whatsapp_number', event.target.value)}
                />
              </label>
            </section>
          </div>

          <div className="settings-actions">
            <button className="primary-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save OTP Settings'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
