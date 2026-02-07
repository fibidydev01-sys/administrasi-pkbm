import type { SuratWithRelations } from "@/types";
import { LEMBAGA_VARIANT_MAP } from "@/constants";
import YayasanLayout from "./layouts/yayasan-layout";
import PKBMLayout from "./layouts/pkbm-layout";
import RALayout from "./layouts/ra-layout";
import KBLayout from "./layouts/kb-layout";
import TKLayout from "./layouts/tk-layout";

interface SuratRendererProps {
  surat: SuratWithRelations;
}

const LAYOUT_MAP: Record<string, React.ComponentType<{ surat: SuratWithRelations }>> = {
  yayasan: YayasanLayout,
  pkbm: PKBMLayout,
  ra: RALayout,
  kb: KBLayout,
  tk: TKLayout,
};

export default function SuratRenderer({ surat }: SuratRendererProps) {
  const variant = LEMBAGA_VARIANT_MAP[surat.lembaga.kode];
  const LayoutComponent = variant ? LAYOUT_MAP[variant] : null;

  if (!LayoutComponent) {
    return (
      <div className="p-8 text-center text-red-500">
        Layout tidak ditemukan untuk kode lembaga: {surat.lembaga.kode}
      </div>
    );
  }

  return <LayoutComponent surat={surat} />;
}
