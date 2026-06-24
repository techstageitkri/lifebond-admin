import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, dataOf } from '../api/client.js';
import {
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  Loading,
  PageHeader,
  StatusBadge,
  SuccessMessage,
} from '../components/ui.jsx';
import { formatValue } from '../utils/format.js';

const EMPTY_FORM = {
  id: null,
  name: '',
  email: '',
  password: '',
  role: 'community_admin',
  allowed_communities: [],
};

const DEFAULT_COMMUNITIES = ['muslim', 'hindu', 'christian', 'others'];

function readCurrentAdmin() {
  try {
    return JSON.parse(localStorage.getItem('lifebond_admin') || '{}');
  } catch {
    return {};
  }
}

export default function Admins() {
  const currentAdmin = readCurrentAdmin();
  const isSuperAdmin = currentAdmin.is_super_admin || currentAdmin.role === 'super_admin' || Number(currentAdmin.id) === 1;
  const [admins, setAdmins] = useState([]);
  const [communities, setCommunities] = useState(DEFAULT_COMMUNITIES);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isEditing = Boolean(form.id);
  const allSelected = useMemo(
    () => communities.every((community) => form.allowed_communities.includes(community)),
    [communities, form.allowed_communities],
  );

  const fetchAdmins = useCallback(async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = dataOf(await api.get('/admin/admins'));
      setAdmins(payload.admins || []);
      setCommunities(payload.communities || DEFAULT_COMMUNITIES);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSuccess('');
    setError('');
  };

  const editAdmin = (admin) => {
    setForm({
      id: admin.id,
      name: admin.name || '',
      email: admin.email || '',
      password: '',
      role: admin.role || 'community_admin',
      allowed_communities: admin.allowed_communities || [],
    });
    setSuccess('');
    setError('');
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      allowed_communities: field === 'role' && value === 'super_admin'
        ? communities
        : current.allowed_communities,
    }));
  };

  const toggleCommunity = (community) => {
    setForm((current) => {
      const selected = new Set(current.allowed_communities);
      if (selected.has(community)) selected.delete(community);
      else selected.add(community);
      return { ...current, allowed_communities: communities.filter((item) => selected.has(item)) };
    });
  };

  const toggleAllCommunities = () => {
    setForm((current) => ({
      ...current,
      allowed_communities: allSelected ? [] : communities,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        allowed_communities: form.role === 'super_admin' ? communities : form.allowed_communities,
      };
      if (form.password.trim()) payload.password = form.password.trim();
      if (!isEditing && !payload.password) throw new Error('Password is required for a new admin');

      if (isEditing) {
        await api.put(`/admin/admins/${form.id}`, payload);
        setSuccess('Admin updated');
      } else {
        await api.post('/admin/admins', payload);
        setSuccess('Admin created');
      }

      await fetchAdmins();
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAdmin = async () => {
    if (!deleteAdminId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/admin/admins/${deleteAdminId}`);
      setSuccess('Admin deleted');
      setDeleteAdminId(null);
      await fetchAdmins();
      if (form.id === deleteAdminId) setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <section className="page-section">
        <PageHeader title="Admins" description="Super Admin access is required." />
        <ErrorMessage error="You do not have permission to manage admins." />
      </section>
    );
  }

  return (
    <section className="page-section">
      <PageHeader
        title="Admins"
        description="Create admin accounts and assign the profile communities they can manage."
      />

      <ErrorMessage error={error} />
      <SuccessMessage message={success} />

      <div className="admin-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <h4>{isEditing ? 'Edit Admin' : 'Create Admin'}</h4>
              <p>Use Super Admin for full configuration access, or Community Admin for profile operations only.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={submit}>
            <label>
              Name
              <input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder={isEditing ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
                required={!isEditing}
                minLength={form.password ? 8 : undefined}
              />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(e) => updateField('role', e.target.value)}>
                <option value="community_admin">Community Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </label>

            <div className="form-span">
              <div className="checkbox-panel">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAllCommunities}
                  />
                  <span>All profiles</span>
                </label>
                <div className="checkbox-grid">
                  {communities.map((community) => (
                    <label key={community} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={form.allowed_communities.includes(community)}
                        onChange={() => toggleCommunity(community)}
                      />
                      <span>{formatValue(community)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-actions form-span">
              <button type="submit" className="primary-button" disabled={saving}>
                {isEditing ? 'Save Changes' : 'Create Admin'}
              </button>
              {isEditing && (
                <button type="button" className="ghost-button" onClick={resetForm} disabled={saving}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <h4>Admin Accounts</h4>
              <p>The first admin account is always protected as a Super Admin.</p>
            </div>
          </div>
          {loading ? (
            <Loading />
          ) : admins.length === 0 ? (
            <EmptyState title="No admins found" description="Create an admin account to begin delegation." />
          ) : (
            <div className="table-wrap compact-table">
              <table>
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Role</th>
                    <th>Communities</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        <strong>{admin.name}</strong>
                        <div style={{ color: 'var(--text-3)', fontSize: 12.5 }}>{admin.email}</div>
                      </td>
                      <td><StatusBadge value={admin.role} /></td>
                      <td style={{ color: 'var(--text-2)' }}>
                        {(admin.allowed_communities || []).map(formatValue).join(', ') || 'None'}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="small-button" onClick={() => editAdmin(admin)}>
                            Edit
                          </button>
                          {Number(admin.id) !== 1 && Number(admin.id) !== Number(currentAdmin.id) && (
                            <button
                              type="button"
                              className="small-button danger-button"
                              onClick={() => setDeleteAdminId(admin.id)}
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
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(deleteAdminId)}
        title="Delete admin"
        description="This admin will immediately lose access to the admin panel."
        confirmLabel="Delete admin"
        tone="danger"
        onConfirm={deleteAdmin}
        onCancel={() => setDeleteAdminId(null)}
      />
    </section>
  );
}
