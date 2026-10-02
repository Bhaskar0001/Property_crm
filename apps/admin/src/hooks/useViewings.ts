import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface Viewing {
  _id: string;
  property: {
    _id: string;
    title: string;
    slug: string;
    price: number;
    currency?: { code: string; symbol: string };
    city: string;
    area?: string;
    address?: string;
    coverImage?: string;
  };
  customer?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  lead?: {
    _id: string;
    priority: string;
    stage?: { name: string; code: string; color: string };
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW' | string;
  notes?: string;
  feedback?: string;
  cancelReason?: string;
  confirmedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ViewingQueryParams {
  status?: string;
  from?: string;
  to?: string;
  property?: string;
  customer?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useViewings(params: ViewingQueryParams = {}) {
  return useQuery({
    queryKey: ['viewings', params],
    queryFn: async () => {
      const res = await api.get('/viewings', { params });
      return {
        viewings: (res.data.data || []) as Viewing[],
        pagination: res.data.pagination || { total: 0, page: 1, totalPages: 1 },
      };
    },
  });
}

export function useViewing(id: string) {
  return useQuery({
    queryKey: ['viewing', id],
    queryFn: async () => {
      const res = await api.get(`/viewings/${id}`);
      return res.data.data as Viewing;
    },
    enabled: !!id,
  });
}

export function useViewingCalendar(from: string, to: string) {
  return useQuery({
    queryKey: ['viewing-calendar', from, to],
    queryFn: async () => {
      const res = await api.get('/viewings/calendar', { params: { from, to } });
      return (res.data.data || []) as Viewing[];
    },
  });
}

export function useCreateViewing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      propertyId: string;
      leadId?: string;
      customerId?: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      scheduledDate: string;
      scheduledTime?: string;
      duration?: number;
      assignedTo?: string;
      notes?: string;
      status?: string;
    }) => {
      const res = await api.post('/viewings', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      queryClient.invalidateQueries({ queryKey: ['viewing-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateViewing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/viewings/${id}`, data);
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      queryClient.invalidateQueries({ queryKey: ['viewing', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['viewing-calendar'] });
    },
  });
}

export function useUpdateViewingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      cancelReason,
      feedback,
      rescheduledDate,
      rescheduledTime,
    }: {
      id: string;
      status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
      cancelReason?: string;
      feedback?: string;
      rescheduledDate?: string;
      rescheduledTime?: string;
    }) => {
      const res = await api.patch(`/viewings/${id}/status`, {
        status,
        cancelReason,
        feedback,
        rescheduledDate,
        rescheduledTime,
      });
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['viewings'] });
      queryClient.invalidateQueries({ queryKey: ['viewing', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['viewing-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
