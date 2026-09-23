import { create } from 'zustand';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './authStore';

export interface AppNotification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  init: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => {
  let unsubscribe: (() => void) | null = null;

  return {
    notifications: [],
    unreadCount: 0,
    loading: false,
    init: () => {
      const { user, role } = useAuthStore.getState();
      
      if (!user) {
        if (unsubscribe) unsubscribe();
        set({ notifications: [], unreadCount: 0 });
        return;
      }

      set({ loading: true });

      // We either fetch notifications where recipientId == user.uid, or if admin, maybe admin notifications?
      // For simplicity, let's just listen where recipientId == user.uid. Admins can receive them at their UID.
      const q = role === 'admin' 
        ? query(collection(db, 'notifications'), where('recipientId', 'in', [user.uid, 'admin']))
        : query(collection(db, 'notifications'), where('recipientId', '==', user.uid));

      if (unsubscribe) unsubscribe();

      unsubscribe = onSnapshot(q, (snap) => {
        const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AppNotification[];
        notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        const unreadCount = notifs.filter(n => !n.read).length;
        set({ notifications: notifs, unreadCount, loading: false });
      }, (err) => {
        console.warn("Notifications err:", err);
        set({ loading: false });
      });
    }
  };
});
