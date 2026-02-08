/**
 * Route constants
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  SURAT: "/surat",
  SURAT_BUAT: "/surat/buat",
  SURAT_DETAIL: (id: string) => `/surat/${id}`,
  SURAT_EDIT: (id: string) => `/surat/${id}/edit`,
  LEMBAGA: "/lembaga",
  LEMBAGA_DETAIL: (id: string) => `/lembaga/${id}`,
  LAPORAN: "/laporan",
  ADMIN_LEMBAGA: "/admin/lembaga",
  ADMIN_PENGGUNA: "/admin/pengguna",
  ADMIN_PENGATURAN: "/admin/pengaturan",
  PROFIL: "/profil",
} as const;
