import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useDashboardMetrics(range: string = '30d') {
  return useQuery({
    queryKey: ['dashboard-metrics', range],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard', { params: { range } });
      return res.data.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function usePropertyAnalytics(range: string = '30d') {
  return useQuery({
    queryKey: ['property-analytics', range],
    queryFn: async () => {
      const res = await api.get('/analytics/properties', { params: { range } });
      return res.data.data;
    },
  });
}

export function useLeadAnalytics(range: string = '30d') {
  return useQuery({
    queryKey: ['lead-analytics', range],
    queryFn: async () => {
      const res = await api.get('/analytics/leads', { params: { range } });
      return res.data.data;
    },
  });
}

export function useStaffAnalytics(range: string = '30d') {
  return useQuery({
    queryKey: ['staff-analytics', range],
    queryFn: async () => {
      const res = await api.get('/analytics/staff', { params: { range } });
      return res.data.data;
    },
  });
}

export function useImportProperties() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rows: any[]) => {
      const res = await api.post('/analytics/import/properties', { rows });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}

export function useImportLeads() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rows: any[]) => {
      const res = await api.post('/analytics/import/leads', { rows });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });
}

export async function downloadCsvExport(type: 'properties' | 'leads') {
  const response = await api.get(`/analytics/export/${type}`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${type}-export-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
