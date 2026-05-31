import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, dataOf } from '../api/client.js';
import { ErrorMessage } from '../components/ui.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = dataOf(await api.post('/admin/login', { email, password }));
      localStorage.setItem('lifebond_admin_token', data.token);
      localStorage.setItem('lifebond_admin', JSON.stringify(data.admin));
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand login-brand">
          <div className="brand-mark">LB</div>
          <div>
            <h1>Lifebond</h1>
            <p>Admin Login</p>
          </div>
        </div>
        <ErrorMessage error={error} />
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="primary-button" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
      </form>
    </div>
  );
}
