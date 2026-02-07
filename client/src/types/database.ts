/**
 * Supabase Database Types
 * Sistem Absensi Yayasan Al Barakah v4.1.0
 * ✅ UPDATED: Dual Tolerance System
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      settings: {
        Row: {
          id: number;
          nama_sekolah: string;
          alamat_sekolah: string | null;

          // ✅ NEW: Dual Tolerance System (4 kolom)
          toleransi_sebelum_masuk: number;
          toleransi_sesudah_masuk: number;
          toleransi_sebelum_pulang: number;
          toleransi_sesudah_pulang: number;

          // OLD: Backward Compatibility (akan dihapus nanti)
          toleransi_sebelum: number;
          toleransi_sesudah: number;

          auto_pulang: boolean;
          jiwan_lat: number | null;
          jiwan_lng: number | null;
          jiwan_radius: number;
          grobogan_lat: number | null;
          grobogan_lng: number | null;
          grobogan_radius: number;
          hari_kerja: number[];
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          nama_sekolah?: string;
          alamat_sekolah?: string | null;

          // ✅ NEW: Dual Tolerance
          toleransi_sebelum_masuk?: number;
          toleransi_sesudah_masuk?: number;
          toleransi_sebelum_pulang?: number;
          toleransi_sesudah_pulang?: number;

          // OLD: Backward Compatibility
          toleransi_sebelum?: number;
          toleransi_sesudah?: number;

          auto_pulang?: boolean;
          jiwan_lat?: number | null;
          jiwan_lng?: number | null;
          jiwan_radius?: number;
          grobogan_lat?: number | null;
          grobogan_lng?: number | null;
          grobogan_radius?: number;
          hari_kerja?: number[];
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          nama_sekolah?: string;
          alamat_sekolah?: string | null;

          // ✅ NEW: Dual Tolerance
          toleransi_sebelum_masuk?: number;
          toleransi_sesudah_masuk?: number;
          toleransi_sebelum_pulang?: number;
          toleransi_sesudah_pulang?: number;

          // OLD: Backward Compatibility
          toleransi_sebelum?: number;
          toleransi_sesudah?: number;

          auto_pulang?: boolean;
          jiwan_lat?: number | null;
          jiwan_lng?: number | null;
          jiwan_radius?: number;
          grobogan_lat?: number | null;
          grobogan_lng?: number | null;
          grobogan_radius?: number;
          hari_kerja?: number[];
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      guru: {
        Row: {
          id: string;
          auth_user_id: string | null;
          nama: string;
          nip: string | null;
          email: string;
          jabatan: string | null;
          no_hp: string | null;
          foto_url: string | null;
          is_active: boolean;
          is_admin: boolean;
          is_verified: boolean;
          device_id: string | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          nama: string;
          nip?: string | null;
          email: string;
          jabatan?: string | null;
          no_hp?: string | null;
          foto_url?: string | null;
          is_active?: boolean;
          is_admin?: boolean;
          is_verified?: boolean;
          device_id?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          nama?: string;
          nip?: string | null;
          email?: string;
          jabatan?: string | null;
          no_hp?: string | null;
          foto_url?: string | null;
          is_active?: boolean;
          is_admin?: boolean;
          is_verified?: boolean;
          device_id?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      jadwal: {
        Row: {
          id: string;
          hari: number;
          jam_mulai: string;
          jam_selesai: string;
          guru_id: string;
          mapel: string | null;
          keterangan: string | null;
          lokasi: "jiwan" | "grobogan";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          hari: number;
          jam_mulai: string;
          jam_selesai: string;
          guru_id: string;
          mapel?: string | null;
          keterangan?: string | null;
          lokasi?: "jiwan" | "grobogan";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          hari?: number;
          jam_mulai?: string;
          jam_selesai?: string;
          guru_id?: string;
          mapel?: string | null;
          keterangan?: string | null;
          lokasi?: "jiwan" | "grobogan";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jadwal_guru_id_fkey";
            columns: ["guru_id"];
            isOneToOne: false;
            referencedRelation: "guru";
            referencedColumns: ["id"];
          }
        ];
      };

      tukar_jadwal: {
        Row: {
          id: string;
          pemohon_id: string;
          jadwal_pemohon_id: string;
          tanggal_pemohon: string;
          tanggal_target: string;
          alasan: string | null;
          status: "pending" | "approved" | "rejected" | "cancelled" | "expired";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pemohon_id: string;
          jadwal_pemohon_id: string;
          tanggal_pemohon: string;
          tanggal_target: string;
          alasan?: string | null;
          status?: "pending" | "approved" | "rejected" | "cancelled" | "expired";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pemohon_id?: string;
          jadwal_pemohon_id?: string;
          tanggal_pemohon?: string;
          tanggal_target?: string;
          alasan?: string | null;
          status?: "pending" | "approved" | "rejected" | "cancelled" | "expired";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tukar_jadwal_pemohon_id_fkey";
            columns: ["pemohon_id"];
            isOneToOne: false;
            referencedRelation: "guru";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tukar_jadwal_jadwal_pemohon_id_fkey";
            columns: ["jadwal_pemohon_id"];
            isOneToOne: false;
            referencedRelation: "jadwal";
            referencedColumns: ["id"];
          }
        ];
      };

      tukar_jadwal_guru: {
        Row: {
          id: string;
          tukar_jadwal_id: string;
          guru_id: string;
          jadwal_id: string;
          status: "pending" | "approved" | "rejected";
          responded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tukar_jadwal_id: string;
          guru_id: string;
          jadwal_id: string;
          status?: "pending" | "approved" | "rejected";
          responded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tukar_jadwal_id?: string;
          guru_id?: string;
          jadwal_id?: string;
          status?: "pending" | "approved" | "rejected";
          responded_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tukar_jadwal_guru_tukar_jadwal_id_fkey";
            columns: ["tukar_jadwal_id"];
            isOneToOne: false;
            referencedRelation: "tukar_jadwal";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tukar_jadwal_guru_guru_id_fkey";
            columns: ["guru_id"];
            isOneToOne: false;
            referencedRelation: "guru";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tukar_jadwal_guru_jadwal_id_fkey";
            columns: ["jadwal_id"];
            isOneToOne: false;
            referencedRelation: "jadwal";
            referencedColumns: ["id"];
          }
        ];
      };

      absensi: {
        Row: {
          id: string;
          guru_id: string;
          jadwal_id: string | null;
          tipe: "masuk" | "pulang";
          tanggal: string;
          waktu: string;
          timestamp: string;
          latitude: number | null;
          longitude: number | null;
          accuracy: number | null;
          alamat: string | null;
          is_mock_location: boolean;
          device_info: string | null;
          foto_url: string | null;
          foto_public_id: string | null;
          status: "valid" | "invalid" | "suspicious" | "auto";
          catatan: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          guru_id: string;
          jadwal_id?: string | null;
          tipe: "masuk" | "pulang";
          tanggal?: string;
          waktu?: string;
          timestamp?: string;
          latitude?: number | null;
          longitude?: number | null;
          accuracy?: number | null;
          alamat?: string | null;
          is_mock_location?: boolean;
          device_info?: string | null;
          foto_url?: string | null;
          foto_public_id?: string | null;
          status?: "valid" | "invalid" | "suspicious" | "auto";
          catatan?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          guru_id?: string;
          jadwal_id?: string | null;
          tipe?: "masuk" | "pulang";
          tanggal?: string;
          waktu?: string;
          timestamp?: string;
          latitude?: number | null;
          longitude?: number | null;
          accuracy?: number | null;
          alamat?: string | null;
          is_mock_location?: boolean;
          device_info?: string | null;
          foto_url?: string | null;
          foto_public_id?: string | null;
          status?: "valid" | "invalid" | "suspicious" | "auto";
          catatan?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "absensi_guru_id_fkey";
            columns: ["guru_id"];
            isOneToOne: false;
            referencedRelation: "guru";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "absensi_jadwal_id_fkey";
            columns: ["jadwal_id"];
            isOneToOne: false;
            referencedRelation: "jadwal";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_current_guru_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      is_current_user_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      tukar_jadwal_status: "pending" | "approved" | "rejected" | "cancelled" | "expired";
      tukar_jadwal_guru_status: "pending" | "approved" | "rejected";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// ✅ Type Exports
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
