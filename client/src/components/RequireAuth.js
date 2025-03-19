import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component that redirects to login page if user is not authenticated
 * Wraps protected routes and provides an Outlet for nested routes
 */
export const RequireAuth = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  // If auth is still loading, show nothing (or a loading spinner)
  if (loading) {
    return null;
  }
  
  // If user is not logged in, redirect to login page
  if (!currentUser) {
    // Redirect to login page, but save the location they were
    // trying to access so we can send them there after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If user is logged in, render the child routes
  return <Outlet />;
}; 