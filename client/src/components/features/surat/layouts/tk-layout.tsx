import type { SuratWithRelations, SnapshotTTD } from "@/types";
import KopSurat from "../shared/kop-surat";
import SuratMeta from "../shared/surat-meta";
import SuratBody from "../shared/surat-body";
import SignatureBlock from "../shared/signature-block";
import TembusanList from "../shared/tembusan-list";

interface TKLayoutProps {
  surat: SuratWithRelations;
}

export default function TKLayout({ surat }: TKLayoutProps) {
  return (
    <>
      <KopSurat lembaga={surat.lembaga} variant="tk" />

      <SuratMeta
        nomorSurat={surat.nomor_surat}
        perihal={surat.perihal}
        lampiran={surat.lampiran}
        sifat={surat.sifat}
      />

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

      <SuratBody isiSurat={surat.isi_surat} />

      <SignatureBlock
        tanggal={surat.tanggal_surat}
        snapshot={surat.snapshot_ttd as unknown as SnapshotTTD}
        lembaga={surat.lembaga}
      />

      {surat.tembusan && surat.tembusan.length > 0 && (
        <TembusanList tembusan={surat.tembusan} />
      )}
    </>
  );
}
