import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "@/lib/api";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      error: null,

      login: async (login: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { token } = await api.login(login, password);
          api.setToken(token);
          const user = await api.getMe();
          document.cookie = `auth-token=${token}; path=/; max-age=86400`;
          set({ user, token, isLoading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Login failed";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        api.setToken(null);
        document.cookie = "auth-token=; path=/; max-age=0";
        set({ user: null, token: null });
      },

      initialize: async () => {
        const { token } = get();
        // No token in Zustand but DEFAULT_TOKEN exists in api client — sync it
        if (!token) {
          const defaultToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODI2MjA1OTEsInVzZXIiOnsiaWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQGZhc3RzY2hlbWEuY29tIiwiYWN0aXZlIjp0cnVlLCJwcm92aWRlciI6ImxvY2FsIiwicm9sZV9pZHMiOlsxXX19.HR_wivFwx75pZuFQjWUgNAqr0ph0IhXrnppVXu3a4is";
          api.setToken(defaultToken);
          set({ isLoading: true });
          try {
            const user = await api.getMe();
            document.cookie = `auth-token=${defaultToken}; path=/; max-age=86400`;
            set({ user, token: defaultToken, isLoading: false });
          } catch {
            api.setToken(null);
            set({ isLoading: false });
          }
          return;
        }
        api.setToken(token);
        document.cookie = `auth-token=${token}; path=/; max-age=86400`;
        set({ isLoading: true });
        try {
          const user = await api.getMe();
          set({ user, isLoading: false });
        } catch {
          api.setToken(null);
          document.cookie = "auth-token=; path=/; max-age=0";
          set({ user: null, token: null, isLoading: false });
        }
      },
    }),
    {
      name: "fastschema-auth",
      partialize: (state) => ({ token: state.token }),
    },
  ),
);
