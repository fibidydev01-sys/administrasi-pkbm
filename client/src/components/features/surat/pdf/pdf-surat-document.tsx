import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import type { SuratWithRelations, SnapshotTTD, Tembusan, BodyPart, TemplateData, SuratTemplateField } from "@/types";
import type { PaperSize } from "@/constants";
import { PAPER_SIZE, DEFAULT_PAPER_SIZE } from "@/constants";
import { formatTanggalSurat } from "@/lib/date";
import { pdfStyles as s } from "./pdf-styles";

interface PDFSuratDocumentProps {
  surat: SuratWithRelations;
  paperSize?: PaperSize;
}

/**
 * Strip HTML tags dan return array of paragraphs
 */
function parseHtmlToParagraphs(html: string): string[] {
  // Split by <p>, </p>, <br>, <br/>
  const blocks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "") // strip remaining tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return blocks;
}

// === KOP SURAT ===
function PdfKopSurat({ surat }: { surat: SuratWithRelations }) {
  const lembaga = surat.lembaga;
  const variant = lembaga.kode === "PKBM" ? "left" : "center";

  const kontakParts: string[] = [];
  if (lembaga.telepon) kontakParts.push(`Telp: ${lembaga.telepon}`);
  if (lembaga.email) kontakParts.push(`Email: ${lembaga.email}`);
  if (lembaga.website) kontakParts.push(lembaga.website);

  return (
    <View>
      <View style={variant === "center" ? s.kopContainerCenter : s.kopContainer}>
        {lembaga.logo_url && (
          <Image src={lembaga.logo_url} style={s.kopLogo} />
        )}
        <View style={variant === "center" ? s.kopTextCenter : s.kopTextLeft}>
          <Text style={s.kopNamaLembaga}>{lembaga.nama}</Text>
          <Text style={s.kopAlamat}>{lembaga.alamat}</Text>
          {kontakParts.length > 0 && (
            <Text style={s.kopKontak}>{kontakParts.join(" | ")}</Text>
          )}
        </View>
      </View>
      <View style={s.kopDivider} />
    </View>
  );
}

// === SURAT META ===
function PdfSuratMeta({ surat }: { surat: SuratWithRelations }) {
  return (
    <View style={s.metaContainer}>
      {/* Nomor */}
      <View style={s.metaRow}>
        <Text style={s.metaLabel}>Nomor</Text>
        <Text style={s.metaColon}>:</Text>
        <Text style={s.metaValue}>{surat.nomor_surat}</Text>
      </View>

      {/* Sifat (hanya jika bukan Biasa) */}
      {surat.sifat && surat.sifat !== "Biasa" && (
        <View style={s.metaRow}>
          <Text style={s.metaLabel}>Sifat</Text>
          <Text style={s.metaColon}>:</Text>
          <Text style={s.metaValue}>{surat.sifat}</Text>
        </View>
      )}

      {/* Lampiran */}
      {surat.lampiran && (
        <View style={s.metaRow}>
          <Text style={s.metaLabel}>Lampiran</Text>
          <Text style={s.metaColon}>:</Text>
          <Text style={s.metaValue}>{surat.lampiran}</Text>
        </View>
      )}

      {/* Hal (underline) */}
      <View style={s.metaRow}>
        <Text style={s.metaLabel}>Hal</Text>
        <Text style={s.metaColon}>:</Text>
        <Text style={s.metaValueUnderline}>{surat.perihal}</Text>
      </View>
    </View>
  );
}

// === TUJUAN BLOCK ===
function PdfTujuanBlock({ surat }: { surat: SuratWithRelations }) {
  return (
    <View style={s.tujuanContainer}>
      <Text>Kepada Yth.</Text>
      <Text>{surat.kepada}</Text>
      {surat.alamat_tujuan && (
        <View style={s.tujuanDi}>
          <Text style={s.tujuanDiLabel}>di</Text>
          <Text>{surat.alamat_tujuan}</Text>
        </View>
      )}
    </View>
  );
}

// === BODY (with template support) ===
function PdfSuratBody({ surat }: { surat: SuratWithRelations }) {
  const hasTemplate = !!surat.template_id;
  const templateData = surat.template_data as unknown as TemplateData | null;
  const template = surat.template;

  // If surat uses a template with body_parts, render structured content
  if (hasTemplate && template && templateData) {
    const bodyParts = template.body_parts as unknown as BodyPart[];
    const fields = (template as unknown as { fields?: SuratTemplateField[] }).fields ?? [];

    return (
      <View style={s.bodyContainer}>
        {bodyParts.map((part, partIdx) => {
          if (part.type === "text") {
            const lines = part.value.split("\n").filter((l) => l.trim());
            return lines.map((line, lineIdx) => (
              <Text
                key={`${partIdx}-${lineIdx}`}
                style={partIdx === 0 && lineIdx === 0 ? s.bodyParagraph : s.bodyContent}
              >
                {line}
              </Text>
            ));
          }
          if (part.type === "field_group") {
            const sectionFields = fields
              .filter((f) => f.section === part.section)
              .sort((a, b) => a.urutan - b.urutan);

            return (
              <View key={partIdx} style={s.fieldGroupContainer}>
                {sectionFields.map((field) => (
                  <View key={field.id} style={s.fieldRow}>
                    <Text style={s.fieldLabel}>{field.label}</Text>
                    <Text style={s.fieldColon}>:</Text>
                    <Text style={s.fieldValue}>
                      {templateData[field.nama_field] || field.default_value || "-"}
                    </Text>
                  </View>
                ))}
              </View>
            );
          }
          return null;
        })}
      </View>
    );
  }

  // Fallback: render isi_surat as plain text with standard pembuka/penutup
  const paragraphs = parseHtmlToParagraphs(surat.isi_surat);

  return (
    <View style={s.bodyContainer}>
      <Text style={s.bodyParagraph}>Dengan hormat,</Text>

      {paragraphs.map((p, i) => (
        <Text key={i} style={s.bodyContent}>
          {p}
        </Text>
      ))}

      <Text style={s.bodyParagraph}>
        Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami
        ucapkan terima kasih.
      </Text>
    </View>
  );
}

// === SIGNATURE BLOCK ===
function PdfSignatureBlock({ surat }: { surat: SuratWithRelations }) {
  const snapshot = surat.snapshot_ttd as unknown as SnapshotTTD | null;
  const lembaga = surat.lembaga;

  const ttdData = {
    jabatan: snapshot?.jabatan || lembaga.ttd_jabatan || "",
    nama: snapshot?.nama || lembaga.ttd_nama || "",
    nip: snapshot?.nip || lembaga.ttd_nip || "",
    image_url: snapshot?.image_url || lembaga.ttd_image_url || "",
  };

  return (
    <View style={s.signatureContainer}>
      <Text style={s.signatureText}>
        {formatTanggalSurat(surat.tanggal_surat)}
      </Text>
      <Text style={s.signatureJabatan}>{ttdData.jabatan},</Text>

      {ttdData.image_url ? (
        <Image src={ttdData.image_url} style={s.signatureImage} />
      ) : (
        <View style={s.signatureSpace} />
      )}

      <Text style={s.signatureNama}>{ttdData.nama}</Text>

      {ttdData.nip && (
        <Text style={s.signatureNip}>NIP. {ttdData.nip}</Text>
      )}
    </View>
  );
}

// === TEMBUSAN ===
function PdfTembusanList({ tembusan }: { tembusan: Tembusan[] }) {
  if (!tembusan || tembusan.length === 0) return null;

  const sorted = [...tembusan].sort((a, b) => a.urutan - b.urutan);

  return (
    <View style={s.tembusanContainer}>
      <Text style={s.tembusanTitle}>Tembusan:</Text>
      {sorted.map((item, i) => (
        <Text key={item.id} style={s.tembusanItem}>
          {i + 1}. {item.nama_penerima}
        </Text>
      ))}
    </View>
  );
}

// === MAIN DOCUMENT ===
export default function PDFSuratDocument({
  surat,
  paperSize = DEFAULT_PAPER_SIZE,
}: PDFSuratDocumentProps) {
  const paper = PAPER_SIZE[paperSize];

  return (
    <Document
      title={`Surat - ${surat.nomor_surat || "Draft"}`}
      author={surat.lembaga.nama}
    >
      <Page
        size={{ width: paper.width * 2.835, height: paper.height * 2.835 }}
        style={s.page}
      >
        <PdfKopSurat surat={surat} />
        <PdfSuratMeta surat={surat} />
        <PdfTujuanBlock surat={surat} />
        <PdfSuratBody surat={surat} />
        <PdfSignatureBlock surat={surat} />
        {surat.tembusan && surat.tembusan.length > 0 && (
          <PdfTembusanList tembusan={surat.tembusan} />
        )}
      </Page>
    </Document>
  );
}
