import type { Jadwal, Settings, JadwalStatus, HariIndex } from "@/types";
import { HARI_NAMES, HARI_SHORT } from "@/types";

export function parseTimeToDate(timeStr: string): Date {
  const [hours, minutes, seconds = 0] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
}

export function formatJam(timeStr: string): string {
  return timeStr.slice(0, 5);
}

export function getCurrentDayIndex(): HariIndex {
  return new Date().getDay() as HariIndex;
}

export function getHariName(index: number): string {
  return HARI_NAMES[index as HariIndex] || "Unknown";
}

export function getHariShort(index: number): string {
  return HARI_SHORT[index as HariIndex] || "?";
}

export function formatJadwalRange(jadwal: Jadwal): string {
  return `${formatJam(jadwal.jam_mulai)} - ${formatJam(jadwal.jam_selesai)}`;
}

export function formatJadwalFull(jadwal: Jadwal): string {
  return `${getHariName(jadwal.hari)}, ${formatJadwalRange(jadwal)}`;
}

/**
 * ✅ UPDATED: Dual Tolerance System
 * Calculate jadwal status dengan window terpisah untuk MASUK & PULANG
 */
export function calculateJadwalStatus(
  jadwal: Jadwal,
  settings: Settings,
  absensiToday: { tipe: "masuk" | "pulang" }[]
): JadwalStatus {
  const now = new Date();
  const jamMulai = parseTimeToDate(jadwal.jam_mulai);
  const jamSelesai = parseTimeToDate(jadwal.jam_selesai);

  // ✅ WINDOW ABSEN MASUK
  const windowMasukStart = new Date(jamMulai);
  windowMasukStart.setMinutes(
    windowMasukStart.getMinutes() - settings.toleransi_sebelum_masuk
  );

  const windowMasukEnd = new Date(jamMulai);
  windowMasukEnd.setMinutes(
    windowMasukEnd.getMinutes() + settings.toleransi_sesudah_masuk
  );

  // ✅ WINDOW ABSEN PULANG
  const windowPulangStart = new Date(jamSelesai);
  windowPulangStart.setMinutes(
    windowPulangStart.getMinutes() - settings.toleransi_sebelum_pulang
  );

  const windowPulangEnd = new Date(jamSelesai);
  windowPulangEnd.setMinutes(
    windowPulangEnd.getMinutes() + settings.toleransi_sesudah_pulang
  );

  // ✅ CEK STATUS ABSENSI
  const hasAbsenMasuk = absensiToday.some((a) => a.tipe === "masuk");
  const hasAbsenPulang = absensiToday.some((a) => a.tipe === "pulang");

  // ✅ CEK APAKAH BISA ABSEN
  const canAbsenMasuk =
    now >= windowMasukStart && now <= windowMasukEnd && !hasAbsenMasuk;

  const canAbsenPulang =
    now >= windowPulangStart &&
    now <= windowPulangEnd &&
    hasAbsenMasuk &&
    !hasAbsenPulang;

  const isWithinWindow = canAbsenMasuk || canAbsenPulang;

  // ✅ GENERATE MESSAGE YANG LEBIH JELAS
  let message = "";

  if (hasAbsenMasuk && hasAbsenPulang) {
    message = "Absensi lengkap ✓";
  } else if (canAbsenMasuk) {
    const diff = Math.round((windowMasukEnd.getTime() - now.getTime()) / 60000);
    message = `Silakan absen masuk (tersisa ${diff} menit)`;
  } else if (canAbsenPulang) {
    const diff = Math.round((windowPulangEnd.getTime() - now.getTime()) / 60000);
    message = `Silakan absen pulang (tersisa ${diff} menit)`;
  } else if (!hasAbsenMasuk && now < windowMasukStart) {
    const diff = Math.round((windowMasukStart.getTime() - now.getTime()) / 60000);
    message = `Window masuk buka dalam ${diff} menit`;
  } else if (hasAbsenMasuk && !hasAbsenPulang && now < windowPulangStart) {
    const diff = Math.round((windowPulangStart.getTime() - now.getTime()) / 60000);
    message = `Window pulang buka dalam ${diff} menit`;
  } else if (!hasAbsenMasuk && now > windowMasukEnd) {
    message = "Window absen masuk sudah lewat";
  } else if (hasAbsenMasuk && !hasAbsenPulang && now > windowPulangEnd) {
    message = "Window absen pulang sudah lewat";
  } else {
    message = "Di luar window absensi";
  }

  return {
    jadwal,
    canAbsenMasuk,
    canAbsenPulang,
    hasAbsenMasuk,
    hasAbsenPulang,
    windowStart: windowMasukStart.toTimeString().slice(0, 5),
    windowEnd: windowPulangEnd.toTimeString().slice(0, 5),
    isWithinWindow,
    message,
  };
}

export function filterJadwalToday<T extends Jadwal>(jadwalList: T[]): T[] {
  const today = getCurrentDayIndex();
  return jadwalList.filter((j) => j.hari === today && j.is_active);
}

export function sortJadwalByTime<T extends Jadwal>(jadwalList: T[]): T[] {
  return [...jadwalList].sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));
}

export function groupJadwalByHari<T extends Jadwal>(
  jadwalList: T[]
): Record<number, T[]> {
  return jadwalList.reduce(
    (acc, jadwal) => {
      if (!acc[jadwal.hari]) {
        acc[jadwal.hari] = [];
      }
      acc[jadwal.hari].push(jadwal);
      return acc;
    },
    {} as Record<number, T[]>
  );
}

/**
 * ✅ UPDATED: Check if jadwal is active dengan dual window
 */
export function isJadwalActive(jadwal: Jadwal, settings: Settings): boolean {
  if (jadwal.hari !== getCurrentDayIndex()) return false;
  if (!jadwal.is_active) return false;

  const now = new Date();
  const jamMulai = parseTimeToDate(jadwal.jam_mulai);
  const jamSelesai = parseTimeToDate(jadwal.jam_selesai);

  // Window MASUK
  const windowMasukStart = new Date(jamMulai);
  windowMasukStart.setMinutes(
    windowMasukStart.getMinutes() - settings.toleransi_sebelum_masuk
  );

  // Window PULANG
  const windowPulangEnd = new Date(jamSelesai);
  windowPulangEnd.setMinutes(
    windowPulangEnd.getMinutes() + settings.toleransi_sesudah_pulang
  );

  // Aktif jika dalam range window MASUK sampai window PULANG
  return now >= windowMasukStart && now <= windowPulangEnd;
}

/**
 * ✅ NEW: Helper untuk mendapatkan info window
 */
export function getWindowInfo(jadwal: Jadwal, settings: Settings) {
  const jamMulai = parseTimeToDate(jadwal.jam_mulai);
  const jamSelesai = parseTimeToDate(jadwal.jam_selesai);

  // Window MASUK
  const windowMasukStart = new Date(jamMulai);
  windowMasukStart.setMinutes(
    windowMasukStart.getMinutes() - settings.toleransi_sebelum_masuk
  );
  const windowMasukEnd = new Date(jamMulai);
  windowMasukEnd.setMinutes(
    windowMasukEnd.getMinutes() + settings.toleransi_sesudah_masuk
  );

  // Window PULANG
  const windowPulangStart = new Date(jamSelesai);
  windowPulangStart.setMinutes(
    windowPulangStart.getMinutes() - settings.toleransi_sebelum_pulang
  );
  const windowPulangEnd = new Date(jamSelesai);
  windowPulangEnd.setMinutes(
    windowPulangEnd.getMinutes() + settings.toleransi_sesudah_pulang
  );

  return {
    masuk: {
      start: windowMasukStart.toTimeString().slice(0, 5),
      end: windowMasukEnd.toTimeString().slice(0, 5),
      duration: Math.round(
        (windowMasukEnd.getTime() - windowMasukStart.getTime()) / 60000
      ),
    },
    pulang: {
      start: windowPulangStart.toTimeString().slice(0, 5),
      end: windowPulangEnd.toTimeString().slice(0, 5),
      duration: Math.round(
        (windowPulangEnd.getTime() - windowPulangStart.getTime()) / 60000
      ),
    },
  };
}