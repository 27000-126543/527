import { create } from 'zustand';

interface NotificationItem {
  id: number;
  user_id: number;
  type: 'review' | 'inspection' | 'complaint' | 'appeal' | 'refund';
  title: string;
  content: string;
  related_id: number | null;
  related_type: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (userId: number, type?: string) => Promise<void>;
  fetchUnreadCount: (userId: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: (userId: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async (userId: number, type?: string) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams({ user_id: String(userId) });
      if (type) params.set('type', type);
      const res = await fetch(`/api/notifications/list?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        const notifications = data.data ?? [];
        const unreadCount = notifications.filter((n: NotificationItem) => !n.is_read).length;
        set({ notifications, unreadCount, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async (userId: number) => {
    try {
      const res = await fetch(`/api/notifications/unread-count?user_id=${userId}`);
      const data = await res.json();
      if (data.success) {
        set({ unreadCount: data.data.unread_count });
      }
    } catch {
      // silently fail
    }
  },

  markAsRead: async (id: number) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const notifications = get().notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      set({ notifications, unreadCount });
    } catch {
      // silently fail
    }
  },

  markAllAsRead: async (userId: number) => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const notifications = get().notifications.map((n) => ({ ...n, is_read: true }));
      set({ notifications, unreadCount: 0 });
    } catch {
      // silently fail
    }
  },
}));
