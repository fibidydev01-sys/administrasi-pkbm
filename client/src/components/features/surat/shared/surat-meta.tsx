interface SuratMetaProps {
  nomorSurat: string;
  perihal: string;
  lampiran?: string | null;
  sifat?: string | null;
}

export default function SuratMeta({ nomorSurat, perihal, lampiran, sifat }: SuratMetaProps) {
  return (
    <div className="surat-meta mt-5">
      <table>
        <tbody>
          <tr>
            <td className="w-20 py-0.5 align-top">Nomor</td>
            <td className="w-4 py-0.5 align-top">:</td>
            <td className="py-0.5">{nomorSurat}</td>
          </tr>
          {sifat && sifat !== "Biasa" && (
            <tr>
              <td className="py-0.5 align-top">Sifat</td>
              <td className="py-0.5 align-top">:</td>
              <td className="py-0.5">{sifat}</td>
            </tr>
          )}
          {lampiran && (
            <tr>
              <td className="py-0.5 align-top">Lampiran</td>
              <td className="py-0.5 align-top">:</td>
              <td className="py-0.5">{lampiran}</td>
            </tr>
          )}
          <tr>
            <td className="py-0.5 align-top">Hal</td>
            <td className="py-0.5 align-top">:</td>
            <td className="py-0.5 underline">{perihal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
