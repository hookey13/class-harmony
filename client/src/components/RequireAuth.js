import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Component that redirects to login page if user is not authenticated
 * Wraps protected routes and provides an Outlet for nested routes
 */
export const RequireAuth = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  // If auth is still loading, show a loading spinner
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100vh'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }
  
  // If user is not logged in, redirect to login page
  if (!currentUser) {
    // Redirect to login page, but save the location they were
    // trying to access so we can send them there after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If user is logged in, render the children directly if provided,
  // otherwise render the Outlet for nested routes
  return children || <Outlet />;
};