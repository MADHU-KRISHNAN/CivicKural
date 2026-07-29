// Shared TypeScript types for CivicKural Platform

export type IssueCategory = 
  | 'Sanitary & Public Hygiene'
  | 'Service Delivery Deficiencies'
  | 'Administrative Delays and Maladministration'
  | 'Abuse of Power or Corruption'
  | 'Systemic and Policy Issues';

export type IssueStatus = 'Reported' | 'In Progress' | 'Resolved' | 'Rejected';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type UserRole = 'citizen' | 'staff' | 'admin' | 'moderator';

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
  isActive?: boolean;
  lastLogin?: string;
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
  photos?: Array<{
    filename: string;
    originalName?: string;
    url: string;
  }>;
  citizenId: string;
  citizenName?: string;
  assignedStaffId?: string;
  assignedDepartment?: string;
  adminNotes?: string;
  resolutionDetails?: string;
  comments?: IssueComment[];
  priorityScore?: number;
  trustScore?: number;
  trustTier?: 'HIGH_INTEGRITY' | 'STANDARD' | 'LOW_TRUST_SPAM';
  trustPillarBreakdown?: {
    exifScore: number;
    geoScore: number;
    reputationScore: number;
    consistencyScore: number;
  };
  tier1?: string;
  tier2?: string;
  tier3?: string;
  isDuplicate?: boolean;
  masterTicketId?: string;
  intentGuardrailTriggered?: boolean;
  primaryIntent?: string;
  aiSuggestions?: {
    suggestedCategory?: string;
    suggestedPriority?: PriorityLevel;
    confidence?: number;
    urgencyScore?: number;
    sentimentScore?: number;
    summary?: string;
    intentGuardrailTriggered?: boolean;
    primaryIntent?: string;
    processedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  category?: IssueCategory;
  audioTranscript?: string;
  priority?: PriorityLevel;
  latitude: number;
  longitude: number;
  address?: string;
  photo?: File | string;
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  category?: IssueCategory;
  priority?: PriorityLevel;
  status?: IssueStatus;
  adminNotes?: string;
  assignedDepartment?: string;
  assignedStaffId?: string;
  resolutionDetails?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  userType?: UserRole;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  reports?: T;
  users?: T;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
  count?: number;
  total?: number;
  pages?: number;
  currentPage?: number;
}