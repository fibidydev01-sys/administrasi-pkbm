"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { createClient } from "@/lib/supabase/client";
import type { Guru } from "@/types";

interface AuthContextType {
  guru: Guru | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const authListenerSetup = useRef(false);

  const guru = useAuthStore((state) => state.guru);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const hasFetched = useAuthStore((state) => state.hasFetched);
  const fetchGuru = useAuthStore((state) => state.fetchGuru);
  const storeLogout = useAuthStore((state) => state.logout);
  const reset = useAuthStore((state) => state.reset);

  // Fetch on mount - only once
  useEffect(() => {
    if (!hasFetched && !isLoading) {
      fetchGuru();
    }
  }, []);

  // Single auth listener
  useEffect(() => {
    if (authListenerSetup.current) return;
    authListenerSetup.current = true;

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        reset();
        router.push("/login");
      } else if (event === "SIGNED_IN" && session) {
        const state = useAuthStore.getState();
        if (!state.guru) {
          fetchGuru();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      authListenerSetup.current = false;
    };
  }, [router, reset, fetchGuru]);

  const logout = async () => {
    await storeLogout();
    router.push("/login");
  };

  const refetch = async () => {
    useAuthStore.setState({ hasFetched: false, isLoading: false, fetchPromise: null });
    await fetchGuru();
  };

  return (
    <AuthContext.Provider
      value={{
        guru,
        isLoading,
        isAuthenticated,
        isAdmin,
        logout,
        refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  // Fallback to store if not in provider (for backward compatibility)
  const storeGuru = useAuthStore((state) => state.guru);
  const storeIsLoading = useAuthStore((state) => state.isLoading);
  const storeIsAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const storeIsAdmin = useAuthStore((state) => state.isAdmin);

  if (context) {
    return context;
  }

  // Fallback
  return {
    guru: storeGuru,
    isLoading: storeIsLoading,
    isAuthenticated: storeIsAuthenticated,
    isAdmin: storeIsAdmin,
    logout: async () => { },
    refetch: async () => { },
  };
}