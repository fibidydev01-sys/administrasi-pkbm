import { SURAT_TYPOGRAPHY } from "@/constants";

interface SuratBodyProps {
  isiSurat: string;
}

export default function SuratBody({ isiSurat }: SuratBodyProps) {
  return (
    <div className="surat-body" style={{ marginTop: "5mm" }}>
      <p style={{ textIndent: SURAT_TYPOGRAPHY.paragraphIndent }}>
        Dengan hormat,
      </p>

      <div
        className="surat-content text-justify leading-relaxed"
        style={{ marginTop: "3mm" }}
        dangerouslySetInnerHTML={{ __html: isiSurat }}
      />

      <p
        style={{
          textIndent: SURAT_TYPOGRAPHY.paragraphIndent,
          marginTop: "3mm",
        }}
      >
        Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami
        ucapkan terima kasih.
      </p>
    </div>
  );
}
