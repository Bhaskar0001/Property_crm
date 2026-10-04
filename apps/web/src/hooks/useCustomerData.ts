import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../lib/customerApi';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { PublicProperty } from '../types';
import { CustomerEnquiriesResponse } from '../types/customer';

export function useFavorites() {
  const { customer } = useCustomerAuth();

  return useQuery({
    queryKey: ['customer-favorites', customer?._id],
    queryFn: async (): Promise<PublicProperty[]> => {
      const response = await customerApi.get('/favorites');
      return response.data.data;
    },
    enabled: !!customer,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { customer, openLoginModal } = useCustomerAuth();

  return useMutation({
    mutationFn: async ({
      propertyId,
      isCurrentlyFavorited,
    }: {
      propertyId: string;
      isCurrentlyFavorited: boolean;
    }) => {
      if (!customer) {
        openLoginModal();
        return;
      }

      if (isCurrentlyFavorited) {
        await customerApi.delete(`/favorites/${propertyId}`);
      } else {
        await customerApi.post(`/favorites/${propertyId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-favorites'] });
    },
  });
}

export function useCustomerEnquiries() {
  const { customer } = useCustomerAuth();

  return useQuery({
    queryKey: ['customer-enquiries', customer?._id],
    queryFn: async (): Promise<CustomerEnquiriesResponse> => {
      const response = await customerApi.get('/enquiries');
      return response.data.data;
    },
    enabled: !!customer,
  });
}

export function useSubmitEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      phone: string;
      propertyId?: string;
      type?: 'viewing' | 'general' | 'valuation';
      visitType?: 'in_person' | 'virtual';
      virtualPlatform?: string;
      scheduledDate?: string;
      scheduledTime?: string;
      notes?: string;
    }) => {
      const response = await customerApi.post('/enquiries', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-enquiries'] });
    },
  });
}

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();
  const { refreshProfile } = useCustomerAuth();

  return useMutation({
    mutationFn: async (data: { name?: string; phone?: string; preferences?: any }) => {
      const response = await customerApi.put('/me', data);
      return response.data.data;
    },
    onSuccess: async () => {
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
    },
  });
}

export function useCustomerOffers() {
  const { customer } = useCustomerAuth();

  return useQuery({
    queryKey: ['customer-offers', customer?._id],
    queryFn: async (): Promise<any[]> => {
      const response = await customerApi.get('/offers');
      return response.data.data;
    },
    enabled: !!customer,
  });
}

