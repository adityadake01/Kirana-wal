import { create } from 'zustand';
import { User } from 'firebase/auth';

export type UserRole = 'customer' | 'shopkeeper' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned' | 'rejected' | null;

interface AuthState {
  user: User | null;
  role: UserRole | null;
  status: UserStatus;
  loading: boolean;
  setUser: (user: User | null, role: UserRole | null, status?: UserStatus) => void;
  signOut: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

import { auth } from '../lib/firebase';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  status: null,
  loading: true,
  setUser: (user, role, status = 'active') => set({ user, role, status }),
  signOut: async () => {
    await auth.signOut();
    set({ user: null, role: null, status: null });
  },
  setLoading: (loading) => set({ loading }),
}));
