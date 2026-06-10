import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, dataOf } from '../api/client.js';
import {
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  Loading,
  PageHeader,
  Pagination,
  StatusBadge,
} from '../components/ui.jsx';
import { formatValue } from '../utils/format.js';

const STATUS_OPTIONS = ['all', 'new', 'setup_required', 'pending_approval', 'active', 'suspended', 'deleted'];
const PAGE_SIZE = 12;

export default function Users() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [deleteUserId, setDeleteUserId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setUsers(dataOf(await api.get('/admin/users', { params: { q, status } })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const applyFilters = (e) => {
    e.preventDefault();
    const next = {};
    if (q.trim()) next.q = q.trim();
    if (status !== 'all') next.status = status;
    setPage(1);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setQ('');
    setStatus('all');
    setSearchParams({});
    setPage(1);
  };

  const runAction = async (id, action) => {
    if (action === 'delete') { setDeleteUserId(id); return; }
    setBusyId(id);
    setError('');
    try {
      await api.put(`/admin/users/${id}/${action}`);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const runDelete = async () => {
    if (!deleteUserId) return;
    setBusyId(deleteUserId);
    setError('');
    try {
      await api.delete(`/admin/users/${deleteUserId}`);
      await fetchUsers();
      setDeleteUserId(null);
      if (page > 1 && users.length <= (page - 1) * PAGE_SIZE) {
        setPage((p) => Math.max(1, p - 1));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const pagedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));

  return (
    <section className="page-section">
      <PageHeader title="Users" description="Search, filter, and manage user profiles and account status." />

      <div className="filter-card">
        <div className="filter-card-header">
          <span className="filter-card-title">Search &amp; Filter</span>
          <button type="button" className="ghost-button small-button" onClick={clearFilters}>
            Reset filters
          </button>
        </div>
        <form className="toolbar" onSubmit={applyFilters}>
          <input
            type="search"
            placeholder="Search name, mobile, city, public ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ minWidth: 170 }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{formatValue(opt)}</option>
            ))}
          </select>
          <button className="primary-button" type="submit">Search</button>
          <button className="ghost-button" type="button" onClick={clearFilters}>Clear</button>
        </form>
      </div>

      <ErrorMessage error={error} />

      {loading ? (
        <Loading />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try adjusting your search query or status filter."
        />
      ) : (
        <div className="table-wrap">
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ fontSize: 14 }}>User Directory</strong>
              <span style={{ fontSize: 12.5, color: 'var(--text-3)', marginLeft: 8 }}>{users.length} result{users.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
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
              {pagedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Link className="table-link" to={`/users/${user.id}`}>
                      {user.profile?.name || `User ${user.id}`}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--text-2)' }}>{formatValue(user.mobile_number)}</td>
                  <td style={{ color: 'var(--text-2)' }}>{formatValue(user.profile?.city)}</td>
                  <td><StatusBadge value={user.status} /></td>
                  <td style={{ color: 'var(--text-3)', fontSize: 13 }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link className="small-button" to={`/users/${user.id}`}>View</Link>
                      {user.status !== 'active' && (
                        <button
                          className="small-button"
                          disabled={busyId === user.id}
                          onClick={() => runAction(user.id, 'approve')}
                        >
                          Approve
                        </button>
                      )}
                      {user.status !== 'suspended' && user.status !== 'deleted' && (
                        <button
                          className="small-button ghost-button"
                          disabled={busyId === user.id}
                          onClick={() => runAction(user.id, 'suspend')}
                        >
                          Suspend
                        </button>
                      )}
                      {user.status !== 'deleted' && (
                        <button
                          className="small-button danger-button"
                          disabled={busyId === user.id}
                          onClick={() => runAction(user.id, 'delete')}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={users.length}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteUserId)}
        title="Delete user account"
        description="This action cannot be undone. The user will immediately lose access."
        confirmLabel="Delete user"
        tone="danger"
        onConfirm={runDelete}
        onCancel={() => setDeleteUserId(null)}
      />
    </section>
  );
}
