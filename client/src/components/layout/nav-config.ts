import {
  Camera,
  History,
  Users,
  Calendar,
  FileText,
  MapPin,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

/**
 * ✅ Guru navigation items
 */
export const userNavItems: NavItem[] = [
  {
    title: "Absen",
    href: "/absen",
    icon: Camera,
  },
  {
    title: "Riwayat",
    href: "/riwayat",
    icon: History,
  },
];

/**
 * ✅ Admin navigation items - REMOVED DASHBOARD
 */
export const adminNavItems: NavItem[] = [
  {
    title: "Guru",
    href: "/admin/guru",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Jadwal",
    href: "/admin/jadwal",
    icon: Calendar,
    adminOnly: true,
  },
  {
    title: "Rekap",
    href: "/admin/rekap",
    icon: FileText,
    adminOnly: true,
  },
  {
    title: "Peta",
    href: "/admin/peta",
    icon: MapPin,
    adminOnly: true,
  },
  {
    title: "Pengaturan",
    href: "/admin/pengaturan",
    icon: Settings,
    adminOnly: true,
  },
];

/**
 * Get navigation items based on user role
 */
export function getNavItems(isAdmin: boolean): NavSection[] {
  if (isAdmin) {
    return [
      {
        title: "Menu Guru",
        items: userNavItems,
      },
      {
        title: "Admin",
        items: adminNavItems,
      },
    ];
  }

  return [
    {
      items: userNavItems,
    },
  ];
}

/**
 * Get all navigation items as flat array
 */
export function getAllNavItems(isAdmin: boolean): NavItem[] {
  return isAdmin ? [...userNavItems, ...adminNavItems] : userNavItems;
}