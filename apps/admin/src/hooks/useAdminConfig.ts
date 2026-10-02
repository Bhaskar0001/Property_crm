import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1' });

// --- Countries ---
export const useCountries = () => useQuery({ queryKey: ['countries'], queryFn: () => api.get('/admin/countries').then(res => res.data) });
export const useCreateCountry = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data: any) => api.post('/admin/countries', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['countries'] }) });
};
export const useUpdateCountry = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/admin/countries/${id}`, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['countries'] }) });
};
export const useDeleteCountry = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => api.delete(`/admin/countries/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['countries'] }) });
};

// --- Currencies ---
export const useCurrencies = () => useQuery({ queryKey: ['currencies'], queryFn: () => api.get('/admin/currencies').then(res => res.data) });
export const useCreateCurrency = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data: any) => api.post('/admin/currencies', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['currencies'] }) });
};
export const useUpdateCurrency = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/admin/currencies/${id}`, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['currencies'] }) });
};
export const useDeleteCurrency = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => api.delete(`/admin/currencies/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['currencies'] }) });
};
export const useSetDefaultCurrency = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => api.post(`/admin/currencies/${id}/default`), onSuccess: () => qc.invalidateQueries({ queryKey: ['currencies'] }) });
};

// --- Property Types ---
export const usePropertyTypes = () => useQuery({ queryKey: ['propertyTypes'], queryFn: () => api.get('/admin/property-types').then(res => res.data) });
export const useCreatePropertyType = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data: any) => api.post('/admin/property-types', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['propertyTypes'] }) });
};
export const useUpdatePropertyType = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/admin/property-types/${id}`, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['propertyTypes'] }) });
};
export const useDeletePropertyType = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => api.delete(`/admin/property-types/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['propertyTypes'] }) });
};

// --- Listing Types ---
export const useListingTypes = () => useQuery({ queryKey: ['listingTypes'], queryFn: () => api.get('/admin/listing-types').then(res => res.data) });
export const useCreateListingType = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data: any) => api.post('/admin/listing-types', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['listingTypes'] }) });
};
export const useUpdateListingType = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/admin/listing-types/${id}`, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['listingTypes'] }) });
};
export const useDeleteListingType = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => api.delete(`/admin/listing-types/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['listingTypes'] }) });
};

// --- Tenure Types ---
export const useTenureTypes = () => useQuery({ queryKey: ['tenureTypes'], queryFn: () => api.get('/admin/tenure-types').then(res => res.data) });
export const useCreateTenureType = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data: any) => api.post('/admin/tenure-types', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['tenureTypes'] }) });
};
export const useUpdateTenureType = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/admin/tenure-types/${id}`, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['tenureTypes'] }) });
};
export const useDeleteTenureType = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => api.delete(`/admin/tenure-types/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['tenureTypes'] }) });
};

// --- Property Statuses ---
export const usePropertyStatuses = () => useQuery({ queryKey: ['propertyStatuses'], queryFn: () => api.get('/admin/property-statuses').then(res => res.data) });
export const useCreatePropertyStatus = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data: any) => api.post('/admin/property-statuses', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['propertyStatuses'] }) });
};
export const useUpdatePropertyStatus = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/admin/property-statuses/${id}`, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['propertyStatuses'] }) });
};
export const useDeletePropertyStatus = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => api.delete(`/admin/property-statuses/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['propertyStatuses'] }) });
};

// --- Property Features ---
export const usePropertyFeatures = () => useQuery({ queryKey: ['propertyFeatures'], queryFn: () => api.get('/admin/property-features').then(res => res.data) });
export const useCreatePropertyFeature = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data: any) => api.post('/admin/property-features', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['propertyFeatures'] }) });
};
export const useUpdatePropertyFeature = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/admin/property-features/${id}`, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['propertyFeatures'] }) });
};
export const useDeletePropertyFeature = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => api.delete(`/admin/property-features/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['propertyFeatures'] }) });
};

// --- Lead Sources ---
export const useLeadSources = () => useQuery({ queryKey: ['leadSources'], queryFn: () => api.get('/admin/lead-sources').then(res => res.data) });
export const useCreateLeadSource = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data: any) => api.post('/admin/lead-sources', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['leadSources'] }) });
};
export const useUpdateLeadSource = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/admin/lead-sources/${id}`, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['leadSources'] }) });
};
export const useDeleteLeadSource = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => api.delete(`/admin/lead-sources/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['leadSources'] }) });
};

// --- Lead Stages ---
export const useLeadStages = () => useQuery({ queryKey: ['leadStages'], queryFn: () => api.get('/admin/lead-stages').then(res => res.data) });
export const useCreateLeadStage = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data: any) => api.post('/admin/lead-stages', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['leadStages'] }) });
};
export const useUpdateLeadStage = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/admin/lead-stages/${id}`, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['leadStages'] }) });
};
export const useDeleteLeadStage = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (id: string) => api.delete(`/admin/lead-stages/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['leadStages'] }) });
};

// --- Staff Management ---
export const useStaffList = () => useQuery({ queryKey: ['staff'], queryFn: () => api.get('/staff').then(res => res.data) });
export const useStaffMember = (id: string) => useQuery({ queryKey: ['staff', id], queryFn: () => api.get(`/staff/${id}`).then(res => res.data), enabled: !!id });
export const useCreateStaff = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: (data: any) => api.post('/staff', data), onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }) });
};
export const useUpdateStaff = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/staff/${id}`, data), onSuccess: (_data, variables) => { qc.invalidateQueries({ queryKey: ['staff'] }); qc.invalidateQueries({ queryKey: ['staff', variables.id] }); } });
};
export const useUpdateStaffPermissions = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, permissions }: { id: string, permissions: any }) => api.put(`/staff/${id}/permissions`, permissions), onSuccess: (_data, variables) => { qc.invalidateQueries({ queryKey: ['staff'] }); qc.invalidateQueries({ queryKey: ['staff', variables.id] }); } });
};
export const useToggleStaffActive = () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: ({ id, active }: { id: string, active: boolean }) => api.patch(`/staff/${id}/active`, { active }), onSuccess: (_data, variables) => { qc.invalidateQueries({ queryKey: ['staff'] }); qc.invalidateQueries({ queryKey: ['staff', variables.id] }); } });
};
export const useResetStaffPassword = () => {
    return useMutation({ mutationFn: ({ id, data }: { id: string, data: any }) => api.post(`/staff/${id}/reset-password`, data) });
};
