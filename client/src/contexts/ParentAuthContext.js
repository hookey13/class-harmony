import React, { createContext, useState, useEffect, useContext } from 'react';
import parentAuthService from '../services/parentAuthService';

// Create context
const ParentAuthContext = createContext();

export const ParentAuthProvider = ({ children }) => {
  const [currentParent, setCurrentParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load parent from token on mount
  useEffect(() => {
    const loadParent = async () => {
      if (parentAuthService.isAuthenticated()) {
        try {
          setLoading(true);
          const response = await parentAuthService.getCurrentParent();
          setCurrentParent(response.data);
          setError(null);
        } catch (err) {
          console.error('Error loading parent:', err);
          localStorage.removeItem('parentToken');
          setCurrentParent(null);
          setError('Session expired. Please log in again.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadParent();
  }, []);

  // Register a new parent
  const register = async (parentData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await parentAuthService.register(parentData);
      return result;
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during registration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const result = await parentAuthService.login(credentials);
      
      // Get parent data
      const parentData = await parentAuthService.getCurrentParent();
      setCurrentParent(parentData.data);
      
      return result;
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await parentAuthService.logout();
      setCurrentParent(null);
      setError(null);
    } catch (err) {
      console.error('Error during logout:', err);
      // Still remove token and parent data
      localStorage.removeItem('parentToken');
      setCurrentParent(null);
    } finally {
      setLoading(false);
    }
  };

  // Update parent details
  const updateDetails = async (parentData) => {
    try {
      setLoading(true);
      const result = await parentAuthService.updateDetails(parentData);
      setCurrentParent(result.data);
      setError(null);
      return result;
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await parentAuthService.updatePassword(passwordData);
      return result;
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (emailData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await parentAuthService.forgotPassword(emailData);
      return result;
    } catch (err) {
      setError(err.response?.data?.error || 'Error requesting password reset');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (resetToken, passwordData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await parentAuthService.resetPassword(resetToken, passwordData);
      return result;
    } catch (err) {
      setError(err.response?.data?.error || 'Error resetting password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add isAuthenticated function
  const isAuthenticated = () => {
    return !!currentParent;
  };

  return (
    <ParentAuthContext.Provider
      value={{
        currentParent,
        loading,
        error,
        isAuthenticated,
        register,
        login,
        logout,
        updateDetails,
        updatePassword,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </ParentAuthContext.Provider>
  );
};

// Custom hook to use the parent auth context
export const useParentAuth = () => {
  const context = useContext(ParentAuthContext);
  if (context === undefined) {
    throw new Error('useParentAuth must be used within a ParentAuthProvider');
  }
  return context;
};

export default ParentAuthContext; 