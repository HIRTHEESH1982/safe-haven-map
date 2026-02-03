import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentService } from '@/services/incidentService';
import { crimeService } from '@/services/crimeService'; // Import the new service
import { CreateIncidentPayload } from '@/types';

export const useIncidents = () => {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      // Combine mock/user incidents with real crime data
      const userIncidents = await incidentService.getIncidents();
      const realCrimes = await crimeService.getRecentCrimes();
      return [...userIncidents, ...realCrimes];
    },
    staleTime: 60000 * 5, // 5 minutes because external API
  });
};

export const useCreateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateIncidentPayload) => incidentService.createIncident(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
};

export const useUserIncidents = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['incidents', 'user', userId],
    queryFn: () => incidentService.getUserIncidents(userId!),
    enabled: !!userId,
  });
};

export const useUserArchivedIncidents = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['incidents', 'archived', userId],
    queryFn: () => incidentService.getUserArchived(),
    enabled: !!userId,
  });
};
