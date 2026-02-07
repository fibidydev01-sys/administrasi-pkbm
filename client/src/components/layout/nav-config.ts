import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
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
];

export const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    adminOnly: true,
  },
  {
    title: "Surat Keluar",
    href: "/surat",
    icon: FileText,
    adminOnly: true,
  },
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
        title: "Administrasi",
        items: adminNavItems,
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
  return isAdmin ? adminNavItems : staffNavItems;
}
