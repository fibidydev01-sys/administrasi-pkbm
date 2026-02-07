import type { SuratWithRelations, SnapshotTTD } from "@/types";
import KopSurat from "../shared/kop-surat";
import SuratMeta from "../shared/surat-meta";
import SuratBody from "../shared/surat-body";
import SignatureBlock from "../shared/signature-block";
import TembusanList from "../shared/tembusan-list";

interface PKBMLayoutProps {
  surat: SuratWithRelations;
}

export default function PKBMLayout({ surat }: PKBMLayoutProps) {
  return (
    <div className="surat-container a4-page">
      <KopSurat lembaga={surat.lembaga} variant="pkbm" />

      <SuratMeta
        nomorSurat={surat.nomor_surat}
        perihal={surat.perihal}
        lampiran={surat.lampiran}
      />

      <div className="surat-tujuan mt-5">
        <p>
          Kepada Yth,
          <br />
          {surat.kepada}
          <br />
          {surat.alamat_tujuan && <>di {surat.alamat_tujuan}</>}
        </p>
      </div>

      <SuratBody isiSurat={surat.isi_surat} />

      <SignatureBlock
        tanggal={surat.tanggal_surat}
        snapshot={surat.snapshot_ttd as unknown as SnapshotTTD}
        lembaga={surat.lembaga}
        position="right"
      />

      {surat.tembusan && surat.tembusan.length > 0 && (
        <TembusanList tembusan={surat.tembusan} />
      )}
    </div>
  );
}
