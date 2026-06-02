import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import UserDetails from './pages/UserDetails.jsx';
import Photos from './pages/Photos.jsx';
import Reports from './pages/Reports.jsx';
import ProblemReports from './pages/ProblemReports.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import Content from './pages/Content.jsx';
import AuthSettings from './pages/AuthSettings.jsx';

const isAuthed = () => Boolean(localStorage.getItem('lifebond_admin_token'));

function ProtectedRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="photos" element={<Photos />} />
        <Route path="reports" element={<Reports />} />
        <Route path="problem-reports" element={<ProblemReports />} />
        <Route path="change-password" element={<ChangePassword />} />
        <Route path="content" element={<Content />} />
        <Route path="settings/authentication/otp" element={<AuthSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
