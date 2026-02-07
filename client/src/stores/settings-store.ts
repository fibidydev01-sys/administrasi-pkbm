import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Settings, SettingsUpdate } from "@/types";

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  updateSettings: (data: SettingsUpdate) => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
}

const initialState = {
  settings: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...initialState,

  fetchSettings: async () => {
    const supabase = createClient();

    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          set({ settings: null, isLoading: false });
          return;
        }
        throw error;
      }

      set({ settings: data, isLoading: false });
    } catch (error) {
      console.error("fetchSettings error:", error);
      set({ error: "Gagal memuat pengaturan", isLoading: false });
    }
  },

  updateSettings: async (data: SettingsUpdate) => {
    const supabase = createClient();

    try {
      set({ isSubmitting: true, error: null });

      const { error } = await supabase
        .from("settings")
        .update(data)
        .eq("id", 1);

      if (error) throw error;

      await get().fetchSettings();

      set({ isSubmitting: false });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menyimpan pengaturan";
      set({ error: message, isSubmitting: false });
      return { success: false, error: message };
    }
  },

  reset: () => set(initialState),
}));

export const useSettings = () => useSettingsStore((state) => state.settings);