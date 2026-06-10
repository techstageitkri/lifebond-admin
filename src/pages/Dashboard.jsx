import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, dataOf } from '../api/client.js';
import { ErrorMessage, Loading, PageHeader } from '../components/ui.jsx';

const providerLabels = {
  firebase: 'Firebase',
  msg91_sms: 'MSG91 SMS',
  msg91_whatsapp: 'MSG91 WhatsApp',
};

const kpiConfig = [
  { key: 'totalUsers',          label: 'Total Users',       to: '/users',                         color: 'blue',   iconPath: 'M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM0 16.68A19.9 19.9 0 016 15c2 0 3.9.42 5.6 1.17A7 7 0 010 16.68zm20 0A7 7 0 0114 17c-.6 0-1.2-.06-1.77-.17A19.88 19.88 0 0120 16.68V16.68z' },
  { key: 'pendingProfiles',     label: 'Pending Profiles',  to: '/users?status=pending_approval', color: 'amber',  iconPath: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' },
  { key: 'activeUsers',         label: 'Active Users',      to: '/users?status=active',           color: 'green',  iconPath: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' },
  { key: 'pendingPhotos',       label: 'Pending Photos',    to: '/photos',                        color: 'purple', iconPath: 'M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z' },
  { key: 'reportsCount',        label: 'User Reports',      to: '/reports',                       color: 'red',    iconPath: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' },
  { key: 'problemReportsCount', label: 'Problem Reports',   to: '/problem-reports',               color: 'cyan',   iconPath: 'M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' },
];

function StatCard({ label, value, to, color, iconPath }) {
  return (
    <Link className="stat-card" to={to}>
      <div className="stat-card-header">
        <div className={`stat-card-icon ${color}`}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d={iconPath} clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value ?? 0}</div>
    </Link>
  );
}

function OtpStats({ stats }) {
  if (!stats) return null;
  const providers = Object.entries(stats.providers || {});

  return (
    <div className="otp-stats-panel">
      <div className="otp-stats-header">
        <div>
          <h4>Authentication Statistics</h4>
          <p>OTP traffic breakdown by provider</p>
        </div>
        <Link className="ghost-button small-button" to="/settings/authentication/otp">
          Manage Providers
        </Link>
      </div>

      <div className="otp-summary-grid">
        {[
          ['OTP Sent',            stats.sent],
          ['OTP Verified',        stats.verified],
          ['OTP Failed',          stats.failed],
          ['Fallback Triggered',  stats.fallbackTriggered],
        ].map(([label, val]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{val ?? 0}</strong>
          </div>
        ))}
      </div>

      {providers.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Sent</th>
                <th>Verified</th>
                <th>Failed</th>
              </tr>
            </thead>
            <tbody>
              {providers.map(([provider, s]) => (
                <tr key={provider}>
                  <td><strong>{providerLabels[provider] || provider}</strong></td>
                  <td>{s.sent ?? 0}</td>
                  <td>{s.verified ?? 0}</td>
                  <td>{s.failed ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/admin/dashboard')
      .then((r) => { if (active) setData(dataOf(r)); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, []);

  return (
    <section className="page-section">
      <PageHeader
        title="Dashboard"
        description="Platform overview — approvals, moderation queue, and live metrics."
      />

      <ErrorMessage error={error} />

      {!data ? (
        <Loading />
      ) : (
        <div className="stat-grid">
          {kpiConfig.map(({ key, label, to, color, iconPath }) => (
            <StatCard key={key} label={label} value={data[key]} to={to} color={color} iconPath={iconPath} />
          ))}
        </div>
      )}

      {data && <OtpStats stats={data.otpStats} />}
    </section>
  );
}
