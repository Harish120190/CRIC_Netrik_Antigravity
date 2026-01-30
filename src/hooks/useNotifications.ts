import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { generateUUID } from '@/services/mockDatabase';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
}

const STORAGE_KEY = 'cric_hub_notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      const dataJson = localStorage.getItem(STORAGE_KEY);
      const all: Notification[] = dataJson ? JSON.parse(dataJson) : [];
      const filtered = all.filter(n => n.user_id === user.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(filtered);
      setUnreadCount(filtered.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    const dataJson = localStorage.getItem(STORAGE_KEY);
    const all: Notification[] = dataJson ? JSON.parse(dataJson) : [];
    const index = all.findIndex(n => n.id === notificationId);

    if (index !== -1) {
      all[index].read = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const dataJson = localStorage.getItem(STORAGE_KEY);
    const all: Notification[] = dataJson ? JSON.parse(dataJson) : [];

    const updated = all.map(n => n.user_id === user.id ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
