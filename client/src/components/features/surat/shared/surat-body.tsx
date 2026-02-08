import { SURAT_TYPOGRAPHY } from "@/constants";
import { getTemplate } from "@/constants/template-registry";
import type { Lembaga } from "@/types";
import type { TemplateData } from "@/types/template";
import { composeBodyFromTemplate } from "@/lib/template-composer";

interface SuratBodyProps {
  isiSurat: string;
  templateId?: string | null;
  templateData?: TemplateData | null;
  lembaga?: Lembaga | null;
  nomorSurat?: string;
}

export default function SuratBody({
  isiSurat,
  templateId,
  templateData,
  lembaga,
  nomorSurat,
}: SuratBodyProps) {
  const tplId = templateId ?? "surat-umum";
  const template = getTemplate(tplId);
  const tplData = (templateData ?? {}) as TemplateData;

  // For structured templates, compose body from template data
  const bodyHtml =
    template.bodyComposer === "structured" && lembaga
      ? composeBodyFromTemplate(tplId, tplData, lembaga, isiSurat)
      : isiSurat;

  // Determine pembuka and penutup from template
  const pembuka = template.struktur.pembuka;
  const penutup = template.struktur.penutup;

  return (
    <div className="surat-body" style={{ marginTop: "5mm" }}>
      {/* Judul Tengah (for Surat Keterangan, Surat Tugas) */}
      {template.struktur.judulTengah && (
        <div style={{ textAlign: "center", marginBottom: "3mm" }}>
          <p style={{ fontWeight: "bold", fontSize: "12pt" }}>
            {template.struktur.judulTengah}
          </p>
          {nomorSurat && (
            <p style={{ fontSize: "12pt" }}>Nomor: {nomorSurat}</p>
          )}
        </div>
      )}

      {/* Pembuka */}
      <p style={{ textIndent: template.struktur.judulTengah ? undefined : SURAT_TYPOGRAPHY.paragraphIndent }}>
        {pembuka}
      </p>

      {/* Body Content */}
      <div
        className="surat-content text-justify leading-relaxed"
        style={{ marginTop: "3mm" }}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {/* Penutup */}
      <p
        style={{
          textIndent: SURAT_TYPOGRAPHY.paragraphIndent,
          marginTop: "3mm",
        }}
      >
        {penutup}
      </p>
    </div>
  );
}
