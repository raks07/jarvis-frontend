import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'editor' | 'viewer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required and user doesn't have it, redirect to home
  if (requiredRole && user?.role !== requiredRole) {
    if (requiredRole === 'admin' && user?.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    
    if (requiredRole === 'editor' && !['admin', 'editor'].includes(user?.role ?? '')) {
      return <Navigate to="/" replace />;
    }
  }

  // If authenticated and has required role, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
