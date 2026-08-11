require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Report = require('../src/models/Report');

const MONGODB_URI = process.env.MONGODB_URI;

const INITIAL_USERS = [
  // Citizens
  { id: 'user-1', name: 'Aarav Sharma', email: 'citizen@example.com', phone: '+91 9876543210', role: 'citizen' },
  { id: 'user-3', name: 'Neha Patel', email: 'neha@example.com', phone: '+91 9822233344', role: 'citizen' },
  { id: 'user-5', name: 'Sanjay Verma', email: 'sanjay@example.com', phone: '+91 9833344455', role: 'citizen' },
  { id: 'user-6', name: 'Anita Desai', email: 'anita@example.com', phone: '+91 9844455566', role: 'citizen' },
  { id: 'user-7', name: 'Rahul Mehra', email: 'rahul@example.com', phone: '+91 9855566677', role: 'citizen' },
  { id: 'user-8', name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 9866677788', role: 'citizen' },
  { id: 'user-9', name: 'Kishan Lal', email: 'kishan@example.com', phone: '+91 9877788899', role: 'citizen' },
  { id: 'user-10', name: 'Meera Singh', email: 'meera@example.com', phone: '+91 9888899900', role: 'citizen' },
  { id: 'user-11', name: 'Kriti R.', email: 'kriti@example.com', phone: '+91 9899900011', role: 'citizen' },
  { id: 'user-12', name: 'Amit Bansal', email: 'amit@example.com', phone: '+91 9900011122', role: 'citizen' },

  // Admin
  { id: 'user-2', name: 'Admin Control Officer', email: 'admin@civickural.gov.in', phone: '+91 9811122233', role: 'admin', department: 'Grievance Redressal Cell' },

  // Staff (Department-wise)
  { id: 'staff-1', name: 'Inspector Rajesh Kumar', email: 'rajesh.mod@civickural.gov.in', phone: '+91 9844455566', role: 'staff', department: 'Sanitation Board' },
  { id: 'staff-2', name: 'Engineer Suresh Menon', email: 'suresh.pwd@civickural.gov.in', phone: '+91 9911122233', role: 'staff', department: 'Public Works Dept (PWD)' },
  { id: 'staff-3', name: 'Officer Priya Desai', email: 'priya.pr@civickural.gov.in', phone: '+91 9922233344', role: 'staff', department: 'Public Relations & Grievance Cell' },
  { id: 'staff-4', name: 'Director Alok Nath', email: 'alok.jal@civickural.gov.in', phone: '+91 9933344455', role: 'staff', department: 'Jal Board & Utility Services' },
  { id: 'staff-5', name: 'Inspector Karan Singh', email: 'karan.vigilance@civickural.gov.in', phone: '+91 9944455566', role: 'staff', department: 'Vigilance & Anti-Corruption Bureau' },
  { id: 'staff-6', name: 'Supervisor Manoj Tiwary', email: 'manoj.roads@civickural.gov.in', phone: '+91 9955566677', role: 'staff', department: 'Roads & Highways Dept' },
  { id: 'staff-7', name: 'Dr. Sunita Rao', email: 'sunita.animal@civickural.gov.in', phone: '+91 9966677788', role: 'staff', department: 'Animal Control Board' },
  { id: 'staff-8', name: 'Officer Amit Joshi', email: 'amit.traffic@civickural.gov.in', phone: '+91 9977788899', role: 'staff', department: 'Traffic Police & PWD' },
  { id: 'staff-9', name: 'Coordinator Ramesh Babu', email: 'ramesh.pension@civickural.gov.in', phone: '+91 9988899900', role: 'staff', department: 'Pension & Welfare Dept' },
  { id: 'staff-10', name: 'Officer Kiran Bedi', email: 'kiran.encroach@civickural.gov.in', phone: '+91 9990011122', role: 'staff', department: 'Anti-Encroachment Cell' },
  { id: 'staff-11', name: 'Inspector Sameer Khan', email: 'sameer.pcb@civickural.gov.in', phone: '+91 9991122233', role: 'staff', department: 'Pollution Control Board' },
  { id: 'staff-12', name: 'Engineer Ravi Teja', email: 'ravi.elec@civickural.gov.in', phone: '+91 9992233344', role: 'staff', department: 'Electricity Board' },
  { id: 'staff-13', name: 'Admin Swati Sharma', email: 'swati.it@civickural.gov.in', phone: '+91 9993344455', role: 'staff', department: 'E-Governance Dept' },
  { id: 'staff-14', name: 'Supervisor Anil Kapoor', email: 'anil.parks@civickural.gov.in', phone: '+91 9994455566', role: 'staff', department: 'Parks & Gardens Dept' }
];

const INITIAL_DEMO_ISSUES = [
  {
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
    location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Sector 12 Market Square, New Delhi' },
    citizenIdStr: 'user-1',
    assignedStaffStr: 'staff-1',
    resolutionDetails: 'Special cleanup squad deployed. Container replacement in progress.',
    createdAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    title: 'Delayed Birth Certificate Issuance at Zone 4 Zonal Office',
    description: 'Application submitted 45 days ago with complete documentation, yet status remains unverified without explanation.',
    category: 'Administrative Delays and Maladministration',
    status: 'Submitted',
    priority: 'Medium',
    priorityScore: 48.0,
    trustScore: 0.90,
    tier1: 'Governance & Administration',
    tier2: 'Public Relations & Grievance Cell',
    tier3: 'Certificate Clearance Stalls',
    upvotes: 18,
    location: { type: 'Point', coordinates: [77.2095, 28.6145], address: 'Zonal Office, Zone 4, Civil Lines' },
    citizenIdStr: 'user-1',
    assignedStaffStr: 'staff-3',
    createdAt: new Date(Date.now() - 86400000 * 4)
  },
  {
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
    location: { type: 'Point', coordinates: [77.0500, 28.5823], address: 'Dwarka Sector 7 Block B, New Delhi' },
    citizenIdStr: 'user-3',
    assignedStaffStr: 'staff-4',
    resolutionDetails: 'Water tankers dispatched. Main pipeline repair estimated 4 hrs.',
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    title: 'Demanding Bribe for Commercial License Clearance',
    description: 'Local inspector requesting unauthorized cash payments for routine trade license verification.',
    category: 'Abuse of Power or Corruption',
    status: 'Submitted',
    priority: 'Critical',
    priorityScore: 92.0,
    trustScore: 0.95,
    tier1: 'Governance & Transparency',
    tier2: 'Vigilance & Anti-Corruption Bureau',
    tier3: 'Bribery & Abuse of Authority',
    upvotes: 134,
    location: { type: 'Point', coordinates: [77.2197, 28.6328], address: 'Municipal Licensing Branch, Connaught Place' },
    citizenIdStr: 'user-8',
    assignedStaffStr: 'staff-5',
    createdAt: new Date(Date.now() - 86400000 * 3)
  },
  {
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
    location: { type: 'Point', coordinates: [77.2295, 28.6129], address: 'District Secretariat, New Delhi' },
    citizenIdStr: 'user-9',
    assignedStaffStr: 'staff-2',
    resolutionDetails: 'Ramps installed at main entrance and elevator wing.',
    createdAt: new Date(Date.now() - 86400000 * 10),
    resolvedAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    title: 'Hazardous Potholes on MG Road Arterial Route',
    description: 'Deep potholes causing daily accidents and severe traffic slowdowns. Needs urgent road re-laying.',
    category: 'Service Delivery Deficiencies',
    status: 'Submitted',
    priority: 'High',
    priorityScore: 72.0,
    trustScore: 0.88,
    tier1: 'Infrastructure',
    tier2: 'Roads & Highways Dept',
    tier3: 'Road Maintenance',
    upvotes: 215,
    location: { type: 'Point', coordinates: [77.0850, 28.4744], address: 'MG Road Metro Station Area' },
    citizenIdStr: 'user-5',
    assignedStaffStr: 'staff-6',
    createdAt: new Date(Date.now() - 86400000 * 1)
  },
  {
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
    location: { type: 'Point', coordinates: [77.2410, 28.5355], address: 'Greater Kailash Block C' },
    citizenIdStr: 'user-6',
    assignedStaffStr: 'staff-7',
    resolutionDetails: 'Vaccination and neutering drive scheduled for this weekend in the affected area.',
    createdAt: new Date(Date.now() - 86400000 * 3)
  },
  {
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
    location: { type: 'Point', coordinates: [77.2250, 28.5921], address: 'South Extension Ring Road Crossing' },
    citizenIdStr: 'user-7',
    assignedStaffStr: 'staff-8',
    resolutionDetails: 'Control board replaced and signals re-synced.',
    createdAt: new Date(Date.now() - 86400000 * 5),
    resolvedAt: new Date(Date.now() - 86400000 * 1)
  },
  {
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
    location: { type: 'Point', coordinates: [77.2300, 28.6500], address: 'ITO Intersection' },
    citizenIdStr: 'user-8',
    assignedStaffStr: 'staff-5',
    resolutionDetails: 'Internal affairs investigation initiated. Body cam footage requested.',
    createdAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    title: 'Unjustified 6-Month Delay in Pension Disbursement',
    description: 'Elderly residents in the ward have not received their municipal pension for the last 6 months despite multiple visits.',
    category: 'Administrative Delays and Maladministration',
    status: 'Submitted',
    priority: 'High',
    priorityScore: 76.0,
    trustScore: 0.94,
    tier1: 'Social Welfare',
    tier2: 'Pension & Welfare Dept',
    tier3: 'Fund Disbursement',
    upvotes: 275,
    location: { type: 'Point', coordinates: [77.1025, 28.7041], address: 'Rohini Sector 15' },
    citizenIdStr: 'user-9',
    assignedStaffStr: 'staff-9',
    createdAt: new Date(Date.now() - 86400000 * 6)
  },
  {
    title: 'Illegal Encroachment on Pedestrian Footpaths',
    description: 'Shopkeepers have extended their stalls onto the footpath, forcing pedestrians to walk on the busy main road.',
    category: 'Systemic and Policy Issues',
    status: 'Submitted',
    priority: 'Medium',
    priorityScore: 55.0,
    trustScore: 0.85,
    tier1: 'Urban Planning',
    tier2: 'Anti-Encroachment Cell',
    tier3: 'Footpath Blockage',
    upvotes: 95,
    location: { type: 'Point', coordinates: [77.2433, 28.5677], address: 'Lajpat Nagar Central Market' },
    citizenIdStr: 'user-10',
    assignedStaffStr: 'staff-10',
    createdAt: new Date(Date.now() - 86400000 * 8)
  },
  {
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
    location: { type: 'Point', coordinates: [77.3200, 28.5700], address: 'Okhla Barrage' },
    citizenIdStr: 'user-11',
    assignedStaffStr: 'staff-11',
    resolutionDetails: 'Water samples collected for lab testing. Notices issued to 3 factories.',
    createdAt: new Date(Date.now() - 86400000 * 4)
  },
  {
    title: 'Non-Functional Streetlights Leading to Safety Issues',
    description: 'Entire stretch of the park perimeter is dark at night, encouraging anti-social activities and making it unsafe for women.',
    category: 'Service Delivery Deficiencies',
    status: 'Submitted',
    priority: 'High',
    priorityScore: 82.0,
    trustScore: 0.89,
    tier1: 'Infrastructure',
    tier2: 'Electricity Board',
    tier3: 'Street Lighting',
    upvotes: 188,
    location: { type: 'Point', coordinates: [77.1700, 28.5562], address: 'Hauz Khas Deer Park' },
    citizenIdStr: 'user-12',
    assignedStaffStr: 'staff-12',
    createdAt: new Date(Date.now() - 86400000 * 2)
  },
  {
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
    location: { type: 'Point', coordinates: [77.2090, 28.6139], address: 'Online Portal' },
    citizenIdStr: 'user-11',
    assignedStaffStr: 'staff-13',
    resolutionDetails: 'Server capacity upgraded and payment gateway timeout issue fixed. Late fees waived for affected period.',
    createdAt: new Date(Date.now() - 86400000 * 15),
    resolvedAt: new Date(Date.now() - 86400000 * 5)
  },
  {
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
    location: { type: 'Point', coordinates: [77.0800, 28.6200], address: 'Janakpuri District Park' },
    citizenIdStr: 'user-12',
    assignedStaffStr: 'staff-14',
    resolutionDetails: 'Contractor assigned for mowing the lawns next week.',
    createdAt: new Date(Date.now() - 86400000 * 12)
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    console.log('Wiping existing data...');
    await User.deleteMany({});
    await Report.deleteMany({});

    console.log('Inserting Mock Users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const createdUsersMap = {};

    for (let userData of INITIAL_USERS) {
      // Map the string department to valid enum
      let validDepartment = 'general';
      if (userData.department) {
        const lower = userData.department.toLowerCase();
        if (lower.includes('sanitation')) validDepartment = 'sanitation';
        else if (lower.includes('works') || lower.includes('pwd')) validDepartment = 'public_works';
        else if (lower.includes('water') || lower.includes('jal')) validDepartment = 'water';
        else if (lower.includes('electr')) validDepartment = 'electrical';
        else if (lower.includes('traffic')) validDepartment = 'traffic';
      }

      const u = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        phone: userData.phone.replace(/\s+/g, ''),
        department: userData.role === 'staff' || userData.role === 'admin' ? validDepartment : undefined
      });
      createdUsersMap[userData.id] = u._id;
    }
    console.log(`Inserted ${INITIAL_USERS.length} users.`);

    console.log('Inserting Mock Reports...');
    let reportCount = 0;
    for (let reportData of INITIAL_DEMO_ISSUES) {
      const citizenId = createdUsersMap[reportData.citizenIdStr];
      const assignedStaffId = createdUsersMap[reportData.assignedStaffStr];
      
      await Report.create({
        ...reportData,
        citizenId: citizenId,
        assignedStaffId: assignedStaffId,
        assignedAt: assignedStaffId ? new Date() : null,
        isPublic: true
      });
      reportCount++;
    }
    console.log(`Inserted ${reportCount} reports.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
