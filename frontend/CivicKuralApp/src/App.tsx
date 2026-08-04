import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginScreen from './screens/LoginScreen';
import UserDashboardPage from './pages/UserDashboardPage';
import ReportIssuePage from './pages/ReportIssuePage';
import CommunityIssuesPage from './pages/CommunityIssuesPage';
import IssueDetailPage from './pages/IssueDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminIssuesPage from './pages/admin/AdminIssuesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import StaffTasksPage from './pages/StaffTasksPage';
import ProtectedRoute from './components/ProtectedRoute';

import apiService, { User } from './services/api';

function HeaderNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiService.getCurrentUser().then((u) => {
      if (isMounted) setUser(u);
    });
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await apiService.logout();
    setUser(null);
    navigate('/login');
  };

  // Hide header on login page
  if (location.pathname === '/login') {
    return null;
  }

  const role = user?.role || user?.userType || 'citizen';
  const isAdmin = role === 'admin' || role === 'moderator';
  const isStaff = role === 'staff';

  return (
    <>
      {/* Top Header Navbar for Desktop/Laptop */}
      <header className="desktop-navbar">
        <NavLink to={(isAdmin || isStaff) ? '/admin' : '/'} className="brand-logo">
          <span style={{ fontSize: '1.5rem' }}>🏛️</span>
          <span className="brand-title">CivicKural</span>
          <span className="brand-badge">AI Platform</span>
        </NavLink>

        <nav className="desktop-nav-links">
          {(!isAdmin && !isStaff) ? (
            <>
              <NavLink
                to="/"
                className={({ isActive }) => `desktop-nav-item ${isActive ? 'active' : ''}`}
              >
                <span>🏠</span>
                <span>Home</span>
              </NavLink>

              <NavLink
                to="/issues"
                className={({ isActive }) => `desktop-nav-item ${isActive ? 'active' : ''}`}
              >
                <span>🌐</span>
                <span>My Grievances</span>
              </NavLink>

              <NavLink
                to="/report"
                className={({ isActive }) => `desktop-nav-item ${isActive ? 'active' : ''}`}
              >
                <span>📢</span>
                <span>Report Issue</span>
              </NavLink>

              {user && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `desktop-nav-item ${isActive ? 'active' : ''}`}
                >
                  <span>📊</span>
                  <span>My Portal</span>
                </NavLink>
              )}
            </>
          ) : isAdmin ? (
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => `desktop-nav-item ${isActive ? 'active' : ''}`}
              >
                <span>🛡️</span>
                <span>Admin Panel</span>
              </NavLink>

              <NavLink
                to="/admin/issues"
                className={({ isActive }) => `desktop-nav-item ${isActive ? 'active' : ''}`}
              >
                <span>📋</span>
                <span>Triage & Dispatch</span>
              </NavLink>

              <NavLink
                to="/admin/users"
                className={({ isActive }) => `desktop-nav-item ${isActive ? 'active' : ''}`}
              >
                <span>👥</span>
                <span>User Roles</span>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/staff"
                className={({ isActive }) => `desktop-nav-item ${isActive ? 'active' : ''}`}
              >
                <span>📋</span>
                <span>Staff Portal</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="user-profile-summary">
          {user ? (
            <>
              {(isAdmin || isStaff) && (
                <span className="admin-nav-indicator">
                  {role}
                </span>
              )}
              <NavLink to="/profile" style={{ textDecoration: 'none', color: 'var(--color-slate-300)', fontWeight: '600' }}>
                👤 {user.name || user.email}
              </NavLink>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              Sign In
            </NavLink>
          )}
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      <nav className="mobile-navbar">
        {(!isAdmin && !isStaff) ? (
          <>
            <NavLink to="/" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
              <span style={{ fontSize: '1.2rem' }}>🏠</span>
              <span>Home</span>
            </NavLink>

            <NavLink to="/issues" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
              <span style={{ fontSize: '1.2rem' }}>🌐</span>
              <span>Explorer</span>
            </NavLink>

            <NavLink to="/report" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
              <span style={{ fontSize: '1.2rem' }}>📢</span>
              <span>Report</span>
            </NavLink>

            <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
              <span style={{ fontSize: '1.2rem' }}>📊</span>
              <span>Portal</span>
            </NavLink>
          </>
        ) : isAdmin ? (
          <>
            <NavLink to="/admin" end className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
              <span style={{ fontSize: '1.2rem' }}>🛡️</span>
              <span>Admin</span>
            </NavLink>

            <NavLink to="/admin/issues" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
              <span style={{ fontSize: '1.2rem' }}>📋</span>
              <span>Triage</span>
            </NavLink>

            <NavLink to="/admin/users" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
              <span style={{ fontSize: '1.2rem' }}>👥</span>
              <span>Users</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/staff" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
              <span style={{ fontSize: '1.2rem' }}>📋</span>
              <span>Tasks</span>
            </NavLink>
          </>
        )}
      </nav>
    </>
  );
}

function MainLayout() {
  return (
    <div className="app-container">
      <HeaderNavigation />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/issues" element={<CommunityIssuesPage />} />

          {/* Protected Citizen & Shared Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'admin', 'staff', 'moderator']}>
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'admin', 'staff', 'moderator']}>
                <ReportIssuePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'admin', 'staff', 'moderator']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issues/:id"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'admin', 'staff', 'moderator']}>
                <IssueDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin & Staff Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'moderator']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/issues"
            element={
              <ProtectedRoute allowedRoles={['admin', 'moderator']}>
                <AdminIssuesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin', 'moderator']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffTasksPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

export default App;
