import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface AdminStats {
  totalGuru: number;
  guruAktif: number;
  totalJadwal: number;
  jadwalAktif: number;
  jadwalHariIni: number;
  absensiHariIni: number;
}

interface AdminState {
  stats: AdminStats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

const initialStats: AdminStats = {
  totalGuru: 0,
  guruAktif: 0,
  totalJadwal: 0,
  jadwalAktif: 0,
  jadwalHariIni: 0,
  absensiHariIni: 0,
};

export const useAdminStore = create<AdminState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    const supabase = createClient();

    try {
      set({ isLoading: true, error: null });

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, etc.

      // Fetch all stats in parallel
      const [
        guruResult,
        guruAktifResult,
        jadwalResult,
        jadwalAktifResult,
        jadwalHariIniResult,
        absensiHariIniResult,
      ] = await Promise.all([
        // Total guru
        supabase.from("guru").select("id", { count: "exact", head: true }),
        // Guru aktif
        supabase.from("guru").select("id", { count: "exact", head: true }).eq("is_active", true),
        // Total jadwal
        supabase.from("jadwal").select("id", { count: "exact", head: true }),
        // Jadwal aktif
        supabase.from("jadwal").select("id", { count: "exact", head: true }).eq("is_active", true),
        // Jadwal hari ini
        supabase.from("jadwal").select("id", { count: "exact", head: true }).eq("hari", dayOfWeek).eq("is_active", true),
        // Absensi hari ini (unique guru yang sudah absen masuk)
        supabase.from("absensi").select("guru_id", { count: "exact", head: true }).eq("tanggal", todayStr).eq("tipe", "masuk"),
      ]);

      set({
        stats: {
          totalGuru: guruResult.count || 0,
          guruAktif: guruAktifResult.count || 0,
          totalJadwal: jadwalResult.count || 0,
          jadwalAktif: jadwalAktifResult.count || 0,
          jadwalHariIni: jadwalHariIniResult.count || 0,
          absensiHariIni: absensiHariIniResult.count || 0,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      set({
        error: "Gagal memuat statistik",
        isLoading: false,
        stats: initialStats,
      });
    }
  },
}));