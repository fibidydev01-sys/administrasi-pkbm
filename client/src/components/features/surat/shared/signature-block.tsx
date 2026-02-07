import type { Lembaga, SnapshotTTD } from "@/types";
import { formatTanggalSurat } from "@/lib/date";
import { SIGNATURE_CONFIG, SURAT_TYPOGRAPHY } from "@/constants";
import Image from "next/image";

interface SignatureBlockProps {
  tanggal: string;
  snapshot: SnapshotTTD | null;
  lembaga: Lembaga;
  position?: "left" | "center" | "right";
}

export default function SignatureBlock({
  tanggal,
  snapshot,
  lembaga,
  position = "right",
}: SignatureBlockProps) {
  const ttdData = {
    jabatan: snapshot?.jabatan || lembaga.ttd_jabatan,
    nama: snapshot?.nama || lembaga.ttd_nama,
    nip: snapshot?.nip || lembaga.ttd_nip,
    image_url: snapshot?.image_url || lembaga.ttd_image_url,
  };

  return (
    <div
      className="signature-block mt-10"
      style={{
        width: SIGNATURE_CONFIG.width,
        marginLeft: position === "right" ? "auto" : position === "center" ? "auto" : 0,
        marginRight: position === "center" ? "auto" : 0,
      }}
    >
      <p className="text-center">{formatTanggalSurat(tanggal)}</p>
      <p className="text-center mt-1">{ttdData.jabatan},</p>

      {ttdData.image_url ? (
        <div className="relative w-full my-3" style={{ height: `${SIGNATURE_CONFIG.signatureSpace}px` }}>
          <Image src={ttdData.image_url} alt="TTD" fill className="object-contain" />
        </div>
      ) : (
        <div style={{ height: `${SIGNATURE_CONFIG.signatureSpace}px` }} />
      )}

      <p className="text-center font-bold underline">
        {ttdData.nama}
      </p>

      {ttdData.nip && (
        <p
          className="text-center mt-1"
          style={{ fontSize: SURAT_TYPOGRAPHY.nipSize }}
        >
          NIP. {ttdData.nip}
        </p>
      )}
    </div>
  );
}
