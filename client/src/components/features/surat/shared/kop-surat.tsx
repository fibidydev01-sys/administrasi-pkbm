import type { Lembaga } from "@/types";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type KopVariant = "yayasan" | "pkbm" | "ra" | "kb" | "tk";

interface KopSuratProps {
  lembaga: Lembaga;
  variant?: KopVariant;
}

const VARIANT_STYLES: Record<
  KopVariant,
  { logoPosition: "center" | "left"; titleSize: string; dividerStyle: "double" | "single" }
> = {
  yayasan: { logoPosition: "center", titleSize: "18pt", dividerStyle: "double" },
  pkbm: { logoPosition: "left", titleSize: "16pt", dividerStyle: "single" },
  ra: { logoPosition: "center", titleSize: "16pt", dividerStyle: "double" },
  kb: { logoPosition: "center", titleSize: "16pt", dividerStyle: "single" },
  tk: { logoPosition: "center", titleSize: "16pt", dividerStyle: "double" },
};

export default function KopSurat({ lembaga, variant = "yayasan" }: KopSuratProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <header className="kop-surat">
      <div
        className={cn(
          "flex items-center gap-4",
          styles.logoPosition === "center" && "justify-center",
          styles.logoPosition === "left" && "justify-start"
        )}
      >
        {lembaga.logo_url && (
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image src={lembaga.logo_url} alt="Logo" fill className="object-contain" />
          </div>
        )}

        <div className={cn("flex-1", styles.logoPosition === "center" && "text-center")}>
          <h1 className="font-bold uppercase" style={{ fontSize: styles.titleSize }}>
            {lembaga.nama}
          </h1>
          <div className="text-[10pt] mt-1">
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

      <div
        className={cn(
          "mt-3 mb-5",
          styles.dividerStyle === "double" && "border-t-[3px] border-double border-black",
          styles.dividerStyle === "single" && "border-t-2 border-black"
        )}
      />
    </header>
  );
}
