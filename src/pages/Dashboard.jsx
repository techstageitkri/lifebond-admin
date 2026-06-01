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
];

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
    </section>
  );
}
