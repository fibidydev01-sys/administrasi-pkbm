"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";

export function useAuth() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const hasFetched = useAuthStore((state) => state.hasFetched);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const storeLogout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!hasFetched && !isLoading) {
      fetchUser();
    }
  }, [hasFetched, isLoading, fetchUser]);

  const logout = useCallback(async () => {
    await storeLogout();
    router.push("/login");
  }, [storeLogout, router]);

  const refetch = useCallback(async () => {
    useAuthStore.setState({ hasFetched: false, isLoading: false, fetchPromise: null });
    await fetchUser();
  }, [fetchUser]);

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    hasFetched,
    logout,
    refetch,
  };
}

export function useRequireAuth() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasFetched = useAuthStore((state) => state.hasFetched);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    if (!hasFetched && !isLoading) {
      fetchUser();
    }
  }, [hasFetched, isLoading, fetchUser]);

  useEffect(() => {
    if (hasFetched && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, hasFetched, router]);

  return {
    isLoading: isLoading || !hasFetched,
    isAuthenticated,
  };
}

export function useRequireAdmin() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasFetched = useAuthStore((state) => state.hasFetched);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    if (!hasFetched && !isLoading) {
      fetchUser();
    }
  }, [hasFetched, isLoading, fetchUser]);

  useEffect(() => {
    if (hasFetched && !isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, hasFetched, router]);

  return {
    isLoading: isLoading || !hasFetched,
    isAdmin,
  };
}
