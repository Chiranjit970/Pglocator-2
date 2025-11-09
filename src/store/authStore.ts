import { create } from 'zustand';

export type UserRole = 'student' | 'owner' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  // Student specific
  course?: string;
  rollNo?: string;
  gender?: 'male' | 'female' | 'other';
  // Owner specific
  businessName?: string;
  // Admin specific
  verified?: boolean;
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setAccessToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  logout: () => {
    set({ user: null, accessToken: null });
    localStorage.removeItem('userRole');
  },
}));
