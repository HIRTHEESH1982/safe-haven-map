import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentService } from '@/services/incidentService';
import { CreateIncidentPayload } from '@/types';

export const useIncidents = () => {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: incidentService.getIncidents,
    staleTime: 30000, // 30 seconds
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
