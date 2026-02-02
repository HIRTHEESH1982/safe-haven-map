export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  role?: string;
}

// Incident types
export type IncidentCategory =
  | 'theft'
  | 'assault'
  | 'vandalism'
  | 'harassment'
  | 'scam'
  | 'unsafe_area'
  | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high';
export type IncidentStatus = 'pending' | 'verified' | 'rejected';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  latitude: number;
  longitude: number;
  location: string;
  reportedBy: any; // Updated to handle populated object
  reportedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt?: string;
  moderationReason?: string;
  verified?: boolean; // Backward compatibility (optional)
}

export interface CreateIncidentPayload {
  title: string;
  description: string;
  category: IncidentCategory;
  latitude: number;
  longitude: number;
  location: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

// Map types
export interface MapPosition {
  lat: number;
  lng: number;
}

export const CHICAGO_CENTER: MapPosition = {
  lat: 41.8781,
  lng: -87.6298,
};

export const INCIDENT_CATEGORIES: { value: IncidentCategory; label: string }[] = [
  { value: 'theft', label: 'Theft' },
  { value: 'assault', label: 'Assault' },
  { value: 'vandalism', label: 'Vandalism' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'scam', label: 'Scam/Fraud' },
  { value: 'unsafe_area', label: 'Unsafe Area' },
  { value: 'other', label: 'Other' },
];

export const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  low: 'hsl(var(--severity-low))',
  medium: 'hsl(var(--severity-medium))',
  high: 'hsl(var(--severity-high))',
};
