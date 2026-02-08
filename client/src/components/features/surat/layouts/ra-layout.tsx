import type { SuratWithRelations, SnapshotTTD } from "@/types";
import type { TemplateData } from "@/types/template";
import { getTemplate } from "@/constants/template-registry";
import KopSurat from "../shared/kop-surat";
import SuratMeta from "../shared/surat-meta";
import SuratBody from "../shared/surat-body";
import SignatureBlock from "../shared/signature-block";
import TembusanList from "../shared/tembusan-list";

interface RALayoutProps {
  surat: SuratWithRelations;
}

export default function RALayout({ surat }: RALayoutProps) {
  const templateId = surat.template_id ?? "surat-umum";
  const template = getTemplate(templateId);
  const templateData = (surat.template_data ?? {}) as TemplateData;

  return (
    <>
      <KopSurat lembaga={surat.lembaga} variant="ra" />

      {!template.struktur.judulTengah && (
        <SuratMeta
          nomorSurat={surat.nomor_surat}
          perihal={surat.perihal}
          lampiran={surat.lampiran}
          sifat={surat.sifat}
        />
      )}

      {template.struktur.pakaiKepada && surat.kepada && surat.kepada !== "-" && (
        <div className="surat-tujuan mt-5">
          <p>Kepada Yth.</p>
          <p>{surat.kepada}</p>
          {surat.alamat_tujuan && (
            <p>
              di{" "}
              <span style={{ marginLeft: "1em" }}>{surat.alamat_tujuan}</span>
            </p>
          )}
        </div>
      )}

      <SuratBody
        isiSurat={surat.isi_surat}
        templateId={templateId}
        templateData={templateData}
        lembaga={surat.lembaga}
        nomorSurat={surat.nomor_surat}
      />

      <SignatureBlock
        tanggal={surat.tanggal_surat}
        snapshot={surat.snapshot_ttd as unknown as SnapshotTTD}
        lembaga={surat.lembaga}
      />

      {template.struktur.pakaiTembusan &&
        surat.tembusan &&
        surat.tembusan.length > 0 && (
          <TembusanList tembusan={surat.tembusan} />
        )}
    </>
  );
}
