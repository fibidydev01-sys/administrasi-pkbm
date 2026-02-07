"use client";

import { useMemo } from "react";
import { useAuth } from "./use-auth";
import { ROLE_PERMISSIONS } from "@/constants";
import type { Permissions, UserRole } from "@/types";

const DEFAULT_PERMISSIONS: Permissions = {
  surat: { create: false, read: false, update: false, delete: false, approve: false },
  lembaga: { create: false, read: false, update: false, delete: false },
  user: { create: false, read: false, update: false, delete: false },
  settings: { access: false },
};

export function usePermissions() {
  const { user, isAdmin } = useAuth();

  const permissions = useMemo<Permissions>(() => {
    if (!user?.role) return DEFAULT_PERMISSIONS;
    return ROLE_PERMISSIONS[user.role as UserRole] ?? DEFAULT_PERMISSIONS;
  }, [user?.role]);

  const can = useMemo(() => {
    return {
      createSurat: permissions.surat.create,
      readSurat: permissions.surat.read,
      updateSurat: permissions.surat.update,
      deleteSurat: permissions.surat.delete,
      approveSurat: permissions.surat.approve,

      createLembaga: permissions.lembaga.create,
      readLembaga: permissions.lembaga.read,
      updateLembaga: permissions.lembaga.update,
      deleteLembaga: permissions.lembaga.delete,

      manageUsers: permissions.user.create || permissions.user.update,
      accessSettings: permissions.settings.access,
    };
  }, [permissions]);

  return {
    permissions,
    can,
    isAdmin,
    role: (user?.role as UserRole) ?? null,
  };
}
