/**
 * Supabase Database Types
 * Sistem Persuratan - Administrasi PKBM v1.0.0
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
      lembaga: {
        Row: {
          id: string;
          kode: string;
          nama: string;
          alamat: string;
          telepon: string | null;
          email: string | null;
          website: string | null;
          logo_url: string | null;
          ttd_jabatan: string | null;
          ttd_nama: string | null;
          ttd_nip: string | null;
          ttd_image_url: string | null;
          nomor_prefix: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kode: string;
          nama: string;
          alamat: string;
          telepon?: string | null;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          ttd_jabatan?: string | null;
          ttd_nama?: string | null;
          ttd_nip?: string | null;
          ttd_image_url?: string | null;
          nomor_prefix: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          kode?: string;
          nama?: string;
          alamat?: string;
          telepon?: string | null;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          ttd_jabatan?: string | null;
          ttd_nama?: string | null;
          ttd_nip?: string | null;
          ttd_image_url?: string | null;
          nomor_prefix?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      surat_keluar: {
        Row: {
          id: string;
          lembaga_id: string;
          nomor_surat: string;
          tanggal_surat: string;
          perihal: string;
          kepada: string;
          alamat_tujuan: string | null;
          isi_surat: string;
          lampiran: string | null;
          sifat: string;
          snapshot_ttd: Json;
          pdf_url: string | null;
          pdf_generated_at: string | null;
          status: string;
          template_id: string | null;
          template_data: Json | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          approved_by: string | null;
          approved_at: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          lembaga_id: string;
          nomor_surat: string;
          tanggal_surat?: string;
          perihal: string;
          kepada: string;
          alamat_tujuan?: string | null;
          isi_surat: string;
          lampiran?: string | null;
          sifat?: string;
          snapshot_ttd?: Json;
          pdf_url?: string | null;
          pdf_generated_at?: string | null;
          status?: string;
          template_id?: string | null;
          template_data?: Json | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          lembaga_id?: string;
          nomor_surat?: string;
          tanggal_surat?: string;
          perihal?: string;
          kepada?: string;
          alamat_tujuan?: string | null;
          isi_surat?: string;
          lampiran?: string | null;
          sifat?: string;
          snapshot_ttd?: Json;
          pdf_url?: string | null;
          pdf_generated_at?: string | null;
          status?: string;
          template_id?: string | null;
          template_data?: Json | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "surat_keluar_lembaga_id_fkey";
            columns: ["lembaga_id"];
            isOneToOne: false;
            referencedRelation: "lembaga";
            referencedColumns: ["id"];
          }
        ];
      };

      surat_tembusan: {
        Row: {
          id: string;
          surat_id: string;
          nama_penerima: string;
          urutan: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          surat_id: string;
          nama_penerima: string;
          urutan?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          surat_id?: string;
          nama_penerima?: string;
          urutan?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "surat_tembusan_surat_id_fkey";
            columns: ["surat_id"];
            isOneToOne: false;
            referencedRelation: "surat_keluar";
            referencedColumns: ["id"];
          }
        ];
      };

      nomor_surat_counter: {
        Row: {
          id: string;
          lembaga_id: string;
          tahun: number;
          counter: number;
          last_used_at: string;
        };
        Insert: {
          id?: string;
          lembaga_id: string;
          tahun: number;
          counter?: number;
          last_used_at?: string;
        };
        Update: {
          id?: string;
          lembaga_id?: string;
          tahun?: number;
          counter?: number;
          last_used_at?: string;
        };
        Relationships: [];
      };

      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          lembaga_id: string | null;
          avatar_url: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: string;
          lembaga_id?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: string;
          lembaga_id?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      role_permissions: {
        Row: {
          role: string;
          permissions: Json;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          role: string;
          permissions: Json;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: string;
          permissions?: Json;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      surat_templates: {
        Row: {
          id: string;
          nama: string;
          kategori: string;
          perihal_default: string | null;
          body_parts: Json;
          lembaga_id: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          kategori: string;
          perihal_default?: string | null;
          body_parts?: Json;
          lembaga_id?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          kategori?: string;
          perihal_default?: string | null;
          body_parts?: Json;
          lembaga_id?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "surat_templates_lembaga_id_fkey";
            columns: ["lembaga_id"];
            isOneToOne: false;
            referencedRelation: "lembaga";
            referencedColumns: ["id"];
          }
        ];
      };

      surat_template_fields: {
        Row: {
          id: string;
          template_id: string;
          nama_field: string;
          label: string;
          tipe: string;
          urutan: number;
          required: boolean;
          placeholder: string | null;
          default_value: string | null;
          options: Json | null;
          section: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          nama_field: string;
          label: string;
          tipe?: string;
          urutan?: number;
          required?: boolean;
          placeholder?: string | null;
          default_value?: string | null;
          options?: Json | null;
          section: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          nama_field?: string;
          label?: string;
          tipe?: string;
          urutan?: number;
          required?: boolean;
          placeholder?: string | null;
          default_value?: string | null;
          options?: Json | null;
          section?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "surat_template_fields_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "surat_templates";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_nomor_surat: {
        Args: { p_lembaga_id: string; p_tanggal?: string };
        Returns: string;
      };
      create_surat_with_snapshot: {
        Args: {
          p_lembaga_id: string;
          p_perihal: string;
          p_kepada: string;
          p_isi_surat: string;
          p_tanggal_surat?: string;
          p_alamat_tujuan?: string;
          p_lampiran?: string;
          p_sifat?: string;
          p_created_by?: string;
          p_template_id?: string;
          p_template_data?: Json;
        };
        Returns: string;
      };
      search_surat: {
        Args: { p_search_query: string; p_lembaga_id?: string; p_limit?: number };
        Returns: {
          id: string;
          nomor_surat: string;
          tanggal_surat: string;
          perihal: string;
          kepada: string;
          rank: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
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
