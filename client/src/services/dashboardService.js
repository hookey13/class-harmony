import api from './api';

/**
 * Dashboard Service
 * Handles all API calls related to the dashboard data and metrics
 */
const dashboardService = {
  /**
   * Get dashboard summary statistics
   * @param {string} schoolId - ID of the school
   * @returns {Promise} - Promise with dashboard summary data
   */
  getDashboardSummary: async (schoolId) => {
    try {
      const response = await api.get(`/dashboard/summary/${schoolId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  },

  /**
   * Get optimization metrics for all class lists
   * @param {string} schoolId - ID of the school
   * @returns {Promise} - Promise with optimization metrics
   */
  getOptimizationMetrics: async (schoolId) => {
    try {
      const response = await api.get(`/dashboard/optimization-metrics/${schoolId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching optimization metrics:', error);
      throw error;
    }
  },

  /**
   * Get class balance data for visualization
   * @param {string} classListId - ID of the class list
   * @returns {Promise} - Promise with class balance data
   */
  getClassBalanceData: async (classListId) => {
    try {
      const response = await api.get(`/dashboard/class-balance/${classListId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching class balance data:', error);
      throw error;
    }
  },

  /**
   * Get parent request statistics and data
   * @param {string} schoolId - ID of the school
   * @param {Object} filters - Optional filters for the requests
   * @returns {Promise} - Promise with parent request data
   */
  getParentRequests: async (schoolId, filters = {}) => {
    try {
      const response = await api.get(`/dashboard/parent-requests/${schoolId}`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching parent requests:', error);
      throw error;
    }
  },

  /**
   * Get grade level progress data
   * @param {string} schoolId - ID of the school
   * @returns {Promise} - Promise with grade level progress data
   */
  getGradeLevelProgress: async (schoolId) => {
    try {
      const response = await api.get(`/dashboard/grade-progress/${schoolId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grade level progress:', error);
      throw error;
    }
  },

  /**
   * Get recent activity notifications
   * @param {string} schoolId - ID of the school
   * @param {number} limit - Number of notifications to retrieve
   * @returns {Promise} - Promise with notifications data
   */
  getRecentActivity: async (schoolId, limit = 5) => {
    try {
      const response = await api.get(`/dashboard/activity/${schoolId}`, { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  },

  /**
   * Get upcoming tasks for the dashboard
   * @param {string} schoolId - ID of the school
   * @param {number} limit - Number of tasks to retrieve
   * @returns {Promise} - Promise with upcoming tasks data
   */
  getUpcomingTasks: async (schoolId, limit = 3) => {
    try {
      const response = await api.get(`/dashboard/tasks/${schoolId}`, { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      throw error;
    }
  },

  /**
   * Get combined dashboard data (all metrics in one call)
   * @param {string} schoolId - ID of the school
   * @returns {Promise} - Promise with all dashboard data
   */
  getAllDashboardData: async (schoolId) => {
    try {
      const response = await api.get(`/dashboard/${schoolId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all dashboard data:', error);
      throw error;
    }
  }
};

export default dashboardService; 