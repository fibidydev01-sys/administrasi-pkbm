/**
 * Route constants
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SURAT: "/surat",
  SURAT_BUAT: "/surat/buat",
  SURAT_DETAIL: (id: string) => `/surat/${id}`,
  SURAT_EDIT: (id: string) => `/surat/${id}/edit`,
  LEMBAGA: "/lembaga",
  LEMBAGA_DETAIL: (id: string) => `/lembaga/${id}`,
  ADMIN_LEMBAGA: "/admin/lembaga",
  ADMIN_PENGGUNA: "/admin/pengguna",
  PROFIL: "/profil",
} as const;
