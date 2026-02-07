import type { SuratWithRelations } from "@/types";
import type { PaperSize } from "@/constants";
import { PAPER_SIZE, MARGIN, SURAT_TYPOGRAPHY, DEFAULT_PAPER_SIZE } from "@/constants";
import SuratRenderer from "./surat-renderer";

interface SuratPreviewProps {
  surat: SuratWithRelations;
  paperSize?: PaperSize;
}

export default function SuratPreview({ surat, paperSize = DEFAULT_PAPER_SIZE }: SuratPreviewProps) {
  const paper = PAPER_SIZE[paperSize];
  const m = MARGIN;

  return (
    <div
      className="surat-preview bg-white shadow-lg mx-auto text-black print:shadow-none"
      style={{
        width: `${paper.width}mm`,
        minHeight: `${paper.height}mm`,
        padding: `${m.top}mm ${m.right}mm ${m.bottom}mm ${m.left}mm`,
        fontSize: SURAT_TYPOGRAPHY.bodySize,
        fontFamily: SURAT_TYPOGRAPHY.fontFamily,
        lineHeight: SURAT_TYPOGRAPHY.lineHeight,
      }}
      data-paper-size={paperSize}
    >
      <SuratRenderer surat={surat} />
    </div>
  );
}
