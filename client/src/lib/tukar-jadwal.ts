import { createClient } from "@/lib/supabase/client";
import { getToday } from "@/lib/utils";
import type { JadwalWithGuru, TukarJadwalWithRelations } from "@/types";

/**
 * Apply tukar jadwal logic to a guru's normal jadwal for today.
 *
 * Logic:
 * 1. Get approved swaps where today = tanggal_pemohon or tanggal_target
 * 2. REMOVE jadwal that this guru swapped away today
 * 3. ADD jadwal that this guru received from a swap today
 */
export async function applyTukarJadwal(
  normalJadwal: JadwalWithGuru[],
  guruId: string
): Promise<JadwalWithGuru[]> {
  const supabase = createClient();
  const today = getToday();

  try {
    // Fetch approved swaps that affect today
    const { data: swaps, error } = await supabase
      .from("tukar_jadwal")
      .select(`
        *,
        pemohon:pemohon_id(*),
        jadwal_pemohon:jadwal_pemohon_id(*, guru:guru_id(*)),
        tukar_jadwal_guru(*, guru:guru_id(*), jadwal:jadwal_id(*, guru:guru_id(*)))
      `)
      .eq("status", "approved")
      .or(`tanggal_pemohon.eq.${today},tanggal_target.eq.${today}`);

    if (error || !swaps || swaps.length === 0) {
      return normalJadwal;
    }

    const typedSwaps = swaps as unknown as TukarJadwalWithRelations[];
    let result = [...normalJadwal];
    const jadwalToAdd: JadwalWithGuru[] = [];
    const jadwalIdsToRemove = new Set<string>();

    for (const swap of typedSwaps) {
      const isPemohon = swap.pemohon_id === guruId;
      const isTarget = swap.tukar_jadwal_guru.some((tg) => tg.guru_id === guruId);

      if (!isPemohon && !isTarget) continue;

      if (isPemohon && swap.tanggal_pemohon === today) {
        // Pemohon's jadwal is swapped OUT today → remove it
        jadwalIdsToRemove.add(swap.jadwal_pemohon_id);
      }

      if (isPemohon && swap.tanggal_target === today) {
        // Pemohon takes over target guru's jadwal today → add them
        for (const tg of swap.tukar_jadwal_guru) {
          if (tg.jadwal && tg.guru) {
            jadwalToAdd.push({
              ...tg.jadwal,
              guru: tg.guru,
              // Override guru_id to current user for absensi purposes
              _swap_info: {
                original_guru: tg.guru.nama,
                swap_id: swap.id,
              },
            } as JadwalWithGuru & { _swap_info: unknown });
          }
        }
      }

      if (isTarget && swap.tanggal_target === today) {
        // Target guru's jadwal is swapped OUT today → remove it
        const myEntry = swap.tukar_jadwal_guru.find((tg) => tg.guru_id === guruId);
        if (myEntry) {
          jadwalIdsToRemove.add(myEntry.jadwal_id);
        }
      }

      if (isTarget && swap.tanggal_pemohon === today) {
        // Target guru takes over pemohon's jadwal today → add it
        if (swap.jadwal_pemohon) {
          jadwalToAdd.push({
            ...swap.jadwal_pemohon,
            _swap_info: {
              original_guru: swap.pemohon?.nama,
              swap_id: swap.id,
            },
          } as JadwalWithGuru & { _swap_info: unknown });
        }
      }
    }

    // Apply removals
    result = result.filter((j) => !jadwalIdsToRemove.has(j.id));

    // Apply additions (avoid duplicates)
    const existingIds = new Set(result.map((j) => j.id));
    for (const j of jadwalToAdd) {
      if (!existingIds.has(j.id)) {
        result.push(j);
        existingIds.add(j.id);
      }
    }

    // Sort by time
    result.sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai));

    return result;
  } catch (error) {
    console.error("applyTukarJadwal error:", error);
    // On error, return normal jadwal (fail-safe)
    return normalJadwal;
  }
}
