import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

interface PublicStats {
    totalIncidents: number;
    highPriority: number;
    verifiedReports: number;
    totalUsers: number;
}

export const useStats = () => {
    return useQuery({
        queryKey: ['publicStats'],
        queryFn: async () => {
            const response = await api.get<{ success: boolean; data: PublicStats }>('/stats');
            return response.data.data;
        },
        staleTime: 60000 * 5, // 5 minutes
    });
};
