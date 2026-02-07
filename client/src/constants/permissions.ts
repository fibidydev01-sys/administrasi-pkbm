import type { Permissions, UserRole } from "@/types";

/**
 * Default permissions per role
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permissions> = {
  super_admin: {
    surat: { create: true, read: true, update: true, delete: true, approve: true },
    lembaga: { create: true, read: true, update: true, delete: true },
    user: { create: true, read: true, update: true, delete: true },
    settings: { access: true },
  },
  admin_tu: {
    surat: { create: true, read: true, update: true, delete: true, approve: true },
    lembaga: { create: false, read: true, update: true, delete: false },
    user: { create: true, read: true, update: true, delete: false },
    settings: { access: true },
  },
  staff: {
    surat: { create: true, read: true, update: true, delete: false, approve: false },
    lembaga: { create: false, read: true, update: false, delete: false },
    user: { create: false, read: false, update: false, delete: false },
    settings: { access: false },
  },
  kepala: {
    surat: { create: false, read: true, update: false, delete: false, approve: true },
    lembaga: { create: false, read: true, update: false, delete: false },
    user: { create: false, read: true, update: false, delete: false },
    settings: { access: false },
  },
};

/**
 * Role display names
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin_tu: "Admin TU",
  staff: "Staff",
  kepala: "Kepala Lembaga",
};
