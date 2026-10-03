import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import api from '../lib/api';

export interface WhatsAppMessage {
  _id: string;
  conversation: string;
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'document' | 'template';
  content: string;
  mediaUrl?: string;
  whatsappMessageId?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentBy?: { _id: string; name: string; email: string };
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  phoneNumber: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount: number;
  isOptedOut: boolean;
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
    property?: {
      _id: string;
      title: string;
      slug: string;
      price: number;
      city: string;
      coverImage?: string;
    };
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface WhatsAppTemplate {
  _id: string;
  name: string;
  language: string;
  category: string;
  body: string;
  headerType?: string;
  headerContent?: string;
  isApproved: boolean;
}

export function useWhatsAppConversations() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: Socket | null = null;
    try {
      socket = io('/', {
        path: '/socket.io',
        withCredentials: true,
        transports: ['polling', 'websocket'],
      });

      const handleNewMessage = (payload: { conversationId: string; message: WhatsAppMessage }) => {
        queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
        queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', payload.conversationId] });
      };

      socket.on('whatsapp_message', handleNewMessage);
    } catch {
      // Ignore in dev without socket server
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['whatsapp-conversations'],
    queryFn: async () => {
      const res = await api.get('/whatsapp/conversations');
      return (res.data.data || []) as Conversation[];
    },
  });
}

export function useWhatsAppMessages(conversationId?: string) {
  return useQuery({
    queryKey: ['whatsapp-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return { conversation: null, messages: [] };
      const res = await api.get(`/whatsapp/conversations/${conversationId}/messages`);
      return res.data.data as { conversation: Conversation; messages: WhatsAppMessage[] };
    },
    enabled: !!conversationId,
  });
}

export function useSendWhatsAppMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      conversationId?: string;
      leadId?: string;
      to?: string;
      text: string;
    }) => {
      const res = await api.post('/whatsapp/send', data);
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      if (vars.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', vars.conversationId] });
      }
    },
  });
}

export function useSendPropertyCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      conversationId?: string;
      leadId?: string;
      propertyId: string;
      to?: string;
    }) => {
      const res = await api.post('/whatsapp/send-property', data);
      return res.data.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      if (vars.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', vars.conversationId] });
      }
    },
  });
}

export function useWhatsAppTemplates() {
  return useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: async () => {
      const res = await api.get('/whatsapp/templates');
      return (res.data.data || []) as WhatsAppTemplate[];
    },
  });
}

export function useRunWhatsAppCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      templateId: string;
      filterByStage?: string;
    }) => {
      const res = await api.post('/whatsapp/campaigns', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
    },
  });
}
