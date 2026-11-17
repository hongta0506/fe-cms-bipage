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
          // biome-ignore lint/suspicious/noDocumentCookie: auth cookie is required for middleware authentication
          document.cookie = `auth-token=${token}; path=/; max-age=86400`;
          document.cookie = `token=${token}; path=/; max-age=86400`;
          set({ user, token, isLoading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Login failed";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        api.setToken(null);
        // biome-ignore lint/suspicious/noDocumentCookie: auth cookie is required for middleware authentication
        document.cookie = "auth-token=; path=/; max-age=0";
        document.cookie = "token=; path=/; max-age=0";
        set({ user: null, token: null });
      },

      initialize: async () => {
        const { token } = get();
        // Never fall back to a hardcoded token here: the previous default was an expired
        // JWT, and re-applying it made /api/auth/me, /api/schema and /api/content/domains
        // answer 401 while also overwriting a valid session cookie. Bootstrap from the
        // cookie the middleware already trusts instead.
        // biome-ignore lint/suspicious/noDocumentCookie: auth cookie is required for middleware authentication
        const cookieToken =
          typeof document !== "undefined"
            ? (document.cookie.match(/(?:^|;\s*)token=([^;]+)/)?.[1] ?? null)
            : null;
        const effectiveToken = token ?? cookieToken;
        if (!effectiveToken) {
          api.setToken(null);
          set({ user: null, token: null, isLoading: false });
          return;
        }
        api.setToken(effectiveToken);
        // biome-ignore lint/suspicious/noDocumentCookie: auth cookie is required for middleware authentication
        document.cookie = `auth-token=${effectiveToken}; path=/; max-age=86400`;
        document.cookie = `token=${effectiveToken}; path=/; max-age=86400`;
        set({ isLoading: true });
        try {
          const user = await api.getMe();
          set({ user, token: effectiveToken, isLoading: false });
        } catch {
          api.setToken(null);
          // biome-ignore lint/suspicious/noDocumentCookie: auth cookie is required for middleware authentication
          document.cookie = "auth-token=; path=/; max-age=0";
          document.cookie = "token=; path=/; max-age=0";
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
