"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FullPageLoader } from "@/components/shared";
import { useAuthStore } from "@/stores";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // ✅ Use individual selectors
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const hasFetched = useAuthStore((state) => state.hasFetched);
  const guru = useAuthStore((state) => state.guru);

  // Redirect if not admin
  useEffect(() => {
    // ✅ Only redirect after fetch is complete
    if (hasFetched && !isLoading) {
      if (!isAuthenticated || !guru) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/absen");
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, hasFetched, guru, router]);

  // Show loading during initial fetch
  if (!hasFetched) {
    return <FullPageLoader text="Memuat..." />;
  }

  // Show loading while checking
  if (isLoading) {
    return <FullPageLoader text="Memeriksa akses..." />;
  }

  // Don't render if not authenticated or not admin
  if (!guru || !isAdmin) {
    return <FullPageLoader text="Mengalihkan..." />;
  }

  return <>{children}</>;
}