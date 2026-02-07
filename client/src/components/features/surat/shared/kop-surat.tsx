import type { Lembaga } from "@/types";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { KOP_CONFIG, SURAT_TYPOGRAPHY } from "@/constants";

export type KopVariant = "yayasan" | "pkbm" | "ra" | "kb" | "tk";

interface KopSuratProps {
  lembaga: Lembaga;
  variant?: KopVariant;
}

const VARIANT_STYLES: Record<
  KopVariant,
  { logoPosition: "center" | "left" }
> = {
  yayasan: { logoPosition: "center" },
  pkbm: { logoPosition: "left" },
  ra: { logoPosition: "center" },
  kb: { logoPosition: "center" },
  tk: { logoPosition: "center" },
};

export default function KopSurat({ lembaga, variant = "yayasan" }: KopSuratProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className="kop-surat">
      <div
        className={cn(
          "flex items-center gap-4",
          styles.logoPosition === "center" && "justify-center",
          styles.logoPosition === "left" && "justify-start"
        )}
      >
        {lembaga.logo_url && (
          <div
            className="relative flex-shrink-0"
            style={{
              width: `${KOP_CONFIG.logoSize}mm`,
              height: `${KOP_CONFIG.logoSize}mm`,
            }}
          >
            <Image src={lembaga.logo_url} alt="Logo" fill className="object-contain" />
          </div>
        )}

        <div className={cn("flex-1", styles.logoPosition === "center" && "text-center")}>
          <h1
            className="font-bold uppercase"
            style={{ fontSize: SURAT_TYPOGRAPHY.kopUnitSize }}
          >
            {lembaga.nama}
          </h1>
          <div style={{ fontSize: SURAT_TYPOGRAPHY.kopAlamatSize }} className="mt-1">
            <p>{lembaga.alamat}</p>
            <p
              className={cn(
                "flex gap-2 items-center",
                styles.logoPosition === "center" && "justify-center"
              )}
            >
              {lembaga.telepon && <span>Telp: {lembaga.telepon}</span>}
              {lembaga.email && <span>| Email: {lembaga.email}</span>}
              {lembaga.website && <span>| {lembaga.website}</span>}
            </p>
          </div>
        </div>
      </div>

      <hr className="kop-divider" />
    </div>
  );
}
