/**
 * Application Types
 * Sistem Persuratan - Administrasi PKBM v1.0.0
 */

export type {
  Database,
  Tables,
  InsertDto,
  UpdateDto,
  Json,
} from "./database";

export type {
  TemplateId,
  FieldType,
  TemplateField,
  TemplateKategori,
  TemplateStruktur,
  TemplateDataBlock,
  TemplateConfig,
  TemplateData,
} from "./template";

import type { Tables, InsertDto, UpdateDto } from "./database";

// =============================================
// Entity Types
// =============================================

export type Lembaga = Tables<"lembaga">;
export type LembagaInsert = InsertDto<"lembaga">;
export type LembagaUpdate = UpdateDto<"lembaga">;

export type Surat = Tables<"surat_keluar">;
export type SuratInsert = InsertDto<"surat_keluar">;
export type SuratUpdate = UpdateDto<"surat_keluar">;

export type Tembusan = Tables<"surat_tembusan">;
export type TembusanInsert = InsertDto<"surat_tembusan">;

export type UserProfile = Tables<"user_profiles">;
export type UserProfileInsert = InsertDto<"user_profiles">;
export type UserProfileUpdate = UpdateDto<"user_profiles">;

export type RolePermission = Tables<"role_permissions">;

// =============================================
// Role Types
// =============================================

export type UserRole = "super_admin" | "admin_tu" | "staff" | "kepala";

export type Permissions = {
  surat: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
  };
  lembaga: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  user: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
  settings: {
    access: boolean;
  };
};

// =============================================
// Surat Types
// =============================================

export type SuratSifat = "Biasa" | "Penting" | "Segera" | "Rahasia";
export type SuratStatus = "draft" | "approved" | "sent" | "archived";

export type SnapshotTTD = {
  jabatan: string | null;
  nama: string | null;
  nip: string | null;
  image_url: string | null;
  captured_at: string;
};

export interface SuratWithRelations extends Surat {
  lembaga: Lembaga;
  tembusan: Tembusan[];
  created_by_profile?: {
    full_name: string;
    role: string;
  };
}

// =============================================
// Auth Types
// =============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

// =============================================
// API Types
// =============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// =============================================
// Form Types
// =============================================

export interface SelectOption {
  value: string;
  label: string;
}

export type SuratFormData = {
  lembaga_id: string;
  perihal: string;
  kepada?: string;
  alamat_tujuan?: string;
  isi_surat?: string;
  lampiran?: string;
  sifat?: SuratSifat;
  tembusan?: string[];
  template_id?: string;
  template_data?: Record<string, string>;
};

// =============================================
// Helpers
// =============================================

export function isAdminRole(role: string): boolean {
  return role === "super_admin" || role === "admin_tu";
}

export function isSuperAdmin(role: string): boolean {
  return role === "super_admin";
}
