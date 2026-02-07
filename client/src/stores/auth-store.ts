import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Guru } from "@/types";

interface AuthState {
  guru: Guru | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasFetched: boolean;
  fetchPromise: Promise<void> | null; // ✅ Track ongoing fetch

  setGuru: (guru: Guru | null) => void;
  setLoading: (loading: boolean) => void;
  fetchGuru: () => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  guru: null,
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  hasFetched: false,
  fetchPromise: null,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  setGuru: (guru) => {
    set({
      guru,
      isAuthenticated: !!guru,
      isAdmin: guru?.is_admin ?? false,
      isLoading: false,
      hasFetched: true,
      fetchPromise: null,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  fetchGuru: async () => {
    const state = get();

    // ✅ FIXED: If already fetched and has guru, skip
    if (state.hasFetched && state.guru) {
      return;
    }

    // ✅ FIXED: If there's an ongoing fetch, wait for it
    if (state.fetchPromise) {
      return state.fetchPromise;
    }

    // ✅ FIXED: If already loading, skip (prevent double calls)
    if (state.isLoading) {
      return;
    }

    const supabase = createClient();

    const fetchPromise = (async () => {
      try {
        set({ isLoading: true, fetchPromise: null });

        // ✅ Check session first (faster than getUser)
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          set({
            guru: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            hasFetched: true,
            fetchPromise: null,
          });
          return;
        }

        const { data: guru, error } = await supabase
          .from("guru")
          .select("*")
          .eq("auth_user_id", session.user.id)
          .eq("is_active", true)
          .single();

        if (error || !guru) {
          console.error("Error fetching guru:", error);
          set({
            guru: null,
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
            hasFetched: true,
            fetchPromise: null,
          });
          return;
        }

        // Update last login (fire and forget)
        supabase
          .from("guru")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", guru.id)
          .then(() => { })
          .catch(() => { });

        set({
          guru,
          isAuthenticated: true,
          isAdmin: guru.is_admin,
          isLoading: false,
          hasFetched: true,
          fetchPromise: null,
        });
      } catch (error) {
        console.error("fetchGuru error:", error);
        set({
          guru: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
          hasFetched: true,
          fetchPromise: null,
        });
      }
    })();

    // ✅ Store the promise so other calls can wait for it
    set({ fetchPromise });

    return fetchPromise;
  },

  logout: async () => {
    const supabase = createClient();

    // ✅ Reset state FIRST before signOut
    set({
      guru: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      hasFetched: false, // ✅ Reset to false so next login will fetch
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
      hasFetched: false, // ✅ Explicitly reset
    });
  },
}));