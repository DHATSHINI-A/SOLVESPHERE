import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role, addNotification } = useAuth();

  useEffect(() => {
    if (isAuthenticated && allowedRoles && !allowedRoles.includes(role)) {
      addNotification(
        'Role Restricted Area',
        `You are currently signed in as ${role.toUpperCase()}. To access another role portal, please Sign Out first and log in again.`,
        'warning'
      );
    }
  }, [isAuthenticated, role, allowedRoles, addNotification]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their active role's dashboard
    return <Navigate to={`/dashboard/${role}`} replace />;
  }

  return <Outlet />;
};
