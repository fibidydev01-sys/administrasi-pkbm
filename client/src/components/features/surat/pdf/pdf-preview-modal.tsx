"use client";

import { useState } from "react";
import { BlobProvider, pdf } from "@react-pdf/renderer";
import { Eye, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Preview PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>Preview Surat — {surat.nomor_surat || "Draft"}</span>
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
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
                    className="w-full h-full border rounded"
                    title="PDF Preview"
                  />
                );
              }}
            </BlobProvider>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
