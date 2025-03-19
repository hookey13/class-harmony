/**
 * API utility module that re-exports the API service from the services directory
 * This is used for backward compatibility with components that import from '../utils/api'
 */

import api from '../services/api';

export default api; 