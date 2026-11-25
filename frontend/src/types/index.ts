export type UserRole = 'citizen' | 'admin' | 'department';

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  state?: string;
  district?: string;
  city?: string;
  avatar_url?: string;
  department_id?: number;
  created_at?: string;
}

export type ComplaintStatus = 'submitted' | 'pending' | 'in_progress' | 'resolved' | 'closed' | 'escalated';

export type ComplaintCategory =
  | 'road_pothole'
  | 'garbage_sanitation'
  | 'water_supply'
  | 'drainage_sewage'
  | 'electricity_streetlight'
  | 'public_infrastructure'
  | 'other';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  email?: string;
}

export interface ComplaintHistory {
  id: number;
  old_status?: string;
  new_status: string;
  note?: string;
  created_at: string;
  updated_by?: User;
}

export interface Complaint {
  id: number;
  complaint_id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: Priority;
  ai_category?: ComplaintCategory;
  ai_confidence?: number;
  severity_score?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
  state?: string;
  district?: string;
  city?: string;
  ward?: string;
  image_urls?: string[];
  is_duplicate: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  deadline?: string;
  citizen?: User;
  department?: Department;
  history?: ComplaintHistory[];
}

export interface MapComplaintPoint {
  id: number;
  complaint_id: string;
  title: string;
  category: ComplaintCategory;
  priority: Priority;
  status: ComplaintStatus;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  severity_score?: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  notification_type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  complaint_id?: number;
}

export interface AnalyticsOverview {
  total_complaints: number;
  pending: number;
  in_progress: number;
  resolved: number;
  critical: number;
  open: number;
}
