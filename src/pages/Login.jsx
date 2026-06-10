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
      <div className="login-shell">
        <div className="login-hero">
          <div className="login-hero-badge">
            <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Lifebond Admin
          </div>
          <h1>Secure Operations Console</h1>
          <p>
            Role-aware administration for profiles, moderation, reports, and platform configuration.
          </p>
          <div className="login-stats">
            <div className="login-stat">
              <span>Platform</span>
              <strong>Live</strong>
            </div>
            <div className="login-stat">
              <span>Access</span>
              <strong>Role-based</strong>
            </div>
            <div className="login-stat">
              <span>API</span>
              <strong>Secured</strong>
            </div>
          </div>
        </div>

        <form className="login-form-card" onSubmit={submit} noValidate>
          <div className="login-form-brand">
            <div className="login-form-brand-logo">LB</div>
            <div className="login-form-brand-copy">
              <h2>Welcome back</h2>
              <p>Sign in to your admin account</p>
            </div>
          </div>

          <ErrorMessage error={error} />

          <div className="login-fields">
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lifebond.app"
                required
                autoComplete="email"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={loading} style={{ width: '100%', height: 44, fontSize: 15 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="field-hint" style={{ textAlign: 'center' }}>
            Use credentials provisioned by your organization.
          </p>
        </form>
      </div>
    </div>
  );
}
