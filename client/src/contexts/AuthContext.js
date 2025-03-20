import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Check for existing user on mount
  useEffect(() => {
    try {
      // Check localStorage for existing user
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error('Error loading user from storage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function - simplified for demo
  const login = async (email, password) => {
    try {
      // Demo login for principal
      if (email === 'principal@example.com' && password === 'password123') {
        const user = {
          id: 1,
          name: 'Principal User',
          email: email,
          role: 'admin'
        };
        
        // Save user to state and localStorage
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }
      
      throw new Error('Invalid credentials');
    } catch (err) {
      setError('Login failed: ' + (err.message || 'Unknown error'));
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}