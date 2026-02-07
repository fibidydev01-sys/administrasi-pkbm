import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Jadwal, JadwalInsert, JadwalUpdate, JadwalWithGuru, LokasiType } from "@/types";
import { getCurrentDayIndex } from "@/lib/jadwal";

interface JadwalState {
  jadwalList: JadwalWithGuru[];
  jadwalToday: JadwalWithGuru[];
  selectedJadwal: Jadwal | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  filterHari: number | null;
  filterGuru: string | null;
  filterLokasi: LokasiType | null;

  fetchJadwalList: () => Promise<void>;
  fetchJadwalToday: () => Promise<void>;
  fetchJadwalByGuru: (guruId: string) => Promise<JadwalWithGuru[]>;
  createJadwal: (data: JadwalInsert) => Promise<{ success: boolean; error?: string }>;
  updateJadwal: (id: string, data: JadwalUpdate) => Promise<{ success: boolean; error?: string }>;
  deleteJadwal: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleJadwalActive: (id: string, isActive: boolean) => Promise<{ success: boolean; error?: string }>;
  setSelectedJadwal: (jadwal: Jadwal | null) => void;
  setFilterHari: (hari: number | null) => void;
  setFilterGuru: (guruId: string | null) => void;
  setFilterLokasi: (lokasi: LokasiType | null) => void;
  reset: () => void;
}

const initialState = {
  jadwalList: [],
  jadwalToday: [],
  selectedJadwal: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filterHari: null,
  filterGuru: null,
  filterLokasi: null,
};

export const useJadwalStore = create<JadwalState>((set, get) => ({
  ...initialState,

  fetchJadwalList: async () => {
    const supabase = createClient();

    try {
      set({ isLoading: true, error: null });

      // Fetch SEMUA jadwal - filtering dilakukan di client-side
      const { data, error } = await supabase
        .from("jadwal")
        .select(`*, guru:guru_id(*)`)
        .order("hari", { ascending: true })
        .order("jam_mulai", { ascending: true });

      if (error) throw error;

      set({ jadwalList: (data as JadwalWithGuru[]) || [], isLoading: false });
    } catch (error) {
      console.error("fetchJadwalList error:", error);
      set({ error: "Gagal memuat jadwal", isLoading: false, jadwalList: [] });
    }
  },

  fetchJadwalToday: async () => {
    const supabase = createClient();
    const today = getCurrentDayIndex();

    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from("jadwal")
        .select(`*, guru:guru_id(*)`)
        .eq("hari", today)
        .eq("is_active", true)
        .order("jam_mulai", { ascending: true });

      if (error) throw error;

      set({ jadwalToday: (data as JadwalWithGuru[]) || [], isLoading: false });
    } catch (error) {
      console.error("fetchJadwalToday error:", error);
      set({ error: "Gagal memuat jadwal hari ini", isLoading: false });
    }
  },

  fetchJadwalByGuru: async (guruId: string) => {
    const supabase = createClient();
    const today = getCurrentDayIndex();

    try {
      const { data, error } = await supabase
        .from("jadwal")
        .select(`*, guru:guru_id(*)`)
        .eq("guru_id", guruId)
        .eq("hari", today)
        .eq("is_active", true)
        .order("jam_mulai", { ascending: true });

      if (error) throw error;

      return (data as JadwalWithGuru[]) || [];
    } catch (error) {
      console.error("fetchJadwalByGuru error:", error);
      return [];
    }
  },

  createJadwal: async (data: JadwalInsert) => {
    const supabase = createClient();

    try {
      set({ isSubmitting: true, error: null });

      const { error } = await supabase.from("jadwal").insert(data);

      if (error) {
        if (error.code === "23505") {
          throw new Error("Jadwal sudah ada untuk guru ini di waktu yang sama");
        }
        throw error;
      }

      await get().fetchJadwalList();
      set({ isSubmitting: false });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menambah jadwal";
      set({ error: message, isSubmitting: false });
      return { success: false, error: message };
    }
  },

  updateJadwal: async (id: string, data: JadwalUpdate) => {
    const supabase = createClient();

    try {
      set({ isSubmitting: true, error: null });

      const { error } = await supabase.from("jadwal").update(data).eq("id", id);

      if (error) throw error;

      await get().fetchJadwalList();
      set({ isSubmitting: false, selectedJadwal: null });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengupdate jadwal";
      set({ error: message, isSubmitting: false });
      return { success: false, error: message };
    }
  },

  deleteJadwal: async (id: string) => {
    const supabase = createClient();

    try {
      set({ isSubmitting: true, error: null });

      const { error } = await supabase.from("jadwal").delete().eq("id", id);

      if (error) throw error;

      await get().fetchJadwalList();
      set({ isSubmitting: false });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus jadwal";
      set({ error: message, isSubmitting: false });
      return { success: false, error: message };
    }
  },

  toggleJadwalActive: async (id: string, isActive: boolean) => {
    const supabase = createClient();

    try {
      set({ isSubmitting: true, error: null });

      const { error } = await supabase
        .from("jadwal")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;

      await get().fetchJadwalList();
      set({ isSubmitting: false });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengubah status jadwal";
      set({ error: message, isSubmitting: false });
      return { success: false, error: message };
    }
  },

  setSelectedJadwal: (jadwal) => set({ selectedJadwal: jadwal }),
  setFilterHari: (filterHari) => set({ filterHari }),
  setFilterGuru: (filterGuru) => set({ filterGuru }),
  setFilterLokasi: (filterLokasi) => set({ filterLokasi }),
  reset: () => set(initialState),
}));

export const useJadwalToday = () => useJadwalStore((state) => state.jadwalToday);