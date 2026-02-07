"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ClipboardCheck,
  History,
  ArrowLeftRight,
  Users,
  Calendar,
  Settings,
  MapPin,
  FileText,
} from "lucide-react";
import { useAuthStore } from "@/stores";
import { cn } from "@/lib/utils";

const teacherNavItems = [
  { href: "/absen", label: "Absen", icon: ClipboardCheck },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/tukar-jadwal", label: "Tukar", icon: ArrowLeftRight },
];

const adminNavItems = [
  { href: "/admin/guru", label: "Guru", icon: Users },
  { href: "/admin/jadwal", label: "Jadwal", icon: Calendar },
  { href: "/admin/rekap", label: "Rekap", icon: FileText },
  { href: "/admin/peta", label: "Peta", icon: MapPin },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const isAdmin = useAuthStore((state) => state.isAdmin);

  // ✅ Admin: Show 5 admin items only
  // ✅ Guru: Show 2 teacher items only
  const navItems = isAdmin ? adminNavItems : teacherNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

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

// ✅ Remove MobileModeSwitcher - not needed anymore