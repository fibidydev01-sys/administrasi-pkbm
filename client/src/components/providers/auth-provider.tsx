"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
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

  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const hasFetched = useAuthStore((state) => state.hasFetched);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const storeLogout = useAuthStore((state) => state.logout);
  const reset = useAuthStore((state) => state.reset);

  useEffect(() => {
    if (!hasFetched && !isLoading) {
      fetchUser();
    }
  }, []);

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
        if (!state.user) {
          fetchUser();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      authListenerSetup.current = false;
    };
  }, [router, reset, fetchUser]);

  const logout = async () => {
    await storeLogout();
    router.push("/login");
  };

  const refetch = async () => {
    useAuthStore.setState({ hasFetched: false, isLoading: false, fetchPromise: null });
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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

  const storeUser = useAuthStore((state) => state.user);
  const storeIsLoading = useAuthStore((state) => state.isLoading);
  const storeIsAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const storeIsAdmin = useAuthStore((state) => state.isAdmin);

  if (context) {
    return context;
  }

  return {
    user: storeUser,
    isLoading: storeIsLoading,
    isAuthenticated: storeIsAuthenticated,
    isAdmin: storeIsAdmin,
    logout: async () => {},
    refetch: async () => {},
  };
}
