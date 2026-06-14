import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  read: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationState {
  notifications: AppNotification[];
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  addNotification: (title: string, message: string, type?: AppNotification['type']) => void;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  removeAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
  addNotification: (title, message, type = 'info') => {
    const newNotif: AppNotification = {
      id: `n-${Date.now()}-${Math.random()}`,
      title,
      message,
      type,
      createdAt: new Date().toISOString(),
      read: false
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications]
    }));
  },
  fetchNotifications: async (_userId) => {
    // Start empty to show only real notifications generated during session use
    set({ notifications: [] });
  },
  markAsRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    )
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true }))
  })),
  removeNotification: (notificationId) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== notificationId)
  })),
  removeAllNotifications: () => set({ notifications: [] })
}));
