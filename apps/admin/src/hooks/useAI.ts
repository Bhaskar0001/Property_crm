import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';

export function useGeneratePropertyDescription() {
  return useMutation({
    mutationFn: async (data: {
      title: string;
      city: string;
      area?: string;
      price?: number;
      bedrooms?: number;
      bathrooms?: number;
      livingArea?: number;
      features?: string[];
      propertyType?: string;
      berRating?: string;
    }) => {
      const res = await api.post('/ai/generate-description', data);
      return res.data.data as {
        shortDescription: string;
        description: string;
        keyHighlights: string[];
      };
    },
  });
}

export function useExtractRequirements() {
  return useMutation({
    mutationFn: async (text: string) => {
      const res = await api.post('/ai/extract-requirements', { text });
      return res.data.data as {
        minBudget?: number;
        maxBudget?: number;
        bedrooms?: number;
        preferredLocations: string[];
        propertyType?: string;
        timeline?: string;
        summary: string;
      };
    },
  });
}

export function useSummarizeConversation() {
  return useMutation({
    mutationFn: async (messages: { direction: string; content: string }[]) => {
      const res = await api.post('/ai/summarize-conversation', { messages });
      return res.data.data as {
        summary: string;
        keyPoints: string[];
        actionItems: string[];
        sentiment: 'positive' | 'neutral' | 'skeptical';
      };
    },
  });
}

export function useNaturalLanguageSearch() {
  return useMutation({
    mutationFn: async (query: string) => {
      const res = await api.post('/ai/search', { query });
      return res.data.data as {
        interpretedFilters: any;
        explanation: string;
        results: any[];
      };
    },
  });
}

export function useDashboardQuery() {
  return useMutation({
    mutationFn: async (question: string) => {
      const res = await api.post('/ai/dashboard-query', { question });
      return res.data.data as {
        answer: string;
        metrics: any;
      };
    },
  });
}
