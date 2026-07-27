import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import apiService, { User, UserRole } from '../services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiService.getCurrentUser().then((currentUser) => {
      if (isMounted) {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div className="spinner" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '14px', fontWeight: '500' }}>Verifying Access Credentials...</p>
        </div>
      </div>
    );
  }

  const token = localStorage.getItem('civickural_token') || localStorage.getItem('auth_token');

  // 1. Unauthenticated check -> Redirect to /login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2. Role authorization check
  const activeRole: UserRole = user.role || user.userType || 'citizen';

  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = allowedRoles.includes(activeRole);
    if (!isAuthorized) {
      // If citizen attempts to access admin route, redirect to /dashboard
      // If admin/staff attempts to access citizen route, redirect to /admin
      const redirectTarget = (activeRole === 'admin' || activeRole === 'staff' || activeRole === 'moderator')
        ? '/admin'
        : '/dashboard';
      return <Navigate to={redirectTarget} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
