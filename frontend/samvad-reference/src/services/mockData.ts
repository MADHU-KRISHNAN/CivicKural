import { Report, User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "citizen1",
    name: "Priya Sharma",
    email: "priya@example.com",
    role: "citizen",
    createdAt: new Date("2024-01-15")
  },
  {
    id: "staff1", 
    name: "Rajesh Kumar",
    email: "rajesh@gov.in",
    role: "staff",
    createdAt: new Date("2024-01-10")
  }
];

export const mockReports: Report[] = [
  {
    id: "RPT001",
    title: "Large pothole on MG Road",
    description: "Deep pothole causing traffic issues and vehicle damage near the shopping complex.",
    category: "Pothole",
    priority: 4,
    status: "In Progress",
    photoUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80",
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: "MG Road, Connaught Place, New Delhi"
    },
    citizenId: "citizen1",
    assignedStaffId: "staff1",
    staffComment: "Work crew assigned, repair scheduled for next week",
    createdAt: new Date("2024-01-20T10:30:00"),
    updatedAt: new Date("2024-01-21T14:20:00")
  },
  {
    id: "RPT002",
    title: "Overflowing waste bins",
    description: "Multiple garbage bins are overflowing in the market area, attracting stray animals.",
    category: "Waste",
    priority: 3,
    status: "Assigned",
    photoUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&q=80",
    location: {
      lat: 28.6129,
      lng: 77.2295,
      address: "Karol Bagh Market, New Delhi"
    },
    citizenId: "citizen1",
    assignedStaffId: "staff1",
    staffComment: "Cleaning crew notified",
    createdAt: new Date("2024-01-22T09:15:00"),
    updatedAt: new Date("2024-01-22T11:30:00")
  },
  {
    id: "RPT003",
    title: "Street light not working",
    description: "Main street light has been out for 3 days, making the area unsafe at night.",
    category: "Light",
    priority: 5,
    status: "Resolved",
    location: {
      lat: 28.6219,
      lng: 77.2085,
      address: "Janpath, Central Delhi"
    },
    citizenId: "citizen1",
    staffComment: "Light bulb replaced and tested",
    createdAt: new Date("2024-01-18T19:45:00"),
    updatedAt: new Date("2024-01-19T16:30:00")
  },
  {
    id: "RPT004",
    title: "Water leakage from pipeline",
    description: "Continuous water leakage from underground pipe causing road damage.",
    category: "Water",
    priority: 4,
    status: "Submitted",
    photoUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
    location: {
      lat: 28.6304,
      lng: 77.2177,
      address: "Rajouri Garden, West Delhi"
    },
    citizenId: "citizen1",
    createdAt: new Date("2024-01-23T08:20:00"),
    updatedAt: new Date("2024-01-23T08:20:00")
  },
  {
    id: "RPT005",
    title: "Broken traffic signal",
    description: "Traffic light stuck on red, causing major congestion during peak hours.",
    category: "Traffic", 
    priority: 5,
    status: "Assigned",
    location: {
      lat: 28.6273,
      lng: 77.1716,
      address: "Punjabi Bagh, West Delhi"
    },
    citizenId: "citizen1",
    assignedStaffId: "staff1",
    staffComment: "Technical team dispatched",
    createdAt: new Date("2024-01-23T16:10:00"),
    updatedAt: new Date("2024-01-23T17:45:00")
  }
];

// Mock AI service
export const mockAIService = {
  categorizeReport: async (description: string, photoUrl?: string): Promise<{
    category: Report["category"];
    priority: Report["priority"];
    suggestedTitle?: string;
  }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes("pothole") || lowerDesc.includes("road") || lowerDesc.includes("crack")) {
      return { category: "Pothole", priority: 4, suggestedTitle: "Road maintenance required" };
    } else if (lowerDesc.includes("garbage") || lowerDesc.includes("waste") || lowerDesc.includes("trash")) {
      return { category: "Waste", priority: 3, suggestedTitle: "Waste management issue" };
    } else if (lowerDesc.includes("light") || lowerDesc.includes("lamp") || lowerDesc.includes("dark")) {
      return { category: "Light", priority: 4, suggestedTitle: "Street lighting issue" };
    } else if (lowerDesc.includes("water") || lowerDesc.includes("leak") || lowerDesc.includes("pipe")) {
      return { category: "Water", priority: 5, suggestedTitle: "Water infrastructure issue" };
    } else if (lowerDesc.includes("traffic") || lowerDesc.includes("signal") || lowerDesc.includes("congestion")) {
      return { category: "Traffic", priority: 5, suggestedTitle: "Traffic management issue" };
    } else {
      return { category: "Other", priority: 2, suggestedTitle: "General civic issue" };
    }
  }
};

// Mock location service
export const mockLocationService = {
  getCurrentLocation: async (): Promise<{ lat: number; lng: number; address: string }> => {
    // Simulate GPS delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock Delhi location
    return {
      lat: 28.6139 + (Math.random() - 0.5) * 0.02,
      lng: 77.2090 + (Math.random() - 0.5) * 0.02,
      address: "Current Location, New Delhi, India"
    };
  },
  
  reverseGeocode: async (lat: number, lng: number): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}, New Delhi, India`;
  }
};