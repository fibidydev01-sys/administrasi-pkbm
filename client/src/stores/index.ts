/**
 * Zustand Stores
 * Sistem Absensi PKBM Al Barakah v3.0.0
 */

// Auth Store
export { useAuthStore } from "./auth-store";

// Settings Store
export { useSettingsStore, useSettings } from "./settings-store";

// Guru Store
export { useGuruStore, useFilteredGuruList } from "./guru-store";

// Jadwal Store
export { useJadwalStore, useJadwalToday } from "./jadwal-store";

// Absen Store
export {
  useAbsenStore,
  useTodayAbsensiByJadwal,
  useHasAbsenMasuk,
  useHasAbsenPulang,
} from "./absen-store";

// Admin Store
export { useAdminStore } from "./admin-store";

// Tukar Jadwal Store
export { useTukarJadwalStore } from "./tukar-jadwal-store";