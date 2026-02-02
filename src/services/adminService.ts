import api from './api';
import { User, Incident } from '@/types';

export interface AdminStats {
    cards: {
        totalUsers: number;
        totalReports: number;
        pendingReports: number;
        verifiedReports: number;
        rejectedReports: number;
        reportsToday: number;
    };
    charts: {
        reportsPerDay: { date: string; count: number }[];
        categoryDistribution: { _id: string; count: number }[];
    };
}

export const adminService = {
    getStats: async (): Promise<AdminStats> => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getUsers: async (): Promise<User[]> => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    updateUserRole: async (userId: string, role: 'user' | 'admin'): Promise<User> => {
        const response = await api.patch(`/admin/users/${userId}`, { role });
        return response.data;
    },

    updateUserStatus: async (userId: string, status: 'active' | 'suspended'): Promise<User> => {
        const response = await api.patch(`/admin/users/${userId}`, { status });
        return response.data;
    },

    deleteUser: async (userId: string): Promise<void> => {
        await api.delete(`/admin/users/${userId}`);
    },

    getIncidents: async (status?: string): Promise<Incident[]> => {
        const params = status ? { status } : {};
        const response = await api.get('/admin/incidents', { params });
        return response.data;
    },

    moderateIncident: async (incidentId: string, status: 'verified' | 'rejected'): Promise<Incident> => {
        const response = await api.patch(`/admin/incidents/${incidentId}/status`, { status });
        return response.data;
    },

    deleteIncident: async (incidentId: string): Promise<void> => {
        await api.delete(`/admin/incidents/${incidentId}`);
    }
};
