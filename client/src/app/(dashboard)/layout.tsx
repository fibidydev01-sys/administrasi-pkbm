"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/stores";
import { FullPageLoader, AvatarDisplay } from "@/components/shared";
import { MobileBottomNav } from "@/components/layout/mobile-nav";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const storeLogout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await storeLogout();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block max-w-[120px] truncate">
            {user.full_name}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.full_name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {user.role.replace("_", " ")}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profil">
            <User className="mr-2 h-4 w-4" />
            Profil Saya
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const authListenerSetup = useRef(false);

  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasFetched = useAuthStore((state) => state.hasFetched);
  const fetchUser = useAuthStore((state) => state.fetchUser);
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

  useEffect(() => {
    if (hasFetched && !isLoading && !user) {
      router.push("/login");
    }
  }, [hasFetched, isLoading, user, router]);

  if (!hasFetched) {
    return <FullPageLoader text="Memuat..." />;
  }

  if (isLoading) {
    return <FullPageLoader text="Mengautentikasi..." />;
  }

  if (!user) {
    return <FullPageLoader text="Mengalihkan..." />;
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />

      <div className="flex flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src="/icon/icon-96x96.png"
                alt="PKBM"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-semibold text-sm md:text-base">Administrasi PKBM</span>
          </Link>

          <div className="flex-1" />

          <UserMenu />
        </header>

        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="container mx-auto p-4 md:p-6">{children}</div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
