import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, dataOf } from '../api/client.js';
import { EmptyState, ErrorMessage, Loading, PageHeader, StatusBadge } from '../components/ui.jsx';
import { formatValue } from '../utils/format.js';

const statusOptions = ['all', 'pending', 'active', 'suspended', 'deleted'];

export default function Users() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/users', { params: { q, status } });
      setUsers(dataOf(response));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const applyFilters = (event) => {
    event.preventDefault();
    const next = {};
    if (q.trim()) next.q = q.trim();
    if (status !== 'all') next.status = status;
    setSearchParams(next);
    fetchUsers();
  };

  const runAction = async (id, action) => {
    if (action === 'delete' && !window.confirm('Delete this user?')) return;
    setBusyId(id);
    setError('');
    try {
      if (action === 'delete') {
        await api.delete(`/admin/users/${id}`);
      } else {
        await api.put(`/admin/users/${id}/${action}`);
      }
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="page-section">
      <PageHeader title="Users" description="Search users and manage profile approval status." />
      <form className="toolbar" onSubmit={applyFilters}>
        <input
          placeholder="Search name, mobile, city, public ID"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {statusOptions.map((option) => (
            <option key={option} value={option}>{formatValue(option)}</option>
          ))}
        </select>
        <button className="primary-button" type="submit">Search</button>
      </form>
      <ErrorMessage error={error} />
      {loading ? (
        <Loading />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="Try changing the search or status filter." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>City</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Link className="table-link" to={`/users/${user.id}`}>
                      {user.profile?.name || `User ${user.id}`}
                    </Link>
                  </td>
                  <td>{formatValue(user.mobile_number)}</td>
                  <td>{formatValue(user.profile?.city)}</td>
                  <td><StatusBadge value={user.status} /></td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="row-actions">
                      <Link className="small-button" to={`/users/${user.id}`}>View</Link>
                      {user.status !== 'active' && (
                        <button disabled={busyId === user.id} onClick={() => runAction(user.id, 'approve')}>Approve</button>
                      )}
                      {user.status !== 'suspended' && user.status !== 'deleted' && (
                        <button disabled={busyId === user.id} onClick={() => runAction(user.id, 'suspend')}>Suspend</button>
                      )}
                      {user.status !== 'deleted' && (
                        <button disabled={busyId === user.id} className="danger-button" onClick={() => runAction(user.id, 'delete')}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
