export interface TimelineEvent {
  status: string;
  date: string;
  note: string;
}

export interface OfficerLog {
  action: string;
  date: string;
}

export interface Feedback {
  rating: number;
  comment: string;
}

export interface AssignedOfficer {
  name: string;
  email: string;
  contact: string;
  address: string;
  department: string;
  assignedBy: 'AI' | 'Manual';
}

export interface Complaint {
  id: string;
  ward: string;
  gali: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Resolved';
  description: string;
  lastUpdated: string;
  timeline: TimelineEvent[];
  officerLog: OfficerLog[];
  feedback: Feedback | null;
  imageUrl: string | null;
  afterImageUrl: string | null;
  slaDeadline: string;
  isAppealed: boolean;
  appealTimeline: TimelineEvent[];
  assignedOfficer?: AssignedOfficer;
}

export interface Officer {
  name: string;
  resolved: number;
  rating: number;
  badge: string | null;
}

export interface Alert {
  id: string;
  message: string;
  type: 'crisis' | 'warning';
  filter: string;
}

export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  overdueCount: number;
  avgResolutionTime: string;
}

export interface DashboardData {
  complaints: Complaint[];
  stats: DashboardStats;
}
