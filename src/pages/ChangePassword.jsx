import { useState } from 'react';
import { api } from '../api/client.js';
import { ErrorMessage, PageHeader } from '../components/ui.jsx';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
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
      setMessage('Password changed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section narrow-section">
      <PageHeader title="Change Password" description="Update the current admin account password." />
      <form className="form-panel" onSubmit={submit}>
        <ErrorMessage error={error} />
        {message && <div className="success-message">{message}</div>}
        <label>
          Current password
          <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
        </label>
        <label>
          New password
          <input type="password" minLength="8" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
        </label>
        <label>
          Confirm new password
          <input type="password" minLength="8" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
        </label>
        <button className="primary-button" disabled={loading}>{loading ? 'Saving...' : 'Change Password'}</button>
      </form>
    </section>
  );
}
