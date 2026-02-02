import api from './api';
import { Incident, CreateIncidentPayload, ApiResponse } from '@/types';

// Mock incidents for Chicago
const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    title: 'Pickpocket Warning - Millennium Park',
    description: 'Multiple tourists reported pickpocket activity near The Bean during peak hours.',
    category: 'theft',
    severity: 'medium',
    latitude: 41.8827,
    longitude: -87.6233,
    location: 'Millennium Park, Chicago',
    reportedBy: 'user-1',
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: '2',
    title: 'Aggressive Panhandling - State Street',
    description: 'Be cautious of aggressive panhandlers near CTA entrance. Avoid engaging.',
    category: 'harassment',
    severity: 'low',
    latitude: 41.8819,
    longitude: -87.6278,
    location: 'State Street, The Loop',
    reportedBy: 'user-2',
    reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: '3',
    title: 'Car Break-ins - Museum Campus Parking',
    description: 'Several vehicles broken into at the museum campus parking lot. Keep valuables hidden.',
    category: 'theft',
    severity: 'high',
    latitude: 41.8666,
    longitude: -87.6168,
    location: 'Museum Campus, Chicago',
    reportedBy: 'user-3',
    reportedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: '4',
    title: 'Scam Alert - Navy Pier',
    description: 'People posing as ticket sellers offering fake attraction passes. Only buy from official booths.',
    category: 'scam',
    severity: 'medium',
    latitude: 41.8917,
    longitude: -87.6063,
    location: 'Navy Pier, Chicago',
    reportedBy: 'user-4',
    reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    verified: false,
  },
  {
    id: '5',
    title: 'Dimly Lit Area - Lower Wacker',
    description: 'Avoid walking alone on Lower Wacker Drive at night. Use main streets instead.',
    category: 'unsafe_area',
    severity: 'high',
    latitude: 41.8870,
    longitude: -87.6320,
    location: 'Lower Wacker Drive',
    reportedBy: 'user-5',
    reportedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    verified: true,
  },
  {
    id: '6',
    title: 'Vandalism - Riverwalk',
    description: 'Graffiti and broken lights along certain sections of the Riverwalk. Stay vigilant after dark.',
    category: 'vandalism',
    severity: 'low',
    latitude: 41.8872,
    longitude: -87.6250,
    location: 'Chicago Riverwalk',
    reportedBy: 'user-6',
    reportedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    verified: false,
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const incidentService = {
  async getIncidents(): Promise<Incident[]> {
    try {
      const response = await api.get<ApiResponse<Incident[]>>('/incidents');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return [];
    }
  },

  async createIncident(payload: CreateIncidentPayload): Promise<Incident> {
    try {
      const response = await api.post<ApiResponse<Incident>>('/incidents', payload);
      return response.data.data;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  },

  async getUserIncidents(userId: string): Promise<Incident[]> {
    try {
      const response = await api.get<ApiResponse<Incident[]>>(`/incidents/user/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user incidents:', error);
      return [];
    }
  },
};
