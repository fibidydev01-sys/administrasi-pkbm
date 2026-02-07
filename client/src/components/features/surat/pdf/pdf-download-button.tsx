"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SuratWithRelations } from "@/types";
import type { PaperSize } from "@/constants";
import { DEFAULT_PAPER_SIZE } from "@/constants";
import PDFSuratDocument from "./pdf-surat-document";

interface PDFDownloadButtonProps {
  surat: SuratWithRelations;
  paperSize?: PaperSize;
}

export default function PDFDownloadButton({
  surat,
  paperSize = DEFAULT_PAPER_SIZE,
}: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const blob = await pdf(
        <PDFSuratDocument surat={surat} paperSize={paperSize} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const filename = `${surat.nomor_surat?.replace(/\//g, "-") || "surat"}.pdf`;

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {loading ? "Generating..." : "Download PDF"}
    </Button>
  );
}
