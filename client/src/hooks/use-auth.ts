"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";

/**
 * Main auth hook - simplified, no auth listener here
 * Auth listener is ONLY in DashboardLayout
 */
export function useAuth() {
  const router = useRouter();
  const guru = useAuthStore((state) => state.guru);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const hasFetched = useAuthStore((state) => state.hasFetched);
  const fetchGuru = useAuthStore((state) => state.fetchGuru);
  const storeLogout = useAuthStore((state) => state.logout);

  // ✅ FIXED: Only fetch if not fetched yet
  useEffect(() => {
    if (!hasFetched && !isLoading) {
      fetchGuru();
    }
  }, [hasFetched, isLoading, fetchGuru]);

  const logout = useCallback(async () => {
    await storeLogout();
    router.push("/login");
  }, [storeLogout, router]);

  const refetch = useCallback(async () => {
    // ✅ Force refetch by resetting hasFetched
    useAuthStore.setState({ hasFetched: false, isLoading: false, fetchPromise: null });
    await fetchGuru();
  }, [fetchGuru]);

  return {
    guru,
    isLoading,
    isAuthenticated,
    isAdmin,
    hasFetched,
    logout,
    refetch,
  };
}

/**
 * Hook to require authentication
 */
export function useRequireAuth() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasFetched = useAuthStore((state) => state.hasFetched);
  const fetchGuru = useAuthStore((state) => state.fetchGuru);

  // Fetch on mount if needed
  useEffect(() => {
    if (!hasFetched && !isLoading) {
      fetchGuru();
    }
  }, [hasFetched, isLoading, fetchGuru]);

  // Redirect if not authenticated
  useEffect(() => {
    if (hasFetched && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, hasFetched, router]);

  return {
    isLoading: isLoading || !hasFetched,
    isAuthenticated
  };
}

/**
 * Hook to require admin access
 */
export function useRequireAdmin() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasFetched = useAuthStore((state) => state.hasFetched);
  const fetchGuru = useAuthStore((state) => state.fetchGuru);

  // Fetch on mount if needed
  useEffect(() => {
    if (!hasFetched && !isLoading) {
      fetchGuru();
    }
  }, [hasFetched, isLoading, fetchGuru]);

  // Redirect based on auth state
  useEffect(() => {
    if (hasFetched && !isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/absen");
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, hasFetched, router]);

  return {
    isLoading: isLoading || !hasFetched,
    isAdmin
  };
}