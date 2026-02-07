import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { getToday } from "@/lib/utils";
import { applyTukarJadwal } from "@/lib/tukar-jadwal";
import type { Absensi, AbsensiInsert, LocationData, JadwalWithGuru } from "@/types";

interface AbsenState {
  todayAbsensi: Absensi[];
  myJadwalToday: JadwalWithGuru[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  location: LocationData | null;
  locationError: string | null;
  alamat: string | null;

  fotoBlob: Blob | null;
  fotoPreviewUrl: string | null;

  fetchTodayAbsensi: (guruId: string) => Promise<void>;
  fetchMyJadwalToday: (guruId: string) => Promise<void>;
  submitAbsen: (data: {
    guru_id: string;
    jadwal_id: string;
    tipe: "masuk" | "pulang";
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    alamat?: string;
    is_mock_location?: boolean;
    device_info?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  setLocation: (location: LocationData | null) => void;
  setLocationError: (error: string | null) => void;
  setAlamat: (alamat: string | null) => void;
  setFoto: (blob: Blob | null, previewUrl: string | null) => void;
  clearFoto: () => void;
  reset: () => void;
}

const initialState = {
  todayAbsensi: [],
  myJadwalToday: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  location: null,
  locationError: null,
  alamat: null,
  fotoBlob: null,
  fotoPreviewUrl: null,
};

export const useAbsenStore = create<AbsenState>((set, get) => ({
  ...initialState,

  fetchTodayAbsensi: async (guruId: string) => {
    const supabase = createClient();

    try {
      set({ isLoading: true, error: null });

      const today = getToday();

      const { data, error } = await supabase
        .from("absensi")
        .select("*")
        .eq("guru_id", guruId)
        .eq("tanggal", today)
        .order("timestamp", { ascending: true });

      if (error) throw error;

      set({ todayAbsensi: data || [], isLoading: false });
    } catch (error) {
      set({ error: "Gagal memuat data absensi", isLoading: false, todayAbsensi: [] });
    }
  },

  fetchMyJadwalToday: async (guruId: string) => {
    const supabase = createClient();
    const today = new Date();
    const todayIndex = today.getDay();

    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from("jadwal")
        .select(`*, guru:guru_id(*)`)
        .eq("guru_id", guruId)
        .eq("hari", todayIndex)
        .eq("is_active", true)
        .order("jam_mulai", { ascending: true });

      if (error) throw error;

      // Apply tukar jadwal: swap in/out jadwal based on approved swaps for today
      const normalJadwal = (data as JadwalWithGuru[]) || [];
      const swappedJadwal = await applyTukarJadwal(normalJadwal, guruId);

      set({
        myJadwalToday: swappedJadwal,
        isLoading: false
      });
    } catch (error) {
      set({
        error: "Gagal memuat jadwal hari ini",
        isLoading: false,
        myJadwalToday: []
      });
    }
  },

  submitAbsen: async (data) => {
    const supabase = createClient();

    try {
      set({ isSubmitting: true, error: null });

      const { fotoBlob } = get();

      let foto_url: string | null = null;
      let foto_public_id: string | null = null;

      if (fotoBlob) {
        if (!isCloudinaryConfigured()) {
          throw new Error(
            "Cloudinary belum dikonfigurasi. Hubungi administrator untuk setup upload foto."
          );
        }

        try {
          const result = await uploadToCloudinary(fotoBlob, data.guru_id, data.tipe);
          foto_url = result.secure_url;
          foto_public_id = result.public_id;
        } catch (uploadError) {
          if (uploadError instanceof Error) {
            if (uploadError.message.includes("Upload preset")) {
              throw new Error(
                "Upload preset tidak valid. Pastikan upload preset di Cloudinary sudah diset ke 'Unsigned'."
              );
            }
            if (uploadError.message.includes("cloud_name")) {
              throw new Error(
                "Cloud name tidak valid. Periksa konfigurasi Cloudinary."
              );
            }
            if (uploadError.message.includes("Network")) {
              throw new Error(
                "Gagal upload foto: Tidak ada koneksi internet."
              );
            }
            throw new Error(`Gagal upload foto: ${uploadError.message}`);
          }
          throw new Error("Gagal upload foto. Silakan coba lagi.");
        }
      }

      const insertData: AbsensiInsert = {
        guru_id: data.guru_id,
        jadwal_id: data.jadwal_id,
        tipe: data.tipe,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        alamat: data.alamat,
        is_mock_location: data.is_mock_location || false,
        device_info: data.device_info,
        foto_url,
        foto_public_id,
        status: "valid",
      };

      const { error: insertError } = await supabase.from("absensi").insert(insertData);

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error(`Anda sudah absen ${data.tipe} untuk sesi ini hari ini`);
        }
        if (insertError.code === "23503") {
          throw new Error("Data jadwal atau guru tidak valid");
        }
        throw new Error(`Database error: ${insertError.message}`);
      }

      await get().fetchTodayAbsensi(data.guru_id);
      get().clearFoto();

      set({ isSubmitting: false });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menyimpan absensi";
      set({ error: message, isSubmitting: false });
      return { success: false, error: message };
    }
  },

  setLocation: (location) => set({ location, locationError: null }),
  setLocationError: (locationError) => set({ locationError, location: null }),
  setAlamat: (alamat) => set({ alamat }),

  setFoto: (fotoBlob, fotoPreviewUrl) => {
    set({ fotoBlob, fotoPreviewUrl });
  },

  clearFoto: () => {
    const { fotoPreviewUrl } = get();
    if (fotoPreviewUrl && fotoPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(fotoPreviewUrl);
    }
    set({ fotoBlob: null, fotoPreviewUrl: null });
  },

  reset: () => {
    get().clearFoto();
    set(initialState);
  },
}));

export const useTodayAbsensiByJadwal = (jadwalId: string) =>
  useAbsenStore((state) =>
    state.todayAbsensi.filter((a) => a.jadwal_id === jadwalId)
  );

export const useHasAbsenMasuk = (jadwalId: string) =>
  useAbsenStore((state) =>
    state.todayAbsensi.some((a) => a.jadwal_id === jadwalId && a.tipe === "masuk")
  );

export const useHasAbsenPulang = (jadwalId: string) =>
  useAbsenStore((state) =>
    state.todayAbsensi.some((a) => a.jadwal_id === jadwalId && a.tipe === "pulang")
  );