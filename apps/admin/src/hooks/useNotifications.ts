import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export interface NotificationItem {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications(page = 1, limit = 15) {
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: async (): Promise<{ data: NotificationItem[]; total: number }> => {
      const response = await api.get('/notifications', { params: { page, limit } });
      return {
        data: response.data.data,
        total: response.data.pagination?.total || 0,
      };
    },
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async (): Promise<number> => {
      const response = await api.get('/notifications/unread-count');
      return response.data.data?.count || 0;
    },
    refetchInterval: 15000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch(`/notifications/${id}/read`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.patch('/notifications/read-all');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });
}

// Real-time Socket.IO listener for live notification alerts
export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let socket: Socket | null = null;
    try {
      socket = io('/', {
        path: '/socket.io',
        withCredentials: true,
        transports: ['polling', 'websocket'],
      });

      socket.on('connect', () => {
        // Socket connected
      });

      socket.on('new_notification', () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      });
    } catch {
      // Ignore in offline / dev environments
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, queryClient]);
}
