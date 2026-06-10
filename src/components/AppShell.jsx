import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';

const ICON = {
  dashboard: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="sidebar-icon">
      <path d="M2 10.5a8.5 8.5 0 1116.95 1H11v8.45A8.5 8.5 0 012 10.5z" />
      <path d="M12.5 0A8.51 8.51 0 0120 9h-7.5V0z" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="sidebar-icon">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm8 0a3 3 0 11-6 0 3 3 0 016 0zM0 16.68A19.9 19.9 0 016 15c2 0 3.9.42 5.6 1.17A7 7 0 010 16.68zm20 0A7 7 0 0114 17c-.6 0-1.2-.06-1.77-.17A19.88 19.88 0 0120 16.68V16.68z" />
    </svg>
  ),
  photos: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="sidebar-icon">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="sidebar-icon">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  bug: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="sidebar-icon">
      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  content: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="sidebar-icon">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="sidebar-icon">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  palette: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="sidebar-icon">
      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="sidebar-icon">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  ),
};

const NAV_GROUPS = [
  {
    label: 'Operations',
    items: [
      ['/', 'Dashboard', ICON.dashboard],
      ['/users', 'Users', ICON.users],
      ['/photos', 'Photo Moderation', ICON.photos],
      ['/reports', 'Reports', ICON.reports],
      ['/problem-reports', 'Problem Reports', ICON.bug],
    ],
  },
  {
    label: 'Configuration',
    items: [
      ['/content', 'App Content', ICON.content],
      ['/settings/authentication/otp', 'Auth Settings', ICON.shield],
      ['/settings/branding', 'Branding', ICON.palette],
    ],
  },
  {
    label: 'Account',
    items: [
      ['/change-password', 'Change Password', ICON.lock],
    ],
  },
];

const flatNav = NAV_GROUPS.flatMap((g) => g.items);

export default function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const admin = JSON.parse(localStorage.getItem('lifebond_admin') || '{}');

  const pageTitle = useMemo(() => {
    const item = flatNav.find(([path]) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`)));
    return item?.[1] || 'Admin Console';
  }, [pathname]);

  const closeSidebar = () => setIsSidebarOpen(false);

  const logout = () => {
    localStorage.removeItem('lifebond_admin_token');
    localStorage.removeItem('lifebond_admin');
    setIsSidebarOpen(false);
    navigate('/login', { replace: true });
  };

  const adminName = admin.name || admin.email || 'Admin';
  const adminInitial = adminName[0].toUpperCase();

  return (
    <div className={`app-shell${isSidebarOpen ? ' sidebar-open' : ''}`}>
      <aside className="sidebar" aria-label="Main navigation">
        <div className="sidebar-inner">
          <div className="brand">
            <div className="brand-logo">LB</div>
            <div className="brand-copy">
              <h1>Lifebond</h1>
              <p>Admin Console</p>
            </div>
          </div>

          {NAV_GROUPS.map((group) => (
            <nav key={group.label} aria-label={group.label}>
              <p className="sidebar-section-label">{group.label}</p>
              <div className="sidebar-nav">
                {group.items.map(([to, label, icon]) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={closeSidebar}
                    className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                  >
                    {icon}
                    {label}
                  </NavLink>
                ))}
              </div>
            </nav>
          ))}

          <div className="sidebar-spacer" />

          <div className="sidebar-user">
            <div className="sidebar-avatar">{adminInitial}</div>
            <div className="sidebar-user-info">
              <strong>{adminName}</strong>
              <span>Administrator</span>
            </div>
            <button
              type="button"
              className="sidebar-signout"
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
            >
              {ICON.logout}
            </button>
          </div>
        </div>
      </aside>

      <div className="app-overlay" onClick={closeSidebar} role="presentation" aria-hidden="true" />

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-button"
              aria-label="Toggle navigation"
              onClick={() => setIsSidebarOpen((s) => !s)}
            >
              {ICON.menu}
            </button>
            <div className="topbar-breadcrumb">
              <p className="eyebrow">Lifebond · Admin</p>
              <p className="topbar-title">{pageTitle}</p>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-admin">
              <div className="topbar-admin-avatar">{adminInitial}</div>
              <span>{adminName}</span>
            </div>
            <button type="button" className="ghost-button small-button" onClick={logout}>
              Sign out
            </button>
          </div>
        </header>

        <Outlet />

        <footer className="app-footer">
          <p>Lifebond Admin · Enterprise Operations</p>
          <p>Secure, role-based access · © {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
}
