import { create } from 'zustand';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SettingsState {
  logoUrl: string;
  loading: boolean;
  init: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => {
  let initialized = false;
  return {
    logoUrl: '',
    loading: true,
    init: () => {
      if (initialized) return;
      initialized = true;
      const docRef = doc(db, 'settings', 'general');
      onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          set({
            logoUrl: data.logoUrl || '',
            loading: false
          });
        } else {
          set({ loading: false });
        }
      }, (err) => {
        console.warn("Failed to fetch settings:", err);
        initialized = false; // allow retry
        set({ loading: false });
      });
    }
  };
});
