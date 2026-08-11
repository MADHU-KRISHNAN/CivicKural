export interface Report {
  id: string;
  title: string;
  description: string;
  category: "Pothole" | "Waste" | "Light" | "Water" | "Traffic" | "Other";
  priority: 1 | 2 | 3 | 4 | 5;
  status: "Submitted" | "Assigned" | "In Progress" | "Resolved" | "Closed";
  photoUrl?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  citizenId: string;
  assignedStaffId?: string;
  staffComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "staff";
  createdAt: Date;
}

export interface MockGeolocation {
  lat: number;
  lng: number;
  address: string;
}