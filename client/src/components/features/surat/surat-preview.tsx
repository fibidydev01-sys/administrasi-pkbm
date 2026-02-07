import type { SuratWithRelations } from "@/types";
import SuratRenderer from "./surat-renderer";

interface SuratPreviewProps {
  surat: SuratWithRelations;
}

export default function SuratPreview({ surat }: SuratPreviewProps) {
  return (
    <div className="bg-white shadow-lg mx-auto max-w-[210mm] min-h-[297mm] p-[25mm_20mm_20mm_25mm] text-black text-[12pt] font-serif print:shadow-none print:p-[25mm_20mm_20mm_25mm]">
      <SuratRenderer surat={surat} />
    </div>
  );
}
