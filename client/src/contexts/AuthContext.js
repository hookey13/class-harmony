import React, { createContext, useContext, useState, useEffect } from 'react';
// Remove this import as it's causing a nested router issue
// import { Navigate, useNavigate } from 'react-router-dom';
// In a real application, you would import your actual API service
// import api from '../services/api';

// Create auth context
const AuthContext = createContext();

// Create custom hook for using auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // For demo purposes, check if user is already logged in via localStorage
  useEffect(() => {
    // Check if we have a stored user in localStorage
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUser) {
      try {
        // Parse the stored user
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('currentUser');
      }
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError('');
      
      // For demonstration purposes, check for principal credentials
      if (email === 'principal@example.com' && password === 'password123') {
        const mockUser = {
          id: 1,
          name: 'Principal User',
          email: email,
          role: 'admin',
          avatar: null
        };
        
        // Store user in localStorage for persistence
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        setCurrentUser(mockUser);
        return mockUser;
      }
      
      // Mock for other users (teacher login)
      if (email.includes('teacher')) {
        const mockUser = {
          id: 2,
          name: 'Teacher User',
          email: email,
          role: 'teacher',
          avatar: null
        };
        
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        setCurrentUser(mockUser);
        return mockUser;
      }
      
      // If credentials don't match any mock user, throw error
      throw new Error('Invalid credentials');
    } catch (err) {
      setError(err.message || 'Failed to log in');
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Remove user from localStorage
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      return true;
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError('');
      // In a real app:
      // const response = await api.post('/auth/register', userData);
      // return response.data;
      
      // Mock for development:
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
      throw err;
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setError('');
      // In a real app:
      // await api.post('/auth/reset-password', { email });
      
      // Mock for development:
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
      throw err;
    }
  };

  // Update profile function
  const updateProfile = async (userId, userData) => {
    try {
      setError('');
      // In a real app:
      // const response = await api.put(`/users/${userId}`, userData);
      // setCurrentUser({ ...currentUser, ...response.data });
      // return response.data;
      
      // Mock for development:
      return new Promise((resolve) => {
        setTimeout(() => {
          const updatedUser = { ...currentUser, ...userData };
          setCurrentUser(updatedUser);
          
          // Update the stored user
          if (localStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          }
          
          resolve(updatedUser);
        }, 1000);
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    }
  };

  // Function to check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Value to be provided to consumers
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
    resetPassword,
    updateProfile,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Remove these route components as they're now defined in App.js
// These were causing the nested Router error

/* 
export function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return children;
}

export function TeacherRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!currentUser || currentUser.role !== 'teacher') {
    return <Navigate to="/login" />;
  }
  
  return children;
}

export function ParentRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!currentUser || currentUser.role !== 'parent') {
    return <Navigate to="/login" />;
  }
  
  return children;
}

export function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
}
*/