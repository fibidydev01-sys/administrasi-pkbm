"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/stores";
import { cn } from "@/lib/utils";

const staffNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/surat", label: "Surat", icon: FileText },
];

const adminNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/surat", label: "Surat", icon: FileText },
  { href: "/admin/lembaga", label: "Lembaga", icon: Building2 },
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
  { href: "/admin/pengaturan", label: "Setting", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const navItems = isAdmin ? adminNavItems : staffNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
