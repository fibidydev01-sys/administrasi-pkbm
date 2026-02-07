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
  { href: "/tukar-jadwal", label: "Tukar Jadwal", icon: ArrowLeftRight },
];

const adminNavItems = [
  { href: "/admin/guru", label: "Guru", icon: Users },
  { href: "/admin/jadwal", label: "Jadwal", icon: Calendar },
  { href: "/admin/rekap", label: "Rekap", icon: FileText },
  { href: "/admin/peta", label: "Peta", icon: MapPin },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const navItems = isAdmin ? [...adminNavItems, ...teacherNavItems] : teacherNavItems;

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50 border-r bg-background">
      <div className="h-14 border-b" />

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}