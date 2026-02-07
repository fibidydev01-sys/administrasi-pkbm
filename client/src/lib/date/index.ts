import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

/**
 * Format date ke format Indonesia
 * @example formatTanggal('2025-02-07') => 'Madiun, 07 Februari 2025'
 */
export function formatTanggalSurat(date: string | Date, kota: string = "Madiun"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const formatted = format(dateObj, "dd MMMM yyyy", { locale: localeId });
  return `${kota}, ${formatted}`;
}

/**
 * Format date pendek
 * @example formatTanggalPendek('2025-02-07') => '07 Feb 2025'
 */
export function formatTanggalPendek(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd MMM yyyy", { locale: localeId });
}

/**
 * Format date untuk input date field
 */
export function formatDateInput(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Convert bulan ke romawi
 */
export function monthToRoman(month: number): string {
  const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return romans[month - 1] || "";
}

/**
 * Format nomor surat
 * @example formatNomorSurat(1, 'YYS', new Date('2025-02-07')) => '001/YYS/II/2025'
 */
export function formatNomorSurat(counter: number, prefix: string, date: Date): string {
  const paddedCounter = String(counter).padStart(3, "0");
  const month = monthToRoman(date.getMonth() + 1);
  const year = date.getFullYear();
  return `${paddedCounter}/${prefix}/${month}/${year}`;
}

/**
 * Get today in YYYY-MM-DD format
 */
export function getToday(): string {
  return format(new Date(), "yyyy-MM-dd");
}
