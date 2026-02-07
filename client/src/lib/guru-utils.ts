import type { Guru, JadwalWithGuru, LokasiType } from "@/types";

/**
 * Filter guru berdasarkan lokasi jadwal mereka
 */
export function filterGuruByLokasi(
  guruList: Guru[],
  jadwalList: JadwalWithGuru[],
  lokasi: LokasiType | null
): Guru[] {
  if (!lokasi) return guruList;

  // Get unique guru IDs yang punya jadwal di lokasi tertentu
  const guruIdsInLokasi = new Set(
    jadwalList
      .filter((jadwal) => jadwal.lokasi === lokasi)
      .map((jadwal) => jadwal.guru_id)
  );

  return guruList.filter((guru) => guruIdsInLokasi.has(guru.id));
}

/**
 * Get label lokasi untuk guru (berdasarkan jadwal)
 */
export function getGuruLokasiLabel(
  guru: Guru,
  jadwalList: JadwalWithGuru[]
): string {
  const guruJadwal = jadwalList.filter((j) => j.guru_id === guru.id);

  if (guruJadwal.length === 0) return "-";

  const hasJiwan = guruJadwal.some((j) => j.lokasi === "jiwan");
  const hasGrobogan = guruJadwal.some((j) => j.lokasi === "grobogan");

  if (hasJiwan && hasGrobogan) return "Jiwan & Grobogan";
  if (hasJiwan) return "Jiwan";
  if (hasGrobogan) return "Grobogan";
  return "-";
}