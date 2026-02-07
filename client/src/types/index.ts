/**
 * Application Types
 * Sistem Absensi Yayasan Al Barakah v3.1.0
 */

export type {
  Database,
  Tables,
  InsertDto,
  UpdateDto,
  Json,
} from "./database";

import type { Tables, InsertDto, UpdateDto } from "./database";

// =============================================
// Entity Types
// =============================================

export type Settings = Tables<"settings">;
export type SettingsInsert = InsertDto<"settings">;
export type SettingsUpdate = UpdateDto<"settings">;

export type Guru = Tables<"guru">;
export type GuruInsert = InsertDto<"guru">;
export type GuruUpdate = UpdateDto<"guru">;

export type Jadwal = Tables<"jadwal">;
export type JadwalInsert = InsertDto<"jadwal">;
export type JadwalUpdate = UpdateDto<"jadwal">;

export type Absensi = Tables<"absensi">;
export type AbsensiInsert = InsertDto<"absensi">;
export type AbsensiUpdate = UpdateDto<"absensi">;

export type TukarJadwal = Tables<"tukar_jadwal">;
export type TukarJadwalInsert = InsertDto<"tukar_jadwal">;
export type TukarJadwalUpdate = UpdateDto<"tukar_jadwal">;

export type TukarJadwalGuru = Tables<"tukar_jadwal_guru">;
export type TukarJadwalGuruInsert = InsertDto<"tukar_jadwal_guru">;
export type TukarJadwalGuruUpdate = UpdateDto<"tukar_jadwal_guru">;

// =============================================
// Enum Types
// =============================================

export type AbsenTipe = "masuk" | "pulang";
export type AbsenStatus = "valid" | "invalid" | "suspicious" | "auto";
export type HariIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type LokasiType = "jiwan" | "grobogan";

// =============================================
// Constants
// =============================================

export const HARI_NAMES: Record<HariIndex, string> = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
};

export const HARI_SHORT: Record<HariIndex, string> = {
  0: "Min",
  1: "Sen",
  2: "Sel",
  3: "Rab",
  4: "Kam",
  5: "Jum",
  6: "Sab",
};

export const HARI_OPTIONS = [
  { value: 0, label: "Minggu" },
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
] as const;

export const LOKASI_OPTIONS = [
  { value: "jiwan", label: "Jiwan - Madiun" },
  { value: "grobogan", label: "Grobogan - Madiun" },
] as const;

export const LOKASI_NAMES: Record<LokasiType, string> = {
  jiwan: "Jiwan - Madiun",
  grobogan: "Grobogan - Madiun",
};

// =============================================
// Location Types
// =============================================

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  isMock: boolean;
}

export interface GeolocationResult {
  success: boolean;
  data: LocationData | null;
  error: string | null;
}

// =============================================
// Jadwal Types
// =============================================

export interface JadwalWithGuru extends Jadwal {
  guru: Guru;
}

export interface JadwalStatus {
  jadwal: Jadwal;
  canAbsenMasuk: boolean;
  canAbsenPulang: boolean;
  hasAbsenMasuk: boolean;
  hasAbsenPulang: boolean;
  windowStart: string;
  windowEnd: string;
  isWithinWindow: boolean;
  message: string;
}

// =============================================
// Absensi Types
// =============================================

export interface AbsensiWithGuru extends Absensi {
  guru?: Guru;
}

export interface AbsensiWithJadwal extends Absensi {
  jadwal?: Jadwal;
}

export interface AbsensiComplete extends Absensi {
  guru?: Guru;
  jadwal?: JadwalWithGuru;
}

// =============================================
// Cloudinary Types
// =============================================

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
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
// Auth Types
// =============================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  guru: Guru | null;
}

// =============================================
// Dashboard Types
// =============================================

export interface DashboardStats {
  totalGuru: number;
  totalJadwalHariIni: number;
  sudahAbsen: number;
  belumAbsen: number;
}

// =============================================
// Form Types
// =============================================

export interface SelectOption {
  value: string;
  label: string;
}

export interface AbsenFormData {
  guru_id: string;
  jadwal_id: string;
  tipe: AbsenTipe;
  latitude: number;
  longitude: number;
  accuracy: number;
  alamat: string;
  foto_url: string;
  foto_public_id: string;
  is_mock_location: boolean;
  device_info: string;
}

export interface JadwalFormData {
  hari: number;
  jam_mulai: string;
  jam_selesai: string;
  guru_id: string;
  mapel: string;
  keterangan: string;
  lokasi: LokasiType;
  is_active: boolean;
}

// =============================================
// Tukar Jadwal Types
// =============================================

export type TukarJadwalStatus = "pending" | "approved" | "rejected" | "cancelled" | "expired";
export type TukarJadwalGuruStatus = "pending" | "approved" | "rejected";

export interface TukarJadwalGuruWithDetail extends TukarJadwalGuru {
  guru: Guru;
  jadwal: Jadwal;
}

export interface TukarJadwalWithRelations extends TukarJadwal {
  pemohon: Guru;
  jadwal_pemohon: JadwalWithGuru;
  tukar_jadwal_guru: TukarJadwalGuruWithDetail[];
}

export interface GuruFormData {
  nama: string;
  email: string;
  nip: string;
  jabatan: string;
  no_hp: string;
  is_admin: boolean;
  is_active: boolean;
}

export interface SettingsFormData {
  nama_sekolah: string;
  alamat_sekolah: string;
  toleransi_sebelum: number;
  toleransi_sesudah: number;
  auto_pulang: boolean;
  jiwan_lat: number | null;
  jiwan_lng: number | null;
  jiwan_radius: number;
  grobogan_lat: number | null;
  grobogan_lng: number | null;
  grobogan_radius: number;
}