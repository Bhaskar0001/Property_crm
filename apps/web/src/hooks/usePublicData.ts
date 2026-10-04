import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../lib/api';
import {
  PublicProperty,
  PropertyDetailResponse,
  PublicCountry,
  PublicPropertyType,
  PublicListingType,
  PublicPropertiesFilter,
} from '../types';

interface PropertiesResponse {
  data: PublicProperty[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function usePublicProperties(filters: PublicPropertiesFilter = {}) {
  return useQuery({
    queryKey: ['public-properties', filters],
    queryFn: async (): Promise<PropertiesResponse> => {
      const response = await publicApi.get('/properties', { params: filters });
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    },
  });
}

export function usePublicProperty(slug: string) {
  return useQuery({
    queryKey: ['public-property', slug],
    queryFn: async (): Promise<PropertyDetailResponse> => {
      const response = await publicApi.get(`/properties/${slug}`);
      return response.data.data;
    },
    enabled: !!slug,
  });
}

export function useFeaturedProperties(limit = 6) {
  return useQuery({
    queryKey: ['featured-properties', limit],
    queryFn: async (): Promise<PublicProperty[]> => {
      const response = await publicApi.get('/featured', { params: { limit } });
      return response.data.data;
    },
  });
}

export function usePublicCountries() {
  return useQuery({
    queryKey: ['public-countries'],
    queryFn: async (): Promise<PublicCountry[]> => {
      const response = await publicApi.get('/countries');
      return response.data.data;
    },
  });
}

export function usePublicPropertyTypes() {
  return useQuery({
    queryKey: ['public-property-types'],
    queryFn: async (): Promise<PublicPropertyType[]> => {
      const response = await publicApi.get('/property-types');
      return response.data.data;
    },
  });
}

export function usePublicListingTypes() {
  return useQuery({
    queryKey: ['public-listing-types'],
    queryFn: async (): Promise<PublicListingType[]> => {
      const response = await publicApi.get('/listing-types');
      return response.data.data;
    },
  });
}

export function usePublicFeatures() {
  return useQuery({
    queryKey: ['public-features'],
    queryFn: async (): Promise<any[]> => {
      const response = await publicApi.get('/features');
      return response.data.data;
    },
  });
}

export interface ContactInfo {
  phone: string;
  whatsapp: string;
  whatsappClean: string;
  email: string;
  officeHours: string;
  videoConsultationUrl: string;
  companyName: string;
  address: string;
}

export function useContactInfo() {
  return useQuery({
    queryKey: ['public-contact-info'],
    queryFn: async (): Promise<ContactInfo> => {
      const response = await publicApi.get('/contact-info');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

