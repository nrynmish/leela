import { create } from "zustand";

import {
  getCurrentUser,
  login,
} from "@/lib/auth";

import type {
  LoginRequest,
  User,
} from "@/types/auth";

interface AuthState {
  user: User | null;

  isAuthenticated: boolean;
  isLoading: boolean;

  loginUser: (
    payload: LoginRequest,
  ) => Promise<void>;

  logout: () => void;

  loadUser: () => Promise<void>;
}

export const useAuthStore =
  create<AuthState>((set) => ({
    user: null,

    isAuthenticated: false,
    isLoading: true,

    loginUser: async (payload) => {
      const tokens = await login(payload);

      localStorage.setItem(
        "access_token",
        tokens.access_token,
      );

      localStorage.setItem(
        "refresh_token",
        tokens.refresh_token,
      );

      const user =
        await getCurrentUser();

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    },

    loadUser: async () => {
      const token =
        localStorage.getItem(
          "access_token",
        );

      if (!token) {
        set({
          isLoading: false,
        });

        return;
      }

      try {
        const user =
          await getCurrentUser();

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem(
          "access_token",
        );

        localStorage.removeItem(
          "refresh_token",
        );

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },

    logout: () => {
      localStorage.removeItem(
        "access_token",
      );

      localStorage.removeItem(
        "refresh_token",
      );

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    },
  }));