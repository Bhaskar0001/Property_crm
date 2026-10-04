import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useProperties = (filters: any) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const { data } = await api.get('/properties', { params: filters });
      return data;
    },
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data } = await api.get(`/properties/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/properties', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const { data } = await api.put(`/properties/${id}`, payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
    },
  });
};

export const useUpdatePropertyStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/properties/${id}/status`, { status });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
    },
  });
};

export const useTogglePublishProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const { data } = await api.patch(`/properties/${id}/publish`, { isPublished });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/properties/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
};

export const usePropertyMedia = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-media', propertyId],
    queryFn: async () => {
      const { data } = await api.get(`/media/property/${propertyId}`);
      return data?.data || data || [];
    },
    enabled: !!propertyId,
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ propertyId, formData }: { propertyId: string; formData: FormData }) => {
      const { data } = await api.post(`/media/upload/${propertyId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-media', variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.propertyId] });
    },
  });
};

export const useSetCoverMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, propertyId }: { id: string; propertyId: string }) => {
      const { data } = await api.patch(`/media/${id}/cover`, { propertyId });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-media', variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.propertyId] });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; propertyId: string }) => {
      const { data } = await api.delete(`/media/${id}`);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-media', variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.propertyId] });
    },
  });
};

export const useAddEmbedMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ propertyId, url, type, title }: { propertyId: string; url: string; type?: string; title?: string }) => {
      const { data } = await api.post(`/media/embed/${propertyId}`, { url, type, title });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-media', variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.propertyId] });
    },
  });
};

export const usePropertyDocuments = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-documents', propertyId],
    queryFn: async () => {
      const { data } = await api.get(`/documents/property/${propertyId}`);
      return data?.data || data || [];
    },
    enabled: !!propertyId,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ propertyId, formData }: { propertyId: string; formData: FormData }) => {
      const { data } = await api.post(`/documents/upload/${propertyId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-documents', variables.propertyId] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; propertyId: string }) => {
      const { data } = await api.delete(`/documents/${id}`);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property-documents', variables.propertyId] });
    },
  });
};

export const useImportProperties = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rows: any[]) => {
      const { data } = await api.post('/properties/import', { rows });
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const downloadPropertiesCsv = async (filters: any) => {
  const response = await api.get('/properties/export', {
    params: filters,
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `properties-export-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

