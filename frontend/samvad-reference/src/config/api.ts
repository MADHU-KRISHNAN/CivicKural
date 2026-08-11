// API Configuration for Samvad Civic Connect
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  ENDPOINTS: {
    // Authentication
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    
    // Reports
    REPORTS: '/reports',
    REPORT_BY_ID: (id: string) => `/reports/${id}`,
    SUBMIT_FEEDBACK: (id: string) => `/reports/${id}/feedback`,
    
    // Staff endpoints
    STAFF_DASHBOARD: '/staff/dashboard',
    ASSIGN_REPORT: (id: string) => `/staff/reports/${id}/assign`,
    UPDATE_STATUS: (id: string) => `/staff/reports/${id}/status`,
    ADD_COMMENT: (id: string) => `/staff/reports/${id}/comment`,
  }
};

// Request headers helper
export const getAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` })
});

// For multipart/form-data (file uploads)
export const getUploadHeaders = (token?: string) => ({
  ...(token && { Authorization: `Bearer ${token}` })
  // Don't set Content-Type for FormData, let browser set it
});

export default API_CONFIG;