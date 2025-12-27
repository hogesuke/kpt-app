import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { supabase } from '@/lib/supabase-client';

import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      session: null,
      loading: true,
      initialized: false,

      initialize: async () => {
        // 既に初期化済みなら何もしない
        const { initialized } = useAuthStore.getState();
        if (initialized) return;

        try {
          // 初期セッションを取得
          const {
            data: { session },
          } = await supabase.auth.getSession();

          set({
            session,
            user: session?.user ?? null,
            loading: false,
            initialized: true,
          });

          // 認証状態の変更を監視
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              session,
              user: session?.user ?? null,
              loading: false,
            });
          });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({ loading: false, initialized: true });
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null, session: null });
        } catch (error) {
          console.error('Failed to sign out:', error);
          throw error;
        }
      },

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
    }),
    { name: 'AuthStore' }
  )
);

// 初期化用のヘルパー関数
export const initializeAuth = () => {
  const initialize = useAuthStore.getState().initialize;
  return initialize();
};
