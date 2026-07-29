import offlineStorage from './offlineStorage';

// Backend URL (runs on port 5000 according to backend server config)
const BASE_URL = 'http://localhost:5000/api';

export type IssueCategory =
  | 'Sanitary & Public Hygiene'
  | 'Service Delivery Deficiencies'
  | 'Administrative Delays and Maladministration'
  | 'Abuse of Power or Corruption'
  | 'Systemic and Policy Issues';

export type IssueStatus = 'Reported' | 'In Progress' | 'Resolved' | 'Rejected';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type UserRole = 'citizen' | 'staff' | 'admin' | 'moderator';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  reports?: T;
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
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

function normalizeStatus(s: string): IssueStatus {
  if (s === 'In Progress' || s === 'Resolved' || s === 'Rejected' || s === 'Reported') return s as IssueStatus;
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

// Initial mock issues for offline/demo fallback using the exact 5 mandated categories
const INITIAL_DEMO_ISSUES: Issue[] = [
  {
    id: 'issue-101',
    title: 'Overflowing Municipal Garbage Dump near Sector 12 Market',
    description: 'Uncollected waste accumulation creating health hazards and foul odor for residents and local shop owners.',
    category: 'Sanitary & Public Hygiene',
    status: 'In Progress',
    priority: 'High',
    priorityScore: 78.5,
    trustScore: 0.95,
    tier1: 'Public Health & Sanitation',
    tier2: 'Sanitation Board',
    tier3: 'Garbage & Solid Waste Dump',
    upvotes: 42,
    location: { latitude: 28.6139, longitude: 77.2090, address: 'Sector 12 Market Square, New Delhi' },
    citizenId: 'user-1',
    citizenName: 'Aarav Sharma',
    assignedDepartment: 'Sanitation Board',
    adminNotes: 'Special cleanup squad deployed. Container replacement in progress.',
    comments: [
      { id: 'c1', authorName: 'Municipal Health Inspector', authorType: 'admin', comment: 'Inspection done. Sanitation truck dispatched.', createdAt: new Date(Date.now() - 43200000).toISOString() },
      { id: 'c2', authorName: 'Priya Verma', authorType: 'citizen', comment: 'Hoping this gets cleared soon, thank you!', createdAt: new Date(Date.now() - 21600000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'issue-102',
    title: 'Delayed Birth Certificate Issuance at Zone 4 Zonal Office',
    description: 'Application submitted 45 days ago with complete documentation, yet status remains unverified without explanation.',
    category: 'Administrative Delays and Maladministration',
    status: 'Reported',
    priority: 'Medium',
    priorityScore: 48.0,
    trustScore: 0.90,
    tier1: 'Governance & Administration',
    tier2: 'Public Relations & Grievance Cell',
    tier3: 'Certificate Clearance Stalls',
    upvotes: 18,
    location: { latitude: 28.6145, longitude: 77.2095, address: 'Zonal Office, Zone 4, Civil Lines' },
    citizenId: 'user-1',
    citizenName: 'Aarav Sharma',
    assignedDepartment: 'Public Relations & Grievance Cell',
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'issue-103',
    title: 'Unannounced Water Supply Cut in Dwarka Sector 7',
    description: 'Pipeline maintenance started without prior notice. Water supply interrupted for over 24 hours.',
    category: 'Service Delivery Deficiencies',
    status: 'In Progress',
    priority: 'Critical',
    priorityScore: 89.2,
    trustScore: 0.98,
    tier1: 'Infrastructure & Utilities',
    tier2: 'Jal Board & Utility Services',
    tier3: 'Water Supply Outage',
    upvotes: 89,
    location: { latitude: 28.5823, longitude: 77.0500, address: 'Dwarka Sector 7 Block B, New Delhi' },
    citizenId: 'user-2',
    citizenName: 'Neha Patel',
    assignedDepartment: 'Jal Board & Utility Services',
    adminNotes: 'Water tankers dispatched. Main pipeline repair estimated 4 hrs.',
    comments: [
      { id: 'c3', authorName: 'Duty Engineer', authorType: 'admin', comment: 'Temporary water tankers sent to Block B & C.', createdAt: new Date(Date.now() - 10800000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'issue-104',
    title: 'Demanding Bribe for Commercial License Clearance',
    description: 'Local inspector requesting unauthorized cash payments for routine trade license verification.',
    category: 'Abuse of Power or Corruption',
    status: 'Reported',
    priority: 'Critical',
    priorityScore: 92.0,
    trustScore: 0.95,
    tier1: 'Governance & Transparency',
    tier2: 'Vigilance & Anti-Corruption Bureau',
    tier3: 'Bribery & Abuse of Authority',
    upvotes: 134,
    location: { latitude: 28.6328, longitude: 77.2197, address: 'Municipal Licensing Branch, Connaught Place' },
    citizenId: 'user-3',
    citizenName: 'Vikram Singh',
    assignedDepartment: 'Vigilance & Anti-Corruption Bureau',
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'issue-105',
    title: 'Lack of Accessible Ramps in Public Government Buildings',
    description: 'No wheelchair ramps or tactile paving in key civic offices, violating national accessibility standards.',
    category: 'Systemic and Policy Issues',
    status: 'Resolved',
    priority: 'Medium',
    priorityScore: 54.0,
    trustScore: 0.85,
    tier1: 'Infrastructure & Policy',
    tier2: 'Public Works Dept (PWD)',
    tier3: 'Accessibility Hazards',
    upvotes: 65,
    location: { latitude: 28.6129, longitude: 77.2295, address: 'District Secretariat, New Delhi' },
    citizenId: 'user-4',
    citizenName: 'Rohan Gupta',
    assignedDepartment: 'Public Works Dept (PWD)',
    adminNotes: 'Ramps installed at main entrance and elevator wing.',
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    resolvedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'issue-106',
    title: 'Hazardous Potholes on MG Road Arterial Route',
    description: 'Deep potholes causing daily accidents and severe traffic slowdowns. Needs urgent road re-laying.',
    category: 'Service Delivery Deficiencies',
    status: 'Reported',
    priority: 'High',
    priorityScore: 72.0,
    trustScore: 0.88,
    tier1: 'Infrastructure',
    tier2: 'Roads & Highways Dept',
    tier3: 'Road Maintenance',
    upvotes: 215,
    location: { latitude: 28.4744, longitude: 77.0850, address: 'MG Road Metro Station Area' },
    citizenId: 'user-5',
    citizenName: 'Sanjay Verma',
    assignedDepartment: 'Roads & Highways Dept',
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'issue-107',
    title: 'Severe Stray Dog Menace in Residential Blocks',
    description: 'Packs of aggressive stray dogs chasing vehicles and children. Multiple minor bite incidents reported this week.',
    category: 'Sanitary & Public Hygiene',
    status: 'In Progress',
    priority: 'High',
    priorityScore: 81.5,
    trustScore: 0.91,
    tier1: 'Public Health',
    tier2: 'Animal Control Board',
    tier3: 'Stray Animal Management',
    upvotes: 142,
    location: { latitude: 28.5355, longitude: 77.2410, address: 'Greater Kailash Block C' },
    citizenId: 'user-6',
    citizenName: 'Anita Desai',
    assignedDepartment: 'Animal Control Board',
    adminNotes: 'Vaccination and neutering drive scheduled for this weekend in the affected area.',
    comments: [
      { id: 'c4', authorName: 'Animal Control', authorType: 'admin', comment: 'Our vans will be patrolling the area starting tomorrow morning.', createdAt: new Date(Date.now() - 24000000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 24000000).toISOString(),
  },
  {
    id: 'issue-108',
    title: 'Malfunctioning Traffic Signals at Major Intersection',
    description: 'Signals at the 4-way crossing have been stuck on yellow flashing for 3 days, leading to chaos.',
    category: 'Service Delivery Deficiencies',
    status: 'Resolved',
    priority: 'Critical',
    priorityScore: 95.0,
    trustScore: 0.99,
    tier1: 'Traffic Management',
    tier2: 'Traffic Police & PWD',
    tier3: 'Signal Maintenance',
    upvotes: 310,
    location: { latitude: 28.5921, longitude: 77.2250, address: 'South Extension Ring Road Crossing' },
    citizenId: 'user-7',
    citizenName: 'Rahul Mehra',
    assignedDepartment: 'Traffic Police & PWD',
    adminNotes: 'Control board replaced and signals re-synced.',
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    resolvedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'issue-109',
    title: 'Extortion by Traffic Police for Fabricated Violations',
    description: 'Officers at the checkpoint are stopping commercial vehicles and demanding cash without issuing challans.',
    category: 'Abuse of Power or Corruption',
    status: 'In Progress',
    priority: 'Critical',
    priorityScore: 98.5,
    trustScore: 0.97,
    tier1: 'Law Enforcement',
    tier2: 'Vigilance Bureau',
    tier3: 'Police Misconduct',
    upvotes: 450,
    location: { latitude: 28.6500, longitude: 77.2300, address: 'ITO Intersection' },
    citizenId: 'user-8',
    citizenName: 'Anonymous Driver',
    assignedDepartment: 'Vigilance Bureau',
    adminNotes: 'Internal affairs investigation initiated. Body cam footage requested.',
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 40000000).toISOString(),
  },
  {
    id: 'issue-110',
    title: 'Unjustified 6-Month Delay in Pension Disbursement',
    description: 'Elderly residents in the ward have not received their municipal pension for the last 6 months despite multiple visits.',
    category: 'Administrative Delays and Maladministration',
    status: 'Reported',
    priority: 'High',
    priorityScore: 76.0,
    trustScore: 0.94,
    tier1: 'Social Welfare',
    tier2: 'Pension & Welfare Dept',
    tier3: 'Fund Disbursement',
    upvotes: 275,
    location: { latitude: 28.7041, longitude: 77.1025, address: 'Rohini Sector 15' },
    citizenId: 'user-9',
    citizenName: 'Kishan Lal',
    assignedDepartment: 'Pension & Welfare Dept',
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 'issue-111',
    title: 'Illegal Encroachment on Pedestrian Footpaths',
    description: 'Shopkeepers have extended their stalls onto the footpath, forcing pedestrians to walk on the busy main road.',
    category: 'Systemic and Policy Issues',
    status: 'Reported',
    priority: 'Medium',
    priorityScore: 55.0,
    trustScore: 0.85,
    tier1: 'Urban Planning',
    tier2: 'Anti-Encroachment Cell',
    tier3: 'Footpath Blockage',
    upvotes: 95,
    location: { latitude: 28.5677, longitude: 77.2433, address: 'Lajpat Nagar Central Market' },
    citizenId: 'user-10',
    citizenName: 'Meera Singh',
    assignedDepartment: 'Anti-Encroachment Cell',
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'issue-112',
    title: 'Toxic Foam and Industrial Effluents in Local River',
    description: 'Thick chemical foam floating on the river surface due to untreated waste dumping by nearby factories.',
    category: 'Sanitary & Public Hygiene',
    status: 'In Progress',
    priority: 'Critical',
    priorityScore: 94.0,
    trustScore: 0.96,
    tier1: 'Environment',
    tier2: 'Pollution Control Board',
    tier3: 'Water Pollution',
    upvotes: 520,
    location: { latitude: 28.5700, longitude: 77.3200, address: 'Okhla Barrage' },
    citizenId: 'user-11',
    citizenName: 'Environmental NGO',
    assignedDepartment: 'Pollution Control Board',
    adminNotes: 'Water samples collected for lab testing. Notices issued to 3 factories.',
    comments: [
      { id: 'c5', authorName: 'Activist Group', authorType: 'citizen', comment: 'We need strict penalties for these factories.', createdAt: new Date(Date.now() - 50000000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 10000000).toISOString(),
  },
  {
    id: 'issue-113',
    title: 'Non-Functional Streetlights Leading to Safety Issues',
    description: 'Entire stretch of the park perimeter is dark at night, encouraging anti-social activities and making it unsafe for women.',
    category: 'Service Delivery Deficiencies',
    status: 'Reported',
    priority: 'High',
    priorityScore: 82.0,
    trustScore: 0.89,
    tier1: 'Infrastructure',
    tier2: 'Electricity Board',
    tier3: 'Street Lighting',
    upvotes: 188,
    location: { latitude: 28.5562, longitude: 77.1700, address: 'Hauz Khas Deer Park' },
    citizenId: 'user-12',
    citizenName: 'Kriti R.',
    assignedDepartment: 'Electricity Board',
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'issue-114',
    title: 'Continuous Crashing of Municipal Property Tax Portal',
    description: 'The online portal for paying property tax crashes at the payment gateway, resulting in late fees for citizens.',
    category: 'Systemic and Policy Issues',
    status: 'Resolved',
    priority: 'Medium',
    priorityScore: 60.0,
    trustScore: 0.92,
    tier1: 'IT Services',
    tier2: 'E-Governance Dept',
    tier3: 'Portal Outage',
    upvotes: 340,
    location: { latitude: 28.6139, longitude: 77.2090, address: 'Online Portal' },
    citizenId: 'user-13',
    citizenName: 'Tech Resident',
    assignedDepartment: 'E-Governance Dept',
    adminNotes: 'Server capacity upgraded and payment gateway timeout issue fixed. Late fees waived for affected period.',
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    resolvedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'issue-115',
    title: 'Neglected Public Park - Broken Equipment & Overgrown Grass',
    description: 'Swings are broken and rusting, and the grass is severely overgrown making the park unusable for families.',
    category: 'Service Delivery Deficiencies',
    status: 'In Progress',
    priority: 'Low',
    priorityScore: 35.0,
    trustScore: 0.80,
    tier1: 'Horticulture',
    tier2: 'Parks & Gardens Dept',
    tier3: 'Maintenance',
    upvotes: 45,
    location: { latitude: 28.6200, longitude: 77.0800, address: 'Janakpuri District Park' },
    citizenId: 'user-14',
    citizenName: 'Amit Bansal',
    assignedDepartment: 'Parks & Gardens Dept',
    adminNotes: 'Contractor assigned for mowing the lawns next week.',
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

const INITIAL_USERS: User[] = [
  // 10 Citizens
  { id: 'user-1', name: 'Aarav Sharma', email: 'aarav@example.com', phone: '+91 9876543210', role: 'citizen', userType: 'citizen', createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-07-20T10:30:00Z' },
  { id: 'user-3', name: 'Neha Patel', email: 'neha@example.com', phone: '+91 9822233344', role: 'citizen', userType: 'citizen', createdAt: '2026-03-10T11:20:00Z', updatedAt: '2026-07-18T14:15:00Z' },
  { id: 'user-5', name: 'Sanjay Verma', email: 'sanjay@example.com', phone: '+91 9833344455', role: 'citizen', userType: 'citizen', createdAt: '2026-04-12T10:00:00Z', updatedAt: '2026-07-21T09:00:00Z' },
  { id: 'user-6', name: 'Anita Desai', email: 'anita@example.com', phone: '+91 9844455566', role: 'citizen', userType: 'citizen', createdAt: '2026-05-15T10:00:00Z', updatedAt: '2026-07-21T09:00:00Z' },
  { id: 'user-7', name: 'Rahul Mehra', email: 'rahul@example.com', phone: '+91 9855566677', role: 'citizen', userType: 'citizen', createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-07-21T09:00:00Z' },
  { id: 'user-8', name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 9866677788', role: 'citizen', userType: 'citizen', createdAt: '2026-06-18T10:00:00Z', updatedAt: '2026-07-21T09:00:00Z' },
  { id: 'user-9', name: 'Kishan Lal', email: 'kishan@example.com', phone: '+91 9877788899', role: 'citizen', userType: 'citizen', createdAt: '2026-07-01T10:00:00Z', updatedAt: '2026-07-21T09:00:00Z' },
  { id: 'user-10', name: 'Meera Singh', email: 'meera@example.com', phone: '+91 9888899900', role: 'citizen', userType: 'citizen', createdAt: '2026-07-05T10:00:00Z', updatedAt: '2026-07-21T09:00:00Z' },
  { id: 'user-11', name: 'Kriti R.', email: 'kriti@example.com', phone: '+91 9899900011', role: 'citizen', userType: 'citizen', createdAt: '2026-07-10T10:00:00Z', updatedAt: '2026-07-21T09:00:00Z' },
  { id: 'user-12', name: 'Amit Bansal', email: 'amit@example.com', phone: '+91 9900011122', role: 'citizen', userType: 'citizen', createdAt: '2026-07-12T10:00:00Z', updatedAt: '2026-07-21T09:00:00Z' },

  // Admin
  { id: 'user-2', name: 'Admin Control Officer', email: 'admin@civickural.gov.in', phone: '+91 9811122233', role: 'admin', userType: 'admin', department: 'Grievance Redressal Cell', createdAt: '2025-11-01T08:00:00Z', updatedAt: '2026-07-21T07:00:00Z' },

  // Staff (Department-wise)
  { id: 'staff-1', name: 'Inspector Rajesh Kumar', email: 'rajesh.mod@civickural.gov.in', phone: '+91 9844455566', role: 'staff', userType: 'staff', department: 'Sanitation Board', createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-07-19T16:00:00Z' },
  { id: 'staff-2', name: 'Engineer Suresh Menon', email: 'suresh.pwd@civickural.gov.in', phone: '+91 9911122233', role: 'staff', userType: 'staff', department: 'Public Works Dept (PWD)', createdAt: '2026-01-10T10:00:00Z', updatedAt: '2026-07-20T16:00:00Z' },
  { id: 'staff-3', name: 'Officer Priya Desai', email: 'priya.pr@civickural.gov.in', phone: '+91 9922233344', role: 'staff', userType: 'staff', department: 'Public Relations & Grievance Cell', createdAt: '2026-02-15T10:00:00Z', updatedAt: '2026-07-21T16:00:00Z' },
  { id: 'staff-4', name: 'Director Alok Nath', email: 'alok.jal@civickural.gov.in', phone: '+91 9933344455', role: 'staff', userType: 'staff', department: 'Jal Board & Utility Services', createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-07-21T16:00:00Z' },
  { id: 'staff-5', name: 'Inspector Karan Singh', email: 'karan.vigilance@civickural.gov.in', phone: '+91 9944455566', role: 'staff', userType: 'staff', department: 'Vigilance & Anti-Corruption Bureau', createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-07-21T16:00:00Z' },
  { id: 'staff-6', name: 'Supervisor Manoj Tiwary', email: 'manoj.roads@civickural.gov.in', phone: '+91 9955566677', role: 'staff', userType: 'staff', department: 'Roads & Highways Dept', createdAt: '2026-04-10T10:00:00Z', updatedAt: '2026-07-21T16:00:00Z' },
  { id: 'staff-7', name: 'Dr. Sunita Rao', email: 'sunita.animal@civickural.gov.in', phone: '+91 9966677788', role: 'staff', userType: 'staff', department: 'Animal Control Board', createdAt: '2026-03-25T10:00:00Z', updatedAt: '2026-07-21T16:00:00Z' },
  { id: 'staff-8', name: 'Officer Amit Joshi', email: 'amit.traffic@civickural.gov.in', phone: '+91 9977788899', role: 'staff', userType: 'staff', department: 'Traffic Police & PWD', createdAt: '2026-05-05T10:00:00Z', updatedAt: '2026-07-21T16:00:00Z' },
  { id: 'staff-9', name: 'Coordinator Ramesh Babu', email: 'ramesh.pension@civickural.gov.in', phone: '+91 9988899900', role: 'staff', userType: 'staff', department: 'Pension & Welfare Dept', createdAt: '2026-02-28T10:00:00Z', updatedAt: '2026-07-21T16:00:00Z' },
  { id: 'staff-10', name: 'Officer Kiran Bedi', email: 'kiran.encroach@civickural.gov.in', phone: '+91 9990011122', role: 'staff', userType: 'staff', department: 'Anti-Encroachment Cell', createdAt: '2026-06-10T10:00:00Z', updatedAt: '2026-07-21T16:00:00Z' },
  { id: 'staff-11', name: 'Inspector Sameer Khan', email: 'sameer.pcb@civickural.gov.in', phone: '+91 9991122233', role: 'staff', userType: 'staff', department: 'Pollution Control Board', createdAt: '2026-01-18T10:00:00Z', updatedAt: '2026-07-21T16:00:00Z' },
  { id: 'staff-12', name: 'Engineer Ravi Teja', email: 'ravi.elec@civickural.gov.in', phone: '+91 9992233344', role: 'staff', userType: 'staff', department: 'Electricity Board', createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-07-21T16:00:00Z' },
  { id: 'staff-13', name: 'Admin Swati Sharma', email: 'swati.it@civickural.gov.in', phone: '+91 9993344455', role: 'staff', userType: 'staff', department: 'E-Governance Dept', createdAt: '2026-05-22T10:00:00Z', updatedAt: '2026-07-21T16:00:00Z' },
  { id: 'staff-14', name: 'Supervisor Anil Kapoor', email: 'anil.parks@civickural.gov.in', phone: '+91 9994455566', role: 'staff', userType: 'staff', department: 'Parks & Gardens Dept', createdAt: '2026-06-05T10:00:00Z', updatedAt: '2026-07-21T16:00:00Z' },
];

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
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error ${response.status}`,
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Backend unavailable or request timed out, using demo mode fallback:', error);
      return {
        success: false,
        error: 'Network error or server unavailable'
      };
    }
  }

  // Local Storage Helpers
  public getLocalIssues(): Issue[] {
    const stored = localStorage.getItem('civickural_demo_issues');
    if (!stored) {
      localStorage.setItem('civickural_demo_issues', JSON.stringify(INITIAL_DEMO_ISSUES));
      return INITIAL_DEMO_ISSUES;
    }
    try {
      const parsed = JSON.parse(stored) as Issue[];
      // If we've added more initial issues, merge them in (preventing duplicates by ID)
      if (parsed.length < 15) {
        const merged = [...parsed];
        INITIAL_DEMO_ISSUES.forEach(initialIssue => {
          if (!merged.find(p => p.id === initialIssue.id)) {
            merged.push(initialIssue);
          }
        });
        localStorage.setItem('civickural_demo_issues', JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      localStorage.setItem('civickural_demo_issues', JSON.stringify(INITIAL_DEMO_ISSUES));
      return INITIAL_DEMO_ISSUES;
    }
  }

  public saveLocalIssues(issues: Issue[]) {
    localStorage.setItem('civickural_demo_issues', JSON.stringify(issues));
  }

  // Authentication
  async login(email: string, userType: UserRole = 'citizen', password?: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.makeRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: password || 'CivicKural#2026!', userType, role: userType }),
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

    // Fallback: If backend server is offline, allow demo login seamlessly
    // Look up user from INITIAL_USERS first, then mock based on email
    const allDemoUsers = this.getUsersSync();
    let demoUser = allDemoUsers.find(u => u.email === email);
    
    if (!demoUser) {
      demoUser = {
        id: userType === 'admin' || userType === 'staff' ? 'user-2' : 'user-1',
        email: email,
        name: userType === 'admin' || userType === 'staff' ? 'Admin Control Officer' : (email.split('@')[0] || 'Citizen User'),
        phone: '+91 9876543210',
        role: userType,
        userType: userType,
        department: userType === 'admin' || userType === 'staff' ? 'Central Grievance Redressal' : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const mockToken = 'demo-token-' + Date.now();

    localStorage.setItem('civickural_token', mockToken);
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('civickural_user', JSON.stringify(demoUser));
    localStorage.setItem('user', JSON.stringify(demoUser));

    return {
      success: true,
      data: {
        user: demoUser,
        token: mockToken,
      },
      message: 'Demo mode login successful',
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
        password: registerData.password || 'CivicKural#2026!',
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

    // Demo fallback for register
    const mockUser: User = {
      id: 'user-' + Date.now(),
      name: registerData.name,
      email: registerData.email,
      phone: registerData.phone || '+91 9876543210',
      role: roleToUse,
      userType: roleToUse,
      department: registerData.department,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const mockToken = 'demo-token-' + Date.now();
    
    // Add to demo users
    const allUsers = this.getUsersSync();
    allUsers.push(mockUser);
    localStorage.setItem('civickural_demo_users', JSON.stringify(allUsers));

    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('samvad_user', JSON.stringify(mockUser));

    return {
      success: true,
      data: { user: mockUser, token: mockToken },
      message: 'Demo mode registration successful',
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
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
        resolvedAt: r.resolvedAt
      }));
      
      if (userId) {
         const filtered = issues.filter(i => i.citizenId === userId);
         return { success: true, data: filtered, reports: filtered };
      }
      return { success: true, data: issues, reports: issues };
    }

    let localIssues = this.getLocalIssues();
    if (userId) {
       localIssues = localIssues.filter(i => i.citizenId === userId);
    }
    return {
      success: true,
      data: localIssues,
    };
  }

  async getIssueById(issueId: string): Promise<ApiResponse<Issue>> {
    const issues = this.getLocalIssues();
    const found = issues.find(i => i.id === issueId);
    if (found) {
      return { success: true, data: found };
    }
    return { success: false, error: 'Issue not found' };
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
        upvotes: 0,
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

    // Fallback: Create locally with appropriate priority and department assignment
    let defaultPriority: PriorityLevel = 'Medium';
    let defaultScore = 50;
    if (issueData.category === 'Abuse of Power or Corruption') {
      defaultPriority = 'Critical';
      defaultScore = 90;
    } else if (issueData.category === 'Sanitary & Public Hygiene') {
      defaultPriority = 'High';
      defaultScore = 75;
    }

    const currentUser = await this.getCurrentUser();

    const newIssue: Issue = {
      id: 'issue-' + Date.now(),
      title: issueData.title,
      description: issueData.description,
      category: issueData.category,
      status: 'Reported',
      priority: defaultPriority,
      priorityScore: defaultScore,
      trustScore: 0.95,
      tier1: 'Public Health & Infrastructure',
      tier2: `${issueData.category} Board`,
      tier3: issueData.category,
      upvotes: 1,
      location: {
        latitude: issueData.latitude,
        longitude: issueData.longitude,
        address: issueData.address || 'New Delhi, India',
      },
      photoUrl: issueData.photoUrl,
      citizenId: issueData.citizenId,
      citizenName: currentUser?.name || 'Citizen User',
      assignedDepartment: `${issueData.category} Board`,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentIssues = this.getLocalIssues();
    const updated = [newIssue, ...currentIssues];
    this.saveLocalIssues(updated);

    return {
      success: true,
      data: newIssue,
      message: 'Issue reported successfully',
    };
  }

  async updateIssueStatus(
    issueId: string,
    status: IssueStatus,
    adminNotes?: string,
    assignedDepartment?: string,
    priority?: PriorityLevel
  ): Promise<ApiResponse<Issue>> {
    const issues = this.getLocalIssues();
    const index = issues.findIndex(i => i.id === issueId);
    if (index !== -1) {
      issues[index].status = status;
      if (adminNotes !== undefined) issues[index].adminNotes = adminNotes;
      if (assignedDepartment !== undefined) {
        issues[index].assignedDepartment = assignedDepartment;
        issues[index].tier2 = assignedDepartment;
      }
      if (priority !== undefined) issues[index].priority = priority;
      if (status === 'Resolved') issues[index].resolvedAt = new Date().toISOString();
      issues[index].updatedAt = new Date().toISOString();

      this.saveLocalIssues(issues);
      return { success: true, data: issues[index] };
    }
    return { success: false, error: 'Issue not found' };
  }

  async upvoteIssue(issueId: string): Promise<ApiResponse<Issue>> {
    const issues = this.getLocalIssues();
    const index = issues.findIndex(i => i.id === issueId);
    if (index !== -1) {
      issues[index].upvotes += 1;
      this.saveLocalIssues(issues);
      return { success: true, data: issues[index] };
    }
    return { success: false, error: 'Issue not found' };
  }

  async addComment(issueId: string, commentText: string): Promise<ApiResponse<Issue>> {
    const currentUser = await this.getCurrentUser();
    const issues = this.getLocalIssues();
    const index = issues.findIndex(i => i.id === issueId);

    if (index !== -1) {
      const newComment: IssueComment = {
        id: 'c-' + Date.now(),
        authorName: currentUser?.name || 'Community Member',
        authorType: currentUser?.userType || currentUser?.role || 'citizen',
        comment: commentText,
        createdAt: new Date().toISOString(),
      };

      if (!issues[index].comments) {
        issues[index].comments = [];
      }
      issues[index].comments!.push(newComment);
      this.saveLocalIssues(issues);
      return { success: true, data: issues[index] };
    }
    return { success: false, error: 'Issue not found' };
  }

  private getUsersSync(): User[] {
    const stored = localStorage.getItem('civickural_demo_users');
    if (!stored) {
      localStorage.setItem('civickural_demo_users', JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      const parsed = JSON.parse(stored) as User[];
      if (parsed.length < INITIAL_USERS.length) {
        const merged = [...parsed];
        INITIAL_USERS.forEach(initialUser => {
          if (!merged.find(u => u.id === initialUser.id)) {
            merged.push(initialUser);
          }
        });
        localStorage.setItem('civickural_demo_users', JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      localStorage.setItem('civickural_demo_users', JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
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

    const localUsers = this.getUsersSync();
    return { success: true, data: localUsers, users: localUsers };
  }
}

export default new ApiService();