import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface TelecallerStats {
  callsToday: number;
  connectedToday: number;
  qualifiedToday: number;
  pendingCallbacks: number;
}

export function useCallingQueue() {
  return useQuery({
    queryKey: ['telecaller-queue'],
    queryFn: async (): Promise<any[]> => {
      const response = await api.get('/telecaller/queue');
      return response.data.data;
    },
    refetchInterval: 30000, // refresh every 30s
  });
}

export function useTelecallerStats() {
  return useQuery({
    queryKey: ['telecaller-stats'],
    queryFn: async (): Promise<TelecallerStats> => {
      const response = await api.get('/telecaller/stats');
      return response.data.data;
    },
    refetchInterval: 30000,
  });
}

export function useLogCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      leadId: string;
      disposition: string;
      duration?: number;
      notes?: string;
      callbackDate?: string;
      callbackTime?: string;
    }) => {
      const response = await api.post('/telecaller/call', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telecaller-queue'] });
      queryClient.invalidateQueries({ queryKey: ['telecaller-stats'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
