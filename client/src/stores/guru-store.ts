import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Guru, GuruInsert, GuruUpdate, LokasiType } from "@/types";

interface GuruState {
  guruList: Guru[];
  selectedGuru: Guru | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  searchQuery: string;
  showInactive: boolean;
  selectedIds: string[]; // ✅ NEW
  filterLokasi: LokasiType | null; // ✅ NEW

  fetchGuruList: () => Promise<void>;
  fetchGuruById: (id: string) => Promise<Guru | null>;
  createGuru: (data: GuruInsert & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  updateGuru: (id: string, data: GuruUpdate) => Promise<{ success: boolean; error?: string }>;
  deleteGuru: (id: string) => Promise<{ success: boolean; error?: string }>;
  setSelectedGuru: (guru: Guru | null) => void;
  setSearchQuery: (query: string) => void;
  setShowInactive: (show: boolean) => void;

  // ✅ NEW METHODS
  toggleSelectGuru: (id: string) => void;
  selectAllGuru: (ids: string[]) => void;
  clearSelection: () => void;
  batchDeleteGuru: (ids: string[]) => Promise<{ success: boolean; error?: string }>;
  setFilterLokasi: (lokasi: LokasiType | null) => void;

  reset: () => void;
}

const initialState = {
  guruList: [],
  selectedGuru: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  searchQuery: "",
  showInactive: false,
  selectedIds: [], // ✅ NEW
  filterLokasi: null, // ✅ NEW
};

export const useGuruStore = create<GuruState>((set, get) => ({
  ...initialState,

  fetchGuruList: async () => {
    const supabase = createClient();

    try {
      set({ isLoading: true, error: null });

      let query = supabase
        .from("guru")
        .select("*")
        .order("nama", { ascending: true });

      if (!get().showInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ guruList: data || [], isLoading: false });
    } catch (error) {
      console.error("fetchGuruList error:", error);
      set({ error: "Gagal memuat daftar guru", isLoading: false, guruList: [] });
    }
  },

  fetchGuruById: async (id: string) => {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("guru")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      set({ selectedGuru: data });
      return data;
    } catch (error) {
      console.error("fetchGuruById error:", error);
      return null;
    }
  },

  createGuru: async (data: GuruInsert & { password?: string }) => {
    try {
      set({ isSubmitting: true, error: null });

      if (data.password) {
        const response = await fetch('/api/admin/create-guru', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!result.success) {
          set({ isSubmitting: false });
          return { success: false, error: result.error || 'Gagal menambah guru' };
        }

        await get().fetchGuruList();
        set({ isSubmitting: false });
        return { success: true };
      }

      const supabase = createClient();
      const { error } = await supabase.from("guru").insert(data);

      if (error) {
        if (error.code === "23505") {
          set({ isSubmitting: false });
          return { success: false, error: "Email sudah terdaftar" };
        }
        set({ isSubmitting: false });
        return { success: false, error: error.message };
      }

      await get().fetchGuruList();
      set({ isSubmitting: false });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menambah guru";
      set({ error: message, isSubmitting: false });
      return { success: false, error: message };
    }
  },

  updateGuru: async (id: string, data: GuruUpdate) => {
    const supabase = createClient();

    try {
      set({ isSubmitting: true, error: null });

      const { error } = await supabase.from("guru").update(data).eq("id", id);

      if (error) {
        if (error.code === "23505") {
          set({ isSubmitting: false });
          return { success: false, error: "Email sudah digunakan guru lain" };
        }
        set({ isSubmitting: false });
        return { success: false, error: error.message };
      }

      await get().fetchGuruList();
      set({ isSubmitting: false, selectedGuru: null });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengupdate guru";
      set({ error: message, isSubmitting: false });
      return { success: false, error: message };
    }
  },

  deleteGuru: async (id: string) => {
    const supabase = createClient();

    try {
      set({ isSubmitting: true, error: null });

      const { error } = await supabase
        .from("guru")
        .update({ is_active: false })
        .eq("id", id);

      if (error) {
        set({ isSubmitting: false });
        return { success: false, error: error.message };
      }

      await get().fetchGuruList();
      set({ isSubmitting: false });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus guru";
      set({ error: message, isSubmitting: false });
      return { success: false, error: message };
    }
  },

  // ✅ NEW: Toggle single selection
  toggleSelectGuru: (id: string) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((i) => i !== id) });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },

  // ✅ NEW: Select all or deselect all
  selectAllGuru: (ids: string[]) => {
    const { selectedIds } = get();
    if (selectedIds.length === ids.length) {
      set({ selectedIds: [] }); // Deselect all
    } else {
      set({ selectedIds: ids }); // Select all
    }
  },

  // ✅ NEW: Clear selection
  clearSelection: () => set({ selectedIds: [] }),

  // ✅ NEW: Batch delete
  batchDeleteGuru: async (ids: string[]) => {
    const supabase = createClient();

    try {
      set({ isSubmitting: true, error: null });

      const { error } = await supabase
        .from("guru")
        .update({ is_active: false })
        .in("id", ids);

      if (error) {
        set({ isSubmitting: false });
        return { success: false, error: error.message };
      }

      await get().fetchGuruList();
      set({ isSubmitting: false, selectedIds: [] });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus guru";
      set({ error: message, isSubmitting: false });
      return { success: false, error: message };
    }
  },

  // ✅ NEW: Set filter lokasi
  setFilterLokasi: (filterLokasi) => set({ filterLokasi }),

  setSelectedGuru: (guru) => set({ selectedGuru: guru }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setShowInactive: (showInactive) => set({ showInactive }),
  reset: () => set(initialState),
}));

// ✅ FIXED: Proper selector
export const useFilteredGuruList = () => {
  const guruList = useGuruStore((state) => state.guruList);
  const searchQuery = useGuruStore((state) => state.searchQuery);

  if (!searchQuery.trim()) return guruList;

  const query = searchQuery.toLowerCase();
  return guruList.filter(
    (guru) =>
      guru.nama.toLowerCase().includes(query) ||
      guru.email.toLowerCase().includes(query) ||
      guru.nip?.toLowerCase().includes(query) ||
      guru.jabatan?.toLowerCase().includes(query)
  );
};