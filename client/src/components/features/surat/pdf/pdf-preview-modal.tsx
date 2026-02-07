"use client";

import { useState } from "react";
import { BlobProvider, pdf } from "@react-pdf/renderer";
import { Eye, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { SuratWithRelations } from "@/types";
import type { PaperSize } from "@/constants";
import { DEFAULT_PAPER_SIZE } from "@/constants";
import PDFSuratDocument from "./pdf-surat-document";

interface PDFPreviewModalProps {
  surat: SuratWithRelations;
  paperSize?: PaperSize;
}

export default function PDFPreviewModal({
  surat,
  paperSize = DEFAULT_PAPER_SIZE,
}: PDFPreviewModalProps) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const filename = `${surat.nomor_surat?.replace(/\//g, "-") || "surat"}.pdf`;

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await pdf(
        <PDFSuratDocument surat={surat} paperSize={paperSize} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Preview PDF
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-[85vw] sm:max-w-5xl flex flex-col p-0"
      >
        <SheetHeader className="flex-row items-center justify-between border-b px-4 py-3">
          <SheetTitle className="text-base">
            {surat.nomor_surat || "Draft"}
          </SheetTitle>
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            className="mr-8"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
        </SheetHeader>

        <div className="flex-1 min-h-0 p-2">
          {open && (
            <BlobProvider
              document={
                <PDFSuratDocument surat={surat} paperSize={paperSize} />
              }
            >
              {({ url, loading, error }) => {
                if (loading) {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="ml-3 text-muted-foreground">
                        Generating PDF...
                      </span>
                    </div>
                  );
                }

                if (error) {
                  return (
                    <div className="flex items-center justify-center h-full text-destructive">
                      Gagal generate PDF: {error.message}
                    </div>
                  );
                }

                return (
                  <iframe
                    src={url!}
                    className="w-full h-full rounded border"
                    title="PDF Preview"
                  />
                );
              }}
            </BlobProvider>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
