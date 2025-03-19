import api from './api';

/**
 * Parent Authentication Service
 * Handles all API calls related to parent authentication
 */
const parentAuthService = {
  /**
   * Register a new parent account
   * @param {Object} parentData - Parent registration data
   * @returns {Promise} - Promise with registration result
   */
  register: async (parentData) => {
    try {
      const response = await api.post('/parent/auth/register', parentData);
      return response.data;
    } catch (error) {
      console.error('Error registering parent:', error);
      throw error;
    }
  },

  /**
   * Login parent
   * @param {Object} credentials - Login credentials (email, password)
   * @returns {Promise} - Promise with login result
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/parent/auth/login', credentials);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('parentToken', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error logging in parent:', error);
      throw error;
    }
  },

  /**
   * Logout parent
   * @returns {Promise} - Promise with logout result
   */
  logout: async () => {
    try {
      await api.get('/parent/auth/logout');
      
      // Remove token from localStorage
      localStorage.removeItem('parentToken');
      
      return { success: true };
    } catch (error) {
      console.error('Error logging out parent:', error);
      throw error;
    }
  },

  /**
   * Get current logged in parent
   * @returns {Promise} - Promise with current parent data
   */
  getCurrentParent: async () => {
    try {
      const response = await api.get('/parent/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current parent:', error);
      throw error;
    }
  },

  /**
   * Update parent details
   * @param {Object} parentData - Updated parent data
   * @returns {Promise} - Promise with update result
   */
  updateDetails: async (parentData) => {
    try {
      const response = await api.put('/parent/auth/updatedetails', parentData);
      return response.data;
    } catch (error) {
      console.error('Error updating parent details:', error);
      throw error;
    }
  },

  /**
   * Update password
   * @param {Object} passwordData - Password change data
   * @returns {Promise} - Promise with update result
   */
  updatePassword: async (passwordData) => {
    try {
      const response = await api.put('/parent/auth/updatepassword', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  /**
   * Request password reset
   * @param {Object} emailData - Email data for password reset
   * @returns {Promise} - Promise with reset request result
   */
  forgotPassword: async (emailData) => {
    try {
      const response = await api.post('/parent/auth/forgotpassword', emailData);
      return response.data;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },

  /**
   * Reset password
   * @param {string} resetToken - Password reset token
   * @param {Object} passwordData - New password data
   * @returns {Promise} - Promise with reset result
   */
  resetPassword: async (resetToken, passwordData) => {
    try {
      const response = await api.put(`/parent/auth/resetpassword/${resetToken}`, passwordData);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated as parent
   * @returns {boolean} - Whether user is authenticated as parent
   */
  isAuthenticated: () => {
    return localStorage.getItem('parentToken') !== null;
  }
};

export default parentAuthService; 