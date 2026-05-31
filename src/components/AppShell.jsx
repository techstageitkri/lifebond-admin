import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const navItems = [
  ['/', 'Dashboard'],
  ['/users', 'Users'],
  ['/photos', 'Photos'],
  ['/reports', 'Reports'],
  ['/change-password', 'Password'],
];

export default function AppShell() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('lifebond_admin') || '{}');

  const logout = () => {
    localStorage.removeItem('lifebond_admin_token');
    localStorage.removeItem('lifebond_admin');
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">LB</div>
          <div>
            <h1>Lifebond</h1>
            <p>Admin Panel</p>
          </div>
        </div>
        <nav>
          {navItems.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Matrimony Operations</p>
            <h2>Admin Console</h2>
          </div>
          <div className="admin-actions">
            <span>{admin.name || admin.email || 'Admin'}</span>
            <button className="ghost-button" onClick={logout}>Logout</button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
