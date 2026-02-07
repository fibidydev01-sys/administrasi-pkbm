interface SuratMetaProps {
  nomorSurat: string;
  perihal: string;
  lampiran?: string | null;
}

export default function SuratMeta({ nomorSurat, perihal, lampiran }: SuratMetaProps) {
  return (
    <div className="surat-meta mt-5">
      <table className="w-full">
        <tbody>
          <tr>
            <td className="w-24 py-0.5 align-top">Nomor</td>
            <td className="py-0.5">: {nomorSurat}</td>
          </tr>
          <tr>
            <td className="py-0.5 align-top">Hal</td>
            <td className="py-0.5">: {perihal}</td>
          </tr>
          {lampiran && (
            <tr>
              <td className="py-0.5 align-top">Lampiran</td>
              <td className="py-0.5">: {lampiran}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
