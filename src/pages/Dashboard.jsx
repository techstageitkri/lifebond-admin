import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, dataOf } from '../api/client.js';
import { ErrorMessage, Loading, PageHeader } from '../components/ui.jsx';

const stats = [
  ['totalUsers', 'Total Users', '/users'],
  ['pendingProfiles', 'Pending Profiles', '/users?status=pending_approval'],
  ['activeUsers', 'Active Users', '/users?status=active'],
  ['pendingPhotos', 'Pending Photos', '/photos'],
  ['reportsCount', 'Reports Count', '/reports'],
  ['problemReportsCount', 'Problem Reports', '/problem-reports'],
];

const providerLabels = {
  firebase: 'Firebase',
  msg91_sms: 'MSG91 SMS',
  msg91_whatsapp: 'MSG91 WhatsApp',
};

function OtpStats({ stats: otpStats }) {
  if (!otpStats) return null;

  const providers = Object.entries(otpStats.providers || {});
  return (
    <section className="details-panel otp-stats-panel">
      <div className="section-heading">
        <div>
          <h4>Authentication Statistics</h4>
          <p>Today&apos;s OTP traffic by provider</p>
        </div>
        <Link className="ghost-button" to="/settings/authentication/otp">Manage Providers</Link>
      </div>
      <div className="otp-summary-grid">
        <div>
          <span>OTP Sent</span>
          <strong>{otpStats.sent ?? 0}</strong>
        </div>
        <div>
          <span>OTP Verified</span>
          <strong>{otpStats.verified ?? 0}</strong>
        </div>
        <div>
          <span>OTP Failed</span>
          <strong>{otpStats.failed ?? 0}</strong>
        </div>
        <div>
          <span>Fallback Triggered</span>
          <strong>{otpStats.fallbackTriggered ?? 0}</strong>
        </div>
      </div>
      <div className="table-wrap compact-table">
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Sent</th>
              <th>Success</th>
              <th>Failed</th>
            </tr>
          </thead>
          <tbody>
            {providers.map(([provider, providerStats]) => (
              <tr key={provider}>
                <td>{providerLabels[provider] || provider}</td>
                <td>{providerStats.sent ?? 0}</td>
                <td>{providerStats.verified ?? 0}</td>
                <td>{providerStats.failed ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/admin/dashboard')
      .then((response) => {
        if (active) setData(dataOf(response));
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="page-section">
      <PageHeader
        title="Dashboard"
        description="A quick view of the approvals and moderation queue."
      />
      <ErrorMessage error={error} />
      {!data ? (
        <Loading />
      ) : (
        <div className="stat-grid">
          {stats.map(([key, label, to]) => (
            <Link className="stat-card" key={key} to={to}>
              <span>{label}</span>
              <strong>{data[key] ?? 0}</strong>
            </Link>
          ))}
        </div>
      )}
      {data && <OtpStats stats={data.otpStats} />}
    </section>
  );
}
