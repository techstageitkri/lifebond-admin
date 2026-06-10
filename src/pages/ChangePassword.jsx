import { useState } from 'react';
import { api } from '../api/client.js';
import { ErrorMessage, PageHeader, SuccessMessage } from '../components/ui.jsx';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.put('/admin/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Password changed successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section narrow-section">
      <PageHeader title="Change Password" description="Update your admin account credentials." />

      <form className="form-panel" style={{ display: 'grid', gap: 'var(--sp-4)' }} onSubmit={submit}>
        <ErrorMessage error={error} />
        <SuccessMessage message={message} />

        <label>
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <label>
          New password
          <input
            type="password"
            minLength="8"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <label>
          Confirm new password
          <input
            type="password"
            minLength="8"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <p className="field-hint">Password must be at least 8 characters long.</p>

        <div>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Change Password'}
          </button>
        </div>
      </form>
    </section>
  );
}
