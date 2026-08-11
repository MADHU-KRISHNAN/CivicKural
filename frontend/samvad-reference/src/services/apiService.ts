import { API_CONFIG, getAuthHeaders, getUploadHeaders } from '../config/api';

export class ApiService {
  private baseUrl = API_CONFIG.BASE_URL;
  private isBackendAvailable = false;
  
  constructor() {
    // Test connection on startup
    this.testConnection();
  }
  
  // Test backend connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`, {
        method: 'GET',
        timeout: 3000
      } as any);
      this.isBackendAvailable = response.ok;
      return response.ok;
    } catch {
      this.isBackendAvailable = false;
      return false;
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
    }
    
    return data;
  }

  async register(userData: any) {
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    const data = await response.json();
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
    }
    
    return data;
  }

  // Reports methods
  async getReports(filters?: any) {
    const token = localStorage.getItem('authToken');
    const queryString = filters ? new URLSearchParams(filters).toString() : '';
    
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.REPORTS}?${queryString}`, {
      headers: getAuthHeaders(token || undefined)
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    
    return response.json();
  }

  async createReport(reportData: FormData) {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.REPORTS}`, {
      method: 'POST',
      headers: getUploadHeaders(token || undefined),
      body: reportData
    });
    
    if (!response.ok) {
      throw new Error('Failed to create report');
    }
    
    return response.json();
  }

  // Helper methods
  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

export const apiService = new ApiService();