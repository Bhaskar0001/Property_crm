import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface Offer {
  _id: string;
  property: {
    _id: string;
    title: string;
    slug: string;
    price: number;
    currency?: { code: string; symbol: string };
    city: string;
    area?: string;
    coverImage?: string;
    status?: { name: string; code: string };
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
  };
  currency?: {
    _id: string;
    code: string;
    symbol: string;
  };
  amount: number;
  askingPrice: number;
  varianceAmount: number;
  variancePercent: number;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'COUNTER_OFFER' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  notes?: string;
  conditions?: string;
  counterAmount?: number;
  dealStage?: 'offer_accepted' | 'solicitor_instructed' | 'survey_valuation' | 'contracts_exchanged' | 'completed';
  closingDate?: string;
  respondedAt?: string;
  respondedBy?: { name: string; email: string };
  createdAt: string;
}

export interface OfferStats {
  total: number;
  pending: number;
  countered: number;
  accepted: number;
  totalVolume: number;
}

export interface OfferQueryParams {
  status?: string;
  dealStage?: string;
  property?: string;
  lead?: string;
  customer?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function useOffers(params: OfferQueryParams = {}) {
  return useQuery({
    queryKey: ['offers', params],
    queryFn: async () => {
      const res = await api.get('/offers', { params });
      return {
        offers: (res.data.data || []) as Offer[],
        pagination: res.data.pagination || { total: 0, page: 1, totalPages: 1 },
        stats: (res.data.stats || {
          total: 0,
          pending: 0,
          countered: 0,
          accepted: 0,
          totalVolume: 0,
        }) as OfferStats,
      };
    },
  });
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: ['offer', id],
    queryFn: async () => {
      const res = await api.get(`/offers/${id}`);
      return res.data.data as Offer;
    },
    enabled: !!id,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      propertyId: string;
      amount: number;
      currencyId?: string;
      leadId?: string;
      customerId?: string;
      buyerName?: string;
      buyerEmail?: string;
      buyerPhone?: string;
      conditions?: string;
      notes?: string;
      closingDate?: string;
    }) => {
      const res = await api.post('/offers', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/offers/${id}`, data);
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offer', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useUpdateOfferStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      counterAmount,
      notes,
    }: {
      id: string;
      status: 'SUBMITTED' | 'UNDER_REVIEW' | 'COUNTER_OFFER' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
      counterAmount?: number;
      notes?: string;
    }) => {
      const res = await api.patch(`/offers/${id}/status`, {
        status,
        counterAmount,
        notes,
      });
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offer', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const res = await api.get('/offers/deals');
      return res.data.data as {
        totalDeals: number;
        totalVolume: number;
        stages: { key: string; label: string }[];
        grouped: Record<string, Offer[]>;
        deals: Offer[];
      };
    },
  });
}

export function useUpdateDealStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      dealStage,
    }: {
      id: string;
      dealStage: 'offer_accepted' | 'solicitor_instructed' | 'survey_valuation' | 'contracts_exchanged' | 'completed';
    }) => {
      const res = await api.patch(`/offers/${id}/deal-stage`, { dealStage });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}
