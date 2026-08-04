import offlineStorage from './offlineStorage';

// Backend URL (runs on port 5000 according to backend server config)
const BASE_URL = 'http://localhost:5000/api';

export type IssueCategory =
  | 'Sanitary & Public Hygiene'
  | 'Service Delivery Deficiencies'
  | 'Administrative Delays and Maladministration'
  | 'Abuse of Power or Corruption'
  | 'Systemic and Policy Issues';

export type IssueStatus = 'Reported' | 'In Progress' | 'Pending Verification' | 'Resolved' | 'Rejected';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type UserRole = 'citizen' | 'staff' | 'admin' | 'moderator';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  reports?: T;
  report?: T;
  users?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  phone: string;
  role?: UserRole;
  userType?: UserRole;
  department?: string;
  staffId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueComment {
  id: string;
  _id?: string;
  authorName: string;
  authorType: UserRole;
  comment: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  _id?: string;
  reportId?: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: PriorityLevel;
  upvotes: number;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photoUrl?: string;
  citizenId: string;
  citizenName?: string;
  assignedDepartment?: string;
  adminNotes?: string;
  comments?: IssueComment[];
  priorityScore?: number;
  trustScore?: number;
  multiCitizenConfirmations?: number;
  tier1?: string;
  tier2?: string;
  tier3?: string;
  isDuplicate?: boolean;
  masterTicketId?: string;
  aiSuggestions?: {
    suggestedCategory?: string;
    suggestedPriority?: PriorityLevel;
    confidence?: number;
    urgencyScore?: number;
    sentimentScore?: number;
    summary?: string;
    processedAt?: string;
  };
  resolutionProof?: {
    photoUrl?: string;
    notes?: string;
    submittedAt?: string;
    submittedBy?: string;
  };
  verificationDetails?: {
    verifiedAt?: string;
    verifiedBy?: string;
    status?: 'Pending' | 'Verified' | 'Rejected';
    comments?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedAt?: string;
}

function normalizeStatus(s: string): IssueStatus {
  if (s === 'In Progress' || s === 'Pending Verification' || s === 'Resolved' || s === 'Rejected' || s === 'Reported') return s as IssueStatus;
  if (s === 'Submitted' || s === 'Assigned') return 'Reported';
  if (s === 'Closed') return 'Resolved';
  return 'Reported';
}

function normalizePriority(p: any): PriorityLevel {
  if (p === 'Critical' || p === 'High' || p === 'Medium' || p === 'Low') return p as PriorityLevel;
  if (p === 5) return 'Critical';
  if (p === 4 || p === 3) return 'High';
  if (p === 2) return 'Medium';
  return 'Low';
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errData.message || `HTTP error ${response.status}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Network error or server unavailable:', error);
      return {
        success: false,
        error: 'Network error or server unavailable'
      };
    }
  }

  // Authentication
  async login(email: string, userType: UserRole = 'citizen', password?: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.makeRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: password || 'password123', userType, role: userType }),
    });

    if (response.success && (response.data || (response as any).user)) {
      const authUser = response.data?.user || (response as any).user;
      const authToken = response.data?.token || (response as any).token;
      
      const normalizedUser: User = {
        ...authUser,
        id: authUser.id || authUser._id,
        phone: authUser.phone || '',
        userType: authUser.userType || authUser.role || userType,
        role: authUser.role || authUser.userType || userType,
        createdAt: authUser.createdAt || new Date().toISOString(),
        updatedAt: authUser.updatedAt || new Date().toISOString(),
      };

      localStorage.setItem('civickural_token', authToken);
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('civickural_user', JSON.stringify(normalizedUser));
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      return {
        success: true,
        data: { user: normalizedUser, token: authToken }
      };
    }

    return {
      success: false,
      error: response.error || 'Login failed'
    };
  }

  async register(registerData: {
    name: string;
    email: string;
    password?: string;
    role?: UserRole;
    userType?: UserRole;
    phone?: string;
    department?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const roleToUse = registerData.role || registerData.userType || 'citizen';
    const response = await this.makeRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password || 'password123',
        role: roleToUse,
        phone: registerData.phone || '+91 9876543210',
        department: registerData.department,
      }),
    });

    if (response.success && (response.data || (response as any).user)) {
      const authUser = response.data?.user || (response as any).user;
      const authToken = response.data?.token || (response as any).token;

      const normalizedUser: User = {
        ...authUser,
        id: authUser.id || authUser._id,
        phone: authUser.phone || registerData.phone || '',
        userType: authUser.userType || authUser.role || roleToUse,
        role: authUser.role || authUser.userType || roleToUse,
        createdAt: authUser.createdAt || new Date().toISOString(),
        updatedAt: authUser.updatedAt || new Date().toISOString(),
      };

      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('samvad_user', JSON.stringify(normalizedUser));
      return {
        success: true,
        data: { user: normalizedUser, token: authToken },
      };
    }

    return {
      success: false,
      error: response.error || 'Registration failed'
    };
  }

  async logout(): Promise<void> {
    localStorage.removeItem('civickural_token');
    localStorage.removeItem('civickural_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('samvad_user');
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = localStorage.getItem('civickural_user') || localStorage.getItem('user') || localStorage.getItem('samvad_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Issues API
  async getIssues(userId?: string, userType?: string): Promise<ApiResponse<Issue[]>> {
    // Attempt auto-sync of offline queue
    if (typeof window !== 'undefined' && navigator.onLine) {
      offlineStorage.syncOfflineReports();
    }

    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (userType) params.append('userType', userType);
    
    const response = await this.makeRequest<any>(`/reports?${params.toString()}`);
    if (response.success && (response.reports || response.data)) {
      const rawList = response.reports || response.data;
      const issues: Issue[] = rawList.map((r: any) => ({
        id: r.id || r._id || r.reportId,
        reportId: r.reportId,
        title: r.title,
        description: r.description,
        category: r.category,
        status: normalizeStatus(r.status),
        priority: normalizePriority(r.priority),
        priorityScore: r.priorityScore || (r.priority === 'Critical' ? 85 : r.priority === 'High' ? 65 : 45),
        trustScore: r.trustScore || 0.95,
        tier1: r.tier1 || 'Public Infrastructure',
        tier2: r.tier2 || r.assignedDepartment || 'Sanitation Board',
        tier3: r.tier3 || r.category,
        isDuplicate: r.isDuplicate || false,
        masterTicketId: r.masterTicketId,
        upvotes: r.upvotes || 0,
        location: {
          latitude: r.latitude || (r.location?.coordinates ? r.location.coordinates[1] : 0),
          longitude: r.longitude || (r.location?.coordinates ? r.location.coordinates[0] : 0),
          address: r.location?.address || r.address || '',
        },
        photoUrl: r.photos && r.photos.length > 0 ? r.photos[0].url : r.photoUrl,
        citizenId: typeof r.citizenId === 'object' ? (r.citizenId._id || r.citizenId.id) : r.citizenId,
        citizenName: typeof r.citizenId === 'object' ? r.citizenId.name : (r.citizenName || 'Citizen User'),
        assignedDepartment: r.assignedDepartment || r.assignedStaffId?.department || r.tier2,
        adminNotes: r.adminNotes || r.resolutionDetails,
        comments: (r.staffComments || []).map((c: any) => ({
          id: c._id || c.id,
          authorName: c.staffId?.name || 'Staff Member',
          authorType: 'staff',
          comment: c.comment,
          createdAt: c.createdAt
        })),
        aiSuggestions: r.aiSuggestions,
        resolutionProof: r.resolutionProof,
        verificationDetails: r.verificationDetails,
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
        resolvedAt: r.resolvedAt,
        assignedAt: r.assignedAt
      }));
      
      if (userId) {
         const filtered = issues.filter(i => i.citizenId === userId);
         return { success: true, data: filtered, reports: filtered };
      }
      return { success: true, data: issues, reports: issues };
    }

    return { success: false, error: response.error || 'Failed to load issues', data: [] };
  }

  async getIssueById(issueId: string): Promise<ApiResponse<Issue>> {
    const response = await this.makeRequest<any>(`/reports/${issueId}`);
    if (response.success && (response.report || response.data)) {
        const r = response.report || response.data;
        const issue: Issue = {
            id: r.id || r._id || r.reportId,
            reportId: r.reportId,
            title: r.title,
            description: r.description,
            category: r.category,
            status: normalizeStatus(r.status),
            priority: normalizePriority(r.priority),
            priorityScore: r.priorityScore || (r.priority === 'Critical' ? 85 : r.priority === 'High' ? 65 : 45),
            trustScore: r.trustScore || 0.95,
            tier1: r.tier1 || 'Public Infrastructure',
            tier2: r.tier2 || r.assignedDepartment || 'Sanitation Board',
            tier3: r.tier3 || r.category,
            isDuplicate: r.isDuplicate || false,
            masterTicketId: r.masterTicketId,
            upvotes: r.upvotes || 0,
            location: {
              latitude: r.latitude || (r.location?.coordinates ? r.location.coordinates[1] : 0),
              longitude: r.longitude || (r.location?.coordinates ? r.location.coordinates[0] : 0),
              address: r.location?.address || r.address || '',
            },
            photoUrl: r.photos && r.photos.length > 0 ? r.photos[0].url : r.photoUrl,
            citizenId: typeof r.citizenId === 'object' ? (r.citizenId._id || r.citizenId.id) : r.citizenId,
            citizenName: typeof r.citizenId === 'object' ? r.citizenId.name : (r.citizenName || 'Citizen User'),
            assignedDepartment: r.assignedDepartment || r.assignedStaffId?.department || r.tier2,
            adminNotes: r.adminNotes || r.resolutionDetails,
            comments: (r.staffComments || []).map((c: any) => ({
              id: c._id || c.id,
              authorName: c.staffId?.name || 'Staff Member',
              authorType: 'staff',
              comment: c.comment,
              createdAt: c.createdAt
            })),
            aiSuggestions: r.aiSuggestions,
            resolutionProof: r.resolutionProof,
            verificationDetails: r.verificationDetails,
            createdAt: r.createdAt || new Date().toISOString(),
            updatedAt: r.updatedAt || new Date().toISOString(),
            resolvedAt: r.resolvedAt
        }
        return { success: true, data: issue };
    }
    return { success: false, error: response.error || 'Issue not found' };
  }

  async createIssue(issueData: {
    title: string;
    description: string;
    category: IssueCategory;
    latitude: number;
    longitude: number;
    address?: string;
    photoUrl?: string;
    citizenId: string;
  }): Promise<ApiResponse<Issue>> {
    const response = await this.makeRequest<Issue>('/reports', {
      method: 'POST',
      body: JSON.stringify({
        title: issueData.title,
        description: issueData.description,
        category: issueData.category,
        priority: issueData.category === 'Abuse of Power or Corruption' ? 'Critical' : 'Medium',
        longitude: issueData.longitude,
        latitude: issueData.latitude,
        address: issueData.address
      }),
    });

    if (response.success && (response.data || (response as any).report)) {
      const r = response.data || (response as any).report;
      const createdIssue: Issue = {
        id: r.id || r._id || r.reportId,
        title: r.title,
        description: r.description,
        category: r.category,
        status: normalizeStatus(r.status),
        priority: normalizePriority(r.priority),
        priorityScore: r.priorityScore || 75,
        trustScore: r.trustScore || 0.95,
        tier1: r.tier1 || 'Public Infrastructure',
        tier2: r.tier2 || 'Sanitation Board',
        tier3: r.tier3 || r.category,
        isDuplicate: r.isDuplicate || false,
        masterTicketId: r.masterTicketId,
        upvotes: r.upvotes || 0,
        location: {
          latitude: r.latitude || issueData.latitude,
          longitude: r.longitude || issueData.longitude,
          address: r.address || issueData.address
        },
        photoUrl: issueData.photoUrl,
        citizenId: issueData.citizenId,
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString()
      };
      return { success: true, data: createdIssue };
    }

    return {
      success: false,
      error: response.error || 'Issue reporting failed'
    };
  }

  async updateIssueStatus(
    issueId: string,
    status: IssueStatus,
    adminNotes?: string,
    assignedDepartment?: string,
    priority?: PriorityLevel
  ): Promise<ApiResponse<Issue>> {
    const response = await this.makeRequest<any>(`/reports/${issueId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes: adminNotes, department: assignedDepartment, priority }),
    });

    if (response.success && (response.report || response.data)) {
        const r = response.report || response.data;
        // Transform
        const issue: Issue = {
            id: r._id || r.id,
            title: r.title,
            description: r.description,
            category: r.category as IssueCategory,
            priority: r.priority as PriorityLevel,
            status: normalizeStatus(r.status),
            location: {
              address: r.location?.address || '',
              latitude: r.location?.coordinates?.[1] || 0,
              longitude: r.location?.coordinates?.[0] || 0
            },
            photoUrl: r.photos?.[0]?.url,
            citizenName: r.citizenId?.name || 'Citizen',
            citizenId: r.citizenId?._id || r.citizenId,
            upvotes: r.upvotes || 0,
            assignedDepartment: r.tier2 || r.assignedDepartment || r.assignedStaffId?.department,
            adminNotes: r.adminNotes || r.resolutionDetails,
            trustScore: r.trustScore,
            multiCitizenConfirmations: r.multiCitizenConfirmations,
            tier1: r.tier1,
            tier2: r.tier2,
            tier3: r.tier3,
            priorityScore: r.priorityScore,
            isDuplicate: r.isDuplicate,
            comments: (r.staffComments || []).map((c: any) => ({
              id: c._id || c.id,
              authorName: c.staffId?.name || 'Staff Member',
              authorType: 'staff',
              comment: c.comment,
              createdAt: c.createdAt
            })),
            aiSuggestions: r.aiSuggestions,
            resolutionProof: r.resolutionProof,
            verificationDetails: r.verificationDetails,
            createdAt: r.createdAt || new Date().toISOString(),
            updatedAt: r.updatedAt || new Date().toISOString(),
            resolvedAt: r.resolvedAt
        }
        return { success: true, data: issue };
    }
    return { success: false, error: response.error || 'Failed to update status' };
  }

  async upvoteIssue(issueId: string): Promise<ApiResponse<Issue>> {
     // In a real implementation this would hit an upvote endpoint
    return { success: false, error: 'Not implemented on backend yet' };
  }

  async addComment(issueId: string, commentText: string): Promise<ApiResponse<Issue>> {
     // In a real implementation this would map to POST /reports/:id/comments
    return { success: false, error: 'Not implemented on backend yet' };
  }

  async submitResolutionProof(issueId: string, proofData: { photo?: File; notes?: string }): Promise<ApiResponse<Issue>> {
    try {
      const token = await this.getAuthToken();
      const formData = new FormData();
      if (proofData.notes) formData.append('notes', proofData.notes);
      if (proofData.photo) formData.append('images', proofData.photo); // Using 'images' as backend uses upload.array('images', 3)

      const response = await fetch(`${BASE_URL}/reports/${issueId}/submit-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        return { success: false, error: errData.message || `HTTP error ${response.status}` };
      }

      const data = await response.json();
      return { success: true, data: data.report }; // We would ideally normalize this
    } catch (error) {
       console.error('Network error:', error);
       return { success: false, error: 'Network error or server unavailable' };
    }
  }

  async verifyResolution(issueId: string, status: 'Verified' | 'Rejected', comments?: string): Promise<ApiResponse<Issue>> {
    const response = await this.makeRequest<any>(`/reports/${issueId}/verify-resolution`, {
      method: 'POST',
      body: JSON.stringify({ status, comments }),
    });

    if (response.success && (response.report || response.data)) {
        return { success: true, data: response.report || response.data }; // Again, ideally normalized
    }
    return { success: false, error: response.error || 'Verification failed' };
  }

  // Users API for Admin Panel
  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await this.makeRequest<User[]>('/auth/users');
    if (response.success && (response.users || response.data)) {
      const usersList = ((response as any).users || response.data) as User[];
      const normalizedUsers = usersList.map(u => ({
        ...u,
        id: u.id || (u as any)._id,
        phone: u.phone || '',
        userType: u.userType || u.role || 'citizen',
        role: u.role || u.userType || 'citizen',
        createdAt: u.createdAt || new Date().toISOString(),
        updatedAt: u.updatedAt || new Date().toISOString()
      }));
      return { success: true, data: normalizedUsers, users: normalizedUsers };
    }

    return { success: false, error: 'Failed to load users' };
  }
}

export default new ApiService();
