import axios from 'axios';

// Define the base API URL - this would be configured based on environment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with common configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global error responses (e.g., 401 Unauthorized)
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Students API
const studentsApi = {
  getAll: () => apiClient.get('/students'),
  getById: (id) => apiClient.get(`/students/${id}`),
  create: (data) => apiClient.post('/students', data),
  update: (id, data) => apiClient.put(`/students/${id}`, data),
  delete: (id) => apiClient.delete(`/students/${id}`),
  import: (formData) => apiClient.post('/students/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Classes API
const classesApi = {
  getAll: () => apiClient.get('/classes'),
  getById: (id) => apiClient.get(`/classes/${id}`),
  create: (data) => apiClient.post('/classes', data),
  update: (id, data) => apiClient.put(`/classes/${id}`, data),
  delete: (id) => apiClient.delete(`/classes/${id}`),
  getStudents: (id) => apiClient.get(`/classes/${id}/students`),
  optimize: (gradeLevel, options) => apiClient.post('/classes/optimize', { gradeLevel, options }),
  saveOptimized: (data) => apiClient.post('/classes/save-optimized', data),
};

// Teachers API
const teachersApi = {
  getAll: () => apiClient.get('/teachers'),
  getById: (id) => apiClient.get(`/teachers/${id}`),
  create: (data) => apiClient.post('/teachers', data),
  update: (id, data) => apiClient.put(`/teachers/${id}`, data),
  delete: (id) => apiClient.delete(`/teachers/${id}`),
  getSurveys: (id) => apiClient.get(`/teachers/${id}/surveys`),
};

// Surveys API
const surveysApi = {
  getAll: () => apiClient.get('/surveys'),
  getById: (id) => apiClient.get(`/surveys/${id}`),
  create: (data) => apiClient.post('/surveys', data),
  update: (id, data) => apiClient.put(`/surveys/${id}`, data),
  delete: (id) => apiClient.delete(`/surveys/${id}`),
  submit: (id, data) => apiClient.post(`/surveys/${id}/submit`, data),
};

// Parent Requests API
const placementRequestsApi = {
  getAll: () => apiClient.get('/placement-requests'),
  getById: (id) => apiClient.get(`/placement-requests/${id}`),
  create: (data) => apiClient.post('/placement-requests', data),
  update: (id, data) => apiClient.put(`/placement-requests/${id}`, data),
  delete: (id) => apiClient.delete(`/placement-requests/${id}`),
  approve: (id, data) => apiClient.post(`/placement-requests/${id}/approve`, data),
  reject: (id, data) => apiClient.post(`/placement-requests/${id}/reject`, data),
  getByParent: (parentId) => apiClient.get(`/parents/${parentId}/placement-requests`),
};

// Analytics API
const analyticsApi = {
  getClassComposition: (academicYear, grade) => 
    apiClient.get('/analytics/class-composition', { params: { academicYear, grade } }),
  getStudentDistribution: (academicYear, grade) => 
    apiClient.get('/analytics/student-distribution', { params: { academicYear, grade } }),
  getBalanceMetrics: (academicYear, grade) => 
    apiClient.get('/analytics/balance-metrics', { params: { academicYear, grade } }),
  exportPdf: (filters) => 
    apiClient.post('/analytics/export/pdf', filters, { responseType: 'blob' }),
  exportExcel: (filters) => 
    apiClient.post('/analytics/export/excel', filters, { responseType: 'blob' }),
};

// School API
const schoolsApi = {
  getAll: () => apiClient.get('/schools'),
  getById: (id) => apiClient.get(`/schools/${id}`),
  create: (data) => apiClient.post('/schools', data),
  update: (id, data) => apiClient.put(`/schools/${id}`, data),
  delete: (id) => apiClient.delete(`/schools/${id}`),
  getGradeLevels: (id) => apiClient.get(`/schools/${id}/grade-levels`),
};

// Integration API for external systems
const integrationsApi = {
  getSisSystems: () => apiClient.get('/integrations/sis'),
  configureSis: (data) => apiClient.post('/integrations/sis/configure', data),
  testSisConnection: (id) => apiClient.post(`/integrations/sis/${id}/test`),
  importFromSis: (id, filters) => apiClient.post(`/integrations/sis/${id}/import`, filters),
  getWebhooks: () => apiClient.get('/integrations/webhooks'),
  createWebhook: (data) => apiClient.post('/integrations/webhooks', data),
  updateWebhook: (id, data) => apiClient.put(`/integrations/webhooks/${id}`, data),
  deleteWebhook: (id) => apiClient.delete(`/integrations/webhooks/${id}`),
  getAvailableApis: () => apiClient.get('/integrations/available-apis'),
};

// Export all API services
const apiService = {
  students: studentsApi,
  classes: classesApi,
  teachers: teachersApi,
  surveys: surveysApi,
  placementRequests: placementRequestsApi,
  analytics: analyticsApi,
  schools: schoolsApi,
  integrations: integrationsApi,
  
  // Helper functions for common operations
  handleApiError: (error) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = error.response.data.message || `Error: ${error.response.status}`;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from server';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message;
    }
    
    return errorMessage;
  },
  
  // Download helper (for exported files)
  downloadFile: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default apiService; 