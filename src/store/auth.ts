import { create } from 'zustand';

export type UserRole = 'seller' | 'reviewer' | 'inspector' | 'ip_owner' | 'finance';

interface User {
  id: number;
  username: string;
  role: UserRole;
  company_name: string;
  reputation_score: number;
  deposit_balance: number;
  deposit_frozen: number;
  status: string;
  region: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  isRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  login: async (username: string, password: string, role: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || '登录失败');
      }
      set({ user: data.data, loading: false, error: null });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '登录失败';
      set({ loading: false, error: message });
      throw err;
    }
  },

  logout: () => {
    set({ user: null, error: null });
  },

  fetchUser: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    try {
      const res = await fetch(`/api/auth/me?user_id=${userId}`);
      const data = await res.json();
      if (data.success) {
        set({ user: data.data });
      }
    } catch {
      // silently fail
    }
  },

  isRole: (role: UserRole) => get().user?.role === role,
}));
