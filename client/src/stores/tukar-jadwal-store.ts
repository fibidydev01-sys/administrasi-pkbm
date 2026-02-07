import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type {
  TukarJadwalWithRelations,
  TukarJadwalGuruWithDetail,
  Guru,
  Jadwal,
  JadwalWithGuru,
  TukarJadwal,
} from "@/types";
import type { TukarJadwalFormData } from "@/lib/validators";
import { getToday } from "@/lib/utils";

interface TukarJadwalState {
  // Data
  permintaanSaya: TukarJadwalWithRelations[];
  permintaanMasuk: TukarJadwalWithRelations[];
  allSwaps: TukarJadwalWithRelations[];

  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Pending count (for badge)
  pendingMasukCount: number;

  // Actions
  fetchPermintaanSaya: (guruId: string) => Promise<void>;
  fetchPermintaanMasuk: (guruId: string) => Promise<void>;
  fetchActiveSwapsForDate: (tanggal: string) => Promise<TukarJadwalWithRelations[]>;
  createTukarJadwal: (pemohonId: string, data: TukarJadwalFormData) => Promise<{ success: boolean; error?: string }>;
  respondTukarJadwal: (tukarGuruId: string, tukarJadwalId: string, status: "approved" | "rejected") => Promise<{ success: boolean; error?: string }>;
  cancelTukarJadwal: (id: string) => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
}

const initialState = {
  permintaanSaya: [],
  permintaanMasuk: [],
  allSwaps: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  pendingMasukCount: 0,
};

export const useTukarJadwalStore = create<TukarJadwalState>((set, get) => ({
  ...initialState,

  fetchPermintaanSaya: async (guruId: string) => {
    const supabase = createClient();

    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from("tukar_jadwal")
        .select(`
          *,
          pemohon:pemohon_id(*),
          jadwal_pemohon:jadwal_pemohon_id(*, guru:guru_id(*)),
          tukar_jadwal_guru(*, guru:guru_id(*), jadwal:jadwal_id(*))
        `)
        .eq("pemohon_id", guruId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({
        permintaanSaya: (data as unknown as TukarJadwalWithRelations[]) || [],
        isLoading: false,
      });
    } catch (error) {
      console.error("fetchPermintaanSaya error:", error);
      set({ error: "Gagal memuat permintaan tukar jadwal", isLoading: false });
    }
  },

  fetchPermintaanMasuk: async (guruId: string) => {
    const supabase = createClient();

    try {
      set({ isLoading: true, error: null });

      // Fetch tukar_jadwal where this guru is a target
      const { data: guruTargetData, error: guruTargetError } = await supabase
        .from("tukar_jadwal_guru")
        .select("tukar_jadwal_id")
        .eq("guru_id", guruId);

      if (guruTargetError) throw guruTargetError;

      if (!guruTargetData || guruTargetData.length === 0) {
        set({ permintaanMasuk: [], pendingMasukCount: 0, isLoading: false });
        return;
      }

      const tukarIds = guruTargetData.map((d) => d.tukar_jadwal_id);

      const { data, error } = await supabase
        .from("tukar_jadwal")
        .select(`
          *,
          pemohon:pemohon_id(*),
          jadwal_pemohon:jadwal_pemohon_id(*, guru:guru_id(*)),
          tukar_jadwal_guru(*, guru:guru_id(*), jadwal:jadwal_id(*))
        `)
        .in("id", tukarIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const result = (data as unknown as TukarJadwalWithRelations[]) || [];

      // Count pending requests for this guru (only if both dates haven't passed)
      const today = getToday();
      const pendingCount = result.filter((r) =>
        r.status === "pending" &&
        r.tanggal_pemohon >= today &&
        r.tanggal_target >= today &&
        r.tukar_jadwal_guru.some(
          (tg) => tg.guru_id === guruId && tg.status === "pending"
        )
      ).length;

      set({
        permintaanMasuk: result,
        pendingMasukCount: pendingCount,
        isLoading: false,
      });
    } catch (error) {
      console.error("fetchPermintaanMasuk error:", error);
      set({ error: "Gagal memuat permintaan masuk", isLoading: false });
    }
  },

  fetchActiveSwapsForDate: async (tanggal: string) => {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("tukar_jadwal")
        .select(`
          *,
          pemohon:pemohon_id(*),
          jadwal_pemohon:jadwal_pemohon_id(*, guru:guru_id(*)),
          tukar_jadwal_guru(*, guru:guru_id(*), jadwal:jadwal_id(*))
        `)
        .eq("status", "approved")
        .or(`tanggal_pemohon.eq.${tanggal},tanggal_target.eq.${tanggal}`);

      if (error) throw error;

      return (data as unknown as TukarJadwalWithRelations[]) || [];
    } catch (error) {
      console.error("fetchActiveSwapsForDate error:", error);
      return [];
    }
  },

  createTukarJadwal: async (pemohonId: string, data: TukarJadwalFormData) => {
    const supabase = createClient();

    try {
      set({ isSubmitting: true, error: null });

      // 1. Insert header tukar_jadwal
      const { data: tukarData, error: tukarError } = await supabase
        .from("tukar_jadwal")
        .insert({
          pemohon_id: pemohonId,
          jadwal_pemohon_id: data.jadwal_pemohon_id,
          tanggal_pemohon: data.tanggal_pemohon,
          tanggal_target: data.tanggal_target,
          alasan: data.alasan || null,
          status: "pending",
        })
        .select()
        .single();

      if (tukarError) throw tukarError;

      // 2. Insert detail guru target
      const guruTargetInserts = data.guru_target.map((gt) => ({
        tukar_jadwal_id: tukarData.id,
        guru_id: gt.guru_id,
        jadwal_id: gt.jadwal_id,
        status: "pending" as const,
      }));

      const { error: guruError } = await supabase
        .from("tukar_jadwal_guru")
        .insert(guruTargetInserts);

      if (guruError) {
        // Rollback: delete the header if detail insert fails
        await supabase.from("tukar_jadwal").delete().eq("id", tukarData.id);
        throw guruError;
      }

      // Refresh data
      await get().fetchPermintaanSaya(pemohonId);

      set({ isSubmitting: false });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat permintaan tukar jadwal";
      set({ error: message, isSubmitting: false });
      return { success: false, error: message };
    }
  },

  respondTukarJadwal: async (tukarGuruId: string, tukarJadwalId: string, status: "approved" | "rejected") => {
    const supabase = createClient();

    try {
      set({ isSubmitting: true, error: null });

      // Call SECURITY DEFINER database function
      // Handles: update guru status + check all gurus + update parent status
      // All in one atomic transaction, bypasses RLS
      const { data, error } = await supabase.rpc("respond_tukar_jadwal", {
        p_tukar_guru_id: tukarGuruId,
        p_tukar_jadwal_id: tukarJadwalId,
        p_status: status,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; new_status?: string } | null;
      if (!result?.success) {
        throw new Error(result?.error || "Gagal merespon permintaan");
      }

      set({ isSubmitting: false });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal merespon permintaan";
      set({ error: message, isSubmitting: false });
      return { success: false, error: message };
    }
  },

  cancelTukarJadwal: async (id: string) => {
    const supabase = createClient();

    try {
      set({ isSubmitting: true, error: null });

      const { error } = await supabase
        .from("tukar_jadwal")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;

      set({ isSubmitting: false });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membatalkan permintaan";
      set({ error: message, isSubmitting: false });
      return { success: false, error: message };
    }
  },

  reset: () => set(initialState),
}));
