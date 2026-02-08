import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  Settings,
  BarChart3,
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

export const staffNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Surat Keluar",
    href: "/surat",
    icon: FileText,
  },
  {
    title: "Lembaga",
    href: "/lembaga",
    icon: Building2,
  },
];

export const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Surat Keluar",
    href: "/surat",
    icon: FileText,
  },
  {
    title: "Laporan",
    href: "/laporan",
    icon: BarChart3,
  },
];

export const adminManageItems: NavItem[] = [
  {
    title: "Lembaga",
    href: "/admin/lembaga",
    icon: Building2,
    adminOnly: true,
  },
  {
    title: "Pengguna",
    href: "/admin/pengguna",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Pengaturan",
    href: "/admin/pengaturan",
    icon: Settings,
    adminOnly: true,
  },
];

export function getNavItems(isAdmin: boolean): NavSection[] {
  if (isAdmin) {
    return [
      {
        title: "Menu Utama",
        items: adminNavItems,
      },
      {
        title: "Administrasi",
        items: adminManageItems,
      },
    ];
  }

  return [
    {
      items: staffNavItems,
    },
  ];
}

export function getAllNavItems(isAdmin: boolean): NavItem[] {
  if (isAdmin) {
    return [...adminNavItems, ...adminManageItems];
  }
  return staffNavItems;
}
