import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasFetched: boolean;
  fetchPromise: Promise<void> | null;

  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  hasFetched: false,
  fetchPromise: null,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  setUser: (user) => {
    const role = user?.role ?? "";
    set({
      user,
      isAuthenticated: !!user,
      isAdmin: role === "super_admin" || role === "admin_tu",
      isLoading: false,
      hasFetched: true,
      fetchPromise: null,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  fetchUser: async () => {
    const state = get();

    if (state.hasFetched && state.user) {
      return;
    }

    if (state.fetchPromise) {
      return state.fetchPromise;
    }

    if (state.isLoading) {
      return;
    }

    const supabase = createClient();

    const fetchPromise = (async () => {
      try {
        set({ isLoading: true, fetchPromise: null });

        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            hasFetched: true,
            fetchPromise: null,
          });
          return;
        }

        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .eq("is_active", true)
          .single();

        if (error || !profile) {
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            hasFetched: true,
            fetchPromise: null,
          });
          return;
        }

        const role = profile.role;
        set({
          user: profile,
          isAuthenticated: true,
          isAdmin: role === "super_admin" || role === "admin_tu",
          isLoading: false,
          hasFetched: true,
          fetchPromise: null,
        });
      } catch (error) {
        console.error("fetchUser error:", error);
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
          hasFetched: true,
          fetchPromise: null,
        });
      }
    })();

    set({ fetchPromise });

    return fetchPromise;
  },

  logout: async () => {
    const supabase = createClient();

    set({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      hasFetched: false,
      fetchPromise: null,
    });

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  reset: () => {
    set({
      ...initialState,
      hasFetched: false,
    });
  },
}));
