import api from './api';

/**
 * Parent Requests Service
 * Handles all API calls related to parent placement requests
 */
const parentRequestsService = {
  /**
   * Get all requests for the logged-in parent
   * @returns {Promise} - Promise with parent requests
   */
  getMyRequests: async () => {
    try {
      const response = await api.get('/parent/requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching parent requests:', error);
      throw error;
    }
  },

  /**
   * Get a single request by ID
   * @param {string} requestId - Request ID
   * @returns {Promise} - Promise with request data
   */
  getRequest: async (requestId) => {
    try {
      const response = await api.get(`/parent/requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching request ${requestId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new parent request
   * @param {Object} requestData - Request data
   * @returns {Promise} - Promise with created request
   */
  createRequest: async (requestData) => {
    try {
      const response = await api.post('/parent/requests', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating parent request:', error);
      throw error;
    }
  },

  /**
   * Update an existing request
   * @param {string} requestId - Request ID
   * @param {Object} requestData - Updated request data
   * @returns {Promise} - Promise with updated request
   */
  updateRequest: async (requestId, requestData) => {
    try {
      const response = await api.put(`/parent/requests/${requestId}`, requestData);
      return response.data;
    } catch (error) {
      console.error(`Error updating request ${requestId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a request
   * @param {string} requestId - Request ID
   * @returns {Promise} - Promise with deletion result
   */
  deleteRequest: async (requestId) => {
    try {
      const response = await api.delete(`/parent/requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting request ${requestId}:`, error);
      throw error;
    }
  },

  /**
   * Get request type options
   * @returns {Array} - Array of request type options
   */
  getRequestTypeOptions: () => {
    return [
      { value: 'teacher_preference', label: 'Teacher Preference' },
      { value: 'student_together', label: 'Place with Student' },
      { value: 'student_separate', label: 'Separate from Student' },
      { value: 'learning_style', label: 'Learning Style' },
      { value: 'special_needs', label: 'Special Needs' },
      { value: 'other', label: 'Other' }
    ];
  },

  /**
   * Get request status options with labels and colors
   * @returns {Object} - Object with status options
   */
  getStatusOptions: () => {
    return {
      pending: { label: 'Pending', color: 'warning' },
      under_review: { label: 'Under Review', color: 'info' },
      approved: { label: 'Approved', color: 'success' },
      denied: { label: 'Denied', color: 'error' },
      fulfilled: { label: 'Fulfilled', color: 'primary' }
    };
  }
};

export default parentRequestsService; 